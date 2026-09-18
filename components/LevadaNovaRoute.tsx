type Props = { locale: 'en' | 'uk' };

const startUrl = 'https://maps.app.goo.gl/2uTEDxehW75DU9g36';
const connectionVideo = '/videos/levada-nova-moinho-connection.mp4';

const copy = {
  en: {
    title: 'How to walk the circular route',
    start: 'Open the Levada Nova walking start in Google Maps',
    overview: 'Park near the lower Levada do Moinho entrance. This is also where you finish. Walk uphill to the Levada Nova start linked below, follow the upper levada through the tunnel and past the waterfalls, descend the connecting steps to Levada do Moinho, then follow the lower levada back to the car.',
    steps: [
      'From the parking area, walk uphill to Levada Nova. Allow roughly 7–10 minutes and around 100 m of ascent for this approach.',
      'Follow Levada Nova towards the tunnel. The tunnel is approximately 200 m long. Bring a headlamp or use your phone torch, walk carefully and watch your head: the entrance is low.',
      'After the tunnel, continue past the two waterfalls. The path can be wet and slippery. Walk approximately 500 m beyond the waterfalls to the connecting steps down to the lower levada; do not miss this descent.',
      'Take the steps down to Levada do Moinho. At the bottom turn left and stay on the lower levada without taking side paths. Follow it all the way back to the parking area.',
    ],
    videoTitle: 'Video: where to descend to Levada do Moinho',
    videoCaption: 'Use this video to recognise the connection and look for the steps down to the lower levada.',
    videoFallback: 'Your browser cannot play this video.',
    distance: 'The full circuit is roughly 8 km. Allow around 2½ hours, including photo stops.',
    water: 'Around the middle of Levada do Moinho, water may spill across the path. Use grippy footwear you are comfortable getting wet, or bring waterproof shoe covers. Quick-drying sandals are an option only if they grip securely on wet, uneven ground.',
    caution: 'Narrow, exposed and slippery sections require care.',
  },
  uk: {
    title: 'Як пройти кільцевий маршрут',
    start: 'Відкрити пішохідний старт Levada Nova на Google Maps',
    overview: 'Припаркуйтеся біля входу на нижню Levada do Moinho — сюди ж ви повернетеся наприкінці. Пішки підніміться до старту Levada Nova за посиланням нижче, пройдіть верхньою левадою через тунель і повз водоспади, спустіться сходами на Levada do Moinho та поверніться нею до машини.',
    steps: [
      'Від парковки підніміться пішки до Levada Nova. Закладіть орієнтовно 7–10 хвилин і близько 100 м набору висоти.',
      'Ідіть Levada Nova до тунелю. Його довжина — приблизно 200 м. Візьміть налобний ліхтар або ввімкніть ліхтарик телефона. На вході стеля низька: бережіть голову й дивіться під ноги.',
      'Після тунелю пройдіть повз два водоспади. Стежка тут може бути мокрою та слизькою. Від водоспадів пройдіть ще приблизно 500 м до сходів, що з’єднують верхню й нижню левади; важливо не пропустити цей спуск.',
      'Спустіться сходами на Levada do Moinho. Унизу поверніть ліворуч і йдіть нижньою левадою без відгалужень аж до парковки.',
    ],
    videoTitle: 'Відео: де спуститися на Levada do Moinho',
    videoCaption: 'Звірте місце переходу з відео та знайдіть сходи на нижню леваду.',
    videoFallback: 'Ваш браузер не може відтворити це відео.',
    distance: 'Повне коло — орієнтовно 8 км. Час проходження з фотозупинками — близько 2,5 години.',
    water: 'Приблизно посеред Levada do Moinho вода може переливатися через стежку. Візьміть взуття з добрим зчепленням, яке не страшно намочити, або водозахисні чохли. Сандалі, що швидко сохнуть, підійдуть лише за умови надійного зчеплення на мокрій нерівній поверхні.',
    caution: 'На вузьких, відкритих і слизьких ділянках будьте обережні.',
  },
};

export default function LevadaNovaRoute({ locale }: Props) {
  const text = copy[locale];
  return (
    <section className="mt-8" aria-labelledby="levada-route-heading">
      <h2 id="levada-route-heading" className="text-xl font-semibold text-navy">{text.title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{text.overview}</p>
      <a href={startUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg border border-ocean px-4 py-3 font-semibold text-ocean underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2">{text.start} ↗</a>
      <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-700">
        {text.steps.map((step, index) => (
          <li key={step} className="leading-7">
            {step}
            {index === 2 && (
              <figure className="mt-4 rounded-xl bg-panel p-3 sm:p-4">
                <figcaption className="mb-2 font-semibold text-navy">{text.videoTitle}</figcaption>
                <video controls playsInline preload="none" className="aspect-video w-full rounded-lg bg-black" aria-label={text.videoTitle}>
                  <source src={connectionVideo} type="video/mp4" />
                  {text.videoFallback}
                </video>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text.videoCaption}</p>
              </figure>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-5 leading-7 text-slate-600">{text.distance}</p>
      <p className="mt-4 leading-7 text-slate-600">{text.water}</p>
      <p className="mt-4 text-sm leading-6 text-slate-600">{text.caution}</p>
    </section>
  );
}
