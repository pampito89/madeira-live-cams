import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import { cameras } from '../../components/cameraData';

const ALLOWED_CAMERA_HOSTS = new Set([
  'www.netmadeira.com',
  'netmadeira.com',
  'worldcam.eu',
  'www.worldcam.eu',
]);

const SNAPSHOT_MAX_WIDTH = 800;
const SNAPSHOT_JPEG_QUALITY = 75;
const SNAPSHOT_CACHE_TTL_MS = 300_000;
const UPSTREAM_TIMEOUT_MS = 8_000;
const MAX_MEMORY_CACHE_ENTRIES = 40;
const CDN_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=600';

type CachedSnapshot = {
  buffer: Buffer;
  contentType: string;
  expiresAt: number;
};

const snapshotCache = new Map<string, CachedSnapshot>();
const pendingSnapshots = new Map<string, Promise<CachedSnapshot>>();

function getImageUrlFromCameraPage(
  pageHtml: string,
  cameraPageUrl: string
): string | null {
  const webcamImageTagMatch = pageHtml.match(
    /<img\b[^>]*\bid=["']webcam_image["'][^>]*>/i
  );

  if (!webcamImageTagMatch?.[0]) {
    return null;
  }

  const webcamImageTag = webcamImageTagMatch[0];

  const imageSourceMatch = webcamImageTag.match(
    /\bsrc=["']([^"']+)["']/i
  );

  if (!imageSourceMatch?.[1]) {
    return null;
  }

  const imageSource = imageSourceMatch[1].trim();

  if (imageSource.startsWith('//')) {
    return `https:${imageSource}`;
  }

  try {
    return new URL(imageSource, cameraPageUrl).toString();
  } catch {
    return null;
  }
}

async function optimizeSnapshotBuffer(
  imageBuffer: Buffer,
  originalContentType: string
): Promise<{ buffer: Buffer; contentType: string }> {
  try {
    const optimized = await sharp(imageBuffer, { failOn: 'none' })
      .rotate()
      .resize({ width: SNAPSHOT_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({
        quality: SNAPSHOT_JPEG_QUALITY,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    if (optimized.length > 0 && optimized.length < imageBuffer.length) {
      return {
        buffer: optimized,
        contentType: 'image/jpeg',
      };
    }
  } catch {
    // Fall back to the original upstream frame if optimization fails.
  }

  return {
    buffer: imageBuffer,
    contentType: originalContentType,
  };
}

function writeMemoryCache(cameraId: string, entry: CachedSnapshot) {
  if (snapshotCache.size >= MAX_MEMORY_CACHE_ENTRIES && !snapshotCache.has(cameraId)) {
    const oldestKey = snapshotCache.keys().next().value;
    if (oldestKey) {
      snapshotCache.delete(oldestKey);
    }
  }
  snapshotCache.set(cameraId, entry);
}

async function fetchCameraSnapshot(
  cameraId: string,
  sourceUrl: string
): Promise<CachedSnapshot> {
  const cameraPageResponse = await fetch(sourceUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; MadeiraLiveCams/1.0; +https://madeiralivecams.com)',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!cameraPageResponse.ok) {
    throw new Error('Could not load the camera source page');
  }

  const cameraPageHtml = await cameraPageResponse.text();

  const snapshotImageUrl = getImageUrlFromCameraPage(
    cameraPageHtml,
    sourceUrl
  );

  if (!snapshotImageUrl) {
    throw new Error('Could not find the current camera image');
  }

  const snapshotImageUrlObject = new URL(snapshotImageUrl);

  if (!ALLOWED_CAMERA_HOSTS.has(snapshotImageUrlObject.hostname)) {
    throw new Error('The camera image is from an unsupported host');
  }

  const snapshotResponse = await fetch(snapshotImageUrl, {
    headers: {
      Referer: sourceUrl,
      'User-Agent':
        'Mozilla/5.0 (compatible; MadeiraLiveCams/1.0; +https://madeiralivecams.com)',
      Accept:
        'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5',
    },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  const originalContentType = snapshotResponse.headers.get('content-type') || '';

  if (!snapshotResponse.ok || !originalContentType.toLowerCase().startsWith('image/')) {
    throw new Error('Could not load the current camera image');
  }

  const rawImageBuffer = Buffer.from(await snapshotResponse.arrayBuffer());
  const { buffer, contentType } = await optimizeSnapshotBuffer(
    rawImageBuffer,
    originalContentType
  );

  const entry: CachedSnapshot = {
    buffer,
    contentType,
    expiresAt: Date.now() + SNAPSHOT_CACHE_TTL_MS,
  };

  writeMemoryCache(cameraId, entry);
  return entry;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  // Preserve camera identity and refresh buckets in Netlify's cache key,
  // including legacy query-based clients. Use the same policy on all responses.
  res.setHeader('Netlify-Vary', 'query=id|t|v');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Netlify-CDN-Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const cameraId = typeof req.query.id === 'string' ? req.query.id : '';

  const camera = cameras.find((item) => item.id === cameraId);

  if (!camera) {
    res.status(404).json({
      error: 'Camera not found',
    });
    return;
  }

  let cameraPageUrl: URL;

  try {
    cameraPageUrl = new URL(camera.sourceUrl);
  } catch {
    res.status(400).json({
      error: 'Invalid camera source URL',
    });
    return;
  }

  const isSupportedCameraSource = ALLOWED_CAMERA_HOSTS.has(
    cameraPageUrl.hostname
  );

  if (!isSupportedCameraSource) {
    res.status(400).json({
      error: 'This camera source does not support live image previews',
    });
    return;
  }

  try {
    const cached = snapshotCache.get(camera.id);
    let snapshot: CachedSnapshot;

    if (cached && cached.expiresAt > Date.now()) {
      snapshot = cached;
    } else {
      let pending = pendingSnapshots.get(camera.id);
      if (!pending) {
        pending = fetchCameraSnapshot(camera.id, camera.sourceUrl).finally(() => {
          pendingSnapshots.delete(camera.id);
        });
        pendingSnapshots.set(camera.id, pending);
      }
      snapshot = await pending;
    }

    res.setHeader('Content-Type', snapshot.contentType);
    res.setHeader('Content-Length', String(snapshot.buffer.length));
    res.setHeader('X-Camera-Id', camera.id);
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
    );
    res.setHeader('CDN-Cache-Control', CDN_CACHE_CONTROL);
    res.setHeader('Netlify-CDN-Cache-Control', CDN_CACHE_CONTROL);

    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }

    res.status(200).send(snapshot.buffer);
  } catch {
    res.status(502).json({
      error: 'Unable to load the live camera preview',
    });
  }
}
