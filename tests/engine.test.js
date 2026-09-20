import test from 'node:test';
import assert from 'node:assert/strict';
import {nextStep,weightedPick,roll,values,validateHistory,characterDocument,eras,availableCharacters} from '../src/engine.js';
import {dFamilies,fruits,crewCatalog,races,families,heritageProfile} from '../src/data.js';
function seeded(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function create(overrides={},random=seeded(123)){const h=[];while(nextStep(h)){const s=nextStep(h);let item=roll(h,random);if(overrides[s.id]!==undefined){assert(s.options.some(o=>o.value===overrides[s.id]),`Invalid forced option ${s.id}: ${overrides[s.id]}`);item={...item,value:overrides[s.id]};}h.push(item);assert(h.length<200);}return validateHistory(h);}
test('race pool is adventure-biased with substantially more non-human origins',()=>{const total=races.reduce((n,o)=>n+o.weight,0);const by=Object.fromEntries(races.map(o=>[o.value,o.weight/total*100]));assert.equal(total,10000);assert(Math.abs(by.Human-70)<1e-9);assert(Math.abs(by['Fish-man']-7)<1e-9);assert(Math.abs(by.Merfolk-5)<1e-9);assert(Math.abs(by.Mink-5)<1e-9);assert(Math.abs(by.Lunarian-.2)<1e-9);assert(Math.abs(by.Buccaneer-.15)<1e-9);assert(Math.abs(Object.entries(by).filter(([k])=>k!=='Human').reduce((n,[,v])=>n+v,0)-30)<1e-9);});
test('famous-family table raises rare lineages without flattening the distribution',()=>{const by=Object.fromEntries(families.map(o=>[o.value,o.weight]));assert(by.Gol>=6);assert(by.Monkey>by.Gol);assert(by.Shimotsuki>by.Donquixote);assert.equal(families.reduce((n,o)=>n+o.weight,0),100);});
test('heritage profiles stack race and family bonuses and expose guaranteed abilities',()=>{const p=heritageProfile({race:'Human',family:'Monkey'});assert.deepEqual(p.guaranteedHaki,['haki_observation']);assert.equal(p.bonuses.battleIQ,1);const giant=heritageProfile({race:'Giant',family:'Jaguar'});assert.equal(giant.bonuses.strength,3);assert.equal(giant.bonuses.durability,3);const vin=heritageProfile({race:'Human',family:'Vinsmoke'});assert(vin.styles.includes('Black Leg-inspired kicks'));});
test('guaranteed-Haki bloodlines force Yes for new origins',()=>{for(const family of ['Monkey','Gol','Donquixote']){const a=values(create({race:'Human',bloodline:'Yes',family}));assert.equal(a.haki,'Yes',family);}});
test('weighted boundaries and invalid pools',()=>{const p=[{value:'a',weight:9},{value:'b',weight:1}];assert.equal(weightedPick(p,()=>0).value,'a');assert.equal(weightedPick(p,()=>.899).value,'a');assert.equal(weightedPick(p,()=>.9).value,'b');assert.equal(weightedPick(p,()=>.999).value,'b');assert.throws(()=>weightedPick([]));assert.throws(()=>weightedPick([{weight:0}]));});
test('3,000 generated origins preserve branching invariants and round-trip',()=>{for(let seed=0;seed<3000;seed++){const h=create({},seeded(seed));const a=values(h);assert.equal(nextStep(h),null);assert.deepEqual(validateHistory(h),h);if(a.haki==='No'){assert(!a.hakiTypes);assert(!a.haki_armament);}if(a.devilFruit==='No')assert(!a.fruit);else assert(fruits[a.fruitType].some(f=>f.value===a.fruit));if(dFamilies.includes(a.family))assert.equal(a.willD,'Yes');if(a.faction==='Marine')assert.equal(a.bounty,'No government bounty');if(a.joinedCrew)assert(crewCatalog.some(c=>c.name===a.joinedCrew&&c.faction===a.faction&&c.eras.includes(eras.indexOf(a.era))));const weapons=Object.entries(a).filter(([k])=>/^weapon_\d+$/.test(k));assert.equal(new Set(weapons.map(([,v])=>v)).size,weapons.length);const canon=Object.entries(a).filter(([k])=>/_canon$/.test(k));assert.equal(new Set(canon.map(([,v])=>v)).size,canon.length);}});
test('three swords have three distinct weapons and three mastery spins',()=>{const a=values(create({fightingStyle:'Three-sword style',crewMode:'Go solo'}));for(let i=1;i<=3;i++){assert(a[`weapon_${i}`]);assert(a[`weaponMastery_${i}`]);}assert(!a.weapon_4);});
test('unarmed styles never produce weapon spins',()=>{const a=values(create({fightingStyle:'Brawling',crewMode:'Go solo'}));assert(!a.weapon_1);});
test('each Haki type has independent mastery',()=>{const a=values(create({haki:'Yes',hakiTypes:'Observation + Armament + Conqueror’s'}));assert(a.haki_observation&&a.haki_armament&&a.haki_conqueror);});
test('full mixed crew creates individual records with no duplicate canon characters',()=>{const a=values(create({era:eras[3],faction:'Pirate',crewMode:'Form your own group',crewSize:'12',member_1_origin:'Canon character',member_2_origin:'Canon character',member_3_origin:'Original character'}));assert.notEqual(a.member_1_canon,a.member_2_canon);assert(a.member_3_generated&&a.member_3_race&&a.member_3_role&&a.member_3_trait);for(let i=1;i<=12;i++)assert(a[`member_${i}_origin`]);});
test('era/faction filter excludes modern pirates from Roger-era Marine recruitment',()=>{const pool=availableCharacters({era:eras[0],faction:'Marine'});assert(pool.some(c=>c.value==='Garp'));assert(!pool.some(c=>['Luffy','Koby','Ace'].includes(c.value)));});
test('giant family and height conditions',()=>{const a=values(create({race:'Giant',bloodline:'Yes',family:'Jaguar'}));assert.equal(a.willD,'Yes');assert(parseInt(a.height)>=1200);});
test('save validation rejects changed, out-of-order and malicious outcomes',()=>{const h=create();assert.throws(()=>validateHistory([{...h[0],value:'<script>alert(1)</script>'}]));assert.throws(()=>validateHistory(h.slice(1)));const forged=h.map(r=>({...r,chance:999,note:'forged'}));assert.deepEqual(validateHistory(forged),h);});
test('undo returns exact previous wheel, partial save remains resumable',()=>{const h=create();const last=h.pop();assert.equal(nextStep(h).id,last.id);assert.deepEqual(validateHistory(h),h);const doc=characterDocument(h);assert.equal(doc.complete,false);assert.deepEqual(doc.journey.events,[]);});
test('sampler distribution follows weights',()=>{const r=seeded(444);const p=[{value:'a',weight:95},{value:'b',weight:5}];let b=0;for(let i=0;i<100000;i++)if(weightedPick(p,r).value==='b')b++;assert(Math.abs(b/100000-.05)<.003);});

test('sword families guarantee primary sword styles with the matching distinct weapons',()=>{
 for(const family of ['Shimotsuki','Kozuki'])for(const style of ['One-sword style','Two-sword style','Three-sword style']){
 const h=create({race:'Human',bloodline:'Yes',family,fightingStyle:style,crewMode:'Go solo'}),index=h.findIndex(r=>r.id==='fightingStyle'),s=nextStep(h.slice(0,index)),a=values(h);
 assert(s.options.every(o=>o.value.includes('sword')));assert.equal(h[index].styleRules,1);
 const count={'One-sword style':1,'Two-sword style':2,'Three-sword style':3}[style];
 for(let i=1;i<=count;i++){assert(a[`weapon_${i}`]);assert(a[`weaponMastery_${i}`]);}assert(!a[`weapon_${count+1}`]);
 const forged=structuredClone(h);forged[index].value='Brawling';assert.throws(()=>validateHistory(forged));
 }
});
test('family affinities give exactly sixty percent while preserving alternative styles',()=>{
 for(const [family,race,style] of [['Monkey','Human','Brawling'],['Jaguar','Giant','Brawling'],['Vinsmoke','Human','Black Leg-inspired kicks']]){
 const h=create({race,bloodline:'Yes',family}),index=h.findIndex(r=>r.id==='fightingStyle'),pool=nextStep(h.slice(0,index)).options,total=pool.reduce((n,o)=>n+o.weight,0);
 assert(Math.abs(pool.find(o=>o.value===style).weight/total*100-60)<1e-10);assert(pool.every(o=>o.weight>0));assert.equal(pool.length,11);
 }
});
test('old non-sword family results keep their original probability and partial origins get new style rules',()=>{
 const h=create({race:'Human',bloodline:'Yes',family:'Shimotsuki'}),index=h.findIndex(r=>r.id==='fightingStyle'),prefix=h.slice(0,index),s=nextStep(prefix,{legacyStyles:true}),o=s.options.find(o=>o.value==='Brawling');
 const old=[...prefix,{id:s.id,label:s.label,group:s.group,value:o.value,note:o.note||'',chance:o.weight/s.options.reduce((n,x)=>n+x.weight,0)*100}];
 assert.deepEqual(validateHistory(old),old);assert.equal(nextStep(old).id,'fightingMastery');
 assert(nextStep(validateHistory(prefix)).options.every(o=>o.value.includes('sword')));
 const bad=structuredClone(old);bad.at(-1).styleRules=2;assert.throws(()=>validateHistory(bad),/Unsupported/);
});
