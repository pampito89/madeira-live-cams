import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import Layout from '../components/Layout';
import RentalDateRange, { madeiraToday, displayRentalDate, type RentalPeriod } from '../components/RentalDateRange';

const ORIGIN = 'https://madeiralivecams.com';
const TITLE = 'Оренда авто на Мадейрі — Nissan та MINI | Madeira Live Cams';
const DESCRIPTION = 'Оренда авто на Мадейрі: Nissan Qashqai e-Power — 70 €/добу, MINI Countryman S ALL4 — 65 €/добу. Або 50 €/добу зі страховим депозитом. Бронювання без передоплати.';
const WHATSAPP_URL = 'https://wa.me/380632558450';
const TELEGRAM_URL = 'https://t.me/thomasedison33';
// Model specifications: Qashqai e-Power Tekna+ (2023), MINI Cooper S Countryman ALL4 F60 (2017).
// Nissan: https://www-europe.nissan-cdn.net/content/dam/Nissan/serbia/MAX-ponuda/MAX_QASHQAI_Cenovnik_OKT_2023.v2.pdf
// MINI: https://www.press.bmwgroup.com/france/article/attachment/T0275586FR/396497
// Luggage capacity is measured with rear seats upright; power uses metric horsepower (PS).
const cars = [
  { id: 'nissan', name: 'Nissan Qashqai e-Power', color: 'Білий', price: 70, depositPrice: 50, features: ['Автомат', 'Передній привід', 'Панорама', 'Багажник: 455 л', 'Потужність: 190 к. с.'], image: '/images/car-rental/nissan.jpg', photoModel: 'Nissan Qashqai e-Power' },
  { id: 'mini', name: 'MINI Countryman S ALL4', color: 'Синій', price: 65, depositPrice: 50, features: ['Автомат', 'Повний привід', 'Панорама', 'Багажник: 450 л', 'Потужність: 192 к. с.'], image: '/images/car-rental/mini-enhanced.png', photoModel: 'MINI Countryman S ALL4' },
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
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const channel = submitter?.value === 'telegram' ? 'telegram' : 'whatsapp';
    const { start, end } = period;
    const note = String(fields.get('note') ?? '').trim();
    const car = cars.find(item => item.id === fields.get('car')) ?? cars[0];
    if ((start && start < madeiraToday()) || (end && end < madeiraToday())) {
      setError('Оберіть сьогоднішню або майбутню дату.');
      return;
    }
    if ((start && !end) || (!start && end)) {
      setError('Розгорніть календар і оберіть дату повернення або очистіть дати, якщо ще плануєте подорож.');
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
      `Ціни на сайті: ${car.price} €/добу або ${car.depositPrice} €/добу + страховий депозит.`,
      `Отримання: ${displayRentalDate(start)}.`,
      `Повернення: ${displayRentalDate(end)}.`,
      note ? `Побажання: ${note}` : '',
      'Підкажіть, будь ласка, доступність, місце отримання та повні умови оренди.',
    ].filter(Boolean).join('\n');
    window.location.assign(`${channel === 'telegram' ? TELEGRAM_URL : WHATSAPP_URL}?text=${encodeURIComponent(message)}`);
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
        <header className="relative isolate mb-8 overflow-hidden rounded-2xl bg-forest px-5 py-6 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-7">
          <Image src="/images/car-rental/madeira-road-trip.png" alt="" fill priority sizes="(max-width: 1152px) 100vw, 1152px" className="-z-20 object-cover object-[65%_65%]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#092b22]/95 via-[#092b22]/75 to-[#092b22]/20" />
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Мадейра у вашому темпі</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Оренда авто на Мадейрі</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">Оберіть авто та уточніть доступність на ваші дати у Telegram або WhatsApp.</p>
          </div>
        </header>
        <section aria-label="Авто для оренди" className="grid gap-6 md:grid-cols-2">
          {cars.map((item, index) => <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <figure className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <img src={item.image} alt={`Ілюстративне фото: ${item.color.toLowerCase()} ${item.photoModel}`} width={960} height={540} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700">Ілюстративне фото</span>
            </figure>
            <div className="p-5 sm:p-6">
              <p className="text-sm font-medium text-ocean">{item.color}</p>
              <h2 className="mt-1 text-xl font-bold text-navy sm:text-2xl">{item.name}</h2>
              <ul aria-label={`Характеристики ${item.name}`} className="mt-3 flex flex-wrap gap-2">
                {item.features.map(feature => <li key={feature} className="rounded-full border border-moss/50 bg-mist px-3 py-1 text-xs font-medium text-forest">{feature}</li>)}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-slate-600"><span className="text-3xl font-bold text-navy">{item.price} €</span> / добу</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">або {item.depositPrice} €/добу + страховий депозит</p>
                </div>
                <a href="#rental-contact" onClick={() => { setCarId(item.id); setError(''); }} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ocean px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2" aria-label={`Обрати ${item.name}`}>Обрати</a>
              </div>
            </div>
          </article>)}
        </section>
        <p className="mt-4 text-sm leading-6 text-slate-600">На фото показані моделі авто, доступні для оренди. Комплектація та незначні деталі можуть відрізнятися.</p>
        <section id="rental-contact" aria-labelledby="contact-title" className="mt-10 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean">Зв’язок українською</p>
            <h2 id="contact-title" className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Запитайте про вільні дати</h2>
            <p className="mt-3 leading-7 text-slate-600">Бронюйте без передоплати з оплатою готівкою або карткою на місці. Оберіть авто й дати та напишіть у Telegram або WhatsApp — підтвердимо доступність і домовимося про отримання.</p>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="submit" name="channel" value="telegram" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:ring-offset-2">Забронювати в Telegram</button>
                <button type="submit" name="channel" value="whatsapp" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2">Забронювати у WhatsApp</button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Сайт не зберігає дані цієї форми. Кнопка відкриває обраний месенджер із підготовленим текстом; повідомлення ви надсилаєте самі. Бронювання потребує підтвердження.</p>
              <noscript><p className="mt-3 flex flex-wrap gap-4"><a className="text-ocean underline" href={TELEGRAM_URL}>Відкрити Telegram</a><a className="text-ocean underline" href={WHATSAPP_URL}>Відкрити WhatsApp</a></p></noscript>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  </>;
}
export const getStaticProps: GetStaticProps = async ({ locale }) => locale === 'uk' ? { props: {} } : { notFound: true };
