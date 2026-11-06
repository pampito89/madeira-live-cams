import type { ImageLoaderProps } from 'next/image';
import images from '../../data/optimized-images.json';

const manifest: Record<string, { src: string; variants: { width: number; src: string }[] }> = images;

/** Serve prebuilt, size-appropriate files without first-visit image encoding. */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  const entry = manifest[src];
  if (entry) {
    return (entry.variants.find(variant => variant.width >= width) || entry.variants[entry.variants.length - 1]).src;
  }
  // New assets still render before the optimization catalog is regenerated.
  const [url, fragment] = src.split('#');
  return `${url}${url.includes('?') ? '&' : '?'}w=${width}${fragment ? `#${fragment}` : ''}`;
}
