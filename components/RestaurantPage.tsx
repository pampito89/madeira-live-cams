import { localizeStructuredData } from '../lib/i18n/structuredData';
import { useText } from '../lib/i18n/TranslationProvider';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import RestaurantPhoto from './RestaurantPhoto';
import type { Restaurant } from '../data/restaurants';
import { useMessages } from '../lib/i18n/useMessages';
type Props = {
    restaurant: Restaurant;
    hasPhoto: boolean;
};
type OfficialRestaurantInfo = {
    website: string;
    menuSummary: {
        en: string;
        uk: string;
    };
};
const ORIGIN = 'https://madeiralivecams.com';
const officialRestaurantInfo: Record<string, OfficialRestaurantInfo> = {
    'restaurant-portus-villa': {
        website: 'https://portusvilla.pt/',
        menuSummary: {
            en: 'The official Portus Villa website highlights fillet mignon, octopus à Portus, stuffed bread with cheese and bacon, and seared tuna. Dishes, prices and availability can change, so confirm the current menu directly with the restaurant.',
            uk: 'На офіційному сайті Portus Villa серед фірмових страв зазначені філе міньйон, восьминіг à Portus, хліб із сиром і беконом та обсмажений тунець. Страви, ціни й наявність можуть змінюватися, тому перевіряйте актуальне меню безпосередньо в ресторані.',
        },
    },
};
export default function RestaurantPage({ restaurant: r, hasPhoto }: Props) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const { locale } = useMessages();
    const uk = locale === 'uk';
    const [routeOpen, setRouteOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const canonical = `${ORIGIN}${translationLanguage === "en" ? "" : "/" + translationLanguage}/explore/${r.slug}`;
    const position = `${r.latitude},${r.longitude}`;
    const planner = `/trip-plan?addRestaurant=${encodeURIComponent(r.slug)}`;
    const description = uk
        ? `${r.name} у ${r.area}: рейтинг, підсумок відгуків, карта та посилання для перевірки актуального меню, годин роботи й наявності столиків.`
        : localizeFormat("Plan a visit to __VAR_0__ in __VAR_1__: rating, review summary, map, and links to check the current menu, opening hours and table availability.", r.name, r.area);
    const seoTitle = uk
        ? `${r.name}, ${r.area}: меню, відгуки та інформація`
        : localizeFormat("__VAR_0__, __VAR_1__: Reviews, Menu & Visitor Info", r.name, r.area);
    const officialInfo = officialRestaurantInfo[r.slug];
    const actionClass = 'inline-flex h-10 items-center justify-center rounded-lg border border-ocean px-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2';
    const share = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: localize(r.name), text: localize(description), url: canonical });
                return;
            }
            await navigator.clipboard.writeText(canonical);
            setCopied(true);
        }
        catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError')
                return;
            window.prompt(localize(uk ? 'Скопіюйте посилання:' : 'Copy this link:'), canonical);
        }
    };
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: r.name,
        url: canonical,
        description,
        hasMap: r.googleMapsUrl,
        geo: { '@type': 'GeoCoordinates', latitude: r.latitude, longitude: r.longitude },
        ...(hasPhoto ? { image: `${ORIGIN}${r.image}` } : {}),
        ...(officialInfo ? { sameAs: [officialInfo.website] } : {}),
    };
    return (<Layout>
      <Head>
        <title>{[localize(seoTitle)].join("")}</title>
        <meta name="description" content={localize(description)}/>
        <meta property="og:title" content={localize(seoTitle)}/>
        <meta property="og:description" content={localize(description)}/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content={canonical}/>
        <meta property="og:locale" content={({ en: "en_GB", pt: "pt_PT", de: "de_DE", fr: "fr_FR", es: "es_ES", pl: "pl_PL", uk: "uk_UA" })[translationLanguage]}/>
        <meta name="twitter:card" content={hasPhoto ? 'summary_large_image' : 'summary'}/>
        <meta name="twitter:title" content={localize(seoTitle)}/>
        <meta name="twitter:description" content={localize(description)}/>
        {localize(hasPhoto && (<>
            <meta property="og:image" content={`${ORIGIN}${r.image}`}/>
            <meta property="og:image:alt" content={localize(r.name)}/>
            <meta name="twitter:image" content={`${ORIGIN}${r.image}`}/>
          </>))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localizeStructuredData(schema, localize)).replace(/</g, '\\u003c') }}/>
      </Head>
      <main className="page-shell">

        <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <RestaurantPhoto src={r.image} name={r.name} locale={locale} available={hasPhoto}/>
          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">{localize(uk ? 'Ресторан' : 'Restaurant')}{localize(" \u00B7 ")}{localize(r.area)}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{localize(r.name)}</h1>
            <p className="mt-4 text-lg font-semibold text-navy">
              <span aria-hidden="true">{localize("\u2605 ")}</span>{localize(r.rating.toLocaleString(translationLanguage, { minimumFractionDigits: 1 }))}{localize("/ 5")}<span className="text-sm font-normal text-slate-600">{localize(" \u00B7 ")}{localize(r.reviewCount.toLocaleString(translationLanguage))} {localize(uk ? 'відгуків у Google Maps' : 'Google Maps reviews')}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {localize(uk ? 'Перевірено' : 'Checked')} <time dateTime={r.checkedAt}>{localize(r.checkedAt)}</time>{localize(" \u00B7 ")}{localize(uk ? 'Оцінка може змінюватися' : 'Rating may change')}
            </p>
            {localize(r.temporarilyClosed && (<p role="note" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                {localize(uk ? 'Google Maps позначає заклад як тимчасово закритий. Перед поїздкою уточніть, чи він відновив роботу.' : 'Google Maps marks this venue as temporarily closed. Confirm that it has reopened before travelling.')}
              </p>))}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={planner} className={`${actionClass} bg-ocean text-white`}>{localize("+ ")}{localize(uk ? 'До плану' : 'Add to plan')}</Link>
              <div className="relative">
                <button type="button" onClick={() => setRouteOpen((current) => !current)} aria-expanded={routeOpen} aria-controls="restaurant-route-options" className={`${actionClass} bg-ocean text-white`}>{localize("\uD83D\uDDFA\uFE0F")}{localize(uk ? 'Маршрут' : 'Route')}
                </button>
                {localize(routeOpen && (<div id="restaurant-route-options" className="absolute left-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(position)}&travelmode=driving`} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">{localize("Google Maps")}</a>
                    <a href={`https://www.waze.com/ul?ll=${encodeURIComponent(position)}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">{localize("Waze")}</a>
                    <button type="button" onClick={() => setRouteOpen(false)} className="block w-full px-3 py-2 text-left text-sm">{localize(uk ? 'Закрити' : 'Close')}</button>
                  </div>))}
              </div>
              <button type="button" onClick={share} className={actionClass}>{localize(copied ? (uk ? 'Скопійовано' : 'Copied') : (uk ? 'Поділитися' : 'Share'))}</button>
            </div>
            <p className="mt-6 leading-7 text-slate-700">{localize(r.summary[locale])}</p>

            <section className="mt-8 rounded-xl border border-slate-200 bg-panel p-4" aria-labelledby="restaurant-menu">
              <h2 id="restaurant-menu" className="font-semibold text-navy">{localize(uk ? 'Меню та години роботи' : 'Menu and opening hours')}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {localize(officialInfo
            ? officialInfo.menuSummary[locale]
            : uk
                ? 'Меню, ціни та години роботи можуть змінюватися. Перевірте актуальну інформацію безпосередньо у закладі або в його профілі Google Maps перед поїздкою.'
                : 'Menus, prices and opening hours can change. Confirm the latest information directly with the venue or on its Google Maps listing before travelling.')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {localize(officialInfo && (<a href={officialInfo.website} target="_blank" rel="noopener noreferrer" className={actionClass}>
                    {localize(uk ? 'Офіційний сайт і меню' : 'Official website and menu')}{localize("\u2197")}</a>))}
                <a href={r.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={actionClass}>
                  {localize(uk ? 'Актуальні години в Google Maps' : 'Current hours on Google Maps')}{localize("\u2197")}</a>
              </div>
            </section>

            <section className="mt-8" aria-labelledby="restaurant-reviews">
              <h2 id="restaurant-reviews" className="text-xl font-semibold text-navy">{localize(uk ? 'Що кажуть відвідувачі' : 'What visitors say')}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {localize(uk
            ? `Редакційний підсумок вибірки з ${r.reviewSampleSize} доступних відгуків у Google Maps. Він не визначає думки серед усіх ${r.reviewCount.toLocaleString(translationLanguage)} відгуків.`
            : localizeFormat("An editorial summary of __VAR_0__ available Google Maps reviews. It does not represent all __VAR_1__ reviews.", r.reviewSampleSize, r.reviewCount.toLocaleString(translationLanguage)))}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-panel p-4">
                  <h3 className="font-semibold text-navy">{localize(uk ? 'Що хвалять' : 'What guests praise')}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{localize(r.praised[locale] || (uk ? 'Текстів відгуків поки недостатньо для висновку.' : 'Not enough review text is available to draw a conclusion.'))}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-semibold text-navy">{localize(uk ? 'Зауваження гостей' : 'Guest criticisms')}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{localize(r.criticism?.[locale] ?? (uk ? 'У прочитаній вибірці конкретних зауважень не виявлено. Це не означає, що негативних відгуків немає.' : 'No specific criticism was found in the sample read. This does not mean there are no negative reviews.'))}</p>
                </div>
              </div>
              <a href={r.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-ocean underline">{localize(uk ? 'Переглянути відгуки в Google Maps' : 'Read reviews on Google Maps')}{localize(" \u2197")}</a>
            </section>
            <section className="mt-8 rounded-xl bg-panel p-4">
              <h2 className="font-semibold text-navy">{localize(uk ? 'Перед відвідуванням' : 'Before visiting')}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{localize(uk ? 'Уточніть години роботи, меню та наявність столика. Позначка прийому їжі у планувальнику не підтверджує графік закладу.' : 'Confirm opening hours, menu and table availability. Meal labels in the planner do not confirm opening hours.')}</p>
            </section>
            <a href={r.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={`${actionClass} mt-8`}>{localize("\uD83D\uDCCD ")}{localize(uk ? 'Відкрити точку на карті' : 'View location on map')}</a>
          </div>
        </article>
      </main>
    </Layout>);
}
