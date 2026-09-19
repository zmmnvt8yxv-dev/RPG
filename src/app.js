import {nextStep,roll,values,fullName,validateHistory,characterDocument,probability,VERSION} from './engine.js';
const $=id=>document.getElementById(id);
const STORAGE='grand-line-origins:v1';
let history=[],busy=false,awaitNext=false,rotation=0,current=null,toastTimer;
const colors=['#24585a','#b96a48','#728e79','#d5b77b','#394c50','#9b705d','#a8b69a','#547278'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=n=>n<.01?`${n.toFixed(4)}%`:n<1?`${n.toFixed(2)}%`:`${n.toFixed(1)}%`;
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(characterDocument(history)));$('saveStatus').textContent='● SAVED ON THIS DEVICE';}catch{$('saveStatus').textContent='! EXPORT TO SAVE';toast('Browser storage is unavailable or full. Export your character to keep it.');}}
function random(){const n=new Uint32Array(1);crypto.getRandomValues(n);return n[0]/4294967296;}
try{const raw=localStorage.getItem(STORAGE);if(raw){const doc=JSON.parse(raw);if(doc.schemaVersion!==VERSION)throw Error('Save version not supported');history=validateHistory(doc.history);}}catch{toast('Your previous save could not be loaded. It has not been overwritten.');}
function setBusy(v){busy=v;for(const id of ['spin','undo','finish','reset','import','export'])$(id).disabled=v; if(!v){$('undo').disabled=!history.length;$('finish').disabled=!nextStep(history);$('export').disabled=!history.length;}}
function drawWheel(s,angle=0){
 const c=$('wheel');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,800,800);const total=s.options.reduce((sum,o)=>sum+o.weight,0);let start=-Math.PI/2+angle;
 s.options.forEach((o,i)=>{const arc=o.weight/total*Math.PI*2;ctx.beginPath();ctx.moveTo(400,400);ctx.arc(400,400,395,start,start+arc);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle='#f2ecd835';ctx.lineWidth=2;ctx.stroke();
 if(arc>.095){ctx.save();ctx.translate(400,400);ctx.rotate(start+arc/2);ctx.fillStyle='#fff9e7';ctx.font=`600 ${arc<.2?17:22}px Arial`;ctx.textAlign='right';ctx.textBaseline='middle';const label=o.label.length>24?o.label.slice(0,22)+'…':o.label;ctx.fillText(label,355,0,225);ctx.restore();}start+=arc;});
}
function sheet(){
 const a=values(history);$('characterName').textContent=fullName(a);$('characterMeta').textContent=[a.race,a.age?`Age ${a.age}`:'',a.faction].filter(Boolean).join(' · ')||'An open sea. An unwritten name.';$('bounty').textContent=a.bounty||'YOUR ORIGIN AWAITS';$('posterTitle').textContent=['Pirate','Revolutionary'].includes(a.faction)?'WANTED':a.faction?'PERSONNEL FILE':'A STORY UNTOLD';$('rollCount').textContent=`${history.length} rolls`;$('sheetEmpty').hidden=!!history.length;
 const groups=['Origins','Identity','Powers','Combat','Attributes','Crew'];
 const labels={era:'Era',race:'Race',bloodline:'Famous bloodline',family:'Family',willD:'Carries D.',age:'Age',height:'Height',dream:'Dream',faction:'Path',bounty:'Starting bounty',surname:'Surname',name:'Given name',haki:'Awakened Haki',hakiTypes:'Haki types',devilFruit:'Devil Fruit',fruitType:'Fruit class',fruit:'Fruit',fruitMastery:'Fruit mastery',fightingStyle:'Style',fightingMastery:'Style mastery',crewMode:'Companions',joinedCrew:'Group',crewName:'Group name',crewSize:'Companion count'};
 $('characterSheet').innerHTML=groups.map(g=>{const rows=history.filter(h=>h.group===g);return rows.length?`<section class="sheet-group"><h3>${g.toUpperCase()}</h3><dl>${rows.map(h=>`<div class="sheet-row"><dt>${esc(labels[h.id]||h.label)}</dt><dd>${esc(h.value)}${h.note?`<small>${esc(h.note)}</small>`:''}</dd></div>`).join('')}</dl></section>`:'';}).join('');
 $('log').innerHTML=history.length?[...history].reverse().map((h,i)=>`<article class="log-card"><span>${String(history.length-i).padStart(2,'0')} / ${esc(h.group).toUpperCase()}</span><b>${esc(h.value)}</b><small>${pct(h.chance)} · ${esc(labels[h.id]||h.label)}</small></article>`).join(''):'<p>Your first roll starts the story.</p>';
 const active=current?.group;const index=groups.indexOf(active);
 $('chapters').innerHTML=groups.map((g,i)=>`<div class="chapter ${g===active?'active':index>i||!current?'done':''}" ${g===active?'aria-current="step"':''}><span class="number">${index>i||!current?'✓':`0${i+1}`}</span>${g.toUpperCase()}</div>`).join('');
}
function render(){
 current=nextStep(history);awaitNext=false;rotation=0;sheet();setBusy(false);
 if(!current){$('stepLabel').textContent='ORIGIN COMPLETE';$('wheelTitle').textContent='Your legend starts here.';$('wheelNote').textContent='Your character is ready. Export this origin to keep it for the journey phase, coming next.';$('wheelArea').innerHTML='<div class="complete-message"><span>✺</span><h3>Ready to set sail.</h3><p>An origin worth a thousand adventures.</p></div>';$('result').innerHTML=`<span>YOUR STORY HAS A NAME</span><strong>${esc(fullName(values(history)))}</strong>`;$('spin').textContent='EXPORT YOUR CHARACTER ↓';$('oddsDetails').hidden=true;return;}
 if(!$('wheel'))$('wheelArea').innerHTML='<div class="wheel-pointer"></div><canvas id="wheel" width="800" height="800" role="img" aria-label="Weighted outcome wheel; exact odds are listed below"></canvas><div class="wheel-hub">✺<small>YOUR FATE</small></div>';
 $('stepLabel').textContent=`${current.group.toUpperCase()} / SPIN ${String(history.length+1).padStart(2,'0')}`;$('wheelTitle').textContent=current.label;$('wheelNote').textContent=current.note;$('oddsDetails').hidden=false;$('optionCount').textContent=`${current.options.length} OUTCOMES`;
 $('oddsList').innerHTML=current.options.map(o=>`<div class="odd-row"><span>${esc(o.label)}</span><b>${pct(probability(current.options,o.value))}</b>${o.note?`<small>${esc(o.note)}</small>`:''}</div>`).join('');
 $('result').innerHTML='<span>THE NEXT CHAPTER IS YOURS</span><strong>Let fate decide.</strong>';$('spin').innerHTML='SPIN THE WHEEL <span>↗</span>';drawWheel(current);
}
async function spin(){
 if(busy)return;if(!current){exportSave();return;}if(awaitNext){render();return;}
 setBusy(true);const outcome=roll(history,random);const total=current.options.reduce((sum,o)=>sum+o.weight,0);let before=0;for(const o of current.options){if(o.value===outcome.value)break;before+=o.weight;}
 const selected=current.options.find(o=>o.value===outcome.value);const center=(before+selected.weight/2)/total*Math.PI*2;const target=10*Math.PI+(2*Math.PI-center);const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:2600;
 $('spin').textContent='FATE IS TURNING…';$('result').innerHTML='<span>ANOTHER POSSIBILITY ON THE HORIZON</span><strong>Spinning…</strong>';
 await new Promise(resolve=>{const start=performance.now();function frame(t){const p=duration===0?1:Math.min((t-start)/duration,1);rotation=target*(1-Math.pow(1-p,4));drawWheel(current,rotation);if(p<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
 history.push(outcome);save();sheet();awaitNext=true;setBusy(false);$('result').innerHTML=`<span>${esc(outcome.label).toUpperCase()}</span><strong>${esc(outcome.value)}</strong><span class="result-odds">${pct(outcome.chance)} CHANCE${outcome.note?' · '+esc(outcome.note):''}</span>`;$('spin').innerHTML=nextStep(history)?'NEXT WHEEL <span>→</span>':'REVEAL YOUR CHARACTER <span>→</span>';
}
function exportSave(){const doc=characterDocument(history);const blob=new Blob([JSON.stringify(doc,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${fullName(values(history)).replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-origin.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Character exported, including all rolls and an empty journey log.');}
$('spin').addEventListener('click',spin);
$('undo').addEventListener('click',()=>{if(busy||!history.length)return;history.pop();save();render();});
$('finish').addEventListener('click',()=>{if(busy)return;while(nextStep(history)){history.push(roll(history,random));}save();render();toast('Your origin is complete. Export it to keep a backup.');});
$('export').addEventListener('click',exportSave);
$('rulesButton').addEventListener('click',()=>$('rules').showModal());
$('reset').addEventListener('click',()=>$('resetDialog').showModal());
$('confirmReset').addEventListener('click',()=>{history=[];save();$('resetDialog').close();render();});
for(const button of document.querySelectorAll('[data-close]'))button.addEventListener('click',()=>$(button.dataset.close).close());
$('import').addEventListener('click',()=>$('fileInput').click());
$('fileInput').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('Please choose a character JSON under 1 MB.');const doc=JSON.parse(await file.text());if(doc.schemaVersion!==VERSION||doc.game!=='Grand Line Origins')throw Error('This is not a supported Grand Line Origins save.');const loaded=validateHistory(doc.history);if(history.length&&!confirm('Replace your current character with this imported save? Export first if you want to keep both.'))return;history=loaded;save();render();toast('Character imported. Your story continues.');}catch(error){toast(error.message||'Could not load this file. Your current character is unchanged.');}finally{event.target.value='';}});
render();
