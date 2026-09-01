import type { NextApiRequest, NextApiResponse } from 'next';
import { cameras } from '../../components/cameraData';

const ALLOWED_CAMERA_HOSTS = new Set([
  'www.netmadeira.com',
  'netmadeira.com',
  'worldcam.eu',
  'www.worldcam.eu',
]);

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    const cameraPageResponse = await fetch(camera.sourceUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MadeiraLiveCams/1.0; +https://madeira-live-cams.vercel.app)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!cameraPageResponse.ok) {
      res.status(502).json({
        error: 'Could not load the camera source page',
      });
      return;
    }

    const cameraPageHtml = await cameraPageResponse.text();

    const snapshotImageUrl = getImageUrlFromCameraPage(
      cameraPageHtml,
      camera.sourceUrl
    );

    if (!snapshotImageUrl) {
      res.status(502).json({
        error: 'Could not find the current camera image',
      });
      return;
    }

    const snapshotImageUrlObject = new URL(snapshotImageUrl);

    if (!ALLOWED_CAMERA_HOSTS.has(snapshotImageUrlObject.hostname)) {
      res.status(502).json({
        error: 'The camera image is from an unsupported host',
      });
      return;
    }

    const snapshotResponse = await fetch(snapshotImageUrl, {
      headers: {
        Referer: camera.sourceUrl,
        'User-Agent':
          'Mozilla/5.0 (compatible; MadeiraLiveCams/1.0; +https://madeira-live-cams.vercel.app)',
        Accept:
          'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5',
      },
    });

    if (!snapshotResponse.ok) {
      res.status(502).json({
        error: 'Could not load the current camera image',
      });
      return;
    }

    const contentType =
      snapshotResponse.headers.get('content-type') || 'image/jpeg';

    const imageBuffer = Buffer.from(await snapshotResponse.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    res.status(200).send(imageBuffer);
  } catch {
    res.status(502).json({
      error: 'Unable to load the live camera preview',
    });
  }
}