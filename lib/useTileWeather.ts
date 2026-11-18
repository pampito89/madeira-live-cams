import { useEffect, useRef, useState } from 'react';
import { locationCoordinates } from './locationWeather';

export type TileWeather = { temperature: number; weatherCode: number; windSpeed: number; windDirection: number; time: string };

// Only request weather near the viewport, with bounded concurrency and incremental rendering.
export function useTileWeather(slugs: string[]) {
  const [weather, setWeather] = useState<Record<string, TileWeather | null>>({});
  const cache = useRef<Record<string, TileWeather | null>>({});
  const key = slugs.join('|');
  useEffect(() => {
    const controller = new AbortController();
    const queued = new Set<string>();
    const queue: string[] = [];
    let active = 0;
    const pump = () => {
      while (!controller.signal.aborted && active < 4 && queue.length) {
        const slug = queue.shift()!;
        const coordinates = locationCoordinates[slug];
        active++;
        void (async () => {
          const timeout = new AbortController();
          const cancel = () => timeout.abort();
          controller.signal.addEventListener('abort', cancel);
          const timer = window.setTimeout(cancel, 8000);
          let result: TileWeather | null = null;
          try {
            const params = new URLSearchParams({
              latitude: String(coordinates.latitude), longitude: String(coordinates.longitude),
              current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m',
              wind_speed_unit: 'kmh', timezone: 'Europe/Lisbon',
            });
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: timeout.signal });
            if (!response.ok) throw new Error('Weather unavailable');
            const { current } = await response.json();
            if (current && [current.temperature_2m, current.weather_code, current.wind_speed_10m, current.wind_direction_10m].every(Number.isFinite)) {
              result = { temperature: Math.round(current.temperature_2m), weatherCode: current.weather_code,
                windSpeed: Math.round(current.wind_speed_10m), windDirection: current.wind_direction_10m, time: current.time };
            }
          } catch { /* An unavailable forecast must not hold up the cards. */ }
          finally {
            window.clearTimeout(timer);
            controller.signal.removeEventListener('abort', cancel);
            active--;
            if (!controller.signal.aborted) {
              cache.current[slug] = result;
              setWeather(previous => ({ ...previous, [slug]: result }));
              pump();
            }
          }
        })();
      }
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const slug = (entry.target as HTMLElement).dataset.weatherSlug!;
        observer.unobserve(entry.target);
        if (!locationCoordinates[slug] || queued.has(slug) || slug in cache.current) continue;
        queued.add(slug);
        queue.push(slug);
      }
      pump();
    }, { rootMargin: '300px' });
    document.querySelectorAll('[data-weather-slug]').forEach(element => observer.observe(element));
    return () => { observer.disconnect(); controller.abort(); };
  }, [key]);
  return weather;
}
