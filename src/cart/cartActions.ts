import type { CartItem } from '../types';

export function addToCart(items: readonly CartItem[], productId: string): CartItem[] {
  const exists = items.some((item) => item.productId === productId);

  if (exists) {
    return items.map((item) =>
      item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
    );
  }

  return [...items, { productId, quantity: 1 }];
}

export function changeQuantity(
  items: readonly CartItem[],
  productId: string,
  delta: number,
): CartItem[] {
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
  );
}

export function removeFromCart(items: readonly CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}
