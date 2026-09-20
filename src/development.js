import {TRACKS,XP_LEVELS,TRAINING_LABELS} from './journey-data.js';
export const trackForSkill=key=>key.startsWith('haki_')?TRACKS.haki:key.startsWith('weaponMastery_')?TRACKS.weapon:TRACKS[key]||TRACKS.stat;
export const skillCap=key=>XP_LEVELS[trackForSkill(key).length-1];
export const canImprove=(j,key)=>key in j.skills&&j.skills[key]<skillCap(key);
export const skillName=key=>TRAINING_LABELS[key]||`Weapon ${key.split('_').at(-1)} mastery`;
// Pin an event's rules at its start: a loaded old pending event finishes under its original rules.
export const developmentEnabled=j=>j.pending?j.pending.developmentVersion===1:j.rolls.length-(j.legacyCutover||0)>=(j.developmentCutover||0);
export function availablePractice(j){return Object.keys(j.skills).filter(k=>canImprove(j,k));}
export function grantPractice(j,key,amount,effects){
 if(!canImprove(j,key))return 0;
 const gain=Math.min(amount,skillCap(key)-j.skills[key]);j.skills[key]+=gain;effects.push(`${skillName(key)} +${gain} practice${!canImprove(j,key)?' · MAXED':''}.`);return gain;
}
export function usefulPractice(j,key,amount,effects){
 if(grantPractice(j,key,amount,effects))return;
 // Incidental experience is never silently discarded; dedicated practice is filtered before selection.
 j.story.legacy++;effects.push(`${skillName(key)} is already mastered; you pass the lesson on. Legacy +1.`);
}
export function filterGrowthRewards(j,options,map){return developmentEnabled(j)?options.filter(o=>!map[o.value]||canImprove(j,map[o.value])):options;}
export const INTENTS={
 combat:[
 {value:'balanced',label:'Read the fight',weight:1,note:'Keep the baseline balance between winning and surviving.'},
 {value:'press',label:'Fight for victory',weight:1,note:'Victory and lethal victory ×1.35; escape ×0.55; injury and death ×1.2. Great power gaps still matter.'},
 {value:'protect',label:'Protect your people',weight:1,note:'Rescue/mercy ×1.7; controlled victory ×1.15; lethal victory ×0.45. Crew support helps you hold the line.'},
 {value:'withdraw',label:'Get everyone out',weight:1,note:'Escape ×1.8; death ×0.75; victories ×0.55. Escape remains uncertain.'}],
 saga:[
 {value:'balanced',label:'Keep your options open',weight:1,note:'Use the story’s baseline odds and the evidence you already hold.'},
 {value:'investigate',label:'Find the truth',weight:1,note:'Insight, evidence and archive outcomes ×1.5; capture ×1.2. Better information can attract scrutiny.'},
 {value:'protect',label:'Put people first',weight:1,note:'Trust and sanctuary ×1.5; supply and injury ×1.2. Saving people can cost resources or health.'},
 {value:'profit',label:'Pursue your own advantage',weight:1,note:'Profitable betrayal ×2 where available; sanctuary ×0.6. Your crew and canon contacts remember the result.'}],
};
export function intentWeight(intent,value){
 const maps={press:{victory:1.35,lethal:1.35,escape:.55,wounded:1.2,death:1.2},protect:{spared:1.7,victory:1.15,lethal:.45,trust:1.5,sanctuary:1.5,supply:1.2,wound:1.2},withdraw:{escape:1.8,death:.75,victory:.55,lethal:.55},investigate:{insight:1.5,evidence:1.5,archive:1.5,capture:1.2},profit:{betrayal:2,sanctuary:.6}};
 return maps[intent]?.[value]||1;
}
