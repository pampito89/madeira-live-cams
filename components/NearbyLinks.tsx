import Link from 'next/link';
import type { Locale } from '../lib/i18n/config';
import { useMessages } from '../lib/i18n/useMessages';
import { useText } from '../lib/i18n/TranslationProvider';
import type { NearbyItem, NearbyLinksData } from '../lib/nearbyLinks';

type Props = {
  nearby?: NearbyLinksData;
  variant: 'camera' | 'location';
};

const copy: Record<Locale, {
  nearbyPlaces: string;
  nearbyCameras: string;
  otherCameras: string;
  exploreAround: string;
  sameArea: string;
  km: string;
}> = {
  en: { nearbyPlaces: 'Nearby places & trails', nearbyCameras: 'Nearest live webcams', otherCameras: 'Nearby webcams', exploreAround: 'Explore nearby', sameArea: 'Here', km: 'km' },
  pt: { nearbyPlaces: 'Locais e trilhos próximos', nearbyCameras: 'Webcams mais próximas', otherCameras: 'Outras webcams próximas', exploreAround: 'Explorar por perto', sameArea: 'Aqui', km: 'km' },
  de: { nearbyPlaces: 'Orte & Wanderwege in der Nähe', nearbyCameras: 'Nächste Live-Webcams', otherCameras: 'Weitere Webcams in der Nähe', exploreAround: 'In der Nähe entdecken', sameArea: 'Hier', km: 'km' },
  fr: { nearbyPlaces: 'Lieux et sentiers à proximité', nearbyCameras: 'Webcams les plus proches', otherCameras: 'Autres webcams à proximité', exploreAround: 'Explorer à proximité', sameArea: 'Ici', km: 'km' },
  es: { nearbyPlaces: 'Lugares y rutas cercanos', nearbyCameras: 'Webcams más cercanas', otherCameras: 'Otras webcams cercanas', exploreAround: 'Explorar cerca', sameArea: 'Aquí', km: 'km' },
  pl: { nearbyPlaces: 'Miejsca i szlaki w pobliżu', nearbyCameras: 'Najbliższe kamery na żywo', otherCameras: 'Inne kamery w pobliżu', exploreAround: 'Odkryj w pobliżu', sameArea: 'Tutaj', km: 'km' },
  uk: { nearbyPlaces: 'Локації та маршрути поруч', nearbyCameras: 'Найближчі онлайн-камери', otherCameras: 'Інші камери поруч', exploreAround: 'Що подивитися поруч', sameArea: 'Поруч', km: 'км' },
};

function formatDistance(distanceKm: number, locale: Locale): string {
  const labels = copy[locale];
  if (distanceKm < 0.2) return labels.sameArea;
  const formatted = distanceKm < 10 ? distanceKm.toFixed(1) : String(Math.round(distanceKm));
  return `${formatted} ${labels.km}`;
}

function LinkList({ heading, items, icon }: { heading: string; items: NearbyItem[]; icon: string }) {
  const { translate: localize, language } = useText();
  const { locale, siteLocale } = useMessages();
  if (!items.length) return null;
  return (
    <div>
      <h2 className="text-base font-semibold text-navy">{heading}</h2>
      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {items.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              locale={language}
              className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-panel/60 px-3.5 py-2.5 text-sm transition hover:border-ocean hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-navy">
                  <span aria-hidden="true" className="mr-1.5 text-ocean">{icon}</span>
                  {locale === 'uk' ? item.name.uk : localize(item.name.en)}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {locale === 'uk' ? item.meta.uk : localize(item.meta.en)}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {formatDistance(item.distanceKm, siteLocale)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NearbyLinks({ nearby, variant }: Props) {
  const { siteLocale } = useMessages();
  if (!nearby || (!nearby.cameras.length && !nearby.locations.length)) return null;
  const labels = copy[siteLocale];
  const cameraFirst = variant === 'location';
  const containerClass = variant === 'camera'
    ? 'mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'
    : 'mx-auto mt-8 max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
  return (
    <nav aria-label={cameraFirst ? labels.exploreAround : labels.nearbyPlaces} className={containerClass}>
      {cameraFirst ? (
        <>
          <LinkList heading={labels.nearbyCameras} items={nearby.cameras} icon="◉" />
          <LinkList heading={labels.exploreAround} items={nearby.locations} icon="⌖" />
        </>
      ) : (
        <>
          <LinkList heading={labels.nearbyPlaces} items={nearby.locations} icon="⌖" />
          <LinkList heading={labels.otherCameras} items={nearby.cameras} icon="◉" />
        </>
      )}
    </nav>
  );
}
