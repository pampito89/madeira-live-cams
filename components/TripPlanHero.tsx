import type { ReactNode } from 'react';
import styles from '../styles/tripPlanHero.module.css';

export default function TripPlanHero({ children }: { children: ReactNode }) {
  return <header className={styles.hero}><div className={styles.content}>{children}</div></header>;
}
