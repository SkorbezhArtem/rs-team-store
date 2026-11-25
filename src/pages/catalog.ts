import { getProducts } from '../api/products';
import { filterProducts, type ProductFilters } from '../catalog/filter';
import { createProductCard } from '../components/productCard';
import type { Product, PetAnimal, PetCategory } from '../types';
import { asset } from '../utils/asset';

export function renderCatalogPage(root: HTMLElement): void {
  root.replaceChildren();

  const controls = document.createElement('div');
  controls.className = 'catalog-controls';

  const categorySelect = document.createElement('select');
  categorySelect.className = 'category-select';

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'Корм', label: 'Корм' },
    { value: 'Игрушки', label: 'Игрушки' },
    { value: 'Уход', label: 'Уход' },
    { value: 'Аксессуары', label: 'Аксессуары' },
  ];

  for (const cat of categories) {
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.label;
    categorySelect.append(option);
  }

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Поиск товаров...';
  searchInput.className = 'search-input';

  const sortSelect = document.createElement('select');
  sortSelect.className = 'category-select';
  const sortOptions = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'price-asc', label: 'Цена: по возрастанию' },
    { value: 'price-desc', label: 'Цена: по убыванию' },
    { value: 'title-asc', label: 'По названию (А-Я)' },
  ];

  for (const opt of sortOptions) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    sortSelect.append(option);
  }

  const priceWrapper = document.createElement('div');
  priceWrapper.className = 'price-inputs-wrapper';
  priceWrapper.style.display = 'none';

  const minPriceInput = document.createElement('input');
  minPriceInput.type = 'number';
  minPriceInput.placeholder = 'Цена от';
  minPriceInput.className = 'price-input';
  minPriceInput.min = '0';

  const maxPriceInput = document.createElement('input');
  maxPriceInput.type = 'number';
  maxPriceInput.placeholder = 'Цена до';
  maxPriceInput.className = 'price-input';
  maxPriceInput.min = '0';

  priceWrapper.append(minPriceInput, maxPriceInput);

  controls.append(categorySelect, searchInput, sortSelect, priceWrapper);

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
      currentFilters.animal = animal.id === 'all' ? undefined : (animal.id as PetAnimal);
      document.querySelectorAll('.animal-filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      updateGrid();
    });
    filterBar.append(btn);
  }

  const grid = document.createElement('div');
  grid.className = 'catalog-grid';
  grid.textContent = 'Загрузка товаров...';
  root.append(controls, filterBar, grid);

  const currentFilters: ProductFilters = {
    query: '',
    category: 'all',
  };

  let allProducts: readonly Product[] = [];

  function updateGrid(): void {
    const filtered = filterProducts(allProducts, currentFilters);
    grid.replaceChildren();

    if (filtered.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'empty-message';
      emptyMsg.textContent = 'Ничего не найдено. Попробуйте изменить запрос.';
      grid.append(emptyMsg);
      return;
    }

    for (const product of filtered) {
      grid.append(createProductCard(product));
    }
  }

  searchInput.addEventListener('input', (e) => {
    currentFilters.query = (e.target as HTMLInputElement).value;
    updateGrid();
  });

  categorySelect.addEventListener('change', (e) => {
    currentFilters.category = (e.target as HTMLSelectElement).value as PetCategory | 'all';
    updateGrid();
  });

  sortSelect.addEventListener('change', (e) => {
    const sortValue = (e.target as HTMLSelectElement).value;
    currentFilters.sort = sortValue as typeof currentFilters.sort;

    if (sortValue === 'price-asc' || sortValue === 'price-desc') {
      priceWrapper.style.display = 'flex';
    } else {
      priceWrapper.style.display = 'none';
      currentFilters.minPrice = undefined;
      currentFilters.maxPrice = undefined;
      minPriceInput.value = '';
      maxPriceInput.value = '';
    }
    updateGrid();
  });

  minPriceInput.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    currentFilters.minPrice = val ? Number(val) : undefined;
    updateGrid();
  });

  maxPriceInput.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    currentFilters.maxPrice = val ? Number(val) : undefined;
    updateGrid();
  });

  void getProducts().then((products) => {
    allProducts = products;
    updateGrid();
  });
}
