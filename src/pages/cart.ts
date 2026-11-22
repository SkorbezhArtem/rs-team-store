import { getProducts } from '../api/products';
import { calculateTotal } from '../cart/cart';
import { cartStore } from '../cart/instance';
import type { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';

export function renderCartPage(root: HTMLElement): void {
  const container = document.createElement('section');
  container.textContent = 'Загрузка…';
  root.replaceChildren(container);

  let products: readonly Product[] = [];
  let loaded = false;

  function createRow(title: string, price: number, quantity: number): HTMLElement {
    const row = document.createElement('li');
    row.textContent = `${title} — ${formatPrice(price)} × ${quantity} = ${formatPrice(price * quantity)}`;
    return row;
  }

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
        list.append(createRow(product.title, product.price, item.quantity));
      }
    }

    const total = document.createElement('p');
    total.textContent = `Итого: ${formatPrice(calculateTotal(items, products))}`;

    container.replaceChildren(list, total);
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
