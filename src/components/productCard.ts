import type { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { productImageSrc } from '../utils/productImage';
import { createAddToCartButton } from './addToCartButton';

export function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('article');
  card.className = 'product-card';

  const media = document.createElement('div');
  media.className = 'product-card-media';

  const img = document.createElement('img');
  img.src = productImageSrc(product.image);
  img.alt = product.title;
  img.loading = 'lazy';
  media.append(img);

  const title = document.createElement('h3');
  title.textContent = product.title;

  const link = document.createElement('a');
  link.className = 'product-card-link';
  link.href = `#/product/${encodeURIComponent(product.id)}`;
  link.append(media, title);

  const category = document.createElement('p');
  category.className = 'product-category';
  category.textContent = product.category;

  const price = document.createElement('p');
  price.className = 'product-price';
  price.textContent = formatPrice(product.price);

  const button = createAddToCartButton(product.id);

  card.append(link, category, price, button);
  return card;
}
