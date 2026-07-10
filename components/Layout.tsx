
import React from 'react';
import Link from 'next/link';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
  <img
    src="/images/logo.svg"
    alt="Madeira Live Cams"
    className="h-10 w-auto"
  />

  <div className="flex flex-col">
    <span className="whitespace-nowrap text-base font-semibold text-navy sm:text-lg">
  Madeira Live Cams
</span>
  </div>
</Link>
          <nav className="grid w-full grid-cols-3 gap-2 text-center sm:flex sm:w-auto sm:items-center sm:justify-end sm:gap-4">
  <Link
    href="/cameras"
    className="rounded-lg px-2 py-2 text-xs font-medium text-navy hover:bg-panel hover:text-ocean sm:p-0 sm:text-sm"
  >
    Explore
  </Link>

  <Link
    href="/weather-guide"
    className="rounded-lg px-2 py-2 text-xs font-medium text-navy hover:bg-panel hover:text-ocean sm:p-0 sm:text-sm"
  >
    Weather
  </Link>

  <Link
    href="/about"
    className="rounded-lg px-2 py-2 text-xs font-medium text-navy hover:bg-panel hover:text-ocean sm:p-0 sm:text-sm"
  >
    About
  </Link>
</nav>
        </div>
      </header>
      <main className="flex-1 bg-panel">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 flex flex-col gap-1">
          <p>
            Webcam streams belong to their respective owners (e.g., Portal NetMadeira, Madeira-Web). Madeira Live Cams
            does not host, record, or redistribute streams.
          </p>
          <p>
            Weather data provided by Open-Meteo where available.
          </p>
          <p>
            © {new Date().getFullYear()} Madeira Live Cams.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
