export const municipalities = ['Calheta', 'Câmara de Lobos', 'Funchal', 'Machico', 'Ponta do Sol', 'Porto Moniz', 'Porto Santo', 'Ribeira Brava', 'Santa Cruz', 'Santana', 'São Vicente'] as const;
export const categories = ['Festivals', 'Music', 'Nightlife', 'Sport', 'Food', 'Culture', 'Talks'] as const;
export type IslandEvent = {
  id: string; title: string; description: string; start: string; end: string;
  municipalities: string[]; category: typeof categories[number]; venue: string;
  source: string; sourceUrl: string; checkedAt: string; ticketUrl?: string;
  image?: { src: string; alt: string; credit: string; permission: string };
};
// Original editorial summaries. Dates are inclusive, in Atlantic/Madeira.
export const events: IslandEvent[] = [
  { id: 'legend-2026', title: 'Madeira Legend Rally', description: 'Historic rally cars return to Madeira. Read the organiser’s programme and road closures before choosing a viewing location.', start: '2026-10-22', end: '2026-10-24', municipalities: ['Funchal', 'Ribeira Brava', 'Santa Cruz'], category: 'Sport', venue: 'Funchal and island rally stages', source: 'Rally Madeira Legend', sourceUrl: 'https://rallymadeiralegend.pt/', checkedAt: '2026-10-23' },
  { id: 'chestnut-2026', title: 'Curral das Freiras Chestnut Festival', description: 'An autumn celebration of local chestnuts, regional food and village traditions in Curral das Freiras.', start: '2026-10-31', end: '2026-11-01', municipalities: ['Câmara de Lobos'], category: 'Food', venue: 'Curral das Freiras', source: 'Visit Portugal', sourceUrl: 'https://www.visitportugal.com/en/node/522359', checkedAt: '2026-10-23' },
  { id: 'katz-2026', title: 'Misha Katz & Dmitry Demyashkin | OCM', description: 'The Madeira Classical Orchestra presents music by Beethoven and Mozart. Check the programme for performance time and admission.', start: '2026-11-07', end: '2026-11-07', municipalities: ['Funchal'], category: 'Music', venue: 'Madeira Congress Centre', source: 'Events Madeira', sourceUrl: 'https://eventsmadeira.com/en/event-listing/', checkedAt: '2026-10-23' },
  { id: 'mtb-2026', title: 'Mountain Bike Madeira Meeting', description: 'A mountain-biking gathering based in Porto Moniz. See the organiser’s programme for individual activities and registration.', start: '2026-11-08', end: '2026-11-15', municipalities: ['Porto Moniz'], category: 'Sport', venue: 'Porto Moniz', source: 'Events Madeira', sourceUrl: 'https://eventsmadeira.com/en/event-listing/', checkedAt: '2026-10-23' },
  { id: 'porto-santo-rally-2026', title: 'Rali de Porto Santo', description: 'Rally dates listed in the AMAK motorsport calendar. Follow the organiser for the route, programme and spectator information.', start: '2026-11-06', end: '2026-11-07', municipalities: ['Porto Santo'], category: 'Sport', venue: 'Porto Santo', source: 'AMAK', sourceUrl: 'https://amak.pt/proximos-eventos/', checkedAt: '2026-10-23' },
  { id: 'paul-mar-2026', title: 'Rampa Regional do Paul do Mar', description: 'A regional motorsport event in Paul do Mar. Consult the organiser for the final schedule and access arrangements.', start: '2026-11-13', end: '2026-11-14', municipalities: ['Calheta'], category: 'Sport', venue: 'Paul do Mar', source: 'AMAK', sourceUrl: 'https://amak.pt/proximos-eventos/', checkedAt: '2026-10-23' },
  { id: 'christmas-2026', title: 'Funchal Christmas Market', description: 'Seasonal stalls with regional crafts and Madeiran food. Individual opening hours and activities are available from the official agenda.', start: '2026-12-01', end: '2027-01-10', municipalities: ['Funchal'], category: 'Festivals', venue: 'Funchal', source: 'Events Madeira', sourceUrl: 'https://eventsmadeira.com/en/event-listing/', checkedAt: '2026-10-23' },
];
export const eventSources = [
  { name: 'Events Madeira', url: 'https://eventsmadeira.com/en/event-listing/', description: 'Official regional events agenda' },
  { name: 'Visit Madeira', url: 'https://visitmadeira.com/pt/a-acontecer/eventos', description: 'Tourism calendar and major festivals' },
  { name: 'Câmara de Lobos agenda', url: 'https://agenda.cm-camaradelobos.pt', description: 'Municipal cultural programme' },
  { name: 'AMAK', url: 'https://amak.pt/proximos-eventos/', description: 'Rallies and motorsport calendar' },
  { name: 'BOL', url: 'https://event.bol.pt/', description: 'Ticket search — confirm the venue is in Madeira' },
  { name: 'Lyven', url: 'https://lyven.pt/', description: 'Madeira listings and ticket links' },
  { name: 'The Purple Fridays', url: 'https://www.instagram.com/thepurplefridays/', description: 'Party announcements from the organiser' },
];
