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
            'Madeira Live Cams — це практичний вебзастосунок для гідів Мадейри та мандрівників, які хочуть краще спланувати свій день на острові.',
          purposeTitle: 'Для чого створено застосунок',
          purpose:
            'Мадейра має дуже різну погоду залежно від району, висоти та часу доби. Сервіс допомагає швидко переглядати доступні онлайн-камери й погодні дані, щоб обрати локацію, маршрут або активність у найкращий момент.',
          audienceTitle: 'Кому це буде корисно',
          audience: [
            'Гідам, які планують екскурсії та маршрути для груп.',
            'Відвідувачам, які хочуть перевірити умови перед поїздкою на пляж, оглядовий майданчик або в гори.',
            'Місцевим жителям, яким важливо швидко побачити погоду в різних частинах острова.',
          ],
          creatorTitle: 'Про автора',
          creator:
            'Цей проєкт створено незалежним ентузіастом Мадейри, щоб зробити планування поїздок простішим, зрозумілішим і кориснішим.',
          socialTitle: 'Соціальні мережі',
          socialText:
            'Слідкуйте за оновленнями проєкту та діліться своїми ідеями.',
          contactTitle: 'Допоможіть покращити сервіс',
          contactText:
            'Маєте пропозицію, помітили помилку або знаєте корисну камеру? Надішліть повідомлення — ваш відгук допоможе зробити Madeira Live Cams кращим.',
          name: 'Ваше ім’я',
          email: 'Email',
          message: 'Ваше повідомлення',
          submit: 'Надіслати пропозицію',
          note: 'Натискаючи кнопку, ви погоджуєтеся на обробку наданих даних для відповіді на ваше звернення.',
        }
      : {
          title: 'About Madeira Live Cams',
          intro:
            'Madeira Live Cams is a practical web app for Madeira guides and visitors who want to plan a better island experience.',
          purposeTitle: 'Why this app exists',
          purpose:
            'Madeira weather can vary greatly by area, altitude and time of day. This service helps you quickly check available live cameras and weather information, so you can choose the right location, route or activity at the right time.',
          audienceTitle: 'Who it is for',
          audience: [
            'Guides planning excursions and routes for their groups.',
            'Visitors checking conditions before travelling to a beach, viewpoint or mountain trail.',
            'Local residents who want a quick view of weather across different parts of the island.',
          ],
          creatorTitle: 'About the creator',
          creator:
            'This project was created by an independent Madeira enthusiast to make trip planning simpler, clearer and more useful.',
          socialTitle: 'Social media',
          socialText:
            'Follow project updates and share your ideas.',
          contactTitle: 'Help improve the app',
          contactText:
            'Have a suggestion, found an issue, or know a useful live camera? Send a message—your feedback helps make Madeira Live Cams better.',
          name: 'Your name',
          email: 'Email',
          message: 'Your message',
          submit: 'Send suggestion',
          note: 'By sending this form, you agree that the information provided may be used to reply to your message.',
        };

  return (
    <>
      <Head>
        <title>{content.title} | Madeira Live Cams</title>
        <meta
          name="description"
          content="Learn about Madeira Live Cams and send feedback or suggestions."
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

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              {content.intro}
            </p>

            <div className="mt-10 grid gap-8">
              <div>
                <h2 className="text-xl font-bold text-navy">
                  {content.purposeTitle}
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  {content.purpose}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy">
                  {content.audienceTitle}
                </h2>

                <ul className="mt-3 space-y-3 text-slate-600">
                  {content.audience.map((item) => (
                    <li key={item} className="flex gap-3 leading-7">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ocean" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="bg-gradient-to-br from-navy via-ocean to-sky-500 px-6 py-9 text-center text-white sm:px-10 sm:py-12">
    <div className="mx-auto flex h-36 w-36 items-end justify-center overflow-hidden rounded-full border-4 border-white/80 bg-white/15 shadow-lg sm:h-44 sm:w-44">
      <img
        src="/images/oleksandr.png"
        alt="Олександр, гід на Мадейрі"
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

  <div className="grid gap-7 p-6 sm:p-8 md:grid-cols-2 md:gap-10">
    <div>
      <h3 className="text-lg font-bold text-navy">
        {locale === 'uk' ? 'Мій досвід на острові' : 'My experience on the island'}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {locale === 'uk'
          ? 'Я гід на Мадейрі та щодня допомагаю мандрівникам відкривати її найкращі місця: океанське узбережжя, природні басейни, гірські стежки, левади й оглядові майданчики.'
          : 'I am a Madeira guide who helps travellers discover the island’s best places every day: the Atlantic coast, natural pools, mountain trails, levadas and viewpoints.'}
      </p>
    </div>

    <div>
      <h3 className="text-lg font-bold text-navy">
        {locale === 'uk' ? 'Чому я створив Madeira Live Cams' : 'Why I created Madeira Live Cams'}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {locale === 'uk'
          ? 'Погода на Мадейрі може швидко змінюватися й сильно відрізнятися в різних районах острова. Я створив цей застосунок, щоб гіди, гості та місцеві жителі бачили реальні умови перед поїздкою й могли краще планувати свій день.'
          : 'Madeira weather can change quickly and differ greatly between areas. I created this app so guides, visitors and locals can see real conditions before setting off and plan their day better.'}
      </p>
    </div>
  </div>
</div>

              <div id="contact" className="border-t border-slate-200 pt-8">
  <div className="rounded-2xl bg-gradient-to-br from-ocean to-navy p-6 text-white sm:p-8">
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
      className="mt-6 inline-flex items-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-navy transition hover:bg-sky-50"
    >
      {locale === 'uk' ? 'Написати у WhatsApp' : 'Message on WhatsApp'}
    </a>
  </div>
</div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}