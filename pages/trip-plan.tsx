import { useMemo, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { getLocalizedLocation, locations } from '../data/locations';
import { stays } from '../data/stays';
import { useMessages } from '../lib/i18n/useMessages';

type Coordinates = [number, number];
type Point = { id: string; name: string; coordinates: Coordinates; duration: number; slug?: string };
type Usage = { limit: number; used: number; remaining: number; month: string };

const airport = { name: 'Madeira Airport', coordinates: [32.6919, -16.7745] as Coordinates };
const otherPoint = 'other-route-point';
const durations = [15, 30, 45, 60, 90, 120, 150, 180, 240];
const knownCoordinates: Record<string, Coordinates> = {
  'pico-do-arieiro': [32.7353, -16.9281], 'pico-ruivo': [32.7547, -16.9336],
  'fanal-forest': [32.8147, -17.1494], 'praia-do-porto-do-seixal': [32.8266, -17.1052],
  'machico-beach': [32.7212, -16.7652], 'faja-dos-padres': [32.6651, -17.0045],
  'calheta-beach': [32.7211, -17.176], 'prainha-do-canical': [32.7423, -16.7134],
  'porto-moniz-natural-pools': [32.8667, -17.1662], 'ribeira-da-janela': [32.8537, -17.1579],
  funchal: [32.6496, -16.9087], 'mercado-dos-lavradores': [32.648, -16.9033],
  'cristo-rei': [32.6371, -16.8549], 'pico-do-facho': [32.724, -16.7814],
  'cabo-girao-skywalk': [32.6567, -17.0115], 'anjos-waterfall': [32.6925, -17.1027],
  'miradouro-do-guindaste': [32.8393, -16.8869], 'levada-nova-levada-do-moinho': [32.6942, -17.0993],
  'monte-palace-tropical-garden': [32.6799, -16.8989], 'santana-typical-houses': [32.8037, -16.8803],
  'ponta-de-sao-lourenco': [32.7443, -16.6994], 'madeira-international-airport': airport.coordinates,
};

function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(':').map(Number);
  const value = (hours * 60 + mins + minutes) % 1440;
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function durationLabel(value: number, locale: 'en' | 'uk') {
  if (value < 60) return locale === 'uk' ? `${value} хв` : `${value} min`;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return locale === 'uk' ? `${hours} год${minutes ? ` ${minutes} хв` : ''}` : `${hours} hr${minutes ? ` ${minutes} min` : ''}`;
}

function directCoordinates(value: string): Coordinates | null {
  const match = value.match(/@?(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
  if (!match) return null;
  const latitude = Number(match[1]), longitude = Number(match[2]);
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180 ? [latitude, longitude] : null;
}

export default function TripPlanPage() {
  const { locale } = useMessages();
  const ukrainian = locale === 'uk';
  const t = ukrainian ? {
    title: 'План подорожі', start: 'Початкова точка', finish: 'Кінцева точка', same: 'Старт = фініш',
    other: 'Інша точка маршруту', name: 'Назва точки', link: 'Google Maps посилання або координати',
    details: 'Деталі дня', departure: 'Час виїзду', add: 'Додати точку', choose: 'Оберіть локацію',
    custom: 'Довільна точка', route: 'Маршрут дня', calculate: 'Розрахувати маршрут', clear: 'Очистити',
    arrival: 'Прибуття', duration: 'Тривалість', remove: 'Видалити', finishAt: 'Фініш', resolving: 'Визначаємо точку…',
    pointError: 'Не вдалося визначити координати. Вставте Google Maps URL або координати.', noStops: 'Додайте локацію або довільну точку.',
  } : {
    title: 'Trip plan', start: 'Starting point', finish: 'End point', same: 'Start = finish',
    other: 'Other route point', name: 'Point name', link: 'Google Maps link or coordinates',
    details: 'Day details', departure: 'Departure time', add: 'Add point', choose: 'Choose a location',
    custom: 'Custom point', route: 'Day route', calculate: 'Calculate route', clear: 'Clear',
    arrival: 'Arrival', duration: 'Duration', remove: 'Remove', finishAt: 'Finish', resolving: 'Resolving point…',
    pointError: 'Coordinates could not be resolved. Paste a Google Maps URL or coordinates.', noStops: 'Add a location or custom point.',
  };
  const [start, setStart] = useState(stays[0].slug);
  const [finish, setFinish] = useState(stays[0].slug);
  const [sameStartFinish, setSameStartFinish] = useState(true);
  const [startCustomName, setStartCustomName] = useState('');
  const [startCustomValue, setStartCustomValue] = useState('');
  const [finishCustomName, setFinishCustomName] = useState('');
  const [finishCustomValue, setFinishCustomValue] = useState('');
  const [customName, setCustomName] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [departure, setDeparture] = useState('09:00');
  const [points, setPoints] = useState<Point[]>([]);
  const [arrivals, setArrivals] = useState<string[]>([]);
  const [finishArrival, setFinishArrival] = useState('');
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectableLocations = useMemo(() => locations
    .map((location) => ({ location: getLocalizedLocation(location, locale), coordinates: knownCoordinates[location.slug] ?? directCoordinates(location.mapQuery) }))
    .filter((item) => item.coordinates)
    .sort((a, b) => a.location.name.localeCompare(b.location.name, locale)), [locale]);

  const resolve = async (value: string, name: string) => {
    const coordinates = directCoordinates(value);
    if (coordinates) return { name: name || t.other, coordinates };
    const response = await fetch('/api/resolve-route-point', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }) });
    const data = await response.json() as { latitude?: number; longitude?: number; name?: string | null; error?: string };
    if (!response.ok || data.latitude === undefined || data.longitude === undefined) throw new Error(data.error || t.pointError);
    return { name: name || data.name || t.other, coordinates: [data.latitude, data.longitude] as Coordinates };
  };

  const selectedBase = (value: string, name: string, customValue: string) => {
    if (value === otherPoint) return customValue ? resolve(customValue, name) : Promise.resolve(null);
    if (value === 'airport') return Promise.resolve(airport);
    const stay = stays.find((item) => item.slug === value);
    return Promise.resolve(stay ? { name: stay.name, coordinates: [stay.latitude, stay.longitude] as Coordinates } : null);
  };

  const addLocation = () => {
    const item = selectableLocations.find(({ location }) => location.slug === selectedSlug);
    if (!item?.coordinates) return;
    setPoints((current) => [...current, { id: `${item.location.slug}-${Date.now()}`, name: item.location.name, coordinates: item.coordinates as Coordinates, slug: item.location.slug, duration: 90 }]);
    setSelectedSlug('');
  };

  const addCustom = async () => {
    if (!customValue.trim()) return;
    setLoading(true); setError('');
    try {
      const point = await resolve(customValue, customName);
      setPoints((current) => [...current, { id: `custom-${Date.now()}`, ...point, duration: 90 }]);
      setCustomName(''); setCustomValue('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : t.pointError); }
    finally { setLoading(false); }
  };

  const calculate = async () => {
    if (!points.length || loading) return;
    setLoading(true); setError('');
    try {
      const startPoint = await selectedBase(start, startCustomName, startCustomValue);
      const endPoint = sameStartFinish ? startPoint : await selectedBase(finish, finishCustomName, finishCustomValue);
      if (!startPoint || !endPoint) throw new Error(t.pointError);
      const journey = [...points, { id: 'finish', ...endPoint, duration: 0 }];
      let previous = startPoint.coordinates, cursor = departure;
      const nextArrivals: string[] = [];
      for (const point of journey) {
        const response = await fetch('/api/route-time', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin: { latitude: previous[0], longitude: previous[1] }, destination: { latitude: point.coordinates[0], longitude: point.coordinates[1] } }) });
        const data = await response.json() as { durationMinutes?: number; usage?: Usage; error?: string };
        if (!response.ok || !data.durationMinutes) throw new Error(data.error || 'Google Routes error.');
        if (data.usage) setUsage(data.usage);
        cursor = addMinutes(cursor, Math.ceil(data.durationMinutes / 5) * 5);
        nextArrivals.push(cursor);
        cursor = addMinutes(cursor, point.duration);
        previous = point.coordinates;
      }
      setArrivals(nextArrivals.slice(0, -1)); setFinishArrival(nextArrivals.at(-1) ?? '');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to calculate the route.'); }
    finally { setLoading(false); }
  };

  const selectOptions = <><option value="airport">{airport.name}</option>{stays.map((stay) => <option key={stay.slug} value={stay.slug}>{stay.name}</option>)}<option value={otherPoint}>{t.other}</option></>;
  const customFields = (name: string, setName: (value: string) => void, value: string, setValue: (value: string) => void) => <div className="grid gap-3 sm:grid-cols-2"><label className="flex flex-col gap-1 text-sm font-semibold text-navy">{t.name}<input value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm" placeholder={ukrainian ? 'Наприклад, Restaurant X' : 'For example, Restaurant X'} /></label><label className="flex flex-col gap-1 text-sm font-semibold text-navy">{t.link}<input value={value} onChange={(event) => setValue(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm" placeholder="https://maps.app.goo.gl/…" /></label></div>;

  return <Layout><Head><title>{t.title} | Madeira Live Cams</title></Head><main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10"><section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8"><p className="text-sm font-semibold uppercase tracking-wider text-ocean">Madeira Live Cams</p><h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{t.title}</h1><p className="mt-3 text-slate-600">{ukrainian ? 'Оберіть старт, зупинки та фініш. Google Routes порахує весь маршрут, включно з останнім відрізком.' : 'Choose a start, stops and finish. Google Routes calculates the entire route, including the final leg.'}</p>
    <div className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-panel p-4 sm:p-5"><h2 className="text-lg font-bold text-navy">{t.details}</h2><div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-1 text-sm font-semibold text-navy">{t.start}<select value={start} onChange={(event) => setStart(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm">{selectOptions}</select></label><label className="flex flex-col gap-1 text-sm font-semibold text-navy">{t.departure}<input type="time" value={departure} onChange={(event) => setDeparture(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm" /></label></div>{start === otherPoint && customFields(startCustomName, setStartCustomName, startCustomValue, setStartCustomValue)}<label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-navy"><input type="checkbox" checked={sameStartFinish} onChange={(event) => setSameStartFinish(event.target.checked)} className="h-4 w-4 rounded text-ocean focus:ring-ocean" />{t.same}</label>{!sameStartFinish && <><label className="flex flex-col gap-1 text-sm font-semibold text-navy">{t.finish}<select value={finish} onChange={(event) => setFinish(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm">{selectOptions}</select></label>{finish === otherPoint && customFields(finishCustomName, setFinishCustomName, finishCustomValue, setFinishCustomValue)}</>}</div>
    <div className="mt-6 rounded-2xl border border-slate-200 p-4 sm:p-5"><h2 className="text-lg font-bold text-navy">{t.add}</h2><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm"><option value="">{t.choose}</option>{selectableLocations.map(({ location }) => <option key={location.slug} value={location.slug}>{location.name}</option>)}</select><button type="button" onClick={addLocation} disabled={!selectedSlug} className="min-h-11 rounded-lg bg-ocean px-4 text-sm font-bold text-white disabled:opacity-40">+ 📍</button></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input value={customName} onChange={(event) => setCustomName(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm" placeholder={t.name} /><input value={customValue} onChange={(event) => setCustomValue(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm" placeholder={t.link} /><button type="button" onClick={addCustom} disabled={loading || !customValue.trim()} className="min-h-11 rounded-lg border border-ocean bg-white px-4 text-sm font-bold text-ocean disabled:opacity-40">{loading ? t.resolving : '+ 📍'}</button></div>{error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}</div>
    <section className="mt-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-navy">{t.route}</h2>{points.length > 0 && <button type="button" onClick={() => { setPoints([]); setArrivals([]); setFinishArrival(''); }} className="text-sm font-semibold text-slate-500 hover:text-ocean">{t.clear}</button>}</div>{points.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">{t.noStops}</p> : <div className="mt-3 space-y-3">{points.map((point, index) => <article key={point.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white">{index + 1}</span><div className="flex-1"><p className="font-bold text-navy">📍 {point.name}</p><p className="mt-1 text-xs text-slate-500">{arrivals[index] ? `${t.arrival}: ${arrivals[index]}` : ''}</p></div><button type="button" onClick={() => setPoints((current) => current.filter((item) => item.id !== point.id))} className="text-sm font-semibold text-slate-500 hover:text-red-600">×</button></div><label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-600">{t.duration}<select value={point.duration} onChange={(event) => setPoints((current) => current.map((item) => item.id === point.id ? { ...item, duration: Number(event.target.value) } : item))} className="min-h-10 rounded-lg border border-slate-300 px-2 text-sm">{durations.map((value) => <option key={value} value={value}>{durationLabel(value, locale)}</option>)}</select></label></article>)}</div>}</section>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-panel p-4 sm:p-5"><button type="button" onClick={calculate} disabled={loading || !points.length} className="min-h-11 rounded-lg border border-ocean bg-white px-4 text-sm font-bold text-ocean disabled:opacity-40">{loading ? (ukrainian ? 'Розраховуємо…' : 'Calculating…') : t.calculate}</button>{finishArrival && <p className="mt-4 rounded-xl bg-white p-4 text-sm font-semibold text-navy">🏁 {t.finishAt}: {finishArrival} — {sameStartFinish ? (start === otherPoint ? startCustomName || t.other : start === 'airport' ? airport.name : stays.find((stay) => stay.slug === start)?.name) : (finish === otherPoint ? finishCustomName || t.other : finish === 'airport' ? airport.name : stays.find((stay) => stay.slug === finish)?.name)}</p>}{usage && <p className="mt-3 text-xs text-slate-500">Google Routes: {usage.remaining.toLocaleString()} / {usage.limit.toLocaleString()}</p>}</section>
  </section></main></Layout>;
}
