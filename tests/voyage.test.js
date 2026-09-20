import test from 'node:test';
import assert from 'node:assert/strict';
import {nextStep,roll,probability} from '../src/engine.js';
import {createJourney,applyJourneyRoll,nextJourneyStep,eventPool,saveDocument,loadDocument} from '../src/journey.js';
import {worldTravelPool,resolveWorldLocation} from '../src/world-map.js';
import {islandActions} from '../src/voyage.js';
function start(name='Foosha Village'){
 const h=[];while(nextStep(h)){const s=nextStep(h),r=roll(h,()=>.35);if(s.id==='faction')r.value='Pirate';if(s.id==='age')r.value='24';h.push(r);}
 const j=createJourney(h);applyJourneyRoll(j,resolveWorldLocation(name).id);return {h,j};
}
function place(j,name){const l=resolveWorldLocation(name);j.story.location=l.n;j.story.locationId=l.id;if(!j.story.visited.includes(l.n))j.story.visited.push(l.n);}
function chapters(j,n){j.log=Array.from({length:n},()=>({event:'quiet',location:j.story.location,effects:[]}));}
test('travel becomes exactly 70/80/90/95 percent and resets only on completed travel',()=>{
 const {j}=start();for(const [n,p] of [[4,70],[5,80],[6,90],[7,95],[12,95]]){chapters(j,n);assert(Math.abs(probability(eventPool(j),'travel')-p)<1e-9);}
 chapters(j,3);assert(probability(eventPool(j),'travel')<70);
 chapters(j,4);applyJourneyRoll(j,'travel');assert.equal(islandActions(j),4);applyJourneyRoll(j,nextJourneyStep(j).options[0].value);assert.equal(islandActions(j),0);assert(probability(eventPool(j),'travel')<70);
 chapters(j,5);j.captured=true;assert(!eventPool(j).some(o=>o.value==='travel'));
});
test('hostile territory keeps exact travel pressure and destroyed destinations stay unavailable',()=>{
 const {j}=start('Marineford');chapters(j,4);assert(Math.abs(probability(eventPool(j),'travel')-70)<1e-9);
 j.simulation.destroyedLocations=worldTravelPool(j).map(o=>o.value);assert(worldTravelPool(j).every(o=>!j.simulation.destroyedLocations.includes(o.value)));
});
test('every Blue uses its own entrance, Reverse Mountain, and Twins Cape without crossing between Blues',()=>{
 for(const sea of ['East','West','North','South']){
 const {j}=start(`Reverse Mountain Entrance (${sea} Blue)`);assert.deepEqual(worldTravelPool(j).map(o=>o.value),['Reverse Mountain']);
 place(j,'Reverse Mountain');assert.deepEqual(worldTravelPool(j).map(o=>o.value),['Twins Cape']);
 place(j,'Twins Cape');const pool=worldTravelPool(j);assert(pool.some(o=>o.value==='Whisky Peak'));assert(!pool.some(o=>o.value==='Sabaody Archipelago'));
 }
});
test('Paradise reaches Sabaody, coated crossing and the New World; Lodestar is a late destination',()=>{
 const {j}=start('Twins Cape');
 for(const name of ['Whisky Peak','Little Garden','Renaisse','Nanimonai Island','Jaya','Long Ring Long Land','Shift Station','Water Seven','Thriller Bark','Flying Fish Riders Base','Sabaody Archipelago','Fish-Man Island','Raijin Island','Punk Hazard','Dressrosa Kingdom','Whole Cake Island','Wano Country','Egghead Island','Elbaph','Loadestar Island']){
 const option=worldTravelPool(j).find(o=>o.value===name);assert(option,`${j.story.location} → ${name}`);if(name==='Fish-Man Island')assert.match(option.note,/coating/);place(j,name);
 }
 const early=start('Elbaph').j;assert(!worldTravelPool(early).some(o=>o.value==='Loadestar Island'));assert(!worldTravelPool(j).some(o=>/Laugh Tale/i.test(o.value)));
});
test('travel pressure and pending old destinations replay with original probabilities',()=>{
 const {h,j}=start();for(let i=0;i<4;i++){applyJourneyRoll(j,'quiet');applyJourneyRoll(j,'rest');}
 assert.equal(islandActions(j),4);assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);
 applyJourneyRoll(j,'travel');assert.deepEqual(loadDocument(saveDocument(h,j)).journey,j);
 const old=start('Twins Cape');old.j.voyageCutover=1000;applyJourneyRoll(old.j,'travel');const before=nextJourneyStep(old.j);assert(before.options.some(o=>o.value==='Sabaody Archipelago'));
 const doc=saveDocument(old.h,old.j);delete doc.journey.voyageCutover;const loaded=loadDocument(doc).journey;assert.deepEqual(nextJourneyStep(loaded),before);
 applyJourneyRoll(loaded,'Sabaody Archipelago');assert(worldTravelPool(loaded).some(o=>o.value==='Fish-Man Island'));assert.deepEqual(loadDocument(saveDocument(old.h,loaded)).journey,loaded);
 doc.journey.voyageCutover=-1;assert.throws(()=>loadDocument(doc),/voyage cutover/);
});
