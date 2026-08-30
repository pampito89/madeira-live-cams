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
    tags: ['Viewpoints', 'Lab Travel'],
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
    en: 'Cristo Rei, meaning “Christ the King”, is one of Madeira’s best-known monuments. It stands on the clifftop at Ponta do Garajau, in Caniço, east of Funchal, with Christ facing the Atlantic Ocean and holding his arms open. The monument is also known as the Sacred Heart of Jesus statue because it was built in honour of Sagrado Coração de Jesus.',
    uk: 'Cristo Rei, що означає «Христос-Цар», — один із найвідоміших монументів Madeira. Він стоїть на вершині скелі в Ponta do Garajau, у Caniço на схід від Funchal: постать Христа звернена до Атлантичного океану та розкриває руки. Монумент також відомий як статуя Sacred Heart of Jesus, оскільки його спорудили на честь Sagrado Coração de Jesus.',
  },
  history: {
    en: 'Cristo Rei was inaugurated on 30 October 1927, the same day that the road from Cancela to the monument officially opened. It was completed before the Christ the Redeemer statue in Rio de Janeiro, inaugurated in 1931, making Cristo Rei one of the earliest major monuments to show Christ with open arms. Aires de Ornelas, son of the last majorat of Caniço, financed and commissioned the work. The design is credited to French sculptor Georges Serraz, while historical accounts also associate French sculptor Pierre Charles Lenoir with the project. The approximately 14-metre monument is an example of Art Deco sculpture, with simple forms, a strong vertical silhouette and a monumental presence above the sea. It was built as a public expression of Catholic faith, devotion to the Sacred Heart of Jesus, peace and spiritual protection.',
    uk: 'Cristo Rei урочисто відкрили 30 жовтня 1927 року — того самого дня офіційно відкрили дорогу від Cancela до монумента. Його завершили раніше за Christ the Redeemer у Rio de Janeiro, відкритий у 1931 році, тому Cristo Rei належить до одних із перших великих монументів із постаттю Христа з розкритими руками. Роботу профінансував і замовив Aires de Ornelas, син останнього majorat у Caniço. Автором проєкту вважають французького скульптора Georges Serraz; історичні джерела також пов’язують зі створенням монумента французького скульптора Pierre Charles Lenoir. Приблизно 14-метрова статуя є прикладом Art Deco: її вирізняють прості форми, виразний вертикальний силует і монументальна присутність над океаном. Її спорудили як публічний вияв католицької віри, відданості Sacred Heart of Jesus, миру та духовного захисту.',
  },
  highlights: {
    en: [
      'Cristo Rei was inaugurated on 30 October 1927, before Christ the Redeemer in Rio de Janeiro',
      'An approximately 14-metre Art Deco monument by Georges Serraz, with Pierre Charles Lenoir also associated with the project',
      'Open-armed Christ facing the Atlantic from the cliffs of Ponta do Garajau',
      'Views of the Atlantic Ocean, Garajau Beach, Caniço de Baixo and part of Funchal Bay on clear days',
      'Close to Garajau Partial Nature Reserve, known for clear water, rocky coast and marine life',
      'Praia do Garajau below the viewpoint, reached by road or cable car and popular for swimming, snorkelling and diving',
    ],
    uk: [
      'Cristo Rei відкрито 30 жовтня 1927 року — раніше за Christ the Redeemer у Rio de Janeiro',
      'Приблизно 14-метровий монумент у стилі Art Deco: автором вважають Georges Serraz, а Pierre Charles Lenoir також пов’язаний із проєктом',
      'Постать Христа з розкритими руками, звернена до Атлантики зі скель Ponta do Garajau',
      'Види на Атлантичний океан, Garajau Beach, Caniço de Baixo та частину Funchal Bay у ясну погоду',
      'Поруч розташований Garajau Partial Nature Reserve із чистою водою, скелястим узбережжям і морським життям',
      'Praia do Garajau під оглядовим майданчиком: до неї можна дістатися дорогою або канатною дорогою; місце популярне для плавання, снорклінгу й дайвінгу',
    ],
  },
  practicalTip: {
    en: 'Visit in the morning or late afternoon for softer light and clearer views. The clifftop can be windy, so bring a light layer. Combine the viewpoint with Praia do Garajau, but check cable-car operating times and sea conditions before swimming.',
    uk: 'Приїжджайте вранці або наприкінці дня, коли світло м’якше, а видимість часто краща. На вершині скелі може бути вітряно, тому візьміть легкий верхній шар одягу. Поєднайте оглядовий майданчик із Praia do Garajau, але перед купанням перевірте години роботи канатної дороги та стан моря.',
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
    tags: ['City & culture', 'Lab Travel'],
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
    tags: ['City & culture', 'Lab Travel'],
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
    en: 'Funchal is the capital and largest city of the Autonomous Region of Madeira, Portugal. Set on the south coast in a natural amphitheatre between the mountains and the Atlantic, it is the island’s main centre for government, business, transport, culture, education and tourism. Its name comes from the Portuguese word funcho, meaning fennel, which once grew abundantly in the valley.',
    uk: 'Фуншал — столиця та найбільше місто Автономного регіону Madeira у Португалії. Місто розташоване на південному узбережжі, у природному амфітеатрі між горами та Атлантичним океаном, і є головним центром управління, бізнесу, транспорту, культури, освіти й туризму на острові. Назва походить від португальського слова funcho — «фенхель», який колись рясно зростав у цій долині.',
  },
  history: {
    en: 'Madeira was reached by Portuguese navigators João Gonçalves Zarco, Tristão Vaz Teixeira and Bartolomeu Perestrelo in 1419. João Gonçalves Zarco settled with his family in the fertile Funchal valley in the early 1420s, where freshwater streams, productive land and a sheltered bay supported a growing settlement. Funchal became a town on 21 August 1452 and received city status from King Manuel I on 21 August 1508. Its harbour made it an important Atlantic stop for ships travelling between Europe, Africa and the Americas. During the 15th and 16th centuries, sugar cane made Funchal wealthy; after sugar faced competition from Brazil, Madeira wine became the key export. British wine merchants later shaped the city’s international commercial character. In the 19th century, Funchal became a winter destination for European visitors, and tourism remains central to its economy today. The latest complete official census, in 2021, recorded 105,782 residents in the municipality of Funchal and 250,744 residents in the Autonomous Region of Madeira.',
    uk: 'Мадейра була відкрита португальськими мореплавцями João Gonçalves Zarco, Tristão Vaz Teixeira та Bartolomeu Perestrelo у 1419 році. На початку 1420-х João Gonçalves Zarco оселився зі своєю родиною в родючій долині Фуншал, де прісні потоки, продуктивні землі та захищена бухта сприяли розвитку поселення. Фуншал отримав статус міста 21 серпня 1452 року, а 21 серпня 1508 року Король Мануель I надав йому статус міста. Гавань зробила Фуншал важливою зупинкою на атлантичних маршрутах між Європою, Африкою та Америками. У XV–XVI століттях місто розбагатіло завдяки вирощуванню цукрової тростини; коли цукор почав програвати конкуренцію продукції з Бразилії, головним експортним товаром стало Madeira wine. Згодом британські торговці вином вплинули на міжнародний комерційний характер міста. У XIX столітті Фуншал перетворився на зимовий курорт для європейських гостей, а сьогодні туризм залишається ключовою частиною його економіки. За останнім повним офіційним переписом 2021 року, у муніципалітеті Фуншал проживали 105 782 людини, а в Автономному регіоні Мадейра — 250 744.',
  },
  highlights: {
    en: [
      'Funchal Cathedral (Sé do Funchal), a late-15th-century landmark',
      'Mercado dos Lavradores for flowers, fruit, fish and regional products',
      'Zona Velha, the Old Town, with narrow streets, restaurants, galleries and painted doors',
      'Avenida do Mar, the marina, harbour and cruise-port area',
      'Monte, with Monte Palace Tropical Garden, the Church of Our Lady of Monte and wicker toboggan rides',
      'Madeira Botanical Garden, with panoramic city views and plant collections',
      'CR7 Museum, dedicated to Cristiano Ronaldo, who was born in Funchal in 1985',
    ],
    uk: [
      'Funchal Cathedral (Sé do Funchal) — визначна пам’ятка кінця XV століття',
      'Mercado dos Lavradores із квітами, фруктами, рибою та регіональними продуктами',
      'Zona Velha — Старе місто з вузькими вуличками, ресторанами, галереями та розписаними дверима',
      'Avenida do Mar, марина, гавань і район круїзного порту',
      'Monte з Monte Palace Tropical Garden, Church of Our Lady of Monte та традиційними плетеними санями',
      'Madeira Botanical Garden із панорамними видами на місто та колекціями рослин',
      'CR7 Museum, присвячений Cristiano Ronaldo, який народився у Funchal у 1985 році',
    ],
  },
  practicalTip: {
    en: 'Start with Mercado dos Lavradores and Zona Velha in the morning, walk along Avenida do Mar and the harbour, then take the cable car to Monte in the afternoon. Funchal is hilly, so wear comfortable shoes and allow time for slopes and steps.',
    uk: 'Почніть ранок із Mercado dos Lavradores та Zona Velha, прогуляйтеся Avenida do Mar і вздовж гавані, а вдень підніміться канатною дорогою до Monte. Funchal розташований на схилах, тому взуйте зручне взуття й закладіть додатковий час на підйоми та сходи.',
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
    tags: ['City & culture', 'Lab Travel'],
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
    en: 'Mercado dos Lavradores is Funchal’s historic farmers’ market, located near Zona Velha and the waterfront. It opened on 24 November 1940 as a purpose-built place for the city’s food supply: local growers, flower sellers, fishmongers and other traders could sell their goods in one central market instead of using scattered streets and squares.',
    uk: 'Mercado dos Lavradores — історичний фермерський ринок Фуншалу, розташований поруч із Zona Velha та набережною. Він відкрився 24 листопада 1940 року як спеціально створене місце для постачання міста: місцеві фермери, продавці квітів, торговці рибою та інші продавці могли реалізовувати товари в одному центральному ринку, а не на розрізнених вулицях і площах.',
  },
  history: {
    en: 'The market was designed in 1938 by Portuguese architect Edmundo Tavares and inaugurated during the municipal administration of Fernão de Ornelas. Its purpose was practical as well as civic: to organise the sale and distribution of fresh food for Funchal. Farmers from across Madeira brought fruit, vegetables, herbs and flowers; fishmongers sold the day’s catch; other traders offered meat, poultry, cheese and regional produce. The building is a notable example of Estado Novo-era architecture. Its façade, main entrance and fish market are decorated with large 1940 azulejo panels made by the Faiança Battistini factory and painted by João Rodrigues with regional scenes. More than eight decades later, Mercado dos Lavradores remains part of daily life in Funchal, although it is also one of the city’s busiest visitor attractions.',
    uk: 'Ринок спроєктував у 1938 році португальський архітектор Edmundo Tavares, а відкриття відбулося під час муніципального управління Fernão de Ornelas. Його завдання було практичним і важливим для міста: організувати продаж та розподіл свіжих продуктів для Фуншалу. Фермери з різних частин Madeira привозили фрукти, овочі, трави й квіти; торговці рибою продавали денний улов; інші продавці пропонували м’ясо, птицю, сир і регіональні продукти. Будівля є помітним прикладом архітектури періоду Estado Novo. Фасад, головний вхід і рибний павільйон оздоблені великими панно azulejo 1940 року, виготовленими фабрикою Faiança Battistini та розписаними João Rodrigues на регіональні теми. Понад вісім десятиліть потому Mercado dos Lavradores залишається частиною повсякденного життя Фуншалу, хоча водночас є однією з найпопулярніших локацій для відвідувачів.',
  },
  highlights: {
    en: [
      'Opened on 24 November 1940 as Funchal’s central supply market',
      'Designed by architect Edmundo Tavares and associated with the municipal period of Fernão de Ornelas',
      'Large 1940 azulejo panels by João Rodrigues on the façade, main entrance and fish market',
      'Flower stalls, tropical fruit, vegetables, herbs, regional products, cheese and other local goods',
      'Fresh fish and seafood section, often including tuna and black scabbardfish, known locally as espada',
      'Noite do Mercado, the lively night of 23 December, when locals gather in and around the market before Christmas',
      'A working market and a useful introduction to Madeira’s food, farming and fishing traditions',
    ],
    uk: [
      'Відкритий 24 листопада 1940 року як центральний ринок постачання Фуншалу',
      'Спроєктований архітектором Edmundo Tavares і пов’язаний із муніципальним періодом Fernão de Ornelas',
      'Великі панно azulejo 1940 року роботи João Rodrigues на фасаді, головному вході та в рибному павільйоні',
      'Квіткові прилавки, тропічні фрукти, овочі, трави, регіональні продукти, сир та інші місцеві товари',
      'Відділ свіжої риби й морепродуктів, де часто продають тунця та чорну шаблю-рибу, відому тут як espada',
      'Noite do Mercado — жвавий вечір 23 грудня, коли місцеві жителі збираються на ринку та навколишніх вулицях перед Різдвом',
      'Діючий ринок і гарне знайомство з гастрономією, фермерством та рибальськими традиціями Мадейри',
    ],
  },
  practicalTip: {
    en: 'Visit in the morning when the market is at its liveliest and the fish section is most active. Enjoy the flowers and local produce, but check prices before ordering cut fruit or buying souvenirs: stalls aimed at visitors can be more expensive than ordinary local shops.',
    uk: 'Приходьте вранці, коли ринок найжвавіший, а рибний відділ працює найактивніше. Подивіться на квіти й місцеві продукти, але перевіряйте ціни перед тим, як замовляти нарізані фрукти чи купувати сувеніри: прилавки, орієнтовані на туристів, можуть бути дорожчими за звичайні місцеві магазини.',
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
    tags: ['Hiking', 'Viewpoints', 'Lab Travel'],
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
    en: 'Pico do Arieiro is one of Madeira’s highest and most accessible mountain viewpoints. At 1,818 metres above sea level, it is the island’s third-highest peak and looks across the central mountain massif, deep valleys and dramatic volcanic ridges. On clear days, the views can extend towards the north coast, Ponta de São Lourenço and, in exceptional conditions, Porto Santo.',
    uk: 'Pico do Arieiro — одна з найвищих і найдоступніших гірських оглядових точок Madeira. На висоті 1 818 метрів над рівнем моря це третя за висотою вершина острова, звідки відкриваються види на центральний гірський масив, глибокі долини та драматичні вулканічні хребти. У ясні дні звідси можна побачити північне узбережжя, Ponta de São Lourenço, а за виняткової видимості — Porto Santo.',
  },
  history: {
    en: 'Pico do Arieiro first gained strategic and scientific importance rather than being created as a tourist attraction. In 1895, a wooden weather station was built here at about 1,700 metres to collect meteorological data for the national observatory in Lisbon, the Funchal Observatory and regional information services. A masonry station lower on the mountain operated from 1936 to 1996, before it was replaced by the present automatic weather station near the road to Poiso. Over time, road access, parking, a viewpoint, café facilities and the mountain route towards Pico Ruivo made the summit far easier to visit than most of Madeira’s high peaks. Tourism developed because the location combines exceptional views with direct vehicle access and a dramatic starting point for the PR1 – Vereda do Areeiro. The trail was developed in the 1960s as an access and observation route across the central ridge; today it is one of Madeira’s best-known mountain walks.',
    uk: 'Спочатку Pico do Arieiro набув стратегічного та наукового значення, а не був створений як туристична локація. У 1895 році тут, на висоті приблизно 1 700 метрів, збудували дерев’яну метеостанцію для збору даних для національної обсерваторії в Lisbon, Funchal Observatory та регіональних інформаційних служб. Кам’яна метеостанція нижче на горі працювала з 1936 до 1996 року, після чого її замінила сучасна автоматична метеостанція біля дороги на Poiso. Згодом автомобільний доступ, паркування, оглядові майданчики, кафе та гірський маршрут у напрямку Pico Ruivo зробили вершину значно доступнішою, ніж більшість високих гір Madeira. Туризм розвинувся тому, що це місце поєднує виняткові краєвиди з можливістю під’їхати автомобілем майже до вершини та ефектною початковою точкою маршруту PR1 – Vereda do Areeiro. Стежку облаштували у 1960-х роках як маршрут доступу й спостереження через центральний хребет; сьогодні це один із найвідоміших гірських маршрутів Madeira.',
  },
  highlights: {
    en: [
      'At 1,818 metres, Pico do Arieiro is Madeira’s third-highest peak',
      'A mountain weather station was first built here in 1895; meteorological observation remains part of the site’s history',
      'Road access allows visitors to reach one of Madeira’s highest viewpoints without a long hike',
      'Sunrise views, cloud inversions and changing mountain light are the main reasons for its popularity',
      'Miradouro do Ninho da Manta offers striking views into the central valleys and rugged mountain ridges',
      'PR1 – Vereda do Areeiro begins here and links the high mountain landscape towards Pico Ruivo',
      'The summit area includes parking, a café or restaurant, toilets, viewpoints and mountain-service infrastructure',
      'Weather can change from clear sun to fog, rain and strong wind within a short time',
    ],
    uk: [
      'На висоті 1 818 метрів Pico do Arieiro є третьою за висотою вершиною Мадейри',
      'Першу гірську метеостанцію тут збудували в 1895 році; метеорологічні спостереження залишаються важливою частиною історії місця',
      'Автомобільна дорога дозволяє відвідати одну з найвищих оглядових точок Madeira без тривалого підйому пішки',
      'Світанки, інверсії хмар і мінливе гірське світло — головні причини популярності локації',
      'Miradouro do Ninho da Manta відкриває вражаючі види на центральні долини та суворі гірські хребти',
      'Тут починається PR1 – Vereda do Areeiro, що веде через високогірний ландшафт у напрямку Pico Ruivo',
      'На вершині є паркування, кафе або ресторан, туалети, оглядові точки та гірська сервісна інфраструктура',
      'Погода може швидко змінитися від ясного сонця до туману, дощу та сильного вітру',
    ],
  },
  practicalTip: {
    en: 'Check the mountain forecast, live camera and official PR1 trail status before leaving. Arrive early for sunrise, bring warm and windproof layers even in summer, and do not rely on clear weather in Funchal: conditions at Pico do Arieiro can be completely different. If you plan to walk PR1, confirm the current access rules or reservation requirements before travelling.',
    uk: 'Перед виїздом перевірте гірський прогноз, онлайн-камеру та офіційний статус маршруту PR1. Для світанку приїжджайте завчасно, візьміть теплий і вітрозахисний одяг навіть улітку та не орієнтуйтеся лише на ясну погоду у Фуншалі: на Pico do Arieiro умови можуть бути зовсім іншими. Якщо плануєте пройти PR1, заздалегідь перевірте чинні правила доступу або вимоги щодо бронювання.',
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
    en: 'Pico Ruivo is the highest peak in Madeira and the Madeira Archipelago, rising to 1,862 metres above sea level. Located in the central mountain massif, it offers a wide panorama of volcanic ridges, deep valleys and the island’s north and south slopes. Unlike Pico do Arieiro, Pico Ruivo has no road to the summit: every visit requires a hike.',
    uk: 'Pico Ruivo — найвища вершина Madeira та всього архіпелагу Madeira, що піднімається на 1 862 метри над рівнем моря. Вона розташована в центральному гірському масиві й відкриває широкі панорами вулканічних хребтів, глибоких долин та північних і південних схилів острова. На відміну від Pico do Arieiro, до вершини Pico Ruivo немає автомобільної дороги: кожне відвідування потребує пішого маршруту.',
  },
  history: {
    en: 'For centuries, Pico Ruivo was known mainly to shepherds, farmers and people travelling between mountain communities. The summit later became important for surveying, conservation and mountain walking because it stands at the highest point of the island. It did not become a tourist attraction through one single construction project; its popularity grew as marked trails, roads to mountain starting points and visitor infrastructure made the central massif more accessible. The route from Achada do Teixeira, now known as PR1.2 – Vereda do Pico Ruivo, provides the most direct approach. The longer PR1 – Vereda do Areeiro connects Pico do Arieiro, Pico das Torres and Pico Ruivo across the high ridge. The mountain sits within a protected high-altitude landscape of the Central Mountain Massif, where strong wind, fog, heavy rain and rapid temperature changes have shaped both the vegetation and the experience of walking here.',
    uk: 'Протягом століть Pico Ruivo був відомий передусім пастухам, фермерам і людям, які пересувалися між гірськими поселеннями. Згодом вершина набула значення для геодезичних робіт, охорони природи та гірських прогулянок, адже це найвища точка острова. Вона не стала туристичною локацією завдяки одному окремому будівельному проєкту: популярність зростала поступово, коли марковані стежки, дороги до стартових точок і базова інфраструктура зробили центральний гірський масив доступнішим. Маршрут із Achada do Teixeira, відомий як PR1.2 – Vereda do Pico Ruivo, є найпрямішим шляхом до вершини. Довший PR1 – Vereda do Areeiro з’єднує Pico do Arieiro, Pico das Torres і Pico Ruivo через високий хребет. Гора розташована в охоронюваному високогірному ландшафті Central Mountain Massif, де сильний вітер, туман, зливи та швидкі зміни температури сформували і рослинність, і сам характер походів.',
  },
  highlights: {
    en: [
      'At 1,862 metres, the highest peak in Madeira and the Madeira Archipelago',
      'A summit reached only on foot, which gives the visit a more remote mountain character than Pico do Arieiro',
      'PR1.2 – Vereda do Pico Ruivo from Achada do Teixeira, the most direct marked route to the summit',
      'PR1 – Vereda do Areeiro, the dramatic high-ridge route linking Pico do Arieiro, Pico das Torres and Pico Ruivo',
      'Panoramic views over the Central Mountain Massif, north-coast valleys and, in clear conditions, distant islands and the Atlantic',
      'High-altitude heath and mountain vegetation adapted to wind, mist, cold and heavy rain',
      'Casa de Abrigo do Pico Ruivo, a shelter area near the summit where visitors can rest',
      'A true high-mountain experience: fog, cloud inversions and rapidly changing light can transform the landscape within minutes',
    ],
    uk: [
      'На висоті 1 862 метри — найвища вершина Мадейри та архіпелагу Мадейра',
      'До вершини можна дістатися лише пішки, тому вона має більш віддалений гірський характер, ніж Pico do Arieiro',
      'PR1.2 – Vereda do Pico Ruivo з Achada do Teixeira — найпряміший маркований маршрут до вершини',
      'PR1 – Vereda do Areeiro — драматичний високогірний маршрут, що з’єднує Pico do Arieiro, Pico das Torres і Pico Ruivo',
      'Панорами Central Mountain Massif, долин північного узбережжя, а за ясної погоди — далеких островів і Атлантики',
      'Високогірні пустища та гірська рослинність, пристосована до вітру, туману, холоду й сильних дощів',
      'Casa de Abrigo do Pico Ruivo — притулок біля вершини, де можна відпочити',
      'Справжній високогірний досвід: туман, інверсії хмар і мінливе світло можуть повністю змінити пейзаж за лічені хвилини',
    ],
  },
  practicalTip: {
    en: 'Check the official trail status and mountain forecast before travelling. PR1.2 from Achada do Teixeira is the usual shorter approach, but it still involves uphill walking at high altitude. Wear layers, waterproof clothing and shoes with good grip, carry water and food, and do not start PR1 from Pico do Arieiro unless its full current status and access conditions have been confirmed.',
    uk: 'Перед поїздкою перевірте офіційний статус стежок і гірський прогноз. PR1.2 з Achada do Teixeira — звичний коротший шлях, але він все одно передбачає підйом пішки на великій висоті. Одягайтеся шарами, візьміть водонепроникний одяг, взуття з хорошим зчепленням, воду та їжу; не починайте PR1 із Pico do Arieiro, доки не підтвердите повний актуальний статус маршруту та умови доступу.',
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
    tags: ['Beaches', 'Lab Travel'],
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
    en: 'Fajã dos Padres is a small and exceptionally fertile strip of land on Madeira’s south coast, sheltered at the foot of a dramatic cliff beside the Atlantic Ocean. The name means “Fajã of the Priests”, referring to the Jesuits who once owned and cultivated the estate. Its warm, protected microclimate has made it one of the island’s most unusual places for farming, wine and subtropical fruit.',
    uk: 'Fajã dos Padres — невелика й надзвичайно родюча смуга землі на південному узбережжі Мадейри, захищена біля підніжжя вражаючої скелі поруч з Атлантичним океаном. Назва означає «прибережна рівнина священників» і пов’язана з єзуїтами, яким колись належав цей маєток і які його обробляли. Теплий захищений мікроклімат зробив це місце одним із найособливіших на острові для сільського господарства, виноробства та субтропічних фруктів.',
  },
  history: {
    en: 'The history of Fajã dos Padres goes back to the early settlement of Madeira in the 15th century. The estate later belonged to the Society of Jesus for around 150 years, which is why the place became known as “Fajã of the Priests”. The Jesuits helped establish vineyards here, including grapes used for Malmsey, one of Madeira’s historic fortified wines. For generations, the isolated land was reached mainly by boat, while its harvest had to be moved by sea or hauled up the cliffs. Grapes and sugar cane were important historical crops; after the Second World War, bananas became dominant for several decades. The property was restructured in the early 1980s, and the cable car opened in 2003 to provide safe, fast and practical access for people and agricultural produce. It replaced dependence on the sea and made it possible to develop visitor accommodation, a restaurant and a more accessible working farm without building a road through the unstable cliff.',
    uk: 'Історія Fajã dos Padres сягає раннього заселення Мадейри у XV столітті. Пізніше маєток приблизно 150 років належав Ордену Єзуїтів, тому місце й стало відомим як «прибережна рівнина священників». Єзуїти допомогли закласти тут виноградники, зокрема для винограду, з якого виробляли Malmsey — один із традиційних кріплених вин Мадейри. Протягом багатьох поколінь до ізольованої ділянки діставалися переважно човном, а врожай вивозили морем або підіймали вгору по скелях. Історично тут важливими культурами були виноград і цукрова тростина; після Другої світової війни на кілька десятиліть головною культурою стали банани. На початку 1980-х маєток масштабно перебудували, а у 2003 році відкрили канатну дорогу, щоб забезпечити безпечний, швидкий і практичний доступ для людей та сільськогосподарської продукції. Вона усунула залежність від морського сполучення та дала змогу розвивати проживання для гостей, ресторан і доступнішу діючу ферму без прокладання дороги через нестабільну скелю.',
  },
  highlights: {
    en: [
      'A secluded coastal estate beneath a cliff of around 300 metres, reached by cable car or boat',
      'A warm microclimate that allows subtropical crops to grow close to the Atlantic',
      'Historic vineyards connected with Malmsey, one of Madeira’s traditional fortified wines',
      'Bananas, grapes, mangoes, avocados, guavas, papayas, passion fruit, figs, pomegranates and seasonal produce',
      'The cable car, opened in 2003, carries both visitors and farm products down and up the cliff',
      'A roughly four-minute panoramic ride with views over the south coast, vineyards and cultivated terraces',
      'A small beach and bay, restaurant, walking paths and accommodation among the gardens',
      'An example of how Madeira’s isolated coastal fajãs were shaped by farming, the sea and difficult access',
    ],
    uk: [
      'Відокремлений прибережний маєток під скелею висотою приблизно 300 метрів, до якого можна дістатися канатною дорогою або човном',
      'Теплий мікроклімат, що дозволяє вирощувати субтропічні культури поруч з Атлантичним океаном',
      'Історичні виноградники, пов’язані з Malmsey — одним із традиційних кріплених вин Мадейри',
      'Банани, виноград, манго, авокадо, гуави, папая, маракуя, інжир, гранати та сезонні місцеві продукти',
      'Канатна дорога, відкрита у 2003 році, перевозить і відвідувачів, і продукцію ферми вниз та вгору по скелі',
      'Панорамна поїздка тривалістю приблизно чотири хвилини з видами на південне узбережжя, виноградники й оброблені тераси',
      'Невеликий пляж і бухта, ресторан, прогулянкові доріжки та проживання серед садів',
      'Приклад того, як ізольовані прибережні fajãs Madeira формувалися під впливом сільського господарства, моря та складного доступу',
    ],
  },
  practicalTip: {
    en: 'Check the cable-car timetable before travelling, especially in winter or in strong wind. Allow time to walk through the gardens and have lunch by the sea. The cable car is the normal access route; it is also used to transport farm produce, so treat it as part of the working life of Fajã dos Padres, not only as an attraction.',
    uk: 'Перед поїздкою перевірте розклад канатної дороги, особливо взимку або за сильного вітру. Виділіть час на прогулянку садами та обід біля моря. Канатна дорога — основний спосіб дістатися сюди; нею також перевозять фермерську продукцію, тож це частина повсякденного життя Fajã dos Padres, а не лише туристична атракція.',
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
    tags: ['Viewpoints', 'Lab Travel'],
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
    tags: ['Levada walks', 'Hiking', 'Lab Travel'],
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
    en: 'Levada Nova and Levada do Moinho form one of the most interesting walks in the Ponta do Sol area because they show two generations of Madeira’s irrigation system. The route follows an older levada lower on the hillside and a newer channel higher above it, passing cultivated terraces, small farms, waterfalls and open views towards the south coast.',
    uk: 'Levada Nova та Levada do Moinho утворюють один із найцікавіших маршрутів у районі Ponta do Sol, адже тут можна побачити два покоління іригаційної системи Мадейри. Стежка проходить уздовж старішої левади нижче на схилі та новішого каналу вище, повз оброблені тераси, невеликі ферми, водоспади й відкриті види на південне узбережжя.',
  },
  history: {
    en: 'Levadas are narrow, gravity-fed channels built to carry water from the wetter mountains and north-west of Madeira to farmland and settlements in drier areas. The first systems began to appear in the early centuries of Portuguese settlement, and by the second half of the 15th century levada water was already vital to sugar-cane production. Over time, the network supported vineyards, bananas, vegetables, fruit orchards, domestic water use and, in some places, water-powered mills. Building channels along steep cliffs required difficult manual work, including carved ledges, aqueducts and tunnels. In Ponta do Sol, Levada do Moinho is the older channel. It was built between the 1920s and 1930s and takes its name from the water mills that it supplied; the water was used both for irrigation and for grinding grain. Levada Nova was constructed later to bring more irrigation water to farmland between Ribeira da Caixa and Ribeira Brava. It opened in 1962 and runs higher on the slope, which is why hikers can combine the two channels into a varied circular walk.',
    uk: 'Левади — це вузькі канали, де вода рухається самопливом; їх будували, щоб переносити воду з вологіших гір і північного заходу Madeira до сільськогосподарських земель та поселень у сухіших районах. Перші системи почали з’являтися в ранні століття португальського заселення, а вже в другій половині XV століття вода з левад була життєво важливою для вирощування цукрової тростини. З часом мережа підтримувала виноградники, банани, овочі, фруктові сади, побутове водопостачання, а подекуди — водяні млини. Будівництво каналів уздовж крутих скель вимагало важкої ручної праці: доводилося видовбувати полиці в породі, споруджувати акведуки та прокладати тунелі. У Ponta do Sol старішим каналом є Levada do Moinho. Її будували в 1920–1930-х роках, а назву вона отримала від водяних млинів, які живила водою; її використовували і для зрошення, і для помелу зерна. Levada Nova збудували пізніше, щоб подати більше води для зрошення земель між Ribeira da Caixa та Ribeira Brava. Її відкрили в 1962 році; вона проходить вище по схилу, тому туристи можуть поєднати обидва канали в різноманітний кільцевий маршрут.',
  },
  highlights: {
    en: [
      'Two parallel levadas that reveal different stages of Madeira’s water-management history',
      'Levada do Moinho, built in the 1920s and 1930s, named after the water mills supplied by its flow',
      'Levada Nova, opened in 1962 to increase irrigation for farmland between Ribeira da Caixa and Ribeira Brava',
      'A close view of cultivated terraces, vegetable plots, banana plants, vineyards and rural life around Ponta do Sol',
      'A waterfall section where the path passes directly behind falling water',
      'Old mill-related features that recall when flowing water powered local grain grinding',
      'A loop that combines the older lower channel with the newer upper levada',
      'A practical example of why levadas are both engineering works and the foundation of Madeira’s agricultural landscape',
    ],
    uk: [
      'Дві паралельні левади, які показують різні етапи історії управління водними ресурсами Мадейри',
      'Levada do Moinho, збудована у 1920–1930-х роках і названа на честь водяних млинів, що працювали завдяки її воді',
      'Levada Nova, відкрита в 1962 році для збільшення зрошення земель між Ribeira da Caixa та Ribeira Brava',
      'Близький погляд на оброблені тераси, городи, бананові плантації, виноградники й сільське життя навколо Ponta do Sol',
      'Ділянка з водоспадом, де стежка проходить просто за потоком води',
      'Сліди млинарської інфраструктури, які нагадують про часи, коли поточна вода приводила в рух місцеві млини',
      'Кільцевий маршрут, що поєднує старіший нижній канал і новішу верхню леваду',
      'Наочний приклад того, чому левади — це одночасно інженерні споруди та основа сільськогосподарського ландшафту Madeira',
    ],
  },
  practicalTip: {
    en: 'Start near Igreja da Lombada da Ponta do Sol and check the current trail condition before setting out. The route can be wet and slippery near the waterfall, while some sections are narrow and exposed. Wear shoes with good grip, take a light waterproof layer and torch, and do not block the levada channel: it remains part of an active water-supply system.',
    uk: 'Починайте біля Igreja da Lombada da Ponta do Sol і перед виходом перевіряйте актуальний стан маршруту. Біля водоспаду може бути мокро й слизько, а деякі ділянки вузькі та відкриті. Взувайтеся у взуття з хорошим зчепленням, візьміть легкий водонепроникний шар і ліхтарик; не перекривайте канал левади, адже він досі є частиною діючої системи подачі води.',
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
    tags: ['Beaches', 'Lab Travel'],
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
    en: 'Calheta is a sunny coastal town on Madeira’s south-west coast, known for its marina, sugar-cane heritage and one of the island’s best-known places to swim. Calheta Beach is unusual in Madeira: instead of the typical volcanic rock or pebble shoreline, it has golden sand and two protected bays designed for calmer water.',
    uk: 'Calheta — сонячне прибережне містечко на південному заході Мадейри, відоме своєю мариною, спадщиною вирощування цукрової тростини та одним із найвідоміших місць для купання на острові. Calheta Beach незвичайний для Мадейри: замість типового вулканічного або галькового берега тут золотистий пісок і дві захищені бухти, створені для спокійнішої води.',
  },
  history: {
    en: 'Calheta was one of the early settlement areas of Madeira and became a town on 1 June 1502 by royal decree of King Manuel I. Its sheltered coastal location and fertile slopes supported farming, fishing and trade. Sugar cane was especially important: in the early centuries of Portuguese settlement, sugar was Madeira’s “white gold”, and Calheta’s valleys and water supply made cane cultivation possible. The local sugar industry still survives in Engenho da Calheta, a factory established in 1901 that produces sugar-cane honey and aguardente, the regional cane spirit. Calheta Beach was created much later as part of the town’s modern coastal and tourism development. Inaugurated in 2004, it became Madeira’s first artificial beach, using golden sand imported from Morocco. Two breakwaters create protected swimming areas, offering a calmer alternative to Madeira’s open Atlantic beaches.',
    uk: 'Кальєта була однією з ранніх зон заселення Мадейри та отримала статус містечка 1 червня 1502 року королівським указом Короля Мануеля I. Захищене прибережне розташування й родючі схили сприяли розвитку сільського господарства, рибальства та торгівлі. Особливо важливою була цукрова тростина: у перші століття португальського заселення цукор називали «білим золотом» Мадейри, а долини Кальєти та доступ до води робили вирощування тростини можливим. Місцева цукрова промисловість збереглася в Engenho da Calheta — фабриці, заснованій у 1901 році, де виробляють цукровий сироп із тростини та aguardente, традиційний міцний напій із цукрової тростини. Calheta Beach створили значно пізніше як частину сучасного розвитку узбережжя та туризму. Відкритий у 2004 році, він став першим штучним пляжем Мадейри: для нього використали золотистий пісок, привезений із Марокко. Два хвилерізи формують захищені зони для плавання та пропонують спокійнішу альтернативу відкритим атлантичним пляжам Мадейри.',
  },
  highlights: {
    en: [
      'Calheta was officially established as a town on 1 June 1502',
      'A south-west coast location known for warmer, sunnier conditions than many parts of Madeira',
      'Calheta Beach, Madeira’s first artificial beach, inaugurated in 2004',
      'Golden sand imported from Morocco rather than naturally occurring local beach sand',
      'Two breakwaters creating protected bays for calmer swimming',
      'About 100 metres of beach beside the Recreational Harbour and marina',
      'Facilities for swimming, families, sunbathing, cafés and watersports such as kayaking and windsurfing',
      'Engenho da Calheta, a historic sugar-cane factory where cane honey and aguardente are still produced',
    ],
    uk: [
      'Кальєта офіційно отримала статус містечка 1 червня 1502 року',
      'Південно-західне узбережжя, відоме теплішими й сонячнішими умовами, ніж у багатьох частинах Мадейри',
      'Calheta Beach — перший штучний пляж Мадейри, відкритий у 2004 році',
      'Золотистий пісок, привезений із Марокко, а не природний місцевий пляжний пісок',
      'Два хвилерізи, що створюють захищені бухти для спокійнішого купання',
      'Приблизно 100 метрів пляжу поруч із Recreational Harbour та мариною',
      'Умови для купання, сімейного відпочинку, засмагання, кафе й водних видів спорту, зокрема каякінгу та віндсерфінгу',
      'Engenho da Calheta — історична фабрика цукрової тростини, де й досі виробляють цукровий сироп і aguardente',
    ],
  },
  practicalTip: {
    en: 'Calheta Beach is a good choice for families and for visitors who prefer calmer water, but it can be busy on sunny weekends and holidays. Arrive earlier for easier parking and more space. Even inside the breakwaters, check flags and local sea conditions before swimming, especially when swell is forecast.',
    uk: 'Calheta Beach — вдалий вибір для сімей і тих, хто віддає перевагу спокійнішій воді, але в сонячні вихідні та свята тут може бути багато людей. Приїжджайте раніше, щоб легше знайти паркування й мати більше місця. Навіть усередині хвилерізів перевіряйте прапори та місцеві умови моря перед купанням, особливо коли прогнозують хвилювання.',
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
    tags: ['Hiking', 'Lab Travel'],
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
    en: 'Ponta de São Lourenço is Madeira’s easternmost peninsula: a long, wind-shaped landscape of volcanic rock, dry grassland and steep cliffs above the Atlantic. It looks very different from the lush, green interior of the island and is one of Madeira’s most memorable coastal walks. The peninsula was among the first parts of Madeira seen by Portuguese navigators in 1419 and was named after São Lourenço, the ship associated with the island’s discovery.',
    uk: 'Ponta de São Lourenço — найсхідніший півострів Мадейри: витягнутий, сформований вітром ландшафт із вулканічних порід, сухих трав’янистих схилів і крутих скель над Атлантикою. Він зовсім не схожий на пишний зелений центр острова та є одним із найяскравіших прибережних маршрутів Мадейри. Півострів був серед перших частин Madeira, які побачили португальські мореплавці у 1419 році, а назву отримав на честь São Lourenço — корабля, пов’язаного з відкриттям острова.',
  },
  history: {
    en: 'Ponta de São Lourenço has long been shaped by its exposed location, scarce freshwater and difficult terrain. Unlike the wetter mountains of Madeira, its dry climate and strong winds support a distinctive coastal ecosystem rather than dense forest. The peninsula was classified as a protected nature reserve in 1982 to safeguard its geology, plants, seabirds and coastal habitats. The modern walking route, PR8 – Vereda da Ponta de São Lourenço, begins at Baía d’Abra and follows the eastern peninsula towards Cais do Sardinha. It is about 3 km each way to Casa do Sardinha, with a further uphill section towards Pico do Furado for broader views. Casa do Sardinha has its own story: Manuel Bettencourt Sardinha built Cais do Abra in 1905 and then had the house constructed as a private refuge and holiday place. His family owned it until 1996, when it was sold to the Autonomous Region of Madeira on the condition that it would serve nature conservation. It was used as an observation and surveillance post until 2009, renovated in 2010 and reopened as the Casa do Sardinha Reception Centre. A bar attached to the centre began operating in 2019; today, the nearby Casa do Sardinha Sea Spot Cafe continues the historic name and provides a welcome stop in this remote setting.',
    uk: 'Ponta de São Lourenço протягом століть формувався під впливом відкритого розташування, нестачі прісної води та складного рельєфу. На відміну від вологих гір Мадейри, сухий клімат і сильні вітри підтримують тут особливу прибережну екосистему, а не густий ліс. У 1982 році півострів отримав статус охоронюваного природного резервату, щоб захистити його геологію, рослини, морських птахів і прибережні середовища існування. Сучасний пішохідний маршрут PR8 – Vereda da Ponta de São Lourenço починається в Baía d’Abra та проходить східним півостровом у напрямку Cais do Sardinha. До Casa do Sardinha приблизно 3 км в один бік, а далі є додатковий підйом до Pico do Furado з ширшими панорамами. Casa do Sardinha має власну історію: Manuel Bettencourt Sardinha збудував Cais do Abra у 1905 році, а потім звів будинок як приватний притулок і місце для відпочинку. Його родина володіла ним до 1996 року, коли будинок продали Автономному регіону Madeira за умови, що він служитиме охороні природи. До 2009 року споруду використовували як пункт спостереження та нагляду, у 2010 році її реконструювали й відкрили як Casa do Sardinha Reception Centre. У 2019 році при центрі почав працювати бар; сьогодні розташований поруч Casa do Sardinha Sea Spot Cafe зберігає історичну назву та є важливою зупинкою в цій віддаленій місцевості.',
  },
  highlights: {
    en: [
      'Madeira’s easternmost peninsula, protected as a nature reserve since 1982',
      'PR8 – Vereda da Ponta de São Lourenço: around 3 km each way from Baía d’Abra to Casa do Sardinha',
      'Views across both the north and south sides of Madeira, with the Desertas Islands often visible in clear weather',
      'Dry volcanic landscape, red and ochre cliffs, basalt formations and grassland shaped by strong wind',
      'Endemic coastal plants and seabirds adapted to a far drier environment than the rest of Madeira',
      'Cais do Sardinha, a small sheltered bay and pier near the end of the main walking route',
      'Casa do Sardinha, built after 1905 as a private retreat, later transformed into a nature-reception centre in 2010',
      'Casa do Sardinha Sea Spot Cafe, a remote café reached by the PR8 trail or by boat',
      'Pico do Furado, an optional uphill viewpoint above Casa do Sardinha with wider panoramas',
    ],
    uk: [
      'Найсхідніший півострів Madeira, який перебуває під охороною як природний резерват із 1982 року',
      'PR8 – Vereda da Ponta de São Lourenço: приблизно 3 км в один бік від Baía d’Abra до Casa do Sardinha',
      'Види одночасно на північну й південну сторони Madeira; у ясну погоду часто видно Desertas Islands',
      'Сухий вулканічний ландшафт, червоні та охристі скелі, базальтові утворення й трав’янисті схили, сформовані сильним вітром',
      'Ендемічні прибережні рослини та морські птахи, пристосовані до значно сухіших умов, ніж на більшій частині Madeira',
      'Cais do Sardinha — невелика захищена бухта й причал біля завершення основної частини маршруту',
      'Casa do Sardinha, збудований після 1905 року як приватний притулок, а згодом перетворений у 2010 році на природоохоронний інформаційний центр',
      'Casa do Sardinha Sea Spot Cafe — віддалене кафе, до якого можна дійти PR8 або прибути човном',
      'Pico do Furado — додаткова оглядова точка з підйомом над Casa do Sardinha та ширшими панорамами',
    ],
  },
  practicalTip: {
    en: 'Start early because there is little shade and the wind can be strong. Take more water than you expect to need, sun protection, a windproof layer and shoes with good grip. Check the official trail status and access requirements before travelling, and do not rely on the café being open: carry food and water for the full return walk.',
    uk: 'Вирушайте рано, адже тіні на маршруті майже немає, а вітер може бути сильним. Візьміть більше води, ніж плануєте випити, сонцезахист, вітрозахисний одяг і взуття з хорошим зчепленням. Перед поїздкою перевірте офіційний статус маршруту та вимоги щодо доступу; не розраховуйте лише на відкрите кафе — майте їжу й воду на весь шлях туди й назад.',
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
    tags: ['Beaches', 'Lab Travel'],
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
    en: 'Prainha do Caniçal is a small natural-sand beach on Madeira’s dry east coast, between Caniçal and Ponta de São Lourenço. It is one of the island’s rare permanent natural sandy beaches, standing out from Madeira’s usual pebble and volcanic-rock shores. Its coppery, dark sand, clear Atlantic water and dry yellow-brown cliffs create a landscape that feels very different from the green central mountains.',
    uk: 'Prainha do Caniçal — невеликий пляж із природним піском на сухому східному узбережжі Мадейри, між Caniçal та Ponta de São Lourenço. Це один із рідкісних постійних природних піщаних пляжів острова, що вирізняється на тлі типових для Мадейри галькових і вулканічно-кам’янистих берегів. Мідно-темний пісок, прозора атлантична вода та сухі жовто-коричневі скелі створюють ландшафт, зовсім не схожий на зелені центральні гори.',
  },
  history: {
    en: 'Prainha do Caniçal does not have a single construction or opening date because the beach is a natural geological feature, not an artificial beach. Madeira was formed by volcanic activity over millions of years, and erosion by rain, wind and the Atlantic gradually shaped this small sheltered bay. The beach’s dark, copper-coloured sand comes from volcanic material broken down by the sea. Nearby are the Dunas da Piedade, fossil-rich calcareous dunes of recognised geomorphological interest. These formations help explain why this short stretch of coast is scientifically unusual: volcanic material, sedimentary deposits and a dry eastern climate meet in one small area. The beach later received practical visitor facilities, including access steps, parking, changing rooms, showers and seasonal food service, but the bay itself remains a natural beach rather than a built attraction.',
    uk: 'Prainha do Caniçal не має однієї дати будівництва чи відкриття, оскільки це природний геологічний об’єкт, а не штучний пляж. Мадейра сформувалася внаслідок вулканічної активності протягом мільйонів років, а дощ, вітер і Атлантичний океан поступово створили цю невелику захищену бухту. Темний пісок із мідним відтінком має вулканічне походження: море подрібнювало вулканічнІ породи на дрІбнІ частинки. Поруч розташованІ Dunas da Piedade — вапняковІ дюни з викопними рештками, що мають визнану геоморфологІчну цІннІсть. ЦІ утворення пояснюють, чому цей короткий вІдрIзок узбережжя геологIчно незвичайний: тут в одному мIсцI поєднуються вулканIчний матерIал, осадовI вIдклади та сухий схIдний клIмат. ПІзнІше на пляжI облаштували зручностI для вIдвIдувачIв — сходи для спуску, паркування, роздягальнI, душI та сезоннI заклади з їжею, але сама бухта залишається природним пляжем, а не створеним людиною атракцІєю.',
  },
  highlights: {
    en: [
      'One of Madeira’s few permanent natural-sand beaches',
      'Coppery, dark volcanic sand rather than imported sand or pebbles',
      'A small sheltered bay on the dry east coast, near Ponta de São Lourenço',
      'Dunas da Piedade nearby: fossil-rich calcareous dunes with geological interest',
      'A landscape of yellow, brown and orange cliffs that contrasts with Madeira’s greener areas',
      'Clear water that can be attractive for swimming and snorkelling when the sea is calm',
      'Parking above the bay, steps down to the beach, toilets, showers and seasonal food service',
      'A good stop before or after visiting Ponta de São Lourenço or Caniçal',
    ],
    uk: [
      'Один із небагатьох постійних природних піщаних пляжів Мадейри',
      'Мідно-темний вулканічний пісок, а не привезений пісок чи галька',
      'Невелика захищена бухта на сухому східному узбережжі, поруч із Ponta de São Lourenço',
      'Поруч Dunas da Piedade — вапнякові дюни з викопними рештками та геологічною цінністю',
      'Ландшафт із жовтими, коричневими й помаранчевими скелями, що контрастує з більш зеленими районами Мадейри',
      'Прозора вода, придатна для плавання та снорклінгу, коли море спокійне',
      'Паркування над бухтою, сходи до пляжу, туалети, душі та сезонні заклади з їжею',
      'Гарна зупинка до або після відвідування Ponta de São Lourenço чи Caniçal',
    ],
  },
  practicalTip: {
    en: 'The beach is small, so arrive early on warm weekends. The path down includes steps, and the shoreline can have waves or a strong current when the Atlantic is rough. Bring sun protection because the eastern landscape has little natural shade, and always check sea conditions before entering the water.',
    uk: 'Пляж невеликий, тому в теплі вихідні приїжджайте раніше. Спуск включає сходи, а біля берега можуть бути хвилі або сильна течія, коли Атлантика неспокійна. Візьміть сонцезахист, адже на сухому східному узбережжі мало природної тіні, і завжди перевіряйте стан моря перед купанням.',
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
    tags: ['Hiking', 'Lab Travel'],
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
    en: 'Fanal Forest is one of Madeira’s most distinctive natural places: a high, misty plateau with twisted, ancient laurel trees growing in open grassland. It lies in the north-west of the island, near the Paul da Serra plateau and within the Laurissilva Forest, a UNESCO World Heritage Site. Fog often moves through the trees, giving Fanal its famous quiet and almost prehistoric atmosphere.',
    uk: 'Fanal Forest — одне з найособливіших природних місць Мадейри: високогірне, часто туманне плато з викривленими прадавніми лавровими деревами, що ростуть серед відкритих лугів. Воно розташоване на північному заході острова, біля плато Paul da Serra, у межах Laurissilva Forest — об’єкта Світової спадщини UNESCO. Туман часто огортає дерева, створюючи відому тиху й майже доісторичну атмосферу Fanal.',
  },
  history: {
    en: 'Fanal is not a planted park or an artificial forest. It is a surviving part of Madeira’s native Laurissilva, a humid subtropical laurel forest whose origins date back around 20 million years to the Tertiary period. Before Portuguese settlement in the 15th century, Laurissilva covered much of Madeira. Large areas were later cleared for timber, charcoal, farming and sugar-cane cultivation, but difficult mountain terrain helped some original forest survive. Today Laurissilva covers around 15,000 hectares, roughly 20 percent of Madeira, mainly in the higher and wetter northern areas. UNESCO listed Laurissilva of Madeira as a World Heritage Site in 1999 because it is the largest surviving area of this type of primary laurel forest. Fanal is especially known for its centuries-old Til trees, scientifically called Ocotea foetens. Their low, twisted branches reflect years of exposure to wind, mist and wet soil. Exact ages are not known for each tree, but some trees in the protected Laurissilva are thought to be more than 800 years old, and Fanal’s oldest Til trees pre-date the Portuguese settlement of Madeira.',
    uk: 'Fanal — не посаджений парк і не штучний ліс. Це збережена частина корінного Laurissilva Madeira — вологого субтропічного лаврового лісу, походження якого сягає приблизно 20 мільйонів років, до третинного періоду. До португальського заселення у XV столітті Laurissilva покривав більшу частину Мадейри. Пізніше великі площі вирубували заради деревини, деревного вугілля, сільського господарства та вирощування цукрової тростини, але складний гірський рельєф допоміг зберегти частину первісного лісу. Сьогодні Laurissilva займає близько 15 000 гектарів, тобто приблизно 20% Madeira, переважно у вищих і вологіших районах півночі. UNESCO включила Laurissilva of Madeira до списку Світової спадщини у 1999 році, оскільки це найбільша збережена територія такого типу первинного лаврового лісу. Fanal особливо відомий віковими деревами Til, наукова назва яких — Ocotea foetens. Їхні низькі викривлені гілки — результат багатьох років дії вітру, туману та вологого ґрунту. Точний вік кожного дерева невідомий, але деяким деревам у межах охоронюваного Laurissilva, імовірно, понад 800 років, а найстаріші Til у Fanal росли ще до португальського заселення Мадейри.',
  },
  highlights: {
    en: [
      'Part of the Laurissilva Forest, a UNESCO World Heritage Site since 1999',
      'A relict subtropical laurel forest ecosystem with origins around 20 million years old',
      'Centuries-old Til trees, Ocotea foetens, with wind-shaped trunks and low twisting branches',
      'Some old Laurissilva trees may be more than 800 years old; the exact age of individual Fanal trees is not known',
      'A landscape shaped by frequent fog, high humidity, wind and open mountain pasture',
      'Laurissilva still covers around 15,000 hectares, about 20 percent of Madeira',
      'One of the world’s best-preserved remaining examples of laurel forest, a vegetation type now limited mainly to Madeira, the Azores and the Canary Islands',
      'Easy access to the open forest area, plus nearby walking routes such as PR13 – Vereda do Fanal and PR14 – Levada dos Cedros',
    ],
    uk: [
      'Частина Laurissilva Forest, об’єкта Світової спадщини UNESCO з 1999 року',
      'Реліктова екосистема субтропічного лаврового лісу, походження якої сягає приблизно 20 мільйонів років',
      'Вікові дерева Til, Ocotea foetens, зі стовбурами, сформованими вітром, і низькими викривленими гілками',
      'Деяким старим деревам Laurissilva може бути понад 800 років; точний вік окремих дерев Fanal невідомий',
      'Ландшафт, сформований частими туманами, високою вологістю, вітром і відкритими гірськими пасовищами',
      'Laurissilva і досі займає близько 15 000 гектарів, або приблизно 20% Madeira',
      'Один із найкраще збережених прикладів лаврового лісу у світі — типу рослинності, що нині обмежений переважно Madeira, Azores та Canary Islands',
      'Легкий доступ до відкритої лісової зони, а також близькі маршрути PR13 – Vereda do Fanal і PR14 – Levada dos Cedros',
    ],
  },
  practicalTip: {
    en: 'Visit when fog is present if you want Fanal’s most atmospheric look, but expect cold wind, wet grass and low visibility. Bring waterproof clothing, warm layers and shoes that can handle mud. Stay on established paths, do not climb or hang from the ancient trees, and avoid drone use or loud behaviour in this protected habitat.',
    uk: 'Відвідуйте Fanal у туманну погоду, якщо хочете побачити його найатмосфернішим, але будьте готові до холодного вітру, мокрої трави та низької видимості. Візьміть водонепроникний одяг, теплі шари та взуття, придатне для багнюки. Тримайтеся облаштованих стежок, не залазьте на вікові дерева й не висіть на їхніх гілках, а також уникайте дронів і гучної поведінки в цьому охоронюваному середовищі.',
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
    tags: ['Beaches', 'Lab Travel'],
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
    en: 'Praia do Porto do Seixal, also known as Seixal Beach or Praia do Cais do Seixal, is one of Madeira’s most striking natural beaches. It sits on the north coast beneath steep green mountains and is known for fine black sand, clear Atlantic water and a small waterfall that often runs down the cliffs behind the beach.',
    uk: 'Praia do Porto do Seixal, також відомий як Seixal Beach або Praia do Cais do Seixal, — один із найефектніших природних пляжів Madeira. Він розташований на північному узбережжі під крутими зеленими горами та відомий дрібним чорним піском, прозорою атлантичною водою й невеликим водоспадом, який часто спускається зі скель позаду пляжу.',
  },
  history: {
    en: 'The black sand at Praia do Porto do Seixal is a direct result of Madeira’s volcanic origin. The island was created by volcanic eruptions over millions of years, leaving basaltic rock along much of the coast. Rain, landslides, waves and ocean currents gradually break basalt into small grains; because basalt is rich in dark minerals, the sand appears black. The beach itself is natural, but the area beside the Port of Seixal has been improved over recent decades with access, a promenade, parking and basic visitor facilities. This improved access, together with the opening of modern north-coast roads and the rise of travel photography and social media in the 2010s and 2020s, made Seixal far more visible to visitors. There is no single official date when the beach “became popular”: it has long been used by local residents, while its wider international popularity grew gradually as the north coast became easier to reach and images of its black sand, waterfalls and green cliffs spread online.',
    uk: 'Чорний пісок Praia do Porto do Seixal — прямий наслідок вулканічного походження Madeira. Острів сформувався внаслідок вулканічних вивержень протягом мільйонів років, залишивши базальтові породи вздовж значної частини узбережжя. Дощі, зсуви, хвилі й океанські течії поступово руйнують базальт на дрібні зерна; оскільки базальт багатий на темні мінерали, пісок виглядає чорним. Сам пляж природний, але територію поруч із Port of Seixal протягом останніх десятиліть облаштували: з’явилися зручний доступ, набережна, паркування та базові зручності для відвідувачів. Краща доступність, відкриття сучасних доріг північного узбережжя, розвиток туристичної фотографії та соціальних мереж у 2010–2020-х роках зробили Seixal значно помітнішим для гостей острова. Немає однієї офіційної дати, коли пляж «став популярним»: його давно використовують місцеві жителі, а широка міжнародна популярність поступово зросла разом із легшим доступом до північного узбережжя та поширенням в інтернеті фото чорного піску, водоспадів і зелених скель.',
  },
  highlights: {
    en: [
      'A natural beach of fine black sand formed from eroded basaltic volcanic rock',
      'One of the most photogenic contrasts on Madeira: dark sand, turquoise water and steep green mountains',
      'A small waterfall can often be seen on the cliffs behind the beach after rain',
      'Also known as Seixal Beach and Praia do Cais do Seixal',
      'Located beside Port of Seixal, with access to the village promenade and nearby natural swimming pools',
      'The village of Seixal grew around farming, fishing and a small coastal harbour, while the fertile north-coast slopes support vineyards, vegetables and fruit',
      'The northern location receives more rain than the south coast, which helps create the dense green landscape around the beach',
      'The beach’s wider popularity grew gradually in the 2010s and 2020s as north-coast access improved and images spread through travel media and social platforms',
    ],
    uk: [
      'Природний пляж із дрібним чорним піском, утвореним із зруйнованих базальтових вулканічних порід',
      'Один із найфотогенічніших контрастів Madeira: темний пісок, бірюзова вода та круті зелені гори',
      'Після дощу на скелях позаду пляжу часто можна побачити невеликий водоспад',
      'Також відомий як Seixal Beach і Praia do Cais do Seixal',
      'Розташований поруч із Port of Seixal, зі зручним виходом до набережної селища та близьких природних басейнів',
      'Селище Seixal розвивалося завдяки сільському господарству, рибальству та невеликій прибережній гавані, а на родючих схилах північного узбережжя вирощують виноград, овочі та фрукти',
      'Північне розташування приносить більше опадів, ніж південне узбережжя, що допомагає створювати густий зелений ландшафт навколо пляжу',
      'Широка популярність пляжу поступово зросла у 2010–2020-х роках завдяки покращенню доступу до північного узбережжя та поширенню зображень у туристичних медіа й соціальних мережах',
    ],
  },
  practicalTip: {
    en: 'Visit early in the day, especially in summer, because parking near the beach is limited. The north coast can be cooler and cloudier than Funchal, and the Atlantic can change quickly. Check the sea conditions before swimming, do not enter rough water, and remember that the dark sand becomes very hot in strong sun.',
    uk: 'Приїжджайте раніше, особливо влітку, оскільки паркування біля пляжу обмежене. Північне узбережжя може бути прохолоднішим і хмарнішим, ніж Funchal, а стан Атлантики швидко змінюється. Перевіряйте умови моря перед купанням, не заходьте у воду під час сильних хвиль і пам’ятайте, що темний пісок сильно нагрівається на яскравому сонці.',
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
    tags: ['Beaches', 'Lab Travel'],
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
    en: 'Porto Moniz Natural Pools are Madeira’s most famous lava pools. On the rugged north-west coast, black basalt walls surround clear Atlantic seawater, creating a dramatic place to swim beside the open ocean. The pools are the defining landmark of Porto Moniz and one of the island’s most popular stops.',
    uk: 'Porto Moniz Natural Pools — найвідоміші лавові басейни Мадейри. На суворому північно-західному узбережжі чорні базальтові стіни оточують прозору атлантичну воду, створюючи ефектне місце для купання поруч із відкритим океаном. Басейни є головною візитівкою Porto Moniz та однією з найпопулярніших локацій острова.',
  },
  history: {
    en: 'Porto Moniz Natural Pools were shaped over thousands of years by Madeira’s volcanic landscape and the Atlantic Ocean. When lava reached the coast, it cooled into hard basalt. Waves, salt water and erosion then carved hollows, channels and uneven rock walls, creating pools that naturally fill and refresh with seawater. Local residents used this volcanic shoreline long before Porto Moniz became a well-known visitor destination. During the twentieth century, improved roads made the isolated north-west easier to reach, and the town gradually developed bathing infrastructure around part of the pools. Today, the managed complex includes changing rooms, showers, a solarium, a children’s pool, a playground, a bar, first-aid facilities, parking and access for visitors with reduced mobility. Porto Moniz itself was one of Madeira’s early northern settlements. Its parish was established in 1574, and it became a municipality on 31 October 1835 during the reign of Queen Maria II. For generations, local life depended on livestock, grain, timber, vineyards, potatoes and fishing. Today, tourism, hospitality and services are important alongside agriculture and fishing, while the lava pools remain the town’s best-known landmark.',
    uk: 'Porto Moniz Natural Pools формувалися протягом тисячоліть під впливом вулканічного ландшафту Мадейри та Атлантичного океану. Коли лава досягала узбережжя, вона охолоджувалася й перетворювалася на твердий базальт. Хвилі, солона вода та ерозія поступово створили заглиблення, канали й нерівні кам’яні краї, утворивши басейни, які наповнюються та оновлюються морською водою. Місцеві жителі користувалися цим вулканічним узбережжям задовго до того, як Porto Moniz став відомою туристичною локацією. Протягом XX століття покращення доріг зробило ізольований північний захід доступнішим, а містечко поступово розвинуло інфраструктуру для купання навколо частини басейнів. Сьогодні облаштований комплекс має роздягальні, душі, солярій, дитячий басейн, дитячий майданчик, бар, пункт першої допомоги, паркування та доступ для відвідувачів з обмеженою мобільністю. Сам Porto Moniz був одним із ранніх поселень півночі Мадейри. Його парафію заснували у 1574 році, а 31 жовтня 1835 року він став муніципалітетом за правління Королеви Марíї II. Протягом поколінь мíсцеве життя залежало вíд тваринництва, зернових, деревини, виноградникív, картоплí та рибальства. Сьогоднí поряд із с³льським господарством і рибальством важливими є туризм, гостинн³сть та сфера послуг, а лавов³ басейни залишаються найв³дом³шою в³зит³вкою м³стечка.',
  },
  highlights: {
    en: [
      'Lava pools shaped over thousands of years by Atlantic waves, salt water and erosion',
      'Clear seawater enters from the ocean and is constantly renewed',
      'Black basalt walls, lava channels and Atlantic waves surrounding the swimming area',
      'A managed bathing complex with a solarium, changing rooms, showers, a children’s pool, playground, bar, first-aid point and parking',
      'Accessibility facilities for visitors with reduced mobility',
      'Piscinas Naturais Velhas nearby: a more rugged and less formal lava-pool experience',
      'Ilhéu Mole and the open Atlantic create a dramatic setting beside the pools',
      'The pools are the best-known attraction on the north-west coast of Madeira',
      'Conditions depend on the sea: strong north-coast swell can affect access and swimming safety',
    ],
    uk: [
      'Лавові басейни, сформовані протягом тисячоліть атлантичними хвилями, солоною водою та ерозією',
      'Прозора морська вода надходить з океану та постійно оновлюється',
      'Чорні базальтові стіни, лавові канали й атлантичні хвилі навколо зони для купання',
      'Облаштований комплекс із солярієм, роздягальнями, душами, дитячим басейном, дитячим майданчиком, баром, пунктом першої допомоги та паркуванням',
      'Зручності для відвідувачів з обмеженою мобільністю',
      'Поруч Piscinas Naturais Velhas — більш дикий і менш облаштований формат лавових басейнів',
      'Ilhéu Mole та відкритий Атлантичний океан створюють драматичний пейзаж біля басейнів',
      'Басейни є найвідомішою пам’яткою північно-західного узбережжя Мадейри',
      'Умови залежать від моря: сильне хвилювання північного узбережжя може впливати на доступ і безпеку купання',
    ],
  },
  practicalTip: {
    en: 'Visit early in the day in summer, when the pools are quieter and parking is easier. Bring swimwear, a towel, footwear for wet rock and sun protection, but also check the weather: Porto Moniz is often cooler and wetter than Funchal. Follow lifeguard instructions and closure notices, as strong north-coast waves can restrict access or make swimming unsafe.',
    uk: 'Улітку приїжджайте раніше, коли в басейнах менше людей і легше знайти паркування. Візьміть купальний одяг, рушник, взуття для мокрих каменів і сонцезахист, але також перевірте погоду: у Porto Moniz часто прохолодніше та вологіше, ніж у Funchal. Дотримуйтеся вказівок рятувальників і повідомлень про закриття, адже сильні хвилі північного узбережжя можуть обмежити доступ або зробити купання небезпечним.',
  },
},
  },
  {
    slug: 'ponta-do-pargo-lighthouse',
    name: {
      en: 'Ponta do Pargo Lighthouse Viewpoint',
      uk: 'Оглядовий майданчик маяка Ponta do Pargo',
    },
    area: {
      en: 'Ponta do Pargo, Calheta',
      uk: 'Ponta do Pargo, Calheta',
    },
    category: {
      en: 'Viewpoint',
      uk: 'Оглядовий майданчик',
    },
    tags: ['Viewpoints'],
    summary: {
      en: 'A dramatic cliff-top viewpoint at Madeira’s western end, beside the historic Ponta do Pargo Lighthouse and open Atlantic Ocean.',
      uk: 'Вражаючий оглядовий майданчик на західному краю Мадейри, поруч з історичним маяком Ponta do Pargo та відкритою Атлантикою.',
    },
    image: '/images/explore/ponta-do-pargo.jpg',
    imageAlt: {
      en: 'Ponta do Pargo Lighthouse above the cliffs and Atlantic Ocean in Madeira',
      uk: 'Маяк Ponta do Pargo над скелями та Атлантичним океаном на Мадейрі',
    },
    mapQuery: 'Miradouro do Farol da Ponta do Pargo Madeira',
    article: {
      intro: {
        en: 'The Ponta do Pargo Lighthouse Viewpoint stands at Ponta da Vigia, on Madeira’s far western edge. Set high above the Atlantic, it combines a historic lighthouse, sheer coastal cliffs and wide ocean views in one of the island’s most exposed and memorable settings.',
        uk: 'Оглядовий майданчик маяка Ponta do Pargo розташований у Ponta da Vigia, на крайньому заході Мадейри. Високо над Атлантикою тут поєднуються історичний маяк, стрімкі прибережні скелі та широкі океанські панорами — одне з найвідкритіших і найвиразніших місць острова.',
      },
      history: {
        en: 'The lighthouse was built to improve navigation around Madeira’s dangerous western coast and began operating in June 1922. Its white building and red lantern remain a defining landmark of Ponta da Vigia. The lighthouse tower is about 14 metres high, while its position on the cliff gives the light a much greater elevation above sea level. Over the decades, the site has remained both a working maritime landmark and a popular place to understand the scale of Madeira’s Atlantic coastline.',
        uk: 'Маяк збудували для покращення навігації біля небезпечного західного узбережжя Мадейри, а в роботу він увійшов у червні 1922 року. Біла будівля з червоним ліхтарем і сьогодні є головною візитівкою Ponta da Vigia. Висота вежі становить приблизно 14 метрів, а розташування на скелі піднімає її світло значно вище над рівнем моря. Протягом десятиліть це місце залишалося і діючим морським орієнтиром, і популярною точкою, звідки можна відчути масштаб атлантичного узбережжя Мадейри.',
      },
      highlights: {
        en: [
          'One of Madeira’s westernmost viewpoints, at Ponta da Vigia near Ponta do Pargo',
          'The historic Ponta do Pargo Lighthouse, operating since June 1922',
          'A white lighthouse building with a distinctive red lantern above the cliffs',
          'Open Atlantic panoramas and long views along Madeira’s rugged west coast',
          'High, exposed cliffs that show the dramatic meeting of land and ocean',
          'A peaceful stop for photography, sunsets and changing Atlantic weather',
          'Easy road access from Ponta do Pargo, with the viewpoint beside the lighthouse',
        ],
        uk: [
          'Один із найзахідніших оглядових майданчиків Мадейри — у Ponta da Vigia поблизу Ponta do Pargo',
          'Історичний маяк Ponta do Pargo, що працює з червня 1922 року',
          'Біла будівля маяка з характерним червоним ліхтарем над скелями',
          'Відкриті панорами Атлантики та далекі види вздовж суворого західного узбережжя Мадейри',
          'Високі відкриті скелі, що яскраво показують зустріч суші й океану',
          'Тиха зупинка для фотографій, заходу сонця та спостереження за мінливою атлантичною погодою',
          'Зручний автомобільний доступ із Ponta do Pargo; оглядова точка розташована поруч із маяком',
        ],
      },
      practicalTip: {
        en: 'The clifftop is exposed to strong wind and weather can change quickly, so bring a warm layer even on a sunny day. Stay behind barriers and well away from cliff edges. Visit late in the afternoon for softer light, but allow time to return before dark because the west coast is a long drive from Funchal.',
        uk: 'Вершина скелі відкрита для сильного вітру, а погода може швидко змінюватися, тому навіть у сонячний день візьміть теплий верхній шар одягу. Не заходьте за огородження та не наближайтеся до країв скель. Для м’якшого світла приїжджайте наприкінці дня, але залиште час на повернення до темряви: західне узбережжя розташоване далеко від Funchal.',
      },
    },
  },
  {
    slug: 'pr9-levada-do-caldeirao-verde',
    name: {
      en: 'PR9 Levada do Caldeirão Verde',
      uk: 'PR9 Левада Caldeirão Verde',
    },
    area: {
      en: 'Queimadas, Santana',
      uk: 'Queimadas, Santana',
    },
    category: {
      en: 'Levada walk',
      uk: 'Прогулянка левадою',
    },
    tags: ['Levada walks', 'Hiking'],
    summary: {
      en: 'A long, spectacular levada walk from Queimadas through Laurissilva forest, waterfalls and tunnels to Caldeirão Verde.',
      uk: 'Довгий і вражаючий маршрут левадою з Queimadas через лавровий ліс, водоспади й тунелі до Caldeirão Verde.',
    },
    image: '/images/explore/pr9.jpg',
    imageAlt: {
      en: 'Levada path and traditional Queimadas house on PR9 Levada do Caldeirão Verde, Madeira',
      uk: 'Стежка левадою та традиційний будинок у Queimadas на маршруті PR9 Levada do Caldeirão Verde, Мадейра',
    },
    mapQuery: 'PR9 Levada do Caldeirão Verde Queimadas Madeira',
    article: {
      intro: {
        en: 'PR9 – Levada do Caldeirão Verde is one of Madeira’s classic levada walks. Starting in the Queimadas Forest Park near Santana, the trail follows a narrow irrigation channel through lush Laurissilva forest, across high valleys and through dark tunnels before reaching the waterfall-filled amphitheatre of Caldeirão Verde.',
        uk: 'PR9 – Levada do Caldeirão Verde — один із класичних маршрутів левадами на Мадейрі. Стежка починається в лісовому парку Queimadas біля Santana, веде вузьким зрошувальним каналом через пишний лавровий ліс Laurissilva, високі долини й темні тунелі та завершується біля водоспадного амфітеатру Caldeirão Verde.',
      },
      history: {
        en: 'Like Madeira’s other levadas, this route follows part of the island’s historic water-management network. Levada channels were built to carry water from the wetter mountains to farms and settlements in drier areas. The path became a walking route because maintenance workers needed access along the channel. Today PR9 gives visitors a close view of the Laurissilva forest, a UNESCO World Heritage landscape, while showing the difficult engineering required to bring mountain water across steep terrain. The official PR9 route is 8.7 km each way from Queimadas, with the option to continue between Caldeirão Verde and Caldeirão do Inferno only when that section is officially open.',
        uk: 'Як і інші левади Мадейри, цей маршрут проходить уздовж частини історичної системи управління водою острова. Канали будували, щоб переносити воду з вологіших гір до ферм і поселень у сухіших районах. Стежка стала пішим маршрутом тому, що працівникам був потрібен доступ для обслуговування каналу. Сьогодні PR9 дає можливість побачити ліс Laurissilva — ландшафт Світової спадщини UNESCO — і водночас відчути складність інженерних робіт, необхідних для подачі гірської води через крутий рельєф. Офіційний маршрут PR9 має 8,7 км в один бік від Queimadas; продовжувати шлях між Caldeirão Verde та Caldeirão do Inferno можна лише тоді, коли ця ділянка офіційно відкрита.',
      },
      highlights: {
        en: [
          'Official PR9 route: 8.7 km each way, starting at Queimadas Forest Park near Santana',
          'A moderate full-day walk through Madeira’s Laurissilva Forest, a UNESCO World Heritage landscape',
          'The traditional thatched-roof Casa de Abrigo das Queimadas near the start of the route',
          'Four dark tunnels on the way to Caldeirão Verde, where a torch or headlamp is essential',
          'Narrow levada paths, waterfalls, green valleys and views into the São Jorge area',
          'Caldeirão Verde: a dramatic waterfall and lagoon enclosed by high, moss-covered cliffs',
          'A possible continuation towards Caldeirão do Inferno, subject to the official trail status',
        ],
        uk: [
          'Офіційний маршрут PR9: 8,7 км в один бік, початок у лісовому парку Queimadas біля Santana',
          'Маршрут середньої складності на цілий день через Laurissilva Forest — ландшафт Світової спадщини UNESCO',
          'Традиційний будинок Casa de Abrigo das Queimadas із солом’яним дахом біля початку маршруту',
          'Чотири темні тунелі на шляху до Caldeirão Verde, тому ліхтарик або налобний ліхтар обов’язкові',
          'Вузькі стежки вздовж левади, водоспади, зелені долини та види в напрямку São Jorge',
          'Caldeirão Verde: вражаючий водоспад і лагуна, оточені високими вкритими мохом скелями',
          'Можливе продовження до Caldeirão do Inferno — лише відповідно до офіційного статусу стежки',
        ],
      },
      practicalTip: {
        en: 'Check the official PR9 status before travelling: rain, rockfall or maintenance can close sections of the route. Take a torch or headlamp for the tunnels, shoes with good grip, waterproof layers, water and food. The walk is long despite the gentle levada gradient, so start early and do not enter any closed section, including the continuation towards Caldeirão do Inferno.',
        uk: 'Перед поїздкою перевірте офіційний статус PR9: дощ, каменепади або технічні роботи можуть закривати частини маршруту. Для тунелів візьміть ліхтарик або налобний ліхтар, взуття з хорошим зчепленням, водонепроникний одяг, воду та їжу. Попри плавний нахил левади, маршрут довгий, тому вирушайте рано й не заходьте на закриті ділянки, зокрема на продовження в бік Caldeirão do Inferno.',
      },
    },
  },
  {
    slug: 'pico-grande',
    name: {
      en: 'Pico Grande',
      uk: 'Pico Grande',
    },
    area: {
      en: 'Central mountains, Câmara de Lobos',
      uk: 'Центральні гори, Câmara de Lobos',
    },
    category: {
      en: 'Hiking',
      uk: 'Хайкінг',
    },
    tags: ['Hiking'],
    summary: {
      en: 'A challenging mountain hike to a dramatic 1,654-metre summit with wide views over Madeira’s central massif and Curral das Freiras.',
      uk: 'Складний гірський маршрут до ефектної вершини заввишки 1 654 метри з широкими видами на центральний масив Мадейри та Curral das Freiras.',
    },
    image: '/images/explore/pico-grande.jpg',
    imageAlt: {
      en: 'Rocky summit landscape of Pico Grande in Madeira',
      uk: 'Скелястий гірський пейзаж Pico Grande на Мадейрі',
    },
    mapQuery: 'Pico Grande Madeira',
    article: {
      intro: {
        en: 'Pico Grande is one of Madeira’s most striking central-mountain summits. Rising to about 1,654 metres, it stands above the deep valleys around Curral das Freiras and offers a rugged high-mountain experience with volcanic rock, steep slopes and broad views across the island’s interior.',
        uk: 'Pico Grande — одна з найвиразніших вершин центральних гір Мадейри. Вона піднімається приблизно на 1 654 метри над глибокими долинами навколо Curral das Freiras і пропонує справжній високогірний досвід: вулканічні скелі, круті схили та широкі види на внутрішню частину острова.',
      },
      history: {
        en: 'Pico Grande is reached by mountain paths that connect with the historic Caminho Real da Encumeada, known as PR12. These old mountain routes were used long before modern roads provided easier links between communities. Today, hikers commonly approach the summit from the Boca da Corrida area, following part of PR12 before taking the steeper path towards Pico Grande. The mountain sits within Madeira’s central massif, where volcanic geology, steep relief and changing weather have shaped both the landscape and the character of the walk.',
        uk: 'До Pico Grande ведуть гірські стежки, пов’язані з історичним Caminho Real da Encumeada, відомим як PR12. Ці старі гірські шляхи використовували задовго до появи сучасних доріг, які полегшили сполучення між поселеннями. Сьогодні туристи часто підходять до вершини з району Boca da Corrida: спочатку йдуть частиною PR12, а потім повертають на крутішу стежку до Pico Grande. Гора лежить у центральному масиві Мадейри, де вулканічна геологія, різкий рельєф і мінлива погода сформували і ландшафт, і характер маршруту.',
      },
      highlights: {
        en: [
          'A 1,654-metre summit in Madeira’s central mountain massif',
          'A popular approach from Boca da Corrida using part of the PR12 Caminho Real da Encumeada',
          'Views over Curral das Freiras, surrounding valleys and the rugged central ridges',
          'A final steep, rocky ascent that makes the summit feel more adventurous than many levada walks',
          'Volcanic rock formations, exposed slopes and changing mountain light',
          'A rewarding destination for experienced hikers with good fitness and mountain confidence',
          'A dramatic place for clear-day panoramas, sunset light and mountain photography',
        ],
        uk: [
          'Вершина заввишки 1 654 метри в центральному гірському масиві Мадейри',
          'Популярний підхід із Boca da Corrida частиною PR12 Caminho Real da Encumeada',
          'Види на Curral das Freiras, навколишні долини та суворі центральні хребти',
          'Крутий і скелястий фінальний підйом, який робить вершину більш пригодницькою, ніж більшість прогулянок левадами',
          'Вулканічні скельні утворення, відкриті схили та мінливе гірське світло',
          'Вартий маршрут для досвідчених туристів із доброю фізичною підготовкою та впевненістю в горах',
          'Ефектне місце для панорам у ясний день, світла на заході сонця та гірської фотографії',
        ],
      },
      practicalTip: {
        en: 'Check the official status of PR12 and the mountain forecast before setting out, as access can change after rain, rockfall or maintenance. Use hiking boots with good grip, carry water, food, warm and waterproof layers, and start early. The final climb is steep and exposed in places, so do not attempt it in poor visibility, strong wind or without sufficient mountain experience.',
        uk: 'Перед виходом перевірте офіційний статус PR12 і гірський прогноз, адже доступ може змінюватися після дощу, каменепадів або технічних робіт. Взувайте трекінгове взуття з хорошим зчепленням, беріть воду, їжу, теплий і водонепроникний одяг та вирушайте рано. Фінальний підйом крутий і подекуди відкритий, тому не плануйте його за поганої видимості, сильного вітру або без достатнього гірського досвіду.',
      },
    },
  },
  {
    slug: 'pr6-25-fontes',
    name: { en: 'PR6 Levada das 25 Fontes', uk: 'PR6 Левада 25 Fontes' },
    area: { en: 'Rabaçal, Paul da Serra', uk: 'Rabaçal, Paul da Serra' },
    category: { en: 'Levada walk', uk: 'Прогулянка левадою' },
    tags: ['Levada walks', 'Hiking', 'Waterfalls'],
    summary: { en: 'A popular Rabaçal levada walk to a green lagoon fed by numerous small waterfalls.', uk: 'Популярний маршрут левадами в Rabaçal до зеленої лагуни, яку живлять численні невеликі водоспади.' },
    image: '/images/explore/pr6-25-fontes.jpg',
    imageAlt: { en: 'PR6 Levada das 25 Fontes in Madeira', uk: 'PR6 Левада 25 Fontes на Мадейрі' },
    mapQuery: 'PR6 Levada das 25 Fontes Madeira',
    article: {
      intro: { en: 'PR6 starts in the Rabaçal area and follows mountain water channels through Laurissilva forest towards the 25 Fontes lagoon.', uk: 'PR6 починається в районі Rabaçal і проходить вздовж гірських водних каналів через ліс Laurissilva до лагуни 25 Fontes.' },
      history: { en: 'Levadas were built to carry water to Madeira’s farms and settlements. The trail is now one of the island’s best-known walks, but conditions and access rules can change.', uk: 'Левади будували для подачі води до ферм і поселень Мадейри. Сьогодні це один із найвідоміших маршрутів острова, але умови та правила доступу можуть змінюватися.' },
      highlights: {
        en: ['Rabaçal forest and waterfalls', 'The 25 Fontes lagoon', 'A classic Laurissilva landscape'],
        uk: ['Ліс і водоспади Rabaçal', 'Лагуна 25 Fontes', 'Класичний ландшафт Laurissilva'],
      },
      practicalTip: { en: 'Check the official PR6 status and reservation requirements. Wear shoes with grip, take water and start early.', uk: 'Перевірте офіційний статус PR6 та вимоги щодо бронювання. Взуйтеся у взуття з хорошим зчепленням, візьміть воду та вирушайте рано.' },
    },
  },
  {
    slug: 'pr6-levada-do-risco',
    name: { en: 'PR6.1 Levada do Risco', uk: 'PR6.1 Левада do Risco' },
    area: { en: 'Rabaçal, Paul da Serra', uk: 'Rabaçal, Paul da Serra' },
    category: { en: 'Levada walk', uk: 'Прогулянка левадою' },
    tags: ['Levada walks', 'Hiking', 'Waterfalls'],
    summary: { en: 'A Rabaçal levada walk leading to the tall Risco waterfall and a dramatic green valley.', uk: 'Маршрут левадою в Rabaçal до високого водоспаду Risco та драматичної зеленої долини.' },
    image: '/images/explore/pr6-levada-do-risco.jpg',
    imageAlt: { en: 'PR6.1 Levada do Risco in Madeira', uk: 'PR6.1 Левада do Risco на Мадейрі' },
    mapQuery: 'PR6.1 Levada do Risco Madeira',
    article: {
      intro: { en: 'PR6.1 follows the historic water network of Rabaçal to the Risco waterfall. It is often combined with nearby walks, but it is a distinct official route.', uk: 'PR6.1 проходить історичною водною мережею Rabaçal до водоспаду Risco. Його часто поєднують із сусідніми маршрутами, але це окремий офіційний маршрут.' },
      history: { en: 'The levada was made for irrigation, while the path beside it gave maintenance workers access through the wet mountain landscape.', uk: 'Леваду створили для зрошення, а стежка поруч давала працівникам доступ до неї через вологий гірський ландшафт.' },
      highlights: {
        en: ['Risco waterfall', 'Laurissilva forest', 'Mountain water channels'],
        uk: ['Водоспад Risco', 'Ліс Laurissilva', 'Гірські водні канали'],
      },
      practicalTip: { en: 'Check the official trail status, as rain and rockfall can affect access. Bring a waterproof layer.', uk: 'Перевірте офіційний статус маршруту, адже дощ і каменепади можуть впливати на доступ. Візьміть водонепроникний одяг.' },
    },
  },
  {
    slug: 'pr6-2-levada-do-alecrim',
    name: { en: 'PR6.2 Levada do Alecrim', uk: 'PR6.2 Левада do Alecrim' },
    area: { en: 'Rabaçal, Paul da Serra', uk: 'Rabaçal, Paul da Serra' },
    category: { en: 'Levada walk', uk: 'Прогулянка левадою' },
    tags: ['Levada walks', 'Hiking', 'Waterfalls'],
    summary: { en: 'A scenic Rabaçal levada route with forest, open views and small pools fed by clear mountain water.', uk: 'Мальовничий маршрут левадою в Rabaçal із лісом, відкритими видами та невеликими басейнами з чистою гірською водою.' },
    image: '/images/explore/pr6-2-levada-do-alecrim.jpg',
    imageAlt: { en: 'PR6.2 Levada do Alecrim in Madeira', uk: 'PR6.2 Левада do Alecrim на Мадейрі' },
    mapQuery: 'PR6.2 Levada do Alecrim Madeira',
    article: {
      intro: { en: 'PR6.2 explores the Rabaçal plateau and its water channels, offering a quieter alternative to the most crowded waterfall walks.', uk: 'PR6.2 проходить плато Rabaçal і його водними каналами, пропонуючи спокійнішу альтернативу найпопулярнішим водоспадним маршрутам.' },
      history: { en: 'This part of the plateau shows how levadas distribute water from the wetter interior to other parts of the island.', uk: 'Ця частина плато показує, як левади розподіляють воду з вологішої внутрішньої частини острова до інших районів.' },
      highlights: {
        en: ['Levada scenery', 'Forest paths', 'Mountain pools and waterfalls'],
        uk: ['Пейзажі левади', 'Лісові стежки', 'Гірські басейни й водоспади'],
      },
      practicalTip: { en: 'Check the official status before leaving. Weather changes quickly on Paul da Serra, so carry warm and waterproof layers.', uk: 'Перед виходом перевірте офіційний статус. На Paul da Serra погода швидко змінюється, тому візьміть теплий і водонепроникний одяг.' },
    },
  },
  {
    slug: 'pr11-vereda-dos-balcoes',
    name: { en: 'PR11 Vereda dos Balcões', uk: 'PR11 Стежка dos Balcões' },
    area: { en: 'Ribeiro Frio', uk: 'Ribeiro Frio' },
    category: { en: 'Easy walk', uk: 'Легка прогулянка' },
    tags: ['Hiking', 'Viewpoints', 'Easy walks'],
    summary: { en: 'A short, accessible walk from Ribeiro Frio to a balcony viewpoint over Madeira’s central mountains.', uk: 'Коротка й доступна прогулянка від Ribeiro Frio до оглядового майданчика з видом на центральні гори Мадейри.' },
    image: '/images/explore/pr11-vereda-dos-balcoes.jpg',
    imageAlt: { en: 'PR11 Vereda dos Balcões in Madeira', uk: 'PR11 Стежка dos Balcões на Мадейрі' },
    mapQuery: 'PR11 Vereda dos Balcões Madeira',
    article: {
      intro: { en: 'PR11 follows a gentle levada-side path through the humid forest of Ribeiro Frio to Balcões, a natural balcony over deep valleys.', uk: 'PR11 проходить легкою стежкою вздовж левади через вологий ліс Ribeiro Frio до Balcões — природного балкона над глибокими долинами.' },
      history: { en: 'The route follows Madeira’s irrigation heritage and has become one of the island’s most accessible mountain walks.', uk: 'Маршрут проходить уздовж іригаційної спадщини Мадейри та став однією з найдоступніших гірських прогулянок острова.' },
      highlights: {
        en: ['Short route from Ribeiro Frio', 'Balcões mountain panorama', 'Laurissilva forest'],
        uk: ['Короткий маршрут від Ribeiro Frio', 'Гірська панорама Balcões', 'Ліс Laurissilva'],
      },
      practicalTip: { en: 'Check access requirements before travelling. The path can be wet; wear footwear with grip and do not feed wildlife.', uk: 'Перед поїздкою перевірте вимоги щодо доступу. Стежка може бути мокрою; взуйтеся у взуття з хорошим зчепленням і не годуйте диких тварин.' },
    },
  },
  {
    slug: 'pr18-levada-do-rei',
    name: { en: 'PR18 Levada do Rei', uk: 'PR18 Левада do Rei' },
    area: { en: 'São Jorge', uk: 'São Jorge' },
    category: { en: 'Levada walk', uk: 'Прогулянка левадою' },
    tags: ['Levada walks', 'Hiking'],
    summary: { en: 'A lush north-coast levada walk through São Jorge valleys, subtropical vegetation and Laurissilva forest.', uk: 'Пишний маршрут левадою на північному узбережжі через долини São Jorge, субтропічну рослинність і ліс Laurissilva.' },
    image: '/images/explore/pr18-levada-do-rei.jpg',
    imageAlt: { en: 'PR18 Levada do Rei in Madeira', uk: 'PR18 Левада do Rei на Мадейрі' },
    mapQuery: 'PR18 Levada do Rei Madeira',
    article: {
      intro: { en: 'PR18 follows Levada do Rei through one of Madeira’s greenest landscapes, where water, forest and small farming areas meet.', uk: 'PR18 проходить уздовж Levada do Rei через один із найзеленіших ландшафтів Мадейри, де поєднуються вода, ліс і невеликі сільськогосподарські ділянки.' },
      history: { en: 'The levada is part of Madeira’s long-established irrigation system and the footpath preserves access along the channel.', uk: 'Левада є частиною давньої іригаційної системи Мадейри, а стежка зберігає доступ уздовж каналу.' },
      highlights: {
        en: ['Lush São Jorge valley', 'Laurissilva vegetation', 'Water channels and tunnels'],
        uk: ['Пишна долина São Jorge', 'Рослинність Laurissilva', 'Водні канали й тунелі'],
      },
      practicalTip: { en: 'Check the official status, take a torch for any dark sections and allow enough time for the return journey.', uk: 'Перевірте офіційний статус, візьміть ліхтарик для темних ділянок і залиште достатньо часу на повернення.' },
    },
  },
  {
    slug: 'eira-do-serrado',
    name: { en: 'Eira do Serrado Viewpoint', uk: 'Оглядовий майданчик Eira do Serrado' },
    area: { en: 'Curral das Freiras', uk: 'Curral das Freiras' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'Mountains'],
    summary: { en: 'A high mountain viewpoint with a famous panorama over the deep valley and village of Curral das Freiras.', uk: 'Високогірний оглядовий майданчик із відомою панорамою глибокої долини та села Curral das Freiras.' },
    image: '/images/explore/eira-do-serrado.jpg',
    imageAlt: { en: 'Eira do Serrado Viewpoint in Madeira', uk: 'Оглядовий майданчик Eira do Serrado на Мадейрі' },
    mapQuery: 'Eira do Serrado Viewpoint Madeira',
    article: {
      intro: { en: 'Eira do Serrado sits high above Curral das Freiras and offers one of Madeira’s clearest views into the central mountain basin.', uk: 'Eira do Serrado розташований високо над Curral das Freiras і відкриває один із найкращих видів у центральну гірську улоговину Мадейри.' },
      history: { en: 'The viewpoint became a classic stop because it reveals how steep erosion and volcanic terrain shaped the isolated valley below.', uk: 'Майданчик став класичною зупинкою, адже показує, як крута ерозія та вулканічний рельєф сформували ізольовану долину внизу.' },
      highlights: {
        en: ['Panorama over Curral das Freiras', 'Central mountain ridges', 'Short walk from parking'],
        uk: ['Панорама Curral das Freiras', 'Центральні гірські хребти', 'Коротка прогулянка від паркування'],
      },
      practicalTip: { en: 'Bring a warm layer: the viewpoint is high and can be cold or cloudy even when Funchal is sunny.', uk: 'Візьміть теплий одяг: майданчик розташований високо, тому тут може бути холодно або хмарно, навіть коли у Funchal сонячно.' },
    },
  },
  {
    slug: 'miradouro-do-guindaste',
    name: { en: 'Miradouro do Guindaste', uk: 'Оглядовий майданчик Guindaste' },
    area: { en: 'Faial, Santana', uk: 'Faial, Santana' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'North coast', 'Lab Travel'],
    summary: { en: 'A dramatic north-coast viewpoint in Faial with platforms above the Atlantic and views towards Penha d’Águia.', uk: 'Ефектний оглядовий майданчик у Faial на північному узбережжі з платформами над Атлантикою та видом у бік Penha d’Águia.' },
    image: '/images/explore/miradouro-do-guindaste.jpg',
    imageAlt: { en: 'Miradouro do Guindaste in Madeira', uk: 'Оглядовий майданчик Guindaste на Мадейрі' },
    mapQuery: 'Miradouro do Guindaste Madeira',
    article: {
      intro: { en: 'Guindaste overlooks Madeira’s rugged north coast, where high green slopes meet the Atlantic Ocean.', uk: 'Guindaste виходить на суворе північне узбережжя Мадейри, де високі зелені схили зустрічаються з Атлантичним океаном.' },
      history: { en: 'The site developed as a visitor viewpoint because its exposed position gives broad coastal views without a long hike.', uk: 'Місце розвинулося як оглядова точка, адже його відкрите розташування дає широкі прибережні види без тривалого хайкінгу.' },
      highlights: {
        en: ['North-coast cliffs', 'Atlantic panorama', 'Views towards Penha d’Águia'],
        uk: ['Скелі північного узбережжя', 'Панорама Атлантики', 'Види у бік Penha d’Águia'],
      },
      practicalTip: { en: 'The platforms are exposed to wind. Stay behind barriers and visit in clear weather for the best coastal views.', uk: 'Платформи відкриті для вітру. Залишайтеся за огородженнями та приїжджайте в ясну погоду для найкращих прибережних видів.' },
    },
  },
  {
    slug: 'miradouro-da-portela',
    name: { en: 'Miradouro da Portela', uk: 'Оглядовий майданчик Portela' },
    area: { en: 'Portela, Machico', uk: 'Portela, Machico' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'North coast'],
    summary: { en: 'A 670-metre viewpoint between Machico and Porto da Cruz, overlooking green mountains and the east coast.', uk: 'Оглядовий майданчик на висоті 670 метрів між Machico та Porto da Cruz із видом на зелені гори й східне узбережжя.' },
    image: '/images/explore/miradouro-da-portela.jpg',
    imageAlt: { en: 'Miradouro da Portela in Madeira', uk: 'Оглядовий майданчик Portela на Мадейрі' },
    mapQuery: 'Miradouro da Portela Madeira',
    article: {
      intro: { en: 'Portela occupies a strategic mountain pass between the east and north-east coasts of Madeira.', uk: 'Portela розташована на стратегічному гірському перевалі між східним і північно-східним узбережжям Мадейри.' },
      history: { en: 'Its road access made it a long-standing stop for travellers moving between Machico and the north coast.', uk: 'Автомобільний доступ зробив його давньою зупинкою для мандрівників між Machico та північним узбережжям.' },
      highlights: {
        en: ['Views towards Porto da Cruz', 'Green mountain slopes', 'East and north-coast panorama'],
        uk: ['Види у бік Porto da Cruz', 'Зелені гірські схили', 'Панорама східного та північного узбережжя'],
      },
      practicalTip: { en: 'Cloud can arrive quickly at this altitude. Bring a layer and stop only in safe parking areas.', uk: 'На цій висоті хмари можуть з’явитися швидко. Візьміть додатковий шар одягу та зупиняйтеся лише у безпечних місцях для паркування.' },
    },
  },
  {
    slug: 'ponta-do-rosto',
    name: { en: 'Miradouro da Ponta do Rosto', uk: 'Оглядовий майданчик Ponta do Rosto' },
    area: { en: 'Ponta de São Lourenço', uk: 'Ponta de São Lourenço' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'Coast', 'Sunset'],
    summary: { en: 'An exposed eastern viewpoint over the volcanic coast of Ponta de São Lourenço, with views to both sides of Madeira.', uk: 'Відкритий східний оглядовий майданчик над вулканічним узбережжям Ponta de São Lourenço з видами на обидва боки Мадейри.' },
    image: '/images/explore/ponta-do-rosto.jpg',
    imageAlt: { en: 'Miradouro da Ponta do Rosto in Madeira', uk: 'Оглядовий майданчик Ponta do Rosto на Мадейрі' },
    mapQuery: 'Miradouro da Ponta do Rosto Madeira',
    article: {
      intro: { en: 'Ponta do Rosto lies at the entrance to the São Lourenço peninsula, where the island’s dry eastern geology is especially visible.', uk: 'Ponta do Rosto лежить біля входу на півострів São Lourenço, де особливо добре видно суху східну геологію острова.' },
      history: { en: 'Strong wind and low rainfall shaped this contrasting landscape of basalt cliffs, grassland and open ocean.', uk: 'Сильний вітер і мала кількість опадів сформували контрастний ландшафт із базальтових скель, трав’янистих схилів та відкритого океану.' },
      highlights: {
        en: ['North and south coast views', 'Volcanic cliffs', 'Sunrise and sunset light'],
        uk: ['Види на північне й південне узбережжя', 'Вулканічні скелі', 'Світло світанку та заходу сонця'],
      },
      practicalTip: { en: 'It is often very windy and has little shade. Bring sun protection, a windproof layer and stay away from cliff edges.', uk: 'Тут часто дуже вітряно й майже немає тіні. Візьміть сонцезахист, вітрозахисний одяг і не підходьте до країв скель.' },
    },
  },
  {
    slug: 'veu-da-noiva',
    name: { en: 'Véu da Noiva Viewpoint', uk: 'Оглядовий майданчик Véu da Noiva' },
    area: { en: 'Seixal, North coast', uk: 'Seixal, Північне узбережжя' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'Waterfalls', 'North coast'],
    summary: { en: 'An iconic viewpoint over a waterfall that descends from a green mountainside towards the Atlantic near Seixal.', uk: 'Знаковий оглядовий майданчик над водоспадом, який спускається із зеленого схилу до Атлантики біля Seixal.' },
    image: '/images/explore/veu-da-noiva.jpg',
    imageAlt: { en: 'Véu da Noiva Viewpoint in Madeira', uk: 'Оглядовий майданчик Véu da Noiva на Мадейрі' },
    mapQuery: 'Véu da Noiva Viewpoint Madeira',
    article: {
      intro: { en: 'Véu da Noiva is on Madeira’s old north-coast road, a landscape shaped by steep slopes, rainfall and Atlantic erosion.', uk: 'Véu da Noiva розташований на старій північній дорозі Мадейри — у ландшафті, сформованому крутими схилами, опадами та атлантичною ерозією.' },
      history: { en: 'The viewpoint became one of the north coast’s best-known stops because the waterfall appears to fall directly towards the sea.', uk: 'Майданчик став однією з найвідоміших зупинок північного узбережжя, адже водоспад здається таким, що падає прямо до моря.' },
      highlights: {
        en: ['Waterfall beside the Atlantic', 'Old north-coast road', 'Green Seixal cliffs'],
        uk: ['Водоспад біля Атлантики', 'Стара північна дорога', 'Зелені скелі Seixal'],
      },
      practicalTip: { en: 'Use designated parking and viewpoints only. The old road and cliffs can be affected by wet weather and rockfall.', uk: 'Користуйтеся лише визначеними місцями для паркування та огляду. Стара дорога й скелі можуть бути небезпечними за мокрої погоди та каменепадів.' },
    },
  },
  {
    slug: 'miradouro-sao-cristovao',
    name: { en: 'Miradouro de São Cristóvão', uk: 'Оглядовий майданчик São Cristóvão' },
    area: { en: 'Boaventura', uk: 'Boaventura' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'North coast', 'Lab Travel'],
    summary: { en: 'A peaceful north-coast viewpoint above Boaventura, with broad Atlantic views and steep green valleys.', uk: 'Тихий оглядовий майданчик над Boaventura на північному узбережжі з широкими видами на Атлантику та круті зелені долини.' },
    image: '/images/explore/miradouro-sao-cristovao.jpg',
    imageAlt: { en: 'Miradouro de São Cristóvão in Madeira', uk: 'Оглядовий майданчик São Cristóvão на Мадейрі' },
    mapQuery: 'Miradouro de São Cristóvão Madeira',
    article: {
      intro: { en: 'São Cristóvão looks across a part of Madeira where wet trade winds keep the hillsides green for much of the year.', uk: 'São Cristóvão виходить на частину Мадейри, де вологі пасатні вітри підтримують зелені схили протягом більшої частини року.' },
      history: { en: 'The surrounding roads and small settlements developed around farming on narrow terraces above the sea.', uk: 'Навколишні дороги й невеликі поселення розвивалися навколо землеробства на вузьких терасах над морем.' },
      highlights: {
        en: ['Atlantic coast panorama', 'Boaventura valleys', 'Quiet rural setting'],
        uk: ['Панорама атлантичного узбережжя', 'Долини Boaventura', 'Тиха сільська атмосфера'],
      },
      practicalTip: { en: 'The north coast is often cooler and wetter than Funchal. Check the forecast and drive carefully on narrow roads.', uk: 'Північне узбережжя часто прохолодніше й вологіше, ніж Funchal. Перевірте прогноз і обережно їдьте вузькими дорогами.' },
    },
  },
  {
    slug: 'miradouro-terra-grande',
    name: { en: 'Miradouro de Terra Grande', uk: 'Оглядовий майданчик Terra Grande' },
    area: { en: 'Central mountains', uk: 'Центральні гори' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'Mountains'],
    summary: { en: 'A mountain viewpoint above deep central valleys, with dramatic views towards Curral das Freiras and surrounding ridges.', uk: 'Гірський оглядовий майданчик над глибокими центральними долинами з драматичними видами на Curral das Freiras і навколишні хребти.' },
    image: '/images/explore/miradouro-terra-grande.jpg',
    imageAlt: { en: 'Miradouro de Terra Grande in Madeira', uk: 'Оглядовий майданчик Terra Grande на Мадейрі' },
    mapQuery: 'Miradouro de Terra Grande Madeira',
    article: {
      intro: { en: 'Terra Grande is part of Madeira’s steep interior, where mountain roads cross between high ridges and isolated valleys.', uk: 'Terra Grande є частиною крутого внутрішнього району Мадейри, де гірські дороги перетинають високі хребти та ізольовані долини.' },
      history: { en: 'The viewpoint is valued for showing the scale of the volcanic erosion that shaped the island’s mountainous centre.', uk: 'Майданчик цінують за можливість побачити масштаб вулканічної ерозії, що сформувала гірський центр острова.' },
      highlights: {
        en: ['Central valley panorama', 'Views towards Curral das Freiras', 'Rugged mountain relief'],
        uk: ['Панорама центральних долин', 'Види на Curral das Freiras', 'Суворий гірський рельєф'],
      },
      practicalTip: { en: 'Mountain fog can reduce visibility quickly. Visit in clear weather and park only where it is safe.', uk: 'Гірський туман може швидко зменшити видимість. Приїжджайте в ясну погоду та паркуйтеся лише там, де це безпечно.' },
    },
  },
  {
    slug: 'bica-da-cana',
    name: { en: 'Miradouro da Bica da Cana', uk: 'Оглядовий майданчик Bica da Cana' },
    area: { en: 'Paul da Serra', uk: 'Paul da Serra' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'Mountains'],
    summary: { en: 'A high Paul da Serra viewpoint known for wide mountain panoramas and occasional cloud inversions.', uk: 'Високогірний оглядовий майданчик на Paul da Serra, відомий широкими гірськими панорамами та інколи інверсіями хмар.' },
    image: '/images/explore/bica-da-cana.jpg',
    imageAlt: { en: 'Miradouro da Bica da Cana in Madeira', uk: 'Оглядовий майданчик Bica da Cana на Мадейрі' },
    mapQuery: 'Miradouro da Bica da Cana Madeira',
    article: {
      intro: { en: 'Bica da Cana sits on the high plateau of Paul da Serra, a very different landscape from Madeira’s coastal towns.', uk: 'Bica da Cana розташована на високому плато Paul da Serra — зовсім іншому ландшафті, ніж прибережні міста Мадейри.' },
      history: { en: 'The plateau’s open terrain, wind and fast-changing weather make it an important transition between the island’s south and north.', uk: 'Відкритий рельєф плато, вітер і швидка зміна погоди роблять його важливою перехідною зоною між півднем і північчю острова.' },
      highlights: {
        en: ['High plateau scenery', 'Central-mountain panorama', 'Cloud inversions in suitable conditions'],
        uk: ['Пейзаж високого плато', 'Панорама центральних гір', 'Інверсії хмар за відповідних умов'],
      },
      practicalTip: { en: 'Bring warm, windproof clothing. Visibility can change rapidly, especially in fog or low cloud.', uk: 'Візьміть теплий вітрозахисний одяг. Видимість може швидко змінюватися, особливо в тумані або низькій хмарності.' },
    },
  },
  {
    slug: 'eira-da-achada',
    name: { en: 'Miradouro da Eira da Achada', uk: 'Оглядовий майданчик Eira da Achada' },
    area: { en: 'São Vicente', uk: 'São Vicente' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'North coast'],
    summary: { en: 'A north-coast viewpoint above São Vicente with expansive ocean views and a quiet rural atmosphere.', uk: 'Оглядовий майданчик над São Vicente на північному узбережжі з широкими видами на океан і тихою сільською атмосферою.' },
    image: '/images/explore/eira-da-achada.jpg',
    imageAlt: { en: 'Miradouro da Eira da Achada in Madeira', uk: 'Оглядовий майданчик Eira da Achada на Мадейрі' },
    mapQuery: 'Miradouro da Eira da Achada Madeira',
    article: {
      intro: { en: 'Eira da Achada overlooks the green northern slopes of Madeira, where rain and steep terrain created deep valleys facing the Atlantic.', uk: 'Eira da Achada виходить на зелені північні схили Мадейри, де дощі та крутий рельєф створили глибокі долини, звернені до Атлантики.' },
      history: { en: 'It is a quieter alternative to the island’s busiest viewpoints and reflects the rural character of the north coast.', uk: 'Це спокійніша альтернатива найвідвідуванішим оглядовим майданчикам острова, що передає сільський характер північного узбережжя.' },
      highlights: {
        en: ['North-coast ocean panorama', 'Rural mountain roads', 'Quiet photography stop'],
        uk: ['Океанська панорама північного узбережжя', 'Сільські гірські дороги', 'Тиха зупинка для фотографій'],
      },
      practicalTip: { en: 'Bring a light waterproof layer and take care on narrow mountain roads, particularly after rain.', uk: 'Візьміть легкий водонепроникний одяг і будьте обережні на вузьких гірських дорогах, особливо після дощу.' },
    },
  },
  {
    slug: 'pico-da-murta',
    name: { en: 'Miradouro do Pico da Murta', uk: 'Оглядовий майданчик Pico da Murta' },
    area: { en: 'Central mountains', uk: 'Центральні гори' },
    category: { en: 'Viewpoint', uk: 'Оглядовий майданчик' },
    tags: ['Viewpoints', 'Mountains'],
    summary: { en: 'A mountain viewpoint with expansive views over Madeira’s central ridges and deep interior valleys.', uk: 'Гірський оглядовий майданчик із широкими видами на центральні хребти Мадейри та глибокі внутрішні долини.' },
    image: '/images/explore/pico-da-murta.jpg',
    imageAlt: { en: 'Miradouro do Pico da Murta in Madeira', uk: 'Оглядовий майданчик Pico da Murta на Мадейрі' },
    mapQuery: 'Miradouro do Pico da Murta Madeira',
    article: {
      intro: { en: 'Pico da Murta lies in the central mountain zone, a landscape of volcanic ridges and steeply carved valleys.', uk: 'Pico da Murta лежить у зоні центральних гір — ландшафті вулканічних хребтів і круто врізаних долин.' },
      history: { en: 'Its elevated position makes it a useful stop for understanding the scale and relief of Madeira’s interior.', uk: 'Його високе розташування робить це місце гарною зупинкою, щоб зрозуміти масштаб і рельєф внутрішньої частини Мадейри.' },
      highlights: {
        en: ['Mountain-ridge views', 'Deep interior valleys', 'Changing mountain light'],
        uk: ['Види на гірські хребти', 'Глибокі внутрішні долини', 'Мінливе гірське світло'],
      },
      practicalTip: { en: 'Check mountain weather before driving. Wind, fog and wet roads are common at higher elevations.', uk: 'Перед поїздкою перевірте гірський прогноз. На великих висотах часто бувають вітер, туман і мокрі дороги.' },
    },
  },
  {
    slug: 'pr14-levada-dos-cedros',
    name: { en: 'PR14 Levada dos Cedros', uk: 'PR14 Левада dos Cedros' },
    area: { en: 'Fanal, Porto Moniz', uk: 'Fanal, Porto Moniz' },
    category: { en: 'Levada walk', uk: 'Прогулянка левадою' },
    tags: ['Levada walks', 'Hiking'],
    summary: { en: 'A forest levada walk in the Fanal area, passing through Laurissilva and old cedar woodland.', uk: 'Лісовий маршрут левадою в районі Fanal через Laurissilva та старі кедрові ліси.' },
    image: '/images/explore/pr14-levada-dos-cedros.jpg',
    imageAlt: { en: 'PR14 Levada dos Cedros in Madeira', uk: 'PR14 Левада dos Cedros на Мадейрі' },
    mapQuery: 'PR14 Levada dos Cedros Madeira',
    article: {
      intro: { en: 'PR14 follows a water channel through the north-western Laurissilva landscape near Fanal and Porto Moniz.', uk: 'PR14 проходить уздовж водного каналу через ландшафт Laurissilva на північному заході біля Fanal і Porto Moniz.' },
      history: { en: 'The route combines Madeira’s irrigation history with protected native forest, where moisture and shade support rich vegetation.', uk: 'Маршрут поєднує іригаційну історію Мадейри із захищеним корінним лісом, де волога й тінь підтримують багату рослинність.' },
      highlights: {
        en: ['Laurissilva forest', 'Levada-side walking', 'Fanal area atmosphere'],
        uk: ['Ліс Laurissilva', 'Прогулянка вздовж левади', 'Атмосфера району Fanal'],
      },
      practicalTip: { en: 'Check the official status. The route can be muddy and foggy, so use waterproof footwear and carry a layer.', uk: 'Перевірте офіційний статус. Маршрут може бути багнистим і туманним, тому використовуйте водонепроникне взуття та візьміть додатковий шар одягу.' },
    },
  },
  {
    slug: 'pr13-vereda-do-fanal',
    name: { en: 'PR13 Vereda do Fanal', uk: 'PR13 Стежка do Fanal' },
    area: { en: 'Paul da Serra to Fanal', uk: 'Paul da Serra до Fanal' },
    category: { en: 'Hiking', uk: 'Хайкінг' },
    tags: ['Hiking', 'Nature'],
    summary: { en: 'A long mountain route from Paul da Serra towards Fanal, crossing open uplands and native Laurissilva forest.', uk: 'Довгий гірський маршрут від Paul da Serra до Fanal через відкриті височини та корінний ліс Laurissilva.' },
    image: '/images/explore/pr13-vereda-do-fanal.jpg',
    imageAlt: { en: 'PR13 Vereda do Fanal in Madeira', uk: 'PR13 Стежка do Fanal на Мадейрі' },
    mapQuery: 'PR13 Vereda do Fanal Madeira',
    article: {
      intro: { en: 'PR13 links the high plateau with Fanal, revealing the transition from exposed grassland to ancient laurel forest.', uk: 'PR13 з’єднує високе плато з Fanal і показує перехід від відкритих луків до стародавнього лаврового лісу.' },
      history: { en: 'The trail passes through a protected natural landscape that preserves part of Madeira’s original forest cover.', uk: 'Стежка проходить охоронюваним природним ландшафтом, де збереглася частина первісного лісового покриву Мадейри.' },
      highlights: {
        en: ['Paul da Serra uplands', 'Fanal Laurissilva', 'Long-distance nature walk'],
        uk: ['Височини Paul da Serra', 'Laurissilva Fanal', 'Довгий природний маршрут'],
      },
      practicalTip: { en: 'This is a long route. Check official access, arrange transport for the finish, and carry navigation, food, water and waterproof layers.', uk: 'Це довгий маршрут. Перевірте офіційний доступ, організуйте транспорт із фінішу та візьміть навігацію, їжу, воду й водонепроникний одяг.' },
    },
  },
  {
    slug: 'pr5-vereda-das-funduras',
    name: { en: 'PR5 Vereda das Funduras', uk: 'PR5 Стежка das Funduras' },
    area: { en: 'Portela, Machico', uk: 'Portela, Machico' },
    category: { en: 'Hiking', uk: 'Хайкінг' },
    tags: ['Hiking', 'Nature'],
    summary: { en: 'A forest trail in eastern Madeira, connecting Portela with the green valleys and woodlands of Funduras.', uk: 'Лісовий маршрут на сході Мадейри, що з’єднує Portela із зеленими долинами та лісами Funduras.' },
    image: '/images/explore/pr5-vereda-das-funduras.jpg',
    imageAlt: { en: 'PR5 Vereda das Funduras in Madeira', uk: 'PR5 Стежка das Funduras на Мадейрі' },
    mapQuery: 'PR5 Vereda das Funduras Madeira',
    article: {
      intro: { en: 'PR5 crosses the eastern mountain landscape between Portela and Funduras, following old paths through native and replanted woodland.', uk: 'PR5 проходить східним гірським ландшафтом між Portela та Funduras старими стежками через корінні й відновлені ліси.' },
      history: { en: 'The route shows a quieter side of Madeira, away from the busiest coastal attractions and high peaks.', uk: 'Маршрут показує спокійнішу сторону Мадейри, далеко від найвідвідуваніших прибережних локацій і високих вершин.' },
      highlights: {
        en: ['Forest landscape', 'Eastern valleys', 'Portela mountain area'],
        uk: ['Лісовий ландшафт', 'Східні долини', 'Гірський район Portela'],
      },
      practicalTip: { en: 'Check official status and transport arrangements. Bring water and prepare for wet, uneven forest paths.', uk: 'Перевірте офіційний статус і транспорт. Візьміть воду та підготуйтеся до мокрих і нерівних лісових стежок.' },
    },
  },
  {
    slug: 'pr17-pinaculo-folhadal',
    name: { en: 'PR17 Caminho do Pináculo e Folhadal', uk: 'PR17 Caminho do Pináculo e Folhadal' },
    area: { en: 'Central mountains', uk: 'Центральні гори' },
    category: { en: 'Levada walk', uk: 'Прогулянка левадою' },
    tags: ['Levada walks', 'Hiking'],
    summary: { en: 'A long central-mountain route through levadas, tunnels and Laurissilva forest between Pináculo and Folhadal.', uk: 'Довгий маршрут центральними горами через левади, тунелі та ліс Laurissilva між Pináculo і Folhadal.' },
    image: '/images/explore/pr17-pinaculo-folhadal.jpg',
    imageAlt: { en: 'PR17 Caminho do Pináculo e Folhadal in Madeira', uk: 'PR17 Caminho do Pináculo e Folhadal на Мадейрі' },
    mapQuery: 'PR17 Caminho do Pináculo e Folhadal Madeira',
    article: {
      intro: { en: 'PR17 follows water-management paths through Madeira’s high interior, combining levadas with forest and mountain terrain.', uk: 'PR17 проходить шляхами системи управління водою через високу внутрішню частину Мадейри, поєднуючи левади з лісовим і гірським рельєфом.' },
      history: { en: 'It reflects the engineering needed to move water through difficult terrain and the protected forests surrounding the channels.', uk: 'Він показує інженерні рішення, потрібні для переміщення води складним рельєфом, і охоронювані ліси навколо каналів.' },
      highlights: {
        en: ['Long levada route', 'Tunnels and forest', 'Central mountain landscape'],
        uk: ['Довгий маршрут левадами', 'Тунелі й ліс', 'Ландшафт центральних гір'],
      },
      practicalTip: { en: 'This is a demanding route. Check its official status, take a torch, food, water, waterproof clothing and arrange transport.', uk: 'Це вимогливий маршрут. Перевірте його офіційний статус, візьміть ліхтарик, їжу, воду, водонепроникний одяг і організуйте транспорт.' },
    },
  },
  {
    slug: 'levada-do-furado',
    name: { en: 'Levada do Furado', uk: 'Левада do Furado' },
    area: { en: 'Ribeiro Frio to Portela', uk: 'Ribeiro Frio до Portela' },
    category: { en: 'Levada walk', uk: 'Прогулянка левадою' },
    tags: ['Levada walks', 'Hiking'],
    summary: { en: 'A classic long levada walk from Ribeiro Frio towards Portela through forest, tunnels and changing mountain scenery.', uk: 'Класичний довгий маршрут левадою від Ribeiro Frio до Portela через ліс, тунелі та мінливі гірські пейзажі.' },
    image: '/images/explore/levada-do-furado.jpg',
    imageAlt: { en: 'Levada do Furado in Madeira', uk: 'Левада do Furado на Мадейрі' },
    mapQuery: 'Levada do Furado Madeira',
    article: {
      intro: { en: 'Levada do Furado is one of Madeira’s historic water channels, carrying mountain water towards the east of the island.', uk: 'Levada do Furado — один з історичних водних каналів Мадейри, що переносить гірську воду до східної частини острова.' },
      history: { en: 'The route offers an extended view of Madeira’s irrigation network and connects the wet forest of Ribeiro Frio with eastern slopes near Portela.', uk: 'Маршрут дає розширене уявлення про іригаційну мережу Мадейри та з’єднує вологий ліс Ribeiro Frio зі східними схилами біля Portela.' },
      highlights: {
        en: ['Historic levada engineering', 'Forest and mountain scenery', 'Ribeiro Frio to Portela route'],
        uk: ['Історична інженерія левад', 'Лісові й гірські пейзажі', 'Маршрут Ribeiro Frio — Portela'],
      },
      practicalTip: { en: 'This is a long one-way-style walk unless transport is arranged. Check access, carry a torch, water and a waterproof layer.', uk: 'Це довгий маршрут в один бік, якщо не організувати транспорт. Перевірте доступ, візьміть ліхтарик, воду й водонепроникний одяг.' },
    },
  },
  {
    slug: 'santana-typical-houses',
    name: { en: 'Traditional Santana Houses', uk: 'Традиційні будиночки Santana' },
    area: { en: 'Santana, North Coast', uk: 'Santana, Північне узбережжя' },
    category: { en: 'Culture & heritage', uk: 'Культура й спадщина' },
    tags: ['City & culture', 'North coast', 'Lab Travel'],
    summary: {
      en: 'Madeira’s iconic triangular thatched houses in Santana, with colourful façades, gardens and local craft displays.',
      uk: 'Знакові трикутні будиночки Мадейри із солом’яними дахами в Santana, з кольоровими фасадами, садами та місцевими ремісничими виробами.',
    },
    image: '/images/explore/santana-houses.jpg',
    imageAlt: { en: 'Traditional triangular thatched houses in Santana, Madeira', uk: 'Традиційні трикутні будиночки з солом’яними дахами в Santana, Мадейра' },
    mapQuery: 'Casas Típicas de Santana Madeira',
    article: {
      intro: {
        en: 'The Traditional Santana Houses, known locally as Casas de Santana, are one of Madeira’s best-known cultural symbols. Their steep triangular shape, thick thatched roofs and colourful painted details make them an immediately recognisable part of the island’s heritage.',
        uk: 'Традиційні будиночки Santana, відомі як Casas de Santana, — один із найвідоміших культурних символів Мадейри. Їхня крута трикутна форма, товсті солом’яні дахи та кольорові деталі фасадів роблять їх одразу впізнаваною частиною спадщини острова.',
      },
      history: {
        en: 'These small rural houses were designed for Madeira’s wet north-coast climate. The steep roof helped rain run off quickly, while locally available wood and thatch provided practical shelter. The preserved and reconstructed houses in the Núcleo de Casas Típicas de Santana show how this traditional architecture looked and functioned.',
        uk: 'Ці невеликі сільські будинки створили для вологого клімату північного узбережжя Мадейри. Крутий дах допомагав дощу швидко стікати, а доступні на місці дерево й солома забезпечували практичне укриття. Збережені та відтворені будиночки в Núcleo de Casas Típicas de Santana показують, як виглядала й функціонувала ця традиційна архітектура.',
      },
      highlights: {
        en: ['One of Madeira’s best-known cultural landmarks', 'Triangular houses with steep thatched roofs', 'Núcleo de Casas Típicas de Santana in the town centre', 'Gardens, local products and Madeiran crafts nearby'],
        uk: ['Одна з найвідоміших культурних пам’яток Мадейри', 'Трикутні будиночки з крутими солом’яними дахами', 'Núcleo de Casas Típicas de Santana у центрі містечка', 'Поруч сади, місцеві продукти та ремісничі вироби Мадейри'],
      },
      practicalTip: {
        en: 'Visit during the day for the best photographs and combine the houses with Santana town, Queimadas or nearby north-coast viewpoints. Respect any restricted areas and houses used as shops or exhibitions.',
        uk: 'Відвідуйте вдень для найкращих фотографій і поєднайте будиночки з Santana, Queimadas або близькими оглядовими майданчиками північного узбережжя. Поважайте обмежені зони та будинки, які використовують як магазини чи виставкові простори.',
      },
    },
  },
  {
    slug: 'anjos-waterfall',
    name: { en: 'Anjos Waterfall', uk: 'Водоспад Anjos' },
    area: { en: 'Anjos, Ponta do Sol', uk: 'Anjos, Ponta do Sol' },
    category: { en: 'Waterfall', uk: 'Водоспад' },
    tags: ['Waterfalls', 'Lab Travel'],
    summary: {
      en: 'A famous waterfall on Madeira’s old ER101 coastal road near Ponta do Sol. The site is officially closed and must not be entered.',
      uk: 'Відомий водоспад на старій прибережній дорозі ER101 біля Ponta do Sol. Об’єкт офіційно закритий, і заходити на нього не можна.',
    },
    image: '/images/explore/anjos-waterfall.jpg',
    imageAlt: { en: 'Anjos Waterfall beside the old coastal road in Madeira', uk: 'Водоспад Anjos біля старої прибережної дороги на Мадейрі' },
    mapQuery: 'Cascata dos Anjos Ponta do Sol Madeira',
    article: {
      intro: {
        en: 'Anjos Waterfall, also called Cascata dos Anjos, descends down a coastal cliff beside Madeira’s former ER101 road near Ponta do Sol. It became widely known through photographs and social media, but the road and waterfall area are officially closed for safety reasons.',
        uk: 'Водоспад Anjos, також відомий як Cascata dos Anjos, спускається прибережною скелею поруч із колишньою дорогою ER101 біля Ponta do Sol. Він став широко відомим завдяки фотографіям і соціальним мережам, але дорога та зона водоспаду офіційно закриті з міркувань безпеки.',
      },
      history: {
        en: 'The waterfall is part of Madeira’s steep south-coast landscape, where rainwater runs down volcanic cliffs towards the Atlantic. The old ER101 road once passed beneath the falling water, but it is exposed to landslides and the wet surface can be extremely slippery. Authorities have closed access because the area does not meet safe visiting conditions.',
        uk: 'Водоспад є частиною крутого південного узбережжя Мадейри, де дощова вода стікає вулканічними скелями до Атлантики. Стара дорога ER101 колись проходила під потоком води, але вона вразлива до зсувів, а мокра поверхня може бути надзвичайно слизькою. Влада закрила доступ, оскільки місце не відповідає безпечним умовам для відвідування.',
      },
      highlights: {
        en: ['A well-known south-west-coast waterfall near Ponta do Sol', 'Water descending down a volcanic cliff beside the former ER101 road', 'The location is officially closed because of landslide and slipping risks', 'View only from legal and safe public areas; never cross barriers'],
        uk: ['Відомий водоспад на південно-західному узбережжі біля Ponta do Sol', 'Вода, що спускається вулканічною скелею поруч із колишньою дорогою ER101', 'Локація офіційно закрита через ризики зсувів і слизької поверхні', 'Дивіться лише з законних і безпечних публічних місць; ніколи не перетинайте огородження'],
      },
      practicalTip: {
        en: 'Do not enter the waterfall road or cross signs, barriers or fencing. Check official local notices before travelling. This article is informational and does not recommend visiting the closed site.',
        uk: 'Не заходьте на дорогу біля водоспаду та не перетинайте знаки, бар’єри чи огорожі. Перед поїздкою перевіряйте офіційні місцеві повідомлення. Ця стаття має інформаційний характер і не рекомендує відвідувати закриту локацію.',
      },
    },
  },
];

export function getLocationBySlug(slug: string) {
  return locations.find((location) => location.slug === slug);
}