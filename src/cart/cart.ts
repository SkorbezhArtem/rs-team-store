import type { CartItem, Product } from '../types';

export function calculateTotal(
  cartItems: readonly CartItem[],
  products: readonly Product[],
): number {
  return cartItems.reduce((total, item) => {
    const product = products.find(({ id }) => id === item.productId);

    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}
