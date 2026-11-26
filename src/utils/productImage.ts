import { asset } from './asset';

export function productImageSrc(image?: string): string {
  return asset(image || '/placeholder.svg');
}
