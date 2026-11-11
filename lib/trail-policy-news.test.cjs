require('./operational-news.test.cjs');
const assert=require('node:assert/strict');
const {allowedTrailPolicyUrl,policyTopic,policyCategories,discoverTrailPolicies,parseTrailPolicy}=require('./trailPolicyNews.ts');
const seeds=require('../data/trail-policy-seed.json').articles;
const seed=seeds[0],radar=seeds.find(a=>a.id==='rtp-3efe3c48a8d0');
assert.ok(radar);
assert.equal(allowedTrailPolicyUrl(seed.sourceUrl),true);
for(const url of ['http://madeira.rtp.pt/sociedade/taxas/','https://madeira.rtp.pt.evil.example/sociedade/taxas/','https://madeira.rtp.pt/sociedade/taxas/?url=evil','https://user@madeira.rtp.pt/sociedade/taxas/']) assert.equal(allowedTrailPolicyUrl(url),false);
assert.deepEqual(policyCategories('Novas regras de reserva nos percursos pedestres'),['trails']);
for(const title of [radar.title,'Trânsito condicionado na ER101 devido a obras','Estrada encerrada após derrocada','Circulação restabelecida na via rápida','Novas regras para os transportes públicos','Alteração dos horários dos autocarros','Novos limites de velocidade na Via Expresso']) assert.deepEqual(policyCategories(title),['roads'],title);
for(const title of ['Taxas de aeroporto','Percursos fechados devido a chuva','Novo radar meteorológico no Porto Santo','Exposição de automóveis antigos','Campeonato de velocidade de atletismo','Governo reúne com sindicato dos transportes']) assert.equal(policyTopic(title),false,title);
for(const item of seeds){
 const day=item.publishedAt.slice(8);
 const html=`<h1 class="main-article-title">${item.title}</h1><p class="main-article-lead">${item.paragraphs[0]}</p><span class="main-article-date-info float-right">${day} nov, 2026, 14:02</span><div class="article-content">Do not copy the body</div>`;
 assert.deepEqual(parseTrailPolicy(html,item.sourceUrl,item.checkedAt),item);
 assert.throws(()=>parseTrailPolicy('<h1>Changed layout</h1>',item.sourceUrl,item.checkedAt));
 assert.throws(()=>parseTrailPolicy(html.replace(`${day} nov`,'31 fev'),item.sourceUrl,item.checkedAt));
}
assert.deepEqual(discoverTrailPolicies(`<a href="${seed.sourceUrl}">${seed.title}</a><a href="${radar.sourceUrl}">${radar.title}</a><a href="${radar.sourceUrl}">duplicate</a><a href="https://evil.example/sociedade/radares-via-rapida/">radares via rápida</a>`),[seed.sourceUrl,radar.sourceUrl]);
console.log('PASS: trail and road policy matching, irrelevant-topic rejection, categories, URL allowlist, deduplication and lead-only parsing.');
