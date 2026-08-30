import Head from 'next/head';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';

export default function AboutPage() {
  const { locale } = useMessages();

  const content =
    locale === 'uk'
      ? {
          title: 'Про Madeira Live Cams',
          intro:
            'Madeira Live Cams — це практичний вебзастосунок для гідів та мандрівників, які хочуть краще спланувати свій день на острові.',
          purpose:
            'Погода на Мадейрі може сильно відрізнятися залежно від району, висоти та часу доби, а також швидко змінюватися. Сервіс допомагає швидко переглядати доступні онлайн-камери й погодні дані, щоб обрати найкращу локацію, маршрут або активність у потрібний момент.',
          description:
            'Дізнайтеся більше про Madeira Live Cams і надішліть свою пропозицію.',
          feedback: 'Зворотний зв’язок',
          idea: 'Маєте ідею для Madeira Live Cams?',
          feedbackText:
            'Напишіть у WhatsApp. Можете запропонувати нову камеру, повідомити про помилку або поділитися ідеєю, як зробити застосунок кориснішим.',
          whatsapp: 'Написати у WhatsApp',
        }
      : {
          title: 'About Madeira Live Cams',
          intro:
            'Madeira Live Cams is a practical web app for Madeira guides and visitors who want to plan a better day on the island.',
          purpose:
            'Madeira weather can vary greatly by area, altitude and time of day, and it can change quickly. This service helps you quickly check available live cameras and weather information, so you can choose the right location, route or activity at the right time.',
          description:
            'Learn about Madeira Live Cams and send feedback or suggestions.',
          feedback: 'Feedback',
          idea: 'Have an idea for Madeira Live Cams?',
          feedbackText:
            'Message us on WhatsApp. You can suggest a new camera, report an issue, or share an idea to make the app more useful.',
          whatsapp: 'Message on WhatsApp',
        };

  return (
    <>
      <Head>
        <title>{content.title} | Madeira Live Cams</title>
        <meta name="description" content={content.description} />
      </Head>

      <Layout>
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-ocean">
              Madeira Live Cams
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              {content.title}
            </h1>

            <div className="mt-5 max-w-3xl space-y-4 text-base leading-7 text-slate-600 sm:text-lg">
              <p>{content.intro}</p>
              <p>{content.purpose}</p>
            </div>

            <div id="contact" className="mt-10 border-t border-slate-200 pt-8">
              <div className="rounded-2xl bg-gradient-to-br from-forest to-navy p-6 text-white shadow-lg shadow-forest/20 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                  {content.feedback}
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  {content.idea}
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-white/85">
                  {content.feedbackText}
                </p>

                <a
                  href="https://wa.me/351932006352?text=Hello%20Oleksandr%2C%20I%20have%20an%20idea%20for%20Madeira%20Live%20Cams."
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center rounded-lg bg-clay px-5 py-3 text-sm font-bold text-navy transition hover:bg-moss"
                >
                  {content.whatsapp}
                </a>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
