import {SAGAS,SAGA_BY_ID} from './saga-data.js';
import {eras} from './engine.js';
import {worldLocationOf} from './world-map.js';

export {SAGAS,SAGA_BY_ID};
export const sagasEnabled=j=>j.rolls.length-(j.legacyCutover||0)>=(j.sagaCutover||0);
const stateOf=(j,id)=>j.story.sagas?.[id];
export function sagaStatus(j,s){
 const state=stateOf(j,s.id),loc=worldLocationOf(j);
 if(state?.ending)return {available:false,reason:`Concluded: ${state.ending}`};
 if(!s.eras.includes(eras.indexOf(j.character.era)))return {available:false,reason:'A different starting era'};
 if(s.cast.some(id=>j.story.dead.includes(id)))return {available:false,reason:'A required character has died in your timeline'};
 if(s.places.length&&s.places.every(name=>j.simulation?.destroyedLocations.includes(name)))return {available:false,reason:'The saga’s locations have been destroyed'};
 if(s.regions.length&&!s.regions.includes(loc.r))return {available:false,reason:`Travel to ${s.places.join(' / ')}`};
 if(s.places.length&&!s.places.includes(loc.n))return {available:false,reason:`Visit ${s.places.join(' / ')}`};
 return {available:true,reason:state?'Continue your unfinished promise':'A new story can begin here'};
}
export function sagaPool(j){
 if(!sagasEnabled(j))return [];
 return SAGAS.filter(s=>sagaStatus(j,s).available).map(s=>{
 const state=stateOf(j,s.id),recent=j.log.slice(-2).some(e=>e.sagaId===s.id);
 return {value:s.id,label:s.title,weight:(state?14:s.places.length?10:2)*(recent?.4:1),note:`${state?'Continue':'Begin'} · ${s.nodes[state?.node||'opening'].title}. ${s.anchor}`};
 });
}
export const EFFECTS={
 insight:{label:'Practice +8 Battle IQ; dream lead +1',weight:28,skill:8,clues:1},
 evidence:{label:'Evidence +1; practice +5 Battle IQ',weight:32,skill:5,evidence:1},
 trust:{label:'Crew loyalty +5; trust +1; canon bond +1',weight:30,loyalty:5,trust:1,bond:1},
 supply:{label:'Spend up to ฿10,000; trust +1',weight:22,cash:-10000,trust:1},
 wound:{label:'Injury +1; trust +1',weight:14,injury:1,trust:1},
 capture:{label:'Captured; government heat +1',weight:7,capture:true,heat:1},
 betrayal:{label:'฿20,000; crew loyalty −8; canon bond −2',weight:5,cash:20000,loyalty:-8,bond:-2},
 estranged:{label:'Canon bond −1; promise ends',weight:9,bond:-1},
 setback:{label:'Lose up to ฿5,000; preserve the story in your journal',weight:18,cash:-5000},
 sanctuary:{label:'Legacy +2; crew loyalty +8; local refuge; canon bond +2',weight:30,legacy:2,loyalty:8,bond:2,refuge:true},
 archive:{label:'Legacy +1; dream leads +2; lasting archive',weight:30,legacy:1,clues:2,archive:true},
 exposure:{label:'Dream leads +2; government heat +2; outlaw bounty +฿50,000',weight:24,clues:2,heat:2,bounty:50000},
};
export function sagaScene(j,id){const s=SAGA_BY_ID[id];return s?.nodes[stateOf(j,id)?.node||'opening'];}
export function sagaOptions(j,id){
 const s=SAGA_BY_ID[id],state=stateOf(j,id)||{},scene=sagaScene(j,id);
 return scene.edges.map(edge=>{
 const effect=EFFECTS[edge.effect];let weight=effect.weight;const reasons=[];
 if(['evidence','archive','insight'].includes(edge.effect)){weight*=1+(state.evidence||0)*.25+Math.min(j.skills.battleIQ||0,140)/280;reasons.push('Evidence and practiced judgment favor this path.');}
 if(['trust','sanctuary'].includes(edge.effect)){weight*=1+(state.trust||0)*.2;const bond=s.cast.reduce((n,id)=>n+(j.story.relationships[id]?.score||0),0);weight*=Math.max(.3,1+bond*.08);reasons.push('Trust and existing canon relationships shape these odds.');}
 if(['wound','capture','setback'].includes(edge.effect)){weight*=1+j.injury*.12+(j.story.sagaHeat||0)*.05;reasons.push('Injury and accumulated government heat increase the risk.');}
 if(edge.effect==='supply'&&j.berries<10000){weight*=.35;reasons.push('Limited funds make provisioning harder; no debt is created.');}
 if(edge.effect==='betrayal'&&j.character.faction==='Cipher Pol'){weight*=1.5;reasons.push('Intelligence contacts make this bargain more accessible.');}
 const next=edge.next?s.nodes[edge.next].title:'Concludes this saga';
 return {value:edge.id,label:edge.label,weight,note:`${edge.detail} → ${next}. ${effect.label}. ${reasons.join(' ')}`};
 });
}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function resolveSaga(j,id,value){
 const saga=SAGA_BY_ID[id],scene=sagaScene(j,id),edge=scene.edges.find(e=>e.id===value),f=EFFECTS[edge.effect];
 j.story.sagas??={};const state=j.story.sagas[id]??={node:'opening',evidence:0,trust:0,history:[]};
 const effects=[edge.detail];
 state.history.push({node:state.node,edge:value,chapter:j.chapter+1,location:j.story.location});
 state.evidence+=f.evidence||0;state.trust+=f.trust||0;
 if(f.skill&&'battleIQ' in j.skills){const before=j.skills.battleIQ;j.skills.battleIQ=Math.min(140,before+f.skill);effects.push(`Battle IQ practice +${j.skills.battleIQ-before}.`);}
 if(f.clues){j.story.dreamClues+=f.clues;effects.push(`Dream leads +${f.clues}.`);}
 if(f.cash){const before=j.berries;j.berries=Math.max(0,j.berries+f.cash);effects.push(`Berries ${j.berries-before>=0?'+':''}${j.berries-before}; purse ${j.berries}.`);}
 if(f.injury){j.injury=clamp(j.injury+f.injury,0,5);effects.push(`Injury burden ${j.injury}/5.`);}
 if(f.capture){j.captured=true;effects.push('Detained. Prison wheels replace the horizon until you are freed.');}
 if(f.loyalty){for(const c of j.crew)c.loyalty=clamp((c.loyalty??55)+f.loyalty,0,100);if(j.crew.length)effects.push(`Every current companion: loyalty ${f.loyalty>0?'+':''}${f.loyalty} before their background turn.`);}
 if(f.bond)for(const id of saga.cast.filter(id=>!j.story.dead.includes(id))){const b=j.story.relationships[id]||{score:0,meetings:0,last:-1,victories:0};j.story.relationships[id]={...b,score:clamp(b.score+f.bond,-5,5),last:j.chapter+1};}
 if(f.bond&&saga.cast.length)effects.push(`Word of your actions changes the saga cast’s regard by ${f.bond>0?'+':''}${f.bond}; this is reputation, not an invented personal meeting.`);
 if(f.legacy){j.story.legacy+=f.legacy;effects.push(`Legacy +${f.legacy}.`);}
 if(f.heat){j.story.sagaHeat=clamp((j.story.sagaHeat||0)+f.heat,0,10);effects.push(`Government heat ${j.story.sagaHeat}/10; later saga setbacks become more likely.`);}
 if(f.bounty&&['Pirate','Revolutionary'].includes(j.character.faction)){j.bounty+=f.bounty;effects.push(`Government bounty +${f.bounty}.`);}
 if(f.refuge){j.story.refuges??=[];if(!j.story.refuges.includes(j.story.location))j.story.refuges.push(j.story.location);effects.push('A lasting refuge here favors future recovery and rescue chapters.');}
 if(f.archive){j.story.archives??=[];j.story.archives.push(saga.id);effects.push('A preserved archive favors reflection and future dream research.');}
 state.node=edge.next;
 if(!edge.next){state.ending=edge.label;state.completedChapter=j.chapter+1;effects.push(`Saga concluded: ${saga.title}. This ending cannot be farmed or rerolled.`);}
 else effects.push(`Next thread: ${saga.nodes[edge.next].title}. Other chapters can happen before this promise returns.`);
 return effects;
}
