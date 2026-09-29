/* Madeira Live Cams: local-only Safari form helper. No network requests or submission. */
(function (root) {
  'use strict';
  function validate(p, now) {
    now = now || Date.now();
    if (!p || p.version !== 'mlc-booking-1' || p.category !== 'visitor') throw new Error('Скопіюйте дані нерезидентів із нашої сторінки.');
    if (!Number.isInteger(p.people) || p.people < 1 || p.people > 100 || !Number.isInteger(p.children) || p.children < 0 || p.children > p.people) throw new Error('Некоректна кількість людей.');
    if (typeof p.email !== 'string' || p.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) throw new Error('Перевірте email.');
    if (typeof p.routeName !== 'string' || !/^(?:Porto Santo )?PR\s?\d/i.test(p.routeName) || p.routeName.length > 300) throw new Error('Некоректний маршрут.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || new Date(p.date + 'T12:00:00Z').toISOString().slice(0, 10) !== p.date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time)) throw new Error('Некоректна дата або час.');
    if (!Number.isFinite(p.createdAt) || now - p.createdAt < 0 || now - p.createdAt > 1800000) throw new Error('Дані старші за 30 хвилин. Оновіть пошук і скопіюйте їх знову.');
    return p;
  }
  function label(e) {
    return (e.getAttribute('aria-label') || Array.from(e.labels || []).map(x => x.textContent).join(' ')).replace(/[\s\u2009]+/g, ' ').replace(/\s*\*$/, '').trim();
  }
  function visible(e) { return e.getClientRects().length > 0 && !e.closest('[aria-hidden="true"]'); }
  const pause = () => new Promise(resolve => setTimeout(resolve, 100));
  async function setInput(e, value) {
    if (!e || e.disabled || e.readOnly) throw new Error('Поле недоступне для заповнення.');
    Object.getOwnPropertyDescriptor(e.ownerDocument.defaultView.HTMLInputElement.prototype, 'value').set.call(e, String(value));
    const EventType = e.ownerDocument.defaultView.Event;
    e.dispatchEvent(new EventType('input', { bubbles: true }));
    e.dispatchEvent(new EventType('change', { bubbles: true }));
    e.dispatchEvent(new EventType('blur', { bubbles: true }));
    // Let controlled inputs commit before the next field's handler reads state.
    await pause();
  }
  async function fill(p, doc, loc) {
    validate(p);
    if (loc.protocol !== 'https:' || loc.hostname !== 'simplifica.madeira.gov.pt' || !loc.pathname.startsWith('/processes/')) throw new Error('Відкрийте форму заявки SIMplifica у Safari й запустіть команду з меню «Поділитися».');
    if (!Array.from(doc.querySelectorAll('h1')).some(e => e.textContent.includes('Pagamento de Taxas para acesso aos Percursos Pedestres Classificados'))) throw new Error('Це не форма оплати пішохідних маршрутів.');
    const getInputs = () => Array.from(doc.querySelectorAll('input')).filter(visible);
    const exact = name => { const found = getInputs().filter(e => label(e) === name); return found.length === 1 ? found[0] : null; };
    const email = exact('Email'), adult = exact('Visitante (> 12 anos)'), child = exact('Visitante (<= 12 anos)');
    const summary = p.routeName + '\n' + p.date + ' · ' + p.time + ' (час Мадейри)\n' + p.people + ' людей: ' + (p.people - p.children) + ' старше 12 років + ' + p.children + ' дітей до 12 включно.';
    if (email && adult && child) {
      const others = getInputs().filter(e => /^(Residente|Pessoas com grau|Tutor legalmente)/.test(label(e)));
      if (others.some(e => Number(e.value) !== 0) || getInputs().some(e => e.type === 'checkbox' && e.checked && label(e).startsWith('Atesto, sob compromisso'))) throw new Error('У формі вже обрано резидентів або пільги. Перевірте їх вручну перед автозаповненням.');
      if ([email, adult, child].some(e => e.disabled || e.readOnly)) throw new Error('Поля зараз недоступні.');
      await setInput(email, p.email);
      await setInput(exact('Visitante (> 12 anos)'), p.people - p.children);
      await setInput(exact('Visitante (<= 12 anos)'), p.children);
      if (exact('Email')?.value !== p.email || Number(exact('Visitante (> 12 anos)')?.value) !== p.people - p.children || Number(exact('Visitante (<= 12 anos)')?.value) !== p.children) throw new Error('Форма не прийняла всі значення. Перевірте її вручну.');
      return 'Заповнено email і кількість відвідувачів.\n' + summary + '\nПрочитайте й позначте потрібні підтвердження самостійно. Після «Seguinte» запустіть цю команду ще раз для маршруту. Нічого не заброньовано.';
    }
    const route = exact('Selecionar percurso');
    if (route) {
      if (getInputs().some(e => e.name === 'reservation_date')) throw new Error('Закрийте календар і повторіть команду.\n' + summary);
      const period = exact('Período da reserva');
      if (period && period.value) throw new Error('У заявці вже вибрано час. Перевірте його вручну: ' + summary);
      await setInput(route, p.routeName);
      route.dispatchEvent(new doc.defaultView.KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
      let option;
      for (let i = 0; i < 20; i++) {
        const options = Array.from(doc.querySelectorAll('[role="option"]')).filter(e => visible(e) && e.textContent.trim() === p.routeName && e.getAttribute('aria-disabled') !== 'true');
        if (options.length === 1) { option = options[0]; break; }
        await pause();
      }
      if (!option) throw new Error('Не вдалося однозначно вибрати маршрут. Оберіть вручну: ' + summary);
      option.click();
      await pause();
      if (exact('Selecionar percurso')?.value !== p.routeName) throw new Error('Маршрут не підтверджено формою. Оберіть вручну: ' + summary);
      return 'Маршрут заповнено.\n' + summary + '\nУ «Período da reserva» виберіть цю дату й час та перевірте доступність усієї групи. Календар і підтвердження бронювання залишаються ручними.';
    }
    throw new Error('Відкрийте перший крок з email або крок «Reserva» без відкритого календаря.\n' + summary);
  }
  const api = { validate, fill };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MLCBooking = api;
})(typeof window !== 'undefined' ? window : globalThis);
