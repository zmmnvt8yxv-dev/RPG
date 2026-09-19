import eastBlue from './world/east-blue.js';
import southBlue from './world/south-blue.js';
import westBlue from './world/west-blue.js';
import northBlue from './world/north-blue.js';
import paradise from './world/paradise.js';
import newWorldA from './world/new-world-a.js';
import newWorldB1 from './world/new-world-b1.js';
import newWorldB2 from './world/new-world-b2.js';
import specials from './world/special-regions.js';
import routes1 from './world/routes-1.js';
import routes2 from './world/routes-2.js';
import routes3 from './world/routes-3.js';
import routes4 from './world/routes-4.js';
import {danger,regions} from './world/meta.js';

export const WORLD_LOCATIONS=[...eastBlue,...southBlue,...westBlue,...northBlue,...paradise,...newWorldA,...newWorldB1,...newWorldB2,...specials];
export const WORLD_ROUTES=[...routes1,...routes2,...routes3,...routes4];
export const WORLD_REGIONS=regions;
export const WORLD_DANGER_ZONES=danger;
export const WORLD_LOCATION_BY_ID=Object.fromEntries(WORLD_LOCATIONS.map(x=>[x.id,x]));
export const WORLD_LOCATION_BY_NAME=Object.fromEntries(WORLD_LOCATIONS.map(x=>[x.n.toLowerCase(),x]));
export const WORLD_REGION_BY_ID=Object.fromEntries(WORLD_REGIONS.map(x=>[x.id,x]));

const aliases={
 'alabasta':'island_alabasta_kingdom',
 'dressrosa':'island_dressrosa_kingdom',
 'elbaf':'island_elbaph',
 'kuraigana island':'island_kuraigana_island',
 'whole cake island':'island_whole_cake_island',
 'fish-man island':'island_fish_man_island',
 'reverse mountain':'island_reverse_mountain',
 'water 7':'island_water_seven',
 'sabaody archipelago':'island_sabaody_archipelago',
 'foosha village':'island_foosha_village',
 'orange town':'island_orange_town',
 'loguetown':'settlement_loguetown',
 'baratie':'island_baratie',
 'cocoyasi village':'island_conomi_islands',
 'drum island':'island_drum_island',
 'wano country':'island_wano_country',
 'zou':'island_zou'
};
const BLUE_REGIONS=new Set(['east_blue','south_blue','west_blue','north_blue']);
const ROUTE_LOCKED_REGIONS=new Set(['paradise','red_line']);
const dist=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.y||0)-(b?.y||0));
export const regionLabel=id=>WORLD_REGION_BY_ID[id]?.n||id||'Unknown waters';
export const legacyRegionIndex=id=>id==='new_world'?2:BLUE_REGIONS.has(id)?0:1;

export function resolveWorldLocation(value){
 if(!value)return null;
 if(typeof value==='object'&&value.id)return WORLD_LOCATION_BY_ID[value.id]||value;
 if(WORLD_LOCATION_BY_ID[value])return WORLD_LOCATION_BY_ID[value];
 const key=String(value).toLowerCase();
 return WORLD_LOCATION_BY_NAME[key]||WORLD_LOCATION_BY_ID[aliases[key]]||null;
}
export function worldLocationOf(j){
 return resolveWorldLocation(j?.story?.locationId)||resolveWorldLocation(j?.story?.location)||WORLD_LOCATION_BY_ID.island_foosha_village;
}
export function syncWorldLocation(j){
 const loc=worldLocationOf(j);if(!j.story)return loc;
 j.story.locationId=loc.id;j.story.location=loc.n;return loc;
}
export function locationDescription(loc){
 const bits=[regionLabel(loc.r),loc.t?.replaceAll('_',' '),loc.f&&loc.f!=='neutral'?loc.f.replaceAll('_',' '):'',loc.c?loc.c.replaceAll('_',' '):''].filter(Boolean);
 return bits.join(' · ');
}
export function routeFromTo(a,b){
 return WORLD_ROUTES.find(r=>r.a===a&&r.b===b)||WORLD_ROUTES.find(r=>!r.o&&r.a===b&&r.b===a)||null;
}
export function authoredRoutesFrom(loc){
 if(!loc)return[];
 return WORLD_ROUTES.filter(r=>r.a===loc.id||(!r.o&&r.b===loc.id)).map(r=>({...r,to:r.a===loc.id?WORLD_LOCATION_BY_ID[r.b]:WORLD_LOCATION_BY_ID[r.a]})).filter(r=>r.to);
}
export function nearbyLocations(loc,{limit=10,includeSettlements=true}={}){
 if(!loc)return[];
 const destroyed=new Set();
 return WORLD_LOCATIONS.filter(x=>x.id!==loc.id&&x.r===loc.r&&(includeSettlements||!x.id.startsWith('settlement_'))&&!destroyed.has(x.n))
  .map(x=>({loc:x,distance:dist(loc,x)})).sort((a,b)=>a.distance-b.distance).slice(0,limit);
}
function factionRisk(j,loc){
 const player=j?.character?.faction;
 if(!loc||!player)return 0;
 const govt=['Marine','Cipher Pol'].includes(player),outlaw=['Pirate','Revolutionary'].includes(player);
 if(['marines','world_government'].includes(loc.f))return govt?-1.1:outlaw?1.25:.35;
 if(loc.f==='pirates')return govt?.9:player==='Pirate'?-.35:.25;
 if(loc.f==='revolutionary_army')return player==='Revolutionary'?-1:govt?1:.15;
 return 0;
}
export function mapDangerFor(j,loc=worldLocationOf(j)){
 let n=0;
 if(loc.r==='calm_belt'||loc.r==='red_line')n+=1.5;
 if(loc.c&&/(storm|toxic|danger|arctic|fog)/.test(loc.c))n+=.35;
 n+=factionRisk(j,loc);
 return Math.max(-1.5,Math.min(2,n));
}

const START_REGION_WEIGHTS={east_blue:24,south_blue:15,west_blue:15,north_blue:15,paradise:22,new_world:8,calm_belt:.6,red_line:.4};
const START_TYPE_WEIGHTS={island:1,town:1.1,port:1.1,city:1.05,sky_island:.55,underwater_site:.35,sea_gate:.18,landmark:.35,dungeon:.12};
function startingFactionWeight(character,loc){
 const faction=character?.faction||'Civilian',territory=loc.f||'neutral';
 const govt=['Marine','Cipher Pol'].includes(faction),pirate=faction==='Pirate',revolutionary=faction==='Revolutionary';
 if(territory==='neutral')return govt?1.35:pirate?1.5:revolutionary?1.45:2;
 if(['marines','world_government'].includes(territory))return govt ? 8 : pirate ? .16 : revolutionary ? .2 : 1.4;
 if(territory==='pirates')return pirate ? 7 : govt ? .18 : revolutionary ? .7 : .65;
 if(territory==='revolutionary_army')return revolutionary ? 9 : govt ? .18 : pirate ? .65 : 1;
 return 1;
}
function startingStoryWeight(character,loc){
 let w=1;
 if(character?.family==='Kozuki'||character?.family==='Shimotsuki')w*=loc.id==='island_wano_country'?24:1;
 if(character?.family==='Nefertari')w*=loc.id==='island_alabasta_kingdom'?24:1;
 if(character?.family==='Vinsmoke')w*=loc.id==='island_germa_kingdom'?24:1;
 if(character?.family==='Charlotte')w*=loc.id==='island_whole_cake_island'?24:1;
 if(character?.family==='Monkey')w*=['island_dawn_island','island_foosha_village','island_goa_kingdom'].includes(loc.id)?5:1;
 const joined=character?.joinedCrew||'';
 if(joined==='G-5 unit'&&loc.id==='island_g_5')w*=30;
 if(joined==='East Blue Marine branch'&&loc.r==='east_blue'&&loc.f==='marines')w*=8;
 if(joined==='Marine Headquarters unit'&&['island_marineford','island_g_1'].includes(loc.id))w*=12;
 if(joined==='Revolutionary Army cell'&&loc.f==='revolutionary_army')w*=12;
 if(joined==='Kuja Pirates'&&loc.id==='island_amazon_lily')w*=30;
 if(joined==='Big Mom Pirates'&&loc.id==='island_whole_cake_island')w*=30;
 return w;
}
export function startingLocationPool(jOrCharacter){
 const character=jOrCharacter?.character||jOrCharacter||{};
 const counts=Object.fromEntries(WORLD_REGIONS.map(r=>[r.id,Math.max(1,WORLD_LOCATIONS.filter(x=>x.r===r.id).length)]));
 const young=Number(character.age||0)<=20;
 return WORLD_LOCATIONS.map(loc=>{
  let weight=(START_REGION_WEIGHTS[loc.r]||1)/counts[loc.r];
  weight*=START_TYPE_WEIGHTS[loc.t]??.8;
  weight*=loc.i==='critical'?1.5:loc.i==='major'?1.35:loc.i==='standard'?1.12:1;
  weight*=startingFactionWeight(character,loc)*startingStoryWeight(character,loc);
  if(young&&loc.r==='new_world')weight*=.45;
  if(young&&BLUE_REGIONS.has(loc.r))weight*=1.3;
  const territory=loc.f&&loc.f!=='neutral'?loc.f.replaceAll('_',' '):'neutral';
  return {value:loc.id,label:`${loc.n} · ${regionLabel(loc.r)}`,weight:Math.max(.001,weight),note:`${loc.t.replaceAll('_',' ')} · ${territory}${loc.c?` · ${loc.c.replaceAll('_',' ')}`:''}`};
 });
}
export function worldTravelPool(j){
 const here=syncWorldLocation(j),destroyed=new Set(j.simulation?.destroyedLocations||[]);
 const authored=authoredRoutesFrom(here).filter(r=>!destroyed.has(r.to.n));
 const make=(to,route,distance)=>({
  value:to.n,
  label:`${to.n} · ${regionLabel(to.r)}`,
  weight:Math.max(.2,(route?18:12)/(1+(route?.z||0)*.18)/(1+(distance||0)/500))*(j.story.visited.includes(to.n)?.28:1),
  note:route
   ?`${route.u?.replaceAll('_',' ')||'charted route'} · ${route.d?route.d+' travel days · ':''}danger ${route.z??'?'} · ${locationDescription(to)}`
   :`Open-water sailing · ~${Math.max(1,Math.round((distance||80)/45))} days · ${locationDescription(to)}`
 });
 if(authored.length)return authored.map(r=>make(r.to,r,dist(here,r.to)));
 // Paradise and Red Line are route-locked: don't invent a shortcut when the authored graph says there isn't one.
 if(ROUTE_LOCKED_REGIONS.has(here.r))return[];
 let nearby=nearbyLocations(here,{limit:12});
 // In a Blue, always let the nearest Reverse Mountain entrance eventually surface.
 if(BLUE_REGIONS.has(here.r)){
  const gate=WORLD_LOCATIONS.find(x=>x.r===here.r&&x.t==='sea_gate');
  if(gate&&!nearby.some(x=>x.loc.id===gate.id))nearby.push({loc:gate,distance:dist(here,gate)});
 }
 return nearby.filter(x=>!destroyed.has(x.loc.n)).map(x=>make(x.loc,null,x.distance));
}
export function worldMapSummary(j){
 const loc=worldLocationOf(j),routes=authoredRoutesFrom(loc);
 return {location:loc,region:regionLabel(loc.r),routes:routes.length,nearby:nearbyLocations(loc,{limit:5}).map(x=>x.loc),mapDanger:mapDangerFor(j,loc)};
}
