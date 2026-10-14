import type { Locale } from './config';

type PrivacySection = {
  heading: string;
  paragraphs: string[];
  email?: string;
};

type PrivacyPageText = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: PrivacySection[];
};

export const privacyPageText: Record<Locale, PrivacyPageText> = {
  en: {
    title: 'Privacy Policy',
    description: 'Madeira Live Cams privacy policy.',
    lastUpdated: 'Last updated: 16 August 2026.',
    sections: [
      { heading: '1. General information', paragraphs: ['Madeira Live Cams is an information website about Madeira. We provide links to public webcams, weather information, travel locations and selected public events.'] },
      { heading: '2. Information we collect', paragraphs: ['The site does not require visitors to create an account and does not collect names, passwords, payment details or private messages from visitors.', 'For technical operation, Vercel and other infrastructure providers may automatically process standard technical data, including IP address, browser type, device type, date, time and visited pages.'] },
      { heading: '3. Instagram and events', paragraphs: ['The Parties page may use the Meta Instagram API to retrieve public information from professional Instagram accounts, including profile name, public biography and the current external event link. We do not access private messages, passwords or private-profile information.', 'When an event links to Eventbrite or another external service, visitors choose whether to continue to that service. The external service’s own privacy policy applies separately.'] },
      { heading: '4. Cookies', paragraphs: ['We use the essential NEXT_LOCALE cookie to remember the selected website language. This cookie is not used for advertising or cross-site behavioural tracking.'] },
      { heading: '5. Third-party services', paragraphs: ['We do not sell personal information. The site may link to third-party services, including YouTube, Instagram, Open-Meteo, Eventbrite, Google Maps, Vercel and webcam providers. Their own privacy policies apply when you use their services.'] },
      { heading: '6. Data deletion requests', paragraphs: ['Madeira Live Cams does not store visitor user profiles or visitor personal information. For privacy or data deletion requests, contact us at:'], email: 'info@madeiralivecams.com' },
      { heading: '7. Changes to this policy', paragraphs: ['We may update this policy when the website, applicable law or connected services change. The current version will always be available on this page.'] },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    description: 'Política de privacidade do Madeira Live Cams.',
    lastUpdated: 'Última atualização: 16 de agosto de 2026.',
    sections: [
      { heading: '1. Informação geral', paragraphs: ['O Madeira Live Cams é um site informativo sobre a Madeira. Disponibilizamos ligações para webcams públicas, informação meteorológica, locais turísticos e alguns eventos públicos.'] },
      { heading: '2. Informação que recolhemos', paragraphs: ['O site não exige a criação de uma conta e não recolhe nomes, palavras-passe, dados de pagamento nem mensagens privadas dos visitantes.', 'Para o funcionamento técnico, a Vercel e outros fornecedores de infraestrutura podem processar automaticamente dados técnicos comuns, incluindo endereço IP, tipo de navegador, tipo de dispositivo, data, hora e páginas visitadas.'] },
      { heading: '3. Instagram e eventos', paragraphs: ['A página de eventos pode usar a API do Meta Instagram para obter informação pública de contas profissionais do Instagram, incluindo o nome do perfil, a biografia pública e a ligação externa atual do evento. Não acedemos a mensagens privadas, palavras-passe nem dados de perfis privados.', 'Quando um evento direciona para o Eventbrite ou outro serviço externo, o visitante decide se pretende continuar. A política de privacidade desse serviço aplica-se separadamente.'] },
      { heading: '4. Cookies', paragraphs: ['Usamos o cookie essencial NEXT_LOCALE para memorizar o idioma escolhido. Este cookie não é usado para publicidade nem para seguir o comportamento entre sites.'] },
      { heading: '5. Serviços de terceiros', paragraphs: ['Não vendemos dados pessoais. O site pode incluir ligações para serviços de terceiros, como YouTube, Instagram, Open-Meteo, Eventbrite, Google Maps, Vercel e fornecedores de webcams. As políticas de privacidade desses serviços aplicam-se quando os utiliza.'] },
      { heading: '6. Pedidos de eliminação de dados', paragraphs: ['O Madeira Live Cams não guarda perfis de utilizador nem dados pessoais dos visitantes. Para questões de privacidade ou pedidos de eliminação de dados, contacte-nos em:'], email: 'info@madeiralivecams.com' },
      { heading: '7. Alterações a esta política', paragraphs: ['Podemos atualizar esta política quando o site, a legislação aplicável ou os serviços ligados forem alterados. A versão atual estará sempre disponível nesta página.'] },
    ],
  },
  de: {
    title: 'Datenschutzerklärung',
    description: 'Datenschutzerklärung von Madeira Live Cams.',
    lastUpdated: 'Zuletzt aktualisiert: 16. August 2026.',
    sections: [
      { heading: '1. Allgemeine Informationen', paragraphs: ['Madeira Live Cams ist eine Informationswebsite über Madeira. Wir verlinken öffentliche Webcams, Wetterdaten, Reiseziele und ausgewählte öffentliche Veranstaltungen.'] },
      { heading: '2. Welche Daten wir verarbeiten', paragraphs: ['Für die Nutzung der Website ist kein Konto erforderlich. Wir erfassen keine Namen, Passwörter, Zahlungsdaten oder privaten Nachrichten von Besuchern.', 'Für den technischen Betrieb können Vercel und andere Infrastrukturanbieter übliche technische Daten automatisch verarbeiten, darunter IP-Adresse, Browser- und Gerätetyp, Datum, Uhrzeit und besuchte Seiten.'] },
      { heading: '3. Instagram und Veranstaltungen', paragraphs: ['Die Veranstaltungsseite kann die Meta Instagram API verwenden, um öffentliche Informationen professioneller Instagram-Konten abzurufen, darunter Profilname, öffentliche Biografie und den aktuellen externen Veranstaltungslink. Wir greifen nicht auf private Nachrichten, Passwörter oder Daten privater Profile zu.', 'Wenn eine Veranstaltung zu Eventbrite oder einem anderen externen Dienst führt, entscheiden Besucher selbst, ob sie diesen Dienst aufrufen. Dessen Datenschutzerklärung gilt gesondert.'] },
      { heading: '4. Cookies', paragraphs: ['Wir verwenden das notwendige Cookie NEXT_LOCALE, um die gewählte Sprache zu speichern. Es wird nicht für Werbung oder websiteübergreifendes Verhaltenstracking verwendet.'] },
      { heading: '5. Dienste Dritter', paragraphs: ['Wir verkaufen keine personenbezogenen Daten. Die Website kann auf Dienste Dritter verweisen, darunter YouTube, Instagram, Open-Meteo, Eventbrite, Google Maps, Vercel und Webcam-Anbieter. Bei deren Nutzung gelten die jeweiligen Datenschutzerklärungen.'] },
      { heading: '6. Anfragen zur Datenlöschung', paragraphs: ['Madeira Live Cams speichert keine Benutzerprofile oder personenbezogenen Besucherdaten. Für Datenschutzfragen oder Löschanfragen kontaktieren Sie uns unter:'], email: 'info@madeiralivecams.com' },
      { heading: '7. Änderungen dieser Erklärung', paragraphs: ['Wir können diese Erklärung aktualisieren, wenn sich die Website, geltendes Recht oder verbundene Dienste ändern. Die aktuelle Fassung ist stets auf dieser Seite verfügbar.'] },
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    description: 'Politique de confidentialité de Madeira Live Cams.',
    lastUpdated: 'Dernière mise à jour : 16 août 2026.',
    sections: [
      { heading: '1. Informations générales', paragraphs: ['Madeira Live Cams est un site d’information sur Madère. Nous proposons des liens vers des webcams publiques, des données météo, des lieux touristiques et certains événements publics.'] },
      { heading: '2. Informations traitées', paragraphs: ['Le site ne demande pas de créer un compte et ne recueille ni noms, ni mots de passe, ni données de paiement, ni messages privés des visiteurs.', 'Pour son fonctionnement technique, Vercel et d’autres fournisseurs d’infrastructure peuvent traiter automatiquement des données techniques courantes, notamment l’adresse IP, le type de navigateur et d’appareil, la date, l’heure et les pages consultées.'] },
      { heading: '3. Instagram et événements', paragraphs: ['La page des événements peut utiliser l’API Meta Instagram pour récupérer des informations publiques de comptes Instagram professionnels, notamment le nom du profil, la biographie publique et le lien externe actuel vers l’événement. Nous n’accédons pas aux messages privés, aux mots de passe ni aux informations de profils privés.', 'Lorsqu’un événement renvoie vers Eventbrite ou un autre service externe, le visiteur choisit de poursuivre ou non. La politique de confidentialité du service externe s’applique séparément.'] },
      { heading: '4. Cookies', paragraphs: ['Nous utilisons le cookie essentiel NEXT_LOCALE pour mémoriser la langue choisie. Ce cookie n’est pas utilisé à des fins publicitaires ni pour le suivi comportemental entre sites.'] },
      { heading: '5. Services tiers', paragraphs: ['Nous ne vendons pas de données personnelles. Le site peut renvoyer vers des services tiers, notamment YouTube, Instagram, Open-Meteo, Eventbrite, Google Maps, Vercel et des fournisseurs de webcams. Leurs propres politiques de confidentialité s’appliquent lorsque vous utilisez ces services.'] },
      { heading: '6. Demandes de suppression', paragraphs: ['Madeira Live Cams ne conserve ni profils utilisateurs ni données personnelles de visiteurs. Pour toute question de confidentialité ou demande de suppression, contactez-nous à :'], email: 'info@madeiralivecams.com' },
      { heading: '7. Modifications de cette politique', paragraphs: ['Nous pouvons mettre à jour cette politique si le site, la législation applicable ou les services connectés évoluent. La version en vigueur restera disponible sur cette page.'] },
    ],
  },
  es: {
    title: 'Política de privacidad',
    description: 'Política de privacidad de Madeira Live Cams.',
    lastUpdated: 'Última actualización: 16 de agosto de 2026.',
    sections: [
      { heading: '1. Información general', paragraphs: ['Madeira Live Cams es un sitio informativo sobre Madeira. Ofrecemos enlaces a cámaras web públicas, información meteorológica, lugares turísticos y determinados eventos públicos.'] },
      { heading: '2. Información que tratamos', paragraphs: ['El sitio no exige crear una cuenta y no recopila nombres, contraseñas, datos de pago ni mensajes privados de los visitantes.', 'Para el funcionamiento técnico, Vercel y otros proveedores de infraestructura pueden tratar automáticamente datos técnicos habituales, como la dirección IP, el tipo de navegador y dispositivo, la fecha, la hora y las páginas visitadas.'] },
      { heading: '3. Instagram y eventos', paragraphs: ['La página de eventos puede utilizar la API de Meta Instagram para obtener información pública de cuentas profesionales de Instagram, como el nombre del perfil, la biografía pública y el enlace externo actual del evento. No accedemos a mensajes privados, contraseñas ni información de perfiles privados.', 'Cuando un evento enlaza con Eventbrite u otro servicio externo, el visitante decide si continúa. La política de privacidad de ese servicio se aplica por separado.'] },
      { heading: '4. Cookies', paragraphs: ['Utilizamos la cookie esencial NEXT_LOCALE para recordar el idioma elegido. No se utiliza para publicidad ni para el seguimiento del comportamiento entre sitios.'] },
      { heading: '5. Servicios de terceros', paragraphs: ['No vendemos datos personales. El sitio puede enlazar con servicios de terceros, como YouTube, Instagram, Open-Meteo, Eventbrite, Google Maps, Vercel y proveedores de cámaras web. Sus propias políticas de privacidad se aplican al utilizar esos servicios.'] },
      { heading: '6. Solicitudes de eliminación', paragraphs: ['Madeira Live Cams no almacena perfiles de usuario ni datos personales de los visitantes. Para consultas de privacidad o solicitudes de eliminación, escríbenos a:'], email: 'info@madeiralivecams.com' },
      { heading: '7. Cambios en esta política', paragraphs: ['Podemos actualizar esta política si cambian el sitio, la legislación aplicable o los servicios conectados. La versión vigente estará siempre disponible en esta página.'] },
    ],
  },
  pl: {
    title: 'Polityka prywatności',
    description: 'Polityka prywatności Madeira Live Cams.',
    lastUpdated: 'Ostatnia aktualizacja: 16 sierpnia 2026 r.',
    sections: [
      { heading: '1. Informacje ogólne', paragraphs: ['Madeira Live Cams to serwis informacyjny o Maderze. Udostępniamy odnośniki do publicznych kamer internetowych, informacje pogodowe, miejsca turystyczne oraz wybrane wydarzenia publiczne.'] },
      { heading: '2. Przetwarzane informacje', paragraphs: ['Serwis nie wymaga zakładania konta i nie zbiera imion, haseł, danych płatniczych ani prywatnych wiadomości odwiedzających.', 'Na potrzeby technicznego działania Vercel i inni dostawcy infrastruktury mogą automatycznie przetwarzać standardowe dane techniczne, w tym adres IP, typ przeglądarki i urządzenia, datę, godzinę oraz odwiedzone strony.'] },
      { heading: '3. Instagram i wydarzenia', paragraphs: ['Strona wydarzeń może korzystać z API Meta Instagram w celu pobierania publicznych informacji z profesjonalnych kont na Instagramie, w tym nazwy profilu, publicznego opisu i aktualnego zewnętrznego linku do wydarzenia. Nie uzyskujemy dostępu do prywatnych wiadomości, haseł ani danych profili prywatnych.', 'Jeśli wydarzenie prowadzi do Eventbrite lub innego zewnętrznego serwisu, odwiedzający sam decyduje o przejściu. Polityka prywatności tego serwisu obowiązuje niezależnie.'] },
      { heading: '4. Pliki cookie', paragraphs: ['Używamy niezbędnego pliku cookie NEXT_LOCALE, aby zapamiętać wybrany język strony. Nie służy on do reklam ani śledzenia zachowania między witrynami.'] },
      { heading: '5. Usługi zewnętrzne', paragraphs: ['Nie sprzedajemy danych osobowych. Serwis może zawierać odnośniki do usług zewnętrznych, takich jak YouTube, Instagram, Open-Meteo, Eventbrite, Google Maps, Vercel oraz dostawcy kamer. Podczas korzystania z tych usług obowiązują ich własne polityki prywatności.'] },
      { heading: '6. Wnioski o usunięcie danych', paragraphs: ['Madeira Live Cams nie przechowuje profili użytkowników ani danych osobowych odwiedzających. W sprawach prywatności lub usunięcia danych skontaktuj się z nami:'], email: 'info@madeiralivecams.com' },
      { heading: '7. Zmiany polityki', paragraphs: ['Możemy aktualizować tę politykę, gdy zmieni się działanie serwisu, obowiązujące prawo lub połączone usługi. Aktualna wersja będzie zawsze dostępna na tej stronie.'] },
    ],
  },
  uk: {
    title: 'Політика конфіденційності',
    description: 'Політика конфіденційності Madeira Live Cams.',
    lastUpdated: 'Останнє оновлення: 16 серпня 2026 року.',
    sections: [
      { heading: '1. Загальна інформація', paragraphs: ['Madeira Live Cams — інформаційний сайт про Мадейру. Ми показуємо посилання на публічні вебкамери, погодні дані, туристичні локації та окремі публічні події.'] },
      { heading: '2. Які дані ми отримуємо', paragraphs: ['Сайт не вимагає створення облікового запису та не збирає імена, паролі, платіжні дані чи приватні повідомлення відвідувачів.', 'Для технічної роботи сайту Vercel та інші постачальники інфраструктури можуть автоматично обробляти стандартні технічні дані, зокрема IP-адресу, тип браузера, тип пристрою, дату, час і сторінки, які були відкриті.'] },
      { heading: '3. Instagram та події', paragraphs: ['Сторінка Parties може використовувати Meta Instagram API для отримання публічної інформації з професійних Instagram-акаунтів, зокрема назви профілю, публічного опису та актуального зовнішнього посилання на подію. Ми не отримуємо приватні повідомлення, паролі або дані приватних профілів.', 'Якщо подія веде на Eventbrite або інший зовнішній сервіс, відвідувач переходить на цей сервіс за власним рішенням. Політика конфіденційності такого зовнішнього сервісу застосовується окремо.'] },
      { heading: '4. Cookies', paragraphs: ['Ми використовуємо необхідний cookie NEXT_LOCALE, щоб запам’ятати вибрану мову сайту. Цей cookie не призначений для реклами або відстеження поведінки між сайтами.'] },
      { heading: '5. Передавання даних третім сторонам', paragraphs: ['Ми не продаємо персональні дані. Сайт може посилатися на сторонні сервіси, зокрема YouTube, Instagram, Open-Meteo, Eventbrite, Google Maps, Vercel і власників вебкамер. Їхні власні політики конфіденційності застосовуються, коли ви використовуєте їхні сервіси.'] },
      { heading: '6. Видалення даних', paragraphs: ['Madeira Live Cams не зберігає профілі користувачів чи персональні дані відвідувачів. Якщо у вас є запит щодо конфіденційності або видалення даних, напишіть нам на адресу:'], email: 'info@madeiralivecams.com' },
      { heading: '7. Зміни до цієї політики', paragraphs: ['Ми можемо оновлювати цю політику, якщо змінюється робота сайту, законодавство або підключені сервіси. Актуальна версія завжди буде доступна на цій сторінці.'] },
    ],
  },
};
