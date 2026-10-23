import type { IslandEvent } from '../../data/events';
import type { Locale } from '../i18n/config';
export type ImportedEvent = IslandEvent & {
  sourceId: 'eventsmadeira' | 'amak'; sourceLanguage: 'en' | 'pt';
  fetchedAt: string; originalTitle: string; translation: 'source' | 'machine' | 'original';
};
export type SourceState = { id: string; name: string; url: string; status: 'fresh' | 'stale' | 'unavailable'; fetchedAt: string | null; count: number };
export type EventFeed = { events: ImportedEvent[]; sources: SourceState[]; today: string; locale: Locale; generatedAt: string };
export type SourceSnapshot = { version: 1; events: ImportedEvent[]; fetchedAt: string; retryAfter: number };
