import './style.css';
import { createHeader } from './components/header';
import { renderAboutPage } from './pages/about';
import { renderCatalogPage } from './pages/catalog';
import { renderCartPage } from './pages/cart';

const routes: Record<string, (root: HTMLElement) => void> = {
  '#/about': renderAboutPage,
  '#/catalog': renderCatalogPage,
  '#/cart': renderCartPage,
};

const app = document.querySelector<HTMLDivElement>('#app')!;
const main = document.createElement('main');
app.append(createHeader(), main);

function render(): void {
  const page = routes[location.hash] ?? renderAboutPage;
  main.replaceChildren();
  page(main);
}

window.addEventListener('hashchange', render);
render();
