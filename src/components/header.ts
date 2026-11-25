import { asset } from '../utils/asset';

const links = [
  { href: '#/about', label: 'О нас' },
  { href: '#/catalog', label: 'Каталог' },
  { href: '#/cart', label: 'Корзина' },
];

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'header-left';

  const logoLink = document.createElement('a');
  logoLink.href = '#/catalog';
  logoLink.className = 'logo-link';

  const logoImg = document.createElement('img');
  logoImg.src = asset('/logo.png');
  logoImg.alt = 'Логотип';
  logoImg.classList.add('logo');

  logoLink.append(logoImg);
  headerLeft.append(logoLink);

  const headerCenter = document.createElement('div');
  headerCenter.className = 'header-center';

  const nav = document.createElement('nav');
  for (const { href, label } of links) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    nav.append(a);
  }
  headerCenter.append(nav);

  const headerRight = document.createElement('div');
  headerRight.className = 'header-right';

  header.append(headerLeft, headerCenter, headerRight);

  return header;
}
