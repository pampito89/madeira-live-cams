import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import RestaurantPhoto from './RestaurantPhoto';
import type { Restaurant } from '../data/restaurants';
import { useMessages } from '../lib/i18n/useMessages';

type Props = { restaurant: Restaurant; hasPhoto: boolean };
const ORIGIN = 'https://madeiralivecams.com';

export default function RestaurantPage({ restaurant: r, hasPhoto }: Props) {
  const { locale } = useMessages();
  const uk = locale === 'uk';
  const [routeOpen, setRouteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canonical = `${ORIGIN}${uk ? '/uk' : ''}/explore/${r.slug}`;
  const position = `${r.latitude},${r.longitude}`;
  const planner = `/trip-plan?addRestaurant=${encodeURIComponent(r.slug)}`;
  const description = r.summary[locale];
  const actionClass = 'inline-flex h-10 items-center justify-center rounded-lg border border-ocean px-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2';

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: r.name, text: description, url: canonical });
        return;
      }
      await navigator.clipboard.writeText(canonical);
      setCopied(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.prompt(uk ? 'Скопіюйте посилання:' : 'Copy this link:', canonical);
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
  };

  return (
    <Layout>
      <Head>
        <title>{r.name} — {r.area} | Madeira Live Cams</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${r.name} | Madeira Live Cams`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content={uk ? 'uk_UA' : 'en_GB'} />
        <meta name="twitter:card" content={hasPhoto ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={r.name} />
        <meta name="twitter:description" content={description} />
        {hasPhoto && (
          <>
            <meta property="og:image" content={`${ORIGIN}${r.image}`} />
            <meta property="og:image:alt" content={r.name} />
            <meta name="twitter:image" content={`${ORIGIN}${r.image}`} />
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      </Head>
      <main className="page-shell">
        <Link href="/trip-plan" className={actionClass}>← {uk ? 'До планувальника' : 'Back to trip planner'}</Link>
        <article className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <RestaurantPhoto src={r.image} name={r.name} locale={locale} available={hasPhoto} />
          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">{uk ? 'Ресторан' : 'Restaurant'} · {r.area}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{r.name}</h1>
            <p className="mt-4 text-lg font-semibold text-navy">
              <span aria-hidden="true">★ </span>{r.rating.toLocaleString(locale, { minimumFractionDigits: 1 })} / 5
              <span className="text-sm font-normal text-slate-600"> · {r.reviewCount.toLocaleString(locale)} {uk ? 'відгуків у Google Maps' : 'Google Maps reviews'}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {uk ? 'Перевірено' : 'Checked'} <time dateTime={r.checkedAt}>{r.checkedAt}</time> · {uk ? 'Оцінка може змінюватися' : 'Rating may change'}
            </p>
            {r.temporarilyClosed && (
              <p role="note" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                {uk ? 'Google Maps позначає заклад як тимчасово закритий. Перед поїздкою уточніть, чи він відновив роботу.' : 'Google Maps marks this venue as temporarily closed. Confirm that it has reopened before travelling.'}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={planner} className={`${actionClass} bg-ocean text-white`}>+ {uk ? 'До плану' : 'Add to plan'}</Link>
              <div className="relative">
                <button type="button" onClick={() => setRouteOpen((current) => !current)} aria-expanded={routeOpen} aria-controls="restaurant-route-options" className={`${actionClass} bg-ocean text-white`}>
                  🗺️ {uk ? 'Маршрут' : 'Route'}
                </button>
                {routeOpen && (
                  <div id="restaurant-route-options" className="absolute left-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(position)}&travelmode=driving`} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">Google Maps</a>
                    <a href={`https://www.waze.com/ul?ll=${encodeURIComponent(position)}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">Waze</a>
                    <button type="button" onClick={() => setRouteOpen(false)} className="block w-full px-3 py-2 text-left text-sm">{uk ? 'Закрити' : 'Close'}</button>
                  </div>
                )}
              </div>
              <button type="button" onClick={share} className={actionClass}>{copied ? (uk ? 'Скопійовано' : 'Copied') : (uk ? 'Поділитися' : 'Share')}</button>
            </div>
            <p className="mt-6 leading-7 text-slate-700">{description}</p>
            <section className="mt-8" aria-labelledby="restaurant-reviews">
              <h2 id="restaurant-reviews" className="text-xl font-semibold text-navy">{uk ? 'Що кажуть відвідувачі' : 'What visitors say'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {uk
                  ? `Редакційний підсумок вибірки з ${r.reviewSampleSize} доступних відгуків у Google Maps. Він не визначає думки серед усіх ${r.reviewCount.toLocaleString(locale)} відгуків.`
                  : `An editorial summary of ${r.reviewSampleSize} available Google Maps reviews. It does not represent all ${r.reviewCount.toLocaleString(locale)} reviews.`}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-panel p-4">
                  <h3 className="font-semibold text-navy">{uk ? 'Що хвалять' : 'What guests praise'}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{r.praised[locale] || (uk ? 'Текстів відгуків поки недостатньо для висновку.' : 'Not enough review text is available to draw a conclusion.')}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-semibold text-navy">{uk ? 'Зауваження гостей' : 'Guest criticisms'}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{r.criticism?.[locale] ?? (uk ? 'У прочитаній вибірці конкретних зауважень не виявлено. Це не означає, що негативних відгуків немає.' : 'No specific criticism was found in the sample read. This does not mean there are no negative reviews.')}</p>
                </div>
              </div>
              <a href={r.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-ocean underline">{uk ? 'Переглянути відгуки в Google Maps' : 'Read reviews on Google Maps'} ↗</a>
            </section>
            <section className="mt-8 rounded-xl bg-panel p-4">
              <h2 className="font-semibold text-navy">{uk ? 'Перед відвідуванням' : 'Before visiting'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{uk ? 'Уточніть години роботи, меню та наявність столика. Позначка прийому їжі у планувальнику не підтверджує графік закладу.' : 'Confirm opening hours, menu and table availability. Meal labels in the planner do not confirm opening hours.'}</p>
            </section>
            <a href={r.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={`${actionClass} mt-8`}>📍 {uk ? 'Відкрити точку на карті' : 'View location on map'}</a>
          </div>
        </article>
      </main>
    </Layout>
  );
}
