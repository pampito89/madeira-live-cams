import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';
const text = {
  en: { title: 'Page not found', body: 'This page does not exist or its address has changed.', home: 'Back to the homepage' },
  pt: { title: 'Página não encontrada', body: 'Esta página não existe ou o seu endereço mudou.', home: 'Voltar à página inicial' },
  de: { title: 'Seite nicht gefunden', body: 'Diese Seite existiert nicht oder ihre Adresse hat sich geändert.', home: 'Zur Startseite' },
  fr: { title: 'Page introuvable', body: 'Cette page n’existe pas ou son adresse a changé.', home: 'Retour à l’accueil' },
  es: { title: 'Página no encontrada', body: 'Esta página no existe o su dirección ha cambiado.', home: 'Volver al inicio' },
  pl: { title: 'Nie znaleziono strony', body: 'Ta strona nie istnieje lub jej adres uległ zmianie.', home: 'Wróć na stronę główną' },
  uk: { title: 'Сторінку не знайдено', body: 'Цієї сторінки не існує або її адресу змінено.', home: 'На головну' },
};
export default function NotFound() {
  const { siteLocale } = useMessages();
  const copy = text[siteLocale];
  return <Layout>
    <Head><title>{`${copy.title} | Madeira Live Cams`}</title><meta name="robots" content="noindex,follow" /></Head>
    <main className="page-shell py-16 text-center">
      <p className="text-sm font-semibold text-ocean">404</p>
      <h1 className="mt-3 text-3xl font-bold text-navy">{copy.title}</h1>
      <p className="mt-4 text-slate-600">{copy.body}</p>
      <Link href="/" locale={siteLocale} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-ocean px-5 py-2 font-semibold text-white">{copy.home}</Link>
    </main>
  </Layout>;
}
