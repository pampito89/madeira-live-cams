import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMessages } from '../lib/i18n/useMessages';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { locale, messages } = useMessages();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <img
                src="/images/logo.svg"
                alt="Madeira Live Cams"
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10"
              />

              <span className="truncate text-sm font-semibold text-navy sm:text-lg">
                Madeira Live Cams
              </span>
            </Link>

            <nav className="flex shrink-0 items-center gap-1.5 sm:gap-4">
              <Link
                href="/cameras"
                className="rounded-lg px-2 py-2 text-[13px] font-medium text-navy hover:bg-panel hover:text-ocean sm:p-0 sm:text-sm"
              >
                {messages.nav.explore}
              </Link>

              <Link
                href="/weather-guide"
                className="rounded-lg px-2 py-2 text-[13px] font-medium text-navy hover:bg-panel hover:text-ocean sm:p-0 sm:text-sm"
              >
                {messages.nav.sunrise}
              </Link>

              <Link
                href="/about"
                className="rounded-lg px-2 py-2 text-[13px] font-medium text-navy hover:bg-panel hover:text-ocean sm:p-0 sm:text-sm"
              >
                {messages.nav.about}
              </Link>

              <div className="ml-1 flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold sm:ml-2">
  <Link
    href={router.asPath}
    locale="en"
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
    className={
      locale === 'uk'
        ? 'rounded-md bg-ocean px-2 py-1 text-white'
        : 'rounded-md px-2 py-1 text-slate-600 hover:text-ocean'
    }
  >
    UK
  </Link>
</div>
            </nav>
          </div>
        </div>
      </header>

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