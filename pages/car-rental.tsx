import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import Layout from '../components/Layout';
import RentalDateRange, { madeiraToday, displayRentalDate, type RentalPeriod } from '../components/RentalDateRange';

const ORIGIN = 'https://madeiralivecams.com';
const TITLE = 'Оренда авто на Мадейрі — Nissan та MINI | Madeira Live Cams';
const DESCRIPTION = 'Оренда авто на Мадейрі: білий Nissan Qashqai e-Power — 70 €/добу, синій MINI Countryman S ALL4 — 65 €/добу. Уточніть дати та умови у WhatsApp.';
const cars = [
  { id: 'nissan', name: 'Nissan Qashqai e-Power', color: 'Білий', price: 70, image: '/images/car-rental/nissan.jpg', height: 629, author: 'Charles', source: 'https://commons.wikimedia.org/wiki/File:Nissan_Qashqai_1.5_VC-T_e-Power_(2022)_(52923642819).jpg', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/' },
  { id: 'mini', name: 'MINI Countryman S ALL4', color: 'Синій', price: 65, image: '/images/car-rental/mini.jpg', height: 558, author: 'Vauxford', source: 'https://commons.wikimedia.org/wiki/File:2018_Mini_Cooper_Countryman_S_Front.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
];
const fieldClass = 'mt-2 block min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean';
const breadcrumbs = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Головна', item: `${ORIGIN}/uk` },
    { '@type': 'ListItem', position: 2, name: 'Оренда авто', item: `${ORIGIN}/uk/car-rental` },
  ],
};
export default function CarRentalPage() {
  const [carId, setCarId] = useState(cars[0].id);
  const [period, setPeriod] = useState<RentalPeriod>({ start: '', end: '' });
  const [error, setError] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const { start, end } = period;
    const note = String(fields.get('note') ?? '').trim();
    const car = cars.find(item => item.id === fields.get('car')) ?? cars[0];
    if ((start && start < madeiraToday()) || (end && end < madeiraToday())) {
      setError('Оберіть сьогоднішню або майбутню дату.');
      return;
    }
    if ((start && !end) || (!start && end)) {
      setError('Оберіть дату повернення в календарі або очистіть дати, якщо ще плануєте подорож.');
      return;
    }
    if (start && end && end <= start) {
      setError('Дата повернення має бути пізнішою за дату отримання.');
      return;
    }
    setError('');
    const message = [
      'Вітаю! Цікавить оренда авто на Мадейрі.',
      `Авто: ${car.name} (${car.color.toLowerCase()}).`,
      `Ціна на сайті: ${car.price} €/добу.`,
      `Отримання: ${displayRentalDate(start)}.`,
      `Повернення: ${displayRentalDate(end)}.`,
      note ? `Побажання: ${note}` : '',
      'Підкажіть, будь ласка, доступність, місце отримання та повні умови оренди.',
    ].filter(Boolean).join('\n');
    window.location.assign(`https://wa.me/351932006352?text=${encodeURIComponent(message)}`);
  };
  return <>
    <Head>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="uk_UA" />
      <meta property="og:image" content={`${ORIGIN}${cars[0].image}`} />
      <meta property="og:image:alt" content="Ілюстративне фото білого Nissan Qashqai e-Power" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={`${ORIGIN}${cars[0].image}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    </Head>
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav aria-label="Навігаційний шлях" className="mb-6 flex gap-2 text-sm text-slate-600">
          <Link href="/" locale="uk" className="text-ocean hover:underline">Головна</Link><span aria-hidden="true">/</span><span aria-current="page">Оренда авто</span>
        </nav>
        <header className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-ocean">Мадейра у вашому темпі</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-5xl">Оренда авто на Мадейрі</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">Оберіть авто та уточніть доступність на ваші дати у WhatsApp.</p>
        </header>
        <section aria-label="Авто для оренди" className="grid gap-6 md:grid-cols-2">
          {cars.map((item, index) => <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <figure>
              <div className="relative bg-slate-100">
                <img src={item.image} alt={`Ілюстративне фото: ${item.color.toLowerCase()} ${item.name}`} width={960} height={item.height} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" className="aspect-[16/10] w-full object-contain" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700">Ілюстративне фото</span>
              </div>
            </figure>
            <div className="p-5 sm:p-6">
              <p className="text-sm font-medium text-ocean">{item.color}</p>
              <h2 className="mt-1 text-xl font-bold text-navy sm:text-2xl">{item.name}</h2>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-slate-600"><span className="text-3xl font-bold text-navy">{item.price} €</span> / добу</p>
                <a href="#rental-contact" onClick={() => { setCarId(item.id); setError(''); }} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ocean px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2" aria-label={`Забронювати ${item.name}`}>Забронювати</a>
              </div>
            </div>
          </article>)}
        </section>
        <p className="mt-4 text-sm leading-6 text-slate-600">Фото показують моделі авто; рік випуску та комплектація автомобіля в оренді можуть відрізнятися. Наявність, заставу, страхування, ліміт пробігу й місце отримання узгодьте перед бронюванням.</p>
        <section id="rental-contact" aria-labelledby="contact-title" className="mt-10 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean">Зв’язок українською</p>
            <h2 id="contact-title" className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Запитайте про вільні дати</h2>
            <p className="mt-3 leading-7 text-slate-600">Виберіть авто, додайте дати та побажання. Кнопка відкриє WhatsApp із готовим текстом — ви зможете перевірити його перед надсиланням.</p>
          </div>
          <form onSubmit={submit} onInput={() => setError('')} className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-navy sm:col-span-2">Автомобіль
              <select name="car" value={carId} onChange={event => setCarId(event.target.value)} className={fieldClass}>{cars.map(item => <option key={item.id} value={item.id}>{item.name} — {item.price} €/добу</option>)}</select>
            </label>
            <RentalDateRange value={period} onChange={next => { setPeriod(next); setError(''); }} />
            <label className="block text-sm font-semibold text-navy sm:col-span-2">Побажання (необов’язково)
              <textarea name="note" rows={3} maxLength={1000} placeholder="Наприклад, місце отримання авто" className={fieldClass} />
            </label>
            {error && <p role="alert" className="text-sm font-medium text-red-700 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 sm:w-auto">Забронювати</button>
              <p className="mt-2 text-xs leading-5 text-slate-500">Сайт не зберігає дані цієї форми. Натискання кнопки передає текст у WhatsApp і не підтверджує бронювання.</p>
              <noscript><p className="mt-3"><a className="text-ocean underline" href="https://wa.me/351932006352">Відкрити WhatsApp без заповнення форми</a></p></noscript>
            </div>
          </form>
        </section>
        <details className="mt-6 text-xs leading-5 text-slate-500">
          <summary className="w-fit cursor-pointer rounded py-2 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean">Джерела фото</summary>
          <ul className="mt-2 space-y-2">
            {cars.map(item => <li key={item.id}>{item.name}: <a href={item.source} target="_blank" rel="noreferrer" className="underline">{item.author} / Wikimedia Commons</a> · <a href={item.licenseUrl} target="_blank" rel="noreferrer" className="underline">{item.license}</a>. Зменшено, без інших змін.</li>)}
          </ul>
        </details>
      </div>
    </Layout>
  </>;
}
export const getStaticProps: GetStaticProps = async ({ locale }) => locale === 'uk' ? { props: {} } : { notFound: true };
