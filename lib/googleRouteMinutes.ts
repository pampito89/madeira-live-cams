export type Coordinates = { latitude: number; longitude: number };
export class RouteServiceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// One warm server instance only; no disk storage of travellers' coordinates.
const durations = new Map<string, { minutes: number; expires: number }>();
const inFlight = new Map<string, Promise<number>>();

export async function googleRouteMinutes(
  origin: Coordinates,
  destination: Coordinates,
  apiKey: string,
  reserve: () => Promise<void>,
  request: typeof fetch = fetch,
  pause: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
  now: () => number = Date.now,
): Promise<number> {
  const key = JSON.stringify([origin.latitude, origin.longitude, destination.latitude, destination.longitude]);
  const cached = durations.get(key);
  if (cached && cached.expires > now()) return cached.minutes;
  durations.delete(key);
  const pending = inFlight.get(key);
  if (pending) return pending;

  const calculate = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt) await pause(500 * attempt);
      // Reserve every outbound attempt, including retries. Never bypass the cap.
      await reserve();
      try {
        const response = await request('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST', signal: AbortSignal.timeout(5000),
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'routes.duration' },
          body: JSON.stringify({ origin: { location: { latLng: origin } }, destination: { location: { latLng: destination } }, travelMode: 'DRIVE', routingPreference: 'TRAFFIC_UNAWARE', units: 'METRIC' }),
        });
        if (!response.ok) {
          const temporary = [500, 502, 503, 504].includes(response.status);
          await response.body?.cancel();
          if (temporary && attempt < 2) continue;
          throw new RouteServiceError(temporary ? 503 : 502, temporary
            ? 'Google Routes is temporarily unavailable. Please try again.'
            : 'Google Routes API could not calculate this journey.');
        }
        const data = await response.json();
        const duration = data.routes?.[0]?.duration;
        if (typeof duration !== 'string' || !/^\d+(?:\.\d+)?s$/.test(duration)) {
          throw new RouteServiceError(502, 'Google Routes API returned no route duration.');
        }
        const seconds = Number(duration.slice(0, -1));
        if (!Number.isFinite(seconds)) throw new RouteServiceError(502, 'Invalid route duration.');
        const minutes = Math.max(1, Math.round(seconds / 60));
        if (durations.size >= 500) durations.delete(durations.keys().next().value!);
        durations.set(key, { minutes, expires: now() + 10 * 60 * 1000 });
        return minutes;
      } catch (error) {
        if (error instanceof RouteServiceError) throw error;
        const temporary = error instanceof Error && ['TimeoutError', 'AbortError', 'TypeError'].includes(error.name);
        if (temporary && attempt < 2) continue;
        throw new RouteServiceError(503, 'Unable to calculate route time. Please try again.');
      }
    }
    throw new RouteServiceError(503, 'Google Routes is temporarily unavailable.');
  };
  const task = calculate();
  inFlight.set(key, task);
  try { return await task; } finally { inFlight.delete(key); }
}
