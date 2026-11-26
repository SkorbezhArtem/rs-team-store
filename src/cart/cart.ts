import type { CartItem, Product } from '../types';

export const PROMO_CODES = {
  SALE10: 0.1,
} as const;

export type PromoCode = keyof typeof PROMO_CODES;

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
  appliedPromo: PromoCode | null;
}

export type PromoApplyStatus = 'applied' | 'already-applied' | 'invalid' | 'empty';

export interface PromoApplyResult {
  promo: PromoCode | null;
  status: PromoApplyStatus;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

function isPromoCode(code: string): code is PromoCode {
  return Object.prototype.hasOwnProperty.call(PROMO_CODES, code);
}

export function applyPromoCode(currentPromo: PromoCode | null, rawCode: string): PromoApplyResult {
  const normalized = normalizePromoCode(rawCode);

  if (!normalized) {
    return { promo: currentPromo, status: 'empty' };
  }

  if (!isPromoCode(normalized)) {
    return { promo: currentPromo, status: 'invalid' };
  }

  if (currentPromo === normalized) {
    return { promo: currentPromo, status: 'already-applied' };
  }

  return { promo: normalized, status: 'applied' };
}

export function getPromoPercent(code: PromoCode): number {
  return Math.round(PROMO_CODES[code] * 100);
}

export function calculateTotal(
  cartItems: readonly CartItem[],
  products: readonly Product[],
): number {
  return cartItems.reduce((total, item) => {
    const product = products.find(({ id }) => id === item.productId);

    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

export function calculateCartSummary(
  cartItems: readonly CartItem[],
  products: readonly Product[],
  promoCode: string | null = null,
): CartSummary {
  const subtotal = roundCurrency(calculateTotal(cartItems, products));
  const normalized = promoCode ? normalizePromoCode(promoCode) : '';

  if (subtotal <= 0 || !isPromoCode(normalized)) {
    return {
      subtotal,
      discount: 0,
      total: subtotal,
      appliedPromo: null,
    };
  }

  const discount = roundCurrency(subtotal * PROMO_CODES[normalized]);
  const total = roundCurrency(subtotal - discount);

  return {
    subtotal,
    discount,
    total,
    appliedPromo: normalized,
  };
}
