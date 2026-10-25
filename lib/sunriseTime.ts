import type { Locale } from './i18n/config';

export const MADEIRA_TIME_ZONE = 'Atlantic/Madeira';

export function madeiraDate(time: Date): string {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: MADEIRA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(time);
    const part = (type: string) => parts.find(value => value.type === type)!.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
}

export function formatSunrise(time: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, { timeZone: MADEIRA_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(time));
}

// Compare local noon on consecutive dates, independently of the viewer's zone.
export function clockChange(date: string): 'forward' | 'back' | null {
    const noon = new Date(`${date}T12:00:00Z`);
    const previous = new Date(noon.getTime() - 86400000);
    const hour = (time: Date) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: MADEIRA_TIME_ZONE, hour: '2-digit', hourCycle: 'h23' }).format(time));
    const change = hour(noon) - hour(previous);
    return change > 0 ? 'forward' : change < 0 ? 'back' : null;
}

export const clockMessages: Record<Locale, { forward: string; back: string }> = {
    en: { forward: 'Clocks go forward 1 hour in Madeira. Sunrise is shown in summer time.', back: 'Clocks go back 1 hour in Madeira. Sunrise is shown in winter time.' },
    uk: { forward: 'На Мадейрі годинник переводять на 1 годину вперед. Схід сонця вказано за літнім часом.', back: 'На Мадейрі годинник переводять на 1 годину назад. Схід сонця вказано за зимовим часом.' },
    pt: { forward: 'Na Madeira, o relógio avança 1 hora. O nascer do sol é indicado na hora de verão.', back: 'Na Madeira, o relógio atrasa 1 hora. O nascer do sol é indicado na hora de inverno.' },
    de: { forward: 'Auf Madeira wird die Uhr 1 Stunde vorgestellt. Sonnenaufgang in Sommerzeit.', back: 'Auf Madeira wird die Uhr 1 Stunde zurückgestellt. Sonnenaufgang in Winterzeit.' },
    fr: { forward: 'À Madère, les horloges avancent de 1 heure. Lever du soleil à l’heure d’été.', back: 'À Madère, les horloges reculent de 1 heure. Lever du soleil à l’heure d’hiver.' },
    es: { forward: 'En Madeira, el reloj se adelanta 1 hora. Amanecer en horario de verano.', back: 'En Madeira, el reloj se atrasa 1 hora. Amanecer en horario de invierno.' },
    pl: { forward: 'Na Maderze zegary przesuwa się o 1 godzinę do przodu. Wschód słońca w czasie letnim.', back: 'Na Maderze zegary przesuwa się o 1 godzinę do tyłu. Wschód słońca w czasie zimowym.' },
};

export function windyCloudUrl(sunrise: string): string {
    const time = new Date(sunrise);
    time.setUTCHours(Math.floor(time.getUTCHours() / 3) * 3, 0, 0, 0);
    const stamp = time.toISOString().slice(0, 13).replace('T', '-');
    return `https://www.windy.com/?lclouds,${stamp},32.7352,-16.9280,11,d:picker`;
}

export type SunriseDay = {
    date: string;
    sunrise: string;
    lowClouds: number;
    midClouds: number;
    highClouds: number;
    rainChance: number;
    windSpeed: number;
    windDirection: number;
};

type ForecastResponse = {
    daily: { time: string[]; sunrise: string[] };
    hourly: { time: string[] } & Record<string, (string | number | null)[]>;
};

// Request GMT ISO values from Open-Meteo and mark them explicitly as UTC.
// Never apply one response-wide utc_offset_seconds to a week spanning DST.
export function sunriseDays(data: ForecastResponse, now = new Date()): SunriseDay[] {
    const today = madeiraDate(now);
    return data.daily.sunrise.map((value, index) => {
        const sunrise = `${value}Z`;
        const date = madeiraDate(new Date(sunrise));
        const hour = value.slice(0, 13) + ':00';
        const sample = data.hourly.time.indexOf(hour);
        if (sample < 0) throw new Error('Missing sunrise weather data');
        const read = (key: string) => {
            const value = data.hourly[key]?.[sample];
            if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Missing sunrise weather data');
            return Math.round(value);
        };
        return { date, sunrise, lowClouds: read('cloud_cover_low'), midClouds: read('cloud_cover_mid'), highClouds: read('cloud_cover_high'), rainChance: read('precipitation_probability'), windSpeed: read('wind_speed_10m'), windDirection: read('wind_direction_10m') };
    }).filter(day => day.date > today).slice(0, 7);
}
