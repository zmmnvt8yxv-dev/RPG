import {eras} from './engine.js';
import {worldLocationOf} from './world-map.js';
import {developmentEnabled} from './development.js';
const crisis=(id,title,era,places,cast,target,enemy,threat,premise,stakes,source)=>({id,title,era,places,cast,target,enemy,threat,premise,stakes,source});
export const CROSSROADS=[
 crisis('ace','Rewrite the execution at Marineford',[2],['Marineford','Sabaody Archipelago','Impel Down'],['ace','whitebeard','koby'],'ace','akainu',132,'Ace’s scheduled execution brings a war to Marineford. You can attempt to change his fate by building a route out, gathering help, and surviving the final rescue.','Success saves Ace in your timeline. A failed final rescue can kill him permanently. Saving him does not automatically defeat an admiral.','marineford'),
 crisis('wano','Break the Beast Pirates’ occupation',[3],['Wano Country'],['kinemon','yamato','hyogoro'],null,'kaido',145,'The resistance needs prisoners freed, supply routes secured, and a force capable of surviving an Emperor. A lone challenge is very different from a liberation campaign.','Success deposes Kaido locally and creates a liberated territory. It does not automatically kill him, cure SMILE, or clean the rivers.','land_of_wano2'),
 crisis('dressrosa','End Doflamingo’s rule',[3],['Dressrosa Kingdom','Green Bit'],['law','robin'],null,'doflamingo',100,'Gather evidence, protect the forgotten, and build an alliance before confronting the ruler whose underworld reaches beyond Dressrosa.','Success ends the local regime and creates a liberated territory. Surviving enemies and brokers may return.','dressrosa'),
 crisis('egghead','Bring Vegapunk out alive',[3],['Egghead Island','G-14'],['vegapunk','bonney','kuma'],'vegapunk','kizaru',128,'A government siege threatens the scientist and the people carrying his research. An evacuation needs more than a powerful fighter: it needs a vessel, timing, and a protected route.','Success preserves the scientist in this alternate timeline and creates a research archive. Failed extraction can permanently kill the target.','egghead'),
 crisis('alabasta','Expose and overturn Baroque Works',[2,3],['Alabasta Kingdom','Rainbase','Alubarna'],['vivi','smoker'],null,'crocodile',70,'Two armies are fighting over a lie. Your campaign can establish the evidence, win neutral support, and break Crocodile’s hold over the country.','Victory creates a liberated civic territory. Your role is recorded without automatically crowning you its monarch.','alabasta'),
 crisis('emperor','Challenge an Emperor’s claim',[3],['Whole Cake Island','Wano Country'],[],null,null,142,'Your flag has become a challenge to an Emperor’s local authority. A campaign needs allies, supplies, and strength; arriving in their waters does not make you their equal.','Success establishes your flag over this island and an Emperor contender title. It does not grant the entire New World or an official universal ranking.','land_of_wano2'),
];
export const CROSSROAD_BY_ID=Object.fromEntries(CROSSROADS.map(c=>[c.id,c]));
export const CAMPAIGN_STAGES=['Intelligence','Coalition','Decisive operation'];
export const campaignStatus=(j,c)=>{
 if(j.story.campaigns?.[c.id]?.ending)return 'Concluded';
 if(c.id==='emperor'&&j.character.faction!=='Pirate')return 'A pirate flag is required to claim an Emperor’s territory';
 if(!c.era.includes(eras.indexOf(j.character.era)))return 'Different starting era';
 if(!c.places.includes(worldLocationOf(j).n))return `Travel to ${c.places.join(' / ')}`;
 const state=j.story.campaigns?.[c.id];
 if(state?.location&&!c.target&&state.location!==j.story.location)return `Return to ${state.location} to continue this campaign`;
 const enemy=state?.enemy||c.enemy||(j.story.location==='Wano Country'?'kaido':'bigmom');
 if((c.target&&j.story.dead.includes(c.target))||j.story.dead.includes(enemy))return 'A central figure has already died';
 if(j.simulation?.destroyedLocations.includes(j.story.location))return 'This location has been destroyed';
 if(j.story.deposed?.includes(enemy))return 'This ruler has already lost their claim';
 return null;
};
export function campaignPool(j){if(!developmentEnabled(j))return [];return CROSSROADS.filter(c=>!campaignStatus(j,c)).map(c=>({value:c.id,label:c.title,weight:j.story.campaigns?.[c.id]?10:3,note:`${CAMPAIGN_STAGES[j.story.campaigns?.[c.id]?.stage||0]}. ${c.stakes}`}));}
export const campaignIntents=j=>{
 const c=CROSSROAD_BY_ID[j.pending.picks.campaign],stage=j.story.campaigns?.[c.id]?.stage||0;
 return stage<2?[
 {value:'careful',label:stage===0?'Build reliable intelligence':'Win willing allies',weight:1,note:'Patient preparation: higher clean-success odds, modest gains.'},
 {value:'bold',label:stage===0?'Steal a decisive opening':'Rally a public coalition',weight:1,note:'Successful preparation is twice as valuable; exposure, injury and detention are more likely.'},
 ...(j.berries>=25000?[{value:'fund',label:'Fund a prepared operation',weight:1,note:'Commit ฿25,000. Better support odds; money cannot guarantee success.'}]:[]),
 {value:'abandon',label:'Withdraw from this campaign',weight:1,note:'End this attempt without changing canon fates. Existing injuries and sacrifices remain.'}]:[
 {value:'careful',label:c.target?'Extract the target and withdraw':'Break the regime’s command network',weight:1,note:'Use preparation and allies. Success changes the local outcome without requiring you to personally beat every enemy.'},
 {value:'bold',label:c.target?'Force a passage through the enemy':'Challenge the ruler directly',weight:1,note:'Personal combat power matters much more. Against an overwhelming opponent, direct confrontation is extremely dangerous.'},
 {value:'abandon',label:'Call off the final operation',weight:1,note:'Your campaign ends without rewriting this canon event.'}];
};
export function campaignOutcomes(j,power){
 const c=CROSSROAD_BY_ID[j.pending.picks.campaign],state=j.story.campaigns?.[c.id]||{stage:0,intel:0,allies:0},intent=j.pending.picks.campaignIntent;
 if(intent==='abandon')return [{value:'withdrawn',label:'Bring the campaign to a close',weight:1,note:'No target death or victory is invented.'}];
 if(state.stage<2)return [
 {value:'prepared',label:state.stage===0?'Secure a credible opening':'The coalition stands together',weight:intent==='fund'?62:intent==='careful'?55:43,note:`${intent==='bold'?2:1} preparation point${intent==='bold'?'s':''}; advance to the next stage.`},
 {value:'costly',label:'Advance at a painful cost',weight:30,note:'Preparation +1, injury +1; advance to the next stage.'},
 {value:'exposed',label:'The operation is exposed',weight:intent==='bold'?25:12,note:'No preparation point. Advance under government scrutiny.'},
 {value:'detained',label:'Your contact leads into a trap',weight:intent==='bold'?10:3,note:'You are captured. The campaign waits for your release; this stage remains unresolved.'}];
 const effective=power+(intent==='bold'?4:12)*(state.intel+state.allies),ratio=Math.max(.05,Math.min(2,effective/c.threat));
 // These are mission odds, not a claim that an untrained character can defeat an Emperor.
 const success=Math.min(72,Math.max(1,(intent==='bold'?28:38)*ratio));
 const death=Math.min(35,(intent==='bold'?12:4)/Math.max(.25,ratio));
 return [
 {value:'victory',label:c.target?'The target leaves the battlefield alive':'The old regime loses its hold',weight:success,note:c.stakes},
 {value:'retreat',label:'Survive, but the decisive operation fails',weight:25,note:'The attempt ends. Injury +2. No victory is recorded.'},
 {value:'catastrophe',label:c.target?'The rescue fails; the target is killed':'Your coalition is broken',weight:Math.max(8,40-success*.3),note:c.target?'The target dies permanently in your alternate timeline.':'The attempt ends. Your crew loses loyalty and you are captured.'},
 {value:'death',label:'You die during the decisive operation',weight:death,note:'Your journey ends permanently.'}];
}
const title=id=>id==='ace'?'Ace':id==='vegapunk'?'Dr. Vegapunk':id;
export function resolveCampaign(j,value){
 const c=CROSSROAD_BY_ID[j.pending.picks.campaign];j.story.campaigns??={};
 const st=j.story.campaigns[c.id]??={stage:0,intel:0,allies:0,location:j.story.location,enemy:c.enemy||(j.story.location==='Wano Country'?'kaido':'bigmom'),history:[]};
 const intent=j.pending.picks.campaignIntent,e=[];
 st.history.push({stage:st.stage,intent,result:value,chapter:j.chapter+1});
 if(intent==='fund'){j.berries-=25000;e.push('Committed ฿25,000 to the operation.');}
 if(value==='withdrawn'){st.ending='Withdrawn';e.push('You withdraw. This campaign cannot be restarted for better rolls.');return e;}
 if(st.stage<2){
 if(value==='detained'){j.captured=true;e.push('Captured. This campaign stage remains open after release.');return e;}
 const gain=value==='prepared'?(intent==='bold'?2:1):value==='costly'?1:0;
 st[st.stage===0?'intel':'allies']+=gain;st.stage++;
 if(value==='costly')j.injury=Math.min(5,j.injury+1);
 if(value==='exposed')j.story.sagaHeat=Math.min(10,(j.story.sagaHeat||0)+2);
 e.push(`Preparation: intelligence ${st.intel}, coalition ${st.allies}. Next: ${CAMPAIGN_STAGES[st.stage]}.`);return e;
 }
 st.ending=value;st.completedChapter=j.chapter+1;j.story.canonFates??={};
 if(value==='victory'){
 j.story.legacy+=3;
 if(c.target){j.story.canonFates[c.target]={status:'Saved',chapter:j.chapter+1,campaign:c.title};e.push(`${title(c.target)} survives your intervention. This is a major divergence from the source timeline.`);if(c.id==='egghead'){j.story.archives??=[];j.story.archives.push('egghead-rescue');}}
 else{j.story.deposed??=[];j.story.deposed.push(st.enemy);j.story.canonFates[st.enemy]={status:'Deposed locally',chapter:j.chapter+1,campaign:c.title};j.story.territories??={};j.story.territories[j.story.location]={ruler:c.id==='emperor'?'Your flag':'Local council',stability:55,prosperity:35,defenses:35,visits:0};e.push(`${j.story.location} becomes ${c.id==='emperor'?'your claimed territory':'a liberated territory under a local council'}. Its future now depends on stewardship.`);if(c.id==='emperor'){j.story.titles??=[];if(!j.story.titles.includes('Emperor contender'))j.story.titles.push('Emperor contender');}}
 if(j.simulation){j.simulation.stability=Math.min(100,j.simulation.stability+4);j.simulation.governmentControl=Math.max(0,j.simulation.governmentControl-3);e.push('World stability +4; centralized government control −3.');}
 e.push('Legacy +3. Your victory is a persistent part of this world.');
 }else if(value==='retreat'){j.injury=Math.min(5,j.injury+2);e.push(`You escape with injury ${j.injury}/5. The campaign is over.`);}
 else if(value==='catastrophe'){
 if(c.target){if(!j.story.dead.includes(c.target))j.story.dead.push(c.target);j.story.canonFates[c.target]={status:'Killed',chapter:j.chapter+1,campaign:c.title};e.push(`${title(c.target)} is dead and removed from future encounters and rescues.`);}else{j.captured=true;for(const m of j.crew)m.loyalty=Math.max(0,(m.loyalty??55)-15);e.push('The coalition collapses. Captured; current crew loyalty −15.');}
 }else if(value==='death'){j.alive=false;j.cause=`Killed during ${c.title}`;e.push(`Your journey ends: ${j.cause}.`);}
 return e;
}
export function territoryIntents(j){const t=j.story.territories?.[j.story.location];if(!t)return [];return [
 {value:'protect',label:'Protect and rebuild',weight:1,note:'Invest effort in defenses and public safety.'},
 {value:'prosper',label:'Reopen trade and civic services',weight:1,note:'Build prosperity and local stability.'},
 {value:'tribute',label:'Demand tribute for your protection',weight:1,note:'Gain berries, but risk resentment and collapse of your legitimacy.'}];}
export function territoryOutcomes(j){const t=j.story.territories[j.story.location],i=j.pending.picks.territoryIntent;return [
 {value:'success',label:i==='tribute'?'The territory pays':'The community makes lasting progress',weight:35+t.stability*.4+(i==='prosper'?t.prosperity*.15:0),note:i==='tribute'?'฿20,000; stability −15.':'Target attribute +15; stability +5.'},
 {value:'unrest',label:'Local resistance disrupts the plan',weight:15+(100-t.stability)*.35,note:'Stability −12. At zero, the territory becomes independent and leaves your stewardship.'},
 {value:'raid',label:'A rival raid drains the territory',weight:Math.max(5,30-t.defenses*.2),note:'Defenses −10; prosperity −10; stability −5.'}];}
export function resolveTerritory(j,value){const t=j.story.territories[j.story.location],intent=j.pending.picks.territoryIntent;t.visits++;if(value==='success'){if(intent==='tribute'){j.berries+=20000;t.stability-=15;}else{t[intent==='protect'?'defenses':'prosperity']+=15;t.stability+=5;}}if(value==='unrest')t.stability-=12;if(value==='raid'){t.defenses-=10;t.prosperity-=10;t.stability-=5;}for(const k of ['stability','defenses','prosperity'])t[k]=Math.max(0,Math.min(100,t[k]));if(t.stability===0){delete j.story.territories[j.story.location];return [`${j.story.location} rejects your stewardship and becomes independent.`];}return [`${j.story.location}: stability ${t.stability}, prosperity ${t.prosperity}, defenses ${t.defenses}/100.${intent==='tribute'&&value==='success'?' Received ฿20,000 in tribute.':''}`];}
