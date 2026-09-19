import {nextStep,roll,values,fullName,probability} from './engine.js';
import {createJourney,nextJourneyStep,applyJourneyRoll,saveDocument,loadDocument,liveCharacter,combatPower,ageLabel,money,levelOf,trackFor,skillLabel,lifespanFor} from './journey.js';
import {XP_LEVELS,EVENT_BY_ID} from './journey-data.js';
import {weightedPick} from './engine.js';
import {CANON,lifeContext,placeOf,dreamOf,dreamReadiness,REGIONS,encounterStory} from './story.js';
import {simulationSummary} from './simulation.js';
const $=id=>document.getElementById(id);
// Retain the original browser key; the document itself carries the new version.
const STORAGE='grand-line-origins:v1';
let history=[],journey=null,busy=false,awaitNext=false,current=null,toastTimer,visibleChapters=20;
const colors=['#24585a','#b96a48','#728e79','#d5b77b','#394c50','#9b705d','#a8b69a','#547278'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=n=>n<.01?`${n.toFixed(4)}%`:n<1?`${n.toFixed(2)}%`:`${n.toFixed(1)}%`;
const originGroups=['Origins','Identity','Powers','Combat','Attributes','Crew'];
const labels={era:'Starting era',race:'Race',bloodline:'Famous bloodline',family:'Family',willD:'Carries D.',age:'Age',height:'Height',dream:'Dream',faction:'Path',bounty:'Bounty',surname:'Surname',name:'Given name',haki:'Awakened Haki',hakiTypes:'Haki types',devilFruit:'Devil Fruit',fruitType:'Fruit class',fruit:'Fruit',fruitMastery:'Fruit mastery',fightingStyle:'Style',fightingMastery:'Style mastery',crewMode:'Companions',joinedCrew:'Group',crewName:'Group name',crewSize:'Named companions'};
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(saveDocument(history,journey)));$('saveStatus').textContent='● SAVED ON THIS DEVICE';}catch{$('saveStatus').textContent='! EXPORT TO SAVE';toast('Browser storage is unavailable or full. Export your save to keep this journey.');}}
function random(){const n=new Uint32Array(1);crypto.getRandomValues(n);return n[0]/4294967296;}
try{const raw=localStorage.getItem(STORAGE);if(raw)({history,journey}=loadDocument(JSON.parse(raw)));}catch{toast('Your previous save could not be loaded. It has not been overwritten.');}
function setBusy(v){busy=v;for(const id of ['spin','undo','finish','reset','import','export'])$(id).disabled=v;
 $('undo').hidden=!!journey;$('finish').hidden=!!journey;
 if(!v){$('undo').disabled=!history.length||!!journey;$('finish').disabled=!!journey||!nextStep(history);$('export').disabled=!history.length;}}
function drawWheel(s,angle=0){
 const c=$('wheel');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,800,800);const total=s.options.reduce((sum,o)=>sum+o.weight,0);let start=-Math.PI/2+angle;
 s.options.forEach((o,i)=>{const arc=o.weight/total*Math.PI*2;ctx.beginPath();ctx.moveTo(400,400);ctx.arc(400,400,395,start,start+arc);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle='#f2ecd835';ctx.lineWidth=2;ctx.stroke();
 if(arc>.095){ctx.save();ctx.translate(400,400);ctx.rotate(start+arc/2);ctx.fillStyle='#fff9e7';ctx.font=`600 ${arc<.2?17:22}px Arial`;ctx.textAlign='right';ctx.textBaseline='middle';const label=o.label.length>24?o.label.slice(0,22)+'…':o.label;ctx.fillText(label,355,0,225);ctx.restore();}start+=arc;});
}
function row(label,value,note=''){return `<div class="sheet-row"><dt>${esc(label)}</dt><dd>${esc(value)}${note?`<small>${esc(note)}</small>`:''}</dd></div>`;}
function sheet(){
 const a=journey?liveCharacter(journey):values(history);
 $('characterName').textContent=fullName(a);$('characterMeta').textContent=[a.race,a.age?`Age ${a.age}`:'',a.faction].filter(Boolean).join(' · ')||'An open sea. An unwritten name.';
 $('bounty').textContent=a.bounty||'YOUR ORIGIN AWAITS';$('posterTitle').textContent=journey&&!journey.alive?'A LIFE REMEMBERED':['Pirate','Revolutionary'].includes(a.faction)?'WANTED':a.faction?'PERSONNEL FILE':'A STORY UNTOLD';
 $('rollCount').textContent=journey?`${journey.rolls.length} journey spins`:`${history.length} rolls`;$('sheetEmpty').hidden=!!history.length;
 let records=history.map(h=>({...h,value:a[h.id]??h.value}));
 if(journey){
 records=records.filter(h=>h.group!=='Crew');
 for(const key of ['hakiTypes','fruitType','fruit','fruitMastery','haki_observation','haki_armament','haki_conqueror'])if(a[key]&&!records.some(h=>h.id===key))records.push({id:key,label:labels[key]||skillLabel(key),value:a[key],group:'Powers'});
 }
 $('characterSheet').innerHTML=originGroups.map(g=>{const rows=records.filter(h=>h.group===g);return rows.length?`<section class="sheet-group"><h3>${g.toUpperCase()}</h3><dl>${rows.map(h=>row(labels[h.id]||h.label,h.value,h.note)).join('')}</dl></section>`:'';}).join('');
 $('log').innerHTML=history.length?[...history].reverse().map((h,i)=>`<article class="log-card"><span>${String(history.length-i).padStart(2,'0')} / ${esc(h.group).toUpperCase()}</span><b>${esc(h.value)}</b><small>${pct(h.chance)} · ${esc(labels[h.id]||h.label)}</small></article>`).join(''):'<p>Your first roll starts the story.</p>';
 document.body.classList.toggle('journey-active',!!journey);$('journeyStatus').hidden=!journey;$('journeyLog').hidden=!journey;$('storyCompass').hidden=!journey;
 if(journey)renderStory();
 if(!journey){$('journeySheet').innerHTML='';const active=current?.group,index=originGroups.indexOf(active);$('chapters').innerHTML=originGroups.map((g,i)=>`<div class="chapter ${g===active?'active':index>i||!current?'done':''}" ${g===active?'aria-current="step"':''}><span class="number">${index>i||!current?'✓':`0${i+1}`}</span>${g.toUpperCase()}</div>`).join('');return;}
 const j=journey,sim=simulationSummary(j);const elapsed=`${Math.floor(j.elapsedMonths/12)}y ${j.elapsedMonths%12}m`;
 $('chapters').innerHTML=`<b>02 / THE JOURNEY</b><span>ALTERNATE WORLD · FATE DRIVEN</span><span>${j.alive?'FOUR MONTHS PER EVENT':'THE FINAL CHAPTER'}</span>`;
 $('journeyStatus').innerHTML=[['CHAPTER',j.chapter+(j.pending?1:0)],['CURRENT AGE',ageLabel(j.ageMonths)],['TIME AT SEA',elapsed],['CONDITION',!j.alive?'Deceased':j.captured?'Captured':j.injury?`Injured · ${j.injury}/5`:'Healthy']].map(([label,v])=>`<div><small>${label}</small><strong ${label==='CONDITION'&&(!j.alive||j.captured||j.injury)?'class="status-danger"':''}>${esc(v)}</strong></div>`).join('');
 $('journeySheet').innerHTML=`<section class="sheet-group"><h3>LIFE AT SEA</h3><dl>${row('Combat rating',combatPower(j))}${row('Berries',money(j.berries))}${row('Faction danger',`${sim.danger}/5`)}${row('World stability',`${sim.stability}/100`)}${row('World unrest',`${sim.unrest}/5`)}${row('Wins / losses',`${j.wins} / ${j.losses}`)}${row('Opponents killed',j.kills)}${row('Group',j.group||'Traveling alone')}${row('Current island',j.story.location)}${row('Dream milestones',`${j.story.dreamProgress}/4`)}${row('Legacy',j.story.legacy)}${row('Group support',j.groupSupport?'Existing group support +3':'Named companions only')}</dl></section><section class="sheet-group journey-skills"><h3>PRACTICE & GROWTH</h3>${Object.keys(j.skills).map(k=>{const rank=levelOf(j,k),track=trackFor(k),max=rank===track.length-1,low=XP_LEVELS[rank],high=XP_LEVELS[rank+1]||low;return `<div class="skill-track"><div><span>${esc(skillLabel(k))}</span><small>${esc(track[rank])}</small></div><progress max="${max?1:high-low}" value="${max?1:j.skills[k]-low}" aria-label="${esc(skillLabel(k))} progress"></progress><small>${max?'Maximum mastery':`${j.skills[k]-low} / ${high-low} practice to ${esc(track[rank+1])}`}</small></div>`;}).join('')}</section><section class="sheet-group"><h3>INVENTORY</h3>${j.inventory.length?j.inventory.map(i=>`<div class="crew-person">${esc(i.name)}${i.count>1?` × ${i.count}`:''}<small>${esc(i.type)}</small></div>`).join(''):'<p class="empty-state">Nothing carried yet.</p>'}</section><section class="sheet-group"><h3>COMPANIONS · ${j.crew.length}</h3>${j.crew.length?j.crew.map(c=>`<div class="crew-person">${esc(c.name)}<small>${esc(c.role)}${c.fruit?` · ${esc(c.fruit)}`:''} · Power ${esc(c.power??10)} · Loyalty ${esc(c.loyalty??55)}/100${c.injury?` · Injury ${esc(c.injury)}/5`:''}</small></div>`).join(''):`<p class="empty-state">${j.groupSupport?'Your existing group provides support. No named recruits yet.':'You travel without companions.'}</p>`}</section>`;
 renderTimeline();
}
function renderTimeline(){
 if(!journey)return;const j=journey;$('journeyLogCount').textContent=`${j.chapter} completed ${j.chapter===1?'chapter':'chapters'}`;
 $('timeline').innerHTML=j.log.length?[...j.log].reverse().slice(0,visibleChapters).map(e=>`<article class="timeline-entry ${e.alive?'':'death'}"><div class="timeline-stamp">CHAPTER ${String(e.chapter).padStart(2,'0')}<b>Age ${ageLabel(e.age)}</b><span>+${e.months} months</span></div><div class="timeline-body"><div class="journal-location">${esc(e.location||'Earlier waters')}${e.encounter?' · '+esc(e.encounter):''}</div><h3>${esc(e.title)}</h3>${e.narrative?`<p class="journal-prose">${esc(e.narrative)}</p>`:''}<p><b>${esc(e.result)}</b></p>${e.effects.length?`<ul>${e.effects.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}<details><summary>See all ${e.rolls.length} fate rolls</summary>${e.rolls.map(r=>`<div class="roll-trace"><span>${esc(r.wheel)}<br><b>${esc(r.label)}</b>${r.modifier?`<small>${esc(r.modifier.label)}: ${esc(r.modifier.outcome)} ${pct(r.modifier.before)} → ${pct(r.modifier.after)}</small>`:''}</span><span>${pct(r.chance)}</span></div>`).join('')}</details></div></article>`).join(''):'<p class="empty-state">The horizon is open. Your first event begins your journey.</p>';
 $('moreHistory').hidden=j.log.length<=visibleChapters;
}
function renderStory(){
 const j=journey,life=lifeContext(j),d=dreamOf(j),r=dreamReadiness(j);
 $('storyCompass').innerHTML=`<div class="compass-heading"><span class="eyebrow">${esc(REGIONS[placeOf(j)[1]])} / ${esc(j.story.location)}</span><span class="life-stage">${esc(life.stage)}</span></div><h2>${esc(life.focus)}</h2><p>${esc(j.character.dream)} · ${j.story.dreamProgress}/4 milestones</p><div class="dream-steps">${d.steps.map((step,i)=>`<span class="${i<j.story.dreamProgress?'fulfilled':i===j.story.dreamProgress?'next-goal':''}" title="${esc(step)}"><b>${i<j.story.dreamProgress?'✓':i+1}</b>${esc(step)}</span>`).join('')}</div><details><summary>Why your story is heading this way</summary><ul>${life.reasons.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>${!r.ready&&j.story.dreamProgress<4?`<p>Next milestone still needs ${esc(r.needs.join('; '))}.</p>`:''}<p>${j.story.visited.length} islands visited · ${j.story.dreamClues} useful leads · ${j.story.legacy} legacy moments</p></details>`;
 const bonds=Object.entries(j.story.relationships).map(([id,bond])=>({person:CANON.find(c=>c.id===id),...bond})).filter(b=>b.person);
 if(bonds.length)$('storyCompass').innerHTML+=`<div class="bonds-strip">${bonds.sort((a,b)=>b.last-a.last).slice(0,8).map(b=>`<span class="bond ${j.story.dead.includes(b.person.id)?'fallen':b.score>0?'friend':b.score<0?'rival':''}">${esc(b.person.name)} <small>${j.story.dead.includes(b.person.id)?'Deceased':b.score>0?'Ally':b.score<0?'Grudge':'Acquaintance'}</small></span>`).join('')}</div>`;
}
function context(s){
 const c=journey&&CANON.find(c=>c.id===(journey.pending?.picks.opponent||journey.pending?.picks.mentor));
 $('canonEncounter').hidden=!c;
 if(c){const bond=journey.story.relationships[c.id];$('canonEncounter').innerHTML=`<div class="encounter-top"><span>CANON ${journey.pending.picks.mentor?'MENTOR':'ENCOUNTER'}</span><span>${esc(c.kind.toUpperCase())}</span></div><div class="encounter-person"><div class="encounter-seal" aria-hidden="true">${esc(c.name.split(' ').filter(n=>n.length>1).map(n=>n[0]).slice(0,2).join(''))}</div><div><h3>${esc(c.name)}</h3><p>${esc(c.crew)}</p></div></div><p class="encounter-description">${esc(encounterStory(journey,c))}</p><div class="encounter-details"><span>${esc(c.style)}</span><span>${bond?`${bond.meetings} previous meeting${bond.meetings===1?'':'s'}`:'First meeting'}</span></div>`;}

 $('chapterContext').hidden=!journey||!journey.pending;
 if(journey?.pending){const p=journey.pending;$('chapterContext').innerHTML=`<b>CHAPTER ${journey.chapter+1} · ${esc(EVENT_BY_ID[p.event]?.label||'Captivity')}</b>${p.narrative?`<p class="chapter-premise">${esc(p.narrative)}</p>`:''}${p.rolls.map(r=>esc(r.label)).join(' → ')}<br><span>${p.phase==='aging'?`${p.months} months have passed. Final aging check.`:'Follow-up rolls resolve this event; they add no extra time.'}</span>`;}
 $('oddsModifier').hidden=!s?.modifier;
 if(s?.modifier){const m=s.modifier;$('oddsModifier').innerHTML=`<div class="modifier-title">FATE ROLLED · ${esc(m.label)}</div><strong>${esc(m.outcome)}: ${pct(m.before)} → <span class="delta">${pct(m.after)}</span></strong><p>+${(m.after-m.before).toFixed(1)} percentage points. Other outcomes are rebalanced. Fate chose the impulse; your ability limits what it can change.</p>`;}
}
function summary(){
 const last=journey?.log.at(-1);$('chapterSummary').hidden=!last||!!journey.pending;
 if(last)$('chapterSummary').innerHTML=`<h3>Chapter ${last.chapter} · ${esc(last.result)}</h3><p>${last.months} months passed. Now age ${ageLabel(last.age)}.</p>${last.effects.length?`<ul>${last.effects.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:''}`;
}
function render(){
 current=journey?nextJourneyStep(journey):nextStep(history);awaitNext=false;sheet();setBusy(false);context(current);summary();
 if(!current){
 $('oddsDetails').hidden=true;
 if(journey){
 $('stepLabel').textContent='THE JOURNEY HAS ENDED';$('wheelTitle').textContent='Every legend leaves a trace.';$('wheelNote').textContent=`${fullName(journey.character)} · ${journey.cause} · Age ${ageLabel(journey.ageMonths)}`;
 $('wheelArea').innerHTML='<div class="complete-message"><span>✺</span><h3>A life remembered.</h3></div>';
 $('result').innerHTML=`<div class="legend-ending"><b>${esc(fullName(journey.character))}</b> sailed for ${ageLabel(journey.elapsedMonths)} across ${journey.chapter} chapters. This run is complete.</div><div class="legacy-grid">${[['VICTORIES',journey.wins],['PEAK COMBAT RATING',journey.peakPower],['OPPONENTS KILLED',journey.kills],['ISLAND DISCOVERIES',journey.discoveries]].map(([label,n])=>`<div><small>${label}</small><strong>${n}</strong></div>`).join('')}</div>`;
 $('spin').textContent='EXPORT YOUR LEGACY ↓';
 }else{
 $('stepLabel').textContent='ORIGIN COMPLETE';$('wheelTitle').textContent='Your legend starts here.';$('wheelNote').textContent='Begin your fate-driven life at sea. Each event advances four months unless a time skip says otherwise. Once you embark, journey rolls cannot be undone.';
 $('wheelArea').innerHTML='<div class="complete-message"><span>✺</span><h3>Ready to set sail.</h3><p>An origin worth a thousand adventures.</p></div>';
 $('result').innerHTML=`<span>YOUR STORY HAS A NAME</span><strong>${esc(fullName(values(history)))}</strong>`;$('spin').textContent='BEGIN YOUR JOURNEY →';
 }return;
 }
 if(!$('wheel'))$('wheelArea').innerHTML='<div class="wheel-pointer"></div><canvas id="wheel" width="800" height="800" role="img" aria-label="Weighted outcome wheel; exact odds are listed below"></canvas><div class="wheel-hub">✺<small>YOUR FATE</small></div>';
 $('stepLabel').textContent=journey?`CHAPTER ${String(journey.chapter+1).padStart(2,'0')} / ${current.key==='event'?'THE HORIZON':'FATE UNFOLDS'}`:`${current.group.toUpperCase()} / SPIN ${String(history.length+1).padStart(2,'0')}`;
 $('wheelTitle').textContent=current.label;$('wheelNote').textContent=current.note;$('oddsDetails').hidden=false;$('optionCount').textContent=`${current.options.length} OUTCOMES`;
 $('oddsList').innerHTML=current.options.map(o=>{const before=current.baseOptions?.find(b=>b.value===o.value);const old=before?probability(current.baseOptions,o.value):null;const now=probability(current.options,o.value);return `<div class="odd-row"><span>${esc(o.label)}</span><b>${old!==null&&Math.abs(old-now)>.001?`<span class="odds-before">${pct(old)}</span> → `:''}${pct(now)}</b>${o.note?`<small>${esc(o.note)}</small>`:''}</div>`;}).join('');
 $('result').innerHTML=`<span>${journey?'THE HORIZON IS NEVER CERTAIN':'THE NEXT CHAPTER IS YOURS'}</span><strong>Let fate decide.</strong>`;$('spin').innerHTML='SPIN THE WHEEL <span>↗</span>';drawWheel(current);
}
async function spin(){
 if(busy)return;
 if(awaitNext){render();return;}
 if(!current){if(journey){exportSave();return;}journey=createJourney(history);journey.peakPower=combatPower(journey);save();render();toast('Your journey begins. Fate decides every outcome.');return;}
 setBusy(true);const s=current;const selected=weightedPick(s.options,random);let outcome;
 // Commit before animation. Reloading resumes the next stage, never rerolls this outcome.
 if(journey)outcome=applyJourneyRoll(journey,selected.value);
 else {outcome={id:s.id,label:s.label,group:s.group,value:selected.value,note:selected.note||'',chance:probability(s.options,selected.value)};history.push(outcome);}
 save();
 const total=s.options.reduce((sum,o)=>sum+o.weight,0);let before=0;for(const o of s.options){if(o.value===selected.value)break;before+=o.weight;}
 const center=(before+selected.weight/2)/total*Math.PI*2,target=10*Math.PI+(2*Math.PI-center);const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:2200;
 $('spin').textContent='FATE IS TURNING…';$('result').innerHTML='<span>ANOTHER POSSIBILITY ON THE HORIZON</span><strong>Spinning…</strong>';
 await new Promise(resolve=>{const start=performance.now();function frame(t){const p=duration===0?1:Math.min((t-start)/duration,1);drawWheel(s,target*(1-Math.pow(1-p,4)));if(p<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
 sheet();summary();awaitNext=true;setBusy(false);
 $('result').innerHTML=`<span>${esc(s.label).toUpperCase()}</span><strong>${esc(selected.label)}</strong><span class="result-odds">${pct(outcome.chance)} CHANCE${selected.note?' · '+esc(selected.note):''}</span>`;
 $('spin').innerHTML=journey?(journey.alive?(journey.pending?'RESOLVE THIS CHAPTER <span>→</span>':'NEXT CHAPTER <span>→</span>'):'REMEMBER YOUR JOURNEY <span>→</span>'):(nextStep(history)?'NEXT WHEEL <span>→</span>':'REVEAL YOUR CHARACTER <span>→</span>');
}
function exportSave(){const blob=new Blob([JSON.stringify(saveDocument(history,journey),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${fullName(values(history)).replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${journey?'journey':'origin'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(journey?'Journey exported, including every fate roll and the current event.':'Character exported. You can begin its journey on any device.');}
$('spin').addEventListener('click',spin);
$('undo').addEventListener('click',()=>{if(busy||journey||!history.length)return;history.pop();save();render();});
$('finish').addEventListener('click',()=>{if(busy||journey)return;while(nextStep(history))history.push(roll(history,random));save();render();toast('Your origin is complete. Begin your journey when ready.');});
$('export').addEventListener('click',exportSave);
$('rulesButton').addEventListener('click',()=>$('rules').showModal());
$('reset').addEventListener('click',()=>$('resetDialog').showModal());
$('confirmReset').addEventListener('click',()=>{history=[];journey=null;visibleChapters=20;save();$('resetDialog').close();render();});
for(const button of document.querySelectorAll('[data-close]'))button.addEventListener('click',()=>$(button.dataset.close).close());
$('import').addEventListener('click',()=>$('fileInput').click());
$('fileInput').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>4000000)throw Error('Please choose a save under 4 MB.');const loaded=loadDocument(JSON.parse(await file.text()));if(history.length&&!confirm('Replace your current character and journey? Export first to keep both.'))return;({history,journey}=loaded);visibleChapters=20;save();render();toast(journey?'Journey restored, including the current event.':'Character imported. Your story continues.');}catch(error){toast(error.message||'Could not load this file. Your current character is unchanged.');}finally{event.target.value='';}});
$('moreHistory').addEventListener('click',()=>{visibleChapters+=20;renderTimeline();});
render();
