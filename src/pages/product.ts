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

function renderNotFound(container: HTMLElement): void {
  const title = document.createElement('h1');
  title.textContent = 'Товар не найден';

  const message = document.createElement('p');
  message.textContent = 'Возможно, ссылка устарела или товар был удалён из каталога.';

  const backLink = document.createElement('a');
  backLink.className = 'product-back-link';
  backLink.href = '#/catalog';
  backLink.textContent = '← Вернуться в каталог';

  container.replaceChildren(title, message, backLink);
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

  const img = document.createElement('img');
  img.className = 'product-detail-image';
  img.src = productImageSrc(product.image);
  img.alt = product.title;

  const info = document.createElement('div');
  info.className = 'product-detail-info';

  const category = document.createElement('p');
  category.className = 'product-category';
  category.textContent = product.category;

  const title = document.createElement('h1');
  title.textContent = product.title;

  const price = document.createElement('p');
  price.className = 'product-detail-price';
  price.textContent = formatPrice(product.price);

  info.append(category, title, price);

  if (product.animals && product.animals.length > 0) {
    const animals = document.createElement('p');
    animals.className = 'product-detail-animals';
    animals.textContent = `Для кого: ${product.animals.map((a) => ANIMAL_LABELS[a]).join(', ')}`;
    info.append(animals);
  }

  if (product.description) {
    const description = document.createElement('p');
    description.className = 'product-detail-description';
    description.textContent = product.description;
    info.append(description);
  }

  info.append(createAddToCartButton(product.id));
  details.append(img, info);

  const related = getRelatedProducts(product, allProducts);
  if (related.length === 0) {
    container.replaceChildren(backLink, details);
    return;
  }

  const moreSection = document.createElement('section');
  moreSection.className = 'product-more';

  const moreTitle = document.createElement('h2');
  moreTitle.textContent = 'Ещё товары';

  const moreGrid = document.createElement('div');
  moreGrid.className = 'catalog-grid';
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
