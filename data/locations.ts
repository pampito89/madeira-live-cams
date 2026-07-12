export type Locale = 'en' | 'uk';

export type LocalizedText = {
  en: string;
  uk: string;
};

export type LocalizedArticle = {
  intro: LocalizedText;
  history: LocalizedText;
  highlights: {
    en: string[];
    uk: string[];
  };
  practicalTip: LocalizedText;
};

export type Location = {
  slug: string;
  name: LocalizedText;
  area: LocalizedText;
  category: LocalizedText;
  tags: string[];
  summary: LocalizedText;
  image: string;
  imageAlt: LocalizedText;
  mapQuery: string;
  article: LocalizedArticle;
};

export type DisplayLocation = {
  slug: string;
  name: string;
  area: string;
  category: string;
  tags: string[];
  summary: string;
  image: string;
  imageAlt: string;
  mapQuery: string;
  article: {
    intro: string;
    history: string;
    highlights: string[];
    practicalTip: string;
  };
};

function keepOriginalPlaceNames(text: string, locale: Locale) {
  if (locale !== 'uk') {
    return text;
  }

  const replacements: Array<[string, string]> = [
    ['Порту-Моніші', 'Porto Moniz'],
    ['Порту-Моніш', 'Porto Moniz'],
    ['Порту-ду-Сейшал', 'Porto do Seixal'],
    ['Понта-де-Сан-Лоренсу', 'Ponta de São Lourenço'],
    ['Піку-ду-Аріейру', 'Pico do Arieiro'],
    ['Піку-Руйву', 'Pico Ruivo'],
    ['Фажан-душ-Падреш', 'Fajã dos Padres'],
    ['Кабу-Жіран', 'Cabo Girão'],
    ['Камара-де-Лобуш', 'Câmara de Lobos'],
    ['Левада-ду-Мойню', 'Levada do Moinho'],
    ['Левада-Нова', 'Levada Nova'],
    ['Праіня-ду-Канісал', 'Prainha do Caniçal'],
    ['Понта-ду-Сол', 'Ponta do Sol'],
    ['Паул-да-Серра', 'Paul da Serra'],
    ['Крішту-Рей', 'Cristo Rei'],
    ['Монте-Палас', 'Monte Palace'],
    ['Канісала', 'Caniçal'],
    ['Канісалу', 'Caniçal'],
    ['Канісал', 'Caniçal'],
    ['Гаражау', 'Garajau'],
    ['Фуншалом', 'Funchal'],
    ['Фуншалі', 'Funchal'],
    ['Фуншала', 'Funchal'],
    ['Фуншал', 'Funchal'],
    ['Калети', 'Calheta'],
    ['Калета', 'Calheta'],
    ['Сейшала', 'Seixal'],
    ['Сейшалі', 'Seixal'],
    ['Сейшал', 'Seixal'],
    ['Фанал', 'Fanal'],
    ['Монте', 'Monte'],
    ['Мадейри', 'Madeira'],
    ['Мадейра', 'Madeira'],
    ['Сан-Лоренсу', 'São Lourenço'],
    ['Ашада-ду-Тейшейра', 'Achada do Teixeira'],
    ['Чарльз Мюррей', 'Charles Murray'],
    ['Алфреду Гільєрме Родрігеш', 'Alfredo Guilherme Rodrigues'],
    ['Жозе Мануел Родрігеш Берарду', 'José Manuel Rodrigues Berardo'],
    ['Кінта-ду-Празер', 'Quinta do Prazer'],
    ['Рейну', 'Rhine'],
    ['Німеччині', 'Germany'],
  ];

  return replacements.reduce(
    (result, [from, to]) => result.replaceAll(from, to),
    text,
  );
}

export function getLocalizedLocation(
  location: Location,
  locale: Locale,
): DisplayLocation {
  return {
    slug: location.slug,
    name: keepOriginalPlaceNames(location.name[locale], locale),
    area: keepOriginalPlaceNames(location.area[locale], locale),
    category: location.category[locale],
    tags: location.tags,
    summary: keepOriginalPlaceNames(location.summary[locale], locale),
    image: location.image,
    imageAlt: keepOriginalPlaceNames(location.imageAlt[locale], locale),
    mapQuery: location.mapQuery,
    article: {
      intro: keepOriginalPlaceNames(location.article.intro[locale], locale),
      history: keepOriginalPlaceNames(location.article.history[locale], locale),
      highlights: location.article.highlights[locale].map((highlight) =>
        keepOriginalPlaceNames(highlight, locale),
      ),
      practicalTip: keepOriginalPlaceNames(
        location.article.practicalTip[locale],
        locale,
      ),
    },
  };
}

export const locations: Location[] = [
  {
    slug: 'cristo-rei',
    name: {
      en: 'Cristo Rei Viewpoint',
      uk: 'Оглядовий майданчик Cristo Rei',
    },
    area: {
      en: 'Garajau, Caniço',
      uk: 'Garajau, Caniço',
    },
    category: {
      en: 'Viewpoint',
      uk: 'Оглядовий майданчик',
    },
    tags: ['Viewpoints'],
    summary: {
      en: 'A clifftop viewpoint above Garajau with wide Atlantic views and the Cristo Rei statue.',
      uk: 'Оглядовий майданчик над Garajau з широкими видами на Атлантику та статуєю Cristo Rei.',
    },
    image: '/images/explore/cristo-rei.jpg',
    imageAlt: {
      en: 'Cristo Rei viewpoint in Garajau, Madeira',
      uk: 'Оглядовий майданчик Cristo Rei у Garajau, Мадейра',
    },
    mapQuery: 'Cristo Rei Viewpoint Garajau Madeira',
    article: {
      intro: {
        en: 'Cristo Rei is a peaceful coastal viewpoint in Garajau, on the south-east side of Madeira. It looks across the Atlantic and towards the Garajau nature reserve.',
        uk: 'Cristo Rei — спокійний прибережний оглядовий майданчик у Garajau, на південному сході Мадейри. Звідси відкривається вид на Атлантичний океан і природний заповідник Garajau.',
      },
      history: {
        en: 'The viewpoint is known for its Christ the King statue and has become a popular stop for visitors exploring Caniço and the eastern coast.',
        uk: 'Майданчик відомий статуєю Христа-Царя та став популярною зупинкою для мандрівників, які досліджують Caniço і східне узбережжя острова.',
      },
      highlights: {
        en: [
          'Open Atlantic views from high coastal cliffs',
          'The Cristo Rei statue and nearby Garajau coastline',
          'A useful stop when travelling between Funchal and the airport',
        ],
        uk: [
          'Відкриті види на Атлантику з високих прибережних скель',
          'Статуя Cristo Rei і узбережжя Garajau поруч',
          'Зручна зупинка дорогою між Funchal та аеропортом',
        ],
      },
      practicalTip: {
        en: 'Visit in the morning or late afternoon for softer light, and combine it with a walk or swim around Garajau.',
        uk: 'Приїжджайте вранці або наприкінці дня, коли світло м’якше. Можна поєднати візит із прогулянкою чи купанням у районі Garajau.',
      },
    },
  },
  {
    slug: 'monte-palace-tropical-garden',
    name: {
      en: 'Monte Palace Tropical Garden',
      uk: 'Тропічний сад Monte Palace',
    },
    area: {
      en: 'Monte, Funchal',
      uk: 'Monte, Funchal',
    },
    category: {
      en: 'Garden & culture',
      uk: 'Сад і культура',
    },
    tags: ['City & culture'],
    summary: {
      en: 'A hillside garden above Funchal where tropical plants, water features, Portuguese tiles and art collections meet.',
      uk: 'Сад на схилі над Funchal, де поєднуються тропічні рослини, водойми, португальські кахлі та мистецькі колекції.',
    },
    image: '/images/explore/monte-palace-tropical-garden.jpg',
    imageAlt: {
      en: 'Tropical garden, lake and lush plants at Monte Palace in Madeira',
      uk: 'Тропічний сад, озеро та пишна рослинність у Monte Palace на Мадейрі',
    },
    mapQuery: 'Monte Palace Tropical Garden Madeira',
    article: {
      intro: {
        en: 'Monte Palace Tropical Garden is one of Madeira’s best-known botanical and cultural attractions. Set high above Funchal in Monte, the 70,000-square-metre garden brings together exotic plants, lakes, historic Portuguese tiles, Asian-inspired design and museum collections.',
        uk: 'Тропічний сад Monte Palace — одна з найвідоміших ботанічних і культурних пам’яток Мадейри. Розташований високо над Funchal у районі Monte, сад площею 70 000 квадратних метрів поєднує екзотичні рослини, озера, історичні португальські кахлі, азійські мотиви та музейні колекції.',
      },
      history: {
        en: 'The site began in the 18th century, when British consul Charles Murray created the Quinta do Prazer estate south of Monte Church. In 1897, Alfredo Guilherme Rodrigues acquired the property and built a palace-like residence inspired by the castles he had seen along Germany’s Rhine. It later became the Monte Palace Hotel, but after closing it fell into decline. In 1987, Madeiran businessman, art collector and philanthropist José Manuel Rodrigues Berardo acquired the former hotel and transformed the estate into the garden visitors see today.',
        uk: 'Історія місця почалася у XVIII столітті, коли британський консул Чарльз Мюррей створив маєток Кінта-ду-Празер на південь від церкви Monte. У 1897 році власність придбав Алфреду Гільєрме Родрігеш і збудував резиденцію, схожу на палац, натхненну замками, які він бачив уздовж Рейну в Німеччині. Пізніше тут працював готель Monte Palace, але після закриття будівля занепала. У 1987 році мадейрський підприємець, колекціонер і меценат Жозе Мануел Родрігеш Берарду придбав колишній готель і перетворив маєток на сад, який відвідувачі бачать сьогодні.',
      },
      highlights: {
        en: [
          'Around 100,000 plant specimens from Madeira and several continents',
          'Ponds, waterfalls, koi carp, swans, ducks and free-roaming peacocks',
          'Portuguese azulejo tiles dating from the 15th to the 20th centuries',
          'The 166-tile panel The Adventures of the Portuguese in Japan',
          'Japanese- and Chinese-inspired details, including lanterns, bridges and Buddhist statues',
          'A three-floor museum with minerals, semi-precious stones and contemporary Zimbabwean stone sculpture',
          'Views across Funchal Bay and the Atlantic from the hillside paths',
        ],
        uk: [
          'Близько 100 000 зразків рослин з Мадейри та різних континентів',
          'Ставки, водоспади, коропи кої, лебеді, качки та павичі, що вільно гуляють садом',
          'Португальські кахлі азулежу XV–XX століть',
          'Панно з 166 кахлів «Пригоди португальців у Японії»',
          'Японські й китайські мотиви: ліхтарі, містки та буддійські статуї',
          'Триповерховий музей із мінералами, напівдорогоцінним камінням і сучасною скульптурою Зімбабве',
          'Види на затоку Funchal та Атлантику зі стежок на схилі',
        ],
      },
      practicalTip: {
        en: 'Allow at least two to three hours. The garden is steep, with many paths and steps, so wear comfortable shoes. A cable car from Funchal is one of the most scenic ways to reach Monte.',
        uk: 'Виділіть щонайменше дві-три години. Сад розташований на схилі, тут багато стежок і сходів, тому взуйте зручне взуття. Канатна дорога з Funchal — один із наймальовничіших способів дістатися до Monte.',
      },
    },
  },
  {
    slug: 'funchal',
    name: {
      en: 'Funchal',
      uk: 'Funchal',
    },
    area: {
      en: 'South coast',
      uk: 'Південне узбережжя',
    },
    category: {
      en: 'City',
      uk: 'Місто',
    },
    tags: ['City & culture'],
    summary: {
      en: 'Madeira’s capital, with a harbour, old town, restaurants, museums and coastal promenades.',
      uk: 'Столиця Мадейри з гаванню, старим містом, ресторанами, музеями та прибережними набережними.',
    },
    image: '/images/explore/funchal.jpg',
    imageAlt: {
      en: 'Funchal harbour and city on Madeira',
      uk: 'Гавань і місто Funchal на Мадейрі',
    },
    mapQuery: 'Funchal Madeira',
    article: {
      intro: {
        en: 'Funchal is Madeira’s capital and the best base for travellers who want restaurants, museums, markets and easy access to the south coast.',
        uk: 'Funchal — столиця Мадейри та найкраща база для мандрівників, які хочуть бути поруч із ресторанами, музеями, ринками та південним узбережжям.',
      },
      history: {
        en: 'The city grew around its sheltered bay and harbour, becoming Madeira’s main commercial and administrative centre.',
        uk: 'Місто виросло навколо захищеної бухти та гавані й стало головним комерційним та адміністративним центром Мадейри.',
      },
      highlights: {
        en: [
          'Historic streets in the Old Town',
          'Harbour promenades and views across Funchal Bay',
          'A convenient base for buses, tours and cable cars',
        ],
        uk: [
          'Історичні вулиці Старого міста',
          'Набережні гавані та види на затоку Funchal',
          'Зручна база для автобусів, турів і канатних доріг',
        ],
      },
      practicalTip: {
        en: 'Walk the Old Town in the evening, then use the seafront promenade to reach the harbour area.',
        uk: 'Прогуляйтеся Старим містом увечері, а потім пройдіться набережною до району гавані.',
      },
    },
  },
  {
    slug: 'mercado-dos-lavradores',
    name: {
      en: 'Mercado dos Lavradores',
      uk: 'Ринок Mercado dos Lavradores',
    },
    area: {
      en: 'Funchal Old Town',
      uk: 'Старе місто Funchal',
    },
    category: {
      en: 'Market',
      uk: 'Ринок',
    },
    tags: ['City & culture'],
    summary: {
      en: 'Funchal’s traditional market for fruit, flowers, local produce and fresh fish.',
      uk: 'Традиційний ринок Funchal з фруктами, квітами, місцевими продуктами та свіжою рибою.',
    },
    image: '/images/explore/mercado-dos-lavradores.jpg',
    imageAlt: {
      en: 'Mercado dos Lavradores market in Funchal',
      uk: 'Ринок Mercado dos Lavradores у Funchal',
    },
    mapQuery: 'Mercado dos Lavradores Funchal',
    article: {
      intro: {
        en: 'Mercado dos Lavradores is Funchal’s best-known traditional market, close to the Old Town and waterfront.',
        uk: 'Mercado dos Lavradores — найвідоміший традиційний ринок Funchal, розташований біля Старого міста та набережної.',
      },
      history: {
        en: 'The market has long been a meeting point for local produce, flowers and fish, and remains one of the city’s most recognisable buildings.',
        uk: 'Ринок давно був місцем торгівлі місцевими продуктами, квітами та рибою й досі залишається однією з найбільш упізнаваних будівель міста.',
      },
      highlights: {
        en: [
          'Colourful flower and fruit stalls',
          'Fresh fish market area',
          'Central location near Funchal Old Town',
        ],
        uk: [
          'Яскраві прилавки з квітами та фруктами',
          'Зона ринку зі свіжою рибою',
          'Центральне розташування поруч зі Старим містом Funchal',
        ],
      },
      practicalTip: {
        en: 'Check prices before buying fruit, especially items sold as samples to visitors.',
        uk: 'Перевіряйте ціни перед купівлею фруктів, особливо тих, які пропонують туристам спробувати.',
      },
    },
  },
  {
    slug: 'pico-do-arieiro',
    name: {
      en: 'Pico do Arieiro',
      uk: 'Pico do Arieiro',
    },
    area: {
      en: 'Central mountains',
      uk: 'Центральні гори',
    },
    category: {
      en: 'Sunrise & hiking',
      uk: 'Світанок і хайкінг',
    },
    tags: ['Hiking', 'Viewpoints'],
    summary: {
      en: 'A high mountain viewpoint popular for sunrise, cloud inversions and the route towards Pico Ruivo.',
      uk: 'Високогірний оглядовий майданчик, популярний для зустрічі світанку, спостереження за хмарами та маршрутів у бік Pico Ruivo.',
    },
    image: '/images/explore/pico-do-arieiro.jpg',
    imageAlt: {
      en: 'Sunrise above the clouds at Pico do Arieiro, Madeira',
      uk: 'Світанок над хмарами на Pico do Arieiro, Мадейра',
    },
    mapQuery: 'Pico do Arieiro Madeira',
    article: {
      intro: {
        en: 'Pico do Arieiro is one of Madeira’s most accessible high-mountain viewpoints. At 1,818 metres, it offers broad views across the central mountain massif when the weather is clear.',
        uk: 'Pico do Arieiro — один із найдоступніших високогірних оглядових майданчиків Мадейри. На висоті 1 818 метрів він відкриває широкі види на центральний гірський масив у ясну погоду.',
      },
      history: {
        en: 'Its high road access and dramatic ridgelines made it a landmark for visitors long before sunrise tourism became popular.',
        uk: 'Доступ автомобільною дорогою на велику висоту та драматичні гірські хребти зробили це місце знаковим для відвідувачів задовго до популярності поїздок на світанок.',
      },
      highlights: {
        en: [
          'Sunrise above a sea of clouds on suitable mornings',
          'Views into Madeira’s central mountain massif',
          'The starting point for mountain routes towards Pico Ruivo',
        ],
        uk: [
          'Світанок над морем хмар за сприятливих умов',
          'Види на центральний гірський масив Мадейри',
          'Початкова точка гірських маршрутів у напрямку Pico Ruivo',
        ],
      },
      practicalTip: {
        en: 'Check mountain weather and the live camera before leaving. Bring warm layers and allow extra driving time in cloud or darkness.',
        uk: 'Перед виїздом перевірте погоду в горах та онлайн-камеру. Візьміть теплий одяг і закладіть додатковий час на дорогу в хмарах або темряві.',
      },
    },
  },
  {
    slug: 'pico-ruivo',
    name: {
      en: 'Pico Ruivo',
      uk: 'Pico Ruivo',
    },
    area: {
      en: 'Central mountains',
      uk: 'Центральні гори',
    },
    category: {
      en: 'Hiking',
      uk: 'Хайкінг',
    },
    tags: ['Hiking'],
    summary: {
      en: 'Madeira’s highest peak, reached by mountain trails with expansive views in clear weather.',
      uk: 'Найвища вершина Мадейри, до якої ведуть гірські стежки з широкими видами в ясну погоду.',
    },
    image: '/images/explore/pico-ruivo.jpg',
    imageAlt: {
      en: 'Mountain ridge near Pico Ruivo in Madeira',
      uk: 'Гірський хребет поблизу Pico Ruivo на Мадейрі',
    },
    mapQuery: 'Pico Ruivo Madeira',
    article: {
      intro: {
        en: 'Pico Ruivo is Madeira’s highest summit and a major goal for hikers visiting the island’s central mountains.',
        uk: 'Pico Ruivo — найвища вершина Мадейри та одна з головних цілей для туристів, які ходять центральними горами острова.',
      },
      history: {
        en: 'The peak has long been connected by highland paths, with routes from Achada do Teixeira and the Pico do Arieiro area.',
        uk: 'Вершина давно сполучена високогірними стежками; популярні маршрути ведуть із Ашада-ду-Тейшейра та району Pico do Arieiro.',
      },
      highlights: {
        en: [
          'Madeira’s highest mountain summit',
          'High-altitude walking and ridge scenery',
          'Wide views in stable, clear weather',
        ],
        uk: [
          'Найвища гірська вершина Мадейри',
          'Високогірні маршрути та пейзажі гірських хребтів',
          'Широкі види за стабільної ясної погоди',
        ],
      },
      practicalTip: {
        en: 'Always check official trail status and mountain conditions before setting out.',
        uk: 'Завжди перевіряйте офіційний статус стежок і погодні умови в горах перед виходом.',
      },
    },
  },
  {
    slug: 'faja-dos-padres',
    name: {
      en: 'Fajã dos Padres',
      uk: 'Fajã dos Padres',
    },
    area: {
      en: 'South coast',
      uk: 'Південне узбережжя',
    },
    category: {
      en: 'Coast',
      uk: 'Узбережжя',
    },
    tags: ['Beaches'],
    summary: {
      en: 'A quiet coastal estate below towering cliffs, reached by cable car or boat.',
      uk: 'Тихий прибережний маєток під високими скелями, куди можна дістатися канатною дорогою або човном.',
    },
    image: '/images/explore/faja-dos-padres.jpg',
    imageAlt: {
      en: 'Fajã dos Padres coast below cliffs in Madeira',
      uk: 'Узбережжя Fajã dos Padres під скелями на Мадейрі',
    },
    mapQuery: 'Faja dos Padres Madeira',
    article: {
      intro: {
        en: 'Fajã dos Padres is a sheltered strip of coast below Madeira’s high southern cliffs.',
        uk: 'Fajã dos Padres — захищена смуга узбережжя під високими південними скелями Мадейри.',
      },
      history: {
        en: 'Its unusual location beneath the cliffs supported cultivation and a small coastal settlement over many generations.',
        uk: 'Незвичайне розташування під скелями протягом багатьох поколінь сприяло сільському господарству та існуванню невеликого прибережного поселення.',
      },
      highlights: {
        en: [
          'A dramatic cable-car approach beneath cliffs',
          'Quiet coast and cultivated terraces',
          'A slower alternative to the busier south-coast resorts',
        ],
        uk: [
          'Ефектний під’їзд канатною дорогою під скелями',
          'Тихе узбережжя та оброблені тераси',
          'Спокійніша альтернатива жвавішим курортам південного узбережжя',
        ],
      },
      practicalTip: {
        en: 'Check cable-car operating times before travelling, particularly outside the main season.',
        uk: 'Перед поїздкою перевірте години роботи канатної дороги, особливо поза основним туристичним сезоном.',
      },
    },
  },
  {
    slug: 'cabo-girao-skywalk',
    name: {
      en: 'Cabo Girão Skywalk',
      uk: 'Скайвок Cabo Girão',
    },
    area: {
      en: 'Câmara de Lobos',
      uk: 'Câmara de Lobos',
    },
    category: {
      en: 'Viewpoint',
      uk: 'Оглядовий майданчик',
    },
    tags: ['Viewpoints'],
    summary: {
      en: 'A glass-floored platform above the south coast with views over cliffs, ocean and farmland.',
      uk: 'Платформа зі скляною підлогою над південним узбережжям із видами на скелі, океан і сільськогосподарські тераси.',
    },
    image: '/images/explore/cabo-girao-skywalk.jpg',
    imageAlt: {
      en: 'Cabo Girao Skywalk above Madeira south coast',
      uk: 'Скайвок Cabo Girão над південним узбережжям Мадейри',
    },
    mapQuery: 'Cabo Girao Skywalk Madeira',
    article: {
      intro: {
        en: 'Cabo Girão is a dramatic sea-cliff viewpoint west of Funchal, best known for its glass-floored skywalk.',
        uk: 'Cabo Girão — вражаючий оглядовий майданчик на морській скелі на захід від Funchal, найбільш відомий скляною платформою.',
      },
      history: {
        en: 'The cape became an iconic viewpoint because of its high cliffs and the small cultivated plots far below.',
        uk: 'Мис став знаковою оглядовою точкою завдяки високим скелям і маленьким обробленим ділянкам землі далеко внизу.',
      },
      highlights: {
        en: [
          'Glass-floor viewing platform',
          'Panoramas over the south coast and Atlantic',
          'Views of terraced farmland at the foot of the cliffs',
        ],
        uk: [
          'Оглядова платформа зі скляною підлогою',
          'Панорами південного узбережжя та Атлантики',
          'Види на терасні поля біля підніжжя скель',
        ],
      },
      practicalTip: {
        en: 'Go early or late in the day to avoid the busiest tour-bus period.',
        uk: 'Приїжджайте рано-вранці або наприкінці дня, щоб уникнути найбільшого напливу туристичних автобусів.',
      },
    },
  },
  {
    slug: 'levada-nova-levada-do-moinho',
    name: {
      en: 'Levada Nova & Levada do Moinho',
      uk: 'Levada Nova та Levada do Moinho',
    },
    area: {
      en: 'Ponta do Sol',
      uk: 'Ponta do Sol',
    },
    category: {
      en: 'Levada walk',
      uk: 'Прогулянка левадою',
    },
    tags: ['Levada walks', 'Hiking'],
    summary: {
      en: 'A scenic levada walk through valleys, tunnels, waterfalls and cultivated terraces.',
      uk: 'Мальовнича прогулянка левадами через долини, тунелі, водоспади та оброблені тераси.',
    },
    image: '/images/explore/levada-nova-levada-do-moinho.jpg',
    imageAlt: {
      en: 'Levada path near Ponta do Sol in Madeira',
      uk: 'Стежка левадою біля Ponta do Sol на Мадейрі',
    },
    mapQuery: 'Levada Nova Levada do Moinho Madeira',
    article: {
      intro: {
        en: 'Levada Nova and Levada do Moinho are popular water-channel paths in the Ponta do Sol area.',
        uk: 'Levada Nova та Levada do Moinho — популярні маршрути вздовж водних каналів у районі Ponta do Sol.',
      },
      history: {
        en: 'Like many Madeira levadas, these channels were built to carry water to agricultural land and are now used as walking routes.',
        uk: 'Як і багато левад Мадейри, ці канали були збудовані для подачі води на сільськогосподарські землі, а сьогодні використовуються як пішохідні маршрути.',
      },
      highlights: {
        en: [
          'Irrigation channels, valleys and terrace landscapes',
          'Waterfalls and short tunnels on parts of the route',
          'A classic example of Madeira’s levada network',
        ],
        uk: [
          'Зрошувальні канали, долини та терасні ландшафти',
          'Водоспади та короткі тунелі на деяких ділянках маршруту',
          'Класичний приклад мережі левад Мадейри',
        ],
      },
      practicalTip: {
        en: 'Use a torch for tunnels and wear shoes with good grip after rain.',
        uk: 'Візьміть ліхтарик для тунелів і взуйтеся у взуття з хорошим зчепленням, особливо після дощу.',
      },
    },
  },
  {
    slug: 'calheta-beach',
    name: {
      en: 'Calheta Beach',
      uk: 'Пляж Calheta',
    },
    area: {
      en: 'Calheta',
      uk: 'Calheta',
    },
    category: {
      en: 'Beach',
      uk: 'Пляж',
    },
    tags: ['Beaches'],
    summary: {
      en: 'A sheltered sandy beach with calmer water, cafés and a marina nearby.',
      uk: 'Захищений піщаний пляж зі спокійнішою водою, кафе та марина поруч.',
    },
    image: '/images/explore/calheta-beach.jpg',
    imageAlt: {
      en: 'Calheta Beach on Madeira south-west coast',
      uk: 'Пляж Calheta на південно-західному узбережжі Мадейри',
    },
    mapQuery: 'Calheta Beach Madeira',
    article: {
      intro: {
        en: 'Calheta Beach is a sheltered south-west coast beach with sand, a marina and nearby cafés.',
        uk: 'Пляж Calheta — захищений пляж на південно-західному узбережжі з піском, мариною та кафе поруч.',
      },
      history: {
        en: 'The beach was created as part of Calheta’s coastal leisure area and is distinct from Madeira’s many pebble and black-sand beaches.',
        uk: 'Пляж був створений як частина прибережної зони відпочинку Calheta й відрізняється від численних галькових та чорнопіщаних пляжів Мадейри.',
      },
      highlights: {
        en: [
          'Sheltered swimming area',
          'Sand beach and family-friendly facilities',
          'Marina, cafés and south-west coast sunshine',
        ],
        uk: [
          'Захищена зона для купання',
          'Піщаний пляж і зручності для сімейного відпочинку',
          'Марина, кафе та сонячне південно-західне узбережжя',
        ],
      },
      practicalTip: {
        en: 'It is often calmer than open-ocean beaches, but check local sea conditions before swimming.',
        uk: 'Тут часто спокійніше, ніж на відкритих океанських пляжах, але перед купанням перевіряйте місцеві умови моря.',
      },
    },
  },
  {
    slug: 'ponta-de-sao-lourenco',
    name: {
      en: 'Vereda da Ponta de São Lourenço',
      uk: 'Стежка Ponta de São Lourenço',
    },
    area: {
      en: 'East peninsula',
      uk: 'Східний півострів',
    },
    category: {
      en: 'Hiking',
      uk: 'Хайкінг',
    },
    tags: ['Hiking'],
    summary: {
      en: 'A coastal trail across Madeira’s dry eastern peninsula with dramatic cliffs and ocean views.',
      uk: 'Прибережна стежка сухим східним півостровом Мадейри з вражаючими скелями та видами на океан.',
    },
    image: '/images/explore/ponta-de-sao-lourenco.jpg',
    imageAlt: {
      en: 'Coastal cliffs on Ponta de Sao Lourenco in Madeira',
      uk: 'Прибережні скелі на Ponta de São Lourenço, Мадейра',
    },
    mapQuery: 'Ponta de Sao Lourenco Trail Madeira',
    article: {
      intro: {
        en: 'Ponta de São Lourenço is Madeira’s eastern peninsula, markedly drier and more open than the island’s green interior.',
        uk: 'Ponta de São Lourenço — східний півострів Мадейри, значно сухіший і відкритіший за зелений внутрішній район острова.',
      },
      history: {
        en: 'Its exposed volcanic landscape has been shaped by Atlantic wind, salt and limited rainfall.',
        uk: 'Його відкритий вулканічний ландшафт сформували атлантичний вітер, сіль і невелика кількість опадів.',
      },
      highlights: {
        en: [
          'Distinct dry coastal scenery',
          'Clifftop paths and views across the Atlantic',
          'A landscape very different from Madeira’s levadas and forests',
        ],
        uk: [
          'Самобутні сухі прибережні пейзажі',
          'Стежки над скелями та види на Атлантику',
          'Ландшафт, зовсім не схожий на левади й ліси Мадейри',
        ],
      },
      practicalTip: {
        en: 'Bring water, sun protection and wind protection: shade is limited along the trail.',
        uk: 'Візьміть воду, захист від сонця та вітру: тіні вздовж маршруту майже немає.',
      },
    },
  },
  {
    slug: 'prainha-do-canical',
    name: {
      en: 'Prainha do Caniçal',
      uk: 'Пляж Prainha do Caniçal',
    },
    area: {
      en: 'Caniçal',
      uk: 'Канісал',
    },
    category: {
      en: 'Beach',
      uk: 'Пляж',
    },
    tags: ['Beaches'],
    summary: {
      en: 'A small natural beach on Madeira’s east coast, close to the São Lourenço peninsula.',
      uk: 'Невеликий природний пляж на східному узбережжі Мадейри, неподалік від півострова Сан-Лоренсу.',
    },
    image: '/images/explore/prainha-do-canical.jpg',
    imageAlt: {
      en: 'Prainha beach near Canical in Madeira',
      uk: 'Пляж Праіня біля Caniçal на Мадейрі',
    },
    mapQuery: 'Prainha do Canical Madeira',
    article: {
      intro: {
        en: 'Prainha do Caniçal is a small beach on Madeira’s eastern side, near the road to Ponta de São Lourenço.',
        uk: 'Prainha do Caniçal — невеликий пляж на східному боці Мадейри, біля дороги до Ponta de São Lourenço.',
      },
      history: {
        en: 'Its sheltered bay provides a contrast to the more exposed cliffs and hiking routes nearby.',
        uk: 'Його захищена бухта різко контрастує з більш відкритими скелями та пішохідними маршрутами поблизу.',
      },
      highlights: {
        en: [
          'A compact natural beach on the east coast',
          'Convenient stop before or after São Lourenço',
          'Clear coastal views in suitable weather',
        ],
        uk: [
          'Компактний природний пляж на східному узбережжі',
          'Зручна зупинка до або після маршруту Сан-Лоренсу',
          'Чисті прибережні види за сприятливої погоди',
        ],
      },
      practicalTip: {
        en: 'Combine it with the São Lourenço trail, but leave enough time to return before sunset.',
        uk: 'Поєднайте його з маршрутом Сан-Лоренсу, але залиште достатньо часу, щоб повернутися до заходу сонця.',
      },
    },
  },
  {
    slug: 'fanal-forest',
    name: {
      en: 'Fanal Forest',
      uk: 'Ліс Fanal',
    },
    area: {
      en: 'Paul da Serra',
      uk: 'Paul da Serra',
    },
    category: {
      en: 'Nature',
      uk: 'Природа',
    },
    tags: ['Hiking'],
    summary: {
      en: 'An ancient laurel forest known for its twisted trees, mist and atmospheric walks.',
      uk: 'Стародавній лавровий ліс, відомий своїми покрученими деревами, туманами та атмосферними прогулянками.',
    },
    image: '/images/explore/fanal-forest.jpg',
    imageAlt: {
      en: 'Ancient laurel trees in mist at Fanal Forest, Madeira',
      uk: 'Стародавні лаврові дерева в тумані у лісі Fanal, Мадейра',
    },
    mapQuery: 'Fanal Forest Madeira',
    article: {
      intro: {
        en: 'Fanal Forest is a high plateau landscape in north-west Madeira, known for old laurel trees that often appear through mist and low cloud.',
        uk: 'Ліс Fanal — це високогірний плато-ландшафт на північному заході Мадейри, відомий старими лавровими деревами, які часто виринають із туману та низьких хмар.',
      },
      history: {
        en: 'The area forms part of Madeira’s Laurissilva landscape, a remnant of ancient subtropical forest that once covered much wider areas of southern Europe.',
        uk: 'Ця територія є частиною лаврових лісів Лауріссілва Мадейри — залишку стародавнього субтропічного лісу, який колись покривав значно більші території Південної Європи.',
      },
      highlights: {
        en: [
          'Twisted, ancient laurel trees',
          'Frequent mist that creates a distinctive atmosphere',
          'A striking contrast with Madeira’s coast and high ridges',
        ],
        uk: [
          'Покручені стародавні лаврові дерева',
          'Частий туман, що створює особливу атмосферу',
          'Яскравий контраст із узбережжям та високими хребтами Мадейри',
        ],
      },
      practicalTip: {
        en: 'Fog is common and is part of the experience, but drive slowly and bring a waterproof layer.',
        uk: 'Туман тут звичний і є частиною атмосфери місця, але їдьте повільно та візьміть водонепроникний верхній шар одягу.',
      },
    },
  },
  {
    slug: 'praia-do-porto-do-seixal',
    name: {
      en: 'Praia do Porto do Seixal',
      uk: 'Пляж Porto do Seixal',
    },
    area: {
      en: 'Seixal',
      uk: 'Seixal',
    },
    category: {
      en: 'Beach',
      uk: 'Пляж',
    },
    tags: ['Beaches'],
    summary: {
      en: 'A black-sand beach on the north coast, surrounded by green mountains and waterfalls.',
      uk: 'Пляж із чорним піском на північному узбережжі, оточений зеленими горами та водоспадами.',
    },
    image: '/images/explore/praia-do-porto-do-seixal.jpg',
    imageAlt: {
      en: 'Black sand beach at Seixal on Madeira',
      uk: 'Пляж із чорним піском у Seixal на Мадейрі',
    },
    mapQuery: 'Praia do Porto do Seixal Madeira',
    article: {
      intro: {
        en: 'Praia do Porto do Seixal is a scenic north-coast beach framed by steep green mountains.',
        uk: 'Пляж Porto do Seixal — мальовничий пляж північного узбережжя, оточений стрімкими зеленими горами.',
      },
      history: {
        en: 'The beach is part of Seixal’s volcanic coastline, where dark sand and rocks contrast strongly with the surrounding vegetation.',
        uk: 'Пляж є частиною вулканічного узбережжя Seixal, де темний пісок і скелі яскраво контрастують із навколишньою рослинністю.',
      },
      highlights: {
        en: [
          'Dark volcanic sand and dramatic green surroundings',
          'North-coast scenery and nearby waterfalls',
          'A photogenic stop on a west or north-coast drive',
        ],
        uk: [
          'Темний вулканічний пісок і вражаючі зелені краєвиди',
          'Пейзажі північного узбережжя та водоспади поруч',
          'Фотогенічна зупинка під час поїздки західним або північним узбережжям',
        ],
      },
      practicalTip: {
        en: 'Sea conditions can change quickly on the north coast; follow local guidance before entering the water.',
        uk: 'Умови моря на північному узбережжі можуть швидко змінюватися; перед заходом у воду дотримуйтеся місцевих рекомендацій.',
      },
    },
  },
  {
    slug: 'porto-moniz-natural-pools',
    name: {
      en: 'Porto Moniz Natural Swimming Pools',
      uk: 'Природні басейни Porto Moniz',
    },
    area: {
      en: 'Porto Moniz',
      uk: 'Porto Moniz',
    },
    category: {
      en: 'Natural pools',
      uk: 'Природні басейни',
    },
    tags: ['Beaches'],
    summary: {
      en: 'Volcanic rock pools continuously refreshed by Atlantic seawater on Madeira’s north-west coast.',
      uk: 'Басейни серед вулканічних скель на північно-західному узбережжі Мадейри, які постійно оновлюються водою Атлантики.',
    },
    image: '/images/explore/porto-moniz-pools.jpg',
    imageAlt: {
      en: 'Volcanic natural swimming pools in Porto Moniz, Madeira',
      uk: 'Вулканічні природні басейни в Porto Moniz, Мадейра',
    },
    mapQuery: 'Porto Moniz Natural Swimming Pools Madeira',
    article: {
      intro: {
        en: 'Porto Moniz Natural Swimming Pools are seawater pools formed among black volcanic rocks on Madeira’s north-west coast.',
        uk: 'Природні басейни Porto Moniz — це басейни з морською водою, сформовані серед чорних вулканічних скель на північно-західному узбережжі Мадейри.',
      },
      history: {
        en: 'The pools are shaped by volcanic geology and receive fresh Atlantic water through natural openings in the rock.',
        uk: 'Басейни сформовані вулканічною геологією та отримують свіжу воду Атлантики через природні отвори в скелях.',
      },
      highlights: {
        en: [
          'Swimming areas set within volcanic rock formations',
          'Constantly renewed Atlantic seawater',
          'A memorable stop on a north-west Madeira road trip',
        ],
        uk: [
          'Зони для плавання серед вулканічних скель',
          'Постійно оновлювана атлантична морська вода',
          'Яскрава зупинка під час подорожі північним заходом Мадейри',
        ],
      },
      practicalTip: {
        en: 'Check opening times, local sea conditions and wind before travelling; the coast can be rough outside calm periods.',
        uk: 'Перед поїздкою перевірте години роботи, місцеві умови моря та вітер: узбережжя може бути неспокійним поза періодами штилю.',
      },
    },
  },
];

export function getLocationBySlug(slug: string) {
  return locations.find((location) => location.slug === slug);
}