export type RoutePoint = [number, number];
type Stop = { durationMinutes: number; arrivalTime: string };
type Usage = { limit: number; used: number; remaining: number; month: string };

export function validRoutePoint(point: RoutePoint | null): point is RoutePoint {
  return !!point && Number.isFinite(point[0]) && Math.abs(point[0]) <= 90
    && Number.isFinite(point[1]) && Math.abs(point[1]) <= 180;
}

export function addRouteMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(':').map(Number);
  const total = (hours * 60 + mins + minutes) % 1440;
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}

export async function resolvePlannerLocation(
  location: { slug: string; mapQuery: string },
  known: Record<string, RoutePoint>,
  cache: Map<string, RoutePoint>,
  request: typeof fetch = fetch,
): Promise<RoutePoint> {
  const direct = location.mapQuery.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  const point: RoutePoint | null = direct ? [Number(direct[1]), Number(direct[2])]
    : known[location.slug] ?? cache.get(location.slug) ?? null;
  if (validRoutePoint(point)) return point;
  const response = await request('/api/resolve-route-point', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: location.mapQuery }), signal: AbortSignal.timeout(25000),
  });
  const data = await response.json();
  const resolved: RoutePoint = [data.latitude, data.longitude];
  if (!response.ok || !validRoutePoint(resolved)) throw new Error('point');
  cache.set(location.slug, resolved);
  return resolved;
}

// Calculate the whole journey before applying any times, including the final leg.
// A failed request must never be represented as a successful 30-minute journey.
export async function calculatePlannerRoute<T extends Stop>(options: {
  start: RoutePoint;
  end: RoutePoint;
  departure: string;
  stops: T[];
  pointForStop: (stop: T) => Promise<RoutePoint>;
  onUsage?: (usage: Usage) => void;
  request?: typeof fetch;
}) {
  const { start, end, departure, stops, pointForStop, onUsage, request = fetch } = options;
  const points = [start];
  for (const stop of stops) points.push(await pointForStop(stop));
  points.push(end);
  if (!points.every(validRoutePoint)) throw new Error('point');
  let cursor = departure;
  const nextStops: T[] = [];
  const travelMinutes: number[] = [];
  for (let index = 1; index < points.length; index++) {
    const origin = points[index - 1], destination = points[index];
    let minutes = 0;
    if (origin[0] !== destination[0] || origin[1] !== destination[1]) {
      const response = await request('/api/route-time', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { latitude: origin[0], longitude: origin[1] },
          destination: { latitude: destination[0], longitude: destination[1] },
        }), signal: AbortSignal.timeout(25000),
      });
      const data = await response.json();
      if (data.usage) onUsage?.(data.usage);
      if (response.status === 429) throw new Error('limit');
      if (!response.ok || typeof data.durationMinutes !== 'number'
        || !Number.isFinite(data.durationMinutes) || data.durationMinutes < 0) throw new Error('route');
      minutes = Math.ceil(data.durationMinutes / 5) * 5;
    }
    travelMinutes.push(minutes);
    cursor = addRouteMinutes(cursor, minutes);
    const stop = stops[index - 1];
    if (stop) {
      nextStops.push({ ...stop, arrivalTime: cursor });
      cursor = addRouteMinutes(cursor, stop.durationMinutes);
    }
  }
  return { stops: nextStops, returnTravelMinutes: travelMinutes[travelMinutes.length - 1], arrival: cursor };
}
