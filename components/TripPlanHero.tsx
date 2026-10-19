import Image from 'next/image';
import type { ReactNode } from 'react';
import { useText } from '../lib/i18n/TranslationProvider';
import mapImage from '../public/images/trip-plan-map.jpg';
import styles from '../styles/tripPlanHero.module.css';
export default function TripPlanHero({ children }: { children: ReactNode }) {
  const { translate: localize } = useText();
  return <header className={styles.hero}>
    <Image src={mapImage} alt="" fill priority sizes="(max-width: 1024px) 100vw, 1152px" className={styles.image} />
    <div className={styles.content}>{localize(children)}</div>
  </header>;
}
