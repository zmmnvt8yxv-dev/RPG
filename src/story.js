import {CANON,PLACES,REGIONS,DREAMS} from './story-data.js';
import {eras} from './engine.js';
import {combatPower,levelOf,lifespanFor} from './journey-v1.js';
import {dangerExplanation} from './simulation.js';
import {worldLocationOf,syncWorldLocation,worldTravelPool,legacyRegionIndex,locationDescription} from './world-map.js';
export {CANON,PLACES,REGIONS,DREAMS};
export function initializeStory(j){
 if(j.story)return j;
 const era=eras.indexOf(j.character.era);const knownCrew=CANON.find(c=>c.crew===j.group);
 const region=knownCrew?knownCrew.regions[0]:era<2?1:0;
 const location=j.character.family==='Kozuki'||j.character.family==='Shimotsuki'?'Wano Country':PLACES.find(p=>p[1]===region)[0];
 j.story={location,visited:[location],dreamProgress:0,dreamClues:0,milestones:[],relationships:{},dead:[],fruitAcquiredMonth:j.character.devilFruit==='Yes'?j.elapsedMonths:null,mentored:0,legacy:0};
 syncWorldLocation(j);return j;
}
export const placeOf=j=>{const loc=worldLocationOf(j);return [loc.n,legacyRegionIndex(loc.r),locationDescription(loc)];};
export const dreamOf=j=>DREAMS[j.character.dream]||DREAMS['Protect a found family'];
export function lifeContext(j){
 const age=j.ageMonths/12,relative=age/lifespanFor(j.character.race).onset*70;
 const stage=relative<25?'Finding your feet':relative<50?'Building your name':relative<70?'A seasoned life':'The legacy years';
 const freshFruit=j.character.devilFruit==='Yes'&&levelOf(j,'fruitMastery')<2&&(j.story.fruitAcquiredMonth!==null&&j.elapsedMonths-j.story.fruitAcquiredMonth<24);
 const young=relative<25,elder=relative>=70;
 const focus=j.injury>=2?'Heal before the next voyage':freshFruit?`Learn to control ${j.character.fruit}`:j.story.dreamProgress===4?'Pass on what you have learned':elder?'Protect your legacy and finish old promises':young&&j.elapsedMonths<24?'Find your footing before the wider sea':dreamOf(j).steps[j.story.dreamProgress];
 const reasons=[];
 if(freshFruit)reasons.push('New fruit: practice and mentors are more likely; exploration is less likely.');
 if(young)reasons.push('Young adventurer: learning and preparation carry extra weight.');
 if(elder)reasons.push('Later life: knowledge, recovery, homecoming and teaching replace physical grinding.');
 if(j.injury)reasons.push('Injuries favor recovery and reduce strenuous activity.');
 reasons.push(`Your dream favors ${dreamOf(j).focus.join(', ')}.`);reasons.push(dangerExplanation(j));
 return {age,relative,stage,young,elder,freshFruit,focus,reasons};
}
const aliases={luffy:['Luffy'],zoro:['Zoro'],sanji:['Sanji'],whitebeard:['Whitebeard'],ace:['Ace'],law:['Law'],garp:['Garp']};
export function canonPool(j,event){
 const era=eras.indexOf(j.character.era),region=placeOf(j)[1],power=combatPower(j);
 const used=new Set(j.crew.filter(c=>c.canon).map(c=>c.name));
 return CANON.filter(c=>c.eras.includes(era)&&!j.story.dead.includes(c.id)&&!used.has(c.name)&&!(aliases[c.id]||[]).some(n=>used.has(n))&&c.regions.includes(region)).filter(c=>{
 if(event==='mentor')return c.mentor.length>0||c.kind==='mentor';
 if(c.crew===j.group||c.crew.split(' / ')[0]===j.group)return false;
 return event==='marines'?c.kind==='marine':event==='hunters'?c.kind==='hunter':event==='revolutionaries'?c.kind==='revolutionary':event==='duel'?['pirate','marine','hunter'].includes(c.kind):c.kind==='pirate';
 }).map(c=>{
 const bond=j.story.relationships[c.id];const mismatch=Math.max(1,c.power/Math.max(10,power));
 const dreamBias=event==='duel'&&c.id==='mihawk'&&j.character.dream==='Become the greatest swordsman'&&j.story.dreamProgress>=2?6:event==='mentor'&&j.character.dream==='Cure an incurable disease'&&['kureha','crocus'].includes(c.id)?5:1;
 const recurrence=bond?(bond.last===j.chapter ? 0.4 : bond.score<0 ? 2.5 : 1.6):1;
 return {value:c.id,label:`${c.name} · ${c.crew}`,weight:Math.max(.025,c.weight/(mismatch*mismatch)*recurrence*dreamBias),note:`${c.style}. ${c.hook}`};
 });
}
export const encounterOf=j=>CANON.find(c=>c.id===j.pending?.picks.opponent);
export function encounterTones(j,c){
 const bond=j.story.relationships[c.id]?.score||0;
 const friendlyFaction=c.kind==='marine'&&['Marine','Cipher Pol'].includes(j.character.faction)||c.kind==='revolutionary'&&j.character.faction==='Revolutionary';
 const outlaw=['Pirate','Revolutionary'].includes(j.character.faction);
 let hostility=c.kind==='marine'?(outlaw?65:8):c.kind==='hunter'?65:['cruel','scheming'].includes(c.temper)?62:20;
 hostility=Math.max(3,Math.min(95,hostility-bond*8+(j.bounty>10000000&&c.kind!=='pirate'?10:0)));
 if(friendlyFaction)hostility=Math.max(2,hostility*.2);
 return [{value:'hostile',label:bond<0?'An old grudge turns violent':'Tensions turn into a confrontation',weight:hostility,note:c.hook},
 {value:'friendly',label:bond>0?'A familiar flag offers help':'A meeting without drawn weapons',weight:100-hostility,note:friendlyFaction?'Your shared allegiance opens the conversation.':`Their ${c.temper} temperament and your history shape the meeting.`}];
}
export function encounterInstincts(j,base){
 const c=encounterOf(j),life=lifeContext(j);return base.map(o=>({...o,weight:o.weight*(o.value==='Urge to flee'&&(c?.power>combatPower(j)*1.5||j.injury>=2)?2.5:o.value==='Read the battlefield'&&life.relative>=50?2:o.value==='Protect your people'&&j.crew.length?1.8:1)}));
}
export function trainingWeights(j,base){
 const life=lifeContext(j),dream=dreamOf(j),mentor=CANON.find(c=>c.id===j.pending?.picks.mentor);
 return base.filter(o=>!(life.elder&&['strength','speed','stamina','endurance','durability'].includes(o.value))).map(o=>{
 let w=o.weight;const reasons=[];
 if(life.freshFruit&&o.value==='fruitMastery'){w*=20;reasons.push('Your new fruit needs control.');}
 if(o.value===dream.skill){w*=3;reasons.push('Serves your dream.');}
 if(life.relative>=50&&o.value==='battleIQ'){w*=3;reasons.push('Experience favors judgment.');}
 if(j.injury&&['strength','speed','endurance','stamina'].includes(o.value)){w*=.2;reasons.push('Injury limits strenuous practice.');}
 if(mentor?.mentor.some(k=>o.value===k||o.value.startsWith(k==='weapon'?'weaponMastery_':k==='haki'?'haki_':'__'))){w*=5;reasons.push(`${mentor.name} can teach this.`);}
 const previous=j.log.slice(-2).filter(e=>e.trainingTarget===o.value).length;if(previous){w*=.3**previous;reasons.push('Recent repetition reduces its pull.');}
 return {...o,weight:w,note:reasons.join(' ')||'A useful part of your existing skill set.'};
 });
}
export function shapeEvents(j,base){
 const life=lifeContext(j),dream=dreamOf(j);
 return base.filter(o=>{
 if(o.value==='betrayal')return canonPool(j,'pirates').length;
 if(o.value==='travel')return travelPool(j).length>0;
 if(['pirates','marines','hunters','duel','mentor','revolutionaries'].includes(o.value))return canonPool(j,o.value).length;
 if(o.value==='teaching')return life.relative>=45||combatPower(j)>=55;
 if(o.value==='homecoming')return j.elapsedMonths>=24;
 if(o.value==='leadership')return j.crew.length||j.groupSupport;
 return true;
 }).map(o=>{
 let w=o.weight;const why=[];const id=o.value;
 if(dream.focus.includes(id)&&j.story.dreamProgress<4){w*=1.8;why.push('Fits your dream.');}
 if(life.freshFruit){if(['training','mentor'].includes(id)){w*=4;why.push('You are learning a new fruit.');}if(['travel','island','duel'].includes(id)){w*=.35;why.push('Control comes before a bigger voyage.');}}
 if(life.young){if(['training','mentor'].includes(id)){w*=1.7;why.push('A young adventurer has much to learn.');}}
 if(life.elder){if(['training','spar','duel'].includes(id)){w*=.2;why.push('You favor experience over physical grinding.');}if(['reflection','teaching','homecoming','recovery','leadership','dream'].includes(id)){w*=2.5;why.push('Later life brings different priorities.');}}
 if(j.injury>=2){if(['recovery','quiet'].includes(id)){w*=4;why.push('Your injuries need attention.');}if(['training','spar','duel','travel'].includes(id))w*=.35;}
 const recent=j.log.slice(-4).filter(e=>e.event===id).length;if(recent){w*=.35**recent;why.push('A recent chapter covered this; variety gets more weight.');}
 if(id==='dream'&&j.story.dreamProgress===4){w*=.4;why.push('Your dream is fulfilled; this is now your legacy.');}
 return {...o,label:id==='training'&&life.freshFruit?'Get your new power under control':id==='dream'?`Pursue your dream · ${dream.theme}`:id==='reflection'&&life.elder?'Set your affairs and memories in order':o.label,weight:Math.max(.01,w),note:why.join(' ')||'A possibility along your current path.'};
 });
}
export function travelPool(j){return worldTravelPool(j);}
export function dreamReadiness(j){
 const d=dreamOf(j),p=j.story.dreamProgress;const needs=[];
 if(p>=4)return {ready:false,needs:['Your dream is already fulfilled.']};
 if(p>=1&&j.elapsedMonths<12*p)needs.push(`${p} years of lived experience`);
 if(p>=1&&j.story.visited.length<Math.min(3,p+1))needs.push(`${Math.min(3,p+1)} visited islands`);
 if(p>=2&&levelOf(j,d.skill)<2)needs.push(`practiced ${d.skill.startsWith('weapon')?'weapon mastery':d.skill==='battleIQ'?'battle judgment':'fighting mastery'}`);
 if(p===3){if(j.elapsedMonths<(d.epic?120:60))needs.push(d.epic?'10 years on this journey':'5 years on this journey');if(d.combat&&combatPower(j)<75)needs.push('a combat rating of 75');if(d.epic&&placeOf(j)[1]<2)needs.push('a voyage into the New World');}
 if(p===3&&j.character.dream==='Chart every sea'&&j.story.visited.length<8)needs.push('8 charted island visits');
 if(p===3&&j.character.dream==='Become the richest merchant'&&j.berries<1000000)needs.push('a trading fortune of 1,000,000 berries');
 if(p===3&&j.character.dream==='Build a ship that circles the world'&&j.berries<100000)needs.push('100,000 berries for the ship');
 if(p>=1&&j.character.dream==='Protect a found family'&&j.crew.length<2&&!j.groupSupport)needs.push('companions to protect');
 if(p>=2&&j.character.dream==='Cure an incurable disease'&&!['crocus','kureha'].some(id=>j.story.relationships[id]?.score>0)&&!j.crew.some(c=>c.role==='Doctor'))needs.push('a doctor’s guidance');
 if(p===3&&j.character.dream==='Become the greatest swordsman'&&!j.story.relationships.mihawk?.victories)needs.push('a victory over Dracule Mihawk');
 if(j.character.dream==='Become a Marine admiral'&&j.character.faction!=='Marine')needs.push('a Marine commission');
 if(j.character.dream==='Become the greatest swordsman'&&!Object.keys(j.skills).some(k=>k.startsWith('weaponMastery_')))needs.push('a sword fighting style');
 return {ready:!needs.length,needs};
}
export function dreamOutcomePool(j){
 const p=j.story.dreamProgress;if(p>=4)return [{value:'legacy',label:'Help another dreamer take their first step',weight:1}];
 const readiness=dreamReadiness(j);return [
 ...(j.character.dream==='Become a Marine admiral'&&j.character.faction!=='Marine'?[{value:'commission',label:'A sponsor arranges a pardon and Marine training berth',weight:5}]:[]),
 ...(j.character.dream==='Become the greatest swordsman'&&!j.character.fightingStyle.includes('sword')?[{value:'swordPath',label:'Begin a sword apprenticeship',weight:20}]:[]),
 ...(readiness.ready?[{value:'milestone',label:'A hard-earned milestone',weight:25+Math.min(20,j.story.dreamClues*3)}]:[]),
 {value:'clue',label:'A useful lead, but more work remains',weight:45},
 {value:'setback',label:'A lead collapses; you regroup',weight:20},
 {value:'sacrifice',label:'Progress demands a costly sacrifice',weight:10},
 ];
}
export function chapterPremise(j,event){
 const place=j.story.location,life=lifeContext(j),dream=dreamOf(j),previous=j.log.at(-1);
 const openings={
 training:life.freshFruit?`At ${place}, an ordinary task goes wrong when ${j.character.fruit} answers before you are ready. You stay to learn control.`:life.elder?`At ${place}, you leave brute repetition to younger hands and look for a wiser way to use what you know.`:`At ${place}, you set aside the rush of travel to practice something your dream will demand.`,
 mentor:`A name keeps coming up in conversations at ${place}: someone who might understand what you are missing.`,
 dream:`At ${place}, you return to the promise that started everything: ${j.character.dream.toLowerCase()}. The next step is to ${dream.steps[Math.min(j.story.dreamProgress,3)].toLowerCase()}.`,
 travel:`The next harbor will not come to you. You study the weather at ${place} and let the sea carry your story onward.`,
 recovery:`Your body has kept a record of the journey. At ${place}, a sheltered room and patient care finally get their turn.`,
 teaching:`Someone at ${place} recognizes the experience behind your scars and asks you to teach them.`,
 reflection:`In a quiet corner of ${place}, you sort old notes and consider the promises you still intend to keep.`,
 homecoming:`News from home reaches ${place}. A familiar name pulls at you more strongly than the next treasure.`,
 leadership:`At ${place}, your companions disagree about what comes next. They look to the example you have set.`,
 fruit:`An unusual fruit changes hands in ${place}. One discovery could force you to relearn your entire way of life.`,
 island:`An incomplete chart leads out from ${place}. What lies beyond it may be useful to ${dream.theme.toLowerCase()}.`,
 quiet:`For once, ${place} offers no immediate crisis. These months can be a life, not just a contest.`,
 world:`Newspapers arrive at ${place}. The names on the front page may change the waters you thought you understood.`,
 };
 const prefix=previous?.effects.some(e=>e.includes('Injury burden'))&&j.injury>=2?'Still carrying injuries from the last chapter, you cannot ignore your limits. ':'';
 return prefix+(openings[event]||`At ${place}, ${dream.theme.toLowerCase()} remains in the back of your mind as a new interruption finds you.`);
}
export function encounterStory(j,c){
 const bond=j.story.relationships[c.id];return `${c.hook} ${c.name} travels with ${c.crew}. ${bond?`This is meeting ${bond.meetings+1}; ${bond.score>0?'they remember your help':bond.score<0?'the last grudge has not faded':'they know your face'}.`:'You have not met before.'}`;
}
export function rememberEncounter(j,id,result){
 if(!id)return;const old=j.story.relationships[id]||{score:0,meetings:0,last:-1,victories:0};
 const changes={alliance:2,lesson:2,clue:1,part:0,offend:-2,victory:-2,lethal:-5,wounded:-2,escape:-1,spared:1,captured:-2,death:-3};
 j.story.relationships[id]={score:Math.max(-5,Math.min(5,old.score+(changes[result]||0))),meetings:old.meetings+1,last:j.chapter+1,victories:(old.victories||0)+(['victory','lethal'].includes(result)?1:0)};
 if(result==='lethal'&&!j.story.dead.includes(id))j.story.dead.push(id);
}
