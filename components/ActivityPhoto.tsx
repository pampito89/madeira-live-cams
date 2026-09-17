import Image from 'next/image';
import { useState } from 'react';

export default function ActivityPhoto({ src, name, locale, available = true, compact = false }: { src: string; name: string; locale: 'en' | 'uk'; available?: boolean; compact?: boolean }) {
  const [failed, setFailed] = useState(false);

  return <div className={compact ? 'relative h-full w-full overflow-hidden bg-white' : 'relative aspect-video overflow-hidden bg-white'}>
    {available && !failed ? (
      <Image
        src={src}
        alt={name}
        fill
        unoptimized
        sizes={compact ? '96px' : '(max-width: 768px) 100vw, 768px'}
        className={compact ? 'object-contain p-1.5' : 'object-contain p-4 sm:p-6'}
        onError={() => setFailed(true)}
      />
    ) : (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500" role="img" aria-label={locale === 'uk' ? 'Фото незабаром' : 'Photo coming soon'}>
        <span aria-hidden="true" className={compact ? 'text-3xl' : 'text-5xl'}>🧭</span>
        {!compact && <span className="text-sm">{locale === 'uk' ? 'Фото незабаром' : 'Photo coming soon'}</span>}
      </div>
    )}
  </div>;
}
