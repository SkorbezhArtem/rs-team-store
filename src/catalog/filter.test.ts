import { describe, expect, it } from 'vitest';
import { filterProducts } from './filter';
import type { Product } from '../types';

const mockProducts: Product[] = [
  { id: '1', title: 'Cat food', category: 'Корм', price: 100, animals: ['cat'], image: '' },
  { id: '2', title: 'Dog food', category: 'Корм', price: 200, animals: ['dog'], image: '' },
  { id: '3', title: 'Cat toy', category: 'Игрушки', price: 50, animals: ['cat'], image: '' },
  {
    id: '4',
    title: 'Universal bowl',
    category: 'Аксессуары',
    price: 300,
    animals: [],
    image: '',
  },
];

describe('filterProducts', () => {
  it('empty search returns all products', () => {
    const result = filterProducts(mockProducts, { query: '' });
    expect(result).toHaveLength(4);
  });

  it('search is case-insensitive and partial', () => {
    const result = filterProducts(mockProducts, { query: 'FOOD' });
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Cat food');
  });

  it('"All categories" value returns products of every category', () => {
    const result = filterProducts(mockProducts, { category: 'all' });
    expect(result).toHaveLength(4);
  });

  it('filters by specific category', () => {
    const result = filterProducts(mockProducts, { category: 'Корм' });
    expect(result).toHaveLength(2);
  });

  it('price range is inclusive: products exactly at lower or upper bound stay', () => {
    const result = filterProducts(mockProducts, { minPrice: 50, maxPrice: 200 });
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.id)).toContain('3');
    expect(result.map((p) => p.id)).toContain('2');
    expect(result.map((p) => p.id)).not.toContain('4');
  });

  it('an empty bound does not limit the filter on that side', () => {
    const resultMin = filterProducts(mockProducts, { minPrice: 250 });
    expect(resultMin).toHaveLength(1);
    expect(resultMin[0].id).toBe('4');

    const resultMax = filterProducts(mockProducts, { maxPrice: 60 });
    expect(resultMax).toHaveLength(1);
    expect(resultMax[0].id).toBe('3');
  });

  it('category and price range work together', () => {
    const result = filterProducts(mockProducts, { category: 'Корм', minPrice: 150 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('no matches returns an empty array', () => {
    const result = filterProducts(mockProducts, { query: 'hamster' });
    expect(result).toHaveLength(0);
  });

  it('combined filters', () => {
    const result = filterProducts(mockProducts, {
      query: 'cat',
      category: 'Игрушки',
      minPrice: 40,
      maxPrice: 60,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('original products array is not changed', () => {
    const originalCopy = [...mockProducts];
    filterProducts(mockProducts, { sort: 'price-asc' });
    expect(mockProducts).toEqual(originalCopy);
  });
});
