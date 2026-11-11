require('./operational-news.test.cjs');
const assert=require('node:assert/strict');
const {newsReadingBlocks,readingParagraphs}=require('./newsReading.ts');
const {editorialNews}=require('./newsEditorial.ts');
const sample=require('../data/civil-protection-uk.json')['2157'].paragraphs;
const blocks=newsReadingBlocks(sample);
assert.equal(blocks.filter(b=>b.kind==='heading').length,3);
const lists=blocks.filter(b=>b.kind==='list');
assert.equal(lists.length,2);assert.equal(lists[0].items.length,7);assert.equal(lists[1].items.length,14);
const flatten=bs=>bs.flatMap(b=>b.kind==='list'?b.items:[b.text]).join(' ').replace(/\s+/g,' ').trim();
assert.equal(flatten(blocks),sample.join(' '),'Formatting must preserve every fact and qualification');
const long='A complete sentence with important information. '.repeat(30).trim();
assert.ok(readingParagraphs(long).length>1);assert.equal(readingParagraphs(long).join(' '),long);
assert.equal(newsReadingBlocks(['PR 1.2 remains closed.'])[0].kind,'paragraph');
assert.equal(newsReadingBlocks(['1. First step','2. Second step'])[0].ordered,true);
assert.equal(newsReadingBlocks(['First item; second item; third item.'])[0].kind,'list');
const radar=require('../data/trail-policy-seed.json').articles.find(a=>a.id==='rtp-3efe3c48a8d0');
for(const locale of ['en','pt','de','fr','es','pl','uk']){
 const article=editorialNews(radar,locale,true);assert.ok(article);assert.equal(article.contentLanguage,locale);assert.equal(article.additionalSources.length,1);assert.ok(article.paragraphs.join(' ').includes('2027'));
 const content=newsReadingBlocks(article.paragraphs);assert.equal(content.filter(b=>b.kind==='heading').length,3);assert.equal(content.find(b=>b.kind==='list').items.length,3);
 assert.equal(editorialNews(radar,locale,false).paragraphs.length,1);
}
assert.equal(editorialNews({...radar,title:'Changed upstream announcement'},'uk',true),null);
assert.equal(editorialNews({...radar,id:radar.id+'-v-123456789abc'},'uk',true),null);
console.log('PASS: real weather headings, 21 list items, lossless formatting, long paragraphs, ordered lists, seven radar editions and fingerprint invalidation.');
