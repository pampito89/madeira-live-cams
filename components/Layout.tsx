import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMessages } from '../lib/i18n/useMessages';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { locale, messages } = useMessages();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const saveLocale = (selectedLocale: 'en' | 'uk') => {
    document.cookie = `NEXT_LOCALE=${selectedLocale}; path=/; max-age=31536000; SameSite=Lax`;
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [router.asPath]);

  const navItems = [
    {
      href: '/',
      label: locale === 'uk' ? 'Головна' : 'Home',
      icon: '⌂',
    },
    {
      href: '/cameras',
      label: locale === 'uk' ? 'Локації' : 'Locations',
      icon: '⌖',
    },
    {
      href: '/weather-guide',
      label: messages.nav.sunrise,
      icon: '☀',
    },
    {
      href: '/parties',
      label: locale === 'uk' ? 'Вечірки' : 'Parties',
      icon: '🎉',
    },
    {
      href: '/about',
      label: messages.nav.about,
      icon: 'ⓘ',
    },
  ];

  const isActivePage = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }

    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label={locale === 'uk' ? 'Відкрити меню' : 'Open menu'}
                aria-expanded={isMenuOpen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl font-semibold text-navy transition hover:border-ocean hover:bg-panel hover:text-ocean focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
              >
                ☰
              </button>

              <Link
                href="/"
                locale={locale}
                className="truncate text-base font-semibold text-navy transition hover:text-ocean sm:text-lg"
              >
                Madeira Live Cams
              </Link>
            </div>

            <div className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
              <Link
                href={router.asPath}
                locale="en"
                onClick={() => saveLocale('en')}
                className={
                  locale === 'en'
                    ? 'rounded-md bg-ocean px-2 py-1 text-white'
                    : 'rounded-md px-2 py-1 text-slate-600 hover:text-ocean'
                }
              >
                EN
              </Link>

              <Link
                href={router.asPath}
                locale="uk"
                onClick={() => saveLocale('uk')}
                className={
                  locale === 'uk'
                    ? 'rounded-md bg-ocean px-2 py-1 text-white'
                    : 'rounded-md px-2 py-1 text-slate-600 hover:text-ocean'
                }
              >
                UK
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 transition ${
          isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          aria-label={locale === 'uk' ? 'Закрити меню' : 'Close menu'}
          className={`absolute inset-0 bg-navy/40 transition-opacity ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          className={`relative flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-navy">Madeira Live Cams</p>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label={locale === 'uk' ? 'Закрити меню' : 'Close menu'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-panel hover:text-ocean focus:outline-none focus:ring-2 focus:ring-ocean"
            >
              ×
            </button>
          </div>

          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active = isActivePage(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  locale={locale}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-ocean text-white shadow-sm'
                      : 'text-navy hover:bg-panel hover:text-ocean'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center text-lg ${
                      active ? 'text-white' : 'text-ocean'
                    }`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200 p-4">
            <p className="mb-2 text-xs font-medium text-slate-500">
              {locale === 'uk' ? 'Мова сайту' : 'Site language'}
            </p>

            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm font-semibold">
              <Link
                href={router.asPath}
                locale="en"
                onClick={() => {
                  saveLocale('en');
                  setIsMenuOpen(false);
                }}
                className={
                  locale === 'en'
                    ? 'flex-1 rounded-md bg-ocean px-3 py-2 text-center text-white'
                    : 'flex-1 rounded-md px-3 py-2 text-center text-slate-600 hover:text-ocean'
                }
              >
                English
              </Link>

              <Link
                href={router.asPath}
                locale="uk"
                onClick={() => {
                  saveLocale('uk');
                  setIsMenuOpen(false);
                }}
                className={
                  locale === 'uk'
                    ? 'flex-1 rounded-md bg-ocean px-3 py-2 text-center text-white'
                    : 'flex-1 rounded-md px-3 py-2 text-center text-slate-600 hover:text-ocean'
                }
              >
                Українська
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <main className="flex-1 bg-panel">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-slate-500">
          <p>
            Webcam streams belong to their respective owners (e.g., Portal
            NetMadeira, Madeira-Web). Madeira Live Cams does not host, record,
            or redistribute streams.
          </p>

          <p>Weather data provided by Open-Meteo where available.</p>

          <p>© {new Date().getFullYear()} Madeira Live Cams.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;