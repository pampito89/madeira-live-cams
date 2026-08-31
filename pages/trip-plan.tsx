import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { getLocalizedLocation, locations } from '../data/locations';
import { useMessages } from '../lib/i18n/useMessages';
import { stays } from '../data/stays';

type MealType = 'breakfast' | 'lunch' | 'dinner';
type RecommendationKey = 'weather' | 'beach' | 'levada' | 'sunrise';
type PlanStop = { id: string; type: 'location' | 'restaurant' | 'villa'; slug?: string; arrivalTime: string; durationMinutes: number; isSunrise?: boolean; mealType?: MealType; hasCristovaoBar?: boolean; hasCristovaoRestaurant?: boolean };
type WeatherSummary = { averageTemperature: number; rainProbability: number; picoTemperature: number | null; picoWindSpeed: number | null; picoWindGusts: number | null; waterTemperature: number | null };

const villas = stays;
const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180, 240];
const standardLocationDurations: Record<string, number> = { 'pico-do-arieiro': 180, 'fanal-forest': 120, 'praia-do-porto-do-seixal': 120, 'machico-beach': 150, 'faja-dos-padres': 240, 'calheta-beach': 180, 'prainha-do-canical': 180, 'porto-moniz-natural-pools': 150, 'ribeira-da-janela': 30, funchal: 90, 'mercado-dos-lavradores': 30, 'cristo-rei': 45, 'pico-do-facho': 30, 'cabo-girao-skywalk': 30, 'anjos-waterfall': 30, 'miradouro-do-guindaste': 30, 'levada-nova-levada-do-moinho': 150, 'monte-palace-tropical-garden': 120, 'santana-typical-houses': 15, 'ponta-de-sao-lourenco': 180, 'miradouro-sao-cristovao': 30 };

const locationCoordinates: Record<string, [number, number]> = {
  'pico-do-arieiro': [32.7353, -16.9281], 'pico-ruivo': [32.7547, -16.9336], 'pico-grande': [32.7211, -16.9914],
  'fanal-forest': [32.8147, -17.1494], 'praia-do-porto-do-seixal': [32.8266, -17.1052], 'machico-beach': [32.7212, -16.7652],
  'faja-dos-padres': [32.6651, -17.0045], 'calheta-beach': [32.7211, -17.1760], 'prainha-do-canical': [32.7423, -16.7134],
  'porto-moniz-natural-pools': [32.8667, -17.1662], 'ribeira-da-janela': [32.8537, -17.1579], funchal: [32.6496, -16.9087],
  'mercado-dos-lavradores': [32.6480, -16.9033], 'cristo-rei': [32.6371, -16.8549], 'pico-do-facho': [32.7240, -16.7814],
  'cabo-girao-skywalk': [32.6567, -17.0115], 'anjos-waterfall': [32.6925, -17.1027], 'miradouro-do-guindaste': [32.8393, -16.8869],
  'levada-nova-levada-do-moinho': [32.6942, -17.0993], 'monte-palace-tropical-garden': [32.6799, -16.8989],
  'santana-typical-houses': [32.8037, -16.8803], 'ponta-de-sao-lourenco': [32.7443, -16.6994], 'madeira-international-airport': [32.6919, -16.7745],
};

function todayValue() { const date = new Date(); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10); }
function addMinutes(time: string, minutes: number) { const [hours, mins] = time.split(':').map(Number); const total = hours * 60 + mins + minutes; return `${Math.floor((total % 1440) / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`; }
function durationLabel(minutes: number, locale: 'en' | 'uk') { const hours = Math.floor(minutes / 60); const remaining = minutes % 60; if (locale === 'uk') return hours === 0 ? `${remaining} хв` : remaining === 0 ? `${hours} год` : `${hours} год ${remaining} хв`; return hours === 0 ? `${remaining} min` : remaining === 0 ? `${hours} hr` : `${hours} hr ${remaining} min`; }
function adviceForWeather(temperature: number, rain: number, locale: 'en' | 'uk') { if (locale === 'uk') { const clothing = temperature < 12 ? 'Одягайтеся тепло і шарами: тепла кофта, вітрозахисна куртка та закрите взуття.' : temperature < 20 ? 'Одягайтеся шарами: легка кофта або вітровка буде доречною.' : 'Підійде легкий одяг, але візьміть тонку кофту або вітровку на вечір та для гір.'; return `${rain >= 30 ? 'Ймовірність дощу достатня — візьміть дощовик.' : 'Ймовірність дощу невисока, але легкий дощовик у Мадейрі все одно буде корисним.'} ${clothing}`; } const clothing = temperature < 12 ? 'Dress warmly in layers: a warm mid-layer, windproof jacket and closed shoes.' : temperature < 20 ? 'Dress in layers; a light fleece or windbreaker is recommended.' : 'Light clothing is suitable, but bring a thin layer or windbreaker for the evening and mountains.'; return `${rain >= 30 ? 'Rain is possible, so take a rain jacket.' : 'Rain risk is low, but a light rain jacket is still useful in Madeira.'} ${clothing}`; }

export default function TripPlanPage() {
  const { locale, messages } = useMessages();
  const [date, setDate] = useState(todayValue); const [villa, setVilla] = useState(villas[0].slug); const selectedVilla = stays.find((stay) => stay.slug === villa) ?? stays[0];
  const [departureTime, setDepartureTime] = useState('09:00'); const [stops, setStops] = useState<PlanStop[]>([]); const [selectedSlug, setSelectedSlug] = useState(''); const [locationFilter, setLocationFilter] = useState('Lab Travel'); const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [recommendations, setRecommendations] = useState<Record<RecommendationKey, boolean>>({ weather: false, beach: false, levada: false, sunrise: false });
  const [weather, setWeather] = useState<WeatherSummary | null>(null); const [weatherStatus, setWeatherStatus] = useState<'idle' | 'loading' | 'unavailable'>('idle');
  const [routeStatus, setRouteStatus] = useState<'idle' | 'loading'>('idle');

  const text = locale === 'uk' ? {
    title: 'План подорожі', intro: 'Створіть просту програму дня: оберіть віллу, додайте локації, ресторан і час для кожної зупинки.', dayDetails: 'Деталі дня', date: 'Дата', startVilla: 'Стартова вілла', departure: 'Час виїзду', addStop: 'Додати точку', location: 'Локація', locationFilters: 'Фільтр локацій', chooseLocation: 'Оберіть локацію', addLocation: 'Додати локацію', addRestaurant: 'Додати ресторан', addVilla: 'Додати повернення на віллу', selectedStops: 'Маршрут дня', noStops: 'Додайте першу локацію або ресторан, щоб сформувати маршрут.', arrival: 'Прибуття', duration: 'Тривалість', sunrise: 'Схід сонця', bar: 'Бар', restaurantOption: 'Ресторан', meal: 'Прийом їжі', breakfast: 'Сніданок', lunch: 'Обід', dinner: 'Вечеря', up: 'Вище', down: 'Нижче', remove: 'Видалити', restaurant: 'Ресторан', output: 'Готова програма', share: 'Поділитися', copied: 'Скопійовано', clear: 'Очистити маршрут', return: 'Повернення до', departureFrom: 'виїзд з', defaultProgram: 'Додайте точки маршруту — тут з’явиться готова програма для копіювання.', recommendations: 'Рекомендації на день', weather: 'Погода', beach: 'Пляж', levada: 'Левада', weatherLoading: 'Завантажуємо актуальний прогноз…', weatherUnavailable: 'Актуальний прогноз для обраної дати недоступний. Перевірте погоду перед виїздом.',
  } : {
    title: 'Trip plan', intro: 'Create a simple day itinerary: choose a villa, add locations, a restaurant stop and timing for each point.', dayDetails: 'Day details', date: 'Date', startVilla: 'Starting villa', departure: 'Departure time', addStop: 'Add a stop', location: 'Location', locationFilters: 'Location filters', chooseLocation: 'Choose a location', addLocation: 'Add location', addRestaurant: 'Add restaurant', addVilla: 'Add villa return', selectedStops: 'Day route', noStops: 'Add your first location or restaurant to build the route.', arrival: 'Arrival', duration: 'Duration', sunrise: 'Sunrise', bar: 'Bar', restaurantOption: 'Restaurant', meal: 'Meal', breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', up: 'Move up', down: 'Move down', remove: 'Remove', restaurant: 'Restaurant', output: 'Ready programme', share: 'Share', copied: 'Copied', clear: 'Clear route', return: 'Return to', departureFrom: 'departure from', defaultProgram: 'Add route stops and a ready-to-copy programme will appear here.', recommendations: 'Day recommendations', weather: 'Weather', beach: 'Beach', levada: 'Levada', weatherLoading: 'Loading the current forecast…', weatherUnavailable: 'A current forecast is unavailable for the selected date. Check the weather before departure.',
  };

  const locationFilters = [{ value: 'All', label: messages.exploreList.filters.all }, { value: 'Viewpoints', label: messages.exploreList.filters.viewpoints }, { value: 'Hiking', label: messages.exploreList.filters.hiking }, { value: 'Beaches', label: messages.exploreList.filters.beaches }, { value: 'City & culture', label: messages.exploreList.filters.cityCulture }, { value: 'Levada walks', label: messages.exploreList.filters.levadaWalks }, { value: 'Airport', label: locale === 'uk' ? 'Аеропорт' : 'Airport' }, { value: 'Lab Travel', label: 'Lab Travel' }];
  const availableLocations = useMemo(() => locations.filter((location) => locationFilter === 'All' || location.tags.includes(locationFilter)).map((location) => getLocalizedLocation(location, locale)).sort((a, b) => a.name.localeCompare(b.name, locale)), [locale, locationFilter]);
  const locationBySlug = useMemo(() => new Map(locations.map((location) => [location.slug, getLocalizedLocation(location, locale)])), [locale]);
  const routeLocations = useMemo(() => stops.filter((stop) => stop.type === 'location' && stop.slug).map((stop) => locationBySlug.get(stop.slug as string)).filter(Boolean), [stops, locationBySlug]);
  const hasBeach = routeLocations.some((location) => location?.tags.includes('Beaches') || location?.slug === 'faja-dos-padres');
  const hasLevada = routeLocations.some((location) => location?.tags.includes('Levada walks'));
  const hasSunrise = stops.some((stop) => stop.slug === 'pico-do-arieiro' && stop.isSunrise);

  useEffect(() => {
    const slugs = stops
      .filter((stop) => stop.type === 'location' && stop.slug)
      .map((stop) => stop.slug as string)
      .filter((slug, index, allSlugs) => allSlugs.indexOf(slug) === index);
    if (slugs.length === 0) { setWeather(null); setWeatherStatus('idle'); return; }
    let cancelled = false;
    const loadWeather = async () => {
      setWeatherStatus('loading'); setWeather(null);
      try {
        const coordinates = slugs.map((slug) => locationCoordinates[slug] ?? [32.72, -16.97] as [number, number]);
        const forecasts = await Promise.all(coordinates.map(async ([latitude, longitude]) => {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&start_date=${date}&end_date=${date}`);
          if (!response.ok) throw new Error('Weather request failed');
          return response.json();
        }));
        const readings = forecasts.map((forecast) => ({ average: (forecast.daily.temperature_2m_max[0] + forecast.daily.temperature_2m_min[0]) / 2, rain: forecast.daily.precipitation_probability_max[0] ?? 0, wind: forecast.daily.wind_speed_10m_max[0] ?? 0, gusts: forecast.daily.wind_gusts_10m_max[0] ?? 0 }));
        const picoIndex = slugs.indexOf('pico-do-arieiro');
        let waterTemperature: number | null = null;
        if (hasBeach) {
          const marine = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=32.70&longitude=-17.05&hourly=sea_surface_temperature&timezone=auto&start_date=${date}&end_date=${date}`);
          if (marine.ok) { const data = await marine.json(); const values = (data.hourly.sea_surface_temperature as Array<number | null>).filter((value): value is number => value !== null); if (values.length) waterTemperature = values.reduce((sum, value) => sum + value, 0) / values.length; }
        }
        if (!cancelled) { setWeather({ averageTemperature: readings.reduce((sum, reading) => sum + reading.average, 0) / readings.length, rainProbability: Math.max(...readings.map((reading) => reading.rain)), picoTemperature: picoIndex >= 0 ? readings[picoIndex].average : null, picoWindSpeed: picoIndex >= 0 ? readings[picoIndex].wind : null, picoWindGusts: picoIndex >= 0 ? readings[picoIndex].gusts : null, waterTemperature }); setWeatherStatus('idle'); }
      } catch { if (!cancelled) setWeatherStatus('unavailable'); }
    };
    loadWeather();
    return () => { cancelled = true; };
  }, [date, stops, hasBeach]);

  const roundTravelMinutes = (minutes: number) => Math.ceil(minutes / 5) * 5;
  const routeKey = [villa, departureTime, stops.map((stop) => [stop.id, stop.type, stop.slug, stop.durationMinutes].join(':')).join('|')].join('|');

  const pointForStop = (stop: PlanStop): [number, number] | null => {
    if (stop.type === 'villa') {
      return [selectedVilla.latitude, selectedVilla.longitude];
    }

    if (stop.type === 'location' && stop.slug) {
      return locationCoordinates[stop.slug] ?? null;
    }

    return null;
  };


  useEffect(() => {
    if (!stops.length) {
      return;
    }

    let cursor = departureTime;

    const nextArrivalTimes = stops.map((stop) => {
      const arrivalTime = addMinutes(cursor, 30);
      cursor = addMinutes(arrivalTime, stop.durationMinutes);

      return arrivalTime;
    });

    setStops((current) =>
      current.map((stop, index) => ({
        ...stop,
        arrivalTime: nextArrivalTimes[index] ?? stop.arrivalTime,
      })),
    );
  }, [routeKey]);


  const calculateRoute = async () => {
    if (!stops.length || routeStatus === 'loading') {
      return;
    }

    setRouteStatus('loading');

    let previous: [number, number] | null = [
      selectedVilla.latitude,
      selectedVilla.longitude,
    ];

    let cursor = departureTime;
    const nextStops: PlanStop[] = [];

    for (const stop of stops) {
      const destination = pointForStop(stop);
      let travelMinutes = 30;

      if (previous && destination) {
        try {
          const response = await fetch('/api/route-time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              origin: {
                latitude: previous[0],
                longitude: previous[1],
              },
              destination: {
                latitude: destination[0],
                longitude: destination[1],
              },
            }),
          });

          if (response.ok) {
            const data = (await response.json()) as {
              durationMinutes: number;
            };

            travelMinutes = roundTravelMinutes(data.durationMinutes);
          }
        } catch {
          travelMinutes = 30;
        }
      }

      const arrivalTime = addMinutes(cursor, travelMinutes);

      nextStops.push({
        ...stop,
        arrivalTime,
      });

      cursor = addMinutes(arrivalTime, stop.durationMinutes);
      previous = destination;
    }

    setStops((current) =>
      current.map((stop, index) => ({
        ...stop,
        arrivalTime: nextStops[index]?.arrivalTime ?? stop.arrivalTime,
      })),
    );

    setRouteStatus('idle');
  };

  const getNextArrivalTime = () => {
    const previousStop = stops[stops.length - 1];
    return !previousStop
      ? addMinutes(departureTime, 30)
      : addMinutes(previousStop.arrivalTime, previousStop.durationMinutes + 30);
  };
  const addLocation = () => { if (!selectedSlug) return; const selectedLocation = locations.find((location) => location.slug === selectedSlug); setStops((current) => [...current, { id: `${selectedSlug}-${Date.now()}`, type: 'location', slug: selectedSlug, arrivalTime: getNextArrivalTime(), durationMinutes: selectedLocation?.tags.includes('Airport') ? 15 : standardLocationDurations[selectedSlug] ?? 90, isSunrise: false }]); setSelectedSlug(''); };
  const addRestaurant = () => setStops((current) => [...current, { id: `restaurant-${Date.now()}`, type: 'restaurant', arrivalTime: getNextArrivalTime(), durationMinutes: 90, mealType: 'lunch' }]);
  const addVillaStop = () => setStops((current) => [...current, { id: `villa-${Date.now()}`, type: 'villa', arrivalTime: getNextArrivalTime(), durationMinutes: 120 }]);
  const updateStop = (id: string, updates: Partial<PlanStop>) => setStops((current) => current.map((stop) => stop.id === id ? { ...stop, ...updates } : stop));
  const moveStop = (index: number, direction: -1 | 1) => { const targetIndex = index + direction; if (targetIndex < 0 || targetIndex >= stops.length) return; setStops((current) => { const next = [...current]; [next[index], next[targetIndex]] = [next[targetIndex], next[index]]; return next; }); };
  const removeStop = (id: string) => setStops((current) => current.filter((stop) => stop.id !== id));
  const mealLabelForTime = (time: string) => {
    const hour = Number(time.split(':')[0]);
    if (hour < 12) return text.breakfast;
    if (hour < 17) return text.lunch;
    return text.dinner;
  };

  const mealProgrammeText = (time: string) => {
    const meal = mealLabelForTime(time).toLowerCase();
    return locale === 'uk' ? `${meal} в ресторані` : `${meal} at a restaurant`;
  };

  const recommendationLines = useMemo(() => {
    const lines: string[] = [];
    const unavailable = weatherStatus === 'unavailable' ? text.weatherUnavailable : text.weatherLoading;
    if (recommendations.weather) { lines.push(`🌤️ ${text.weather}`); lines.push(weather ? (locale === 'uk' ? `Середня температура за маршрутом: близько ${Math.round(weather.averageTemperature)}°C. Ймовірність дощу: до ${Math.round(weather.rainProbability)}%. ${adviceForWeather(weather.averageTemperature, weather.rainProbability, locale)}` : `Average temperature across the route: about ${Math.round(weather.averageTemperature)}°C. Rain probability: up to ${Math.round(weather.rainProbability)}%. ${adviceForWeather(weather.averageTemperature, weather.rainProbability, locale)}`) : unavailable, ''); }
    if (recommendations.beach) { lines.push(`🏖️ ${text.beach}`); lines.push(weather?.waterTemperature !== null && weather?.waterTemperature !== undefined ? (locale === 'uk' ? `Температура води біля Мадейри: близько ${Math.round(weather.waterTemperature)}°C.` : `Sea temperature around Madeira: about ${Math.round(weather.waterTemperature)}°C.`) : unavailable); lines.push(locale === 'uk' ? 'Візьміть підстилки, повний комплект для купання, сонячні окуляри, сонцезахисний крем і головний убір.' : 'Bring beach mats, a full swim kit, sunglasses, sunscreen and a hat.', ''); }
    if (recommendations.levada) { lines.push(`🌿 ${text.levada}`); lines.push(locale === 'uk' ? 'Візьміть зручне взуття для левади з хорошим зчепленням. Якщо левала вийшла з берегів або стежка мокра, візьміть водонепроникні чохли, щоб не промокли ноги. Вода обов’язкова. Усім, хто вищий за 175 см, потрібно уважно проходити тунелі: є ризик вдаритися головою. Якщо боїтеся висоти, йдіть поруч із гідом.' : 'Wear comfortable levada shoes with good grip. If the levada has overflowed or the path is wet, take waterproof overshoes to keep your feet dry. Carry water. If you are taller than 175 cm, take care in tunnels because there is a risk of hitting your head. If you are afraid of heights, stay close to your guide.', ''); }
    if (recommendations.sunrise) { lines.push(`🌅 ${text.sunrise}`); lines.push(weather?.picoTemperature !== null && weather?.picoTemperature !== undefined ? (locale === 'uk' ? `На Pico do Areeiro: близько ${Math.round(weather.picoTemperature)}°C, вітер до ${Math.round(weather.picoWindSpeed ?? 0)} км/год, пориви до ${Math.round(weather.picoWindGusts ?? 0)} км/год.` : `At Pico do Areeiro: about ${Math.round(weather.picoTemperature)}°C, wind up to ${Math.round(weather.picoWindSpeed ?? 0)} km/h and gusts up to ${Math.round(weather.picoWindGusts ?? 0)} km/h.`) : unavailable); lines.push(locale === 'uk' ? 'Одягніть теплий шар, вітрозахисну куртку, довгі штани та закрите взуття. Перед виїздом бажано з’їсти щось легке: каву з тістечком або бутерброди. Скористайтеся туалетом перед виїздом.' : 'Wear a warm layer, windproof jacket, long trousers and closed shoes. Before leaving, have something light such as coffee and a pastry or sandwiches. Use the toilet before departure.', ''); }
    return lines;
  }, [locale, recommendations, text, weather, weatherStatus]);

  const programme = useMemo(() => {
    if (stops.length === 0) return '';
    const selectedDate = new Date(`${date}T12:00:00`); const formattedDate = new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'long' }).format(selectedDate); const ukrainianWeekdays = ['неділю', 'понеділок', 'вівторок', 'середу', 'четвер', 'п’ятницю', 'суботу']; const englishWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(selectedDate); const heading = locale === 'uk' ? `Програма на ${ukrainianWeekdays[selectedDate.getDay()]}, ${formattedDate}` : `Programme for ${englishWeekday}, ${formattedDate}`; const lines = [heading, '', `🚌 ${departureTime} — ${text.departureFrom} ${selectedVilla.name}, ${locale === 'uk' ? 'прибуття' : 'arrival'} ~${stops[0] ? stops[0].arrivalTime : addMinutes(departureTime, 30)}.`, '']; const endsAtAirport = stops[stops.length - 1]?.type === 'location' && stops[stops.length - 1]?.slug === 'madeira-international-airport';
    stops.forEach((stop) => { const endTime = addMinutes(stop.arrivalTime, stop.durationMinutes); if (stop.type === 'restaurant') { lines.push(`🍽️ ${stop.arrivalTime}–${endTime} — ${mealProgrammeText(stop.arrivalTime)}.`, ''); return; } if (stop.type === 'villa') { lines.push(`🏡 ${stop.arrivalTime}–${endTime} — ${selectedVilla.name}.`, `https://madeiralivecams.com/${locale}/stays/${selectedVilla.slug}`, ''); return; } if (stop.type === 'location' && stop.slug === 'madeira-international-airport') { const airport = locationBySlug.get(stop.slug); if (airport) lines.push(`✈️ ${stop.arrivalTime}–${endTime} — ${airport.name}.`, `https://madeiralivecams.com/${locale}/explore/${airport.slug}`, ''); return; } const location = stop.slug ? locationBySlug.get(stop.slug) : undefined; if (!location) return; const icon = location.tags.includes('Beaches') ? '🏖️' : location.tags.includes('Hiking') ? '🌿' : '📍'; const sunriseSuffix = stop.slug === 'pico-do-arieiro' && stop.isSunrise ? locale === 'uk' ? ' Зустрічаємо схід сонця + прогулянка по маршруту PR1 – Vereda do Areeiro до Miradouro da Pedra Rija.' : ' Sunrise viewing plus a walk on PR1 – Vereda do Areeiro to Miradouro da Pedra Rija.' : '';
      const cristovaoSuffix = stop.slug === 'miradouro-sao-cristovao' && (stop.hasCristovaoBar || stop.hasCristovaoRestaurant)
        ? locale === 'uk'
          ? ` + ${stop.hasCristovaoRestaurant ? `${mealProgrammeText(stop.arrivalTime)}, ` : ''}${stop.hasCristovaoBar ? 'напої та перекус у барі' : ''}`
          : ` + ${stop.hasCristovaoRestaurant ? `${mealProgrammeText(stop.arrivalTime)}, ` : ''}${stop.hasCristovaoBar ? 'drinks and snacks at the bar' : ''}`
        : '';
      lines.push(`${icon} ${stop.arrivalTime}–${endTime} — ${location.name}.${sunriseSuffix}${cristovaoSuffix}`, `https://madeiralivecams.com/${locale}/explore/${location.slug}`, ''); });
    if (endsAtAirport) lines.push(locale === 'uk' ? '😭 На цьому програма туру завершена.' : '😭 The tour programme ends here.'); else lines.push(`🏡 ${text.return} ${selectedVilla.name}.`, `https://madeiralivecams.com/${locale}/stays/${selectedVilla.slug}`);
    if (recommendationLines.length > 0) lines.push('', locale === 'uk' ? 'РЕКОМЕНДАЦІЇ НА ДЕНЬ' : 'DAY RECOMMENDATIONS', '', ...recommendationLines);
    return lines.join('\n');
  }, [date, departureTime, locale, locationBySlug, recommendationLines, selectedVilla, stops, text.departureFrom, text.return]);

  const shareProgramme = async () => {
    if (!programme) return;

    const shareNavigator = navigator as Navigator & {
      share?: (data: { title: string; text: string }) => Promise<void>;
    };

    if (shareNavigator.share) {
      try {
        await shareNavigator.share({
          title: text.title,
          text: programme,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    await navigator.clipboard.writeText(programme);
    setCopyStatus('copied');
    window.setTimeout(() => setCopyStatus('idle'), 2000);
  };

  return <Layout><Head><title>{text.title} | Madeira Live Cams</title><meta name="description" content={text.intro} /></Head><main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10"><section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8"><p className="text-sm font-semibold uppercase tracking-wider text-ocean">Madeira Live Cams</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">{text.title}</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">{text.intro}</p>
    <div className="mt-8 rounded-2xl border border-slate-200 bg-panel p-4 sm:p-5"><h2 className="text-lg font-bold text-navy">{text.dayDetails}</h2><div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">{text.date}<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" /></label><label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">{text.startVilla}<select value={villa} onChange={(event) => setVilla(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20">{villas.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">{text.departure}<input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" /></label></div></div>
    <div className="mt-6 rounded-2xl border border-slate-200 p-4 sm:p-5"><h2 className="text-lg font-bold text-navy">{text.addStop}</h2><div className="mt-4"><p className="text-sm font-semibold text-navy">{text.locationFilters}</p><div className="mt-2 flex gap-2 overflow-x-auto pb-2">{locationFilters.map((filter) => <button key={filter.value} type="button" onClick={() => { setLocationFilter(filter.value); setSelectedSlug(''); }} className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${locationFilter === filter.value ? 'border-ocean bg-ocean text-white' : 'border-slate-200 bg-white text-navy hover:border-ocean hover:text-ocean'}`}>{filter.label}</button>)}</div></div><div className="mt-3 flex flex-col gap-3 sm:flex-row"><label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold text-navy">{text.location}<select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"><option value="">{text.chooseLocation}</option>{availableLocations.map((location) => <option key={location.slug} value={location.slug}>{location.name}</option>)}</select></label><button type="button" onClick={addLocation} disabled={!selectedSlug} className="min-h-11 rounded-lg bg-ocean px-4 text-sm font-bold text-white transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-40 sm:self-end">+ {text.addLocation}</button><button type="button" onClick={addRestaurant} className="min-h-11 rounded-lg border border-ocean bg-white px-4 text-sm font-bold text-ocean transition hover:bg-ocean hover:text-white sm:self-end">+ {text.addRestaurant}</button><button type="button" onClick={addVillaStop} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-navy transition hover:border-ocean hover:text-ocean sm:self-end">+ {text.addVilla}</button></div></div>
    <section className="mt-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-navy">{text.selectedStops}</h2><button type="button" onClick={calculateRoute} disabled={stops.length === 0 || routeStatus === 'loading'} className="min-h-10 rounded-lg border border-ocean bg-white px-3 text-sm font-bold text-ocean transition hover:bg-ocean hover:text-white disabled:cursor-not-allowed disabled:opacity-50">{routeStatus === 'loading' ? (locale === 'uk' ? 'Р РѕР·СЂР°С…РѕРІСѓС”РјРѕ...' : 'Calculating...') : (locale === 'uk' ? 'Р РѕР·СЂР°С…СѓРІР°С‚Рё РјР°СЂС€СЂСѓС‚' : 'Calculate route')}</button>{routeStatus === 'loading' && <span className="text-xs font-semibold text-slate-500">{locale === 'uk' ? 'Оновлюємо час у дорозі…' : 'Updating travel times…'}</span>}{stops.length > 0 && <button type="button" onClick={() => setStops([])} className="text-sm font-semibold text-slate-500 hover:text-ocean">{text.clear}</button>}</div>{stops.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-500">{text.noStops}</p> : <div className="mt-3 space-y-3">{stops.map((stop, index) => { const location = stop.slug ? locationBySlug.get(stop.slug) : undefined; const name = stop.type === 'restaurant' ? text.restaurant : stop.type === 'villa' ? selectedVilla.name : location?.name ?? ''; const icon = stop.type === 'restaurant' ? '🍽️' : stop.type === 'villa' ? '🏡' : location?.tags.includes('Beaches') ? '🏖️' : location?.tags.includes('Hiking') ? '🌿' : '📍'; const canSelectSunrise = stop.type === 'location' && stop.slug === 'pico-do-arieiro'; return <article key={stop.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-bold text-navy">{icon} {name}</p><p className="mt-1 text-xs text-slate-500">{durationLabel(stop.durationMinutes, locale)}</p></div><button type="button" onClick={() => removeStop(stop.id)} aria-label={text.remove} className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600">×</button></div><div className="mt-4 grid grid-cols-2 gap-3"><label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">{text.arrival}<input type="time" value={stop.arrivalTime} readOnly className="min-h-10 rounded-lg border border-slate-300 bg-slate-100 px-2 text-sm text-navy" /></label><label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">{text.duration}<select value={stop.durationMinutes} onChange={(event) => updateStop(stop.id, { durationMinutes: Number(event.target.value) })} className="min-h-10 rounded-lg border border-slate-300 px-2 text-sm text-navy focus:border-ocean focus:outline-none">{durationOptions.map((minutes) => <option key={minutes} value={minutes}>{durationLabel(minutes, locale)}</option>)}</select></label></div>{canSelectSunrise && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.isSunrise)} onChange={(event) => updateStop(stop.id, { isSunrise: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean" /><span>🌅 {text.sunrise}</span></label>}
                    {stop.type === 'location' && stop.slug === 'miradouro-sao-cristovao' && <div className="mt-4 grid grid-cols-2 gap-2"><label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.hasCristovaoBar)} onChange={(event) => updateStop(stop.id, { hasCristovaoBar: event.target.checked, durationMinutes: event.target.checked || stop.hasCristovaoRestaurant ? 90 : 30 })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean" />🥤 {text.bar}</label><label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.hasCristovaoRestaurant)} onChange={(event) => updateStop(stop.id, { hasCristovaoRestaurant: event.target.checked, durationMinutes: event.target.checked || stop.hasCristovaoBar ? 90 : 30 })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean" />🍽️ {text.restaurantOption}</label></div>}<div className="mt-3 flex gap-2"><button type="button" onClick={() => moveStop(index, -1)} disabled={index === 0} className="min-h-10 flex-1 rounded-lg border border-slate-200 text-xs font-bold text-navy transition hover:border-ocean hover:text-ocean disabled:opacity-35">↑ {text.up}</button><button type="button" onClick={() => moveStop(index, 1)} disabled={index === stops.length - 1} className="min-h-10 flex-1 rounded-lg border border-slate-200 text-xs font-bold text-navy transition hover:border-ocean hover:text-ocean disabled:opacity-35">↓ {text.down}</button></div></article>; })}</div>}</section>
    {stops.length > 0 && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h2 className="text-xl font-bold text-navy">{text.recommendations}</h2><p className="mt-1 text-sm text-slate-500">{locale === 'uk' ? 'Оберіть рекомендації, які потрібно додати до готової програми.' : 'Choose recommendations to add to the ready programme.'}</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.weather} onChange={(event) => setRecommendations((current) => ({ ...current, weather: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean" />🌤️ {text.weather}</label>{hasBeach && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.beach} onChange={(event) => setRecommendations((current) => ({ ...current, beach: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean" />🏖️ {text.beach}</label>}{hasLevada && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.levada} onChange={(event) => setRecommendations((current) => ({ ...current, levada: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean" />🌿 {text.levada}</label>}{hasSunrise && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.sunrise} onChange={(event) => setRecommendations((current) => ({ ...current, sunrise: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean" />🌅 {text.sunrise}</label>}</div></section>}
    <section className="mt-8 rounded-2xl border border-slate-200 bg-panel p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-navy">{text.output}</h2><button type="button" onClick={shareProgramme} disabled={!programme} className="min-h-10 rounded-lg bg-ocean px-4 text-sm font-bold text-white transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-40">{copyStatus === 'copied' ? `✓ ${text.copied}` : `↗ ${text.share}`}</button></div><textarea readOnly value={programme || text.defaultProgram} className="mt-4 min-h-[260px] w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm leading-6 text-slate-700 focus:outline-none" /></section>
  </section></main></Layout>;
}
