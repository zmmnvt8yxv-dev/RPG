import {CANON,PLACES} from './story-data.js';
import {eras} from './engine.js';

const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const round1=n=>Math.round(n*10)/10;

// Mirrors the authored QGIS project supplied with the game. The .qgz references
// external GeoPackages, so the browser game uses this as a stable data contract
// until those feature tables are exported into repository-friendly JSON.
export const QGIS_WORLD_SCHEMA={
 islands:['island_id','name','aliases_json','region_id','sea_name','travel_tier','log_type','source_name','notes'],
 regions:['region_id','name','region_kind','sea_name','travel_tier','travel_cost','source_name'],
 routes:['route_id','from_id','to_id','from_name','to_name','route_type','sea_region','one_way','requires_ship','unlock_method','travel_cost','danger_level','travel_days','canon_status','route_group','faction_access','outcome_chance','source_name'],
 settlements:['settlement_id','name','aliases_json','parent_island_id','population_scale','has_port','region_id','source_name'],
 barriers:['barrier_id','name','barrier_type','passable','travel_cost','encounter_chance','bypass_tag','source_name'],
 dangerZones:['danger_zone_id','name','danger_type','region_id','severity','radius','faction','canon_status','notes'],
 worldLocations:['location_id','name','display_name','location_type','region_id','parent_location_id','importance','faction','climate','reset_window','is_magnetic','canon_status','notes'],
 worldRoutes:['route_id','name','from_location_id','to_location_id','route_type','danger_zone_id','travel_distance','travel_days','danger_score','unlock_method','route_group','outcome_chance','one_way','importance','faction','canon_status','notes'],
};

export const WORLD_LAWS=[
 {id:'harbor-inspections',label:'Expanded harbor inspections',outlawDanger:.45,governmentDanger:-.15},
 {id:'transponder-registration',label:'Mandatory ship transponder registration',outlawDanger:.35,governmentDanger:-.1},
 {id:'bounty-reporting',label:'Mandatory bounty reporting at major ports',outlawDanger:.5,governmentDanger:0},
 {id:'curfew-orders',label:'Emergency island curfew authority',outlawDanger:.25,governmentDanger:.1},
 {id:'privateer-restrictions',label:'Restrictions on private armed crews',outlawDanger:.2,governmentDanger:.05},
];

function hash32(input){
 let h=2166136261;
 for(const ch of String(input)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
}
const unit=seed=>hash32(seed)/4294967296;
function deterministicPick(rows,seed){
 const total=rows.reduce((sum,row)=>sum+Math.max(0,row.weight),0);
 let target=unit(seed)*total;
 for(const row of rows){target-=Math.max(0,row.weight);if(target<=0)return row;}
 return rows.at(-1);
}
function factionKind(faction=''){
 if(['Marine','Cipher Pol'].includes(faction))return 'government';
 if(faction==='Pirate')return 'pirate';
 if(faction==='Revolutionary')return 'revolutionary';
 if(/hunter/i.test(faction))return 'hunter';
 return 'civilian';
}
function locationTier(j){
 const place=PLACES.find(p=>p[0]===j.story?.location);
 return place?.[1]??0;
}
export function ensureSimulation(j){
 if(!j.simulation){
  const inherited=Number.isFinite(j.danger)?j.danger:0;
  j.simulation={
   version:1,
   stability:clamp(88-inherited*9,20,95),
   governmentControl:clamp(78-inherited*5,20,95),
   activeLaws:[],
   dangerZones:{},
   destroyedLocations:[],
   executions:[],
   crewDeaths:[],
   crewDepartures:[],
   worldFlags:[],
  };
 }
 if(!Array.isArray(j.simulation.activeLaws))j.simulation.activeLaws=[];
 if(!j.simulation.dangerZones||typeof j.simulation.dangerZones!=='object')j.simulation.dangerZones={};
 for(const key of ['destroyedLocations','executions','crewDeaths','crewDepartures','worldFlags'])if(!Array.isArray(j.simulation[key]))j.simulation[key]=[];
 j.crew=(j.crew||[]).map(c=>({
  ...c,
  loyalty:Number.isFinite(c.loyalty)?c.loyalty:(c.canon?62:55),
  power:Number.isFinite(c.power)?c.power:(c.canon?14:10),
  growth:Number.isFinite(c.growth)?c.growth:0,
  injury:Number.isFinite(c.injury)?c.injury:0,
 }));
 return j.simulation;
}
export function worldUnrestLevel(j){
 const s=ensureSimulation(j);
 return clamp(Math.round((100-s.stability)/20),0,5);
}
function interpolate(a,b,t){return a+(b-a)*clamp(t,0,1);}
export function effectiveDanger(j,context='general'){
 const s=ensureSimulation(j),kind=factionKind(j.character?.faction),stability=s.stability;
 let base;
 if(stability>=70){
  const stable={government:.6,pirate:4.7,revolutionary:4.5,hunter:2.3,civilian:1.7};
  const unstable={government:3,pirate:3.6,revolutionary:3.9,hunter:3,civilian:3};
  base=interpolate(stable[kind],unstable[kind],(70-stability)/-30);
 }else{
  const unstable={government:3,pirate:3.6,revolutionary:3.9,hunter:3,civilian:3};
  const chaos={government:4.7,pirate:4.6,revolutionary:4.8,hunter:4.4,civilian:4.5};
  base=interpolate(unstable[kind],chaos[kind],(40-stability)/40);
 }
 const tier=locationTier(j);
 base+=tier*(kind==='government'?.2:.35);
 const zone=Number(s.dangerZones[j.story?.location]||0);
 base+=zone*.35;
 const bounty=Number(j.bounty||0);
 if(kind!=='government'&&bounty>=10000000)base+=.25;
 if(kind!=='government'&&bounty>=100000000)base+=.25;
 for(const id of s.activeLaws){
  const law=WORLD_LAWS.find(x=>x.id===id);if(!law)continue;
  base+=kind==='government'?law.governmentDanger:law.outlawDanger;
 }
 if(context==='combat')base+=.15;
 if(context==='travel')base+=tier*.1;
 return clamp(round1(base),0,5);
}
export function dangerExplanation(j){
 const s=ensureSimulation(j),kind=factionKind(j.character?.faction);
 const labels={government:'Government-aligned',pirate:'Pirate',revolutionary:'Revolutionary',hunter:'Bounty hunter',civilian:'Independent'};
 return `${labels[kind]} risk at ${j.story?.location||'the current location'}: ${effectiveDanger(j)}/5 · world stability ${Math.round(s.stability)}/100.`;
}
export function routeDangerScore(route={},faction=''){
 const raw=Number(route.danger_score??route.danger_level??0);
 let score=raw>5?raw/20:raw;
 const access=String(route.faction_access??route.faction??'').toLowerCase();
 if(access&&faction&&!access.includes(String(faction).toLowerCase()))score+=.75;
 const outcome=Number(route.outcome_chance||0);if(Number.isFinite(outcome))score+=clamp(outcome/100,0,.5);
 return clamp(round1(score),0,5);
}
export function worldEventPool(j,base){
 const s=ensureSimulation(j),unrest=(100-s.stability)/100,control=s.governmentControl/100;
 return base.map(o=>{
  let weight=o.weight;
  if(o.value==='Buster Call authorized')weight*=.5+unrest*2+control*.4;
  if(o.value==='An island is eradicated')weight*=.35+unrest*1.8+control*.35;
  if(o.value==='A new World Government law')weight*=.65+control;
  if(o.value==='A notorious pirate is executed')weight*=.5+control*1.2;
  if(o.value==='A mass prison break')weight*=.5+unrest*1.5;
  if(o.value==='A Revolutionary uprising')weight*=.6+unrest*1.6;
  if(o.value==='Trade routes reopen'||o.value==='A golden age of discovery')weight*=.5+s.stability/100;
  if(o.value==='War engulfs a kingdom'||o.value==='An Emperor falls')weight*=.65+unrest;
  return {...o,weight:Math.max(.01,weight)};
 });
}
function addFlag(s,flag){if(!s.worldFlags.includes(flag))s.worldFlags.push(flag);}
function addLaw(s,seed){
 const unused=WORLD_LAWS.filter(l=>!s.activeLaws.includes(l.id));
 const law=deterministicPick((unused.length?unused:WORLD_LAWS).map(l=>({...l,weight:1})),seed);
 if(law&&!s.activeLaws.includes(law.id))s.activeLaws.push(law.id);
 return law;
}
function chooseErasedLocation(j,seed){
 const s=ensureSimulation(j),current=j.story?.location;
 const sameTier=locationTier(j);
 let pool=PLACES.filter(p=>p[0]!==current&&!s.destroyedLocations.includes(p[0])&&p[1]===sameTier);
 if(!pool.length)pool=PLACES.filter(p=>p[0]!==current&&!s.destroyedLocations.includes(p[0]));
 return pool.length?pool[Math.floor(unit(seed)*pool.length)][0]:null;
}
function choosePirateForExecution(j,seed){
 const era=eras.indexOf(j.character?.era),crewNames=new Set((j.crew||[]).map(c=>c.name));
 const pool=CANON.filter(c=>c.kind==='pirate'&&c.eras.includes(era)&&!j.story?.dead?.includes(c.id)&&!crewNames.has(c.name));
 return pool.length?pool[Math.floor(unit(seed)*pool.length)]:null;
}
export function applyWorldEvent(j,value,effects=[]){
 const s=ensureSimulation(j),seed=`${j.chapter}|${j.elapsedMonths}|${value}|${j.story?.location}`;
 const shift=(stability=0,control=0)=>{s.stability=clamp(s.stability+stability,0,100);s.governmentControl=clamp(s.governmentControl+control,0,100);};
 if(value==='Marine crackdown'){shift(-7,8);const law=addLaw(s,seed);if(law)effects.push(`Crackdown measure: ${law.label}.`);}
 else if(value==='An Emperor falls'){shift(-12,-4);addFlag(s,'emperor-power-vacuum');}
 else if(value==='An island is liberated'){shift(6,-3);addFlag(s,'liberation-wave');}
 else if(value==='Trade routes reopen'){shift(7,2);j.berries=Math.max(0,(j.berries||0)+15000);effects.push('Safer trade adds ฿ 15,000 to your purse.');}
 else if(value==='Government amnesty'){shift(5,2);j.bounty=Math.floor((j.bounty||0)*.7);effects.push('Your government bounty is reduced by 30%.');}
 else if(value==='War engulfs a kingdom'){shift(-14,-5);addFlag(s,'kingdom-war');}
 else if(value==='A golden age of discovery'){shift(12,-2);j.berries=Math.max(0,(j.berries||0)+15000);effects.push('Exploration and trade add ฿ 15,000 to your purse.');}
 else if(value==='Buster Call authorized'){
  shift(-16,7);const place=j.story?.location;s.dangerZones[place]=Math.max(Number(s.dangerZones[place]||0),5);addFlag(s,'buster-call-active');
  effects.push(`A Buster Call turns the waters around ${place} into a 5/5 local danger zone.`);
 }
 else if(value==='An island is eradicated'){
  shift(-20,5);const target=chooseErasedLocation(j,seed);
  if(target){s.destroyedLocations.push(target);s.dangerZones[target]=5;effects.push(`${target} is erased from navigable routes in this alternate world.`);}
 }
 else if(value==='A new World Government law'){
  shift(-4,5);const law=addLaw(s,seed);if(law)effects.push(`New law: ${law.label}.`);
 }
 else if(value==='A notorious pirate is executed'){
  shift(-3,5);const pirate=choosePirateForExecution(j,seed);
  if(pirate){s.executions.push(pirate.id);if(j.story&&!j.story.dead.includes(pirate.id))j.story.dead.push(pirate.id);effects.push(`${pirate.name} is publicly executed and removed from future encounter pools.`);}
 }
 else if(value==='A mass prison break'){shift(-10,-8);addFlag(s,'mass-prison-break');}
 else if(value==='A Revolutionary uprising'){shift(-9,-8);addFlag(s,'revolutionary-uprising');}
 j.danger=worldUnrestLevel(j);
 effects.push(`World stability is now ${Math.round(s.stability)}/100. Your faction danger here is ${effectiveDanger(j)}/5.`);
 return s;
}
export function advanceWorldTime(j,months=4){
 const s=ensureSimulation(j),decay=Math.max(.15,months/24);
 for(const [place,severity] of Object.entries(s.dangerZones)){
  if(s.destroyedLocations.includes(place))continue;
  const next=Math.max(0,Number(severity)-decay);
  if(next<=.05)delete s.dangerZones[place];else s.dangerZones[place]=round1(next);
 }
}
export function crewCombatContribution(member){
 const loyalty=clamp(Number(member.loyalty??55),0,100),power=clamp(Number(member.power??10),0,100),injury=clamp(Number(member.injury??0),0,5);
 return Math.max(.1,(.55+power*.025)*(0.75+loyalty/200)-injury*.12);
}
export function crewTurnWeights(j,member,months=4){
 const danger=effectiveDanger(j),loyalty=clamp(Number(member.loyalty??55),0,100),duration=clamp(months/4,1,8);
 return [
  {value:'advance',label:'strengthens during the chapter',weight:28+duration*1.5},
  {value:'bond',label:'grows more loyal to the crew',weight:22+loyalty*.08},
  {value:'duty',label:'handles their role without drama',weight:24},
  {value:'ambition',label:'pursues a personal goal and improves',weight:12+duration},
  {value:'friction',label:'clashes with the crew',weight:7+(100-loyalty)*.08},
  {value:'leave',label:'chooses to leave the crew',weight:(2.5+(100-loyalty)*.08)*(1+duration*.08)},
  {value:'injured',label:'is hurt away from the spotlight',weight:(2+danger*.55)*(1+duration*.05)},
  {value:'death',label:'dies during the chapter',weight:(.7+danger*.28)*(1+duration*.08)},
 ];
}
export function resolveCrewTurns(j,months=4,event=''){
 const s=ensureSimulation(j),effects=[],survivors=[];
 for(const member of [...j.crew]){
  const seed=`${j.chapter}|${event}|${member.name}|${j.elapsedMonths}|${months}`;
  const outcome=deterministicPick(crewTurnWeights(j,member,months),seed);
  if(!outcome){survivors.push(member);continue;}
  if(outcome.value==='advance'){
   const gain=1+Math.floor(unit(seed+'|gain')*Math.max(2,Math.min(6,Math.ceil(months/8)+2)));
   member.power=clamp(member.power+gain,0,100);member.growth+=gain;member.loyalty=clamp(member.loyalty+1,0,100);
   effects.push(`${member.name} ${outcome.label} · power +${gain}, loyalty ${member.loyalty}/100.`);survivors.push(member);
  }else if(outcome.value==='bond'){
   const gain=3+Math.floor(unit(seed+'|bond')*4);member.loyalty=clamp(member.loyalty+gain,0,100);
   if(member.injury&&['recovery','quiet','celebration'].includes(event))member.injury=Math.max(0,member.injury-1);
   effects.push(`${member.name} ${outcome.label} · loyalty ${member.loyalty}/100.`);survivors.push(member);
  }else if(outcome.value==='duty'){
   if(member.injury&&event==='recovery')member.injury=Math.max(0,member.injury-1);
   effects.push(`${member.name} ${outcome.label}.`);survivors.push(member);
  }else if(outcome.value==='ambition'){
   member.power=clamp(member.power+1,0,100);member.growth+=1;member.loyalty=clamp(member.loyalty+1,0,100);
   effects.push(`${member.name} ${outcome.label} · power ${member.power}, loyalty ${member.loyalty}/100.`);survivors.push(member);
  }else if(outcome.value==='friction'){
   const loss=4+Math.floor(unit(seed+'|friction')*5);member.loyalty=clamp(member.loyalty-loss,0,100);
   effects.push(`${member.name} ${outcome.label} · loyalty falls to ${member.loyalty}/100.`);survivors.push(member);
  }else if(outcome.value==='injured'){
   member.injury=clamp(member.injury+1,0,5);effects.push(`${member.name} ${outcome.label} · injury ${member.injury}/5.`);survivors.push(member);
  }else if(outcome.value==='leave'){
   s.crewDepartures.push({name:member.name,chapter:j.chapter,loyalty:member.loyalty});
   effects.push(`${member.name} leaves the crew with loyalty at ${member.loyalty}/100.`);
  }else if(outcome.value==='death'){
   s.crewDeaths.push({name:member.name,chapter:j.chapter});
   const canon=CANON.find(c=>c.name===member.name);if(canon&&j.story&&!j.story.dead.includes(canon.id))j.story.dead.push(canon.id);
   effects.push(`${member.name} dies during the chapter. Their death is permanent in this alternate world.`);
  }
 }
 j.crew=survivors;
 return effects;
}
export function simulationSummary(j){
 const s=ensureSimulation(j);
 return {
  stability:Math.round(s.stability),
  danger:effectiveDanger(j),
  unrest:worldUnrestLevel(j),
  laws:s.activeLaws.map(id=>WORLD_LAWS.find(l=>l.id===id)?.label||id),
  destroyed:[...s.destroyedLocations],
 };
}
