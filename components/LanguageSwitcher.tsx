import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { defaultLocale, isSupportedLocale, localeDetails, supportedLocales, type Locale } from '../lib/i18n/config';

type LanguageSwitcherProps = {
  fullWidth?: boolean;
  placement?: 'bottom' | 'top';
  onSelect?: () => void;
};

const labels: Record<Locale, { change: string; choose: string }> = {
  en: { change: 'Change site language', choose: 'Choose language' },
  pt: { change: 'Alterar o idioma do site', choose: 'Escolher idioma' },
  de: { change: 'Sprache der Website ändern', choose: 'Sprache wählen' },
  fr: { change: 'Changer la langue du site', choose: 'Choisir la langue' },
  es: { change: 'Cambiar el idioma del sitio', choose: 'Elegir idioma' },
  pl: { change: 'Zmień język strony', choose: 'Wybierz język' },
  uk: { change: 'Змінити мову сайту', choose: 'Оберіть мову' },
};

export default function LanguageSwitcher({
  fullWidth = false,
  placement = 'bottom',
  onSelect,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = isSupportedLocale(router.locale) ? router.locale : defaultLocale;
  const currentLanguage = localeDetails[currentLocale];
  const requiresHomepageFallback = /^\/(?:explore|stays)\/[^/?#]+/.test(router.asPath);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [router.asPath]);

  const saveLocale = (selectedLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${selectedLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setIsOpen(false);
    onSelect?.();
  };

  const menuPosition = placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const availableLocales = supportedLocales.filter((languageLocale) => languageLocale !== currentLocale);

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        aria-label={labels[currentLocale].change}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex min-h-10 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy transition hover:border-ocean hover:bg-panel focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 ${fullWidth ? 'w-full' : ''}`}
      >
        <span>{currentLanguage.code}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={labels[currentLocale].choose}
          className={`absolute right-0 z-[70] min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${menuPosition} ${fullWidth ? 'w-full' : ''}`}
        >
          {availableLocales.map((languageLocale) => {
            const language = localeDetails[languageLocale];
            const targetHref = requiresHomepageFallback && !['en', 'uk'].includes(languageLocale) ? '/' : router.asPath;

            return (
              <Link
                key={languageLocale}
                href={targetHref}
                locale={languageLocale}
                role="menuitem"
                onClick={() => saveLocale(languageLocale)}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy transition hover:bg-panel"
              >
                <span className="text-xl leading-none" aria-hidden="true">{language.flag}</span>
                <span className="font-semibold">{language.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
