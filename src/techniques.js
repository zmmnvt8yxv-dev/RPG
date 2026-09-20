import {developmentEnabled} from './development.js';
const technique=(id,name,requires,description,bonus)=>({id,name,requires,description,bonus});
export const TECHNIQUES=[
 technique('observation_focus','Still-water perception',{haki_observation:30,battleIQ:30},'An authored discipline in reading movement: improves disengagement and reduces ambush losses.',{escape:1.12}),
 technique('future_sight','Future-sight discipline',{haki_observation:140,battleIQ:70},'A demanding advanced Observation discipline inspired by canon future sight; composure and training remain necessary.',{victory:1.1,escape:1.12}),
 technique('armament_flow','Flowing Armament',{haki_armament:70,fightingMastery:70},'Practice emitting Armament with minimal wasted force. This is earned training, not a bloodline gift.',{victory:1.12}),
 technique('internal_destruction','Internal-destruction discipline',{haki_armament:140,battleIQ:70},'A separate advanced Armament application. Its modest game bonus does not negate durability or power gaps.',{victory:1.12,lethal:1.08}),
 technique('conqueror_coating','Conqueror’s infusion',{haki_conqueror:140,haki_armament:70,fightingMastery:140},'Only existing Conqueror’s users can attempt this advanced application. It never grants the rare Haki type.',{victory:1.14,lethal:1.08}),
 technique('fruit_control','Precision fruit control',{fruitMastery:30,battleIQ:30},'Build reliable low-cost applications of your own fruit instead of copying another user’s powers.',{escape:1.1,spared:1.1}),
 technique('fruit_signature','A signature Devil Fruit technique',{fruitMastery:70,fightingMastery:30},'Create one repeatable application of the fruit you actually possess. No second fruit or unrelated ability is granted.',{victory:1.12}),
 technique('awakening_control','Awakening control',{fruitMastery:140,stamina:70},'Refine an already-awakened fruit. This practice does not unlock awakening for an unawakened user.',{victory:1.1,escape:1.06}),
 technique('blade_discipline','A blade without wasted motion',{weaponMastery_1:70,battleIQ:30},'An authored sword discipline emphasizing distance and commitment; no automatic black blade.',{victory:1.1,escape:1.06}),
 technique('sea_command','Command under fire',{battleIQ:70,fightingMastery:30},'Learn clear signals and retreat formations. The lessons improve survival without creating extra crew members.',{spared:1.18,escape:1.08}),
 technique('iron_resolve','Iron resolve',{endurance:140,durability:70},'Learn to preserve enough strength to survive a lost exchange.',{spared:1.15,wounded:1.1}),
 technique('precision_steps','Precision footwork',{speed:140,fightingMastery:70},'Develop efficient movement for creating a safe exit or a controlled opening.',{escape:1.15,victory:1.05}),
];
export const TECHNIQUE_BY_ID=Object.fromEntries(TECHNIQUES.map(t=>[t.id,t]));
export const techniqueReady=(j,t)=>Object.entries(t.requires).every(([key,xp])=>(j.skills[key]??-1)>=xp);
export function techniquePool(j){if(!developmentEnabled(j))return [];return TECHNIQUES.filter(t=>techniqueReady(j,t)&&!j.story.techniques?.includes(t.id)).map(t=>({value:t.id,label:t.name,weight:1,note:t.description}));}
export function techniqueOutcomes(j){
 const attempts=j.story.techniqueAttempts?.[j.pending.picks.technique]||0;
 return [{value:'learned',label:'Make the technique reliable',weight:35+Math.min(30,attempts*8),note:'Learn permanently. It cannot be learned again or lost through inactivity.'},{value:'progress',label:'Understand the missing step',weight:45,note:'Record an attempt; the next attempt is more likely to succeed.'},{value:'strain',label:'Push too hard and need recovery',weight:20+j.injury*2,note:'Injury +1. The attempt still contributes experience for next time.'}];
}
export function resolveTechnique(j,value){const id=j.pending.picks.technique,t=TECHNIQUE_BY_ID[id];j.story.techniqueAttempts??={};j.story.techniqueAttempts[id]=(j.story.techniqueAttempts[id]||0)+1;if(value==='learned'){j.story.techniques??=[];j.story.techniques.push(id);return [`Learned ${t.name}. ${t.description}`];}if(value==='strain')j.injury=Math.min(5,j.injury+1);return [`${t.name}: attempt ${j.story.techniqueAttempts[id]} recorded${value==='strain'?`; injury ${j.injury}/5`:''}. Future attempts improve.`];}
export function techniqueFactor(j,outcome){if(!developmentEnabled(j))return 1;return Math.min(1.5,(j.story.techniques||[]).reduce((n,id)=>n*(TECHNIQUE_BY_ID[id]?.bonus[outcome]||1),1));}
