import {options,fruits,swords,firstNames,surnames} from './data.js';
import {nextStep,values,weightedPick,probability,validateHistory,characterDocument,fullName} from './engine.js';
import {JOURNEY_VERSION,LIFESPANS,XP_LEVELS,TRACKS,TRAINING_LABELS,EVENTS,EVENT_BY_ID,COMBAT_EVENTS,THREATS,INSTINCTS,WORLD_EVENTS,ROLES,TREASURES,OUTCOME_NOTES} from './journey-data.js';
import * as legacy from './journey-v1.js';
import {CANON,REGIONS,initializeStory,lifeContext,placeOf,dreamOf,dreamReadiness,dreamOutcomePool,canonPool,encounterOf,encounterTones,encounterInstincts,trainingWeights,shapeEvents,travelPool,travelRoute,chapterPremise,encounterStory,rememberEncounter} from './story.js';
import {ensureSimulation,effectiveDanger,worldEventPool,applyWorldEvent,advanceWorldTime,resolveCrewTurns,crewCombatContribution,routeDangerScore} from './simulation.js';
import {worldLocation,regionName} from './world-data.js';
export const SAVE_VERSION = 3;
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
const opt=(value,label,weight,note='')=>({value,label,weight,note});
const pool=rows=>rows.map(([value,label,weight,note])=>opt(value,label,weight,note));
const skillKeys=['fightingMastery','battleIQ','strength','durability','speed','endurance','stamina','fruitMastery','haki_observation','haki_armament','haki_conqueror','weaponMastery_1','weaponMastery_2','weaponMastery_3'];
export const lifespanFor=race=>LIFESPANS[race]||LIFESPANS.default;
export function trackFor(key){return key.startsWith('haki_')?TRACKS.haki:key.startsWith('weaponMastery_')?TRACKS.weapon:TRACKS[key]||TRACKS.stat;}
export function levelOf(j,key){const track=trackFor(key);let level=0;for(let i=0;i<track.length;i++)if(j.skills[key]>=XP_LEVELS[i])level=i;return level;}
export function skillLabel(key){return TRAINING_LABELS[key]||`Weapon ${key.split('_').at(-1)} mastery`;}
export function ageLabel(months){const years=Math.floor(months/12),rest=months%12;return `${years}y${rest?` ${rest}m`:''}`;}
export const money=n=>`฿ ${Math.floor(n).toLocaleString('en-US')}`;
export function createJourney(history){
 if(nextStep(history))throw new Error('Complete your origin before beginning the journey.');
 const character={...values(history)};const skills={};
 for(const key of skillKeys)if(character[key]!==undefined){const rank=trackFor(key).indexOf(character[key]);skills[key]=XP_LEVELS[Math.max(0,rank)];}
 const crew=[];if(character.crewMode==='Form your own group')for(let i=1;i<=Number(character.crewSize);i++)crew.push({name:character[`member_${i}_canon`]||character[`member_${i}_generated`],role:character[`member_${i}_role`]||'Canon ally',race:character[`member_${i}_race`]||'Canon',canon:character[`member_${i}_origin`]==='Canon character'});
 const j={version:JOURNEY_VERSION,character,skills,crew,group:character.joinedCrew||character.crewName||null,groupSupport:character.joinedCrew?3:0,startAgeMonths:Number(character.age)*12,ageMonths:Number(character.age)*12,elapsedMonths:0,alive:true,cause:null,chapter:0,pending:null,rolls:[],log:[],injury:0,captured:false,berries:0,bounty:Number((character.bounty||'').replace(/\D/g,''))||0,inventory:[],danger:0,wins:0,losses:0,kills:0,discoveries:0,recruits:0,peakPower:0};
 j.peakPower=combatPower(j);j.legacyCutover=0;j.legacyPending=false;j.simulationCutover=0;initializeStory(j);ensureSimulation(j);return j;
}
export function liveCharacter(j){
 const a={...j.character,age:ageLabel(j.ageMonths),bounty:j.bounty?money(j.bounty):(j.character.bounty==='No government bounty'?'No government bounty':'No bounty yet')};
 for(const key of Object.keys(j.skills))a[key]=trackFor(key)[levelOf(j,key)];
 a.haki=Object.keys(j.skills).some(k=>k.startsWith('haki_'))?'Yes':'No';
 a.hakiTypes=[['haki_observation','Observation'],['haki_armament','Armament'],['haki_conqueror','Conqueror’s']].filter(([key])=>key in j.skills).map(([,label])=>label).join(' + ');
 a.crewSize=String(j.crew.length);a.crewMode=j.groupSupport?'Join an existing group':j.crew.length?'Form your own group':'Go solo';
 return a;
}
export function combatPower(j){
 const rank=key=>key in j.skills?levelOf(j,key):0;
 let n=8+rank('fightingMastery')*5+['strength','durability','speed','endurance','stamina'].reduce((s,k)=>s+rank(k)*2,0)+rank('battleIQ')*2;
 n+=['haki_observation','haki_armament','haki_conqueror'].reduce((s,k)=>s+(k in j.skills?3+rank(k)*3:0),0);
 if(j.character.devilFruit==='Yes')n+=5+rank('fruitMastery')*3;
 n+=Object.keys(j.skills).filter(k=>k.startsWith('weaponMastery_')).reduce((s,k)=>s+1+rank(k),0);
 n+=Math.min((j.crew||[]).reduce((sum,member)=>sum+crewCombatContribution(member),0)+j.groupSupport*.8,6.4);
 n+=Math.min(j.crew.filter(c=>c.fruit).length,4)*1.5;
 for(const [key,name] of Object.entries(j.character).filter(([k])=>/^weapon_\d+$/.test(k))){const sword=swords.find(w=>w.value===name);n+=sword?(sword.weight<1?3:sword.weight<10?1:0):/Masterwork|Precision/.test(name)?2:0;}
 if(j.inventory.some(i=>i.name==='Protective armor'))n+=3;
 const life=lifespanFor(j.character.race);const agePenalty=Math.max(0,j.ageMonths/12-life.onset)/(life.limit-life.onset)*10;
 return Math.max(2,Math.round((n-j.injury*3-agePenalty)*10)/10);
}
export function normalize(pool){const total=pool.reduce((s,o)=>s+o.weight,0);return pool.map(o=>({...o,weight:o.weight/total*100}));}
// Add percentage points, NOT a multiplicative percentage. Total remains 100.
export function boostOutcome(input,value,points){
 const base=normalize(input);const target=base.find(o=>o.value===value);if(!target||base.length===1)return base;
 const after=clamp(target.weight+points,.01,99.5);const scale=(100-after)/(100-target.weight);
 return base.map(o=>({...o,weight:o.value===value?after:o.weight*scale}));
}
export function combatOdds(j,threatValue,instinct='Steady resolve'){
 const threat=CANON.find(c=>c.id===threatValue)||THREATS.find(t=>t.value===threatValue);if(!threat)throw new Error('Unknown opponent');
 const power=combatPower(j),danger=effectiveDanger(j,'combat'),enemy=threat.power+danger*2;const ratio=clamp(power/enemy,.03,5);
 const speed=levelOf(j,'speed'),iq=levelOf(j,'battleIQ');
 let base=normalize(pool([
 ['victory','Win · opponent survives',25*Math.pow(ratio,1.3),OUTCOME_NOTES.victory],
 ['lethal','Win · opponent is killed',7*Math.pow(ratio,1.2),OUTCOME_NOTES.lethal],
 ['escape','Escape',15+speed*2+iq,OUTCOME_NOTES.escape],
 ['wounded','Lose · survive injured',18/Math.sqrt(ratio),OUTCOME_NOTES.wounded],
 ['spared','Lose · spared or rescued',18/Math.sqrt(ratio),OUTCOME_NOTES.spared],
 ['captured','Lose · captured',9/Math.sqrt(ratio),OUTCOME_NOTES.captured],
 ['death','Killed in battle',Math.min(40,4/Math.pow(ratio,1.08)+danger*1.1)+j.injury*.6,OUTCOME_NOTES.death],
 ]));
 if(threat.style?.includes('Logia')&&!('haki_armament' in j.skills))base=normalize(base.map(o=>({...o,weight:['victory','lethal'].includes(o.value)?o.weight*.35:o.weight})));
 const targets={'Urge to flee':'escape','Aggressive impulse':'lethal','Protect your people':'spared','Read the battlefield':'victory'};
 const target=targets[instinct];const adjusted=target?boostOutcome(base,target,['lethal','victory'].includes(target)?7*Math.min(1,ratio):7):base;
 return {base,options:adjusted,power,enemy,modifier:target?{label:instinct,outcome:base.find(o=>o.value===target).label,before:base.find(o=>o.value===target).weight,after:adjusted.find(o=>o.value===target).weight}:null};
}
export function eventPool(j){
 if(j.captured)return pool([['prison','Months in captivity',65],['prisonBreak','An opening to escape',35]]);
 const danger=effectiveDanger(j);return shapeEvents(j,EVENTS.filter(([id])=>!(id==='provisions'&&!j.inventory.some(i=>i.type==='fruit'))&&!(id==='spar'&&!j.crew.length&&!j.groupSupport)&&!(id==='betrayal'&&!j.crew.length&&!j.groupSupport)&&!(id==='hunters'&&!j.bounty)&&!(id==='recruit'&&!companionPool(j).length)&&!(id==='haki'&&['haki_observation','haki_armament','haki_conqueror'].every(k=>k in j.skills))).map(([value,label,weight])=>opt(value,label,weight*(COMBAT_EVENTS.includes(value)?1+danger*.18:1))));
}
export function trainingPool(j){return trainingWeights(j,Object.keys(j.skills).filter(k=>j.skills[k]<XP_LEVELS[trackFor(k).length-1]).map(k=>opt(k,skillLabel(k),k.startsWith('haki_')?2:5)));}
function heldFruitNames(j){return [j.character.fruit,...j.crew.map(c=>c.fruit),...j.inventory.filter(i=>i.type==='fruit').map(i=>i.name)].filter(Boolean);}
function fruitTypes(j){const used=heldFruitNames(j);return pool([['Paramecia','Paramecia',55],['Standard Zoan','Standard Zoan',30],['Ancient Zoan','Ancient Zoan',5],['Mythical Zoan','Mythical Zoan',1],['Logia','Logia',9]]).filter(o=>fruits[o.value].some(f=>!used.includes(f.value)));}
function weaponPool(j){
 const style=j.character.fightingStyle;
 if(style.includes('sword')){const available=swords.filter(w=>!Object.values(j.character).includes(w.value)&&!j.inventory.some(i=>i.name===w.value));return available.length?available:options(['Maintain your weapons']);}
 const choices={Sniper:['Precision rifle','Reinforced slingshot','Masterwork pistol'],'Staff fighting':['Steel staff','Weather staff'],'Spear fighting':['Reinforced trident','Masterwork spear'],'Axe fighting':['Steel great axe','Balanced boarding axe']};
 return options(choices[style]||['Protective armor','Medical supplies','Rare combat manual']);
}
function companionPool(j){const used=new Set([fullName(j.character),...j.crew.map(c=>c.name)]);return firstNames.flatMap((n,i)=>surnames.map((s,k)=>({value:`${s} ${n}`,label:`${s} ${n} · ${ROLES[(i+k)%ROLES.length]}`,weight:1,note:ROLES[(i+k)%ROLES.length]}))).filter(o=>!used.has(o.value));}
export function naturalDeathChance(race,startAgeMonths,duration){
 const life=lifespanFor(race);if(startAgeMonths+duration>=life.limit*12)return 100;
 let survival=1;
 for(let m=1;m<=duration;m++){
 const progress=(startAgeMonths+m-life.onset*12)/((life.limit-life.onset)*12);
 if(progress>0)survival*=1-Math.min(.2,.00035+Math.pow(progress,3)*.11);
 }
 return (1-survival)*100;
}
export function nextJourneyStep(j){
 if(j.legacyPending)return legacy.nextJourneyStep(j);
 if(!j.alive)return null;
 const p=j.pending;const make=(key,label,opts,note='',extras={})=>({id:`${j.chapter+1}:${key}`,key,label,group:'Journey',options:opts,note,...extras});
 if(!p)return make('event','What lies on the horizon?',eventPool(j),'One event = four months. Follow-up wheels resolve that same period. Time skips state their own duration.');
 if(p.phase==='aging'){
 const risk=naturalDeathChance(j.character.race,p.startAge,p.months);
 return make('aging','Does time finally catch up?',risk>=100?options([['Death from old age',1]]):options([['Live to see another chapter',100-risk],['Death from old age',risk]]),`Age ${ageLabel(p.startAge)} → ${ageLabel(j.ageMonths)}. ${p.months} months of aging are counted, including time skips. ${j.character.race} longevity is a game estimate, not a canon statistic.`);
 }
 const a=p.picks,event=p.event;
 const need=(key,label,opts,note='',extras={})=>a[key]===undefined?make(key,label,opts,note,extras):null;
 let s;
 if(COMBAT_EVENTS.includes(event)){
 if(event==='betrayal'){
 if(s=need('opponent','Which danger exploits the betrayal?',canonPool(j,'pirates'),'An actual pirate crew takes advantage of division among your allies.'))return s;
 }else if(s=need('opponent','Whose flag breaks the horizon?',canonPool(j,event),`You are near ${j.story.location}. Starting-era eligibility, nearby seas, your power and past meetings shape the cast.`))return s;
 const c=encounterOf(j);
 if(event!=='betrayal'&&(s=need('tone',`How does ${c.name} receive you?`,encounterTones(j,c),encounterStory(j,c))))return s;
 if(a.tone==='friendly')return make('socialResult',`A meeting with ${c.name}`,pool([
 ['alliance','Part with a promise of mutual help',25],['lesson','Learn from their experience',25],['clue','Receive a lead toward your dream',25],['part','Share provisions and part peacefully',20],['offend','An argument leaves a grudge',5],
 ]),`${c.name} · ${c.crew}. No fight has started; this one resolution decides what the meeting leaves behind.`);
 if(s=need('instinct','What instinct takes hold?',encounterInstincts(j,INSTINCTS),`Facing ${c.name} and ${c.crew}, your condition and experience shape your automatic response.`))return s;
 const odds=combatOdds(j,a.opponent,a.instinct);
 return make('resolution',`${c.name}: one encounter, one outcome`,odds.options,`${c.crew} · ${c.style}. Your rating ${odds.power} vs ${odds.enemy}. ${c.style.includes('Logia')&&!('haki_armament' in j.skills)?'Without Armament, hitting a Logia is harder. ':''}Attacking impulses cannot erase a huge power gap.`,{baseOptions:odds.base,modifier:odds.modifier});
 }
 if(event==='travel'){
  if(s=need('destination','Where does the map let you go?',travelPool(j),'Authored QGIS routes are used where available. Blue Sea and New World gaps use nearby mapped coordinates without crossing regions.'))return s;
  const route=travelRoute(j,a.destination),dest=worldLocation(a.destination);
  if(!route||!dest)return make('travelResult','The route disappears from the chart',options([['abort','Remain where you are',1]]),'World changes can invalidate a route before departure.');
  const danger=routeDangerScore(route,j.character.faction),canSwim=j.character.devilFruit!=='Yes',allies=j.crew.length+j.groupSupport;
  const death=(.5+danger*.7+(canSwim?0:1.2))/(1+Math.min(allies,6)*.15);
  return make('travelResult',`Crossing to ${dest.name}`,pool([
   ['safe','A clean passage',62-danger*4],
   ['rough','Rough seas, but you make port',20+danger*2],
   ['delay','Currents and trouble delay the voyage',12+danger],
   ['injured','The crossing leaves you injured',4+danger*1.2],
   ['death','The route claims your life',death],
  ]),`${regionName(dest)} · ${route.type.replaceAll('_',' ')} · about ${Math.max(1,Math.round(route.days||1))} day${Math.round(route.days||1)===1?'':'s'} · route danger ${danger}/5.`);
 }
 if(event==='dream'){
 const d=dreamOf(j),r=dreamReadiness(j);
 return make('dreamResult',j.story.dreamProgress>=4?'A fulfilled dream can still change lives':d.steps[j.story.dreamProgress],dreamOutcomePool(j),r.ready?'Your experience has put this milestone within reach. Fate decides whether the work pays off.':`Still needed: ${r.needs.join('; ')}. A useful lead can be found while you prepare.`);
 }
 if(event==='recovery')return make('lifeResult','What does time to heal give you?',pool([['healed','Rest and care restore you',70],['insight','Gentle practice teaches you a better way',20],['slow','Recovery takes longer than hoped',10]]));
 if(event==='reflection')return make('lifeResult','What becomes clear in the quiet?',pool([['insight','An old mistake becomes a useful lesson',40],['lead','Your notes reveal a forgotten lead',35],['rest','You make peace with a difficult memory',25]]));
 if(event==='teaching')return make('lifeResult','What do you leave with your student?',pool([['student','A student carries your teaching forward',60],['insight','Teaching reveals a gap in your own understanding',25],['lead','Your student brings news of your dream',15]]));
 if(event==='homecoming')return make('lifeResult','What waits when you answer the call?',pool([['home','A reunion gives you a place to return to',55],['lead','Someone remembers the person you used to be',30],['farewell','A farewell changes what matters to you',15]]));
 if(event==='leadership')return make('lifeResult','What does your example inspire?',pool([['trust','Your companions find common purpose',60],['insight','You learn to listen before giving orders',25],['friction','Disagreement slows your plans',15]]));
 if(['training','mentor','spar','timeskip'].includes(event)){
 if(event==='mentor'&&(s=need('mentor','Who is willing to teach you?',canonPool(j,'mentor'),'A named teacher’s expertise changes the training-target odds.')))return s;
 if(event==='timeskip'&&(s=need('duration','How many years pass?',pool([['12','One year',45],['24','Two years',35],['60','Five years',15],['120','Ten years',5]]),'This duration replaces the usual four months; follow-up training does not add more time.')))return s;
 const targets=trainingPool(j);
 if(!targets.length)return make('trainingResult','A master’s quiet discipline',options([['Maintain your mastery',1]]),'Every available skill has reached its current cap. Time still advances.');
 if(s=need('target',event==='spar'?'What does sparring sharpen?':'What develops during this chapter?',targets,'Progress builds toward the next rank; mastery never resets or decreases from training.'))return s;
 if(s=need('trainingInstinct','What carries you through?',options([['Steady discipline',65],['Sudden inspiration',20],['Restless distraction',15]]),'An automatic impulse changes the next training wheel.'))return s;
 const life=lifeContext(j);
 const base=pool([['steady','Steady progress',life.freshFruit?65:55],['breakthrough','A breakthrough',life.young?20:life.elder?7:15],['stalled','No progress',25],['strain','Training injury',life.elder?2:j.injury?10:5]]);
 const baseNorm=normalize(base);const target=a.trainingInstinct==='Sudden inspiration'?'breakthrough':a.trainingInstinct==='Restless distraction'?'stalled':null;
 const adjusted=target?boostOutcome(base,target,7):baseNorm;
 return make('trainingResult',event==='spar'?'What comes of the spar?':'Does your effort pay off?',adjusted,'One resolution determines the gain or setback. Practice accumulates into permanent skill ranks.',{baseOptions:baseNorm,modifier:target?{label:a.trainingInstinct,outcome:base.find(o=>o.value===target).label,before:baseNorm.find(o=>o.value===target).weight,after:adjusted.find(o=>o.value===target).weight}:null});
 }
 if(event==='fruit'||event==='provisions'){
 if(event==='provisions'){if(s=need('storedFruit','Which stored fruit returns to your story?',options(j.inventory.filter(i=>i.type==='fruit').map(i=>i.name))))return s;}
 else {
 const types=fruitTypes(j);if(!types.length)return make('fruitOutcome','An empty grove',options([['Nothing new remains',1]]));
 if(s=need('fruitType','What class of fruit did you find?',types))return s;
 if(s=need('fruitName','What fruit is it?',fruits[a.fruitType].filter(f=>!heldFruitNames(j).includes(f.value)),'Your alternate timeline allows different owners. A fruit already held by you cannot be found again.'))return s;
 }
 return make('fruitOutcome','What becomes of your discovery?',pool([
 ...(j.character.devilFruit!=='Yes'?[['eat','Fate leads you to eat it',60]]:[]),
 ['store','Keep it in your inventory',25],['sell','Sell the fruit',15],['lost','Lose it before returning',5],
 ...((j.crew.length||j.groupSupport)?[['gift','An ally receives the fruit',10]]:[]),
 ]),j.character.devilFruit==='Yes'?'You already have a fruit. Eating a second one is excluded; fate decides another use.':'Eating grants the fruit at starting mastery and removes your ability to swim.');
 }
 if(event==='haki'){
 const missing=pool([['haki_observation','Observation Haki',55],['haki_armament','Armament Haki',44.8],['haki_conqueror','Conqueror’s Haki',.2]]).filter(o=>!(o.value in j.skills));
 const awakeningChance=.08*missing.reduce((sum,o)=>sum+o.weight,0);
 if(s=need('awakening','Does your will awaken?',pool([['yes','A new power awakens',awakeningChance],['no','Your resolve holds, but no awakening',100-awakeningChance]]),'Only missing types contribute to this chance. Conqueror’s remains rare even when you already have the other two types.'))return s;
 if(a.awakening==='yes')return make('hakiType','Which power answers?',missing,'Only unawakened types are eligible. Already-held types grow through training.');
 }
 if(event==='world')return make('worldResult','The world changes around you.',worldEventPool(j,WORLD_EVENTS),'World stability, government control, laws, executions and island-scale disasters can permanently reshape later wheels.');
 if(event==='treasure')return make('treasureResult','What was hidden away?',TREASURES,'Valuables bring berries; equipment and supplies can affect survival and growth.');
 if(event==='weapon')return make('weaponResult','What waits in the cache?',weaponPool(j),'A compatible weapon replaces your least-practiced weapon slot. Existing style training is retained; the new weapon begins at novice mastery. Unarmed fighters find equipment instead.');
 if(event==='recruit'){
 if(s=need('recruitResult','Does this stranger sail with you?',pool([['join','A new companion joins',60],['part','You part as friends',30],['scam','A stranger steals your berries',10]])))return s;
 if(a.recruitResult==='join')return make('recruitName','Who joins your story?',companionPool(j),'New journey recruits are original characters. Their support contributes to your combat odds.');
 }
 if(event==='quiet'||event==='celebration')return make('quietResult',event==='quiet'?'How do the quiet months pass?':'How does the celebration end?',pool([['rest','Rest and recovery',60],['work','Honest work pays',25],['practice','Light practice',15]]));
 if(event==='trade')return make('tradeResult','Does fortune favor the deal?',pool([['profit','A profitable deal',45],['manual','Trade for a combat manual',15],['medicine','Trade for medical supplies',20],['loss','A bad bargain',20]]));
 if(event==='island')return make('islandResult','What does the island hold?',pool([['discovery','A remarkable discovery',40],['shelter','Safe harbor',30],['treasure','An abandoned treasure',22],['injury','A dangerous expedition',7+effectiveDanger(j)*.35],['death','The island claims your life',1+effectiveDanger(j)*.35]]));
 if(event==='rescue')return make('rescueResult','Can you save them?',pool([['saved','Everyone makes it out',45+combatPower(j)/2],['hurt','You save them, but are hurt',25+effectiveDanger(j)*.3],['failed','You survive; the rescue fails',20],['death','You die attempting the rescue',2+effectiveDanger(j)*.45]]),'Your capabilities increase the chance of a safe rescue; unstable waters make intervention more lethal.');
 if(event==='storm'||event==='shipwreck'){
 const canSwim=j.character.devilFruit!=='Yes';const allies=j.crew.length+j.groupSupport;
 const danger=effectiveDanger(j,'travel');return make('seaResult','Do you survive the sea?',pool([['safe','Reach safety',55+(canSwim?10:0)+Math.min(allies,8)*2],['loss','Survive, but lose supplies',25],['hurt','Washed ashore injured',15+danger*.35],['death','Lost to the sea',(canSwim?1:allies?3:7)+danger*.4]]),canSwim?'Swimming and companions improve survival.':'Devil Fruit users cannot swim. Allies improve the rescue odds.');
 }
 if(event==='illness')return make('illnessResult','Can you weather the sickness?',pool([['recover','Recover fully',60],['weakened','Survive, still weakened',35+j.injury],['death','The sickness proves fatal',1+j.injury*.3]]));
 if(event==='prison')return make('prisonResult','What happens behind bars?',pool([['held','Remain imprisoned',60],['released','Released in an amnesty',20],['train','Train in secret',19],['death','Die in captivity',1+effectiveDanger(j)*.35]]),'Captivity replaces the normal event wheel until fate frees you.');
 if(event==='prisonBreak')return make('escapeResult','Does your escape succeed?',pool([['free','Escape to freedom',25+combatPower(j)/2],['held','Caught and returned to your cell',50],['hurt','Caught and injured',20+effectiveDanger(j)*.25],['death','Killed during the escape',3+effectiveDanger(j)*.5]]));
 throw new Error(`Unresolved event: ${event}`);
}
function improve(j,key,amount,effects){
 if(!(key in j.skills))return;const before=levelOf(j,key);const max=XP_LEVELS[trackFor(key).length-1];const gain=Math.max(0,Math.min(amount,max-j.skills[key]));j.skills[key]+=gain;
 const after=levelOf(j,key);effects.push(`${skillLabel(key)} +${gain} practice${after>before?` → ${trackFor(key)[after]}`:''}.`);
}
function injury(j,amount,effects){const before=j.injury;j.injury=clamp(j.injury+amount,0,5);if(before!==j.injury)effects.push(`Injury burden ${before} → ${j.injury}/5.`);}
function cash(j,amount,effects){const before=j.berries;j.berries=Math.max(0,j.berries+amount);effects.push(`${money(j.berries-before)} ${j.berries>=before?'gained':'change'}; purse ${money(j.berries)}.`);}
function giveItem(j,name,type='item',effects){const existing=j.inventory.find(i=>i.name===name);if(existing)existing.count++;else j.inventory.push({name,type,count:1});effects.push(`Obtained ${name}.`);}
function treasureEffect(j,name,effects){
 if(name==='Medical supplies'){injury(j,-2,effects);effects.push('Medical supplies used for recovery.');}
 else if(name==='Rare combat manual'){improve(j,'fightingMastery',15,effects);effects.push('Studied the combat manual.');}
 else {giveItem(j,name,'item',effects);const gains={'Bag of berries':10000,Jewels:30000,'Ancient coin':50000};if(gains[name])cash(j,gains[name],effects);}
}
function kill(j,cause,effects){j.alive=false;j.cause=cause;effects.push(`Your journey ends: ${cause}.`);}
function simulationRollCount(j){return j.rolls.length-(j.legacyCutover||0);}
function simulationResolutionActive(j){return simulationRollCount(j)>(j.simulationCutover||0);}
function finishEvent(j){
 const p=j.pending;j.chapter++;
 if(j.alive&&simulationResolutionActive(j)){advanceWorldTime(j,p.months);p.effects.push(...resolveCrewTurns(j,p.months,p.event));}
 j.log.push({chapter:j.chapter,event:p.event,location:p.location,narrative:p.narrative,trainingTarget:p.picks.target,encounter:p.picks.opponent?CANON.find(c=>c.id===p.picks.opponent)?.name:null,title:EVENT_BY_ID[p.event]?.label||(p.event==='prison'?'Months in captivity':'An opening to escape'),startAge:p.startAge,age:j.ageMonths,months:p.months,result:p.result,effects:[...p.effects],rolls:p.rolls.map(r=>({...r})),alive:j.alive});
 j.peakPower=Math.max(j.peakPower,combatPower(j));j.pending=null;
}
function settle(j,result){
 const p=j.pending,a=p.picks,e=p.effects,event=p.event;
 const mappedRoute=event==='travel'?travelRoute(j,a.destination):null;
 let requestedMonths=event==='timeskip'?Number(a.duration):event==='travel'?Math.max(1,Math.ceil((mappedRoute?.days||1)/30))*(result.value==='delay'?2:1):4;
 const actualMonths=Math.max(0,Math.min(requestedMonths,lifespanFor(j.character.race).limit*12-j.ageMonths));
 p.result=result.label;
 if(event==='travel'){
  const dest=worldLocation(a.destination);
  if(result.value==='death')kill(j,`Lost while traveling toward ${dest?.name||'the next shore'}`,e);
  else if(result.value==='abort')e.push('The route is no longer viable; you remain where you are.');
  else if(dest){
   if(result.value==='rough')e.push('The crossing is violent, but your course holds.');
   if(result.value==='delay')e.push('Bad currents and interruptions stretch the voyage.');
   if(result.value==='injured')injury(j,2,e);
   j.story.location=dest.name;j.story.locationId=dest.id;
   if(!j.story.visited.includes(dest.name))j.story.visited.push(dest.name);
   if(!Array.isArray(j.story.visitedIds))j.story.visitedIds=[];
   if(!j.story.visitedIds.includes(dest.id))j.story.visitedIds.push(dest.id);
   e.push(`Arrived at ${dest.name}, ${regionName(dest)} after about ${Math.max(1,Math.round(mappedRoute?.days||1))} travel days.`);
   if(dest.id==='settlement_twins_cape'&&!j.simulation.navigation.basicLogPose){j.simulation.navigation.basicLogPose=true;e.push('At Twins Cape, your crew prepares a basic Log Pose for Paradise navigation.');}
  }
 }
 if(event==='dream'){
 const d=dreamOf(j);
 if(result.value==='commission'){j.character.faction='Marine';j.bounty=0;j.group='Marine training unit';j.groupSupport=3;e.push('Your new Marine path begins with training, not a high rank.');}
 if(result.value==='swordPath'){j.character.fightingStyle='One-sword style';j.character.weapon_1='Forged katana';j.skills.weaponMastery_1=0;e.push('You begin sword practice with a forged katana at Untrained mastery.');}
 if(result.value==='milestone'){const milestone=d.steps[j.story.dreamProgress];j.story.milestones.push(milestone);j.story.dreamProgress++;j.story.dreamClues=0;e.push(`Dream milestone ${j.story.dreamProgress}/4: ${milestone}.`);if(j.story.dreamProgress===4)e.push('Your dream is fulfilled. Your life and legacy continue.');}
 if(result.value==='clue'||result.value==='sacrifice'){j.story.dreamClues++;e.push('A new lead brings your dream closer.');if(result.value==='sacrifice')cash(j,-Math.min(25000,j.berries),e);}
 if(result.value==='setback')e.push('This lead fails, but completed milestones remain yours.');
 if(result.value==='legacy'){j.story.legacy++;e.push('You help another dreamer begin. Your legacy grows.');}
 }
 if(['recovery','reflection','teaching','homecoming','leadership'].includes(event)){
 if(['healed','rest','home'].includes(result.value))injury(j,-3,e);
 if(['insight','trust'].includes(result.value))improve(j,'battleIQ',8,e);
 if(result.value==='lead'){j.story.dreamClues++;e.push('A conversation adds a lead toward your dream.');}
 if(['student','home','farewell','trust'].includes(result.value)){j.story.legacy++;e.push('You leave a mark on someone else’s life. Legacy +1.');}
 if(result.value==='slow')injury(j,-1,e);
 }
 if(COMBAT_EVENTS.includes(event)){
 const v=result.value,c=encounterOf(j);
 rememberEncounter(j,c?.id,v);
 if(c)e.push(`${c.name} · ${c.crew}: ${result.label}.`);
 if(v==='alliance'){j.story.dreamClues++;e.push(`${c.name} will remember you as an ally.`);}
 if(v==='lesson')improve(j,'battleIQ',8,e);
 if(v==='clue'){j.story.dreamClues++;e.push(`${c.name} gives you a lead toward your dream.`);}
 if(v==='part')injury(j,-1,e);
 if(v==='offend')e.push('The next meeting may be less welcoming.');
 if(v==='victory'||v==='lethal'){j.wins++;if(v==='lethal')j.kills++;improve(j,'fightingMastery',8,e);cash(j,10000,e);if(['Pirate','Revolutionary'].includes(j.character.faction)){j.bounty+=100000+(CANON.find(c=>c.id===a.opponent)||THREATS.find(t=>t.value===a.opponent)).power*10000;e.push(`Bounty rises to ${money(j.bounty)}.`);}}
 if(['wounded','spared','captured','death'].includes(v))j.losses++;
 if(v==='wounded')injury(j,2,e);
 if(v==='spared')e.push('You live because an opponent shows mercy or help arrives.');
 if(v==='captured'){j.captured=true;e.push('Captured. Only captivity events are available until you are freed.');}
 if(v==='death')kill(j,`Killed in an encounter with ${c?.name||'an opponent'}`,e);
 if(v==='lethal'&&c)e.push(`${c.name} is dead in your alternate world and cannot appear again.`);
 if(event==='betrayal'){if(j.crew.length){const member=j.crew.pop();e.push(`${member.name} leaves your group after the betrayal.`);}else{j.groupSupport=Math.max(0,j.groupSupport-1);e.push('Betrayal costs you some support from your group.');}}
 }else if(['training','mentor','spar','timeskip'].includes(event)){
 const life=lifeContext(j);
 const multiplier=(event==='mentor'?2:event==='timeskip'?Math.max(1,actualMonths/4):1)*(life.elder ? 0.65 : life.young ? 1.25 : 1);
 if(event==='mentor'){const teacher=CANON.find(c=>c.id===a.mentor);if(teacher){j.story.mentored++;rememberEncounter(j,teacher.id,'lesson');e.push(`${teacher.name} of ${teacher.crew} works with you on ${skillLabel(a.target||'battleIQ')}.`);}}
 if(result.value==='steady')improve(j,a.target,Math.round(5*multiplier),e);
 if(result.value==='breakthrough')improve(j,a.target,Math.round(15*multiplier),e);
 if(result.value==='strain')injury(j,1,e);
 if(result.value==='stalled')e.push('No skill progress this chapter.');
 }else if(event==='fruit'||event==='provisions'){
 if(event==='provisions'&&result.value!=='store'){const item=j.inventory.find(i=>i.name===a.fruitName);if(item){item.count--;j.inventory=j.inventory.filter(i=>i.count>0);}}
 if(result.value==='eat'){j.character.devilFruit='Yes';j.character.fruitType=a.fruitType;j.character.fruit=a.fruitName;j.skills.fruitMastery=0;j.story.fruitAcquiredMonth=j.elapsedMonths;e.push(`Ate ${a.fruitName}. Fruit mastery begins at Just eaten. You can no longer swim.`);}
 if(result.value==='store'){if(event==='fruit')giveItem(j,a.fruitName,'fruit',e);else e.push('The fruit remains safely stored.');}
 if(result.value==='sell')cash(j,100000000,e);
 if(result.value==='gift'){
 const member=j.crew.find(c=>!c.fruit);
 if(member){member.fruit=a.fruitName;e.push(`${member.name} receives ${a.fruitName}.`);}
 else {giveItem(j,a.fruitName,'fruit',e);e.push('No eligible named ally; fruit retained safely.');}
 }
 if(result.value==='lost')e.push('The fruit slips out of your story before you can use it.');
 }else if(event==='haki'){
 if(result.value.startsWith('haki_')){j.skills[result.value]=0;e.push(`${skillLabel(result.value)} awakened.`);}else improve(j,'battleIQ',3,e);
 }else if(event==='world'){
 if(simulationResolutionActive(j))applyWorldEvent(j,result.value,e);
 else {
  const shifts={'Marine crackdown':1,'An Emperor falls':1,'An island is liberated':-1,'Trade routes reopen':-1,'War engulfs a kingdom':2,'A golden age of discovery':-2};
  j.danger=clamp(j.danger+(shifts[result.value]||0),0,5);e.push(`World danger is now ${j.danger}/5.`);
  if(result.value==='Government amnesty'){j.bounty=Math.floor(j.bounty*.7);e.push(`Bounty reduced to ${money(j.bounty)}.`);}
  if(['Trade routes reopen','A golden age of discovery'].includes(result.value))cash(j,15000,e);
 }
 }else if(event==='treasure')treasureEffect(j,result.value,e);
 else if(event==='weapon'){
 const slots=Object.keys(j.skills).filter(k=>k.startsWith('weaponMastery_')).sort((a,b)=>j.skills[a]-j.skills[b]);
 if(result.value==='Maintain your weapons'){improve(j,slots[0],5,e);}
 else if(slots.length){const key=slots[0],weaponKey=key.replace('weaponMastery','weapon');giveItem(j,j.character[weaponKey],'weapon',e);j.character[weaponKey]=result.value;j.skills[key]=10;e.push(`Equipped ${result.value} in slot ${key.split('_')[1]}; mastery starts at Novice.`);}else treasureEffect(j,result.value,e);
 }else if(event==='recruit'){
 if(result.value==='scam')cash(j,-25000,e);
 else if(a.recruitResult==='join') {j.crew.push({name:result.value,role:result.note,race:'Unrecorded',canon:false});j.recruits++;e.push(`${result.value}, ${result.note}, joins you.`);if(!j.group)j.group='Your traveling companions';}
 }else if(event==='quiet'||event==='celebration'){
 if(result.value==='rest')injury(j,-2,e);if(result.value==='work')cash(j,5000,e);if(result.value==='practice')improve(j,'fightingMastery',3,e);
 }else if(event==='trade'){
 if(result.value==='profit')cash(j,20000,e);if(result.value==='loss')cash(j,-10000,e);if(result.value==='manual')improve(j,'fightingMastery',10,e);if(result.value==='medicine')injury(j,-2,e);
 }else if(event==='island'){
 if(result.value==='discovery'){j.discoveries++;cash(j,10000,e);improve(j,'battleIQ',8,e);}
 if(result.value==='shelter')injury(j,-1,e);if(result.value==='treasure')cash(j,30000,e);if(result.value==='injury')injury(j,2,e);if(result.value==='death')kill(j,'Lost on an uncharted island',e);
 }else if(event==='rescue'){
 if(result.value==='saved'){cash(j,10000,e);improve(j,'battleIQ',5,e);}if(result.value==='hurt')injury(j,2,e);if(result.value==='death')kill(j,'Died attempting a rescue',e);
 }else if(event==='storm'||event==='shipwreck'){
 if(result.value==='loss')cash(j,-Math.floor(j.berries*.25),e);if(result.value==='hurt')injury(j,2,e);if(result.value==='death')kill(j,'Lost to the sea',e);
 }else if(event==='illness'){
 if(result.value==='recover')injury(j,-2,e);if(result.value==='weakened')injury(j,1,e);if(result.value==='death')kill(j,'Died of illness',e);
 }else if(event==='prison'||event==='prisonBreak'){
 if(result.value==='released'||result.value==='free'){j.captured=false;e.push('You are free again.');}
 if(result.value==='train')improve(j,'fightingMastery',5,e);if(result.value==='hurt')injury(j,1,e);if(result.value==='death')kill(j,event==='prison'?'Died in captivity':'Killed during a prison escape',e);
 }
 const remaining=lifespanFor(j.character.race).limit*12-j.ageMonths;
 p.months=Math.max(0,Math.min(requestedMonths,remaining));j.ageMonths+=p.months;j.elapsedMonths+=p.months;
 if(p.months<requestedMonths)e.push('The passage of time reaches the race’s maximum game lifespan.');
 j.peakPower=Math.max(j.peakPower,combatPower(j));
 if(j.alive&&naturalDeathChance(j.character.race,p.startAge,p.months)>0)p.phase='aging';else finishEvent(j);
}
export function applyJourneyRoll(j,value){
 if(j.legacyPending){const record=legacy.applyJourneyRoll(j,value);j.legacyCutover=j.rolls.length;if(!j.pending){j.legacyPending=false;delete j.story;initializeStory(j);ensureSimulation(j);}return record;}
 const s=nextJourneyStep(j);if(!s)throw new Error('This journey has ended.');
 const selected=s.options.find(o=>o.value===value);if(!selected)throw new Error('That result is not available on this wheel.');
 const record={id:s.id,value,label:selected.label,chance:probability(s.options,value),wheel:s.label,...(s.modifier?{modifier:{...s.modifier}}:{})};
 j.rolls.push({id:s.id,value});
 if(s.key==='event'){
 j.pending={event:value,location:j.story.location,narrative:chapterPremise(j,value),startAge:j.ageMonths,months:0,picks:{},phase:'event',effects:[],rolls:[record]};return record;
 }
 const p=j.pending;p.rolls.push(record);
 if(s.key==='aging'){
 if(value==='Death from old age'){kill(j,'Old age',p.effects);p.result+=' · Death from old age';}else p.effects.push('You survive the passage of time.');
 finishEvent(j);return record;
 }
 p.picks[s.key]=value;
 if(s.key==='storedFruit'){p.picks.fruitName=value;p.picks.fruitType=Object.keys(fruits).find(type=>fruits[type].some(f=>f.value===value));return record;}
 const intermediary=['opponent','tone','mentor','instinct','duration','target','trainingInstinct','fruitType','fruitName','destination'];
 if(intermediary.includes(s.key))return record;
 if(s.key==='awakening'&&value==='yes')return record;
 if(s.key==='recruitResult'&&value==='join')return record;
 settle(j,selected);return record;
}
export function rollJourney(j,random=Math.random){const s=nextJourneyStep(j);if(!s)return null;return applyJourneyRoll(j,weightedPick(s.options,random).value);}
export function saveDocument(history,j){
 const base=characterDocument(history);
 return {...base,schemaVersion:SAVE_VERSION,character:j?liveCharacter(j):base.character,journey:j?{version:JOURNEY_VERSION,simulationCutover:j.simulationCutover??0,legacyRolls:j.rolls.slice(0,j.legacyCutover),rolls:j.rolls.slice(j.legacyCutover)}:null};
}
function upgradeLegacy(history,rolls){
 const j=legacy.loadDocument({game:'Grand Line Origins',schemaVersion:2,history,journey:{version:1,rolls}}).journey;
 j.version=JOURNEY_VERSION;j.legacyCutover=j.rolls.length;j.legacyPending=!!j.pending;j.simulationCutover=0;initializeStory(j);ensureSimulation(j);return j;
}
export function loadDocument(doc){
 if(!doc||doc.game!=='Grand Line Origins'||![1,2,SAVE_VERSION].includes(doc.schemaVersion))throw new Error('This is not a supported Grand Line Origins save.');
 const history=validateHistory(doc.history);let journey=null;
 if(doc.schemaVersion===2&&doc.journey){
 if(doc.journey.version!==1)throw new Error('Unsupported older journey version.');
 journey=upgradeLegacy(history,doc.journey.rolls);
 }else if(doc.schemaVersion===SAVE_VERSION&&doc.journey){
 const old=doc.journey.legacyRolls;
 if(doc.journey.version!==JOURNEY_VERSION||!Array.isArray(doc.journey.rolls)||!Array.isArray(old)||doc.journey.rolls.length+old.length>20000)throw new Error('Invalid journey save.');
 journey=old.length?upgradeLegacy(history,old):createJourney(history);
 const hasSimulationCutover=Number.isInteger(doc.journey.simulationCutover)&&doc.journey.simulationCutover>=0&&doc.journey.simulationCutover<=doc.journey.rolls.length;
 journey.simulationCutover=hasSimulationCutover?doc.journey.simulationCutover:doc.journey.rolls.length;
 if(journey.legacyPending&&doc.journey.rolls.length)throw new Error('Finish the saved legacy chapter before adding new story rolls.');
 for(const record of doc.journey.rolls){const s=nextJourneyStep(journey);if(!s||s.id!==record?.id)throw new Error('Journey rolls are out of order or continue after death.');applyJourneyRoll(journey,record.value);}
 if(!hasSimulationCutover){delete journey.simulation;ensureSimulation(journey);}
 }
 return {history,journey};
}
