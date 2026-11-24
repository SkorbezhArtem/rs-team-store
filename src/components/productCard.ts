import type { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { cartStore } from '../cart/instance';

export function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('article');
  card.className = 'product-card';

  const img = document.createElement('img');
  img.src = product.image || 'https://placehold.co/300x300?text=No+Image';
  img.alt = product.title;
  img.loading = 'lazy';

  const title = document.createElement('h3');
  title.textContent = product.title;

  const category = document.createElement('p');
  category.className = 'product-category';
  category.textContent = product.category;

  const price = document.createElement('p');
  price.className = 'product-price';
  price.textContent = formatPrice(product.price);

  const button = document.createElement('button');
  button.className = 'add-to-cart-btn';
  button.textContent = 'В корзину';

  button.addEventListener('click', () => {
    cartStore.add(product.id);

    button.textContent = 'Добавлено!';
    button.classList.add('added');

    setTimeout(() => {
      button.textContent = 'В корзину';
      button.classList.remove('added');
    }, 1000);
  });

  card.append(img, title, category, price, button);
  return card;
}
