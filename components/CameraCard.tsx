import tileStyles from "../styles/catalogTiles.module.css";
import { useText } from '../lib/i18n/TranslationProvider';
import { useEffect, useState } from 'react';
import { useMessages } from '../lib/i18n/useMessages';
import { cameraPreviewLabel, translateCameraLabel } from '../lib/i18n/cameraUi';
import { getLocalizedCamera, type Camera } from './cameraData';

const SNAPSHOT_REFRESH_MS = 300_000;

export default function CameraCard({ camera }: {
    camera: Camera;
}) {
    const { translate: localize } = useText();
    const { locale, siteLocale, messages } = useMessages();
    const displayCamera = getLocalizedCamera(camera, locale);
    const [snapshotBucket, setSnapshotBucket] = useState<number | null>(null);
    const [snapshotFailed, setSnapshotFailed] = useState(false);
    const isSnapshotCamera = !camera.youtubeId && (camera.sourceUrl.includes('netmadeira.com/webcams-madeira/') || camera.sourceUrl.includes('worldcam.eu/'));
    useEffect(() => {
        if (!isSnapshotCamera)
            return;
        const interval = window.setInterval(() => {
            if (document.visibilityState !== 'visible')
                return;
            setSnapshotFailed(false);
            setSnapshotBucket(Math.floor(Date.now() / SNAPSHOT_REFRESH_MS));
        }, SNAPSHOT_REFRESH_MS);
        return () => window.clearInterval(interval);
    }, [isSnapshotCamera]);
    const fallbackImage = '/images/cameras/madeira-camera-2.png';
    const snapshotUrl = snapshotBucket === null
        ? `/api/camera-snapshot?id=${encodeURIComponent(camera.id)}`
        : `/api/camera-snapshot?id=${encodeURIComponent(camera.id)}&t=${snapshotBucket}`;
    const previewLabel = cameraPreviewLabel(siteLocale);
    const region = translateCameraLabel(siteLocale, displayCamera.region);
    return <article className={tileStyles.camera + " flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"}>
      <div className="h-48 overflow-hidden bg-slate-900">
        {camera.youtubeId ? <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${camera.youtubeId}?autoplay=0&mute=1`} title={localize(`${localize(displayCamera.name)} ${messages.cameraCard.liveStreamTitleSuffix}`)} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/> : <div className="relative h-full overflow-hidden">
          <img src={isSnapshotCamera && !snapshotFailed ? snapshotUrl : fallbackImage} alt={isSnapshotCamera && !snapshotFailed ? localize(`${localize(displayCamera.name)} — ${previewLabel}`) : ''} aria-hidden={!isSnapshotCamera || snapshotFailed} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" onError={() => setSnapshotFailed(true)}/>
          <div className="absolute inset-0 bg-navy/35"/>
          {isSnapshotCamera && !snapshotFailed && <div className="absolute left-3 top-3 z-10 rounded-full bg-navy/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">{localize(previewLabel)}</div>}
          <div className="relative z-10 flex h-full flex-col items-center justify-end gap-3 p-4 text-center">
            {(!isSnapshotCamera || snapshotFailed) && <span className="max-w-[220px] text-xs font-medium text-white">{localize(messages.cameraCard.streamOnSource)}</span>}
            <a href={camera.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-navy shadow-sm transition hover:bg-panel">{localize(messages.cameraCard.openLiveCamera)}</a>
          </div>
        </div>}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-navy">{localize(displayCamera.name)}</h3>
        <p className="text-xs text-slate-500">{localize(region)}</p>
      </div>
    </article>;
}
