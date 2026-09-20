export const voyageEnabled=j=>j.pending?j.pending.voyageVersion===1:j.rolls.length-(j.legacyCutover||0)>=(j.voyageCutover??0);
export function islandActions(j){
 let count=0;
 for(const chapter of [...j.log].reverse()){
  if(chapter.event==='travel'||chapter.location!==j.story.location)break;
  // Count completed chapters, never individual spins or intent selections.
  count++;
 }
 return count;
}
export function voyagePressure(j,events){
 if(!voyageEnabled(j)||j.captured)return events;
 const count=islandActions(j),travel=events.find(o=>o.value==='travel');
 if(!travel||count<4)return events;
 const chance=Math.min(95,70+(count-4)*10),other=events.reduce((n,o)=>n+(o.value==='travel'?0:o.weight),0);
 if(!other)return events;
 return events.map(o=>o.value==='travel'?{...o,weight:other*chance/(100-chance),label:'Time to sail · next island',note:`${count} chapters on this island. Travel now has a ${chance}% chance; staying raises it again (maximum 95%).`}:o);
}
