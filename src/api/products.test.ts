import { describe, expect, it } from 'vitest';
import { getProductById, getProducts } from '../api/products';

describe('products service', () => {
  it('returns a non-empty list', async () => {
    const list = await getProducts();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('every product has required fields', async () => {
    for (const p of await getProducts()) {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(typeof p.price).toBe('number');
    }
  });

  it('animals is an optional array of strings', async () => {
    for (const p of await getProducts()) {
      expect(p.animals === undefined || Array.isArray(p.animals)).toBe(true);

      if (p.animals) {
        expect(p.animals.every((a) => typeof a === 'string')).toBe(true);
      }
    }
  });

  it('finds product by id', async () => {
    const [first] = await getProducts();
    const found = await getProductById(first.id);
    expect(found?.id).toBe(first.id);
  });

  it('returns undefined for unknown id', async () => {
    expect(await getProductById('nope')).toBeUndefined();
  });
});
