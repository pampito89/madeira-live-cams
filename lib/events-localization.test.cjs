const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText,file);
const titles=require('../data/event-title-translations.json');
const venues=require('../data/event-venue-translations.json');
const {catalogTitle,localizedVenue}=require('./events/catalog.ts');
const {localizeEvents,translatedTitle}=require('./events/translate.ts');
const locales=['en','pt','de','fr','es','pl','uk'];
(async()=>{
 for(const dictionary of [titles,venues])for(const [source,entry] of Object.entries(dictionary)){
  assert.deepEqual(Object.keys(entry).sort(),[...locales].sort(),source);
  for(const locale of locales)assert.ok(entry[locale].trim()&&entry[locale]!=='=',source+' '+locale);
 }
 let requests=0;global.fetch=async()=>{requests++;throw Error('Translation service offline');};
 const originals=Object.keys(titles).map((originalTitle,i)=>({id:'test:'+i,originalTitle,title:originalTitle,sourceLanguage:'en',translation:'source',venue:'Funchal · Machico',municipalities:['Funchal','Machico']}));
 for(const locale of locales){
  const result=await localizeEvents(originals,locale);
  assert.equal(result.length,91);
  for(const event of result){assert.equal(event.title,titles[event.originalTitle][locale]);assert.equal(event.translation,'catalog');assert.deepEqual(event.municipalities,['Funchal','Machico']);}
 }
 assert.equal(requests,0,'Known cards must never need the translation API');
 assert.equal(await translatedTitle('Концерт Дмитрия Романова','en','en',false),'Dmitry Romanov in concert','Catalogue must override incorrect source-language metadata');
 assert.equal(catalogTitle('  Waterline   exhibition  ','uk'),'Виставка Waterline');
 assert.equal(catalogTitle('Waterline exhibition NEW EDITION','uk'),null,'Changed names must not receive an unrelated translation');
 assert.equal(localizedVenue('To be announced','uk'),'Місце оголосять пізніше');
 assert.equal(localizedVenue('Funchal · Machico','uk'),'Фуншал · Машіку');
 assert.equal(localizedVenue('New Venue','uk'),'New Venue');
 assert.equal(originals[0].venue,'Funchal · Machico','Localization must not mutate cached source events');
 if(process.argv.includes('--audit')){
  const audit=JSON.parse(fs.readFileSync('backups/events-localization-audit.json','utf8').replace(/^\uFEFF/,''));
  for(const event of audit.events){assert.ok(titles[event.originalTitle],event.originalTitle);for(const part of event.venue.split(' · '))assert.ok(venues[part],part);}
 }
 console.log('PASS: 91 titles × 7 languages, reviewed venues, zero network requests, mislabeled source correction, immutable source filters.');
})().catch(error=>{console.error(error);process.exitCode=1;});
