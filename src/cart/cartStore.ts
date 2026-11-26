import type { CartItem } from '../types';
import { addToCart, changeQuantity, removeFromCart } from './cartActions';

const STORAGE_KEY = 'cart';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

type Listener = (items: readonly CartItem[]) => void;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const { productId, quantity } = value as Record<string, unknown>;
  return (
    typeof productId === 'string' &&
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity >= 1
  );
}

function load(storage: StorageLike): CartItem[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function createCartStore(storage: StorageLike) {
  let items: CartItem[] = load(storage);
  const listeners = new Set<Listener>();

  function update(next: CartItem[]): void {
    items = next;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage is unavailable or full: the cart still works in memory
    }
    listeners.forEach((listener) => listener(items));
  }

  return {
    getItems: (): readonly CartItem[] => items,
    add: (productId: string): void => update(addToCart(items, productId)),
    changeQuantity: (productId: string, delta: number): void =>
      update(changeQuantity(items, productId, delta)),
    remove: (productId: string): void => update(removeFromCart(items, productId)),
    clear: (): void => update([]),
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
