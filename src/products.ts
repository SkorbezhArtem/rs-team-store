import { products } from "../src/data/products";
import type { Product } from "../src/types/product";

const DELAY_MS = 300;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getProducts(): Promise<readonly Product[]> {
  await delay(DELAY_MS);
  return products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  await delay(DELAY_MS);
  return products.find((p) => p.id === id);
}
