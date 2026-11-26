import { getProducts } from '../api/products';
import { calculateTotal } from '../cart/cart';
import { cartStore } from '../cart/instance';
import type { CartItem, Product } from '../types';
import { formatPrice } from '../utils/formatPrice';

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
  container.textContent = 'Загрузка…';
  root.replaceChildren(container);

  let products: readonly Product[] = [];
  let loaded = false;

  function render(): void {
    if (!loaded) return;

    const items = cartStore.getItems();

    if (items.length === 0) {
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

    const total = document.createElement('p');
    total.textContent = `Итого: ${formatPrice(calculateTotal(items, products))}`;

    const clear = createButton('Очистить корзину', 'Очистить корзину', () => cartStore.clear());

    container.replaceChildren(list, total, clear);
  }

  const unsubscribe = cartStore.subscribe(() => {
    if (!root.contains(container)) {
      unsubscribe();
      return;
    }
    render();
  });

  void getProducts().then((result) => {
    products = result;
    loaded = true;
    render();
  });
}
