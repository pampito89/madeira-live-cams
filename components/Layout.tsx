
import React from 'react';
import Link from 'next/link';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-white font-bold text-lg">
              ML
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-navy">Madeira Live Cams</span>
              <span className="text-xs text-slate-500">Check the weather. Choose your view.</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-navy">
            <Link href="/cameras" className="hover:text-ocean">Explore Cameras</Link>
            <Link href="/map" className="hover:text-ocean">Map</Link>
            <Link href="/weather-guide" className="hover:text-ocean">Weather Guide</Link>
            <Link href="/about" className="hover:text-ocean">About</Link>
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
