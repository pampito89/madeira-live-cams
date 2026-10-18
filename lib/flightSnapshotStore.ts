import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';
import type { FlightSnapshot } from './aviationstack';

export type FlightStoreState = { calls: number[]; retryAt: number; snapshot?: FlightSnapshot };
export const FLIGHT_BUDGET = 80;
export const BUDGET_WINDOW = 32 * 24 * 60 * 60_000;
export const SNAPSHOT_TTL = 48 * 60 * 60_000;
export function reserveFlightCall(state: FlightStoreState, now: number) {
  state.calls = state.calls.filter(stamp => stamp >= now - BUDGET_WINDOW);
  if (state.calls.length >= FLIGHT_BUDGET) throw new Error('Flight budget exhausted');
  state.calls.push(now);
}
function validate(value: unknown): FlightStoreState {
  const state = value as FlightStoreState;
  if (!state || !Array.isArray(state.calls) || state.calls.some(v => !Number.isFinite(v)) || !Number.isFinite(state.retryAt)) throw new Error('Invalid flight store');
  return state;
}
export async function withFlightStore<T>(apiKey: string, run: (state: FlightStoreState, save: () => Promise<void>) => Promise<T>): Promise<T> {
  const id = createHash('sha256').update(apiKey).digest('hex').slice(0, 24);
  const key = `fnc:aviationstack:v1:${id}`;
  const initial = (): FlightStoreState => ({ calls: [], retryAt: 0 });
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = Redis.fromEnv();
    const token = randomUUID();
    if (!await redis.set(`${key}:lock`, token, { nx: true, ex: 120 })) throw new Error('Flight request busy');
    try {
      const stored = await redis.get<FlightStoreState>(key);
      const state = stored === null ? initial() : validate(stored);
      return await run(state, async () => { await redis.set(key, state); });
    } finally {
      await redis.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", [`${key}:lock`], [token]);
    }
  }
  // Serverless disks cannot enforce a shared budget. Fail closed until Redis is configured.
  if (process.env.VERCEL) throw new Error('Shared flight storage required');
  const directory = path.join(process.cwd(), 'backups', 'airport-flight-cache');
  await fs.mkdir(directory, { recursive: true });
  const file = path.join(directory, `${id}.json`);
  const lock = path.join(directory, `${id}.lock`);
  try { const stat = await fs.stat(lock); if (Date.now() - stat.mtimeMs > 120_000) await fs.unlink(lock); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const handle = await fs.open(lock, 'wx');
  try {
    let state = initial();
    try { state = validate(JSON.parse(await fs.readFile(file, 'utf8'))); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    return await run(state, async () => {
      const temp = `${file}.tmp`;
      await fs.writeFile(temp, JSON.stringify(state), 'utf8');
      await fs.rename(temp, file);
    });
  } finally { await handle.close(); await fs.unlink(lock); }
}
