import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMessages } from '../lib/i18n/useMessages';
import {
  getLocalizedCamera,
  type Camera,
} from './cameraData';

interface Props {
  camera: Camera;
  returnToHome?: boolean;
  onDetailsOpen?: () => void;
}

const cameraDetailsHref: Record<string, string> = {
  'pico-do-arieiro': '/explore/pico-do-arieiro',
  machico: '/explore/machico-beach',
  canical: '/explore/prainha-do-canical',
  seixal: '/explore/praia-do-porto-do-seixal',
  'porto-moniz': '/explore/porto-moniz-natural-pools',
  'funchal-pontinha': '/explore/funchal',
  'eira-do-serrado': '/explore/eira-do-serrado',
  'ponta-do-sol': '/explore/levada-nova-levada-do-moinho',
  'achada-do-teixeira': '/explore/pico-ruivo',
  'camara-de-lobos': '/explore/cabo-girao-skywalk',
  'ponta-delgada': '/cameras/ponta-delgada',
  'cristo-rei': '/explore/cristo-rei',
  'seixal-beach': '/explore/praia-do-porto-do-seixal',
  'machico-beach': '/explore/machico-beach',
};

const CameraCard: React.FC<Props> = ({
  camera,
  returnToHome = false,
  onDetailsOpen,
}) => {
  const { locale, messages } = useMessages();
  const displayCamera = getLocalizedCamera(camera, locale);

  const [snapshotVersion, setSnapshotVersion] = useState(
    Math.floor(Date.now() / 60000)
  );
  const [snapshotFailed, setSnapshotFailed] = useState(false);

  const isSnapshotCamera =
    displayCamera.sourceUrl.includes('netmadeira.com/webcams-madeira/') ||
    displayCamera.sourceUrl.includes('worldcam.eu/');

  useEffect(() => {
    if (!isSnapshotCamera) {
      return;
    }

    const refreshSnapshot = () => {
      setSnapshotFailed(false);
      setSnapshotVersion(Math.floor(Date.now() / 60000));
    };

    const interval = window.setInterval(refreshSnapshot, 60000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isSnapshotCamera]);

  const detailsHref =
    cameraDetailsHref[displayCamera.id] ?? `/cameras/${displayCamera.id}`;

  const linkHref =
    returnToHome && detailsHref.startsWith('/explore/')
      ? { pathname: detailsHref, query: { returnTo: 'home' } }
      : detailsHref;

  const fallbackImage = '/images/cameras/madeira-camera-2.png';

  const snapshotUrl = `/api/camera-snapshot?id=${encodeURIComponent(
    displayCamera.id
  )}&v=${snapshotVersion}`;

  const previewLabel =
    locale === 'uk' ? 'Останній кадр трансляції' : 'Latest live preview';

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="h-48 overflow-hidden bg-slate-900">
        {displayCamera.youtubeId ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${displayCamera.youtubeId}?autoplay=0&mute=1`}
            title={`${displayCamera.name} ${messages.cameraCard.liveStreamTitleSuffix}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : isSnapshotCamera ? (
          <div className="relative h-full overflow-hidden">
            <img
              src={snapshotFailed ? fallbackImage : snapshotUrl}
              alt={
                snapshotFailed
                  ? ''
                  : `${displayCamera.name} — ${previewLabel}`
              }
              aria-hidden={snapshotFailed}
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setSnapshotFailed(true)}
            />

            <div className="absolute inset-0 bg-navy/35" />

            <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-navy/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span>{previewLabel}</span>
            </div>

            <div className="relative z-10 flex h-full flex-col items-center justify-end gap-3 p-4 text-center">
              <a
                href={displayCamera.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-navy shadow-sm transition hover:bg-panel"
              >
                {messages.cameraCard.openLiveCamera}
              </a>
            </div>
          </div>
        ) : (
          <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden p-4 text-center">
            <img
              src={fallbackImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-navy/55" />

            <div className="relative z-10 flex flex-col items-center gap-3">
              <span className="max-w-[220px] text-xs font-medium text-white">
                {messages.cameraCard.streamOnSource}
              </span>

              <a
                href={displayCamera.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-navy transition hover:bg-panel"
              >
                {messages.cameraCard.openLiveCamera}
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy">
              {displayCamera.name}
            </h3>

            <p className="text-xs text-slate-500">
              {displayCamera.region}
            </p>
          </div>

          {displayCamera.altitudeMeters && (
            <span className="rounded-full bg-panel px-2 py-1 text-xs text-slate-600">
              {displayCamera.altitudeMeters} m
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {displayCamera.category.map((category) => (
            <span
              key={category}
              className="rounded-full bg-ocean/10 px-2 py-1 text-[10px] text-ocean"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <div className="flex gap-2">
            <Link
              href={linkHref}
              onClick={onDetailsOpen}
              className="flex-1 rounded-lg bg-ocean px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-forest"
            >
              {messages.cameraCard.watchDetails}
            </Link>

            <a
              href={displayCamera.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-slate-200 bg-panel px-3 py-2 text-center text-xs font-medium text-navy transition hover:bg-mist"
            >
              {messages.cameraCard.openOriginalSource}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCard;