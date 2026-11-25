import { getProducts } from '../api/products';
import { createProductCard } from '../components/productCard';
import { asset } from '../utils/asset';

export function renderCatalogPage(root: HTMLElement): void {
  root.replaceChildren();

  const filterBar = document.createElement('div');
  filterBar.className = 'animal-filters';

  const animals = [
    { id: 'all', label: 'Все', icon: '/icon_all.png' },
    { id: 'dog', label: 'Собаки', icon: '/icon_dog.png' },
    { id: 'cat', label: 'Кошки', icon: '/icon_cat.png' },
    { id: 'bird', label: 'Птицы', icon: '/icon_perrot.png' },
    { id: 'fish', label: 'Рыбки', icon: '/icon_fish.png' },
  ];

  for (const animal of animals) {
    const btn = document.createElement('button');
    btn.className = 'animal-filter-btn';
    const iconHtml = animal.icon.includes('.')
      ? `<img src="${asset(animal.icon)}" alt="${animal.label}" width="40" height="40">`
      : animal.icon;

    btn.innerHTML = `<span class="icon">${iconHtml}</span> <span>${animal.label}</span>`;
    btn.addEventListener('click', () => {
      console.log(`Выбран фильтр: ${animal.id}`);
    });
    filterBar.append(btn);
  }

  const grid = document.createElement('div');
  grid.className = 'catalog-grid';
  grid.textContent = 'Загрузка товаров...';

  root.append(filterBar, grid);

  void getProducts().then((products) => {
    grid.replaceChildren();
    if (products.length === 0) {
      grid.textContent = 'Товаров нет';
      return;
    }
    for (const product of products) {
      grid.append(createProductCard(product));
    }
  });
}
