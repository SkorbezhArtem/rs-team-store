import { describe, expect, it } from 'vitest';
import { addToCart, changeQuantity, removeFromCart } from './cartActions';
import type { CartItem } from '../types';

describe('addToCart', () => {
  it('adds a new product with quantity 1', () => {
    const items: CartItem[] = [];

    const result = addToCart(items, 'pet-1');

    expect(result).toEqual([{ productId: 'pet-1', quantity: 1 }]);
  });

  it('increases the quantity if the product is already in the cart', () => {
    const items: CartItem[] = [{ productId: 'pet-1', quantity: 2 }];

    const result = addToCart(items, 'pet-1');

    expect(result).toHaveLength(1);
    expect(result).toEqual([{ productId: 'pet-1', quantity: 3 }]);
  });

  it('increases only the matching item', () => {
    const items: CartItem[] = [
      { productId: 'pet-1', quantity: 1 },
      { productId: 'pet-2', quantity: 5 },
    ];

    const result = addToCart(items, 'pet-2');

    expect(result).toEqual([
      { productId: 'pet-1', quantity: 1 },
      { productId: 'pet-2', quantity: 6 },
    ]);
  });

  it('keeps other items unchanged', () => {
    const firstItem: CartItem = { productId: 'pet-1', quantity: 2 };
    const items: CartItem[] = [firstItem];

    const result = addToCart(items, 'pet-2');

    expect(result).toEqual([
      { productId: 'pet-1', quantity: 2 },
      { productId: 'pet-2', quantity: 1 },
    ]);
    expect(result[0]).toBe(firstItem);
  });

  it('does not mutate the input array', () => {
    const item: CartItem = { productId: 'pet-1', quantity: 1 };
    const items: readonly CartItem[] = Object.freeze([Object.freeze(item)]);

    const result = addToCart(items, 'pet-1');

    expect(result).not.toBe(items);
    expect(result[0]).not.toBe(item);
    expect(items).toEqual([{ productId: 'pet-1', quantity: 1 }]);
  });
});

describe('changeQuantity', () => {
  it('increases the quantity by the given delta', () => {
    const items: CartItem[] = [{ productId: 'pet-1', quantity: 2 }];

    expect(changeQuantity(items, 'pet-1', 1)).toEqual([{ productId: 'pet-1', quantity: 3 }]);
  });

  it('decreases the quantity by the given delta', () => {
    const items: CartItem[] = [{ productId: 'pet-1', quantity: 3 }];

    expect(changeQuantity(items, 'pet-1', -1)).toEqual([{ productId: 'pet-1', quantity: 2 }]);
  });

  it('never goes below 1', () => {
    const items: CartItem[] = [{ productId: 'pet-1', quantity: 1 }];

    expect(changeQuantity(items, 'pet-1', -1)).toEqual([{ productId: 'pet-1', quantity: 1 }]);
    expect(changeQuantity(items, 'pet-1', -10)).toEqual([{ productId: 'pet-1', quantity: 1 }]);
  });

  it('changes only the matching item', () => {
    const items: CartItem[] = [
      { productId: 'pet-1', quantity: 1 },
      { productId: 'pet-2', quantity: 5 },
    ];

    expect(changeQuantity(items, 'pet-2', -2)).toEqual([
      { productId: 'pet-1', quantity: 1 },
      { productId: 'pet-2', quantity: 3 },
    ]);
  });

  it('leaves the cart unchanged for an unknown product id', () => {
    const items: CartItem[] = [{ productId: 'pet-1', quantity: 2 }];

    expect(changeQuantity(items, 'unknown', 1)).toEqual(items);
  });

  it('does not mutate the input array', () => {
    const item: CartItem = { productId: 'pet-1', quantity: 2 };
    const items: readonly CartItem[] = Object.freeze([Object.freeze(item)]);

    const result = changeQuantity(items, 'pet-1', 1);

    expect(result).not.toBe(items);
    expect(items).toEqual([{ productId: 'pet-1', quantity: 2 }]);
  });
});

describe('removeFromCart', () => {
  it('removes the matching item', () => {
    const items: CartItem[] = [{ productId: 'pet-1', quantity: 2 }];

    expect(removeFromCart(items, 'pet-1')).toEqual([]);
  });

  it('keeps the other items', () => {
    const items: CartItem[] = [
      { productId: 'pet-1', quantity: 1 },
      { productId: 'pet-2', quantity: 5 },
    ];

    expect(removeFromCart(items, 'pet-1')).toEqual([{ productId: 'pet-2', quantity: 5 }]);
  });

  it('leaves the cart unchanged for an unknown product id', () => {
    const items: CartItem[] = [{ productId: 'pet-1', quantity: 2 }];

    expect(removeFromCart(items, 'unknown')).toEqual(items);
  });

  it('does not mutate the input array', () => {
    const item: CartItem = { productId: 'pet-1', quantity: 2 };
    const items: readonly CartItem[] = Object.freeze([Object.freeze(item)]);

    const result = removeFromCart(items, 'pet-1');

    expect(result).not.toBe(items);
    expect(items).toEqual([{ productId: 'pet-1', quantity: 2 }]);
  });
});
