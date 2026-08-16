import Head from 'next/head';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';

export default function PrivacyPage() {
  const { locale } = useMessages();
  const uk = locale === 'uk';

  return (
    <Layout>
      <Head>
        <title>
          {uk
            ? 'Політика конфіденційності | Madeira Live Cams'
            : 'Privacy Policy | Madeira Live Cams'}
        </title>

        <meta
          name="description"
          content={
            uk
              ? 'Політика конфіденційності Madeira Live Cams.'
              : 'Madeira Live Cams privacy policy.'
          }
        />

        <link
          rel="canonical"
          href="https://madeiralivecams.com/privacy"
        />
      </Head>

      <main className="page-shell">
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-forest via-ocean to-leaf px-5 py-8 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
            Madeira Live Cams
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {uk ? 'Політика конфіденційності' : 'Privacy Policy'}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
            {uk
              ? 'Останнє оновлення: 16 серпня 2026 року.'
              : 'Last updated: 16 August 2026.'}
          </p>
        </section>

        <article className="rounded-2xl border border-moss/50 bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm sm:p-8 sm:text-base">
          {uk ? (
            <>
              <h2 className="text-xl font-bold text-navy">
                1. Загальна інформація
              </h2>

              <p className="mt-3">
                Madeira Live Cams — інформаційний сайт про Madeira. Ми
                показуємо посилання на публічні вебкамери, погодні дані,
                туристичні локації та окремі публічні події.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                2. Які дані ми отримуємо
              </h2>

              <p className="mt-3">
                Сайт не вимагає створення облікового запису та не збирає
                імена, паролі, платіжні дані чи приватні повідомлення
                відвідувачів.
              </p>

              <p className="mt-3">
                Для технічної роботи сайту Vercel та інші постачальники
                інфраструктури можуть автоматично обробляти стандартні
                технічні дані, зокрема IP-адресу, тип браузера, тип пристрою,
                дату, час і сторінки, які були відкриті.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                3. Instagram та події
              </h2>

              <p className="mt-3">
                Сторінка Parties може використовувати Meta Instagram API для
                отримання публічної інформації з professional Instagram
                accounts, зокрема назви профілю, публічного опису та
                актуального зовнішнього посилання на подію. Ми не отримуємо
                приватні повідомлення, паролі або дані приватних профілів.
              </p>

              <p className="mt-3">
                Якщо подія веде на Eventbrite або інший зовнішній сервіс,
                відвідувач переходить на цей сервіс за власним рішенням.
                Політика конфіденційності такого зовнішнього сервісу
                застосовується окремо.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                4. Cookies
              </h2>

              <p className="mt-3">
                Ми використовуємо необхідний cookie NEXT_LOCALE, щоб
                запам’ятати вибрану мову сайту. Цей cookie не призначений для
                реклами або відстеження поведінки між сайтами.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                5. Передавання даних третім сторонам
              </h2>

              <p className="mt-3">
                Ми не продаємо персональні дані. Сайт може посилатися на
                сторонні сервіси, зокрема YouTube, Instagram, Open-Meteo,
                Eventbrite, Google Maps, Vercel і власників вебкамер. Їхні
                власні політики конфіденційності застосовуються, коли ви
                використовуєте їхні сервіси.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                6. Видалення даних
              </h2>

              <p className="mt-3">
                Madeira Live Cams не зберігає профілі користувачів чи
                персональні дані відвідувачів. Якщо у вас є запит щодо
                конфіденційності або видалення даних, напишіть нам на адресу:
              </p>

              <p className="mt-3 font-semibold text-ocean">
                info@madeiralivecams.com
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                7. Зміни до цієї політики
              </h2>

              <p className="mt-3">
                Ми можемо оновлювати цю політику, якщо змінюється робота
                сайту, законодавство або підключені сервіси. Актуальна версія
                завжди буде доступна на цій сторінці.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-navy">
                1. General information
              </h2>

              <p className="mt-3">
                Madeira Live Cams is an information website about Madeira. We
                provide links to public webcams, weather information, travel
                locations and selected public events.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                2. Information we collect
              </h2>

              <p className="mt-3">
                The site does not require visitors to create an account and
                does not collect names, passwords, payment details or private
                messages from visitors.
              </p>

              <p className="mt-3">
                For technical operation, Vercel and other infrastructure
                providers may automatically process standard technical data,
                including IP address, browser type, device type, date, time
                and visited pages.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                3. Instagram and events
              </h2>

              <p className="mt-3">
                The Parties page may use the Meta Instagram API to retrieve
                public information from professional Instagram accounts,
                including profile name, public biography and the current
                external event link. We do not access private messages,
                passwords or private-profile information.
              </p>

              <p className="mt-3">
                When an event links to Eventbrite or another external service,
                visitors choose whether to continue to that service. The
                external service’s own privacy policy applies separately.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                4. Cookies
              </h2>

              <p className="mt-3">
                We use the essential NEXT_LOCALE cookie to remember the
                selected website language. This cookie is not used for
                advertising or cross-site behavioural tracking.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                5. Third-party services
              </h2>

              <p className="mt-3">
                We do not sell personal information. The site may link to
                third-party services, including YouTube, Instagram,
                Open-Meteo, Eventbrite, Google Maps, Vercel and webcam
                providers. Their own privacy policies apply when you use
                their services.
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                6. Data deletion requests
              </h2>

              <p className="mt-3">
                Madeira Live Cams does not store visitor user profiles or
                visitor personal information. For privacy or data deletion
                requests, contact us at:
              </p>

              <p className="mt-3 font-semibold text-ocean">
                info@madeiralivecams.com
              </p>

              <h2 className="mt-7 text-xl font-bold text-navy">
                7. Changes to this policy
              </h2>

              <p className="mt-3">
                We may update this policy when the website, applicable law or
                connected services change. The current version will always be
                available on this page.
              </p>
            </>
          )}
        </article>
      </main>
    </Layout>
  );
}