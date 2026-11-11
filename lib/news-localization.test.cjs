require('./operational-news.test.cjs');
const assert=require('node:assert/strict');
const {localizeNews}=require('./siteNews.ts');
const {supportedLocales}=require('./i18n/config.ts');
const {indexableLocales,defaultPageLocale}=require('./i18n/coverage.ts');
const {translationKey,translateNewsText}=require('./newsTranslation.ts');
const {newsText}=require('./i18n/newsText.ts');
const fee=require('../data/trail-policy-seed.json').articles[0];
const originalFetch=global.fetch;
global.fetch=async()=>{throw Error('Offline test')};
(async()=>{
 assert.notEqual(translationKey('old notice','pt'),translationKey('new notice','pt'));
 assert.deepEqual(indexableLocales('/news'),supportedLocales);
 assert.deepEqual(indexableLocales('/news/'+fee.id),supportedLocales);
 assert.equal(defaultPageLocale('/news'),'en');
 assert.deepEqual(indexableLocales('/car-rental'),['uk']);
 for(const locale of supportedLocales){
  const article=await localizeNews({...fee,newsState:'current'},true,locale);
  assert.equal(article.contentLanguage,locale);
  assert.equal(article.sourceUrl,fee.sourceUrl);
  assert.match(article.paragraphs.join(' '),/2027/);
  assert.match(article.paragraphs.join(' '),/7[.,]50/);
  assert.match(article.paragraphs.join(' '),/15/);
  assert.match(article.paragraphs.join(' '),/18/);
  assert.ok(newsText(locale).categories.trails);
  assert.ok(newsText(locale).archive);
 }
 assert.equal(await translateNewsText('unique test notice with no bundled translation xyz654','pt','de'),null);
 console.log('PASS: all 7 news locales, complete fee content offline, source identity, price/date preservation, SEO coverage and honest unavailable-translation fallback');
})().finally(()=>{global.fetch=originalFetch}).catch(e=>{console.error(e);process.exitCode=1});
