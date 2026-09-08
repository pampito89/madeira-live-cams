import { useEffect, useState } from 'react';

type Point = { name: string; latitude: number; longitude: number };
type Resolution = { input: string; point: Point | null; error: string };

export function useCustomDayPoint(input: string, active: boolean) {
  const [result, setResult] = useState<Resolution | null>(null);
  const [attempt, setAttempt] = useState(0);
  const value = input.trim();

  useEffect(() => {
    if (!active || !value) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/resolve-route-point', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: value }),
          signal: controller.signal,
        });
        const data = await response.json() as Partial<Point> & { error?: string };
        if (!response.ok || !data.name || typeof data.latitude !== 'number' || typeof data.longitude !== 'number'
          || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)
          || Math.abs(data.latitude) > 90 || Math.abs(data.longitude) > 180) {
          throw new Error(data.error || 'Unable to resolve the Google Maps link.');
        }
        if (!controller.signal.aborted) setResult({ input: value, point: data as Point, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ input: value, point: null, error: error instanceof Error ? error.message : 'Unable to resolve the Google Maps link.' });
      }
    }, 500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value, active, attempt]);

  // An edited input must never use the previous place while its lookup is pending.
  const current = active && value && result?.input === value ? result : null;
  const point = current?.point ?? null;
  return {
    point,
    coordinates: point ? [point.latitude, point.longitude] as [number, number] : null,
    loading: Boolean(active && value && !current),
    error: current?.error ?? '',
    retry: () => { setResult(null); setAttempt((previous) => previous + 1); },
  };
}

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  locale: 'en' | 'uk';
  resolution: ReturnType<typeof useCustomDayPoint>;
};

export default function CustomDayPoint({ id, value, onChange, locale, resolution }: Props) {
  const [clipboardError, setClipboardError] = useState(false);
  const ukrainian = locale === 'uk';
  return <div className="mt-4">
    <label htmlFor={id} className="text-sm font-semibold text-navy">{ukrainian ? 'Посилання Google Maps або координати' : 'Google Maps link or coordinates'}</label>
    <div className="relative mt-1.5">
      <input id={id} value={value} onChange={(event) => { setClipboardError(false); onChange(event.target.value); }}
        placeholder="https://maps.app.goo.gl/..." autoComplete="off" spellCheck={false}
        aria-invalid={Boolean(resolution.error)} aria-describedby={`${id}-status`}
        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-11 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
      <button type="button" onClick={async () => {
        try { onChange(await navigator.clipboard.readText()); setClipboardError(false); }
        catch { setClipboardError(true); }
      }} aria-label={ukrainian ? 'Вставити' : 'Paste'} title={ukrainian ? 'Вставити' : 'Paste'}
        className="absolute inset-y-1 right-1 flex w-9 items-center justify-center rounded-md text-base text-ocean hover:bg-ocean/10">📋</button>
    </div>
    <p id={`${id}-status`} role="status" className={`mt-2 break-words text-xs ${resolution.error ? 'text-red-600' : 'text-slate-500'}`}>
      {resolution.loading ? (ukrainian ? 'Перевіряємо точку…' : 'Looking up the point…')
        : resolution.error ? resolution.error
        : resolution.point ? `${ukrainian ? 'Точку знайдено' : 'Point found'}: ${resolution.point.name} (${resolution.point.latitude}, ${resolution.point.longitude})`
        : (ukrainian ? 'Вставте коротке або повне посилання Google Maps чи координати — точку буде визначено автоматично.' : 'Paste a short or full Google Maps link or coordinates — the point will be found automatically.')}
    </p>
    {resolution.error && <button type="button" onClick={resolution.retry} className="mt-1 min-h-11 text-sm font-semibold text-ocean">{ukrainian ? 'Спробувати ще раз' : 'Try again'}</button>}
    {clipboardError && <p role="status" className="mt-2 text-xs text-red-600">{ukrainian ? 'Не вдалося прочитати буфер обміну. Вставте посилання вручну в поле.' : 'Clipboard unavailable. Paste the link into the field manually.'}</p>}
  </div>;
}
