import type { Location, LocalizedText } from './locations';
import type { Restaurant } from './restaurants';
export type Activity = Restaurant & { website: string; practical: LocalizedText; durationMinutes: number };
// Ratings and three review previews were checked on Google Maps on 2026-09-11.
// Official operator pages supply the descriptions and meeting information.
export const activities: Activity[] = [
  {
    "slug": "madeira-sea-emotions",
    "name": "Madeira Sea Emotions",
    "area": "Caniçal",
    "latitude": 32.7416264,
    "longitude": -16.7104624,
    "googleMapsUrl": "https://maps.app.goo.gl/kpAafthkwuqt5FL6A",
    "website": "https://madeiraseaemotions.com/tours/whale-and-dolphin-watching/",
    "rating": 4.8,
    "reviewCount": 1797,
    "durationMinutes": 180,
    "summary": {
      "en": "Whale and dolphin watching by speedboat from Marina Quinta do Lorde, with marine biologists and views of the Ponta de São Lourenço coast.",
      "uk": "Морські тури на швидкісному катері з Marina Quinta do Lorde: спостереження за китами й дельфінами з морськими біологами та краєвиди узбережжя Ponta de São Lourenço."
    },
    "praised": {
      "en": "The three sampled reviews praise the professional crew, marine biologists and memorable whale or dolphin encounters.",
      "uk": "У трьох прочитаних відгуках хвалять професійну команду, супровід морських біологів та враження від зустрічей із китами або дельфінами."
    },
    "criticism": null,
    "practical": {
      "en": "Meet at the operator’s office in Marina Quinta do Lorde. The operator lists a 120–150 minute tour and asks guests to arrive 30 minutes early. The planner allows 3 hours including check-in; adjust this to your booking. The road route ends at the marina, not at sea. Confirm the exact departure with the operator; wildlife sightings vary.",
      "uk": "Місце збору — офіс оператора в Marina Quinta do Lorde. Оператор зазначає тривалість туру 120–150 хвилин і просить прибути за 30 хвилин. У плані закладено 3 години з реєстрацією; скоригуйте час за бронюванням. Автомобільний маршрут веде до марини, а не в море. Підтвердьте відправлення в оператора; зустрічі з тваринами залежать від природних умов."
    },
    "checkedAt": "2026-09-11",
    "reviewSampleSize": 3,
    "temporarilyClosed": false,
    "image": "/images/explore/activity-madeira-sea-emotions.webp"
  },
  {
    "slug": "h2o-madeira",
    "name": "H2O Madeira — Whale & Dolphin Watching",
    "area": "Calheta",
    "latitude": 32.717841,
    "longitude": -17.1707108,
    "googleMapsUrl": "https://maps.app.goo.gl/SZS647qhrwMyreap6",
    "website": "https://h2omadeira.com/tours/",
    "rating": 4.9,
    "reviewCount": 1192,
    "durationMinutes": 150,
    "summary": {
      "en": "Whale and dolphin watching from Marina da Calheta aboard a fast RIB boat, accompanied by an experienced guide or marine biologist.",
      "uk": "Спостереження за китами й дельфінами з Marina da Calheta на швидкісному катері RIB у супроводі досвідченого гіда або морського біолога."
    },
    "praised": {
      "en": "The three sampled reviews highlight friendly guides and memorable whale and dolphin encounters.",
      "uk": "У трьох прочитаних відгуках відзначають привітних гідів і яскраві враження від зустрічей із китами та дельфінами."
    },
    "criticism": null,
    "practical": {
      "en": "The map point is the operator’s location at Porto de Recreio da Calheta. Confirm the meeting point and check-in time in your booking. The advertised tour lasts about 2 hours; the planner reserves 2 hours 30 minutes including a planning buffer. Departures depend on sea conditions and wildlife sightings vary.",
      "uk": "Точка на карті — розташування оператора в Porto de Recreio da Calheta. Уточніть місце збору й час реєстрації у бронюванні. Заявлена тривалість туру — близько 2 годин; у плані передбачено 2 години 30 хвилин із запасом часу. Відправлення залежить від стану моря, а зустрічі з тваринами — від природних умов."
    },
    "checkedAt": "2026-09-11",
    "reviewSampleSize": 3,
    "temporarilyClosed": false,
    "image": "/images/explore/activity-h2o-madeira.webp"
  },
  {
    "slug": "adrenaline-xtreme-adventures",
    "name": "Adrenaline X-Treme Adventures",
    "area": "Porto Moniz · Levada Grande",
    "latitude": 32.8565674,
    "longitude": -17.1573105,
    "googleMapsUrl": "https://maps.app.goo.gl/5Y46J7N28JVZiVZ39",
    "website": "https://adrenalineadventures.pt/en",
    "rating": 4.8,
    "reviewCount": 913,
    "durationMinutes": 180,
    "summary": {
      "en": "An adventure park near Porto Moniz with a zipline and giant swing above the Atlantic coast. Both experiences can be combined in one visit.",
      "uk": "Парк активного відпочинку біля Porto Moniz із зіплайном та велетенською гойдалкою над атлантичним узбережжям. Обидві розваги можна поєднати за одне відвідування."
    },
    "praised": {
      "en": "Sampled visitors praise the briefing, friendly staff, coastal views and the zipline and swing experience.",
      "uk": "У вибірці хвалять інструктаж, привітний персонал, краєвиди узбережжя та враження від зіплайну й гойдалки."
    },
    "criticism": {
      "en": "Two sampled reviews mention queues when combining activities; one describes a long wait in direct sun.",
      "uk": "У двох прочитаних відгуках згадують черги при поєднанні активностей; в одному описують тривале очікування на сонці."
    },
    "practical": {
      "en": "Go to Caminho da Fajã do Barro 1, Levada Grande, and confirm the check-in instructions in your booking. The planner reserves 3 hours as a flexible allowance for both activities and queues, not a guaranteed duration. Check participation requirements with the operator before booking.",
      "uk": "Адреса — Caminho da Fajã do Barro 1, Levada Grande. Звірте інструкції щодо реєстрації з бронюванням. У плані закладено 3 години як орієнтовний запас для двох активностей і черг, а не гарантовану тривалість. Перед бронюванням уточніть вимоги до учасників в оператора."
    },
    "checkedAt": "2026-09-11",
    "reviewSampleSize": 3,
    "temporarilyClosed": false,
    "image": "/images/explore/activity-adrenaline-xtreme-adventures.webp"
  }
];
export function getActivity(slug: string) { return activities.find(activity => activity.slug === slug); }
export const activityLocations: Location[] = activities.map(a => ({
 slug:a.slug, name:{en:a.name,uk:a.name},area:{en:a.area,uk:a.area},
 category:{en:'Outdoor activities',uk:'Активний відпочинок'},tags:['Outdoor activities'],hiddenFromExplore:false,
 summary:a.summary,image:a.image,imageAlt:{en:a.name,uk:a.name},mapQuery:a.latitude+','+a.longitude,
 article:{intro:a.summary,history:a.summary,highlights:{en:[a.praised.en],uk:[a.praised.uk]},practicalTip:a.practical}
}));
export const activityCoordinates: Record<string,[number,number]> = Object.fromEntries(activities.map(a=>[a.slug,[a.latitude,a.longitude]]));
