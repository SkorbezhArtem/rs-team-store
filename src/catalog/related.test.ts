import { describe, expect, it } from 'vitest';
import type { Product } from '../types';
import { getRelatedProducts } from './related';

const catalog: readonly Product[] = [
  {
    id: '1',
    title: 'Корм для кошек',
    category: 'Корм',
    price: 20,
    image: '/1.jpg',
    animals: ['cat'],
  },
  {
    id: '2',
    title: 'Корм для собак',
    category: 'Корм',
    price: 24,
    image: '/2.jpg',
    animals: ['dog'],
  },
  {
    id: '3',
    title: 'Корм для птиц',
    category: 'Корм',
    price: 8,
    image: '/3.jpg',
    animals: ['bird'],
  },
  {
    id: '4',
    title: 'Корм для рыб',
    category: 'Корм',
    price: 6,
    image: '/4.jpg',
    animals: ['fish'],
  },
  {
    id: '5',
    title: 'Игрушка для кошек',
    category: 'Игрушки',
    price: 9,
    image: '/5.jpg',
    animals: ['cat'],
  },
  {
    id: '6',
    title: 'Шампунь для кошек',
    category: 'Уход',
    price: 11,
    image: '/6.jpg',
    animals: ['cat'],
  },
  {
    id: '7',
    title: 'Переноска',
    category: 'Аксессуары',
    price: 30,
    image: '/7.jpg',
    animals: ['cat', 'dog'],
  },
];

describe('getRelatedProducts', () => {
  it('excludes the current product and limits results to 3 by default', () => {
    const current = catalog[0];

    const related = getRelatedProducts(current, catalog);

    expect(related).toHaveLength(3);
    expect(related.some((item) => item.id === current.id)).toBe(false);
  });

  it('prioritizes products from the same category', () => {
    const current = catalog[0];

    const related = getRelatedProducts(current, catalog);

    expect(related.map((item) => item.id)).toEqual(['2', '3', '4']);
  });

  it('fills remaining slots with matching animal products without duplicates', () => {
    const current = catalog[4];

    const related = getRelatedProducts(current, catalog);

    expect(related.map((item) => item.id)).toEqual(['1', '6', '7']);
  });

  it('returns an empty array when the catalog has only the current product', () => {
    const current = catalog[0];

    expect(getRelatedProducts(current, [current])).toEqual([]);
  });

  it('supports a custom limit', () => {
    const related = getRelatedProducts(catalog[0], catalog, 2);

    expect(related).toHaveLength(2);
  });
});
