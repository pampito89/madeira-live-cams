import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;
const directory = process.env.VERCEL ? path.join(os.tmpdir(), 'madeira-events-v2') : path.join(process.cwd(), 'backups', 'events-cache-v2');
const keyFor = (key: string) => `events:v2:${createHash('sha256').update(key).digest('hex')}`;
export async function readCache<T>(key: string): Promise<T | null> {
  try { if (redis) return await redis.get<T>(keyFor(key)); return JSON.parse(await fs.readFile(path.join(directory, `${keyFor(key).split(':').pop()}.json`), 'utf8')); } catch { return null; }
}
export async function writeCache(key: string, value: unknown) {
  try {
    if (redis) { await redis.set(keyFor(key), value, { ex: 60 * 60 * 24 * 90 }); return; }
    await fs.mkdir(directory, { recursive: true });
    const file = path.join(directory, `${keyFor(key).split(':').pop()}.json`);
    const temporary = `${file}.${randomUUID()}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(value), 'utf8'); await fs.rename(temporary, file);
  } catch { /* Cache failures must not hide a successfully fetched public feed. */ }
}
let budgetQueue: Promise<unknown> = Promise.resolve();
export function reserveTranslation(characters: number): Promise<boolean> {
  const run = async () => {
    const day = new Date().toISOString().slice(0, 10); const key = `translation-budget:${day}`;
    if (redis) {
      const count = await redis.eval("local n=tonumber(redis.call('get',KEYS[1]) or '0'); if n+tonumber(ARGV[1])>4800 then return 0 end; redis.call('incrby',KEYS[1],ARGV[1]); redis.call('expire',KEYS[1],172800); return 1", [keyFor(key)], [characters]);
      return Number(count) === 1;
    }
    // A serverless /tmp directory cannot enforce an account-wide daily quota.
    if (process.env.VERCEL) return false;
    const used = (await readCache<number>(key)) || 0;
    if (used + characters > 4800) return false;
    await fs.mkdir(directory, { recursive: true });
    const file = path.join(directory, `${keyFor(key).split(':').pop()}.json`);
    await fs.writeFile(file, JSON.stringify(used + characters), 'utf8');
    return true;
  };
  const result = budgetQueue.then(run, run).catch(() => false);
  budgetQueue = result; return result;
}
