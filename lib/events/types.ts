import type { IslandEvent } from '../../data/events';
import type { Locale } from '../i18n/config';
export type EventSourceId = 'eventsmadeira' | 'amak' | 'eventbrite-parties' | 'eventbrite-music' | 'eventbrite-funchal' | 'eventbrite-madeira' | 'eventbrite-porto-santo';
export type ImportedEvent = IslandEvent & {
  sourceId: EventSourceId; sourceLanguage: 'en' | 'pt' | 'es';
  fetchedAt: string; originalTitle: string; translation: 'source' | 'machine' | 'original' | 'catalog';
};
export type SourceState = { id: string; name: string; url: string; status: 'fresh' | 'stale' | 'unavailable'; fetchedAt: string | null; count: number };
export type EventFeed = { events: ImportedEvent[]; sources: SourceState[]; today: string; locale: Locale; generatedAt: string };
export type SourceSnapshot = { version: 1; events: ImportedEvent[]; fetchedAt: string; retryAfter: number };
