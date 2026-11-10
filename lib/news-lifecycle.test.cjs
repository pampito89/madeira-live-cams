const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText,f);
const {classifyNews,mergeNewsLedger,noticeDay}=require('./newsLifecycle.ts');
const now=Date.parse('2026-11-10T12:00:00Z');
const base={id:'ifcn-1',title:'Encerramento PR10',paragraphs:['O percurso PR10 está encerrado.'],sourceUrl:'https://ifcn.madeira.gov.pt/pt/?view=article&id=1&catid=146',sourceName:'IFCN',publishedAt:'2026-11-01',checkedAt:'2026-11-10T10:00:00Z',stale:false,categories:['trails'],location:'PR10',period:null};
const reopen={...base,id:'ifcn-2',title:'Reabertura PR10',paragraphs:['O percurso PR10 foi reaberto.'],publishedAt:'2026-11-09'};
const state=(items,id=base.id)=>classifyNews(items,now).find(a=>a.id===id);
assert.equal(state([base,reopen]).newsState,'archived');
assert.equal(state([base,reopen]).replacementId,'ifcn-2');
for(const changed of [
{title:'Reabertura PR11',paragraphs:['O percurso PR11 foi reaberto.']},
{title:'Reabertura parcial PR10'},
{paragraphs:['O percurso será reaberto amanhã.']},
{paragraphs:['O percurso não foi reaberto.']},
{publishedAt:'2026-10-01'},
{publishedAt:'2026-11-11'},
{stale:true},
{sourceUrl:'https://www.madeira.gov.pt/elsewhere'},
]) assert.equal(state([base,{...reopen,...changed}]).newsState,'current',JSON.stringify(changed));
assert.equal(state([{...base,publishedAt:null},reopen]).newsState,'current','Unknown chronology must not imply reopening');
const road={...base,title:'Encerramento ER101',paragraphs:['Encerrado entre Funchal e Camacha.']};
assert.equal(state([road,{...reopen,title:'Reabertura ER101',paragraphs:['Foi reaberto entre Funchal e Machico.']}]).newsState,'current');
assert.equal(state([road,{...reopen,title:'Reabertura ER101',paragraphs:['Foi reaberto entre Funchal e Camacha.']}]).newsState,'archived');
const event={...base,paragraphs:['Encerrado no dia 8 de novembro de 2026.']};
assert.equal(state([event]).newsState,'archived');
assert.equal(classifyNews([event],Date.parse('2026-11-08T23:59:00Z'))[0].newsState,'current');
assert.equal(state([{...base,paragraphs:['Obras a partir do dia 8 de outubro de 2026, prazo de 30 dias.']}]).newsState,'current','Planned work duration cannot imply reopening');
assert.equal(noticeDay({...base,paragraphs:['Encerrado no dia 32 de novembro de 2026.']}),null);
assert.equal(state([{...base,stale:true}]).newsState,'unverified');
const oldGeneral={...base,id:'2155',title:'Formação regional',publishedAt:'2026-08-01'};
assert.equal(state([oldGeneral],oldGeneral.id).newsState,'archived');
const ledger=mergeNewsLedger({latest:[base],revisions:[]},[{...base,paragraphs:['O percurso foi reaberto.']}]);
assert.equal(ledger.revisions.length,1);assert.equal(ledger.revisions[0].replacementId,base.id);assert.deepEqual(ledger.revisions[0].paragraphs,base.paragraphs);
assert.equal(mergeNewsLedger(ledger,ledger.latest).revisions.length,1,'Idempotent revision merge');
assert.equal(mergeNewsLedger(ledger,[{...base,stale:true}]).latest[0].paragraphs[0],'O percurso foi reaberto.','No stale rollback');
assert.equal(mergeNewsLedger({latest:[base],revisions:[]},[]).latest[0].stale,true,'Missing entry is unverified, not resolved');
const news=require('./civilProtectionNews.ts').parseNewsFeed(fs.readFileSync('data/civil-protection-feed.xml','utf8'));
const warning={...base,...news.find(a=>a.id==='2157')};
assert.equal(state([warning],'2157').newsState,'archived');
assert.equal(state([{...warning,paragraphs:['Changed official warning']}],'2157').newsState,'current','Expiry rule invalidates when source changes');
console.log('PASS: expiry, Madeira date boundary, exact reopening, partial/planned/undated rejection, stale handling, immutable revisions, deduplication, curated expiry invalidation.');
