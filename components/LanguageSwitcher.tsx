import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { defaultLocale, isSupportedLocale, localeDetails, supportedLocales, type Locale } from '../lib/i18n/config';

type Props = { fullWidth?: boolean; placement?: 'bottom' | 'top'; onSelect?: () => void };
const labels: Record<Locale, { change: string; choose: string }> = {
  en: { change: 'Change site language', choose: 'Choose language' },
  pt: { change: 'Alterar o idioma do site', choose: 'Escolher idioma' },
  de: { change: 'Sprache der Website ändern', choose: 'Sprache wählen' },
  fr: { change: 'Changer la langue du site', choose: 'Choisir la langue' },
  es: { change: 'Cambiar el idioma del sitio', choose: 'Elegir idioma' },
  pl: { change: 'Zmień język strony', choose: 'Wybierz język' },
  uk: { change: 'Змінити мову сайту', choose: 'Оберіть мову' },
};
export default function LanguageSwitcher({ fullWidth = false, placement = 'bottom', onSelect }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = isSupportedLocale(router.locale) ? router.locale : defaultLocale;
  const currentLanguage = localeDetails[currentLocale];
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    document.addEventListener('mousedown', outside);
    window.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); window.removeEventListener('keydown', escape); };
  }, []);
  useEffect(() => { setIsOpen(false); }, [router.asPath, currentLocale]);
  const saveLocale = (locale: Locale) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    setIsOpen(false);
    onSelect?.();
  };
  const position = placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button type="button" aria-label={labels[currentLocale].change} aria-haspopup="menu" aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
        className={`inline-flex min-h-10 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy transition hover:border-ocean hover:bg-panel focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 ${fullWidth ? 'w-full' : ''}`}>
        <span>{currentLanguage.code}</span><span aria-hidden="true">⌄</span>
      </button>
      {isOpen && (
        <div role="menu" aria-label={labels[currentLocale].choose} className={`absolute right-0 z-[70] min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${position} ${fullWidth ? 'w-full' : ''}`}>
          {supportedLocales.filter(locale => locale !== currentLocale).map(locale => (
            <Link key={locale} href={router.asPath} locale={locale} role="menuitem" onClick={() => saveLocale(locale)}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy transition hover:bg-panel">
              <span className="text-xl leading-none" aria-hidden="true">{localeDetails[locale].flag}</span>
              <span className="font-semibold">{localeDetails[locale].name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
