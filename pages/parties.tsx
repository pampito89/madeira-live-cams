import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import EventDateFilter from '../components/EventDateFilter';
import { withStaticTranslations } from '../lib/i18n/pageTranslations';
import { useMessages } from '../lib/i18n/useMessages';
import { isSupportedLocale } from '../lib/i18n/config';
import { categories, municipalities } from '../data/events';
import { filterEvents, madeiraDate, type EventDateRange } from '../lib/events';
import { eventText } from '../lib/events/text';
import { eventCategoryName } from '../lib/events/classification';
import { getEventFeed } from '../lib/events/feed';
import type { EventFeed, ImportedEvent } from '../lib/events/types';
import styles from '../styles/events.module.css';

const visibleCategories = categories.filter(category => category !== 'Talks');
const detailLabels = { en: 'Details', uk: 'Деталі', pt: 'Detalhes', de: 'Details', fr: 'Détails', es: 'Detalles', pl: 'Szczegóły' };
const icons: Record<string, string> = { Festivals: '✦', Music: '♫', Nightlife: '◒', Sport: '⚑', Racing: '🏁', Food: '♨', Culture: '◇' };
const artwork: Record<string, string> = { Nightlife: 'madeira-nightlife', Music: 'madeira-festival', Festivals: 'madeira-festivals-day', Sport: 'madeira-sport', Racing: 'madeira-racing', Food: 'madeira-food', Culture: 'madeira-culture' };
function EventBackground({ event }: { event: ImportedEvent }) {
  const [failed, setFailed] = useState(false);
  const fallback = `/images/events/${artwork[event.category] || 'madeira-culture'}.jpg`;
  return <img className={styles.cardImage} src={!failed && event.image ? event.image.src : fallback} alt="" aria-hidden="true" loading="lazy" decoding="async" width="960" height="640" onError={() => setFailed(true)} />;
}
export default function PartiesPage({ initialFeed }: { initialFeed: EventFeed }) {
  const { siteLocale } = useMessages();
  const text = eventText(siteLocale);
  const [storedFeed, setFeed] = useState(initialFeed);
  const feed = storedFeed.locale === siteLocale ? storedFeed : initialFeed;
  const [today, setToday] = useState(initialFeed.today);
  const [connectionError, setConnectionError] = useState(false);
  const [municipality, setMunicipality] = useState('');
  const [category, setCategory] = useState('');
  const [dateRange, setDateRange] = useState<EventDateRange>({ from: '', to: '' });
  useEffect(() => {
    // Keep expired events hidden even when the cached page crosses Madeira midnight.
    const updateDay = () => setToday(madeiraDate());
    updateDay();
    const timer = setInterval(updateDay, 30_000);
    document.addEventListener('visibilitychange', updateDay);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', updateDay); };
  }, []);
  useEffect(() => {
    setFeed(initialFeed); setConnectionError(false);
    const controller = new AbortController(); let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      if (controller.signal.aborted) return;
      if (!document.hidden) {
        try {
          const response = await fetch(`/api/events?locale=${siteLocale}`, { signal: controller.signal });
          if (!response.ok) throw new Error('Unavailable');
          const data: EventFeed = await response.json();
          if (data.locale !== siteLocale || !Array.isArray(data.events) || !Array.isArray(data.sources)) throw new Error('Invalid feed');
          if (!controller.signal.aborted) { setFeed(data); setConnectionError(false); }
        } catch { if (!controller.signal.aborted) setConnectionError(true); }
      }
      if (!controller.signal.aborted) timer = setTimeout(refresh, 60_000);
    };
    timer = setTimeout(refresh, 1500);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [siteLocale, initialFeed]);
  const visibleEvents = feed.events.filter(event => event.category !== 'Talks' && event.end >= today);
  const filtered = filterEvents(visibleEvents, { today, municipality, category, dateRange }) as ImportedEvent[];
  const formatDate = (value: string) => new Intl.DateTimeFormat(siteLocale === 'en' ? 'en-GB' : siteLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Atlantic/Madeira' }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
  const formatUpdated = (value: string) => new Intl.DateTimeFormat(siteLocale === 'en' ? 'en-GB' : siteLocale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(new Date(value));
  const categoryName = (value: typeof categories[number]) => eventCategoryName(siteLocale, value);
  const reset = () => { setMunicipality(''); setCategory(''); setDateRange({ from: '', to: '' }); };
  return <Layout>
    <Head>
      <title>{text.title} | Madeira Live Cams</title>
      <meta name="description" content={text.intro} />
      <meta property="og:title" content={text.title} /><meta property="og:description" content={text.intro} /><meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" /><meta name="twitter:title" content={text.title} /><meta name="twitter:description" content={text.intro} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: text.title, description: text.intro, url: `https://madeiralivecams.com${siteLocale === 'en' ? '' : `/${siteLocale}`}/parties`, mainEntity: { '@type': 'ItemList', itemListElement: visibleEvents.map((event, index) => ({ '@type': 'ListItem', position: index + 1, name: event.title, url: event.sourceUrl })) } }).replace(/</g, '\\u003c') }} />
    </Head>
    <div className={`page-shell ${styles.page}`}>
      <header className={styles.hero}>
        <img className={styles.heroImage} src="/images/events/madeira-festivals-day.jpg" alt="" width="960" height="640" fetchPriority="high" />
        <div className={styles.heroContent}><p className={styles.eyebrow}>MADEIRA · PORTO SANTO</p><h1>{text.title}</h1><p>{text.intro}</p><a href="#event-sources">{text.sources} ↗</a></div>
      </header>
      <section className={styles.controls} aria-label={text.municipality}>
        <label htmlFor="event-municipality">{text.municipality}<select id="event-municipality" value={municipality} onChange={e => setMunicipality(e.target.value)}><option value="">{text.allMunicipalities}</option>{municipalities.map(name => <option key={name}>{name}</option>)}</select></label>
        <EventDateFilter locale={siteLocale} today={today} value={dateRange} onChange={setDateRange} />
        <div className={styles.categories}>
          <button type="button" aria-pressed={!category} onClick={() => setCategory('')}>{text.everything}</button>
          {visibleCategories.map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(category === name ? '' : name)}>{icons[name]} {categoryName(name)}</button>)}
          <button type="button" className={styles.resetFilters} onClick={reset}>{text.clear}</button>
        </div>
      </section>
      <div className={styles.toolbar}><p role="status">{filtered.length} {text.count}</p><span>{text.confirm}</span></div>
      {connectionError && <p className={styles.notice} role="status">{text.connection}</p>}
      {feed.sources.some(source => source.status !== 'fresh') && <p className={styles.notice}>{feed.sources.filter(source => source.status !== 'fresh').map(source => `${source.name}: ${source.status === 'stale' ? text.stale : text.unavailable}`).join(' · ')}</p>}
      <section className={styles.grid} aria-label={text.title}>
        {filtered.map(event => <article key={event.id} className={styles.card}>
          <EventBackground key={`${event.id}:${event.image?.src || ''}`} event={event} />
          <div className={styles.cardBody}>
            <p className={styles.badge}>{icons[event.category]} {categoryName(event.category)}</p>
            <div className={styles.eventContent}>
              <p className={styles.date}><time dateTime={event.start}>{formatDate(event.start)}</time>{event.end !== event.start && <> — <time dateTime={event.end}>{formatDate(event.end)}</time></>}</p>
              <h2>{event.title}</h2>
              <p className={styles.venue}>⌖ {event.municipalities.length ? event.venue : text.unknownVenue}</p>
              <div className={styles.links}><a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">{detailLabels[siteLocale]}</a>{event.ticketUrl && <a className={styles.ticketButton} href={event.ticketUrl} target="_blank" rel="noopener noreferrer">{text.tickets}</a>}</div>
              <p className={styles.source}>{event.source} · {text.updated} <time dateTime={event.fetchedAt}>{formatUpdated(event.fetchedAt)}</time></p>
              {event.image?.credit && <p className={styles.credit}>{event.image.credit}</p>}
            </div>
          </div>
        </article>)}
      </section>
      {!filtered.length && <div className={styles.empty}><h2>{text.empty}</h2><p>{text.emptyHelp}</p><button type="button" onClick={reset}>{text.showAll}</button></div>}
      <section id="event-sources" className={styles.sources}><h2>{text.sources}</h2><div>{feed.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.name} ↗</strong><span>{source.status === 'fresh' ? text.updated : source.status === 'stale' ? text.stale : text.unavailable}{source.fetchedAt ? ` · ${formatUpdated(source.fetchedAt)}` : ''}</span></a>)}</div></section>
    </div>
  </Layout>;
}
// Generate all locales at build time; ISR serves existing HTML while refreshing it.
export const getStaticProps = withStaticTranslations(async ({ locale }) => {
  const initialFeed = await getEventFeed(isSupportedLocale(locale) ? locale : 'en');
  // A complete upstream outage must not replace the last usable ISR page.
  if (initialFeed.sources.every(source => source.status === 'unavailable')) throw new Error('All event sources unavailable');
  return { props: { initialFeed }, revalidate: 300 };
}, '/parties');
