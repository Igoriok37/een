/* ═══════════════════════════════════════════════════════════════════
   Эклет Инжиниринг — Schema.org / structured data
   Подключить перед </body> на каждой странице:
     <script src="schema.js"></script>
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var BASE_URL   = 'https://eng.ecklet.ru';
  var BRAND      = 'Эклет Инжиниринг';
  var PHONE      = '+73833750130';
  var EMAIL      = 'een@ecklet.ru';
  var ADDRESS    = { street: 'ул. Кирова, 50, офис 403', city: 'Новосибирск', region: 'Новосибирская область', postal: '630099', country: 'RU' };
  var GEO        = { lat: 54.9844, lng: 82.8963 };   // центр Новосибирска, уточнить по реальному адресу
  var LOGO       = BASE_URL + '/og-main.jpg';

  /* ── Базовые схемы, присутствующие на всех страницах ── */

  var organization = {
    '@context':   'https://schema.org',
    '@type':      ['Organization', 'ProfessionalService'],
    '@id':        BASE_URL + '/#organization',
    name:         BRAND,
    alternateName:'Ecklet Engineering',
    url:          BASE_URL,
    logo: {
      '@type':    'ImageObject',
      url:        LOGO,
      width:      1200,
      height:     630
    },
    telephone:    PHONE,
    email:        EMAIL,
    address: {
      '@type':           'PostalAddress',
      streetAddress:     ADDRESS.street,
      addressLocality:   ADDRESS.city,
      addressRegion:     ADDRESS.region,
      postalCode:        ADDRESS.postal,
      addressCountry:    ADDRESS.country
    },
    geo: {
      '@type':    'GeoCoordinates',
      latitude:   GEO.lat,
      longitude:  GEO.lng
    },
    areaServed:   ['RU', 'KZ', 'KG'],
    foundingDate: '2016',
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 85 },
    sameAs: [],
    description:  'Инжиниринговая компания полного цикла: проектирование, комплектация и строительство промышленных, складских и коммерческих объектов. Новосибирск, Россия, СНГ.'
  };

  var website = {
    '@context':     'https://schema.org',
    '@type':        'WebSite',
    '@id':          BASE_URL + '/#website',
    url:            BASE_URL,
    name:           BRAND,
    publisher:      { '@id': BASE_URL + '/#organization' },
    inLanguage:     'ru-RU',
    potentialAction: {
      '@type':      'SearchAction',
      target:       { '@type': 'EntryPoint', urlTemplate: BASE_URL + '/blog.html?q={search_term_string}' },
      'query-input':'required name=search_term_string'
    }
  };

  /* ── Определяем текущую страницу ── */

  var path     = window.location.pathname.replace(/^\//, '') || 'index.html';
  var schemas  = [organization, website];

  /* ── Breadcrumb helper ── */
  function breadcrumb(items) {
    return {
      '@context': 'https://schema.org',
      '@type':    'BreadcrumbList',
      itemListElement: items.map(function (item, idx) {
        return {
          '@type':    'ListItem',
          position:   idx + 1,
          name:       item.name,
          item:       item.url
        };
      })
    };
  }

  /* ── Страница-специфичные схемы ── */

  /* Главная */
  if (path === '' || path === 'index.html') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type':    'WebPage',
      '@id':      BASE_URL + '/#webpage',
      url:        BASE_URL + '/',
      name:       BRAND + ' — Комплексный инжиниринг объектов',
      isPartOf:   { '@id': BASE_URL + '/#website' },
      about:      { '@id': BASE_URL + '/#organization' },
      inLanguage: 'ru-RU'
    });
  }

  /* Контакты — LocalBusiness */
  if (path === 'contact.html') {
    schemas.push({
      '@context':         'https://schema.org',
      '@type':            'LocalBusiness',
      '@id':              BASE_URL + '/contact.html#localbusiness',
      name:               BRAND,
      telephone:          PHONE,
      email:              EMAIL,
      url:                BASE_URL + '/contact.html',
      address:            organization.address,
      geo:                organization.geo,
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' }
      ],
      priceRange:         '₽₽₽'
    });
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'Контакты', url: BASE_URL + '/contact.html' }
    ]));
  }

  /* О компании */
  if (path === 'about.html') {
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'О компании', url: BASE_URL + '/about.html' }
    ]));
  }

  /* Услуги — хаб */
  if (path === 'services.html') {
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'Услуги', url: BASE_URL + '/services.html' }
    ]));
  }

  /* Страницы услуг — Service schema */
  var serviceMap = {
    'service-complex.html':               { name: 'Комплексный инжиниринг под ключ', desc: 'EPCM-услуги: проектирование, комплектация и строительство в одном контракте.' },
    'service-design.html':                { name: 'Проектный инжиниринг полного цикла', desc: 'Pre-FEED, FEED, рабочая документация, MEP, BIM LOD 350–400.' },
    'service-supply.html':                { name: 'Комплектация объектов строительства', desc: 'Поставка конструкций и оборудования, таможня, киттинг, сверка с BIM.' },
    'service-construction.html':          { name: 'Строительные работы полного цикла', desc: 'Нулевой цикл, металлокаркас, инженерные системы, промышленные полы, ПНР.' },
    'service-construction-engineering.html':{ name: 'Строительный инжиниринг', desc: 'BIM-аудит, 4D-планирование, CIM-модель, строительный контроль, технадзор.' }
  };
  if (serviceMap[path]) {
    var svc = serviceMap[path];
    schemas.push({
      '@context':   'https://schema.org',
      '@type':      'Service',
      name:         svc.name,
      description:  svc.desc,
      provider:     { '@id': BASE_URL + '/#organization' },
      areaServed:   ['RU', 'KZ', 'KG'],
      url:          BASE_URL + '/' + path
    });
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'Услуги', url: BASE_URL + '/services.html' },
      { name: svc.name, url: BASE_URL + '/' + path }
    ]));
  }

  /* BIM */
  if (path === 'bim.html') {
    schemas.push({
      '@context':   'https://schema.org',
      '@type':      'Service',
      name:         'BIM-инжиниринг',
      description:  'LOD 100–500, 4D/5D планирование, Scan-to-BIM, Clash Detection. Снижение переделок на 30%.',
      provider:     { '@id': BASE_URL + '/#organization' },
      areaServed:   ['RU', 'KZ', 'KG'],
      url:          BASE_URL + '/bim.html'
    });
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'BIM-инжиниринг', url: BASE_URL + '/bim.html' }
    ]));
  }

  /* Проекты */
  if (path === 'projects.html') {
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'Проекты', url: BASE_URL + '/projects.html' }
    ]));
  }

  /* Процесс */
  if (path === 'process.html') {
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'Как мы работаем', url: BASE_URL + '/process.html' }
    ]));
  }

  /* Отраслевые страницы */
  var industryMap = {
    'industry-warehouses.html':  { name: 'Склады и логистика',          parent: 'Отрасли' },
    'industry-production.html':  { name: 'Промышленное производство',   parent: 'Отрасли' },
    'industry-apk.html':         { name: 'АПК и пищевая промышленность',parent: 'Отрасли' },
    'industry-commercial.html':  { name: 'Коммерческая недвижимость',   parent: 'Отрасли' },
    'industry-hotels.html':      { name: 'Гостиницы и рекреация',       parent: 'Отрасли' },
    'industry-residential.html': { name: 'Жилые объекты',               parent: 'Отрасли' }
  };
  if (industryMap[path]) {
    var ind = industryMap[path];
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'Услуги', url: BASE_URL + '/services.html' },
      { name: ind.name, url: BASE_URL + '/' + path }
    ]));
  }

  /* Блог — хаб */
  if (path === 'blog.html') {
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'Блог', url: BASE_URL + '/blog.html' }
    ]));
  }

  /* Статьи блога — Article schema */
  var articleMap = {
    'blog-bim-for-client.html': {
      headline:     'BIM в строительстве: что это даёт заказчику на практике',
      description:  'Что даёт BIM заказчику строительного объекта: снижение переделок, точность бюджета, контроль сроков. Реальные примеры и цифры из практики.',
      datePublished:'2026-06-01',
      dateModified: '2026-06-17',
      keywords:     'BIM, строительство, заказчик, переделки, бюджет'
    },
    'blog-capex-warehouse.html': {
      headline:     'Как рассчитать CAPEX склада: от концепции до сметы',
      description:  'Структура затрат, диапазоны стоимости проектирования, строительства и оборудования склада. Практическое руководство.',
      datePublished:'2026-06-05',
      dateModified: '2026-06-17',
      keywords:     'CAPEX, склад, смета, стоимость строительства'
    },
    'blog-expertise.html': {
      headline:     'Государственная экспертиза проекта: как пройти с первого раза',
      description:  'Типичные ошибки, требования к документации, BIM-экспертиза. Руководство для заказчиков.',
      datePublished:'2026-06-08',
      dateModified: '2026-06-17',
      keywords:     'государственная экспертиза, проект, документация, BIM'
    },
    'blog-industrial-floors.html': {
      headline:     'Промышленные полы: ошибки при проектировании и как их избежать',
      description:  'Ошибки при проектировании промышленных полов: нагрузки, геология, деформационные швы.',
      datePublished:'2026-06-10',
      dateModified: '2026-06-17',
      keywords:     'промышленные полы, проектирование, склад, завод'
    },
    'blog-scan-to-bim.html': {
      headline:     'Scan-to-BIM: когда и зачем нужно лазерное сканирование объекта',
      description:  'Лазерное сканирование зданий: когда нужно, сколько стоит и как работает.',
      datePublished:'2026-06-13',
      dateModified: '2026-06-17',
      keywords:     'Scan-to-BIM, лазерное сканирование, BIM, реконструкция'
    }
  };
  if (articleMap[path]) {
    var art = articleMap[path];
    schemas.push({
      '@context':     'https://schema.org',
      '@type':        'Article',
      headline:       art.headline,
      description:    art.description,
      datePublished:  art.datePublished,
      dateModified:   art.dateModified,
      keywords:       art.keywords,
      inLanguage:     'ru-RU',
      url:            BASE_URL + '/' + path,
      author:         { '@id': BASE_URL + '/#organization' },
      publisher:      { '@id': BASE_URL + '/#organization' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL + '/' + path }
    });
    schemas.push(breadcrumb([
      { name: 'Главная', url: BASE_URL + '/' },
      { name: 'Блог', url: BASE_URL + '/blog.html' },
      { name: art.headline, url: BASE_URL + '/' + path }
    ]));
  }

  /* ── Инжектируем все схемы в <head> ── */
  schemas.forEach(function (schema) {
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 0);
    document.head.appendChild(script);
  });

})();
