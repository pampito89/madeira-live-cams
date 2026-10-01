export type WeatherHour = { cloud: number; rain: number; code: number; day: boolean };
export type TrailForecast = { point: { name: string; latitude: number; longitude: number; source: string }; fetchedAt: string; hours: Record<string, WeatherHour> };
export function slotWeather(forecast: TrailForecast | undefined, date: string, time: string) {
  return forecast?.hours[`${date}T${time.slice(0, 2)}:00`];
}
export function weatherIcon(hour: WeatherHour) {
  if (hour.code >= 95) return '⛈️';
  if ([71,73,75,77,85,86].includes(hour.code)) return '🌨️';
  if (hour.rain > 0) return '🌧️';
  if ([45,48].includes(hour.code)) return '🌫️';
  return hour.cloud >= 80 ? '☁️' : hour.cloud >= 20 ? (hour.day ? '🌤️' : '☁️') : hour.day ? '☀️' : '🌙';
}
export function normalizeHourly(hourly: { time: string[]; cloud_cover: (number | null)[]; precipitation: (number | null)[]; weather_code: (number | null)[]; is_day: (number | null)[] }) {
  const hours: Record<string, WeatherHour> = {};
  hourly.time.forEach((time, i) => {
    const cloud = hourly.cloud_cover[i], rain = hourly.precipitation[i + 1], code = hourly.weather_code[i], day = hourly.is_day[i];
    // Open-Meteo precipitation is accumulated over the preceding hour: use the next timestamp for the starting hour.
    if (typeof cloud !== 'number' || !Number.isFinite(cloud) || cloud < 0 || cloud > 100 || typeof rain !== 'number' || !Number.isFinite(rain) || rain < 0 || typeof code !== 'number' || !Number.isFinite(code) || (day !== 0 && day !== 1)) return;
    hours[time] = { cloud, rain, code, day: day === 1 };
  });
  return hours;
}
