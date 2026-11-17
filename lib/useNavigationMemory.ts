import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/router';

const prefix = 'madeira-navigation-v1:';
const memory = new Map<string, unknown>();
function read(key: string): unknown {
    try { return JSON.parse(sessionStorage.getItem(prefix + key) || 'null') ?? memory.get(key); }
    catch { return memory.get(key); }
}
function write(key: string, value: unknown) {
    memory.set(key, value);
    try { sessionStorage.setItem(prefix + key, JSON.stringify(value)); } catch { /* Storage is optional. */ }
}
function sameShape(value: unknown, sample: unknown): boolean {
    if (sample === null) return value === null;
    if (typeof sample !== 'object') return typeof value === typeof sample;
    return !!value && typeof value === 'object' && !Array.isArray(value)
        && Object.entries(sample).every(([key, item]) => sameShape((value as Record<string, unknown>)[key], item));
}
// Only opt-in public filters are persisted, never arbitrary forms or private data.
export function useNavigationState<T>(name: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState(initial);
    const ready = useRef(false);
    useEffect(() => {
        const saved = read('filter:' + name);
        if (sameShape(saved, initial)) setValue(saved as T);
        ready.current = true;
    }, [name]);
    const update: Dispatch<SetStateAction<T>> = next => {
        setValue(previous => {
            const resolved = typeof next === 'function' ? (next as (previous: T) => T)(previous) : next;
            if (ready.current) write('filter:' + name, resolved);
            return resolved;
        });
    };
    return [value, update];
}
function pageKey() { return location.pathname + location.search.replace(/([?&])(restore|restoreCameraFilter)=1(&|$)/g, '$1').replace(/[?&]$/, ''); }
function entryKey() { return 'entry:' + (history.state?.key || pageKey()); }
let saveCurrent = () => {};
export function rememberNavigationPosition() { saveCurrent(); }

export function useNavigationMemory() {
    const router = useRouter();
    useEffect(() => {
        let key = entryKey();
        let page = pageKey();
        let traversing = false;
        let changing = false;
        let restoring = false;
        let cancelRestore = () => {};
        const previousMode = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        const save = () => {
            if (restoring || changing) return;
            const position = { x: window.scrollX, y: window.scrollY };
            write(key, position);
            write('page:' + page, position);
        };
        saveCurrent = save;
        const restore = (saved: unknown) => {
            cancelRestore();
            const point = saved as { x?: number; y?: number } | undefined;
            if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
            restoring = true;
            let frame = 0;
            let observer: ResizeObserver;
            let timer: ReturnType<typeof setTimeout>;
            const stop = () => {
                cancelAnimationFrame(frame);
                observer?.disconnect();
                clearTimeout(timer);
                restoring = false;
                window.removeEventListener('wheel', stop);
                window.removeEventListener('touchstart', stop);
                window.removeEventListener('keydown', stop);
            };
            const apply = () => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => window.scrollTo({ left: point.x!, top: point.y!, behavior: 'instant' as ScrollBehavior }));
            };
            cancelRestore = stop;
            observer = new ResizeObserver(apply);
            observer.observe(document.body);
            window.addEventListener('wheel', stop, { passive: true });
            window.addEventListener('touchstart', stop, { passive: true });
            window.addEventListener('keydown', stop);
            apply();
            timer = setTimeout(stop, 2500);
        };
        router.beforePopState(() => { traversing = true; return true; });
        const start = (_url: string, options: { shallow: boolean }) => {
            if (options.shallow) return;
            save();
            cancelRestore();
            changing = true;
        };
        const complete = (url: string, options: { shallow: boolean }) => {
            if (options.shallow) return;
            key = entryKey();
            page = pageKey();
            changing = false;
            const explicitReturn = /[?&](restore|restoreCameraFilter)=1(?:&|$)/.test(url);
            if (traversing || explicitReturn) restore(read(traversing ? key : 'page:' + page));
            traversing = false;
        };
        const error = () => { changing = false; traversing = false; };
        const onPageShow = (event: PageTransitionEvent) => { if (!event.persisted) restore(read(key)); };
        router.events.on('routeChangeStart', start);
        router.events.on('routeChangeComplete', complete);
        router.events.on('routeChangeError', error);
        window.addEventListener('pagehide', save);
        window.addEventListener('pageshow', onPageShow);
        // Also retain position before a reload or a native external link.
        window.addEventListener('scroll', save, { passive: true });
        restore(read(key));
        return () => {
            save(); cancelRestore(); saveCurrent = () => {};
            history.scrollRestoration = previousMode;
            router.beforePopState(() => true);
            router.events.off('routeChangeStart', start);
            router.events.off('routeChangeComplete', complete);
            router.events.off('routeChangeError', error);
            window.removeEventListener('pagehide', save);
            window.removeEventListener('pageshow', onPageShow);
            window.removeEventListener('scroll', save);
        };
    }, [router.events]);
}
