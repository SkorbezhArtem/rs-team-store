import { cartStore } from '../cart/instance';
import type { CartItem } from '../types';
import { asset } from '../utils/asset';

const navLinks = [
  { href: '#/about', label: 'О нас' },
  { href: '#/catalog', label: 'Каталог' },
];

const CART_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>`;

function getActiveRoute(hash: string): '#/about' | '#/catalog' | '#/cart' {
  if (hash === '#/cart') return '#/cart';
  if (hash === '#/catalog' || hash.startsWith('#/product/')) return '#/catalog';
  return '#/about';
}

function getCartItemCount(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';

  const inner = document.createElement('div');
  inner.className = 'header-inner';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'header-left';

  const logoLink = document.createElement('a');
  logoLink.href = '#/catalog';
  logoLink.className = 'logo-link';

  const logoCrop = document.createElement('span');
  logoCrop.className = 'logo-crop';

  const logoImg = document.createElement('img');
  logoImg.src = asset('/logo.png');
  logoImg.alt = 'Логотип КотоПёс';
  logoImg.className = 'logo';

  logoCrop.append(logoImg);

  const logoTitle = document.createElement('span');
  logoTitle.className = 'logo-title';
  logoTitle.textContent = 'КотоПёс';

  logoLink.append(logoCrop, logoTitle);
  headerLeft.append(logoLink);

  const headerCenter = document.createElement('div');
  headerCenter.className = 'header-center';

  const nav = document.createElement('nav');
  const routeElements = new Map<string, HTMLAnchorElement>();

  for (const { href, label } of navLinks) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    nav.append(a);
    routeElements.set(href, a);
  }
  headerCenter.append(nav);

  const headerRight = document.createElement('div');
  headerRight.className = 'header-right';

  const cartLink = document.createElement('a');
  cartLink.href = '#/cart';
  cartLink.className = 'header-cart-link';
  cartLink.setAttribute('aria-label', 'Корзина');
  cartLink.innerHTML = CART_ICON_SVG;

  const cartLabel = document.createElement('span');
  cartLabel.className = 'header-cart-label';
  cartLabel.textContent = 'Корзина';

  const badge = document.createElement('span');
  badge.className = 'cart-badge';

  cartLink.append(cartLabel, badge);
  headerRight.append(cartLink);
  routeElements.set('#/cart', cartLink);

  inner.append(headerLeft, headerCenter, headerRight);
  header.append(inner);

  function updateBadge(items: readonly CartItem[]): void {
    const count = getCartItemCount(items);
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  function updateActiveRoute(): void {
    const active = getActiveRoute(location.hash);
    for (const [href, el] of routeElements) {
      el.classList.toggle('is-active', href === active);
    }
  }

  updateBadge(cartStore.getItems());
  cartStore.subscribe(updateBadge);

  updateActiveRoute();
  window.addEventListener('hashchange', updateActiveRoute);

  return header;
}
