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

interface PromoFeedback {
  type: 'success' | 'info' | 'error';
  text: string;
}

function createButton(label: string, ariaLabel: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.setAttribute('aria-label', ariaLabel);
  button.addEventListener('click', onClick);
  return button;
}

function createRow(item: CartItem, product: Product): HTMLElement {
  const row = document.createElement('li');

  const text = document.createElement('span');
  text.textContent = `${product.title} — ${formatPrice(product.price)} x ${item.quantity} = ${formatPrice(product.price * item.quantity)}`;

  const minus = createButton('−', 'Уменьшить количество', () =>
    cartStore.changeQuantity(product.id, -1),
  );
  minus.disabled = item.quantity <= 1;

  const plus = createButton('+', 'Увеличить количество', () =>
    cartStore.changeQuantity(product.id, 1),
  );

  const remove = createButton('Удалить', 'Удалить товар из корзины', () =>
    cartStore.remove(product.id),
  );

  row.append(text, minus, plus, remove);
  return row;
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

    render();
  }

  function createPromoSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'cart-promo';

    const form = document.createElement('form');
    form.className = 'cart-promo-form';

    const label = document.createElement('label');
    label.htmlFor = 'promo-code-input';
    label.textContent = 'Промокод (например, SALE10):';

    const input = document.createElement('input');
    input.id = 'promo-code-input';
    input.name = 'promoCode';
    input.type = 'text';
    input.value = promoDraft;
    input.placeholder = 'Введите промокод';
    input.addEventListener('input', () => {
      promoDraft = input.value;
    });

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Применить';

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      handlePromoSubmit(input.value);
    });

    form.append(label, input, submit);
    section.append(form);

    if (appliedPromo) {
      const activeRow = document.createElement('div');
      activeRow.className = 'cart-promo-active';

      const badge = document.createElement('span');
      badge.textContent = `Активен промокод: ${appliedPromo} (−${getPromoPercent(appliedPromo)}%)`;

      const removePromo = createButton('Убрать', 'Убрать промокод', () => {
        appliedPromo = null;
        promoFeedback = { type: 'info', text: 'Промокод удалён' };
        render();
      });

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

  function render(): void {
    if (!loaded) return;

    const items = cartStore.getItems();

    if (items.length === 0) {
      appliedPromo = null;
      promoFeedback = null;
      promoDraft = '';
      container.textContent = 'Корзина пуста';
      return;
    }

    const list = document.createElement('ul');
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        list.append(createRow(item, product));
      }
    }

    const summary = calculateCartSummary(items, products, appliedPromo);
    const summaryBlock = document.createElement('div');
    summaryBlock.className = 'cart-summary';

    if (summary.discount > 0 && summary.appliedPromo) {
      const subtotalEl = document.createElement('p');
      subtotalEl.textContent = `Сумма: ${formatPrice(summary.subtotal)}`;

      const discountEl = document.createElement('p');
      discountEl.textContent = `Скидка (${summary.appliedPromo}): −${formatPrice(summary.discount)}`;

      summaryBlock.append(subtotalEl, discountEl);
    }

    const total = document.createElement('p');
    total.textContent = `Итого: ${formatPrice(summary.total)}`;
    summaryBlock.append(total);

    const clear = createButton('Очистить корзину', 'Очистить корзину', () => cartStore.clear());

    container.replaceChildren(list, createPromoSection(), summaryBlock, clear);
  }

  const unsubscribe = cartStore.subscribe(() => {
    if (!root.contains(container)) {
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
