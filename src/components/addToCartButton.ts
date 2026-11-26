import { cartStore } from '../cart/instance';

const ADDED_FEEDBACK_MS = 1000;

export function createAddToCartButton(productId: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'add-to-cart-btn';
  button.textContent = 'В корзину';

  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  button.addEventListener('click', () => {
    cartStore.add(productId);
    button.textContent = 'Добавлено!';
    button.classList.add('added');

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.textContent = 'В корзину';
      button.classList.remove('added');
    }, ADDED_FEEDBACK_MS);
  });

  return button;
}
