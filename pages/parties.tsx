import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { withServerTranslations } from '../lib/i18n/pageTranslations';
import { useMessages } from '../lib/i18n/useMessages';
import { events, categories, municipalities, eventSources, type IslandEvent } from '../data/events';
import { filterEvents, madeiraDate, monthDays, shiftMonth } from '../lib/events';
import styles from '../styles/events.module.css';

const icons: Record<string, string> = { Festivals: '✦', Music: '♫', Nightlife: '◒', Sport: '⚑', Food: '♨', Culture: '◇', Talks: '◎' };
export default function PartiesPage({ initialEvents, today }: { initialEvents: IslandEvent[]; today: string }) {
  const { siteLocale } = useMessages();
  const uk = siteLocale === 'uk';
  const t = (en: string, ua: string) => uk ? ua : en;
  const [query, setQuery] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState(today.slice(0, 7));
  const [calendar, setCalendar] = useState(false);
  const filtered = filterEvents(initialEvents, { today, query, municipality, category, date });
  const calendarEvents = filterEvents(initialEvents, { today, query, municipality, category });
  const formatDate = (value: string) => new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
  const title = t('Madeira events, festivals & parties', 'Події, свята та вечірки Мадейри');
  const description = t('Find festivals, concerts, rallies and local celebrations across Madeira and Porto Santo, with dates, sources and organiser links.', 'Свята, концерти, ралі та місцеві події Мадейри й Порту-Санту: дати, джерела та посилання на організаторів.');
  const reset = () => { setQuery(''); setMunicipality(''); setCategory(''); setDate(''); };
  const categoryName = (value: string) => uk ? ({ Festivals: 'Свята', Music: 'Музика', Nightlife: 'Вечірки', Sport: 'Спорт', Food: 'Гастрономія', Culture: 'Культура', Talks: 'Лекції' } as Record<string, string>)[value] : value;
  return <Layout>
    <Head>
      <title>{title} | Madeira Live Cams</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: `https://madeiralivecams.com${siteLocale === 'en' ? '' : `/${siteLocale}`}/parties`, mainEntity: { '@type': 'ItemList', itemListElement: initialEvents.map((event, index) => ({ '@type': 'ListItem', position: index + 1, name: event.title, url: event.sourceUrl })) } }).replace(/</g, '\\u003c') }} />
    </Head>
    <div className={`page-shell ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>MADEIRA · PORTO SANTO</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className={styles.heroBottom}><span>{t('11 municipalities. One island agenda.', '11 муніципалітетів. Одна афіша островів.')}</span><a href="#event-sources">{t('Explore sources', 'Джерела анонсів')} ↗</a></div>
      </header>
      <section className={styles.controls} aria-label={t('Filter events', 'Фільтри подій')}>
        <label>{t('Search', 'Пошук')}<input type="search" placeholder={t('Event, place or artist', 'Подія, місце або артист')} value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label>{t('Municipality', 'Муніципалітет')}<select value={municipality} onChange={e => setMunicipality(e.target.value)}><option value="">{t('All municipalities', 'Усі муніципалітети')}</option>{municipalities.map(name => <option key={name}>{name}</option>)}</select></label>
        <label>{t('Date', 'Дата')}<input type="date" min={today} value={date} onChange={e => { setDate(e.target.value); if (e.target.value) setMonth(e.target.value.slice(0, 7)); }} /></label>
        <button type="button" onClick={reset}>{t('Clear filters', 'Скинути фільтри')}</button>
        <div className={styles.categories}><button type="button" aria-pressed={!category} onClick={() => setCategory('')}>{t('Everything', 'Усе')}</button>{categories.map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(category === name ? '' : name)}>{icons[name]} {categoryName(name)}</button>)}</div>
      </section>
      <div className={styles.toolbar}><p role="status">{filtered.length} {t('events', 'подій')}{date ? ` · ${formatDate(date)}` : ''}</p><div><button type="button" aria-pressed={!calendar} onClick={() => setCalendar(false)}>{t('Feed', 'Стрічка')}</button><button type="button" aria-pressed={calendar} onClick={() => setCalendar(true)}>{t('Calendar', 'Календар')}</button></div></div>
      {calendar && <section className={styles.calendar} aria-label={t('Events calendar', 'Календар подій')}>
        <div className={styles.month}><button type="button" aria-label={t('Previous month', 'Попередній місяць')} onClick={() => setMonth(shiftMonth(month, -1))}>←</button><h2>{new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`))}</h2><button type="button" aria-label={t('Next month', 'Наступний місяць')} onClick={() => setMonth(shiftMonth(month, 1))}>→</button></div>
        <div className={styles.days}>{(uk ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(day => <span className={styles.weekday} key={day}>{day}</span>)}{monthDays(month).map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />;
          const count = calendarEvents.filter(event => event.start <= day && event.end >= day && day >= today).length;
          return <button type="button" key={day} disabled={day < today} aria-pressed={date === day} aria-label={`${formatDate(day)}: ${count} ${t('events', 'подій')}`} onClick={() => setDate(date === day ? '' : day)}><span>{Number(day.slice(-2))}</span>{count > 0 && <small>{count}<span className={styles.dayLabel}> {t('events', 'подій')}</span></small>}</button>;
        })}</div>
      </section>}
      <p className={styles.notice}>{t('Editorial selection · dates checked 23 October 2026. New announcements are added after review; this is not a complete live feed. Confirm times, admission and changes with the organiser.', 'Редакційна добірка · дати перевірено 23 жовтня 2026. Нові анонси додаються після перевірки; це не повна автоматична стрічка. Час, умови входу та зміни уточнюйте в організатора.')}</p>
      <section className={styles.grid} aria-label={t('Upcoming events', 'Найближчі події')}>
        {filtered.map(event => <article key={event.id} className={styles.card}>
          {event.image ? <figure><img src={event.image.src} alt={event.image.alt} loading="lazy" width="640" height="320" onError={e => { e.currentTarget.style.display = 'none'; }} /><figcaption>{event.image.credit}</figcaption></figure> : <div className={styles.art} data-category={event.category} aria-hidden="true"><span>{icons[event.category]}</span><small>MADEIRA / {event.category.toUpperCase()}</small></div>}
          <div className={styles.cardBody}>
            <div className={styles.tags}><span>{categoryName(event.category)}</span>{event.start <= today && <span>{t('Happening now', 'Триває зараз')}</span>}</div>
            <p className={styles.date}><time dateTime={event.start}>{formatDate(event.start)}</time>{event.end !== event.start && <> — <time dateTime={event.end}>{formatDate(event.end)}</time></>}</p>
            <h2>{event.title}</h2><p>{event.description}</p>
            <p className={styles.venue}>⌖ {event.venue}<br /><small>{event.municipalities.join(' · ')}</small></p>
            <div className={styles.links}><a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">{t('Programme & details', 'Програма та деталі')} ↗</a>{event.ticketUrl && <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">{t('Tickets', 'Квитки')} ↗</a>}</div>
            <p className={styles.source}>{event.source} · {t('Checked', 'Перевірено')} {formatDate(event.checkedAt)}</p>
          </div>
        </article>)}
      </section>
      {filtered.length === 0 && <div className={styles.empty}><h2>{t('No verified events match these filters', 'За цими фільтрами перевірених подій немає')}</h2><p>{t('Try another date or browse the sources below for new announcements.', 'Оберіть іншу дату або перегляньте нові анонси в джерелах нижче.')}</p><button type="button" onClick={reset}>{t('Show all events', 'Показати всі події')}</button></div>}
      <section id="event-sources" className={styles.sources}><h2>{t('More around the islands', 'Більше подій на островах')}</h2><p>{t('Official agendas, ticket services and organisers. Links open their websites; availability and prices are confirmed there.', 'Офіційні афіші, квиткові сервіси та організатори. Посилання ведуть на їхні сайти; наявність квитків і ціни перевіряйте там.')}</p><div>{eventSources.map(source => <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.name} ↗</strong><span>{source.description}</span></a>)}</div></section>
    </div>
  </Layout>;
}
export const getServerSideProps = withServerTranslations(async () => {
  const today = madeiraDate();
  return { props: { initialEvents: filterEvents(events, { today }), today } };
}, '/parties');
