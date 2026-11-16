import { useText } from '../lib/i18n/TranslationProvider';

type Source = { label: string; url: string };
export type LocationEvidence = { sources?: Source[]; checkedAt?: string; imagePending?: boolean };
const labels = {
  en: ['Sources', 'Description checked', 'This is not a live access report.', 'Photo coming soon'],
  pt: ['Fontes', 'Descrição verificada', 'Esta informação não confirma o acesso em tempo real.', 'Fotografia em breve'],
  de: ['Quellen', 'Beschreibung geprüft', 'Dies ist keine aktuelle Meldung zur Zugänglichkeit.', 'Foto folgt'],
  fr: ['Sources', 'Description vérifiée', 'Ces informations ne confirment pas l’accès en temps réel.', 'Photo à venir'],
  es: ['Fuentes', 'Descripción verificada', 'Esta información no confirma el acceso en tiempo real.', 'Foto próximamente'],
  pl: ['Źródła', 'Opis sprawdzony', 'To nie jest bieżący komunikat o dostępności.', 'Zdjęcie wkrótce'],
  uk: ['Джерела', 'Опис перевірено', 'Це не підтвердження поточної доступності.', 'Фото незабаром'],
};

export default function LocationSources({ location }: { location: LocationEvidence }) {
  const { language } = useText();
  if (!location.sources?.length) return null;
  const text = labels[language];
  return (
    <section className="border-t border-slate-200 px-5 py-5 sm:px-8" aria-label={text[0]}>
      {location.imagePending && <p className="mb-3 text-sm text-slate-500">{text[3]}</p>}
      <h2 className="font-semibold text-navy">{text[0]}</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {location.sources.map(source => (
          <li key={source.url}><a className="text-ocean underline underline-offset-2" href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>
        ))}
      </ul>
      {location.checkedAt && <p className="mt-3 text-sm text-slate-600">{text[1]}: <time dateTime={location.checkedAt}>{location.checkedAt}</time>. {text[2]}</p>}
    </section>
  );
}
