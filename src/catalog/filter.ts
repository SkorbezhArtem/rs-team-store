import type { PetAnimal, PetCategory, Product } from '../types';

export type SortMode = 'default' | 'price-asc' | 'price-desc';

export interface ProductFilters {
  query?: string;
  category?: PetCategory | 'all';
  animal?: PetAnimal;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortMode;
}

export function filterProducts(source: readonly Product[], filters: ProductFilters): Product[] {
  const query = filters.query?.trim().toLowerCase() || '';

  const filtered = source.filter((product) => {
    const matchesQuery = !query || product.title.toLowerCase().includes(query);

    const matchesCategory =
      !filters.category || filters.category === 'all' || product.category === filters.category;

    const matchesAnimal =
      !filters.animal ||
      !product.animal ||
      product.animal === 'universal' ||
      product.animal === filters.animal;

    const matchesMinPrice = filters.minPrice === undefined || product.price >= filters.minPrice;
    const matchesMaxPrice = filters.maxPrice === undefined || product.price <= filters.maxPrice;

    return matchesQuery && matchesCategory && matchesAnimal && matchesMinPrice && matchesMaxPrice;
  });

  if (filters.sort === 'price-asc') {
    return filtered.toSorted((a, b) => a.price - b.price);
  }
  if (filters.sort === 'price-desc') {
    return filtered.toSorted((a, b) => b.price - a.price);
  }

  return filtered;
}
