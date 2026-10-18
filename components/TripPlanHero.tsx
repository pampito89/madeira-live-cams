import { useText } from '../lib/i18n/TranslationProvider';
import type { ReactNode } from 'react';
import styles from '../styles/tripPlanHero.module.css';
export default function TripPlanHero({ children }: {
    children: ReactNode;
}) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    return <header className={styles.hero}><div className={styles.content}>{localize(children)}</div></header>;
}
