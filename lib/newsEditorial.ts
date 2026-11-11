import type { Locale } from './i18n/config';
import type { SiteNewsArticle } from './newsTypes';
import type { ManagedNews } from './newsLifecycle';
import { sourceFingerprint } from './operationalNews';

// Reviewed against RTP Madeira (9 Nov 2026) and Diário de Notícias (same day).
// Exact source fingerprint prevents reusing this edition after an upstream change.
const radarFingerprint = '1825f815a77dff3800532cd6a093d4f79963d634e943c74ecb808c73d82a9806';
const editions: Record<Locale, string[]> = {
  uk: [
    'На Via Rápida встановлять дев’ять радарів контролю швидкості',
    'На Via Rápida Мадейри планують встановити дев’ять радарів контролю швидкості. За оголошеним планом обладнання має з’явитися у 2027 році.',
    'ЩО ВІДОМО:',
    'Де: швидкісна дорога Via Rápida на Мадейрі.',
    'Коли: конкурс на встановлення планують оголосити до кінця 2026 року; встановлення передбачене на 2027 рік.',
    'Статус: це оголошений план. Публікації не підтверджують, що ці радари вже працюють.',
    'ЩО ЩЕ НЕ УТОЧНЕНО',
    'У перевірених публікаціях немає точних місць встановлення та дати початку роботи радарів.',
    'КОНТЕКСТ',
    'План оголосив регіональний секретар з обладнання та інфраструктури Педру Родрігеш 9 листопада 2026 року під час підписання угоди між IMT-RAM та національним органом безпеки дорожнього руху ANSR. Мета — зменшити аварійність.'
  ],
  en: [
    'Nine speed cameras planned for the Via Rápida',
    'Madeira plans to install nine speed cameras on the Via Rápida. The announced installation schedule points to 2027.',
    'WHAT IS KNOWN:',
    'Where: the Via Rápida expressway in Madeira.',
    'When: the installation tender is planned before the end of 2026, with installation expected in 2027.',
    'Status: an announced plan. The reports do not confirm that these cameras are already operating.',
    'WHAT REMAINS UNSPECIFIED',
    'The reviewed reports do not give exact camera locations or an activation date.',
    'CONTEXT',
    'Regional secretary for Equipment and Infrastructure Pedro Rodrigues announced the plan on 9 November 2026 at the signing of an agreement between IMT-RAM and the national road safety authority ANSR. The aim is to reduce road accidents.'
  ],
  pt: [
    'Nove radares de velocidade previstos para a Via Rápida',
    'Está prevista a instalação de nove radares de velocidade na Via Rápida da Madeira. O calendário anunciado aponta para 2027.',
    'O QUE SE SABE:',
    'Onde: na Via Rápida da Madeira.',
    'Quando: o concurso de instalação está previsto até ao final de 2026, com instalação prevista para 2027.',
    'Estado: trata-se de um plano anunciado. As notícias não confirmam que estes radares já estejam em funcionamento.',
    'O QUE FALTA ESCLARECER',
    'As notícias consultadas não indicam os locais exatos dos radares nem a data de entrada em funcionamento.',
    'CONTEXTO',
    'O secretário regional dos Equipamentos e Infraestruturas, Pedro Rodrigues, anunciou o plano em 9 de novembro de 2026, na assinatura de um protocolo entre o IMT-RAM e a Autoridade Nacional de Segurança Rodoviária (ANSR). O objetivo é reduzir a sinistralidade rodoviária.'
  ],
  de: [
    'Neun Geschwindigkeitsradare für die Via Rápida geplant',
    'Auf Madeiras Via Rápida sollen neun Geschwindigkeitsradare installiert werden. Der angekündigte Zeitplan sieht die Installation für 2027 vor.',
    'WAS BEKANNT IST:',
    'Wo: auf der Schnellstraße Via Rápida auf Madeira.',
    'Wann: Die Ausschreibung ist bis Ende 2026 geplant, die Installation für 2027.',
    'Status: ein angekündigtes Vorhaben. Die Berichte bestätigen nicht, dass diese Radare bereits in Betrieb sind.',
    'WAS NOCH OFFEN IST',
    'Die geprüften Berichte nennen weder genaue Standorte noch einen Termin für die Inbetriebnahme.',
    'HINTERGRUND',
    'Regionalsekretär Pedro Rodrigues kündigte das Vorhaben am 9. November 2026 bei der Unterzeichnung einer Vereinbarung zwischen IMT-RAM und der nationalen Straßenverkehrssicherheitsbehörde ANSR an. Ziel ist es, die Zahl der Verkehrsunfälle zu senken.'
  ],
  fr: [
    'Neuf radars de vitesse prévus sur la Via Rápida',
    'Madère prévoit d’installer neuf radars de vitesse sur la Via Rápida. Le calendrier annoncé prévoit leur installation en 2027.',
    'CE QUE L’ON SAIT :',
    'Où : sur la voie rapide Via Rápida, à Madère.',
    'Quand : l’appel d’offres est prévu avant la fin de 2026, pour une installation en 2027.',
    'Statut : il s’agit d’un projet annoncé. Les articles ne confirment pas que ces radars sont déjà en service.',
    'CE QUI RESTE À PRÉCISER',
    'Les articles consultés ne donnent ni les emplacements exacts des radars ni leur date de mise en service.',
    'CONTEXTE',
    'Le secrétaire régional Pedro Rodrigues a annoncé le projet le 9 novembre 2026 lors de la signature d’un accord entre l’IMT-RAM et l’Autorité nationale de sécurité routière, l’ANSR. L’objectif est de réduire les accidents de la route.'
  ],
  es: [
    'Nueve radares de velocidad previstos para la Via Rápida',
    'Madeira prevé instalar nueve radares de velocidad en la Via Rápida. El calendario anunciado sitúa la instalación en 2027.',
    'LO QUE SE SABE:',
    'Dónde: en la vía rápida Via Rápida de Madeira.',
    'Cuándo: la licitación está prevista antes de que termine 2026, con instalación prevista para 2027.',
    'Estado: es un plan anunciado. Las noticias no confirman que estos radares ya estén funcionando.',
    'LO QUE FALTA POR CONCRETAR',
    'Las noticias consultadas no indican las ubicaciones exactas ni la fecha de puesta en funcionamiento.',
    'CONTEXTO',
    'El secretario regional Pedro Rodrigues anunció el plan el 9 de noviembre de 2026 durante la firma de un acuerdo entre el IMT-RAM y la Autoridad Nacional de Seguridad Vial, ANSR. El objetivo es reducir los accidentes de tráfico.'
  ],
  pl: [
    'Dziewięć radarów prędkości na Via Rápida w planach',
    'Na Via Rápida na Maderze planowana jest instalacja dziewięciu radarów prędkości. Według zapowiedzi montaż ma nastąpić w 2027 roku.',
    'CO WIADOMO:',
    'Gdzie: na drodze szybkiego ruchu Via Rápida na Maderze.',
    'Kiedy: przetarg ma zostać ogłoszony do końca 2026 roku, a montaż jest planowany na 2027 rok.',
    'Status: to zapowiedziany plan. Publikacje nie potwierdzają, że te radary już działają.',
    'CZEGO JESZCZE NIE PODANO',
    'W sprawdzonych publikacjach nie podano dokładnych lokalizacji radarów ani terminu ich uruchomienia.',
    'KONTEKST',
    'Sekretarz regionalny Pedro Rodrigues ogłosił plan 9 listopada 2026 roku podczas podpisania porozumienia między IMT-RAM a krajowym urzędem bezpieczeństwa ruchu drogowego ANSR. Celem jest ograniczenie liczby wypadków drogowych.'
  ]
};
export function editorialNews(source: ManagedNews, locale: Locale, full: boolean): SiteNewsArticle | null {
  if (source.id !== 'rtp-3efe3c48a8d0' || sourceFingerprint(source) !== radarFingerprint) return null;
  const [title, ...paragraphs] = editions[locale];
  return { ...source, title, paragraphs: full ? paragraphs : paragraphs.slice(0, 1), location: 'Via Rápida · Madeira', contentLanguage: locale, translationKind: 'edited', additionalSources: [{ name: 'Diário de Notícias · 09.11.2026', url: 'https://www.dnoticias.pt/app/2026/11/9/512246-radares-na-via-rapida-avancam-em-2027/' }] };
}
