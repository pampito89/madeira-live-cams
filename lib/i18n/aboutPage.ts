import type { Locale } from './config';

type AboutPageText = {
  title: string;
  description: string;
  intro: string;
  purpose: string;
  feedback: string;
  idea: string;
  feedbackText: string;
  whatsapp: string;
  whatsappMessage: string;
};

export const aboutPageText: Record<Locale, AboutPageText> = {
  en: {
    title: 'About Madeira Live Cams',
    description: 'Learn about Madeira Live Cams and send feedback or suggestions.',
    intro: 'Madeira Live Cams is a practical web app for Madeira guides and visitors who want to plan a better day on the island.',
    purpose: 'Madeira weather can vary greatly by area, altitude and time of day, and it can change quickly. This service helps you quickly check available live cameras and weather information, so you can choose the right location, route or activity at the right time.',
    feedback: 'Feedback',
    idea: 'Have an idea for Madeira Live Cams?',
    feedbackText: 'Message us on WhatsApp. You can suggest a new camera, report an issue, or share an idea to make the app more useful.',
    whatsapp: 'Message on WhatsApp',
    whatsappMessage: 'Hello Oleksandr, I have an idea for Madeira Live Cams.',
  },
  pt: {
    title: 'Sobre o Madeira Live Cams',
    description: 'Conheça o Madeira Live Cams e envie comentários ou sugestões.',
    intro: 'O Madeira Live Cams é uma aplicação prática para guias e visitantes que querem planear melhor o dia na ilha.',
    purpose: 'O tempo na Madeira pode variar muito consoante a zona, a altitude e a hora do dia, além de mudar rapidamente. Este serviço permite consultar câmaras em direto e dados meteorológicos para escolher o local, o percurso ou a atividade mais adequados.',
    feedback: 'Comentários',
    idea: 'Tem uma ideia para o Madeira Live Cams?',
    feedbackText: 'Envie-nos uma mensagem no WhatsApp. Pode sugerir uma nova câmara, comunicar um problema ou partilhar uma ideia para tornar a aplicação mais útil.',
    whatsapp: 'Enviar mensagem no WhatsApp',
    whatsappMessage: 'Olá Oleksandr, tenho uma ideia para o Madeira Live Cams.',
  },
  de: {
    title: 'Über Madeira Live Cams',
    description: 'Erfahren Sie mehr über Madeira Live Cams und senden Sie Feedback oder Vorschläge.',
    intro: 'Madeira Live Cams ist eine praktische Web-App für Reiseführer und Besucher, die ihren Tag auf der Insel besser planen möchten.',
    purpose: 'Das Wetter auf Madeira kann je nach Region, Höhe und Tageszeit stark variieren und sich schnell ändern. Der Dienst hilft dabei, verfügbare Live-Kameras und Wetterdaten zu prüfen, um den passenden Ort, die richtige Route oder Aktivität auszuwählen.',
    feedback: 'Feedback',
    idea: 'Haben Sie eine Idee für Madeira Live Cams?',
    feedbackText: 'Schreiben Sie uns auf WhatsApp. Sie können eine neue Kamera vorschlagen, ein Problem melden oder eine Idee teilen, die die App nützlicher macht.',
    whatsapp: 'Nachricht auf WhatsApp',
    whatsappMessage: 'Hallo Oleksandr, ich habe eine Idee für Madeira Live Cams.',
  },
  fr: {
    title: 'À propos de Madeira Live Cams',
    description: 'Découvrez Madeira Live Cams et envoyez vos remarques ou suggestions.',
    intro: 'Madeira Live Cams est une application pratique destinée aux guides et aux visiteurs qui souhaitent mieux organiser leur journée sur l’île.',
    purpose: 'À Madère, la météo peut varier fortement selon la zone, l’altitude et l’heure, et changer rapidement. Ce service permet de consulter les caméras en direct et les données météo afin de choisir le bon lieu, itinéraire ou activité.',
    feedback: 'Votre avis',
    idea: 'Une idée pour Madeira Live Cams ?',
    feedbackText: 'Écrivez-nous sur WhatsApp. Vous pouvez proposer une nouvelle caméra, signaler un problème ou partager une idée pour rendre l’application plus utile.',
    whatsapp: 'Écrire sur WhatsApp',
    whatsappMessage: 'Bonjour Oleksandr, j’ai une idée pour Madeira Live Cams.',
  },
  es: {
    title: 'Acerca de Madeira Live Cams',
    description: 'Conoce Madeira Live Cams y envía comentarios o sugerencias.',
    intro: 'Madeira Live Cams es una aplicación práctica para guías y visitantes que quieren planificar mejor su día en la isla.',
    purpose: 'El tiempo en Madeira puede variar mucho según la zona, la altitud y la hora del día, además de cambiar rápidamente. Este servicio permite consultar cámaras en directo y datos meteorológicos para elegir el lugar, la ruta o la actividad adecuados.',
    feedback: 'Comentarios',
    idea: '¿Tienes una idea para Madeira Live Cams?',
    feedbackText: 'Escríbenos por WhatsApp. Puedes sugerir una nueva cámara, avisar de un problema o compartir una idea para mejorar la utilidad de la aplicación.',
    whatsapp: 'Escribir por WhatsApp',
    whatsappMessage: 'Hola Oleksandr, tengo una idea para Madeira Live Cams.',
  },
  pl: {
    title: 'O Madeira Live Cams',
    description: 'Dowiedz się więcej o Madeira Live Cams i prześlij opinię lub sugestię.',
    intro: 'Madeira Live Cams to praktyczna aplikacja dla przewodników i turystów, którzy chcą lepiej zaplanować dzień na wyspie.',
    purpose: 'Pogoda na Maderze może znacznie różnić się zależnie od regionu, wysokości i pory dnia, a także szybko się zmieniać. Serwis pozwala sprawdzić dostępne kamery na żywo i dane pogodowe, aby wybrać odpowiednie miejsce, trasę lub aktywność.',
    feedback: 'Opinia',
    idea: 'Masz pomysł na Madeira Live Cams?',
    feedbackText: 'Napisz do nas na WhatsAppie. Możesz zaproponować nową kamerę, zgłosić problem lub podzielić się pomysłem, który zwiększy użyteczność aplikacji.',
    whatsapp: 'Napisz na WhatsAppie',
    whatsappMessage: 'Cześć Oleksandr, mam pomysł na Madeira Live Cams.',
  },
  uk: {
    title: 'Про Madeira Live Cams',
    description: 'Дізнайтеся більше про Madeira Live Cams і надішліть свою пропозицію.',
    intro: 'Madeira Live Cams — це практичний вебзастосунок для гідів та мандрівників, які хочуть краще спланувати свій день на острові.',
    purpose: 'Погода на Мадейрі може сильно відрізнятися залежно від району, висоти та часу доби, а також швидко змінюватися. Сервіс допомагає швидко переглядати доступні онлайн-камери й погодні дані, щоб обрати найкращу локацію, маршрут або активність у потрібний момент.',
    feedback: 'Зворотний зв’язок',
    idea: 'Маєте ідею для Madeira Live Cams?',
    feedbackText: 'Напишіть у WhatsApp. Можете запропонувати нову камеру, повідомити про помилку або поділитися ідеєю, як зробити застосунок кориснішим.',
    whatsapp: 'Написати у WhatsApp',
    whatsappMessage: 'Привіт, Олександре! Маю ідею для Madeira Live Cams.',
  },
};
