import { useText } from '../lib/i18n/TranslationProvider';
type Props = {
    locale: 'en' | 'uk';
    name: string;
    airport: boolean;
    arrival: string;
    travel: string;
    calculated: boolean;
    error: string;
};
export default function PlannerRouteFinish({ locale, name, airport, arrival, travel, calculated, error }: Props) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    return <>
    <section aria-label={localize(locale === 'uk' ? 'Кінцева точка маршруту' : 'Route destination')} className="mt-3 hidden rounded-2xl border border-ocean/30 bg-ocean/5 p-4 sm:block">
      <p className="text-xs font-semibold text-slate-500">{localize(locale === 'uk' ? 'Кінцева точка' : 'End point')}</p>
      <h3 className="mt-1 font-bold text-navy">{localize(airport ? '✈️' : '📍')} {localize(name)}</h3>
      <p className="mt-2 text-sm text-navy">{localize(locale === 'uk' ? 'Час у дорозі' : 'Travel time')}{localize(": ~")}{localize(travel)}</p>
      <p className="text-sm font-semibold text-navy">{localize(locale === 'uk' ? 'Прибуття' : 'Arrival')}{localize(": ")}{localize(arrival)}</p>
      <p role="status" className="mt-2 text-sm text-slate-600">{localize(calculated
            ? (locale === 'uk' ? 'Усі відрізки маршруту розраховано.' : 'All route legs calculated.')
            : (locale === 'uk' ? 'Попередній план: час ще не розраховано. Натисніть «Розрахувати маршрут».' : 'Draft: times have not been calculated. Select Calculate route.'))}</p>
      {localize(error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{localize(error)}</p>)}
    </section>
    {localize(error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700 sm:hidden">{localize(error)}</p>)}
  </>;
}
