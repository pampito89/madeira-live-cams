import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from './Layout';
import ActivityPhoto from './ActivityPhoto';
import type { Activity } from '../data/activities';
import { useMessages } from '../lib/i18n/useMessages';

type Props = { restaurant: Activity; hasPhoto: boolean };
const ORIGIN = 'https://madeiralivecams.com';

export default function ActivityPage({ restaurant: activity, hasPhoto }: Props) {
  const router = useRouter();
  const { locale } = useMessages();
  const uk = locale === 'uk';
  const [routeOpen, setRouteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `${ORIGIN}${uk ? '/uk' : ''}/explore/${activity.slug}`;
  const description = activity.summary[locale];
  const position = `${activity.latitude},${activity.longitude}`;
  const actionClass = 'inline-flex h-10 items-center justify-center rounded-lg border border-ocean px-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2';

  const handleBack = () => {
    if (router.query.returnTo === 'cameras') return void router.push('/cameras?restore=1');
    if (router.query.returnTo === 'home') return void router.push('/?restoreCameraFilter=1');
    if (window.history.length > 1) return void router.back();
    return void router.push('/cameras');
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: activity.name, text: description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.prompt(uk ? 'Скопіюйте посилання:' : 'Copy this link:', url);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: activity.name,
    url,
    description,
    hasMap: activity.googleMapsUrl,
    geo: { '@type': 'GeoCoordinates', latitude: activity.latitude, longitude: activity.longitude },
    ...(hasPhoto ? { image: `${ORIGIN}${activity.image}` } : {}),
  };

  return (
    <Layout>
      <Head>
        <title>{activity.name} — {activity.area} | Madeira Live Cams</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${activity.name} | Madeira Live Cams`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:locale" content={uk ? 'uk_UA' : 'en_GB'} />
        <meta name="twitter:card" content={hasPhoto ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={activity.name} />
        <meta name="twitter:description" content={description} />
        {hasPhoto && (
          <>
            <meta property="og:image" content={`${ORIGIN}${activity.image}`} />
            <meta property="og:image:alt" content={activity.name} />
            <meta name="twitter:image" content={`${ORIGIN}${activity.image}`} />
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      </Head>
      <main className="page-shell">
        <button type="button" onClick={handleBack} className={actionClass}>← {uk ? 'Назад' : 'Back'}</button>
        <article className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ActivityPhoto src={activity.image} name={activity.name} locale={locale} available={hasPhoto} />
          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">{uk ? 'Активний відпочинок' : 'Outdoor activities'} · {activity.area}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{activity.name}</h1>
            <p className="mt-4 text-lg font-semibold text-navy">
              <span aria-hidden="true">★ </span>{activity.rating.toLocaleString(locale, { minimumFractionDigits: 1 })} / 5
              <span className="text-sm font-normal text-slate-600"> · {activity.reviewCount.toLocaleString(locale)} {uk ? 'відгуків у Google Maps' : 'Google Maps reviews'}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {uk ? 'Перевірено' : 'Checked'} <time dateTime={activity.checkedAt}>{activity.checkedAt}</time> · {uk ? 'Оцінка може змінюватися' : 'Rating may change'}
            </p>
            {activity.temporarilyClosed && (
              <p role="note" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                {uk ? 'Google Maps позначає заклад як тимчасово закритий. Уточніть стан перед поїздкою.' : 'Google Maps marks this venue as temporarily closed. Confirm its status before travelling.'}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/trip-plan?addLocation=${encodeURIComponent(activity.slug)}`} className={`${actionClass} bg-ocean text-white`}>+ {uk ? 'До плану' : 'Add to plan'}</Link>
              <div className="relative">
                <button type="button" onClick={() => setRouteOpen((current) => !current)} aria-expanded={routeOpen} aria-controls="activity-route-options" className={`${actionClass} bg-ocean text-white`}>
                  🗺️ {uk ? 'Маршрут' : 'Route'}
                </button>
                {routeOpen && (
                  <div id="activity-route-options" className="absolute left-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(position)}&travelmode=driving`} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">Google Maps</a>
                    <a href={`https://www.waze.com/ul?ll=${encodeURIComponent(position)}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">Waze</a>
                    <button type="button" onClick={() => setRouteOpen(false)} className="block w-full px-3 py-2 text-left text-sm">{uk ? 'Закрити' : 'Close'}</button>
                  </div>
                )}
              </div>
              <button type="button" onClick={share} className={actionClass}>{copied ? (uk ? 'Скопійовано' : 'Copied') : (uk ? 'Поділитися' : 'Share')}</button>
            </div>
            <p className="mt-6 leading-7 text-slate-700">{description}</p>
            <section className="mt-8" aria-labelledby="activity-reviews">
              <h2 id="activity-reviews" className="text-xl font-semibold text-navy">{uk ? 'Що кажуть відвідувачі' : 'What visitors say'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {uk
                  ? `Редакційний підсумок вибірки з ${activity.reviewSampleSize} доступних відгуків у Google Maps. Він не представляє всі ${activity.reviewCount.toLocaleString(locale)} відгуків.`
                  : `An editorial summary of ${activity.reviewSampleSize} available Google Maps reviews. It does not represent all ${activity.reviewCount.toLocaleString(locale)} reviews.`}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-panel p-4">
                  <h3 className="font-semibold text-navy">{uk ? 'Що хвалять' : 'What guests praise'}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{activity.praised[locale] || (uk ? 'Недостатньо текстів відгуків для висновку.' : 'Not enough review text is available to draw a conclusion.')}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-semibold text-navy">{uk ? 'Зауваження гостей' : 'Guest criticisms'}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{activity.criticism?.[locale] ?? (uk ? 'У прочитаній вибірці конкретних зауважень не виявлено. Це не означає, що негативних відгуків немає.' : 'No specific criticism was found in the sample read. This does not mean there are no negative reviews.')}</p>
                </div>
              </div>
              <a href={activity.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-ocean underline">{uk ? 'Переглянути відгуки в Google Maps' : 'Read reviews on Google Maps'} ↗</a>
            </section>
            <section className="mt-8 rounded-xl bg-panel p-4">
              <h2 className="font-semibold text-navy">{uk ? 'Перед відвідуванням' : 'Before visiting'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{activity.practical[locale]}</p>
              <a href={activity.website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-ocean underline">{uk ? 'Офіційний сайт і бронювання' : 'Official website and booking'} ↗</a>
            </section>
            <a href={activity.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={`${actionClass} mt-8`}>📍 {uk ? 'Відкрити точку на карті' : 'View location on map'}</a>
          </div>
        </article>
      </main>
    </Layout>
  );
}
