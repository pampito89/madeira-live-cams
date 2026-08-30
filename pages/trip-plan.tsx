import { useMemo, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { getLocalizedLocation, locations } from '../data/locations';
import { useMessages } from '../lib/i18n/useMessages';
import { stays } from '../data/stays';

type PlanStop = {
  id: string;
  type: 'location' | 'restaurant' | 'villa';
  slug?: string;
  arrivalTime: string;
  durationMinutes: number;
};

const villas = stays;
const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180, 240];

const standardLocationDurations: Record<string, number> = {
  'pico-do-arieiro': 150,
  'fanal-forest': 120,
  'praia-do-porto-do-seixal': 120,
  'machico-beach': 150,
  'faja-dos-padres': 240,
  'calheta-beach': 180,
  'prainha-do-canical': 180,
  'porto-moniz-natural-pools': 150,
  'ribeira-da-janela': 30,
  funchal: 90,
  'mercado-dos-lavradores': 30,
  'cristo-rei': 45,
  'pico-do-facho': 30,
  'cabo-girao-skywalk': 30,
  'anjos-waterfall': 30,
  'miradouro-do-guindaste': 30,
  'levada-nova-levada-do-moinho': 150,
  'monte-palace-tropical-garden': 120,
  'santana-typical-houses': 15,
  'ponta-de-sao-lourenco': 180,
};

function todayValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  const nextHours = Math.floor((total % 1440) / 60).toString().padStart(2, '0');
  const nextMinutes = (total % 60).toString().padStart(2, '0');
  return `${nextHours}:${nextMinutes}`;
}

function durationLabel(minutes: number, locale: 'en' | 'uk') {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (locale === 'uk') {
    if (hours === 0) return `${remainingMinutes} хв`;
    if (remainingMinutes === 0) return `${hours} год`;
    return `${hours} год ${remainingMinutes} хв`;
  }

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

export default function TripPlanPage() {
  const { locale, messages } = useMessages();
  const [date, setDate] = useState(todayValue);
  const [villa, setVilla] = useState(villas[0].slug);
  const selectedVilla = stays.find((stay) => stay.slug === villa) ?? stays[0];
  const [departureTime, setDepartureTime] = useState('09:00');
  const [stops, setStops] = useState<PlanStop[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [locationFilter, setLocationFilter] = useState('Lab Travel');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const text =
    locale === 'uk'
      ? {
          title: 'План подорожі',
          intro: 'Створіть просту програму дня: оберіть віллу, додайте локації, ресторан і час для кожної зупинки.',
          dayDetails: 'Деталі дня',
          date: 'Дата',
          startVilla: 'Стартова вілла',
          departure: 'Час виїзду',
          addStop: 'Додати точку',
          location: 'Локація',
          locationFilters: 'Фільтр локацій',
          allLocations: 'Усі',
          chooseLocation: 'Оберіть локацію',
          addLocation: 'Додати локацію',
          addRestaurant: 'Додати ресторан',
          addVilla: 'Додати повернення на віллу',
          selectedStops: 'Маршрут дня',
          noStops: 'Додайте першу локацію або ресторан, щоб сформувати маршрут.',
          arrival: 'Прибуття',
          duration: 'Тривалість',
          up: 'Вище',
          down: 'Нижче',
          remove: 'Видалити',
          restaurant: 'Ресторан',
          villaStop: 'Повернення на віллу',
          output: 'Готова програма',
          copy: 'Копіювати програму',
          copied: 'Скопійовано',
          clear: 'Очистити маршрут',
          return: 'Повернення до',
          departureFrom: 'виїзд з',
          lunch: 'обід у ресторані',
          defaultProgram: 'Додайте точки маршруту — тут з’явиться готова програма для копіювання.',
        }
      : {
          title: 'Trip plan',
          intro: 'Create a simple day itinerary: choose a villa, add locations, a restaurant stop and timing for each point.',
          dayDetails: 'Day details',
          date: 'Date',
          startVilla: 'Starting villa',
          departure: 'Departure time',
          addStop: 'Add a stop',
          location: 'Location',
          locationFilters: 'Location filters',
          allLocations: 'All',
          chooseLocation: 'Choose a location',
          addLocation: 'Add location',
          addRestaurant: 'Add restaurant',
          addVilla: 'Add villa return',
          selectedStops: 'Day route',
          noStops: 'Add your first location or restaurant to build the route.',
          arrival: 'Arrival',
          duration: 'Duration',
          up: 'Move up',
          down: 'Move down',
          remove: 'Remove',
          restaurant: 'Restaurant',
          villaStop: 'Villa return',
          output: 'Ready programme',
          copy: 'Copy programme',
          copied: 'Copied',
          clear: 'Clear route',
          return: 'Return to',
          departureFrom: 'departure from',
          lunch: 'lunch at a restaurant',
          defaultProgram: 'Add route stops and a ready-to-copy programme will appear here.',
        };

  const locationFilters = [
    { value: 'All', label: messages.exploreList.filters.all },
    { value: 'Viewpoints', label: messages.exploreList.filters.viewpoints },
    { value: 'Hiking', label: messages.exploreList.filters.hiking },
    { value: 'Beaches', label: messages.exploreList.filters.beaches },
    { value: 'City & culture', label: messages.exploreList.filters.cityCulture },
    { value: 'Levada walks', label: messages.exploreList.filters.levadaWalks },
    { value: 'Airport', label: locale === 'uk' ? 'Аеропорт' : 'Airport' },
    { value: 'Lab Travel', label: 'Lab Travel' },
  ];

  const availableLocations = useMemo(
    () =>
      locations
        .filter(
          (location) =>
            locationFilter === 'All' || location.tags.includes(locationFilter),
        )
        .map((location) => getLocalizedLocation(location, locale))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [locale, locationFilter],
  );

  const locationBySlug = useMemo(
    () => new Map(locations.map((location) => [
      location.slug,
      getLocalizedLocation(location, locale),
    ])),
    [locale],
  );

  const getNextArrivalTime = () => {
    const previousStop = stops[stops.length - 1];

    if (!previousStop) {
      return addMinutes(departureTime, 30);
    }

    return addMinutes(
      previousStop.arrivalTime,
      previousStop.durationMinutes + 30,
    );
  };

  const addLocation = () => {
    if (!selectedSlug) return;

    const selectedLocation = locations.find(
      (location) => location.slug === selectedSlug,
    );
    const isMadeiraAirport = selectedLocation?.tags.includes('Airport');

    setStops((current) => [
      ...current,
      {
        id: `${selectedSlug}-${Date.now()}`,
        type: 'location',
        slug: selectedSlug,
        arrivalTime: getNextArrivalTime(),
        durationMinutes: isMadeiraAirport
          ? 15
          : standardLocationDurations[selectedSlug] ?? 90,
      },
    ]);
    setSelectedSlug('');
  };

  const addRestaurant = () => {
    setStops((current) => [
      ...current,
      {
        id: `restaurant-${Date.now()}`,
        type: 'restaurant',
        arrivalTime: getNextArrivalTime(),
        durationMinutes: 90,
      },
    ]);
  };

  const addVillaStop = () => {
    setStops((current) => [
      ...current,
      {
        id: `villa-${Date.now()}`,
        type: 'villa',
        arrivalTime: getNextArrivalTime(),
        durationMinutes: 120,
      },
    ]);
  };

  const updateStop = (id: string, updates: Partial<PlanStop>) => {
    setStops((current) => current.map((stop) => (stop.id === id ? { ...stop, ...updates } : stop)));
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    setStops((current) => {
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const removeStop = (id: string) => {
    setStops((current) => current.filter((stop) => stop.id !== id));
  };

  const programme = useMemo(() => {
    if (stops.length === 0) return '';

    const selectedDate = new Date(`${date}T12:00:00`);
    const formattedDate = new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
      day: 'numeric',
      month: 'long',
    }).format(selectedDate);
    const ukrainianWeekdays = ['неділю', 'понеділок', 'вівторок', 'середу', 'четвер', 'п’ятницю', 'суботу'];
    const englishWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(selectedDate);
    const heading = locale === 'uk'
      ? `Програма на ${ukrainianWeekdays[selectedDate.getDay()]}, ${formattedDate}`
      : `Programme for ${englishWeekday}, ${formattedDate}`;
    const lines = [heading, '', `${"🚌"} ${departureTime} — ${text.departureFrom} ${selectedVilla.name}.`, ''];

    const endsAtAirport =
      stops[stops.length - 1]?.type === 'location' &&
      stops[stops.length - 1]?.slug === 'madeira-international-airport';

    stops.forEach((stop, index) => {
      const endTime = addMinutes(stop.arrivalTime, stop.durationMinutes);

      if (stop.type === 'restaurant') {
        lines.push(`🍽️ ${stop.arrivalTime}–${endTime} — ${text.lunch}.`, '');
        return;
      }

      if (stop.type === 'villa') {
        lines.push(
          `🏡 ${stop.arrivalTime}–${endTime} — ${selectedVilla.name}.`,
          `https://madeiralivecams.com/${locale}/stays/${selectedVilla.slug}`,
          '',
        );
        return;
      }

      if (stop.type === 'location' && stop.slug === 'madeira-international-airport') {
        const airport = locationBySlug.get(stop.slug);

        if (airport) {
          lines.push(
            `✈️ ${stop.arrivalTime}–${endTime} — ${airport.name}.`,
            `https://madeiralivecams.com/${locale}/explore/${airport.slug}`,
            '',
          );
        }

        return;
      }

      const location = stop.slug ? locationBySlug.get(stop.slug) : undefined;
      if (!location) return;

      const icon = location.tags.includes('Beaches') ? '🏖️' : location.tags.includes('Hiking') ? '🌿' : '📍';
      const sunriseSuffix =
        index === 0 && location.slug === 'pico-do-arieiro'
          ? locale === 'uk'
            ? ' Зустрічаємо схід сонця + прогулянка по маршруту PR1 – Vereda do Areeiro до Miradouro da Pedra Rija.'
            : ' Sunrise viewing plus a walk on PR1 – Vereda do Areeiro to Miradouro da Pedra Rija.'
          : '';
      lines.push(
        `${icon} ${stop.arrivalTime}–${endTime} — ${location.name}.${sunriseSuffix}`,
        `https://madeiralivecams.com/${locale}/explore/${location.slug}`,
        '',
      );
    });

    if (endsAtAirport) {
      lines.push(
        locale === 'uk'
          ? '😭 На цьому програма туру завершена.'
          : '😭 The tour programme ends here.',
      );
    } else {
      lines.push(
        `🏡 ${text.return} ${selectedVilla.name}.`,
        `https://madeiralivecams.com/${locale}/stays/${selectedVilla.slug}`,
      );
    }
    return lines.join('\n');
  }, [date, departureTime, locale, locationBySlug, stops, text.departureFrom, text.lunch, text.return, selectedVilla]);

  const copyProgramme = async () => {
    if (!programme) return;
    await navigator.clipboard.writeText(programme);
    setCopyStatus('copied');
    window.setTimeout(() => setCopyStatus('idle'), 2000);
  };

  return (
    <Layout>
      <Head>
        <title>{text.title} | Madeira Live Cams</title>
        <meta name="description" content={text.intro} />
      </Head>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-ocean">Madeira Live Cams</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">{text.title}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">{text.intro}</p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-panel p-4 sm:p-5">
            <h2 className="text-lg font-bold text-navy">{text.dayDetails}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {text.date}
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {text.startVilla}
                <select value={villa} onChange={(event) => setVilla(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20">
                  {villas.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {text.departure}
                <input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <h2 className="text-lg font-bold text-navy">{text.addStop}</h2>
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy">{text.locationFilters}</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {locationFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setLocationFilter(filter.value);
                      setSelectedSlug('');
                    }}
                    className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${
                      locationFilter === filter.value
                        ? 'border-ocean bg-ocean text-white'
                        : 'border-slate-200 bg-white text-navy hover:border-ocean hover:text-ocean'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold text-navy">
                {text.location}
                <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20">
                  <option value="">{text.chooseLocation}</option>
                  {availableLocations.map((location) => <option key={location.slug} value={location.slug}>{location.name}</option>)}
                </select>
              </label>
              <button type="button" onClick={addLocation} disabled={!selectedSlug} className="min-h-11 rounded-lg bg-ocean px-4 text-sm font-bold text-white transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-40 sm:self-end">
                + {text.addLocation}
              </button>
              <button type="button" onClick={addRestaurant} className="min-h-11 rounded-lg border border-ocean bg-white px-4 text-sm font-bold text-ocean transition hover:bg-ocean hover:text-white sm:self-end">
                + {text.addRestaurant}
              </button>
              <button type="button" onClick={addVillaStop} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-navy transition hover:border-ocean hover:text-ocean sm:self-end">
                + {text.addVilla}
              </button>
            </div>
          </div>

          <section className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-navy">{text.selectedStops}</h2>
              {stops.length > 0 && <button type="button" onClick={() => setStops([])} className="text-sm font-semibold text-slate-500 hover:text-ocean">{text.clear}</button>}
            </div>

            {stops.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-500">{text.noStops}</p>
            ) : (
              <div className="mt-3 space-y-3">
                {stops.map((stop, index) => {
                  const location = stop.slug ? locationBySlug.get(stop.slug) : undefined;
                  const name = stop.type === 'restaurant' ? text.restaurant : stop.type === 'villa' ? selectedVilla.name : location?.name ?? '';
                  const icon = stop.type === 'restaurant' ? '🍽️' : stop.type === 'villa' ? '🏡' : location?.tags.includes('Beaches') ? '🏖️' : location?.tags.includes('Hiking') ? '🌿' : '📍';

                  return (
                    <article key={stop.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-navy">{icon} {name}</p>
                          <p className="mt-1 text-xs text-slate-500">{durationLabel(stop.durationMinutes, locale)}</p>
                        </div>
                        <button type="button" onClick={() => removeStop(stop.id)} aria-label={text.remove} className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600">×</button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                          {text.arrival}
                          <input type="time" value={stop.arrivalTime} onChange={(event) => updateStop(stop.id, { arrivalTime: event.target.value })} className="min-h-10 rounded-lg border border-slate-300 px-2 text-sm text-navy focus:border-ocean focus:outline-none" />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                          {text.duration}
                          <select value={stop.durationMinutes} onChange={(event) => updateStop(stop.id, { durationMinutes: Number(event.target.value) })} className="min-h-10 rounded-lg border border-slate-300 px-2 text-sm text-navy focus:border-ocean focus:outline-none">
                            {durationOptions.map((minutes) => <option key={minutes} value={minutes}>{durationLabel(minutes, locale)}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => moveStop(index, -1)} disabled={index === 0} className="min-h-10 flex-1 rounded-lg border border-slate-200 text-xs font-bold text-navy transition hover:border-ocean hover:text-ocean disabled:opacity-35">↑ {text.up}</button>
                        <button type="button" onClick={() => moveStop(index, 1)} disabled={index === stops.length - 1} className="min-h-10 flex-1 rounded-lg border border-slate-200 text-xs font-bold text-navy transition hover:border-ocean hover:text-ocean disabled:opacity-35">↓ {text.down}</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-navy">{text.output}</h2>
              <button type="button" onClick={copyProgramme} disabled={!programme} className="min-h-10 rounded-lg bg-ocean px-4 text-sm font-bold text-white transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-40">
                {copyStatus === 'copied' ? `✓ ${text.copied}` : text.copy}
              </button>
            </div>
            <textarea readOnly value={programme || text.defaultProgram} className="mt-4 min-h-[260px] w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm leading-6 text-slate-700 focus:outline-none" />
          </section>
        </section>
      </main>
    </Layout>
  );
}
