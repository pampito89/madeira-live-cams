import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMessages } from '../lib/i18n/useMessages';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { locale, messages } = useMessages();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPwaInstallAvailable, setIsPwaInstallAvailable] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isIosInstallOpen, setIsIosInstallOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const saveLocale = (selectedLocale: 'en' | 'uk') => {
    document.cookie = `NEXT_LOCALE=${selectedLocale}; path=/; max-age=31536000; SameSite=Lax`;
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsIosInstallOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsIosInstallOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent || '';

    const isIos =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const navigatorWithStandalone = navigator as Navigator & {
      standalone?: boolean;
    };

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigatorWithStandalone.standalone === true;

    setIsIosDevice(isIos);

    if (isIos && !isStandalone) {
      setIsPwaInstallAvailable(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (!isIos && !isStandalone) {
        setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
        setIsPwaInstallAvailable(true);
      }
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsPwaInstallAvailable(false);
      setIsIosInstallOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );

      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handlePwaInstall = async () => {
    if (isIosDevice) {
      setIsIosInstallOpen(true);
      return;
    }

    if (!deferredInstallPrompt) {
      return;
    }

    await deferredInstallPrompt.prompt();

    const choice = await deferredInstallPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setIsPwaInstallAvailable(false);
    }

    setDeferredInstallPrompt(null);
  };

  const navItems = [
    { href: '/', label: locale === 'uk' ? 'Головна' : 'Home', icon: '⌂' },
    {
      href: '/cameras',
      label: locale === 'uk' ? 'Локації' : 'Locations',
      icon: '⌖'
    },
    {
      href: '/trip-plan',
      label: locale === 'uk' ? 'План подорожі' : 'Trip plan',
      icon: '🗺️'
    },
    { href: '/weather-guide', label: messages.nav.sunrise, icon: '☀' },
    { href: '/about', label: messages.nav.about, icon: 'ⓘ' }
  ];

  const isActivePage = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }

    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  const privacyLabel =
    locale === 'uk' ? 'Політика конфіденційності' : 'Privacy Policy';

  const installButtonLabel = isIosDevice
    ? locale === 'uk'
      ? 'Додати на iPhone'
      : 'Add to iPhone'
    : locale === 'uk'
      ? 'Встановити застосунок'
      : 'Install app';

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

          <div className="mt-auto">
            {isPwaInstallAvailable && (
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={handlePwaInstall}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-ocean bg-panel px-3 py-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>

                  <span>{installButtonLabel}</span>
                </button>
              </div>
            )}

            <div className="border-t border-slate-200 p-4">
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
          </div>
        </aside>
      </div>

      {isIosInstallOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-navy/50 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
        >
          <button
            type="button"
            aria-label={locale === 'uk' ? 'Закрити' : 'Close'}
            onClick={() => setIsIosInstallOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsIosInstallOpen(false)}
              aria-label={locale === 'uk' ? 'Закрити' : 'Close'}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200"
            >
              ×
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-ocean">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </div>

            <h2
              id="ios-install-title"
              className="mb-2 pr-8 text-xl font-bold text-navy"
            >
              {locale === 'uk'
                ? 'Додайте Madeira Live Cams'
                : 'Add Madeira Live Cams'}
            </h2>

            <p className="mb-5 text-sm leading-6 text-slate-600">
              {locale === 'uk'
                ? 'Збережіть сайт на головному екрані iPhone, щоб відкривати його як окремий застосунок.'
                : 'Save the site to your iPhone Home Screen and open it like an app.'}
            </p>

            <ol className="mb-6 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>
                {locale === 'uk'
                  ? 'У Safari натисніть кнопку «Поділитися» — квадрат зі стрілкою вгору.'
                  : 'In Safari, tap the Share button — the square with the upward arrow.'}
              </li>

              <li>
                {locale === 'uk'
                  ? 'Прокрутіть список і виберіть «На екран “Домівка”».'
                  : 'Scroll through the list and select “Add to Home Screen”.'}
              </li>

              <li>
                {locale === 'uk'
                  ? 'За наявності увімкніть «Відкрити як вебзастосунок», потім натисніть «Додати».'
                  : 'If shown, enable “Open as Web App”, then tap Add.'}
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setIsIosInstallOpen(false)}
              className="w-full rounded-xl bg-ocean px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
            >
              {locale === 'uk' ? 'Зрозуміло' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 bg-panel">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-500">
          <p>
            {locale === 'uk'
              ? 'Трансляції вебкамер належать їхнім відповідним власникам, зокрема Portal NetMadeira та Madeira-Web. Madeira Live Cams не розміщує, не записує і не поширює трансляції.'
              : 'Webcam streams belong to their respective owners, including Portal NetMadeira and Madeira-Web. Madeira Live Cams does not host, record, or redistribute streams.'}
          </p>

          <p>
            {locale === 'uk'
              ? 'Дані про погоду надаються Open-Meteo, коли вони доступні.'
              : 'Weather data provided by Open-Meteo where available.'}
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>© {new Date().getFullYear()} Madeira Live Cams.</span>

            <span aria-hidden="true">·</span>

            <Link
              href="/privacy"
              locale={locale}
              className="font-medium text-ocean transition hover:underline"
            >
              {privacyLabel}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;