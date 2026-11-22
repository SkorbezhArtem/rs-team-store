import { createCartStore } from './cartStore';

export const cartStore = createCartStore(window.localStorage);
