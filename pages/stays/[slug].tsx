import PlaceStructuredData from '../../components/PlaceStructuredData';
import { withStaticTranslations, withServerTranslations, translatedStaticProps } from '../../lib/i18n/pageTranslations';
import { useText } from '../../lib/i18n/TranslationProvider';
import { useState } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMessages } from '../../lib/i18n/useMessages';
import { getStayBySlug, stays, type Stay } from '../../data/stays';
type Props = {
    stay: Stay;
};
export default function StayPage({ stay }: Props) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const { locale } = useMessages();
    const uk = locale === 'uk';
    const [routeOpen, setRouteOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const description = stay.shortDescription[locale];
    const url = `https://madeiralivecams.com${translationLanguage === "en" ? "" : "/" + translationLanguage}/stays/${stay.slug}`;
    const coordinates = `${stay.latitude},${stay.longitude}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}&travelmode=driving`;
    const wazeUrl = `https://www.waze.com/ul?ll=${encodeURIComponent(coordinates)}&navigate=yes`;
    const actionClass = 'inline-flex h-10 items-center justify-center rounded-lg border border-ocean px-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2';
    const share = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: localize(localizeFormat("__VAR_0__ | Madeira Live Cams", stay.name)),
                    text: localize(uk ? `Перегляньте ${stay.name} на Madeira Live Cams` : localizeFormat("See __VAR_0__ on Madeira Live Cams", stay.name)),
                    url
                });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError')
                return;
            window.prompt(localize(uk ? 'Скопіюйте це посилання:' : 'Copy this link:'), url);
        }
    };
    return (<Layout><PlaceStructuredData name={stay.name} description={description} url={url} mapUrl={mapsUrl}/>
      <Head>
        <title>{[localize(stay.name), localize(" | Madeira Live Cams")].join("")}</title>
        <meta name="description" content={localize(description)}/>
        <meta property="og:title" content={localize(localizeFormat("__VAR_0__ | Madeira Live Cams", stay.name))}/>
        <meta property="og:description" content={localize(description)}/>
        <meta property="og:type" content="article"/>
        <meta property="og:url" content={url}/>
        <meta property="og:locale" content={({ en: "en_GB", pt: "pt_PT", de: "de_DE", fr: "fr_FR", es: "es_ES", pl: "pl_PL", uk: "uk_UA" })[translationLanguage]}/>
        <meta name="twitter:card" content="summary"/>
        <meta name="twitter:title" content={localize(stay.name)}/>
        <meta name="twitter:description" content={localize(description)}/>
      </Head>
      <main className="page-shell">
        <Link href="/trip-plan" locale={translationLanguage} className={actionClass}>{localize("\u2190 ")}{localize(uk ? 'Назад' : 'Back')}</Link>
        <article className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-slate-100">
            <Image src="/images/cameras/madeira-camera-2.png" alt={localize(uk ? 'Карта Мадейри' : 'Madeira map')} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px"/>
          </div>
          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">{localize(uk ? 'Маршрут до вілли' : 'Route to the villa')}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{localize(stay.name)}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="relative">
                <button type="button" onClick={() => setRouteOpen((current) => !current)} aria-expanded={routeOpen} aria-controls="stay-route-options" className={`${actionClass} bg-ocean text-white`}>{localize("\uD83D\uDDFA\uFE0F")}{localize(uk ? 'Маршрут' : 'Route')}
                </button>
                {localize(routeOpen && (<div id="stay-route-options" className="absolute left-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">{localize("Google Maps")}</a>
                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">{localize("Waze")}</a>
                    <button type="button" onClick={() => setRouteOpen(false)} className="block w-full px-3 py-2 text-left text-sm">{localize(uk ? 'Закрити' : 'Close')}</button>
                  </div>))}
              </div>
              <button type="button" onClick={share} className={actionClass}>{localize(copied ? (uk ? 'Скопійовано' : 'Copied') : (uk ? 'Поділитися' : 'Share'))}</button>
            </div>
            <p className="mt-5 text-base leading-7 text-slate-700">{localize(description)}</p>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {localize(uk ? 'Інформація про віллу та точка повернення для програми подорожі.' : 'Villa information and a return point for a day-trip programme.')}
            </p>
            <section className="mt-8 rounded-xl bg-panel p-4">
              <h2 className="font-semibold text-navy">{localize(uk ? 'Координати' : 'Coordinates')}</h2>
              <p className="mt-2 font-mono text-sm leading-6 text-slate-600">{localize(stay.latitude.toFixed(6))}{localize(", ")}{localize(stay.longitude.toFixed(6))}</p>
            </section>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`${actionClass} mt-8`}>{localize("\uD83D\uDCCD ")}{localize(uk ? 'Відкрити точку на карті' : 'View location on map')}</a>
          </div>
        </article>
      </main>
    </Layout>);
}
export const getStaticPaths: GetStaticPaths = async () => ({
    paths: stays.flatMap((stay) => ["en", "pt", "de", "fr", "es", "pl", "uk"].map((locale) => ({ params: { slug: stay.slug }, locale }))),
    fallback: false,
});
export const getStaticProps: GetStaticProps<Props> = withStaticTranslations<Props>(async ({ params }) => {
    const slug = params?.slug;
    const stay = typeof slug === 'string' ? getStayBySlug(slug) : undefined;
    if (!stay)
        return { notFound: true };
    return { props: { stay } };
}, "/stays/[slug]");
