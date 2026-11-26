import { getProducts } from '../api/products';
import {
  applyPromoCode,
  calculateCartSummary,
  getPromoPercent,
  type PromoCode,
} from '../cart/cart';
import { cartStore } from '../cart/instance';
import type { CartItem, Product } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { productImageSrc } from '../utils/productImage';

interface PromoFeedback {
  type: 'success' | 'info' | 'error';
  text: string;
}

interface ResolvedCartEntry {
  item: CartItem;
  product: Product;
}

type FocusTarget =
  | { kind: 'stepper'; productId: string; action: 'plus' | 'minus' }
  | { kind: 'remove'; index: number }
  | { kind: 'promo-input' }
  | null;

const CLEAR_CONFIRM_MS = 3000;

const REMOVE_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`;

function createButton(
  label: string,
  ariaLabel: string,
  onClick: () => void,
  className = '',
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  if (className) button.className = className;
  button.textContent = label;
  button.setAttribute('aria-label', ariaLabel);
  button.addEventListener('click', onClick);
  return button;
}

function getTotalQuantity(entries: readonly ResolvedCartEntry[]): number {
  return entries.reduce((sum, { item }) => sum + item.quantity, 0);
}

export function renderCartPage(root: HTMLElement): void {
  const container = document.createElement('section');
  container.className = 'cart-page';
  container.textContent = 'Загрузка…';
  root.replaceChildren(container);

  let products: readonly Product[] = [];
  let loaded = false;
  let appliedPromo: PromoCode | null = null;
  let promoFeedback: PromoFeedback | null = null;
  let promoDraft = '';
  let clearConfirmTimer: ReturnType<typeof setTimeout> | undefined;
  let confirmingClear = false;
  let pendingFocus: FocusTarget = null;

  function resetClearConfirm(): void {
    clearTimeout(clearConfirmTimer);
    clearConfirmTimer = undefined;
    confirmingClear = false;
  }

  function restoreFocus(shouldRestore: boolean): void {
    const target = pendingFocus;
    pendingFocus = null;
    if (!shouldRestore || !target) return;

    if (target.kind === 'promo-input') {
      container.querySelector<HTMLInputElement>('#promo-code-input')?.focus();
      return;
    }

    if (target.kind === 'remove') {
      const removeButtons = container.querySelectorAll<HTMLButtonElement>('.cart-remove-btn');
      if (removeButtons.length > 0) {
        const nextIndex = Math.min(target.index, removeButtons.length - 1);
        removeButtons[nextIndex].focus();
      } else {
        container.querySelector<HTMLElement>('.empty-state-btn')?.focus();
      }
      return;
    }

    const stepperBtn = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.cart-stepper-btn'),
    ).find(
      (btn) => btn.dataset.productId === target.productId && btn.dataset.action === target.action,
    );

    if (stepperBtn && !stepperBtn.disabled) {
      stepperBtn.focus();
      return;
    }

    if (target.action === 'minus') {
      const plusFallback = Array.from(
        container.querySelectorAll<HTMLButtonElement>('.cart-stepper-btn'),
      ).find((btn) => btn.dataset.productId === target.productId && btn.dataset.action === 'plus');
      plusFallback?.focus();
    }
  }

  function createRow(entry: ResolvedCartEntry, index: number): HTMLElement {
    const { item, product } = entry;
    const row = document.createElement('li');
    row.className = 'cart-item';

    const productHref = `#/product/${encodeURIComponent(product.id)}`;

    const infoWrap = document.createElement('div');
    infoWrap.className = 'cart-item-info';

    const thumbLink = document.createElement('a');
    thumbLink.href = productHref;
    thumbLink.className = 'cart-item-thumb';

    const thumbImg = document.createElement('img');
    thumbImg.src = productImageSrc(product.image);
    thumbImg.alt = product.title;
    thumbLink.append(thumbImg);

    const meta = document.createElement('div');
    meta.className = 'cart-item-meta';

    const titleLink = document.createElement('a');
    titleLink.href = productHref;
    titleLink.className = 'cart-item-title';
    titleLink.textContent = product.title;

    const subline = document.createElement('div');
    subline.className = 'cart-item-subline';

    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = product.category;

    const unitPrice = document.createElement('span');
    unitPrice.className = 'cart-item-unit';
    unitPrice.textContent = `${formatPrice(product.price)} / шт.`;

    subline.append(category, unitPrice);
    meta.append(titleLink, subline);
    infoWrap.append(thumbLink, meta);

    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';

    const stepper = document.createElement('div');
    stepper.className = 'cart-stepper';

    const minus = createButton(
      '−',
      'Уменьшить количество',
      () => {
        pendingFocus = { kind: 'stepper', productId: product.id, action: 'minus' };
        cartStore.changeQuantity(product.id, -1);
      },
      'cart-stepper-btn',
    );
    minus.dataset.productId = product.id;
    minus.dataset.action = 'minus';
    minus.disabled = item.quantity <= 1;

    const qty = document.createElement('span');
    qty.className = 'cart-stepper-qty';
    qty.textContent = String(item.quantity);

    const plus = createButton(
      '+',
      'Увеличить количество',
      () => {
        pendingFocus = { kind: 'stepper', productId: product.id, action: 'plus' };
        cartStore.changeQuantity(product.id, 1);
      },
      'cart-stepper-btn',
    );
    plus.dataset.productId = product.id;
    plus.dataset.action = 'plus';

    stepper.append(minus, qty, plus);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'cart-item-right';

    const lineTotal = document.createElement('span');
    lineTotal.className = 'cart-item-total';
    lineTotal.textContent = formatPrice(product.price * item.quantity);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'cart-remove-btn';
    remove.setAttribute('aria-label', 'Удалить товар из корзины');
    remove.title = 'Удалить';
    remove.innerHTML = REMOVE_ICON_SVG;
    remove.addEventListener('click', () => {
      pendingFocus = { kind: 'remove', index };
      cartStore.remove(product.id);
    });

    rightGroup.append(lineTotal, remove);
    controls.append(stepper, rightGroup);

    row.append(infoWrap, controls);
    return row;
  }

  function handlePromoSubmit(rawCode: string): void {
    const result = applyPromoCode(appliedPromo, rawCode);
    appliedPromo = result.promo;

    if (result.status === 'applied' && result.promo) {
      promoDraft = '';
      const percent = getPromoPercent(result.promo);
      promoFeedback = {
        type: 'success',
        text: `Промокод ${result.promo} применён: скидка ${percent}%`,
      };
    } else if (result.status === 'already-applied') {
      promoDraft = '';
      promoFeedback = {
        type: 'info',
        text: `Промокод ${result.promo} уже применён — повторно не суммируется`,
      };
    } else if (result.status === 'empty') {
      promoFeedback = { type: 'error', text: 'Введите промокод' };
    } else {
      promoFeedback = { type: 'error', text: 'Промокод не найден' };
    }

    pendingFocus = { kind: 'promo-input' };
    render();
  }

  function createPromoSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'cart-card cart-promo';

    const headerRow = document.createElement('div');
    headerRow.className = 'cart-promo-header';

    const heading = document.createElement('h2');
    heading.className = 'cart-card-title';
    heading.textContent = 'Промокод';

    const hintBtn = createButton(
      'Попробовать: SALE10',
      'Применить промокод SALE10',
      () => handlePromoSubmit('SALE10'),
      'cart-promo-hint',
    );

    headerRow.append(heading, hintBtn);

    const form = document.createElement('form');
    form.className = 'cart-promo-form';

    const label = document.createElement('label');
    label.className = 'cart-sr-only';
    label.htmlFor = 'promo-code-input';
    label.textContent = 'Промокод';

    const input = document.createElement('input');
    input.id = 'promo-code-input';
    input.name = 'promoCode';
    input.type = 'text';
    input.className = 'cart-promo-input';
    input.value = promoDraft;
    input.placeholder = 'Введите код (напр. SALE10)';
    input.addEventListener('input', () => {
      promoDraft = input.value;
    });

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'cart-promo-submit';
    submit.textContent = 'Применить';

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      handlePromoSubmit(input.value);
    });

    form.append(label, input, submit);
    section.append(headerRow, form);

    if (appliedPromo) {
      const activeRow = document.createElement('div');
      activeRow.className = 'cart-promo-active';

      const badge = document.createElement('span');
      badge.className = 'cart-promo-badge';
      badge.textContent = `${appliedPromo} (−${getPromoPercent(appliedPromo)}%)`;

      const removePromo = createButton(
        'Убрать ×',
        'Убрать промокод',
        () => {
          appliedPromo = null;
          promoFeedback = { type: 'info', text: 'Промокод удалён' };
          pendingFocus = { kind: 'promo-input' };
          render();
        },
        'cart-promo-remove',
      );

      activeRow.append(badge, removePromo);
      section.append(activeRow);
    }

    if (promoFeedback) {
      const message = document.createElement('p');
      message.className = `cart-promo-feedback cart-promo-feedback--${promoFeedback.type}`;
      message.textContent = promoFeedback.text;
      section.append(message);
    }

    return section;
  }

  function syncClearButton(button: HTMLButtonElement): void {
    button.textContent = confirmingClear ? 'Подтвердить очистку?' : 'Очистить корзину';
    button.classList.toggle('is-confirming', confirmingClear);
  }

  function createClearButton(): HTMLButtonElement {
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'cart-clear-btn';

    syncClearButton(clearBtn);

    clearBtn.addEventListener('click', () => {
      if (confirmingClear) {
        resetClearConfirm();
        cartStore.clear();
        return;
      }

      confirmingClear = true;
      syncClearButton(clearBtn);
      clearTimeout(clearConfirmTimer);
      clearConfirmTimer = setTimeout(() => {
        confirmingClear = false;
        clearConfirmTimer = undefined;
        if (!root.contains(container)) return;
        const currentButton = container.querySelector<HTMLButtonElement>('.cart-clear-btn');
        if (currentButton) {
          syncClearButton(currentButton);
        }
      }, CLEAR_CONFIRM_MS);
    });

    return clearBtn;
  }

  function renderEmptyState(shouldRestoreFocus: boolean): void {
    resetClearConfirm();
    appliedPromo = null;
    promoFeedback = null;
    promoDraft = '';

    const empty = document.createElement('div');
    empty.className = 'empty-state';

    const title = document.createElement('h1');
    title.className = 'empty-state-title';
    title.textContent = 'Корзина пуста';

    const text = document.createElement('p');
    text.className = 'empty-state-text';
    text.textContent = 'Добавьте корм, игрушки или аксессуары из каталога.';

    const link = document.createElement('a');
    link.className = 'empty-state-btn';
    link.href = '#/catalog';
    link.textContent = 'Перейти в каталог →';

    empty.append(title, text, link);
    container.replaceChildren(empty);
    restoreFocus(shouldRestoreFocus);
  }

  function render(): void {
    if (!loaded) return;

    const shouldRestoreFocus = container.contains(document.activeElement);
    const items = cartStore.getItems();

    const resolvedEntries: ResolvedCartEntry[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        resolvedEntries.push({ item, product });
      }
    }

    if (resolvedEntries.length === 0) {
      renderEmptyState(shouldRestoreFocus);
      return;
    }

    const validItems = resolvedEntries.map((entry) => entry.item);
    const totalQty = getTotalQuantity(resolvedEntries);

    const headerRow = document.createElement('div');
    headerRow.className = 'cart-header';

    const titleGroup = document.createElement('div');
    const heading = document.createElement('h1');
    heading.className = 'cart-title';
    heading.textContent = 'Корзина';

    const subtitle = document.createElement('p');
    subtitle.className = 'cart-subtitle';
    subtitle.textContent = `${resolvedEntries.length} поз. · ${totalQty} шт.`;
    titleGroup.append(heading, subtitle);

    const backLink = document.createElement('a');
    backLink.className = 'cart-back-link';
    backLink.href = '#/catalog';
    backLink.textContent = '← Продолжить покупки';

    headerRow.append(titleGroup, backLink);

    const layout = document.createElement('div');
    layout.className = 'cart-layout';

    const sheet = document.createElement('div');
    sheet.className = 'cart-sheet';

    const sheetHeader = document.createElement('div');
    sheetHeader.className = 'cart-sheet-header';

    const sheetLabel = document.createElement('span');
    sheetLabel.textContent = 'Товары в заказе';

    sheetHeader.append(sheetLabel, createClearButton());

    const list = document.createElement('ul');
    list.className = 'cart-list';
    resolvedEntries.forEach((entry, index) => {
      list.append(createRow(entry, index));
    });

    sheet.append(sheetHeader, list);

    const sidebar = document.createElement('aside');
    sidebar.className = 'cart-sidebar';

    const summary = calculateCartSummary(validItems, products, appliedPromo);
    const summaryCard = document.createElement('div');
    summaryCard.className = 'cart-card cart-summary';

    const summaryTitle = document.createElement('h2');
    summaryTitle.className = 'cart-card-title';
    summaryTitle.textContent = 'Итог заказа';

    const rows = document.createElement('div');
    rows.className = 'cart-summary-rows';

    const subtotalRow = document.createElement('div');
    subtotalRow.className = 'cart-summary-row';
    const subtotalLabel = document.createElement('span');
    subtotalLabel.textContent = `Товары (${totalQty} шт.)`;
    const subtotalVal = document.createElement('strong');
    subtotalVal.textContent = formatPrice(summary.subtotal);
    subtotalRow.append(subtotalLabel, subtotalVal);
    rows.append(subtotalRow);

    if (summary.discount > 0 && summary.appliedPromo) {
      const discountRow = document.createElement('div');
      discountRow.className = 'cart-summary-row cart-summary-row--discount';
      const discountLabel = document.createElement('span');
      discountLabel.textContent = `Скидка (${summary.appliedPromo} · ${getPromoPercent(summary.appliedPromo)}%)`;
      const discountVal = document.createElement('strong');
      discountVal.textContent = `−${formatPrice(summary.discount)}`;
      discountRow.append(discountLabel, discountVal);
      rows.append(discountRow);
    }

    const totalRow = document.createElement('div');
    totalRow.className = 'cart-summary-total';

    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'Итого';

    const totalValues = document.createElement('div');
    totalValues.className = 'cart-summary-total-values';

    if (summary.discount > 0) {
      const oldTotal = document.createElement('span');
      oldTotal.className = 'cart-summary-old-total';
      oldTotal.textContent = formatPrice(summary.subtotal);
      totalValues.append(oldTotal);
    }

    const finalTotal = document.createElement('strong');
    finalTotal.className = 'cart-summary-final';
    finalTotal.textContent = formatPrice(summary.total);
    totalValues.append(finalTotal);

    totalRow.append(totalLabel, totalValues);

    const continueLink = document.createElement('a');
    continueLink.className = 'cart-continue-btn';
    continueLink.href = '#/catalog';
    continueLink.textContent = 'Продолжить покупки →';

    summaryCard.append(summaryTitle, rows, totalRow, continueLink);
    sidebar.append(createPromoSection(), summaryCard);

    layout.append(sheet, sidebar);
    container.replaceChildren(headerRow, layout);
    restoreFocus(shouldRestoreFocus);
  }

  const unsubscribe = cartStore.subscribe(() => {
    if (!root.contains(container)) {
      resetClearConfirm();
      unsubscribe();
      return;
    }
    render();
  });

  void getProducts().then((result) => {
    if (!root.contains(container)) return;
    products = result;
    loaded = true;
    render();
  });
}
