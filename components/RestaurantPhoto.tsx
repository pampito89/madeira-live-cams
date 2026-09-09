import Image from 'next/image';
import { useState } from 'react';

export default function RestaurantPhoto({ src, name, locale, available = true }: { src: string; name: string; locale: 'en' | 'uk'; available?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className="relative aspect-video overflow-hidden bg-slate-100">
    {available && !failed ? <Image src={src} alt={name} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" onError={() => setFailed(true)} /> :
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-panel text-slate-500">
        <span aria-hidden="true" className="text-5xl">🍽️</span>
        <span className="text-sm">{locale === 'uk' ? 'Фото незабаром' : 'Photo coming soon'}</span>
      </div>}
  </div>;
}
