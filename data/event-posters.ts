import type { IslandEvent } from './events';
// Approved artwork only. Key: stable imported event ID; permission: written licence/reference.
// Example: 'amak:123': { src: '/images/events/approved-poster.jpg', alt: 'Event poster', credit: 'Organiser', permission: 'Written permission reference' }
export const eventPosters: Record<string, NonNullable<IslandEvent['image']>> = {};
