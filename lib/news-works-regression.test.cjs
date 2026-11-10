// Regression fixtures: scheduled multi-month works remain active after their START dates.
require('./news-lifecycle.test.cjs');
const assert=require('node:assert/strict');
const {classifyNews,noticeDay}=require('./newsLifecycle.ts');
const seed=require('../data/operational-news-seed.json');
for(const id of ['ifcn-981','ifcn-999']) {
 const source={...seed.articles.find(a=>a.id===id),checkedAt:'2026-11-10T12:00:00Z',stale:false};
 assert.equal(noticeDay(source),null,id);
 assert.equal(classifyNews([source],Date.parse('2026-11-10T13:00:00Z'))[0].newsState,'current',id);
}
console.log('PASS: actual IFCN 60-day and 270-day works are not expired by start dates.');
