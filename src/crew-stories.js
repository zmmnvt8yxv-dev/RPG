import {developmentEnabled} from './development.js';
export const CREW_DREAMS={
 Navigator:{dream:'An atlas no crew has to die to finish',steps:['Recover a chart lost in a wreck','Test a route through a dangerous current','Publish a safe passage for ordinary sailors'],perk:'Navigator network',benefit:'Storm safe-outcome weight +20% while this specialist sails with you.'},
 Doctor:{dream:'A clinic that turns nobody away',steps:['Document an illness in an overlooked port','Supply a working treatment program','Train a local team to run the clinic'],perk:'Shipboard triage',benefit:'Illness recovery weight +25% while this specialist sails with you.'},
 Cook:{dream:'A table where enemies can eat together',steps:['Recover a family recipe from a divided port','Provision a hungry community','Open a kitchen that survives without your crew'],perk:'Restorative meals',benefit:'Quiet rest heals one additional injury while this specialist sails with you.'},
 Shipwright:{dream:'A hull that brings everyone home',steps:['Salvage a master builder’s unfinished design','Test the repairs through a difficult passage','Build a vessel ordinary crews can maintain'],perk:'Emergency repairs',benefit:'Shipwreck safe-outcome weight +25% while this specialist sails with you.'},
 Lookout:{dream:'To see the danger before it takes someone',steps:['Chart the harbor’s blind approaches','Expose a false distress signal','Train a watch team for civilian ships'],perk:'Early warning',benefit:'Combat escape weight +10% while this specialist sails with you.'},
 Helmsman:{dream:'A passage through the impossible current',steps:['Learn the current’s seasonal rhythm','Guide a relief vessel through its opening','Teach a local pilot to repeat the route'],perk:'Steady helm',benefit:'Storm and shipwreck injury/death weights ×0.85 while this specialist sails with you.'},
 Fighter:{dream:'Strength that can protect without ruling',steps:['Keep a promise in a one-sided dispute','Defend someone who once opposed you','Train a neighborhood to protect itself'],perk:'Trusted rearguard',benefit:'Combat mercy/rescue weight +15% while this specialist sails with you.'},
 Musician:{dream:'A song that gets the lost remembered',steps:['Collect a missing verse from a survivor','Perform it where the story was suppressed','Teach it to people who will carry it onward'],perk:'A shared refrain',benefit:'Background crew bond weight +20% while this specialist sails with you.'},
 Scholar:{dream:'An archive that belongs to its people',steps:['Authenticate a fragment with its community','Preserve copies in separate safe places','Train the next custodian of the collection'],perk:'Research partnership',benefit:'Saga evidence and insight weights +15% while this specialist sails with you.'},
 Quartermaster:{dream:'A supply line no profiteer can hold hostage',steps:['Expose shortages hidden in the accounts','Open a fair replacement supply route','Put the route under local management'],perk:'Honest accounts',benefit:'Trade profit weight +20% while this specialist sails with you.'},
};
const CANON_ROLES={Nami:'Navigator',Sanji:'Cook',Chopper:'Doctor',Franky:'Shipwright',Brook:'Musician',Robin:'Scholar',Jinbe:'Helmsman',Usopp:'Lookout',Crocus:'Doctor',Zeff:'Cook'};
export const crewRole=m=>CREW_DREAMS[m.role]?m.role:m.canon?(CANON_ROLES[m.name.split(' ').at(-1)]||'Fighter'):'Fighter';
export const crewDream=m=>CREW_DREAMS[crewRole(m)];
export const memberProgress=(j,m)=>j.story.crewStories?.[m.name]||{stage:0,history:[]};
export function crewStoryPool(j){if(!developmentEnabled(j))return [];return j.crew.filter(m=>memberProgress(j,m).stage<3||m.injury>0||m.loyalty<80).map(m=>({value:m.name,label:`${m.name} · ${m.role}`,weight:1,note:`${crewDream(m).dream}. ${memberProgress(j,m).stage}/3 milestones · loyalty ${m.loyalty??55}/100.`}));}
export function crewIntents(j){const m=j.crew.find(m=>m.name===j.pending.picks.crewFocus),s=memberProgress(j,m),d=crewDream(m);return [
 ...(s.stage<3?[{value:'dream',label:`Support: ${d.steps[s.stage]}`,weight:1,note:'Their goal gets a chapter of its own. Loyalty and completed milestones help; setbacks can strain trust.'}]:[]),
 ...(m.injury>0?[{value:'care',label:'Make time for their recovery',weight:1,note:'Improve their chance of healing; medical companions help.'}]:[]),
 {value:'reconcile',label:'Listen and rebuild trust',weight:1,note:'Seek a stronger bond. An unresolved argument can instead reduce loyalty.'}];}
export function crewOutcomes(j){const m=j.crew.find(m=>m.name===j.pending.picks.crewFocus),i=j.pending.picks.crewIntent,loyalty=m.loyalty??55;return [
 {value:'progress',label:i==='dream'?'Their personal milestone is achieved':i==='care'?'Recovery gives them their strength back':'You understand each other better',weight:35+loyalty*.35+(i==='care'&&j.crew.some(c=>crewRole(c)==='Doctor')?15:0),note:i==='dream'?'Milestone +1; loyalty +8; power +2. Completing all three unlocks a crew specialty.':i==='care'?'Companion injury −2; loyalty +5.':'Companion loyalty +12.'},
 {value:'costly',label:'Progress asks for a shared sacrifice',weight:25,note:'Spend up to ฿8,000; loyalty +5. For a dream, complete the milestone; for recovery, heal one injury.'},
 {value:'friction',label:'The old disagreement returns',weight:12+(100-loyalty)*.15,note:'Loyalty −8. The unfinished goal remains available.'}];}
export function resolveCrewStory(j,value){
 const m=j.crew.find(m=>m.name===j.pending.picks.crewFocus),i=j.pending.picks.crewIntent,d=crewDream(m);j.story.crewStories??={};const st=j.story.crewStories[m.name]??={stage:0,history:[]};st.history.push({intent:i,result:value,chapter:j.chapter+1});const e=[];
 if(value==='friction'){m.loyalty=Math.max(0,(m.loyalty??55)-8);return [`${m.name} does not feel heard. Loyalty ${m.loyalty}/100; their goal remains unfinished.`];}
 if(value==='costly'){const cost=Math.min(j.berries,8000);j.berries-=cost;e.push(`Shared sacrifice costs ฿${cost}.`);}
 m.loyalty=Math.min(100,(m.loyalty??55)+(value==='costly'?5:i==='dream'?8:i==='care'?5:12));
 if(i==='care')m.injury=Math.max(0,(m.injury||0)-(value==='costly'?1:2));
 if(i==='dream'){e.push(`${m.name}: ${d.steps[st.stage]}.`);st.stage++;m.power=Math.min(100,(m.power??10)+2);if(st.stage===3){st.perk=d.perk;st.role=crewRole(m);e.push(`Dream fulfilled. ${d.perk}: ${d.benefit}`);j.story.legacy++;}}
 e.push(`${m.name}: loyalty ${m.loyalty}/100${i==='care'?`; injury ${m.injury}/5`:''}.`);return e;
}
export function hasCrewPerk(j,role){return developmentEnabled(j)&&j.crew.some(m=>crewRole(m)===role&&memberProgress(j,m).stage===3);}
export function crewPerkFactor(j,event,outcome){
 let f=1;
 if(event==='storm'&&outcome==='safe'&&hasCrewPerk(j,'Navigator'))f*=1.2;
 if(event==='shipwreck'&&outcome==='safe'&&hasCrewPerk(j,'Shipwright'))f*=1.25;
 if(['storm','shipwreck'].includes(event)&&['hurt','death'].includes(outcome)&&hasCrewPerk(j,'Helmsman'))f*=.85;
 if(event==='illness'&&outcome==='recover'&&hasCrewPerk(j,'Doctor'))f*=1.25;
 if(event==='combat'&&outcome==='escape'&&hasCrewPerk(j,'Lookout'))f*=1.1;
 if(event==='combat'&&outcome==='spared'&&hasCrewPerk(j,'Fighter'))f*=1.15;
 if(event==='saga'&&['evidence','insight'].includes(outcome)&&hasCrewPerk(j,'Scholar'))f*=1.15;
 if(event==='trade'&&outcome==='profit'&&hasCrewPerk(j,'Quartermaster'))f*=1.2;
 return f;
}
