import {LOCATIONS_EAST_BLUE} from './world/locations-east-blue.js';
import {LOCATIONS_NORTH_BLUE} from './world/locations-north-blue.js';
import {LOCATIONS_SOUTH_BLUE} from './world/locations-south-blue.js';
import {LOCATIONS_WEST_BLUE} from './world/locations-west-blue.js';
import {LOCATIONS_PARADISE} from './world/locations-paradise.js';
import {LOCATIONS_NEW_WORLD} from './world/locations-new-world.js';
import {LOCATIONS_CALM_BELT} from './world/locations-calm-belt.js';
import {LOCATIONS_RED_LINE} from './world/locations-red-line.js';
import {ROUTES_PARADISE} from './world/routes-paradise.js';
import {ROUTES_REVERSE} from './world/routes-reverse.js';
import {REGION_ROWS,DANGER_ROWS,BARRIER_ROWS,LEGACY_LOCATION_ALIASES,WORLD_MAP_BOUNDS} from './world/meta.js';

const locationRows=[
 ...LOCATIONS_EAST_BLUE,...LOCATIONS_NORTH_BLUE,...LOCATIONS_SOUTH_BLUE,...LOCATIONS_WEST_BLUE,
 ...LOCATIONS_PARADISE,...LOCATIONS_NEW_WORLD,...LOCATIONS_CALM_BELT,...LOCATIONS_RED_LINE,
];
const routeRows=[...ROUTES_PARADISE,...ROUTES_REVERSE];
export const WORLD_REGIONS=REGION_ROWS.map(([id,name,type])=>({id,name,type}));
export const WORLD_LOCATIONS=locationRows.map(([id,name,region,type,faction,climate,importance,x,y,magnetic,parent])=>({id,name,region,type,faction,climate,importance,x,y,magnetic,parent}));
const authoredRoutes=routeRows.map(([id,fromId,toId,type,days,danger,unlock,oneWay,requiresShip,gate,barrier,outcomeChance,factionAccess,group])=>({id,fromId,toId,type,days,danger,unlock,oneWay,requiresShip,gate,barrier,outcomeChance,factionAccess,group,authored:true}));
export const SPECIAL_ROUTES=[
 {id:'game:sabaody-fishman',fromId:'island_sabaody_archipelago',toId:'island_fish_man_island',type:'coated_descent',days:3,danger:5,unlock:'ship_coating',oneWay:false,requiresShip:true,gate:'',barrier:'barrier_red_line_10',outcomeChance:.35,factionAccess:'public',group:'Red Line passage',authored:false},
 {id:'game:fishman-newworld',fromId:'island_fish_man_island',toId:'island_g_1',type:'red_line_passage',days:3,danger:5,unlock:'new_world_passage',oneWay:false,requiresShip:true,gate:'',barrier:'barrier_red_line_10',outcomeChance:.35,factionAccess:'public',group:'New World gateway',authored:false},
];
export const WORLD_ROUTES=[...authoredRoutes,...SPECIAL_ROUTES];
export const WORLD_DANGER_ZONES=DANGER_ROWS.map(([id,name,type,region,severity,radius,x,y])=>({id,name,type,region,severity,radius,x,y}));
export const WORLD_BARRIERS=BARRIER_ROWS.map(([id,type,passable,travelCost,encounterChance,bypass])=>({id,type,passable,travelCost,encounterChance,bypass}));
export {WORLD_MAP_BOUNDS};

const byId=new Map(WORLD_LOCATIONS.map(x=>[x.id,x]));
const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim();
const byName=new Map(WORLD_LOCATIONS.map(x=>[norm(x.name),x]));
const aliasMap=new Map(Object.entries(LEGACY_LOCATION_ALIASES).map(([name,id])=>[norm(name),id]));
const regionById=new Map(WORLD_REGIONS.map(x=>[x.id,x]));
const routesByFrom=new Map();
for(const r of WORLD_ROUTES){
 if(!routesByFrom.has(r.fromId))routesByFrom.set(r.fromId,[]);
 routesByFrom.get(r.fromId).push(r);
 if(!r.oneWay){
  const reverse={...r,id:r.id+':reverse',fromId:r.toId,toId:r.fromId,reverse:true};
  if(!routesByFrom.has(reverse.fromId))routesByFrom.set(reverse.fromId,[]);
  routesByFrom.get(reverse.fromId).push(reverse);
 }
}

export function worldLocation(ref){
 if(!ref)return null;
 if(typeof ref==='object'&&ref.id)return byId.get(ref.id)||ref;
 if(byId.has(ref))return byId.get(ref);
 const alias=aliasMap.get(norm(ref));if(alias&&byId.has(alias))return byId.get(alias);
 return byName.get(norm(ref))||null;
}
export function worldRegion(ref){
 const loc=worldLocation(ref);
 return regionById.get(loc?.region||ref)||null;
}
export function storyLocation(j){
 const loc=worldLocation(j?.story?.locationId)||worldLocation(j?.story?.location);
 if(loc&&j?.story){j.story.locationId=loc.id;j.story.location=loc.name;}
 return loc;
}
export function broadRegionIndex(ref){
 const region=worldRegion(ref)?.id||worldLocation(ref)?.region||ref;
 if(['east_blue','north_blue','south_blue','west_blue'].includes(region))return 0;
 if(['paradise','calm_belt','red_line'].includes(region))return 1;
 if(region==='new_world')return 2;
 return 0;
}
export function authoredRoutesFrom(ref){
 const loc=worldLocation(ref);return loc?[...(routesByFrom.get(loc.id)||[])]:[];
}
export function distanceBetween(a,b){
 a=worldLocation(a);b=worldLocation(b);if(!a||!b)return Infinity;
 const width=WORLD_MAP_BOUNDS.right-WORLD_MAP_BOUNDS.left;
 let dx=Math.abs(a.x-b.x);dx=Math.min(dx,Math.max(0,width-dx));
 return Math.hypot(dx,a.y-b.y);
}
export function estimateTravelDays(a,b){return Math.max(1,Math.round(distanceBetween(a,b)/10*10)/10);}
const regionBaseDanger={east_blue:1,north_blue:1.5,south_blue:1.5,west_blue:1.5,paradise:2.5,new_world:3.5,calm_belt:5,red_line:5};
export function syntheticRoutesFrom(ref,{limit=7,destroyed=[]}={}){
 const here=worldLocation(ref);if(!here)return[];
 const destroyedSet=new Set(destroyed);
 if(['calm_belt','red_line'].includes(here.region))return[];
 const rows=WORLD_LOCATIONS.filter(x=>x.id!==here.id&&x.region===here.region&&!destroyedSet.has(x.id))
  .map(x=>({loc:x,distance:distanceBetween(here,x)}))
  .filter(x=>Number.isFinite(x.distance)&&x.distance>0)
  .sort((a,b)=>a.distance-b.distance);
 const sameParent=rows.filter(x=>here.parent&&x.loc.parent===here.parent).slice(0,2);
 const selected=[...sameParent];
 for(const row of rows){
  if(selected.some(x=>x.loc.id===row.loc.id))continue;
  if(row.loc.parent&&row.loc.parent===here.id||here.parent&&row.loc.id===here.parent||!row.loc.parent)selected.push(row);
  if(selected.length>=limit)break;
 }
 return selected.slice(0,limit).map(({loc,distance},i)=>({
  id:`synthetic:${here.id}:${loc.id}`,fromId:here.id,toId:loc.id,type:here.parent&&loc.parent===here.parent?'local':'open_sea',
  days:estimateTravelDays(here,loc),danger:Math.min(5,(regionBaseDanger[here.region]||2)+distance/180),unlock:'open_navigation',
  oneWay:false,requiresShip:!(here.parent&&loc.parent===here.parent),gate:'',barrier:'',outcomeChance:null,factionAccess:'public',group:'charted proximity route',synthetic:true,
 }));
}
export function mapPosition(ref){
 const loc=worldLocation(ref);if(!loc)return null;
 const {left,right,top,bottom}=WORLD_MAP_BOUNDS;
 return {left:(loc.x-left)/(right-left)*100,top:(top-loc.y)/(top-bottom)*100};
}
export function staticDangerAt(ref){
 const loc=worldLocation(ref);if(!loc)return 0;
 let n=0;
 for(const z of WORLD_DANGER_ZONES){
  if(z.region!==loc.region)continue;
  const d=Math.hypot(loc.x-z.x,loc.y-z.y);
  if(d<=z.radius)n=Math.max(n,z.severity);
 }
 if(loc.region==='calm_belt'||loc.region==='red_line')n=Math.max(n,5);
 return n;
}
export function regionName(ref){return worldRegion(ref)?.name||'Unknown waters';}
export const WORLD_COUNTS={locations:WORLD_LOCATIONS.length,routes:WORLD_ROUTES.length,authoredRoutes:authoredRoutes.length,gameBridgeRoutes:SPECIAL_ROUTES.length,regions:WORLD_REGIONS.length,dangerZones:WORLD_DANGER_ZONES.length};
