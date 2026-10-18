import { useText } from '../lib/i18n/TranslationProvider';
import { FormEvent, useRef, useState } from 'react';
import { BookingCategory, SeatEntry, TrailDay } from '../lib/trailAvailability';
import { availableSlots, calculateGroup, GroupCalculation, timeSlotLabel } from '../lib/trailBooking';
import styles from '../styles/trailAvailability.module.css';
type Props = {
    day: TrailDay;
    category: BookingCategory;
    people: number;
    split: boolean;
    gap: number;
    now: number;
    ukrainian: boolean;
    routeName: string;
};
export default function TrailGroupCalculator({ day, category, people, split, gap, now, ukrainian, routeName }: Props) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const t = (en: string, uk: string) => localize(ukrainian ? uk : en);
    const [entries, setEntries] = useState<Record<string, SeatEntry>>({});
    const [calculation, setCalculation] = useState<{
        key: string;
        value: GroupCalculation;
    } | null>(null);
    const [copyMessage, setCopyMessage] = useState('');
    const resultRef = useRef<HTMLDivElement>(null);
    const slots = availableSlots(day, category, now);
    const inputKey = JSON.stringify([day.date, day.checkedAt, category, people, split, gap, entries]);
    const current = calculation?.key === inputKey ? calculation : null;
    function calculationIsFresh(at: number) {
        if (!current || current.value.status !== 'fits')
            return false;
        const fresh = calculateGroup(day, category, entries, people, split, gap, at);
        return fresh.status === 'fits' && JSON.stringify(fresh.plans) === JSON.stringify(current.value.plans);
    }
    // Re-evaluated on the parent's clock ticks as well as immediately after input.
    const expired = current?.value.status === 'fits' && !calculationIsFresh(Date.now());
    function submit(event: FormEvent) {
        event.preventDefault();
        setCalculation({ key: inputKey, value: calculateGroup(day, category, entries, people, split, gap, Date.now()) });
        setCopyMessage('');
        window.requestAnimationFrame(() => resultRef.current?.focus());
    }
    async function copyPlan(index: number) {
        if (!current || !calculationIsFresh(Date.now())) {
            setCopyMessage(t('Counts have expired. Check them and calculate again.', 'Дані застаріли. Перевірте числа та повторіть розрахунок.'));
            return;
        }
        const plan = current.value.plans[index];
        const text = localizeFormat("__VAR_0__\n__VAR_1__ \u00B7 Madeira\n__VAR_2__\n__VAR_3__", routeName, day.date, plan.map(item => `${item.start}–${item.end}: ${item.people} ${t('people', 'людей')}`).join('\n'), t('Planning only. Not booked.', 'План відвідування. Ще не заброньовано.'));
        try {
            await navigator.clipboard.writeText(text);
            setCopyMessage(t('Plan copied.', 'Розподіл скопійовано.'));
        }
        catch {
            setCopyMessage(t('Copy failed. Select and copy the result text.', 'Не вдалося скопіювати. Виділіть і скопіюйте текст результату.'));
        }
    }
    return <details className={styles.manual}>
    <summary>{localize(t('Calculate space for the group', 'Розрахувати місця для групи'))}</summary>
    <p>{localize(t('Enter the exact remaining seats you checked for each time slot, then press Calculate. For example, 8 seats at 12:00 and 6 at 12:30 can fit 14 people if splitting is allowed.', 'Введіть перевірену кількість вільних місць у тайм-слотах і натисніть «Розрахувати». Наприклад, 8 місць о 12:00 та 6 о 12:30 вистачить для 14 людей, якщо дозволено розподіл групи.'))}</p>
    <form onSubmit={submit}>
      <div className={styles.seatInputs}>{localize(slots.map(slot => {
            const key = `${slot.date}/${slot.start}`;
            return <label key={key}>{localize(slot.start)}<input type="number" min="0" max="10000" step="1" placeholder={localize("\u2014")} aria-label={localize(`${t('Remaining seats at', 'Вільних місць о')} ${slot.start}`)} value={entries[key]?.seats ?? ''} onChange={event => {
                    const raw = event.target.value, seats = Number(raw);
                    setEntries(previous => {
                        const next = { ...previous };
                        if (!raw || !Number.isInteger(seats) || seats < 0 || seats > 10000)
                            delete next[key];
                        else
                            next[key] = { seats, checkedAt: Date.now() };
                        return next;
                    });
                    setCopyMessage('');
                }}/></label>;
        }))}</div>
      <p>{localize(t('Checked counts stay on this page and are valid for five minutes. This calculation does not reserve places.', 'Перевірені числа зберігаються лише на цій сторінці та діють п’ять хвилин. Розрахунок не резервує місця.'))}</p>
      <button type="submit" className={styles.primary}>{localize(t('Calculate', 'Розрахувати'))}</button>
    </form>
    <div className={styles.plans} role="status" aria-live="polite" tabIndex={-1} ref={resultRef}>
      {localize(!current ? <p>{localize(calculation ? t('Inputs changed. Press Calculate again.', 'Дані змінено. Натисніть «Розрахувати» ще раз.') : t('The result will appear here after you press Calculate.', 'Результат з’явиться тут після натискання «Розрахувати».'))}</p> : expired ? <p>{localize(t('The checked counts have expired. Check availability and calculate again.', 'Перевірені дані застаріли. Оновіть доступність і повторіть розрахунок.'))}</p> : <>
        <h4>{localize(t('Calculation result', 'Результат розрахунку'))}</h4>
        {localize(current.value.status === 'invalid' && <p>{localize(t('Enter a group size between 1 and 100.', 'Вкажіть кількість людей від 1 до 100.'))}</p>)}
        {localize(current.value.status === 'stale' && <p>{localize(t('The availability data is stale. Check the dates again before calculating.', 'Доступність застаріла. Натисніть «Перевірити обрані дати» перед розрахунком.'))}</p>)}
        {localize(current.value.status === 'missing-counts' && <p>{localize(t('Enter at least one freshly checked seat count above, then press Calculate.', 'Введіть хоча б один щойно перевірений залишок місць вище та натисніть «Розрахувати».'))}</p>)}
        {localize(current.value.status === 'no-fit' && <><p><strong>{localize(t('No suitable allocation found.', 'Відповідного розподілу не знайдено.'))}</strong> {localize(t('Checked seats:', 'Перевірених місць:'))} {localize(current.value.checkedSeats)}{localize(". ")}{localize(t('People in the group:', 'Людей у групі:'))} {localize(people)}{localize(".")}</p><p>{localize(!split ? t('Try allowing the group to enter in separate time slots, or choose another day.', 'Дозвольте підгрупам входити в різний час або оберіть інший день.') : t('There must be enough seats within the selected gap between starts. Add checked counts or choose another day.', 'Місць має вистачати в межах вибраного проміжку між стартами. Додайте перевірені числа або оберіть інший день.'))}</p></>)}
        {localize(current.value.status === 'fits' && <><p><strong>{localize(t('Your entered counts can accommodate', 'За введеними числами можна розмістити'))} {localize(people)} {localize(t('people.', 'людей.'))}</strong></p>{localize(current.value.plans.slice(0, 6).map((plan, index) => <div className={styles.plan} key={index}><div><strong>{localize(plan.length === 1 ? t('Together', 'Усі разом') : `${plan.length} ${localize(timeSlotLabel(plan.length, ukrainian))}`)}</strong><p>{localize(plan.map(item => `${item.start} — ${item.people} ${t('people', 'людей')}`).join(' + '))}</p></div><button className={styles.secondary} type="button" onClick={() => copyPlan(index)}>{localize(t('Copy allocation', 'Копіювати розподіл'))}</button></div>))}{localize(split && <p>{localize(t('Each subgroup enters at its booked time. Separate bookings do not reserve the whole group at once.', 'Кожна підгрупа входить у свій заброньований час. Окремі бронювання не резервують усю групу одночасно.'))}</p>)}</>)}
      </>)}
      {localize(copyMessage && <p>{localize(copyMessage)}</p>)}
    </div>
  </details>;
}
