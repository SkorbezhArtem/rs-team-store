import { describe, expect, it, vi } from 'vitest';
import { createCartStore, type StorageLike } from './cartStore';

function createMemoryStorage(initial?: string): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set('cart', initial);

  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

describe('createCartStore', () => {
  it('starts with an empty cart when storage is empty', () => {
    const store = createCartStore(createMemoryStorage());

    expect(store.getItems()).toEqual([]);
  });

  it('restores the cart from storage', () => {
    const storage = createMemoryStorage(JSON.stringify([{ productId: 'pet-1', quantity: 2 }]));
    const store = createCartStore(storage);

    expect(store.getItems()).toEqual([{ productId: 'pet-1', quantity: 2 }]);
  });

  it('starts with an empty cart when storage contains broken JSON', () => {
    const store = createCartStore(createMemoryStorage('not json'));

    expect(store.getItems()).toEqual([]);
  });

  it('ignores invalid cart items from storage', () => {
    const storage = createMemoryStorage(
      JSON.stringify([{ productId: 'pet-1', quantity: 2 }, { foo: 1 }]),
    );
    const store = createCartStore(storage);

    expect(store.getItems()).toEqual([{ productId: 'pet-1', quantity: 2 }]);
  });

  it('saves the cart to storage when a product is added', () => {
    const storage = createMemoryStorage();
    const store = createCartStore(storage);

    store.add('pet-1');

    expect(storage.data.get('cart')).toBe(JSON.stringify([{ productId: 'pet-1', quantity: 1 }]));
  });

  it('notifies subscribers when the cart changes', () => {
    const store = createCartStore(createMemoryStorage());
    const listener = vi.fn();

    store.subscribe(listener);
    store.add('pet-1');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([{ productId: 'pet-1', quantity: 1 }]);
  });

  it('stops notifying a subscriber after unsubscribe', () => {
    const store = createCartStore(createMemoryStorage());
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);

    store.add('pet-1');
    unsubscribe();
    store.add('pet-2');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('changes the quantity of a product', () => {
    const storage = createMemoryStorage(JSON.stringify([{ productId: 'pet-1', quantity: 2 }]));
    const store = createCartStore(storage);

    store.changeQuantity('pet-1', 1);

    expect(store.getItems()).toEqual([{ productId: 'pet-1', quantity: 3 }]);
  });

  it('removes a product from the cart', () => {
    const storage = createMemoryStorage(
      JSON.stringify([
        { productId: 'pet-1', quantity: 2 },
        { productId: 'pet-2', quantity: 1 },
      ]),
    );
    const store = createCartStore(storage);

    store.remove('pet-1');

    expect(store.getItems()).toEqual([{ productId: 'pet-2', quantity: 1 }]);
  });

  it('continues to work when storage throws an error', () => {
    const storage = createMemoryStorage();

    storage.setItem = () => {
      throw new Error('Storage unavailable');
    };

    const store = createCartStore(storage);

    expect(() => store.add('pet-1')).not.toThrow();
    expect(store.getItems()).toEqual([{ productId: 'pet-1', quantity: 1 }]);
  });
});
