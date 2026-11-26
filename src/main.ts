import './style.css';
import { createHeader } from './components/header';
import { renderAboutPage } from './pages/about';
import { renderCatalogPage } from './pages/catalog';
import { renderCartPage } from './pages/cart';
import { renderProductPage } from './pages/product';

const PRODUCT_ROUTE_PREFIX = '#/product/';

const routes: Record<string, (root: HTMLElement) => void> = {
  '#/about': renderAboutPage,
  '#/catalog': renderCatalogPage,
  '#/cart': renderCartPage,
};

const app = document.querySelector<HTMLDivElement>('#app')!;
const main = document.createElement('main');
app.append(createHeader(), main);

function parseProductId(hash: string): string {
  try {
    return decodeURIComponent(hash.slice(PRODUCT_ROUTE_PREFIX.length));
  } catch {
    return '';
  }
}

function render(): void {
  window.scrollTo(0, 0);
  main.replaceChildren();

  if (location.hash.startsWith(PRODUCT_ROUTE_PREFIX)) {
    renderProductPage(main, parseProductId(location.hash));
    return;
  }

  const page = routes[location.hash] ?? renderAboutPage;
  page(main);
}

window.addEventListener('hashchange', render);
render();
