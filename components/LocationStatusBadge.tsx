import type { LocationStatus } from '../lib/locationStatus';
import { useText } from '../lib/i18n/TranslationProvider';
const labels = {
  uk: ['Відчинено', 'Зачинено', 'Обмежено', 'Ремонт', 'Невідомо', 'Перевірено', 'Стан за даними джерела; не гарантія безпеки.', 'Немає актуального підтвердження доступу.'],
  en: ['Open', 'Closed', 'Restricted', 'Maintenance', 'Unknown', 'Checked', 'Source-reported status; not a safety guarantee.', 'No current confirmation of access.'],
  pt: ['Aberto', 'Fechado', 'Condicionado', 'Obras', 'Desconhecido', 'Verificado', 'Estado comunicado pela fonte; não é garantia de segurança.', 'Sem confirmação atual de acesso.'],
  de: ['Offen', 'Geschlossen', 'Eingeschränkt', 'Wartung', 'Unbekannt', 'Geprüft', 'Status laut Quelle; keine Sicherheitsgarantie.', 'Keine aktuelle Bestätigung des Zugangs.'],
  fr: ['Ouvert', 'Fermé', 'Restreint', 'Travaux', 'Inconnu', 'Vérifié', 'État signalé par la source ; aucune garantie de sécurité.', 'Aucune confirmation actuelle de l’accès.'],
  es: ['Abierto', 'Cerrado', 'Restringido', 'Obras', 'Desconocido', 'Verificado', 'Estado comunicado por la fuente; no garantiza la seguridad.', 'Sin confirmación actual del acceso.'],
  pl: ['Otwarte', 'Zamknięte', 'Ograniczenia', 'Remont', 'Nieznany', 'Sprawdzono', 'Status według źródła; nie jest gwarancją bezpieczeństwa.', 'Brak aktualnego potwierdzenia dostępu.'],
};
const states = ['open', 'closed', 'restricted', 'maintenance', 'unknown'] as const;
const colors = {
  open: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  closed: 'border-red-200 bg-red-50 text-red-800',
  restricted: 'border-amber-200 bg-amber-50 text-amber-900',
  maintenance: 'border-orange-200 bg-orange-50 text-orange-900',
  unknown: 'border-slate-200 bg-slate-50 text-slate-600',
};
export default function LocationStatusBadge({ status }: { status?: LocationStatus }) {
  const { language } = useText();
  const text = labels[language];
  const state = status?.state ?? 'unknown';
  const label = text[states.indexOf(state)];
  const checked = status ? new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short', timeZone: 'Atlantic/Madeira' }).format(new Date(status.checkedAt)) : '';
  const description = status ? `${label}. IFCN · ${text[5]}: ${checked} (Madeira). ${status.detail}. ${text[6]} ${status.source}` : `${label}. ${text[7]}`;
  return <span title={description} aria-label={description} className={`mt-2 flex min-h-7 w-full items-center justify-center rounded-lg border px-1 py-1 text-center text-[10px] font-semibold leading-4 break-words ${colors[state]}`}>{label}</span>;
}
