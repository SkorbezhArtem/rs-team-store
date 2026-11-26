import type { Product } from '../types';
import { filterProducts } from './filter';

const DEFAULT_RELATED_LIMIT = 3;

export function getRelatedProducts(
  product: Product,
  allProducts: readonly Product[],
  limit = DEFAULT_RELATED_LIMIT,
): Product[] {
  const sameCategory = filterProducts(allProducts, { category: product.category }).filter(
    (item) => item.id !== product.id,
  );

  if (sameCategory.length >= limit || !product.animals?.length) {
    return sameCategory.slice(0, limit);
  }

  const seenIds = new Set(sameCategory.map((item) => item.id));
  seenIds.add(product.id);

  const result = [...sameCategory];

  for (const animal of product.animals) {
    for (const item of filterProducts(allProducts, { animal })) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      result.push(item);
      if (result.length >= limit) {
        return result;
      }
    }
  }

  return result;
}
