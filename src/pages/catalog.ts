import { getProducts } from '../api/products';
import { filterProducts, type ProductFilters, type SortMode } from '../catalog/filter';
import { createProductCard } from '../components/productCard';
import type { PetAnimal, PetCategory, Product } from '../types';
import { asset } from '../utils/asset';

const CATEGORIES: readonly { value: PetCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Все категории' },
  { value: 'Корм', label: 'Корм' },
  { value: 'Игрушки', label: 'Игрушки' },
  { value: 'Уход', label: 'Уход' },
  { value: 'Аксессуары', label: 'Аксессуары' },
];

const SORT_OPTIONS: readonly { value: SortMode; label: string }[] = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
  { value: 'title-asc', label: 'По названию (А-Я)' },
];

const ANIMALS: readonly { id: PetAnimal | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Все', icon: '/icon_all.png' },
  { id: 'dog', label: 'Собаки', icon: '/icon_dog.png' },
  { id: 'cat', label: 'Кошки', icon: '/icon_cat.png' },
  { id: 'bird', label: 'Птицы', icon: '/icon_perrot.png' },
  { id: 'fish', label: 'Рыбки', icon: '/icon_fish.png' },
];

export function renderCatalogPage(root: HTMLElement): void {
  const page = document.createElement('section');
  page.className = 'catalog-page';

  const header = document.createElement('div');
  header.className = 'catalog-header';

  const titleWrap = document.createElement('div');
  const heading = document.createElement('h1');
  heading.className = 'catalog-title';
  heading.textContent = 'Каталог товаров';

  const subtitle = document.createElement('p');
  subtitle.className = 'catalog-subtitle';
  subtitle.textContent = 'Корма, игрушки, уход и аксессуары для любимых питомцев';
  titleWrap.append(heading, subtitle);

  const countBadge = document.createElement('span');
  countBadge.className = 'catalog-count';
  countBadge.textContent = 'Загрузка...';
  header.append(titleWrap, countBadge);

  const controls = document.createElement('div');
  controls.className = 'catalog-controls';

  const searchInput = document.createElement('input');
  searchInput.id = 'catalog-search';
  searchInput.name = 'search';
  searchInput.type = 'search';
  searchInput.placeholder = 'Поиск товаров...';
  searchInput.setAttribute('aria-label', 'Поиск товаров');
  searchInput.className = 'search-input';

  const categorySelect = document.createElement('select');
  categorySelect.id = 'catalog-category';
  categorySelect.name = 'category';
  categorySelect.setAttribute('aria-label', 'Категория товаров');
  categorySelect.className = 'category-select';

  for (const cat of CATEGORIES) {
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.label;
    categorySelect.append(option);
  }

  const sortSelect = document.createElement('select');
  sortSelect.id = 'catalog-sort';
  sortSelect.name = 'sort';
  sortSelect.setAttribute('aria-label', 'Сортировка товаров');
  sortSelect.className = 'category-select';

  for (const opt of SORT_OPTIONS) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    sortSelect.append(option);
  }

  const priceWrapper = document.createElement('div');
  priceWrapper.className = 'price-inputs-wrapper';
  priceWrapper.style.display = 'none';

  const minPriceInput = document.createElement('input');
  minPriceInput.id = 'catalog-min-price';
  minPriceInput.name = 'minPrice';
  minPriceInput.type = 'number';
  minPriceInput.placeholder = 'От, Br';
  minPriceInput.setAttribute('aria-label', 'Минимальная цена');
  minPriceInput.className = 'price-input';
  minPriceInput.min = '0';

  const maxPriceInput = document.createElement('input');
  maxPriceInput.id = 'catalog-max-price';
  maxPriceInput.name = 'maxPrice';
  maxPriceInput.type = 'number';
  maxPriceInput.placeholder = 'До, Br';
  maxPriceInput.setAttribute('aria-label', 'Максимальная цена');
  maxPriceInput.className = 'price-input';
  maxPriceInput.min = '0';

  priceWrapper.append(minPriceInput, maxPriceInput);

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'catalog-reset-btn';
  resetBtn.textContent = 'Сбросить';

  controls.append(searchInput, categorySelect, sortSelect, priceWrapper, resetBtn);

  const filterBar = document.createElement('div');
  filterBar.className = 'animal-filters';

  const animalButtons: HTMLButtonElement[] = [];

  for (const animal of ANIMALS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'animal-filter-btn';
    btn.classList.toggle('active', animal.id === 'all');

    const iconWrap = document.createElement('span');
    iconWrap.className = 'icon';

    const iconImg = document.createElement('img');
    iconImg.src = asset(animal.icon);
    iconImg.alt = '';
    iconImg.width = 24;
    iconImg.height = 24;
    iconWrap.append(iconImg);

    const label = document.createElement('span');
    label.textContent = animal.label;

    btn.append(iconWrap, label);
    btn.addEventListener('click', () => {
      currentFilters.animal = animal.id === 'all' ? undefined : animal.id;
      for (const b of animalButtons) b.classList.remove('active');
      btn.classList.add('active');
      updateGrid();
    });

    animalButtons.push(btn);
    filterBar.append(btn);
  }

  const grid = document.createElement('div');
  grid.className = 'catalog-grid';
  grid.textContent = 'Загрузка товаров...';

  page.append(header, filterBar, controls, grid);
  root.replaceChildren(page);

  const currentFilters: ProductFilters = {
    query: '',
    category: 'all',
  };

  let allProducts: readonly Product[] = [];

  function resetFilters(): void {
    currentFilters.query = '';
    currentFilters.category = 'all';
    currentFilters.animal = undefined;
    currentFilters.sort = 'default';
    currentFilters.minPrice = undefined;
    currentFilters.maxPrice = undefined;

    searchInput.value = '';
    categorySelect.value = 'all';
    sortSelect.value = 'default';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    priceWrapper.style.display = 'none';

    animalButtons.forEach((btn, idx) => btn.classList.toggle('active', idx === 0));
    updateGrid();
  }

  function updateGrid(): void {
    const filtered = filterProducts(allProducts, currentFilters);
    countBadge.textContent = `Найдено: ${filtered.length}`;
    grid.replaceChildren();

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';

      const emptyTitle = document.createElement('h2');
      emptyTitle.className = 'empty-state-title';
      emptyTitle.textContent = 'Ничего не найдено';

      const emptyText = document.createElement('p');
      emptyText.className = 'empty-state-text';
      emptyText.textContent = 'Попробуйте изменить поисковый запрос или сбросить фильтры.';

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'empty-state-btn';
      clearBtn.textContent = 'Сбросить фильтры';
      clearBtn.addEventListener('click', resetFilters);

      empty.append(emptyTitle, emptyText, clearBtn);
      grid.append(empty);
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
    const sortValue = (e.target as HTMLSelectElement).value as SortMode;
    currentFilters.sort = sortValue;

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
    currentFilters.minPrice = val !== '' ? Number(val) : undefined;
    updateGrid();
  });

  maxPriceInput.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    currentFilters.maxPrice = val !== '' ? Number(val) : undefined;
    updateGrid();
  });

  resetBtn.addEventListener('click', resetFilters);

  void getProducts().then((products) => {
    if (!root.contains(page)) return;
    allProducts = products;
    updateGrid();
  });
}
