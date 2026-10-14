import type { Locale } from './config';

type CameraPageText = {
  airportTitle: string;
  airportDescription: string;
  airportHeading: string;
  airportIntro: string;
  title: (name: string) => string;
  description: (name: string, region: string) => string;
  heading: (name: string) => string;
  intro: (name: string) => string;
  streamNotice: string;
  airportInfo: string;
  arrivals: string;
  departures: string;
  checkHeading: string;
  airportCheck: string;
  cameraCheck: string;
  weatherLink: string;
};

export const cameraPageText: Record<Locale, CameraPageText> = {
  en: {
    airportTitle: 'Madeira Airport Live Webcam (FNC), Arrivals & Departures',
    airportDescription: 'Watch the Madeira Airport FNC live webcam and open official real-time arrivals and departures. Check runway visibility and conditions before travelling.',
    airportHeading: 'Madeira Airport live webcam (FNC)',
    airportIntro: 'This live view shows the runway area at Cristiano Ronaldo Madeira International Airport (FNC/LPMA). Use it to check cloud cover, visibility and general conditions. For an exact flight status, use the airport’s official arrivals and departures pages.',
    title: (name) => `${name} Live Webcam, Madeira | Madeira Live Cams`,
    description: (name, region) => `Watch the ${name} live webcam in ${region}, Madeira, and check current visual conditions before you travel.`,
    heading: (name) => `${name} live webcam`, intro: (name) => `Check the current view at ${name} before setting out. The webcam can help you assess cloud cover and visibility, but it does not replace an official forecast or safety notice.`,
    streamNotice: 'The stream belongs to its source and may be temporarily unavailable. Madeira Live Cams does not operate the camera or guarantee continuous video.',
    airportInfo: 'Airport and flight information', arrivals: 'Official FNC arrivals', departures: 'Official FNC departures', checkHeading: 'What to check before travelling',
    airportCheck: 'The webcam shows visual conditions only. Always confirm arrival time, departure time, delays or cancellations with the official airport or your airline.',
    cameraCheck: 'Compare the live view with the current forecast, account for the location and elevation, and check official notices before a mountain walk.', weatherLink: 'Check weather and sunrise information',
  },
  pt: {
    airportTitle: 'Webcam em direto do Aeroporto da Madeira (FNC), chegadas e partidas',
    airportDescription: 'Veja a webcam do Aeroporto da Madeira FNC e consulte as chegadas e partidas oficiais em tempo real. Verifique a visibilidade antes de viajar.',
    airportHeading: 'Webcam em direto do Aeroporto da Madeira (FNC)',
    airportIntro: 'Esta imagem em direto mostra a zona da pista do Aeroporto Internacional da Madeira Cristiano Ronaldo (FNC/LPMA). Use-a para verificar nuvens, visibilidade e condições gerais. Confirme o voo nas páginas oficiais de chegadas e partidas.',
    title: (name) => `Webcam em direto de ${name}, Madeira | Madeira Live Cams`,
    description: (name, region) => `Veja a webcam em direto de ${name}, ${region}, Madeira, e confirme as condições visuais antes da viagem.`,
    heading: (name) => `Webcam em direto de ${name}`, intro: (name) => `Veja as condições atuais em ${name} antes de sair. A webcam ajuda a avaliar nuvens e visibilidade, mas não substitui a previsão oficial nem os avisos de segurança.`,
    streamNotice: 'A transmissão pertence à fonte e pode estar temporariamente indisponível. O Madeira Live Cams não opera a câmara nem garante vídeo contínuo.',
    airportInfo: 'Aeroporto e informações de voo', arrivals: 'Chegadas oficiais FNC', departures: 'Partidas oficiais FNC', checkHeading: 'O que verificar antes da viagem',
    airportCheck: 'A webcam mostra apenas as condições visuais. Confirme sempre horários, atrasos e cancelamentos com o aeroporto ou a companhia aérea.',
    cameraCheck: 'Compare a imagem com a previsão atual, considere a localização e a altitude e consulte avisos oficiais antes de caminhar na montanha.', weatherLink: 'Ver meteorologia e nascer do sol',
  },
  de: {
    airportTitle: 'Madeira Flughafen Live-Webcam (FNC), Ankünfte & Abflüge',
    airportDescription: 'Sehen Sie die Live-Webcam am Flughafen Madeira FNC und öffnen Sie offizielle Ankünfte und Abflüge in Echtzeit.',
    airportHeading: 'Live-Webcam am Flughafen Madeira (FNC)',
    airportIntro: 'Diese Live-Ansicht zeigt den Landebahnbereich des internationalen Flughafens Madeira Cristiano Ronaldo (FNC/LPMA). Prüfen Sie Bewölkung, Sicht und allgemeine Bedingungen. Den genauen Flugstatus finden Sie bei den offiziellen Ankünften und Abflügen.',
    title: (name) => `${name} Live-Webcam, Madeira | Madeira Live Cams`,
    description: (name, region) => `Sehen Sie die Live-Webcam ${name} in ${region}, Madeira, und prüfen Sie die aktuellen Sichtbedingungen vor der Fahrt.`,
    heading: (name) => `${name} Live-Webcam`, intro: (name) => `Prüfen Sie die aktuelle Sicht bei ${name}, bevor Sie losfahren. Die Webcam hilft bei der Einschätzung von Wolken und Sicht, ersetzt aber keine offizielle Vorhersage oder Warnung.`,
    streamNotice: 'Der Stream gehört der jeweiligen Quelle und kann zeitweise nicht verfügbar sein. Madeira Live Cams betreibt die Kamera nicht und garantiert keinen durchgehenden Stream.',
    airportInfo: 'Flughafen- und Fluginformationen', arrivals: 'Offizielle FNC-Ankünfte', departures: 'Offizielle FNC-Abflüge', checkHeading: 'Vor der Fahrt prüfen',
    airportCheck: 'Die Webcam zeigt nur die Sichtbedingungen. Bestätigen Sie Zeiten, Verspätungen und Ausfälle immer beim Flughafen oder Ihrer Fluggesellschaft.',
    cameraCheck: 'Vergleichen Sie das Livebild mit der aktuellen Vorhersage und prüfen Sie vor einer Bergwanderung offizielle Hinweise.', weatherLink: 'Wetter und Sonnenaufgang prüfen',
  },
  fr: {
    airportTitle: 'Webcam en direct de l’aéroport de Madère (FNC), arrivées et départs',
    airportDescription: 'Regardez la webcam de l’aéroport de Madère FNC et consultez les arrivées et départs officiels en temps réel.',
    airportHeading: 'Webcam en direct de l’aéroport de Madère (FNC)',
    airportIntro: 'Cette vue en direct montre la piste de l’aéroport international Cristiano Ronaldo de Madère (FNC/LPMA). Vérifiez les nuages, la visibilité et les conditions générales. Pour le statut exact d’un vol, consultez les arrivées et départs officiels.',
    title: (name) => `Webcam en direct de ${name}, Madère | Madeira Live Cams`,
    description: (name, region) => `Regardez la webcam de ${name}, ${region}, à Madère, et vérifiez les conditions visuelles avant votre départ.`,
    heading: (name) => `Webcam en direct de ${name}`, intro: (name) => `Consultez la vue actuelle à ${name} avant de partir. La webcam aide à évaluer les nuages et la visibilité, mais ne remplace pas les prévisions ni les avis officiels.`,
    streamNotice: 'La diffusion appartient à sa source et peut être temporairement indisponible. Madeira Live Cams n’exploite pas la caméra et ne garantit pas une vidéo continue.',
    airportInfo: 'Aéroport et informations de vol', arrivals: 'Arrivées officielles FNC', departures: 'Départs officiels FNC', checkHeading: 'À vérifier avant le départ',
    airportCheck: 'La webcam montre uniquement les conditions visuelles. Confirmez toujours les horaires, retards et annulations auprès de l’aéroport ou de la compagnie aérienne.',
    cameraCheck: 'Comparez la vue avec les prévisions, tenez compte du lieu et de l’altitude et consultez les avis officiels avant une randonnée.', weatherLink: 'Voir la météo et le lever du soleil',
  },
  es: {
    airportTitle: 'Webcam en directo del aeropuerto de Madeira (FNC), llegadas y salidas',
    airportDescription: 'Mira la webcam del aeropuerto de Madeira FNC y consulta las llegadas y salidas oficiales en tiempo real.',
    airportHeading: 'Webcam en directo del aeropuerto de Madeira (FNC)',
    airportIntro: 'Esta vista en directo muestra la zona de la pista del Aeropuerto Internacional Cristiano Ronaldo de Madeira (FNC/LPMA). Comprueba nubes, visibilidad y condiciones generales. Consulta el estado exacto del vuelo en las páginas oficiales de llegadas y salidas.',
    title: (name) => `Webcam en directo de ${name}, Madeira | Madeira Live Cams`,
    description: (name, region) => `Mira la webcam en directo de ${name}, ${region}, Madeira, y comprueba las condiciones visuales antes de viajar.`,
    heading: (name) => `Webcam en directo de ${name}`, intro: (name) => `Comprueba la vista actual en ${name} antes de salir. La webcam ayuda a evaluar las nubes y la visibilidad, pero no sustituye la previsión ni los avisos oficiales.`,
    streamNotice: 'La emisión pertenece a su fuente y puede no estar disponible temporalmente. Madeira Live Cams no opera la cámara ni garantiza vídeo continuo.',
    airportInfo: 'Aeropuerto e información de vuelos', arrivals: 'Llegadas oficiales FNC', departures: 'Salidas oficiales FNC', checkHeading: 'Qué comprobar antes de viajar',
    airportCheck: 'La webcam solo muestra las condiciones visuales. Confirma siempre horarios, retrasos y cancelaciones con el aeropuerto o la aerolínea.',
    cameraCheck: 'Compara la imagen con la previsión actual, ten en cuenta la ubicación y la altitud y consulta los avisos oficiales antes de una ruta de montaña.', weatherLink: 'Consultar tiempo y amanecer',
  },
  pl: {
    airportTitle: 'Kamera na żywo z lotniska na Maderze (FNC), przyloty i odloty',
    airportDescription: 'Oglądaj kamerę lotniska na Maderze FNC i sprawdzaj oficjalne przyloty oraz odloty w czasie rzeczywistym.',
    airportHeading: 'Kamera na żywo z lotniska na Maderze (FNC)',
    airportIntro: 'Widok na żywo pokazuje rejon pasa startowego Międzynarodowego Portu Lotniczego Cristiano Ronaldo na Maderze (FNC/LPMA). Sprawdź zachmurzenie, widoczność i ogólne warunki. Dokładny status lotu znajdziesz na oficjalnych stronach przylotów i odlotów.',
    title: (name) => `${name} — kamera na żywo, Madera | Madeira Live Cams`,
    description: (name, region) => `Oglądaj kamerę ${name} w regionie ${region} na Maderze i sprawdź aktualne warunki przed wyjazdem.`,
    heading: (name) => `${name} — kamera na żywo`, intro: (name) => `Sprawdź aktualny widok w ${name} przed wyjazdem. Kamera pomaga ocenić zachmurzenie i widoczność, ale nie zastępuje oficjalnej prognozy ani komunikatów bezpieczeństwa.`,
    streamNotice: 'Transmisja należy do jej źródła i może być czasowo niedostępna. Madeira Live Cams nie obsługuje kamery i nie gwarantuje ciągłego obrazu.',
    airportInfo: 'Lotnisko i informacje o lotach', arrivals: 'Oficjalne przyloty FNC', departures: 'Oficjalne odloty FNC', checkHeading: 'Co sprawdzić przed podróżą',
    airportCheck: 'Kamera pokazuje wyłącznie warunki wizualne. Zawsze potwierdzaj godziny, opóźnienia i odwołania na stronie lotniska lub u przewoźnika.',
    cameraCheck: 'Porównaj obraz z aktualną prognozą, uwzględnij położenie i wysokość oraz sprawdź oficjalne komunikaty przed wyjściem w góry.', weatherLink: 'Sprawdź pogodę i wschód słońca',
  },
  uk: {
    airportTitle: 'Камера аеропорту Мадейри наживо (FNC), прибуття та вильоти',
    airportDescription: 'Дивіться онлайн-камеру аеропорту Мадейри FNC та переходьте до офіційного статусу прибуттів і вильотів. Перевіряйте умови перед поїздкою.',
    airportHeading: 'Камера аеропорту Мадейри наживо (FNC)',
    airportIntro: 'Камера показує район злітно-посадкової смуги міжнародного аеропорту Мадейри Cristiano Ronaldo (FNC/LPMA). Використовуйте відео для візуальної перевірки хмарності, видимості та загальних умов. Для точного статусу рейсу відкрийте офіційні дані аеропорту.',
    title: (name) => `${name}: вебкамера наживо | Madeira Live Cams`,
    description: (name, region) => `${name}, ${region}: перегляньте вебкамеру наживо та перевірте поточні умови перед поїздкою.`,
    heading: (name) => `${name}: вебкамера наживо`, intro: (name) => `Перегляньте поточний вигляд у ${name}, перш ніж вирушати. Вебкамера допомагає оцінити хмарність і видимість, але не замінює офіційний прогноз або повідомлення про безпеку.`,
    streamNotice: 'Трансляція належить її джерелу та може бути тимчасово недоступною. Madeira Live Cams не керує камерою і не гарантує безперервність відео.',
    airportInfo: 'Аеропорт і рейси', arrivals: 'Офіційні прибуття FNC', departures: 'Офіційні вильоти FNC', checkHeading: 'Що перевірити перед поїздкою',
    airportCheck: 'Камера показує лише візуальні умови. Час прибуття, вильоту, затримку або скасування завжди перевіряйте на офіційному сайті аеропорту чи в авіакомпанії.',
    cameraCheck: 'Порівняйте зображення з актуальним прогнозом, врахуйте висоту й район острова та перевірте офіційні повідомлення, якщо плануєте гірський маршрут.', weatherLink: 'Перевірити погоду та схід сонця',
  },
};
