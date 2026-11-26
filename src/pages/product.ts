import { getProducts } from '../api/products';
import { getRelatedProducts } from '../catalog/related';
import { createAddToCartButton } from '../components/addToCartButton';
import { createProductCard } from '../components/productCard';
import type { PetAnimal, Product } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { productImageSrc } from '../utils/productImage';

const ANIMAL_LABELS: Record<PetAnimal, string> = {
  cat: 'Кошки',
  dog: 'Собаки',
  bird: 'Птицы',
  fish: 'Рыбки',
  universal: 'Для всех',
};

function createSpecItem(label: string, value: string): HTMLElement {
  const item = document.createElement('div');
  item.className = 'product-spec-item';

  const dt = document.createElement('span');
  dt.className = 'product-spec-label';
  dt.textContent = label;

  const dd = document.createElement('strong');
  dd.className = 'product-spec-value';
  dd.textContent = value;

  item.append(dt, dd);
  return item;
}

function renderNotFound(container: HTMLElement): void {
  const empty = document.createElement('div');
  empty.className = 'empty-state';

  const title = document.createElement('h1');
  title.className = 'empty-state-title';
  title.textContent = 'Товар не найден';

  const message = document.createElement('p');
  message.className = 'empty-state-text';
  message.textContent = 'Возможно, ссылка устарела или товар был удалён из каталога.';

  const backLink = document.createElement('a');
  backLink.className = 'empty-state-btn';
  backLink.href = '#/catalog';
  backLink.textContent = '← Вернуться в каталог';

  empty.append(title, message, backLink);
  container.replaceChildren(empty);
}

function renderProductDetails(
  container: HTMLElement,
  product: Product,
  allProducts: readonly Product[],
): void {
  const backLink = document.createElement('a');
  backLink.className = 'product-back-link';
  backLink.href = '#/catalog';
  backLink.textContent = '← Назад в каталог';

  const details = document.createElement('div');
  details.className = 'product-details';

  const media = document.createElement('div');
  media.className = 'product-detail-media';

  const img = document.createElement('img');
  img.className = 'product-detail-image';
  img.src = productImageSrc(product.image);
  img.alt = product.title;
  media.append(img);

  const info = document.createElement('div');
  info.className = 'product-detail-info';

  const category = document.createElement('p');
  category.className = 'product-category';
  category.textContent = product.category;

  const title = document.createElement('h1');
  title.className = 'product-detail-title';
  title.textContent = product.title;

  const price = document.createElement('p');
  price.className = 'product-detail-price';
  price.textContent = formatPrice(product.price);

  info.append(category, title, price);

  if (product.description) {
    const description = document.createElement('p');
    description.className = 'product-detail-description';
    description.textContent = product.description;
    info.append(description);
  }

  const specs = document.createElement('div');
  specs.className = 'product-specs';
  specs.append(createSpecItem('Категория', product.category));

  if (product.animals && product.animals.length > 0) {
    specs.append(
      createSpecItem('Для кого', product.animals.map((a) => ANIMAL_LABELS[a]).join(', ')),
    );
  }

  specs.append(createSpecItem('Артикул', product.id));

  const actions = document.createElement('div');
  actions.className = 'product-actions';

  const cartLink = document.createElement('a');
  cartLink.className = 'product-cart-link';
  cartLink.href = '#/cart';
  cartLink.textContent = 'Перейти в корзину →';

  actions.append(createAddToCartButton(product.id), cartLink);
  info.append(specs, actions);
  details.append(media, info);

  const related = getRelatedProducts(product, allProducts);
  if (related.length === 0) {
    container.replaceChildren(backLink, details);
    return;
  }

  const moreSection = document.createElement('section');
  moreSection.className = 'product-more';

  const moreTitle = document.createElement('h2');
  moreTitle.className = 'product-more-title';
  moreTitle.textContent = 'Ещё товары';

  const moreGrid = document.createElement('div');
  moreGrid.className = 'product-more-grid';
  moreGrid.append(...related.map(createProductCard));

  moreSection.append(moreTitle, moreGrid);
  container.replaceChildren(backLink, details, moreSection);
}

export function renderProductPage(root: HTMLElement, productId: string): void {
  const container = document.createElement('section');
  container.className = 'product-page';
  container.textContent = 'Загрузка товара...';
  root.replaceChildren(container);

  if (!productId) {
    renderNotFound(container);
    return;
  }

  void getProducts().then((allProducts) => {
    if (!root.contains(container)) return;

    const product = allProducts.find((item) => item.id === productId);
    if (!product) {
      renderNotFound(container);
      return;
    }

    renderProductDetails(container, product, allProducts);
  });
}
