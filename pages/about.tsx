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
            'Madeira Live Cams — це практичний вебзастосунок для гідів Мадейри, мандрівників і місцевих жителів, які хочуть краще спланувати свій день на острові.',
          purpose:
            'Погода на Мадейрі може сильно відрізнятися залежно від району, висоти та часу доби, а також швидко змінюватися. Сервіс допомагає швидко переглядати доступні онлайн-камери й погодні дані, щоб обрати найкращу локацію, маршрут або активність у потрібний момент.',
        }
      : {
          title: 'About Madeira Live Cams',
          intro:
            'Madeira Live Cams is a practical web app for Madeira guides, visitors and local residents who want to plan a better day on the island.',
          purpose:
            'Madeira weather can vary greatly by area, altitude and time of day, and it can change quickly. This service helps you quickly check available live cameras and weather information, so you can choose the right location, route or activity at the right time.',
        };

  return (
    <>
      <Head>
        <title>{content.title} | Madeira Live Cams</title>

        <meta
          name="description"
          content={
            locale === 'uk'
              ? 'Дізнайтеся більше про Madeira Live Cams і надішліть свою пропозицію.'
              : 'Learn about Madeira Live Cams and send feedback or suggestions.'
          }
        />
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

            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-forest via-ocean to-leaf px-6 py-9 text-center text-white sm:px-10 sm:py-12">
                <div className="mx-auto flex h-36 w-36 items-end justify-center overflow-hidden rounded-full border-4 border-white/80 bg-white/15 shadow-lg sm:h-44 sm:w-44">
                  <img
                    src="/images/oleksandr.png"
                    alt={
                      locale === 'uk'
                        ? 'Олександр, гід на Мадейрі'
                        : 'Oleksandr, Madeira guide'
                    }
                    className="h-full w-full object-contain object-bottom"
                  />
                </div>

                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
                  {locale === 'uk' ? 'Ваш гід на Мадейрі' : 'Your Madeira guide'}
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  {locale === 'uk' ? 'Привіт, я Олександр' : 'Hi, I’m Oleksandr'}
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-white/85">
                  {locale === 'uk'
                    ? 'Допомагаю побачити справжню Мадейру — у комфортному темпі, з урахуванням погоди та ваших інтересів.'
                    : 'I help you experience the real Madeira at a comfortable pace, with weather conditions and your interests in mind.'}
                </p>
              </div>
            </div>

            <div id="contact" className="mt-10 border-t border-slate-200 pt-8">
              <div className="rounded-2xl bg-gradient-to-br from-forest to-navy p-6 text-white shadow-lg shadow-forest/20 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                  {locale === 'uk' ? 'Зворотний зв’язок' : 'Feedback'}
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  {locale === 'uk'
                    ? 'Маєте ідею для Madeira Live Cams?'
                    : 'Have an idea for Madeira Live Cams?'}
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-white/85">
                  {locale === 'uk'
                    ? 'Напишіть мені у WhatsApp. Можете запропонувати нову камеру, повідомити про помилку або поділитися ідеєю, як зробити застосунок кориснішим.'
                    : 'Message me on WhatsApp. You can suggest a new camera, report an issue, or share an idea to make the app more useful.'}
                </p>

                <a
                  href="https://wa.me/351932006352?text=Hello%20Oleksandr%2C%20I%20have%20an%20idea%20for%20Madeira%20Live%20Cams."
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center rounded-lg bg-clay px-5 py-3 text-sm font-bold text-navy transition hover:bg-moss"
                >
                  {locale === 'uk' ? 'Написати у WhatsApp' : 'Message on WhatsApp'}
                </a>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}