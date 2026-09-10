import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getLocationBySlug } from "../data/plannerLocations";
import { plannerStopDuration } from "./plannerStopDuration";
type Stop = {
    id: string;
    type: 'location' | 'custom' | 'villa';
    slug?: string;
    arrivalTime: string;
    durationMinutes: number;
};
type Draft = {
    stops: Stop[];
    departureTime: string;
};
const storageKey = 'madeira-trip-plan-v1';
const validTime = (value: unknown): value is string => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
function nextArrival(draft: Draft) {
    const previous = draft.stops[draft.stops.length - 1];
    const time = previous?.arrivalTime ?? draft.departureTime;
    const [hours, minutes] = time.split(':').map(Number);
    const total = (hours * 60 + minutes + (previous?.durationMinutes ?? 0) + 30) % 1440;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}
// Session-only storage keeps a draft while visiting cards; no draft is sent to a server.
export function usePlannerDraft<T extends Draft>(draft: T, apply: (draft: Partial<T>) => void) {
    const router = useRouter();
    const booted = useRef(false);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (!router.isReady || booted.current)
            return;
        booted.current = true;
        let restored: T = { ...draft };
        try {
            const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
            if (saved?.version === 1 && saved.draft && typeof saved.draft === 'object') {
                for (const key of Object.keys(draft) as (keyof T)[]) {
                    const value = saved.draft[key];
                    if (key === 'stops') {
                        if (Array.isArray(value) && value.length <= 100 && value.every((stop: Stop) => stop && typeof stop.id === 'string' && ['location', 'custom', 'villa'].includes(stop.type)
                            && validTime(stop.arrivalTime) && Number.isFinite(stop.durationMinutes)
                            && stop.durationMinutes >= 0 && stop.durationMinutes <= 1440))
                            restored[key] = value as T[typeof key];
                    }
                    else if (key === 'departureTime') {
                        if (validTime(value))
                            restored[key] = value as T[typeof key];
                    }
                    else if (key === 'customStartForRoute' || key === 'customEndForRoute') {
                        if (value === null || value && typeof value.name === 'string'
                            && Number.isFinite(value.latitude) && Math.abs(value.latitude) <= 90
                            && Number.isFinite(value.longitude) && Math.abs(value.longitude) <= 180)
                            restored[key] = value;
                    }
                    else if (key === 'recommendations') {
                        if (value && ['weather', 'beach', 'levada', 'sunrise', 'food'].every(option => typeof value[option] === 'boolean'))
                            restored[key] = value;
                    }
                    else if (typeof value === typeof draft[key] && value !== undefined) {
                        restored[key] = value;
                    }
                }
            }
        }
        catch { /* A disabled or corrupted store must not prevent planning. */ }
        const requested = typeof router.query.addLocation === "string" ? getLocationBySlug(router.query.addLocation) : typeof router.query.addRestaurant === "string" ? getLocationBySlug(router.query.addRestaurant) : undefined;
        if (requested)
            restored = { ...restored, stops: [...restored.stops, {
                        id: `${requested.slug}-${Date.now()}`, type: 'location', slug: requested.slug,
                        arrivalTime: nextArrival(restored),
                        durationMinutes: plannerStopDuration(requested),
                    }] };
        apply(restored);
        setReady(true);
        if ("addLocation" in router.query || "addRestaurant" in router.query) {
            const query = { ...router.query };
            delete query.addLocation;
            delete query.addRestaurant;
            void router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
        }
    }, [router.isReady, router.query, router.pathname, router, draft, apply]);
    useEffect(() => {
        if (!ready)
            return;
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, draft }));
        }
        catch { /* Planning works when browser storage is unavailable. */ }
    }, [ready, draft]);
    return ready;
}
