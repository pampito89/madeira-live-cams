import type { Locale } from './config';

type PartyPageText = {
  intlLocale: string;
  pageTitle: string;
  pageDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  loading: string;
  currentEvent: string;
  dateTime: string;
  location: string;
  tickets: string;
  organiserInstagram: string;
  loadError: string;
  noEvent: string;
};

export const partyPageText: Record<Locale, PartyPageText> = {
  en: {
    intlLocale: 'en-GB', pageTitle: 'Parties & Events | Madeira Live Cams', pageDescription: 'Current parties and events in Madeira.',
    eyebrow: 'Madeira nightlife', title: 'Parties & events', intro: 'The current event from The Purple Fridays. Information updates automatically from Instagram and the ticket page.',
    loading: 'Finding the current event…', currentEvent: 'Current event', dateTime: 'Date & time', location: 'Location', tickets: 'Tickets & details', organiserInstagram: 'Organiser Instagram',
    loadError: 'Unable to load the current event.', noEvent: 'There is no link to an upcoming party at the moment.',
  },
  pt: {
    intlLocale: 'pt-PT', pageTitle: 'Festas e eventos | Madeira Live Cams', pageDescription: 'Festas e eventos atuais na Madeira.',
    eyebrow: 'Vida noturna na Madeira', title: 'Festas e eventos', intro: 'O evento atual da The Purple Fridays. A informação é atualizada automaticamente a partir do Instagram e da página de bilhetes.',
    loading: 'A procurar o evento atual…', currentEvent: 'Evento atual', dateTime: 'Data e hora', location: 'Local', tickets: 'Bilhetes e detalhes', organiserInstagram: 'Instagram do organizador',
    loadError: 'Não foi possível carregar o evento atual.', noEvent: 'De momento, não existe uma ligação para a próxima festa.',
  },
  de: {
    intlLocale: 'de-DE', pageTitle: 'Partys & Veranstaltungen | Madeira Live Cams', pageDescription: 'Aktuelle Partys und Veranstaltungen auf Madeira.',
    eyebrow: 'Nachtleben auf Madeira', title: 'Partys & Veranstaltungen', intro: 'Die aktuelle Veranstaltung von The Purple Fridays. Die Informationen werden automatisch über Instagram und die Ticketseite aktualisiert.',
    loading: 'Aktuelle Veranstaltung wird gesucht…', currentEvent: 'Aktuelle Veranstaltung', dateTime: 'Datum & Uhrzeit', location: 'Ort', tickets: 'Tickets & Details', organiserInstagram: 'Instagram des Veranstalters',
    loadError: 'Die aktuelle Veranstaltung konnte nicht geladen werden.', noEvent: 'Derzeit ist kein Link zu einer bevorstehenden Party verfügbar.',
  },
  fr: {
    intlLocale: 'fr-FR', pageTitle: 'Soirées et événements | Madeira Live Cams', pageDescription: 'Soirées et événements actuels à Madère.',
    eyebrow: 'Vie nocturne à Madère', title: 'Soirées et événements', intro: 'L’événement actuel de The Purple Fridays. Les informations sont actualisées automatiquement depuis Instagram et la page de billetterie.',
    loading: 'Recherche de l’événement actuel…', currentEvent: 'Événement actuel', dateTime: 'Date et heure', location: 'Lieu', tickets: 'Billets et détails', organiserInstagram: 'Instagram de l’organisateur',
    loadError: 'Impossible de charger l’événement actuel.', noEvent: 'Aucun lien vers une prochaine soirée n’est disponible pour le moment.',
  },
  es: {
    intlLocale: 'es-ES', pageTitle: 'Fiestas y eventos | Madeira Live Cams', pageDescription: 'Fiestas y eventos actuales en Madeira.',
    eyebrow: 'Vida nocturna en Madeira', title: 'Fiestas y eventos', intro: 'El evento actual de The Purple Fridays. La información se actualiza automáticamente desde Instagram y la página de entradas.',
    loading: 'Buscando el evento actual…', currentEvent: 'Evento actual', dateTime: 'Fecha y hora', location: 'Lugar', tickets: 'Entradas y detalles', organiserInstagram: 'Instagram del organizador',
    loadError: 'No se pudo cargar el evento actual.', noEvent: 'En este momento no hay ningún enlace a una próxima fiesta.',
  },
  pl: {
    intlLocale: 'pl-PL', pageTitle: 'Imprezy i wydarzenia | Madeira Live Cams', pageDescription: 'Aktualne imprezy i wydarzenia na Maderze.',
    eyebrow: 'Życie nocne na Maderze', title: 'Imprezy i wydarzenia', intro: 'Aktualne wydarzenie The Purple Fridays. Informacje są automatycznie aktualizowane z Instagrama i strony z biletami.',
    loading: 'Wyszukiwanie aktualnego wydarzenia…', currentEvent: 'Aktualne wydarzenie', dateTime: 'Data i godzina', location: 'Miejsce', tickets: 'Bilety i szczegóły', organiserInstagram: 'Instagram organizatora',
    loadError: 'Nie udało się wczytać aktualnego wydarzenia.', noEvent: 'Obecnie nie ma linku do nadchodzącej imprezy.',
  },
  uk: {
    intlLocale: 'uk-UA', pageTitle: 'Вечірки та події | Madeira Live Cams', pageDescription: 'Актуальні вечірки та події на Мадейрі.',
    eyebrow: 'Нічне життя Мадейри', title: 'Вечірки та події', intro: 'Актуальна подія від The Purple Fridays. Інформація автоматично оновлюється з Instagram і сторінки квитків.',
    loading: 'Шукаємо актуальну подію…', currentEvent: 'Актуальна подія', dateTime: 'Дата й час', location: 'Локація', tickets: 'Квитки та деталі', organiserInstagram: 'Instagram організатора',
    loadError: 'Не вдалося завантажити актуальну подію.', noEvent: 'Зараз немає посилання на найближчу вечірку.',
  },
};
