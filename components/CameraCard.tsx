
import React from 'react';
import Link from 'next/link';
import { Camera } from './cameraData';

interface Props {
  camera: Camera;
}

const CameraCard: React.FC<Props> = ({ camera }) => {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="h-48 bg-slate-900 overflow-hidden">
  {camera.youtubeId ? (
    <iframe
      className="w-full h-full"
      src={`https://www.youtube.com/embed/${camera.youtubeId}?autoplay=0&mute=1`}
      title={`${camera.name} live stream`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-ocean/20 via-panel to-sun/20 p-4 text-center">
      <span className="text-xs text-slate-600">Live stream available on the source website</span>
      <a
        href={camera.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-ocean px-3 py-2 text-xs font-medium text-white"
      >
        Open live camera
      </a>
    </div>
  )}
</div>
      <div className="p-3 flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-navy text-sm">{camera.name}</h3>
            <p className="text-xs text-slate-500">{camera.region}</p>
          </div>
          {camera.altitudeMeters && (
            <span className="text-xs px-2 py-1 rounded-full bg-panel text-slate-600">
              {camera.altitudeMeters} m
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {camera.category.map((cat) => (
            <span
              key={cat}
              className="text-[10px] px-2 py-1 rounded-full bg-ocean/10 text-ocean"
            >
              {cat}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex gap-2">
            <Link
              href={`/cameras/${camera.id}`}
              className="flex-1 text-center text-xs font-medium px-3 py-2 rounded-lg bg-ocean text-white hover:bg-ocean/90"
            >
              Watch details
            </Link>
            <a
              href={camera.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-medium px-3 py-2 rounded-lg bg-panel text-navy hover:bg-panel/80 border border-slate-200"
            >
              Open original source
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCard;
