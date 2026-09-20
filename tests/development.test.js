import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {nextStep,roll,eras,probability} from '../src/engine.js';
import {createJourney,nextJourneyStep,applyJourneyRoll,applyJourneyChoice,saveDocument,loadDocument,eventPool,trainingPool,combatPower,combatOdds} from '../src/journey.js';
import {skillCap,canImprove,developmentEnabled} from '../src/development.js';
import {TECHNIQUES,techniquePool,techniqueFactor} from '../src/techniques.js';
import {CROSSROADS,campaignPool,campaignStatus,campaignOutcomes} from '../src/crossroads.js';
import {CREW_DREAMS,crewStoryPool,crewPerkFactor,hasCrewPerk} from '../src/crew-stories.js';
import {sagaOptions} from '../src/sagas.js';
import {CANON,canonPool} from '../src/story.js';
import {WORLD_LOCATIONS} from '../src/world-map.js';
import {ensureSimulation,resolveCrewTurns,crewTurnWeights,effectiveDanger} from '../src/simulation.js';
function origin(era=eras[3],overrides={}){const h=[],chosen={era,race:'Human',age:'24',faction:'Pirate',crewMode:'Go solo',haki:'No',devilFruit:'No',...overrides};while(nextStep(h)){const s=nextStep(h),r=roll(h,()=>.35);if(chosen[s.id]!==undefined)r.value=chosen[s.id];h.push(r);}return h;}
function start(place='Foosha Village',era=eras[3]){const h=origin(era),j=createJourney(h);applyJourneyRoll(j,WORLD_LOCATIONS.find(l=>l.n===place).id);return {h,j};}
function pick(j,key,value){const s=nextJourneyStep(j);assert.equal(s?.key,key);(s.kind==='choice'?applyJourneyChoice:applyJourneyRoll)(j,value);}
function max(j){for(const k of Object.keys(j.skills))j.skills[k]=skillCap(k);}
const offered=(j,event,key)=>{pick(j,'event',event);assert.equal(nextJourneyStep(j).key,key);return nextJourneyStep(j).options.map(o=>o.value);};
function campaignStage(j,id,intent,result){pick(j,'event','crossroads');pick(j,'campaign',id);pick(j,'campaignIntent',intent);pick(j,'campaignResult',result);}

test('each capped stat disappears; a completely mastered character gets no empty training events',()=>{
 const {j}=start();for(const key of Object.keys(j.skills)){j.skills[key]=skillCap(key);assert(!trainingPool(j).some(o=>o.value===key));}
 assert.equal(trainingPool(j).length,0);for(const id of ['training','mentor','spar','timeskip'])assert(!eventPool(j).some(o=>o.value===id),id);
 assert(eventPool(j).some(o=>o.value==='technique')); // Meaningful new applications remain.
 j.skills.fightingMastery--;assert(canImprove(j,'fightingMastery'));assert.deepEqual(trainingPool(j).map(o=>o.value),['fightingMastery']);
});

test('manuals, incidental practice, prison training and empty cognitive lessons leave their wheels at cap',()=>{
 for(const [event,key,missing] of [['quiet','quietResult','practice'],['celebration','quietResult','practice'],['trade','tradeResult','manual'],['treasure','treasureResult','Rare combat manual'],['reflection','lifeResult','insight'],['recovery','lifeResult','insight'],['teaching','lifeResult','insight']]){
 const {j}=start();max(j);assert(!offered(j,event,key).includes(missing),event);
 }
 const {j}=start();max(j);j.captured=true;assert(!offered(j,'prison','prisonResult').includes('train'));
 const {j:k}=start();max(k);pick(k,'event','pirates');pick(k,'opponent','luffy');pick(k,'tone','friendly');assert(!nextJourneyStep(k).options.some(o=>o.value==='lesson'));
});

test('the final training gain clamps exactly to max and removes that target',()=>{
 const {j}=start();j.skills.fightingMastery=skillCap('fightingMastery')-1;pick(j,'event','training');pick(j,'target','fightingMastery');pick(j,'trainingInstinct','Steady discipline');pick(j,'trainingResult','steady');assert.equal(j.skills.fightingMastery,260);assert(!trainingPool(j).some(o=>o.value==='fightingMastery'));assert.match(j.log.at(-1).effects.join(' '),/\+1 practice/);
});

test('choice stages cannot be rolled; choices add no time, survive reload and alter normalized combat odds',()=>{
 const {h,j}=start();pick(j,'event','pirates');pick(j,'opponent','buggy');pick(j,'tone','hostile');assert.equal(nextJourneyStep(j).kind,'choice');assert.throws(()=>applyJourneyRoll(j,'withdraw'),/Choose an intent/);
 const before=combatOdds(j,'buggy').options;pick(j,'combatIntent','withdraw');assert.equal(j.elapsedMonths,0);assert.equal(j.rolls.at(-1).kind,'choice');assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);
 const after=combatOdds(j,'buggy').options;assert(probability(after,'escape')>probability(before,'escape'));assert.throws(()=>applyJourneyChoice(j,'Steady resolve'),/fate roll/);
 pick(j,'instinct','Steady resolve');pick(j,'resolution','escape');assert.equal(j.elapsedMonths,4);assert.equal(j.log[0].rolls.filter(r=>r.kind==='choice').length,1);assert(!('chance' in j.log[0].rolls.find(r=>r.kind==='choice')));
 const doc=saveDocument(h,j);delete doc.journey.rolls.find(r=>r.kind==='choice').kind;assert.throws(()=>loadDocument(doc),/choice/);
});

test('saga intent changes consequences and capped incidental research creates legacy rather than zero practice',()=>{
 const {j}=start();max(j);pick(j,'event','saga');pick(j,'sagaId','crew_oath');const baseline=sagaOptions(j,'crew_oath');pick(j,'sagaIntent','investigate');const after=sagaOptions(j,'crew_oath');assert(after[0].weight>baseline[0].weight);assert.match(after[0].note,/Mastery shared/);pick(j,'sagaChoice','0');assert.equal(j.skills.battleIQ,140);assert.equal(j.story.legacy,1);assert(!j.log.at(-1).effects.some(x=>x.includes('+0 practice')));
});

test('all twelve techniques have real prerequisites, bounded bonuses and one-time learning',()=>{
 for(const t of TECHNIQUES){const {j}=start();assert(!techniquePool(j).some(o=>o.value===t.id));for(const [k,v] of Object.entries(t.requires))j.skills[k]=v;assert(techniquePool(j).some(o=>o.value===t.id));pick(j,'event','technique');pick(j,'technique',t.id);pick(j,'techniqueResult','learned');assert(j.story.techniques.includes(t.id));assert(!techniquePool(j).some(o=>o.value===t.id));for(const value of Object.keys(t.bonus)){assert(techniqueFactor(j,value)>1);assert(techniqueFactor(j,value)<=1.5);}}
 const {j}=start();j.skills.haki_armament=140;j.skills.fightingMastery=260;assert(!techniquePool(j).some(o=>o.value==='conqueror_coating'));
});

test('failed technique attempts improve later odds without reducing skill or learning the technique',()=>{
 const {j}=start();j.skills.battleIQ=70;j.skills.fightingMastery=30;pick(j,'event','technique');pick(j,'technique','sea_command');const before=nextJourneyStep(j).options[0].weight;pick(j,'techniqueResult','progress');pick(j,'event','technique');pick(j,'technique','sea_command');assert(nextJourneyStep(j).options[0].weight>before);assert(!j.story.techniques?.length);assert.equal(j.skills.battleIQ,70);
});

test('every campaign is geographically reachable and resolves every final outcome without resurrection',()=>{
 for(const c of CROSSROADS){assert(c.places.every(p=>WORLD_LOCATIONS.some(l=>l.n===p)));for(const id of [...c.cast,c.enemy,c.target].filter(Boolean))assert(CANON.some(x=>x.id===id));
 for(const result of ['victory','retreat','catastrophe','death']){const {h,j}=start(c.places[0],eras[c.era.at(-1)]);campaignStage(j,c.id,'careful','prepared');assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);campaignStage(j,c.id,'careful','prepared');campaignStage(j,c.id,'careful',result);assert.equal(j.story.campaigns[c.id].ending,result);assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);assert(!campaignPool(j).some(o=>o.value===c.id));
 if(result==='death')assert.equal(nextJourneyStep(j),null);
 if(result==='victory'&&c.target)assert.equal(j.story.canonFates[c.target].status,'Saved');
 if(result==='catastrophe'&&c.target){assert(j.story.dead.includes(c.target));assert(!canonPool(j,'pirates').some(o=>o.value===c.target));}
 if(result==='victory'&&!c.target)assert(j.story.territories[j.story.location]);
 }
 }
});

test('campaign commitment, detention, withdrawal and power have meaningful distinct consequences',()=>{
 const {j}=start('Marineford',eras[2]);pick(j,'event','crossroads');pick(j,'campaign','ace');assert(!nextJourneyStep(j).options.some(o=>o.value==='fund'));pick(j,'campaignIntent','bold');pick(j,'campaignResult','detained');assert(j.captured);assert.equal(j.story.campaigns.ace.stage,0);pick(j,'event','prison');pick(j,'prisonResult','released');campaignStage(j,'ace','careful','prepared');campaignStage(j,'ace','careful','prepared');pick(j,'event','crossroads');pick(j,'campaign','ace');pick(j,'campaignIntent','bold');const low=campaignOutcomes(j,10),high=campaignOutcomes(j,140);assert(probability(low,'victory')<probability(high,'victory'));assert(probability(low,'death')>probability(high,'death'));
 const {j:k}=start('Marineford',eras[2]);campaignStage(k,'ace','abandon','withdrawn');assert(!k.story.dead.includes('ace'));assert(!campaignPool(k).some(o=>o.value==='ace'));
});

test('liberation leads to territory governance, tribute, and independence at zero stability',()=>{
 const {h,j}=start('Alabasta Kingdom');for(let n=0;n<2;n++)campaignStage(j,'alabasta','careful','prepared');campaignStage(j,'alabasta','careful','victory');assert(j.story.deposed.includes('crocodile'));const name=j.story.location;
 for(let n=0;n<4;n++){pick(j,'event','territory');pick(j,'territoryIntent','tribute');pick(j,'territoryResult','success');}
 assert.equal(j.berries,80000);assert(!j.story.territories[name]);assert(!eventPool(j).some(o=>o.value==='territory'));assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);
});

test('all crew roles get three meaningful milestones and a specialty; spotlight replaces their background turn',()=>{
 for(const role of Object.keys(CREW_DREAMS)){const {j}=start();j.crew=[{name:'Mira',role,canon:false,loyalty:55,power:10,injury:0}];ensureSimulation(j);
 for(let n=0;n<3;n++){pick(j,'event','crewStory');pick(j,'crewFocus','Mira');pick(j,'crewIntent','dream');pick(j,'crewResult','progress');assert.equal(j.crew.length,1);assert.equal(j.story.crewStories.Mira.stage,n+1);}
 assert(hasCrewPerk(j,role));assert(j.story.crewStories.Mira.perk);assert.equal(j.crew[0].power,16);assert.equal(j.crew[0].loyalty,79);
 j.crew=[];assert(!hasCrewPerk(j,role));assert.equal(crewStoryPool(j).length,0);
 }
});

test('crew specialties affect their advertised wheels and disappear when their owner leaves',()=>{
 const {j}=start();j.crew=[{name:'Ada',role:'Navigator'}];j.story.crewStories={Ada:{stage:3}};assert.equal(crewPerkFactor(j,'storm','safe'),1.2);j.crew=[];assert.equal(crewPerkFactor(j,'storm','safe'),1);
});

test('pre-intent saves replay exactly and finish an already-started saga without inserting a choice',()=>{
 for(const {doc,expected} of JSON.parse(readFileSync(new URL('./fixtures/pre-intent.json',import.meta.url)))){const j=loadDocument(doc).journey;assert.equal(j.developmentCutover,doc.journey.rolls.length);const copy=structuredClone(j);delete copy.developmentCutover;delete copy.territoryCutover;delete copy.voyageCutover;assert.deepEqual(JSON.parse(JSON.stringify(copy)),expected);assert.deepEqual(loadDocument(saveDocument(doc.history,j)).journey,j);
 if(j.pending){assert.equal(nextJourneyStep(j).key,'sagaChoice');applyJourneyRoll(j,'0');}
 assert(developmentEnabled(j));pick(j,'event','saga');pick(j,'sagaId','blackchart');assert.equal(nextJourneyStep(j).kind,'choice');
 }
});

test('real recruited companions retain personal milestones and perks across every choice and reload',()=>{
 const h=origin(eras[3],{crewMode:'Form your own group',crewSize:'1',member_1_origin:'Original character',member_1_role:'Navigator'}),j=createJourney(h);applyJourneyRoll(j,WORLD_LOCATIONS.find(l=>l.n==='Foosha Village').id);const name=j.crew[0].name;
 for(let n=0;n<3;n++)for(const [key,value] of [['event','crewStory'],['crewFocus',name],['crewIntent','dream'],['crewResult','progress']]){pick(j,key,value);assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);}
 assert.equal(j.story.crewStories[name].stage,3);assert(hasCrewPerk(j,'Navigator'));
});

test('only mentors with a useful uncapped specialty can appear',()=>{
 const {j}=start('Egghead Island');j.skills.battleIQ=skillCap('battleIQ');assert(!canonPool(j,'mentor').some(o=>o.value==='vegapunk'));assert(canonPool(j,'mentor').some(o=>o.value==='zoro'));
});

test('funded campaigns charge once and survive replay at every preparation stage',()=>{
 const {h,j}=start('Marineford',eras[2]);pick(j,'event','treasure');pick(j,'treasureResult','Ancient coin');assert.equal(j.berries,50000);pick(j,'event','crossroads');pick(j,'campaign','ace');pick(j,'campaignIntent','fund');assert.equal(j.berries,50000);assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);pick(j,'campaignResult','prepared');assert.equal(j.berries,25000);assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);
});

test('a territorial campaign cannot switch islands midway to depose the wrong ruler',()=>{
 const {j}=start('Whole Cake Island');campaignStage(j,'emperor','careful','prepared');j.story.location='Wano Country';j.story.locationId=WORLD_LOCATIONS.find(l=>l.n==='Wano Country').id;assert.match(campaignStatus(j,CROSSROADS.find(c=>c.id==='emperor')),/Whole Cake/);
});

test('maxed companions do not receive useless offscreen power or loyalty growth outcomes',()=>{
 const {j}=start();const m={name:'Veteran',role:'Fighter',power:100,loyalty:100,injury:0};j.crew=[m];const values=crewTurnWeights(j,m).map(o=>o.value);assert(!values.includes('advance'));assert(!values.includes('ambition'));assert(!values.includes('bond'));assert(values.includes('duty'));
});

test('a newly awakened skill reopens useful training after all previous stats are capped',()=>{
 const {j}=start();max(j);assert.equal(trainingPool(j).length,0);pick(j,'event','haki');pick(j,'awakening','yes');pick(j,'hakiType','haki_observation');assert.deepEqual(trainingPool(j).map(o=>o.value),['haki_observation']);assert(eventPool(j).some(o=>o.value==='training'));
});

test('territory defenses reduce actual local risk, not only the displayed territory values',()=>{
 const {j}=start('Wano Country'),before=effectiveDanger(j);j.story.territories={'Wano Country':{stability:100,defenses:100,prosperity:100}};assert(effectiveDanger(j)<before);assert(effectiveDanger(j)>=0);
});

test('enemy government territory restricts pirates while neutral, allied and liberated areas remain open',()=>{
 const {j}=start('Marineford');
 const ids=()=>eventPool(j).map(o=>o.value);
 assert(ids().includes('travel'));assert(ids().includes('marines'));assert(ids().includes('treasure'));
 for(const id of ['training','trade','celebration','quiet','timeskip','recovery','recruit'])assert(!ids().includes(id),id);
 assert.match(nextJourneyStep(j).note,/Enemy territory/);
 j.story.refuges=['Marineford'];assert(ids().includes('recovery'));assert(!ids().includes('trade'));
 j.story.territories={Marineford:{stability:55,defenses:35,prosperity:35}};assert(ids().includes('training'));
 delete j.story.territories;j.character.faction='Marine';assert(ids().includes('training'));
 j.character.faction='Pirate';j.captured=true;assert.deepEqual(ids(),['prison','prisonBreak']);
 assert(eventPool(start().j).some(o=>o.value==='training'));
});

test('territory restrictions preserve old pending events and their probabilities across replay',()=>{
 const {h,j}=start('Marineford');j.territoryCutover=1000;
 pick(j,'event','training');const doc=saveDocument(h,j);delete doc.journey.territoryCutover;
 const loaded=loadDocument(doc).journey;assert.deepEqual(loaded.pending,j.pending);
 assert.deepEqual(nextJourneyStep(loaded).options,nextJourneyStep(j).options);
 const key=nextJourneyStep(loaded).options[0].value;
 pick(loaded,'target',key);pick(loaded,'trainingInstinct','Steady discipline');pick(loaded,'trainingResult','steady');
 assert(!eventPool(loaded).some(o=>o.value==='training'));
 assert.deepEqual(loadDocument(saveDocument(h,loaded)).journey,loaded);
 const bad=saveDocument(h,loaded);bad.journey.territoryCutover=-1;assert.throws(()=>loadDocument(bad),/territory cutover/);
});
