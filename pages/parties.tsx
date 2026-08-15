import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';

type PartyEvent = {
  name: string;
  description: string;
  startDate: string | null;
  venue: string | null;
  address: string | null;
  image: string | null;
  eventUrl: string;
};

type Result = {
  event: PartyEvent | null;
  instagramUrl?: string;
  error?: string;
};

function dateTime(value: string, locale: 'en' | 'uk') {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Atlantic/Madeira',
  }).format(new Date(value));
}

export default function PartiesPage() {
  const { locale } = useMessages();

  const [result, setResult] = useState<Result | null>(null);

  const uk = locale === 'uk';

  useEffect(() => {
    fetch('/api/parties/current')
      .then((response) => response.json())
      .then((data: Result) => setResult(data))
      .catch(() =>
        setResult({
          event: null,
          error: uk
            ? 'Не вдалося завантажити актуальну подію.'
            : 'Unable to load the current event.',
        }),
      );
  }, [uk]);

  const instagramUrl =
    result?.instagramUrl || 'https://www.instagram.com/thepurplefridays/';

  return (
    <Layout>
      <Head>
        <title>
          {uk
            ? 'Вечірки та події | Madeira Live Cams'
            : 'Parties & Events | Madeira Live Cams'}
        </title>

        <meta
          name="description"
          content={
            uk
              ? 'Актуальні вечірки на Madeira.'
              : 'Current parties and events in Madeira.'
          }
        />

        <link
          rel="canonical"
          href="https://madeiralivecams.com/parties"
        />
      </Head>

      <main className="page-shell">
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-[#26133f] via-[#59347a] to-[#d7688d] px-5 py-8 text-white shadow-lg sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
            {uk ? 'Нічне життя Madeira' : 'Madeira nightlife'}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {uk ? 'Вечірки та події' : 'Parties & events'}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">
            {uk
              ? 'Актуальна подія від The Purple Fridays. Інформація автоматично оновлюється з Instagram і сторінки квитків.'
              : 'The current event from The Purple Fridays. Information updates automatically from Instagram and the ticket page.'}
          </p>
        </section>

        {!result && (
          <section className="rounded-2xl border border-moss/50 bg-white p-6 text-sm text-slate-600 shadow-sm">
            {uk ? 'Шукаємо актуальну подію…' : 'Finding the current event…'}
          </section>
        )}

        {result?.event && (
          <article className="overflow-hidden rounded-2xl border border-moss/50 bg-white shadow-sm">
            {result.event.image && (
              <img
                src={result.event.image}
                alt={result.event.name}
                className="h-56 w-full object-cover sm:h-80"
              />
            )}

            <div className="p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">
                {uk ? 'Актуальна подія' : 'Current event'}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
                {result.event.name}
              </h2>

              {result.event.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  {result.event.description}
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {result.event.startDate && (
                  <div className="rounded-xl bg-panel p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {uk ? 'Дата й час' : 'Date & time'}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-navy">
                      {dateTime(result.event.startDate, locale)}
                    </p>
                  </div>
                )}

                {(result.event.venue || result.event.address) && (
                  <div className="rounded-xl bg-panel p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {uk ? 'Локація' : 'Location'}
                    </p>

                    {result.event.venue && (
                      <p className="mt-1 text-sm font-semibold text-navy">
                        {result.event.venue}
                      </p>
                    )}

                    {result.event.address && (
                      <p className="mt-1 text-sm text-slate-600">
                        {result.event.address}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <a
                  href={result.event.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-ocean px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest"
                >
                  {uk ? 'Квитки та деталі' : 'Tickets & details'}
                </a>

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-ocean bg-white px-4 py-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white"
                >
                  {uk ? 'Instagram організатора' : 'Organiser Instagram'}
                </a>
              </div>
            </div>
          </article>
        )}

        {result && !result.event && (
          <section className="rounded-2xl border border-moss/50 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-navy">
              The Purple Fridays
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {result.error ||
                (uk
                  ? 'Зараз немає посилання на найближчу вечірку.'
                  : 'There is no link to an upcoming party at the moment.')}
            </p>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-lg bg-ocean px-4 py-3 text-sm font-semibold text-white"
            >
              Instagram
            </a>
          </section>
        )}
      </main>
    </Layout>
  );
}