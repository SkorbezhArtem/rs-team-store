import { describe, expect, it } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats integer prices without decimals', () => {
    expect(formatPrice(41)).toBe('41\u00a0Br');
    expect(formatPrice(0)).toBe('0\u00a0Br');
  });

  it('formats fractional prices with two decimal places', () => {
    expect(formatPrice(36.9)).toBe('36,90\u00a0Br');
    expect(formatPrice(4.1)).toBe('4,10\u00a0Br');
  });

  it('handles floating-point precision artifacts cleanly', () => {
    expect(formatPrice(0.1 + 0.2)).toBe('0,30\u00a0Br');
    expect(formatPrice(10.0000001)).toBe('10\u00a0Br');
  });
});
