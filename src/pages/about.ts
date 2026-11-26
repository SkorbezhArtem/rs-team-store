export function renderAboutPage(root: HTMLElement): void {
  root.replaceChildren();

  const container = document.createElement('div');
  container.className = 'about-page';

  const hero = document.createElement('section');
  hero.className = 'about-hero';

  const badge = document.createElement('div');
  badge.className = 'about-badge';
  badge.innerHTML = 'УЧЕБНЫЙ КОМАНДНЫЙ ПРОЕКТ &bull; RS SCHOOL';

  const title = document.createElement('h1');
  title.className = 'about-title';
  title.textContent = 'Добро пожаловать в КотоПёс!';

  const subtitle = document.createElement('p');
  subtitle.className = 'about-subtitle';
  subtitle.textContent =
    'КотоПёс — командный проект интернет-магазина, созданный чтобы сделать выбор товаров для домашних питомцев удобным и простым. В каталоге собраны корма, игрушки, средства ухода и аксессуары для ваших любимых животных.';

  const ctaBtn = document.createElement('a');
  ctaBtn.href = '#/catalog';
  ctaBtn.className = 'about-cta-btn';
  ctaBtn.innerHTML = 'Перейти в каталог &rarr;';

  const miniAnimals = document.createElement('div');
  miniAnimals.className = 'mini-animals';
  const animalsList = ['🦴 Корм', '🪀 Игрушки', '🧴 Уход', '🎗️ Аксессуары'];
  for (const animal of animalsList) {
    const pill = document.createElement('span');
    pill.className = 'mini-animal-pill';
    pill.textContent = animal;
    miniAnimals.append(pill);
  }

  hero.append(badge, title, subtitle, ctaBtn, miniAnimals);

  const featuresSection = document.createElement('section');
  featuresSection.className = 'about-section';

  const featuresTitle = document.createElement('h2');
  featuresTitle.className = 'about-section-title';
  featuresTitle.textContent = 'Возможности магазина';

  const featuresGrid = document.createElement('div');
  featuresGrid.className = 'features-grid';

  const features = [
    {
      href: '#/catalog',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      title: 'Каталог товаров',
      text: 'Товары для разных питомцев в четырех категориях с ценами в BYN и быстрым добавлением в заказ.',
    },
    {
      href: '#/catalog',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>`,
      title: 'Умные фильтры',
      text: 'Поиск по названию, отбор по виду питомца, категории, диапазону цен и сортировка результата.',
    },
    {
      href: '#/cart',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>`,
      title: 'Удобная корзина',
      text: 'Управление количеством, автоматический расчет общей суммы и сохранение в localStorage.',
    },
  ];

  for (const feat of features) {
    const card = document.createElement('a');
    card.href = feat.href;
    card.className = 'feature-card';

    const icon = document.createElement('div');
    icon.className = 'feature-icon';
    icon.innerHTML = feat.icon;

    const fTitle = document.createElement('h3');
    fTitle.textContent = feat.title;

    const fText = document.createElement('p');
    fText.textContent = feat.text;

    card.append(icon, fTitle, fText);
    featuresGrid.append(card);
  }
  featuresSection.append(featuresTitle, featuresGrid);

  const teamSection = document.createElement('section');
  teamSection.className = 'about-section';

  const teamTitle = document.createElement('h2');
  teamTitle.className = 'about-section-title';
  teamTitle.textContent = 'Наша команда';

  const teamGrid = document.createElement('div');
  teamGrid.className = 'team-grid';

  const teamMembers = [
    {
      githubUser: 'SkorbezhArtem',
      name: 'Артем (SkorbezhArtem)',
      github: 'https://github.com/SkorbezhArtem',
      role: 'АРХИТЕКТУРА, КОРЗИНА И ИНФРАСТРУКТУРА',
      description:
        'Настроил сборку проекта, CI/CD-пайплайны и деплой на GitHub Pages. Разработал стор и логику корзины, реализовал hash-роутинг, страницу корзины и адаптивную верстку.',
    },
    {
      githubUser: 'KirillOlesik',
      name: 'Кирилл (KirillOlesik)',
      github: 'https://github.com/KirillOlesik',
      role: 'КАТАЛОГ, ФИЛЬТРАЦИЯ И UI',
      description:
        'Разработал структуру данных товаров и сервис каталога. Написал функцию фильтрации и сортировки с покрытием юнит-тестами. Сверстал карточки товаров, панель фильтров и страницу «О нас».',
    },
  ];

  for (const member of teamMembers) {
    const card = document.createElement('div');
    card.className = 'team-member-card';

    const avatar = document.createElement('img');
    avatar.className = 'avatar-img';
    avatar.src = `https://github.com/${member.githubUser}.png`;
    avatar.alt = `Аватар ${member.name}`;

    const nameEl = document.createElement('h3');
    nameEl.textContent = member.name;

    const roleEl = document.createElement('span');
    roleEl.className = 'member-role';
    roleEl.textContent = member.role;

    const descEl = document.createElement('p');
    descEl.textContent = member.description;

    const linkEl = document.createElement('a');
    linkEl.href = member.github;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
    linkEl.className = 'team-github-btn';
    linkEl.innerHTML = 'Посмотреть GitHub &nearr;';

    card.append(avatar, nameEl, roleEl, descEl, linkEl);
    teamGrid.append(card);
  }
  teamSection.append(teamTitle, teamGrid);

  const footer = document.createElement('footer');
  footer.className = 'about-footer';

  const stackLabel = document.createElement('span');
  stackLabel.className = 'stack-label';
  stackLabel.textContent = 'Стек проекта:';

  const stackTags = document.createElement('div');
  stackTags.className = 'stack-tags';
  const techs = ['TypeScript', 'Vite', 'Vitest', 'ESLint & Prettier', 'GitHub Pages'];
  for (const tech of techs) {
    const tag = document.createElement('span');
    tag.className = 'stack-tag';
    tag.textContent = tech;
    stackTags.append(tag);
  }
  footer.append(stackLabel, stackTags);

  container.append(hero, featuresSection, teamSection, footer);
  root.append(container);
}
