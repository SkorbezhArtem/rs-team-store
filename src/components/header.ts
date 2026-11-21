const links = [
  { href: '#/about', label: 'О нас' },
  { href: '#/catalog', label: 'Каталог' },
  { href: '#/cart', label: 'Корзина' },
];

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  const nav = document.createElement('nav');

  for (const { href, label } of links) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    nav.append(a);
  }

  header.append(nav);
  return header;
}
