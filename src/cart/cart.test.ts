import { describe, expect, it } from 'vitest';
import { calculateTotal } from './cart';
import type { CartItem, Product } from '../types';

const products: Product[] = [
  {
    id: 'pet-1',
    title: 'Cat food',
    category: 'Корм',
    price: 100,
    image: '',
  },
  {
    id: 'pet-2',
    title: 'Dog toy',
    category: 'Игрушки',
    price: 50,
    image: '',
  },
];

describe('calculateTotal', () => {
  it('returns 0 for an empty cart', () => {
    expect(calculateTotal([], products)).toBe(0);
  });

  it('returns the price of a single item', () => {
    const cartItems: CartItem[] = [{ productId: 'pet-1', quantity: 1 }];

    expect(calculateTotal(cartItems, products)).toBe(100);
  });

  it('multiplies the price by the item quantity', () => {
    const cartItems: CartItem[] = [{ productId: 'pet-1', quantity: 3 }];

    expect(calculateTotal(cartItems, products)).toBe(300);
  });

  it('calculates the total price of multiple items', () => {
    const cartItems: CartItem[] = [
      { productId: 'pet-1', quantity: 2 },
      { productId: 'pet-2', quantity: 3 },
    ];

    expect(calculateTotal(cartItems, products)).toBe(350);
  });

  it('ignores items with unknown product IDs', () => {
    const cartItems: CartItem[] = [{ productId: 'unknown', quantity: 2 }];

    expect(calculateTotal(cartItems, products)).toBe(0);
  });
});
