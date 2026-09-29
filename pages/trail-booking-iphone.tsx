import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import styles from '../styles/trailAvailability.module.css';

export const getStaticProps: GetStaticProps = async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const helper = await fs.readFile(path.join(process.cwd(), 'public/iphone-booking.js'), 'utf8');
  const runner = '\nconst clipboardBase64 = "BASE64_VARIABLE";\n(async () => {\n  try {\n    const bytes = Uint8Array.from(atob(clipboardBase64.replace(/\\s/g, "")), c => c.charCodeAt(0));\n    const payload = JSON.parse(new TextDecoder().decode(bytes));\n    completion(await MLCBooking.fill(payload, document, location));\n  } catch (error) { completion("Не заповнено: " + error.message); }\n})();';
  return { props: { script: helper + runner } };
};
export default function IPhoneSetup({ script }: { script: string }) {
  const [message, setMessage] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(script); setMessage('Код скопійовано.'); }
    catch { setMessage('Виділіть весь код у полі нижче й скопіюйте вручну.'); }
  }
  return <Layout><Head><title>Налаштування Safari для SIMplifica | Madeira Live Cams</title><meta name="robots" content="noindex,follow" /><meta name="description" content="Одноразове налаштування команди Safari для перенесення даних у SIMplifica." /></Head>
    <div className={`page-shell ${styles.page}`}>
      <section className={styles.hero}><h1>SIMplifica на iPhone</h1><p>Пробне автозаповнення через Safari → «Поділитися» → «Заповнити SIMplifica».</p></section>
      <section className={styles.manual}><h2>Одноразове налаштування</h2>
        <p>Це код для команди, а не готове посилання встановлення iCloud. Налаштуйте її один раз на iPhone. Фактичний запуск через «Команди» на iOS ще потребує перевірки на вашому телефоні.</p>
        <ol style={{ paddingLeft: 24, lineHeight: 1.9 }}>
          <li>Відкрийте «Команди» (Shortcuts), створіть команду «Заповнити SIMplifica».</li>
          <li>У деталях увімкніть «Показувати в меню “Поділитися”». Тип вхідних даних — «Вебсторінки Safari».</li>
          <li>Додайте дію «Отримати буфер обміну» (Get Clipboard).</li>
          <li>Додайте «Кодувати в Base64» (Base64 Encode): кодувати результат попередньої дії. Якщо є параметр переносу рядків — оберіть без переносів.</li>
          <li>Додайте «Виконати JavaScript на вебсторінці». У параметрі вебсторінки виберіть <strong>«Вхідні дані команди»</strong>, а не результат Base64.</li>
          <li>Замініть стандартний JavaScript кодом нижче. Наприкінці коду знайдіть <code>BASE64_VARIABLE</code>: видаліть лише ці слова, залиште лапки й між ними вставте <strong>змінну результату дії Base64</strong> через меню змінних «Команд».</li>
          <li>Після JavaScript додайте «Показати результат» (Show Result), щоб бачити, що заповнилося, або причину помилки.</li>
        </ol>
        <button className={styles.primary} onClick={copy}>Копіювати код команди</button><p role="status">{message}</p>
        <textarea aria-label="Код команди Safari" readOnly value={script} onFocus={e => e.target.select()} style={{ width: '100%', minHeight: 190, fontFamily: 'monospace', fontSize: 12, padding: 12 }} />
      </section>
      <section className={styles.manual}><h2>Як користуватися</h2>
        <ol style={{ paddingLeft: 24, lineHeight: 1.9 }}>
          <li>На сторінці маршрутів оберіть тайм-слот, введіть email і кількість дітей. Натисніть «Копіювати для iPhone» — це замінить код у буфері обміну даними бронювання.</li>
          <li>Відкрийте SIMplifica <strong>у Safari</strong>. На першому кроці натисніть «Поділитися» → «Заповнити SIMplifica». Підтвердьте доступ команди до цього сайту, якщо iPhone запитає.</li>
          <li>Перевірте email, кількість дорослих і дітей. Прочитайте умови та самостійно оберіть потрібні галочки. Галочка про інвалідність — окрема пільга, а не загальна згода.</li>
          <li>Після «Seguinte», на кроці «Reserva», запустіть команду ще раз — вона вибере маршрут. Дату й тайм-слот виберіть у «Período da reserva» за підказкою команди.</li>
        </ol>
        <p>Команда не натискає «Seguinte» чи «Confirmar», не створює оплату та не підтверджує наявність місць для всієї групи. Вона заповнює лише звичайних нерезидентів; резиденти й пільгові категорії оформлюються вручну.</p>
        <p>Якщо iPhone блокує запуск скриптів, перевірте параметр «Дозволити виконання скриптів» у налаштуваннях «Команд». Надавайте доступ лише після перегляду коду. Код не надсилає мережевих запитів; введені поля бачить SIMplifica.</p>
        <p>Локальна адреса localhost працює лише на комп’ютері. На iPhone потрібна адреса цього комп’ютера в тій самій Wi-Fi мережі або опублікований сайт. На локальній HTTP-адресі може знадобитися ручне копіювання.</p>
        <p><a href="https://support.apple.com/en-ie/guide/shortcuts/apd218e2187d/ios" target="_blank" rel="noopener noreferrer">Інструкція Apple щодо JavaScript у Safari</a></p>
        <p><Link href="/trail-availability">← До маршрутів</Link></p>
      </section>
    </div>
  </Layout>;
}
