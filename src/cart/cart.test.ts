import { describe, expect, it } from 'vitest';
import { applyPromoCode, calculateCartSummary, calculateTotal } from './cart';
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
  {
    id: 'pet-3',
    title: 'Fish food',
    category: 'Корм',
    price: 41,
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

describe('calculateCartSummary', () => {
  it('returns zero totals for an empty cart even with a valid promo code', () => {
    expect(calculateCartSummary([], products, 'SALE10')).toEqual({
      subtotal: 0,
      discount: 0,
      total: 0,
      appliedPromo: null,
    });
  });

  it('returns full subtotal without discount when no promo code is passed', () => {
    const cartItems: CartItem[] = [
      { productId: 'pet-1', quantity: 2 },
      { productId: 'pet-2', quantity: 1 },
    ];

    expect(calculateCartSummary(cartItems, products)).toEqual({
      subtotal: 250,
      discount: 0,
      total: 250,
      appliedPromo: null,
    });
  });

  it('applies 10% discount for SALE10 regardless of case and spaces', () => {
    const cartItems: CartItem[] = [
      { productId: 'pet-1', quantity: 2 },
      { productId: 'pet-2', quantity: 1 },
    ];

    expect(calculateCartSummary(cartItems, products, '  sale10  ')).toEqual({
      subtotal: 250,
      discount: 25,
      total: 225,
      appliedPromo: 'SALE10',
    });
  });

  it('rounds fractional discount and final total to two decimal places', () => {
    const cartItems: CartItem[] = [{ productId: 'pet-3', quantity: 1 }];

    expect(calculateCartSummary(cartItems, products, 'SALE10')).toEqual({
      subtotal: 41,
      discount: 4.1,
      total: 36.9,
      appliedPromo: 'SALE10',
    });
  });

  it('ignores an unknown promo code', () => {
    const cartItems: CartItem[] = [{ productId: 'pet-1', quantity: 1 }];

    expect(calculateCartSummary(cartItems, products, 'UNKNOWN')).toEqual({
      subtotal: 100,
      discount: 0,
      total: 100,
      appliedPromo: null,
    });
  });
});

describe('applyPromoCode', () => {
  it('applies SALE10 when no promo is active', () => {
    expect(applyPromoCode(null, ' sale10 ')).toEqual({
      promo: 'SALE10',
      status: 'applied',
    });
  });

  it('does not stack SALE10 when it is already active', () => {
    expect(applyPromoCode('SALE10', 'SALE10')).toEqual({
      promo: 'SALE10',
      status: 'already-applied',
    });
  });

  it('returns invalid status and preserves current promo on unknown code', () => {
    expect(applyPromoCode(null, 'BADCODE')).toEqual({
      promo: null,
      status: 'invalid',
    });
    expect(applyPromoCode('SALE10', 'BADCODE')).toEqual({
      promo: 'SALE10',
      status: 'invalid',
    });
  });

  it('returns empty status when input is blank', () => {
    expect(applyPromoCode(null, '   ')).toEqual({
      promo: null,
      status: 'empty',
    });
  });
});
