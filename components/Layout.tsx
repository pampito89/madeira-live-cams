import { useText } from '../lib/i18n/TranslationProvider';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMessages } from '../lib/i18n/useMessages';
import { layoutText } from '../lib/i18n/layoutText';
import LanguageSwitcher from './LanguageSwitcher';
import HistoryNavigation from './HistoryNavigation';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
const eventLabels = { en: 'Events & parties', pt: 'Festas e eventos', de: 'Partys & Veranstaltungen', fr: 'Soirées et événements', es: 'Fiestas y eventos', pl: 'Imprezy i wydarzenia', uk: 'Події та вечірки' };
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { translate: localize, language: translationLanguage } = useText();
  const router = useRouter();
  const { siteLocale, messages } = useMessages();
  const text = layoutText[siteLocale];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsMenuOpen(false); setIsInstallGuideOpen(false); }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);
  useEffect(() => { setIsMenuOpen(false); setIsInstallGuideOpen(false); }, [router.asPath]);
  useEffect(() => {
    const userAgent = window.navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(userAgent);
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
    setIsIosDevice(ios); setIsAndroidDevice(android); setIsPwaInstalled(standalone);
    const handleBeforeInstallPrompt = (event: Event) => { event.preventDefault(); setDeferredInstallPrompt(event as BeforeInstallPromptEvent); };
    const handleAppInstalled = () => { setDeferredInstallPrompt(null); setIsPwaInstalled(true); setIsInstallGuideOpen(false); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  const handlePwaInstall = async () => {
    if (isIosDevice) { setIsInstallGuideOpen(true); return; }
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') { setIsPwaInstalled(true); setIsInstallGuideOpen(false); }
      setDeferredInstallPrompt(null); return;
    }
    if (isAndroidDevice) setIsInstallGuideOpen(true);
  };
  const navItems = [
    { href: '/', label: text.home, icon: '⌂' },
    { href: '/cameras', label: text.locations, icon: '⌖' },
    { href: '/trip-plan', label: text.tripPlan, icon: '🗺️' },
    { href: '/trail-availability', label: text.trails, icon: '📈' },
    { href: '/parties', label: eventLabels[siteLocale], icon: '♫' },
    { href: '/weather-guide', label: messages.nav.sunrise, icon: '☀' },
    { href: '/about', label: messages.nav.about, icon: 'ⓘ' },
  ];
  const isActivePage = (href: string) => href === '/' ? router.pathname === '/' : router.pathname === href || router.pathname.startsWith(`${href}/`);
  const installButtonLabel = isIosDevice ? text.addIphone : text.installApp;
  const showInstallButton = !isPwaInstalled && (isIosDevice || isAndroidDevice || deferredInstallPrompt);
  return <div className="flex min-h-screen flex-col bg-white">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8"><div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => setIsMenuOpen(true)} aria-label={localize(text.openMenu)} aria-expanded={isMenuOpen} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl font-semibold text-navy transition hover:border-ocean hover:bg-panel hover:text-ocean focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2">☰</button>
          <Link href="/" locale={translationLanguage} className="truncate text-base font-semibold text-navy transition hover:text-ocean sm:text-lg">Madeira Live Cams</Link>
        </div><LanguageSwitcher />
      </div><HistoryNavigation /></div>
    </header>
    <div className={`fixed inset-0 z-50 transition ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isMenuOpen}>
      <button type="button" onClick={() => setIsMenuOpen(false)} aria-label={localize(text.closeMenu)} className={`absolute inset-0 bg-navy/40 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside className={`relative flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><p className="text-sm font-semibold text-navy">Madeira Live Cams</p><button type="button" onClick={() => setIsMenuOpen(false)} aria-label={localize(text.closeMenu)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-panel hover:text-ocean focus:outline-none focus:ring-2 focus:ring-ocean">×</button></div>
        <nav className="flex flex-col gap-1 p-3">{navItems.map(item => {
          const active = isActivePage(item.href);
          return <Link key={item.href} href={item.href} locale={translationLanguage} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-ocean text-white shadow-sm' : 'text-navy hover:bg-panel hover:text-ocean'}`}><span className={`flex h-6 w-6 items-center justify-center text-lg ${active ? 'text-white' : 'text-ocean'}`} aria-hidden="true">{item.icon}</span><span>{localize(item.label)}</span></Link>;
        })}</nav>
        <div className="mt-auto">
          {showInstallButton ? <div className="px-4 pb-4"><button type="button" onClick={handlePwaInstall} className="flex w-full items-center justify-center gap-2 rounded-xl border border-ocean bg-panel px-3 py-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 3v12" /><path d="m7 10 5 5-5" /><path d="M5 21h14" /></svg><span>{localize(installButtonLabel)}</span></button></div> : null}
          <div className="border-t border-slate-200 p-4"><p className="mb-2 text-xs font-medium text-slate-500">{localize(text.language)}</p><LanguageSwitcher fullWidth placement="top" onSelect={() => setIsMenuOpen(false)} /></div>
        </div>
      </aside>
    </div>
    {isInstallGuideOpen ? <div className="fixed inset-0 z-[60] flex items-end bg-navy/50 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="install-guide-title">
      <button type="button" aria-label={localize(text.closeMenu)} onClick={() => setIsInstallGuideOpen(false)} className="absolute inset-0 cursor-default" />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={() => setIsInstallGuideOpen(false)} aria-label={localize(text.closeMenu)} className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200">×</button>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-ocean"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 3v12" /><path d="m7 10 5 5-5" /><path d="M5 21h14" /></svg></div>
        <h2 id="install-guide-title" className="mb-2 pr-8 text-xl font-bold text-navy">{localize(text.installTitle)}</h2>
        {isIosDevice ? <><p className="mb-5 text-sm leading-6 text-slate-600">{localize(text.iosIntro)}</p><ol className="mb-6 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">{text.iosSteps.map(step => <li key={step}>{localize(step)}</li>)}</ol></> : <><p className="mb-5 text-sm leading-6 text-slate-600">{localize(text.androidIntro)}</p><ol className="mb-6 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">{text.androidSteps.map(step => <li key={step}>{localize(step)}</li>)}</ol></>}
        <button type="button" onClick={() => setIsInstallGuideOpen(false)} className="w-full rounded-xl bg-ocean px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2">{localize(text.gotIt)}</button>
      </div>
    </div> : null}
    <main className="flex-1 bg-panel">{localize(children)}</main>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-500">
      <p>{localize(text.webcamNotice)}</p><p>{localize(text.weatherNotice)}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span>© {new Date().getFullYear()} Madeira Live Cams.</span><span aria-hidden="true">·</span><Link href="/privacy" locale={translationLanguage} className="font-medium text-ocean transition hover:underline">{localize(text.privacy)}</Link></div>
    </div></footer>
  </div>;
};
export default Layout;
