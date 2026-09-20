import test from 'node:test';
import assert from 'node:assert/strict';
import {nextStep,roll,eras} from '../src/engine.js';
import {createJourney,nextJourneyStep,applyJourneyRoll,applyJourneyChoice,eventPool,saveDocument,loadDocument} from '../src/journey.js';
import {SAGAS,SAGA_BY_ID,EFFECTS,sagaPool,sagaStatus,sagaOptions} from '../src/sagas.js';
import {CANON,canonPool,shapeEvents} from '../src/story.js';
import {WORLD_LOCATIONS} from '../src/world-map.js';
import {renderSagaJournal} from '../src/saga-view.js';
import {readFileSync} from 'node:fs';

function origin(era='New World opening'){
 const h=[],chosen={era,race:'Human',age:'24',faction:'Pirate',crewMode:'Go solo',haki:'No',devilFruit:'No'};
 while(nextStep(h)){const s=nextStep(h),r=roll(h,()=>.35);if(chosen[s.id]!==undefined)r.value=chosen[s.id];h.push(r);}return h;
}
function start(s){const h=origin(eras[s.eras.at(-1)]),j=createJourney(h);const loc=WORLD_LOCATIONS.find(l=>s.places.includes(l.n))||WORLD_LOCATIONS.find(l=>l.n==='Foosha Village');applyJourneyRoll(j,loc.id);return {h,j};}
function pick(j,key,value){while(nextJourneyStep(j)?.kind==='choice'&&nextJourneyStep(j)?.key!==key){const step=nextJourneyStep(j);applyJourneyChoice(j,step.options.find(o=>o.value==='balanced')?.value||step.options[0].value);}assert.equal(nextJourneyStep(j)?.key,key);applyJourneyRoll(j,value);}
function paths(s,node='opening',prefix=[]){return s.nodes[node].edges.flatMap(e=>e.next?paths(s,e.next,[...prefix,e.id]):[[...prefix,e.id]]);}

test('all authored graph nodes, actors, effects and locations resolve; every path terminates',()=>{
 assert.equal(SAGAS.length,18);assert.equal(new Set(SAGAS.map(s=>s.id)).size,SAGAS.length);
 for(const s of SAGAS){for(const n of s.places)assert(WORLD_LOCATIONS.some(l=>l.n===n),n);for(const id of s.cast)assert(CANON.some(c=>c.id===id),id);
 const reached=new Set();function walk(id,ancestors=[]){assert(!ancestors.includes(id),'Cycle');reached.add(id);const n=s.nodes[id];assert(n?.text);assert.equal(new Set(n.edges.map(e=>e.id)).size,n.edges.length);for(const e of n.edges){assert(EFFECTS[e.effect]);assert(e.detail);if(e.next)walk(e.next,[...ancestors,id]);}}walk('opening');assert.equal(reached.size,Object.keys(s.nodes).length);}
});

test('every saga path plays through live wheels, has finite odds, and round-trips every stage',()=>{
 const seen=new Set();let endings=0;
 for(const s of SAGAS)for(const path of paths(s)){
 const {h,j}=start(s);
 for(const value of path){
 assert(sagaPool(j).some(o=>o.value===s.id),`${s.id} unavailable`);pick(j,'event','saga');assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);
 pick(j,'sagaId',s.id);assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);
 const step=nextJourneyStep(j);assert(step.options.every(o=>Number.isFinite(o.weight)&&o.weight>0));
 seen.add(`${s.id}:${j.story.sagas?.[s.id]?.node||'opening'}:${value}`);
 const before=j.elapsedMonths;pick(j,'sagaChoice',value);assert.equal(j.elapsedMonths-before,4);assert.equal(j.pending,null);
 assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);assert(j.berries>=0);assert(j.injury>=0&&j.injury<=5);
 }
 assert(j.story.sagas[s.id].ending);assert(!sagaPool(j).some(o=>o.value===s.id));assert.match(j.log.at(-1).title,new RegExp(s.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));endings++;
 }
 assert.equal(seen.size,216);assert(endings>200);
});

test('era, exact mapped island, death and destroyed locations gate canon sagas',()=>{
 const s=SAGA_BY_ID.egghead,{j}=start(s);assert(sagaStatus(j,s).available);
 j.story.location='Foosha Village';j.story.locationId='island_foosha_village';assert(!sagaStatus(j,s).available);
 const {j:k}=start(s);k.character.era=eras[0];assert(!sagaStatus(k,s).available);k.character.era=eras[3];k.story.dead.push('vegapunk');assert(!sagaStatus(k,s).available);
 const {j:d}=start(s);d.simulation.destroyedLocations.push(...s.places);assert(!sagaStatus(d,s).available);
});

test('evidence, injuries, heat and funds visibly alter branch odds',()=>{
 const {j}=start(SAGA_BY_ID.crew_oath);const base=sagaOptions(j,'crew_oath');j.story.sagas={crew_oath:{node:'opening',evidence:3,trust:0,history:[]}};
 assert(sagaOptions(j,'crew_oath')[0].weight>base[0].weight);
 j.story.sagas.crew_oath.node='investigation';const before=sagaOptions(j,'crew_oath').find(o=>o.value==='2').weight;j.injury=4;j.story.sagaHeat=8;
 assert(sagaOptions(j,'crew_oath').find(o=>o.value==='2').weight>before);
});

test('capture hands control to prison; refuges and archives affect future ordinary wheels',()=>{
 const {j}=start(SAGA_BY_ID.crew_oath);
 for(const choice of ['0','2']){pick(j,'event','saga');pick(j,'sagaId','crew_oath');pick(j,'sagaChoice',choice);}
 assert(j.captured);assert.deepEqual(eventPool(j).map(o=>o.value),['prison','prisonBreak']);pick(j,'event','prison');pick(j,'prisonResult','released');assert(!j.captured);
 const options=[{value:'recovery',weight:1},{value:'reflection',weight:1}];const before=shapeEvents(j,options);j.story.refuges=[j.story.location];j.story.archives=['crew_oath'];const after=shapeEvents(j,options);assert(after[0].weight>before[0].weight);assert(after[1].weight>before[1].weight);
});

test('historical saves preserve exact outcomes and probabilities before expansion cutover',()=>{
 const fixtures=JSON.parse(readFileSync(new URL('./fixtures/pre-saga.json',import.meta.url)));
 for(const {doc,expected} of fixtures){const j=loadDocument(doc).journey;assert.equal(j.sagaCutover,doc.journey.rolls.length);
 const canonical=structuredClone(j);delete canonical.sagaCutover;delete canonical.developmentCutover;delete canonical.territoryCutover;delete canonical.voyageCutover;assert.deepEqual(JSON.parse(JSON.stringify(canonical)),expected);
 assert.deepEqual(loadDocument(saveDocument(doc.history,j)).journey,j);
 if(j.pending){while(j.pending){const s=nextJourneyStep(j);applyJourneyRoll(j,s.options[0].value);}}
 assert(eventPool(j).some(o=>o.value==='saga'));
 }
});

test('expansion cast is withheld during old replay and invalid cutovers are rejected',()=>{
 const {h,j}=start(SAGA_BY_ID.egghead);j.sagaCutover=100;assert(!canonPool(j,'mentor').some(o=>o.value==='vegapunk'));j.sagaCutover=0;assert(canonPool(j,'mentor').some(o=>o.value==='vegapunk'));
 for(const value of [-1,1.5,100,'0']){const doc=saveDocument(h,j);doc.journey.sagaCutover=value;assert.throws(()=>loadDocument(doc),/cutover/);}
});

test('journal exposes readable branches and escapes external character text',()=>{
 const {j}=start(SAGA_BY_ID.crew_oath);j.story.sagas={crew_oath:{node:null,history:[],ending:'<img src=x onerror=alert(1)>',completedChapter:1}};const html=renderSagaJournal(j);assert(html.includes('Explore all 18'));assert(html.includes('&lt;img'));assert(!html.includes('<img'));assert(html.includes('Canon anchor'));
});

test('expanded canon cast never duplicates abbreviated origin recruits',()=>{
 const {j}=start(SAGA_BY_ID.egghead);j.crew=[{name:'Robin',canon:true},{name:'Chopper',canon:true},{name:'Dragon',canon:true}];
 assert(!canonPool(j,'pirates').some(o=>['robin','chopper'].includes(o.value)));assert(!canonPool(j,'revolutionaries').some(o=>o.value==='dragon'));
});
