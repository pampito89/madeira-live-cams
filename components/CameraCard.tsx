import React from 'react';
import Link from 'next/link';
import { useMessages } from '../lib/i18n/useMessages';
import {
  getLocalizedCamera,
  type Camera,
} from './cameraData';

interface Props {
  camera: Camera;
}

const CameraCard: React.FC<Props> = ({ camera }) => {
  const { locale, messages } = useMessages();
  const displayCamera = getLocalizedCamera(camera, locale);

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
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-ocean/20 via-panel to-clay/20 p-4 text-center">
            <span className="text-xs text-slate-600">
              {messages.cameraCard.streamOnSource}
            </span>

            <a
              href={displayCamera.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-ocean px-3 py-2 text-xs font-medium text-white transition hover:bg-forest"
            >
              {messages.cameraCard.openLiveCamera}
            </a>
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
              href={`/cameras/${displayCamera.id}`}
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