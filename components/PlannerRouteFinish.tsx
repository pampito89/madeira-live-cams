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
  return <section aria-label={locale === 'uk' ? 'Кінцева точка маршруту' : 'Route destination'} className="mt-3 rounded-2xl border border-ocean/30 bg-ocean/5 p-4">
    <p className="text-xs font-semibold text-slate-500">{locale === 'uk' ? 'Кінцева точка' : 'End point'}</p>
    <h3 className="mt-1 font-bold text-navy">{airport ? '✈️' : '📍'} {name}</h3>
    <p className="mt-2 text-sm text-navy">{locale === 'uk' ? 'Час у дорозі' : 'Travel time'}: ~{travel}</p>
    <p className="text-sm font-semibold text-navy">{locale === 'uk' ? 'Прибуття' : 'Arrival'}: {arrival}</p>
    <p role="status" className="mt-2 text-sm text-slate-600">{calculated
      ? (locale === 'uk' ? 'Усі відрізки маршруту розраховано.' : 'All route legs calculated.')
      : (locale === 'uk' ? 'Попередній план: час ще не розраховано. Натисніть «Розрахувати маршрут».' : 'Draft: times have not been calculated. Select Calculate route.')}</p>
    {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
  </section>;
}
