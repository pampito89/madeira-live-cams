const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validate, fill } = require('../public/iphone-booking.js');
const payload = () => ({ version: 'mlc-booking-1', category: 'visitor', people: 14, children: 2, email: 'test@example.com', routeName: 'PR8 | Vereda da Ponta de São Lourenço', date: '2026-10-12', time: '12:00', createdAt: Date.now() });
test('reject unsupported categories, bad counts, invalid dates and expired clipboard data', () => {
  assert.equal(validate(payload()).people, 14);
  assert.equal(validate({ ...payload(), routeName: 'Porto Santo PR1 | V. do Pico Branco e Terra Chã' }).people, 14);
  for (const change of [{ category: 'resident' }, { people: 0 }, { people: 1.5 }, { children: 15 }, { children: -1 }, { email: 'no-email' }, { date: '2026-02-30' }, { time: '25:00' }, { createdAt: Date.now() - 1800001 }, { createdAt: Date.now() + 10000 }]) assert.throws(() => validate({ ...payload(), ...change }));
});
test('reject other destinations before reading or changing the document', async () => {
  const doc = { querySelectorAll() { throw new Error('Document should not be read'); } };
  await assert.rejects(fill(payload(), doc, { protocol: 'https:', hostname: 'evil.test', pathname: '/processes/1' }), /Safari/);
  await assert.rejects(fill(payload(), doc, { protocol: 'https:', hostname: 'simplifica.madeira.gov.pt', pathname: '/services/1' }), /Safari/);
});
