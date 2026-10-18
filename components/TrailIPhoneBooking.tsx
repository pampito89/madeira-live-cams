import { useText } from '../lib/i18n/TranslationProvider';
import { useState } from 'react';
import Link from 'next/link';
import { BOOKING_URL, BookingCategory } from '../lib/trailAvailability';
import styles from '../styles/trailAvailability.module.css';
type Props = {
    routeName?: string;
    date: string;
    time?: string;
    people: number;
    category: BookingCategory;
    fresh: boolean;
    uk: boolean;
};
export default function TrailIPhoneBooking({ routeName, date, time, people, category, fresh, uk }: Props) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const [email, setEmail] = useState('');
    const [children, setChildren] = useState('0');
    const [prepared, setPrepared] = useState<{
        key: string;
        text: string;
    } | null>(null);
    const [message, setMessage] = useState('');
    const t = (en: string, ua: string) => localize(uk ? ua : en);
    const key = JSON.stringify([routeName, date, time, people, category, email, children]);
    const current = prepared?.key === key && fresh ? prepared : null;
    const childCount = Number(children);
    const valid = routeName && time && fresh && category === 'visitor' && Number.isInteger(people) && people >= 1 && people <= 100 && children !== '' && Number.isInteger(childCount) && childCount >= 0 && childCount <= people && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim().length <= 254;
    async function prepare(event: React.FormEvent) {
        event.preventDefault();
        if (!valid)
            return;
        const text = JSON.stringify({ version: 'mlc-booking-1', category, routeName, date, time, people, children: childCount, email: email.trim(), createdAt: Date.now() });
        setPrepared({ key, text });
        try {
            await navigator.clipboard.writeText(text);
            setMessage(t('Copied. Open SIMplifica in Safari and run your shortcut from Share.', 'Скопійовано. Відкрийте SIMplifica в Safari й запустіть команду через «Поділитися».'));
        }
        catch {
            setMessage(t('Select all the text below and copy it manually. This is needed when opening the local site from your phone over HTTP.', 'Виділіть увесь текст нижче й скопіюйте вручну. Це може знадобитися при відкритті локального сайту на телефоні через HTTP.'));
        }
    }
    return <section className={styles.booking}>
    <div style={{ width: '100%' }}>
      <h2>{localize(t('Fill SIMplifica on iPhone · trial', 'Заповнити SIMplifica на iPhone · пробна версія'))}</h2>
      <p>{localize(t('The Safari shortcut fills email, adult/child counts and the route. Select the date and time in the official calendar; review declarations and payment yourself.', 'Команда Safari заповнює email, кількість дорослих і дітей та маршрут. Дату й час оберіть в офіційному календарі; підтвердження умов і оплату перевірте самостійно.'))}</p>
      <p><Link href="/trail-booking-iphone">{localize(t('One-time iPhone setup →', 'Одноразове налаштування iPhone →'))}</Link></p>
      {localize(routeName && time ? <pre className={styles.bookingSummary}>{localize(routeName)}{localize('\n')}{localize(date)}{localize(" \u00B7 ")}{localize(time)}{localize(" \u00B7 Madeira")}{localize('\n')}{localize(people)} {localize(t('people · not booked', 'людей · ще не заброньовано'))}</pre> : <p>{localize(t('Select a time slot above first.', 'Спочатку оберіть тайм-слот вище.'))}</p>)}
      {localize(category !== 'visitor' ? <p>{localize(t('This trial supports non-resident visitors only.', 'Пробна версія підтримує лише відвідувачів-нерезидентів.'))}</p> : <form onSubmit={prepare}>
        <div className={styles.fields} style={{ marginTop: 16 }}>
          <label style={{ gridColumn: '1 / -1' }}>{localize("Email")}<input type="email" autoComplete="email" inputMode="email" maxLength={254} value={email} onChange={e => { setEmail(e.target.value); setMessage(''); }} required/></label>
          <label>{localize(t('Children aged 12 or under', 'Дітей до 12 років включно'))}<input type="number" min="0" max={people} step="1" value={children} onChange={e => { setChildren(e.target.value); setMessage(''); }} required/></label>
          <p>{localize(t('Visitors older than 12:', 'Відвідувачів старше 12 років:'))} {localize(Number.isInteger(childCount) && childCount >= 0 && childCount <= people ? people - childCount : '—')}</p>
        </div>
        <p>{localize(t('Email is not stored on our server. Copied details stay in your clipboard and expire after 30 minutes. Exemptions are not selected automatically.', 'Email не зберігається на нашому сервері. Скопійовані дані залишаються в буфері обміну й діють 30 хвилин. Пільги автоматично не обираються.'))}</p>
        {localize(time && !fresh && <p role="status">{localize(t('Refresh availability before copying.', 'Оновіть доступність перед копіюванням.'))}</p>)}
        <button type="submit" className={styles.primary} disabled={!valid}>{localize(t('1. Copy for iPhone', '1. Копіювати для iPhone'))}</button>
      </form>)}
      {localize(current && <><p role="status">{localize(message)}</p><details><summary>{localize(t('Data for manual copying', 'Дані для ручного копіювання'))}</summary><textarea aria-label={localize(t('Booking data', 'Дані бронювання'))} readOnly value={current.text} onFocus={e => e.target.select()} style={{ width: '100%', minHeight: 120, marginTop: 12, padding: 12 }}/></details></>)}
      <p><a className={styles.secondary} href={`${BOOKING_URL}/start`} target="_blank" rel="noopener noreferrer">{localize(t('2. Open SIMplifica ↗', '2. Відкрити SIMplifica ↗'))}</a></p>
    </div>
  </section>;
}
