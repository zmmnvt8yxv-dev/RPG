import {options,races,families,dFamilies,mastery,hakiMastery,fruitMastery,stats,fruits,swords,crewCatalog,characters,firstNames,surnames,dreams} from './data.js';
export const VERSION = 1;
export const eras = ['Roger’s final voyage','Early Great Pirate Era','Summit War opening','New World opening'];
const yesNo = n => options([['Yes',n],['No',100-n]]);
const step = (id,label,group,pool,note='') => ({id,label,group,options:pool,note});
export function weightedPick(pool, random=Math.random) {
 if(!pool.length || pool.some(o=>!Number.isFinite(o.weight)||o.weight<=0)) throw new Error('Invalid outcome pool');
 const total=pool.reduce((s,o)=>s+o.weight,0); const u=random();
 if(!(u>=0&&u<1)) throw new Error('Random value must be in [0,1)');
 let target=u*total;
 for(const o of pool) {target-=o.weight;if(target<0)return o;}
 return pool.at(-1);
}
export function probability(pool,value) {return pool.find(o=>o.value===value).weight/pool.reduce((s,o)=>s+o.weight,0)*100;}
export function values(history) {return Object.fromEntries(history.map(h=>[h.id,h.value]));}
export function availableCharacters(a) {
 const used=Object.entries(a).filter(([k])=>/^member_\d+_canon$/.test(k)).map(([,v])=>v);
 return options(characters.filter(([name,era,f])=>era.includes(eras.indexOf(a.era))&&f===a.faction&&!used.includes(name)).map(([name,,,w])=>[name,w]));
}
export function nextStep(history) {
 const a=values(history); const pending=(id,label,group,pool,note)=>a[id]===undefined?step(id,label,group,pool,note):null;
 let s;
 if(s=pending('era','When does your story begin?','Origins',options(eras.map((e,i)=>[e,[10,15,25,50][i]])),'Era sets the available crews and canon recruits. All journeys diverge from canon at this starting point.'))return s;
 if(s=pending('race','Which people do you belong to?','Origins',races,'Population-inspired estimates: humans dominate; Lunarian and Buccaneer outcomes are exceptionally rare.'))return s;
 if(s=pending('bloodline','A famous family in your past?','Origins',yesNo(5),'A family connection is a story hook, not a guaranteed power boost.'))return s;
 if(a.bloodline==='Yes') {
 const pool=families.filter(f=>f.value==='Jaguar'?a.race==='Giant':f.value==='Charlotte'?a.race!=='Giant':a.race==='Human');
 if(s=pending('family','Which family is your bloodline?','Origins',pool.length?pool:options([['Original ancestral clan',1,'A generated family appropriate to your people; canon offers no suitable named family in this catalog.']]),'Race-compatible curated families. Rare-race histories without a supported named family use an original clan.'))return s;
 }
 if(s=pending('willD','Do you carry the initial D.?','Origins',dFamilies.includes(a.family)?options([['Yes',1]]):yesNo(0.5),'D. denotes a mysterious inherited identity, not a stat bonus. Known D. families force Yes; other outcomes are alternate-lineage fiction.'))return s;
 const ages=a.race==='Giant'?[[20,8],[35,20],[60,30],[90,25],[140,15],[220,2]]:[[16,12],[19,24],[24,27],[32,20],[45,12],[60,4],[75,1]];
 if(s=pending('age','How old are you?','Origins',options(ages.map(([v,w])=>[String(v),w]))))return s;
 const heights={Giant:[1200,1500,1800,2100,2400],Dwarf:[15,20,25,30,35],Buccaneer:[240,300,360,450,550],Lunarian:[190,220,260,300,350],Longleg:[220,260,300,350,400],Merfolk:[160,190,230,300,450]};
 if(s=pending('height','How tall are you?','Origins',options((heights[a.race]||[155,170,185,205,240,300]).map((n,i,arr)=>[`${n} cm`,[10,25,35,20,8,2][i] || 1])),'Height is conditioned on race. Giant values are in meters when converted; merfolk use full body length.'))return s;
 if(s=pending('dream','What dream drives you?','Identity',dreams))return s;
 if(s=pending('faction','Which path will you walk?','Identity',options([['Pirate',35],['Marine',24],['Revolutionary',7],['Bounty hunter',10],['Explorer',10],['Merchant',8],['Civilian',5],['Cipher Pol',1]]),'This samples aspiring adventurers, not every civilian in the world.'))return s;
 const outlaw=['Pirate','Revolutionary'].includes(a.faction);
 const bounties=outlaw?options([['No bounty yet',60],['฿ 100,000',12],['฿ 500,000',10],['฿ 1,000,000',8],['฿ 5,000,000',5],['฿ 10,000,000',3],['฿ 30,000,000',1.5],['฿ 100,000,000',0.45],['฿ 300,000,000',0.05]]):options([['No government bounty',1]]);
 if(s=pending('bounty','Your starting bounty','Identity',bounties,'Government bounty measures notoriety, not power. Marines and lawful paths begin without one. Cross Guild bounties are outside this opening-era model.'))return s;
 if(!a.family || a.family==='Original ancestral clan') if(s=pending('surname','Your family name','Identity',options(surnames)))return s;
 if(s=pending('name','Your given name','Identity',options(firstNames),'Your full name combines this result, your family and D. if applicable.'))return s;
 const experienced=Number(a.age)>=24;
 const hakiChance=({Pirate:12,Marine:14,Revolutionary:18,'Bounty hunter':10,Explorer:5,Merchant:2,Civilian:1,'Cipher Pol':35}[a.faction])*(experienced?1:0.5);
 if(s=pending('haki','Have you awakened Haki?','Powers',yesNo(hakiChance),'Awakened at the start, not your lifetime potential. Age and path influence these game odds.'))return s;
 if(a.haki==='Yes') {
 if(s=pending('hakiTypes','Which Haki has awakened?','Powers',options([['Observation',44],['Armament',35],['Observation + Armament',20],['Conqueror’s',0.1],['Observation + Conqueror’s',0.3],['Armament + Conqueror’s',0.2],['Observation + Armament + Conqueror’s',0.4]]),'Conqueror’s appears in 1% of Haki-positive results, not 1% of all characters.'))return s;
 for(const [key,type] of [['observation','Observation'],['armament','Armament'],['conqueror','Conqueror’s']]) if(a.hakiTypes.includes(type))if(s=pending(`haki_${key}`,`${type} Haki level`,'Powers',hakiMastery,type==='Observation'?'Advanced outcomes allow a future-sight growth hook.':type==='Armament'?'Advanced outcomes allow emission/internal-destruction training hooks.':'Basic control does not imply advanced Conqueror’s coating.'))return s;
 }
 const fruitChance={Pirate:16,Marine:8,Revolutionary:12,'Bounty hunter':8,Explorer:6,Merchant:2,Civilian:1,'Cipher Pol':25}[a.faction];
 if(s=pending('devilFruit','Have you eaten a Devil Fruit?','Powers',yesNo(fruitChance),'One fruit per character. All fruit users lose the ability to swim, including aquatic races.'))return s;
 if(a.devilFruit==='Yes') {
 if(s=pending('fruitType','Which Devil Fruit class?','Powers',options([['Paramecia',55],['Standard Zoan',30],['Ancient Zoan',5],['Mythical Zoan',1],['Logia',9]]),'Ancient and Mythical are Zoan subtypes. Natural fruits only; no SMILE failures.'))return s;
 if(s=pending('fruit','Which Devil Fruit is yours?','Powers',fruits[a.fruitType],'Curated canon-fruit pool. Alternate ownership: your roll replaces the usual owner; there are no duplicate fruits in your origin.'))return s;
 if(s=pending('fruitMastery','Devil Fruit mastery','Powers',fruitMastery,'Awakening is a rare alternate-timeline outcome. It does not assert canon-confirmed awakening for every fruit.'))return s;
 }
 let styles=options([['Brawling',26],['Black Leg-inspired kicks',12],['One-sword style',16],['Two-sword style',7],['Three-sword style',2],['Sniper',12],['Staff fighting',8],['Spear fighting',7],['Axe fighting',4],['Rokushiki',1],['Fish-man Karate',5]]);
 if(a.race==='Mink')styles.push(...options([['Electro martial arts',20]]));
 if(s=pending('fightingStyle','How do you fight?','Combat',styles,'Styles imply a training path, not instant access to every named technique. Weapons and movement are adapted to your anatomy.'))return s;
 if(s=pending('fightingMastery','Fighting mastery','Combat',mastery))return s;
 const weaponCount={'One-sword style':1,'Two-sword style':2,'Three-sword style':3,Sniper:1,'Staff fighting':1,'Spear fighting':1,'Axe fighting':1}[a.fightingStyle]||0;
 const otherWeapons={Sniper:options([['Flintlock pistol',25],['Long rifle',45],['Twin pistols',15],['Slingshot',14],['Kabuto',1]]),'Staff fighting':options([['Oak staff',65],['Iron staff',34],['Clima-Tact',1]]),'Spear fighting':options([['Spear',65],['Trident',30],['Naginata',4],['Murakumogiri',1]]),'Axe fighting':options([['Boarding axe',70],['Great axe',30]])};
 for(let i=1;i<=weaponCount;i++) {
 const used=Array.from({length:i-1},(_,j)=>a[`weapon_${j+1}`]);
 const pool=a.fightingStyle.includes('sword')?swords.filter(w=>!used.includes(w.value)):otherWeapons[a.fightingStyle];
 if(s=pending(`weapon_${i}`,`Weapon ${i}${weaponCount>1?` of ${weaponCount}`:''}`,'Combat',pool,'Named weapons are unique rolls in this alternate timeline. Each weapon has its own mastery.'))return s;
 if(s=pending(`weaponMastery_${i}`,`Weapon ${i} mastery`,'Combat',mastery))return s;
 }
 for(const [key,label] of [['battleIQ','Battle IQ'],['strength','Strength'],['durability','Durability'],['speed','Speed'],['endurance','Endurance'],['stamina','Stamina']]) {
 let pool=stats;
 if(key==='battleIQ')pool=options([['Instinctive',30],['Average',35],['Tactical',24],['Brilliant',10],['Genius',1]]);
 if((key==='strength'&&['Giant','Fish-man','Buccaneer','Dwarf'].includes(a.race))||(key==='durability'&&['Lunarian','Giant','Buccaneer'].includes(a.race)))pool=options([['Exceptional',50],['Elite',40],['Monstrous',9.9],['Legendary',0.1]]);
 if(s=pending(key,label,'Attributes',pool,key==='endurance'?'Ability to keep going through injury and pain.':key==='stamina'?'Energy reserve and sustained exertion.':'Absolute world-scale potential at your starting point, with racial baselines where applicable.'))return s;
 }
 if(s=pending('crewMode','Who sails beside you?','Crew',options([['Go solo',35],['Join an existing group',45],['Form your own group',20]]),'Marine units, revolutionary cells and other groups replace pirate crews for their respective paths.'))return s;
 if(a.crewMode==='Join an existing group') {
 const pool=options(crewCatalog.filter(c=>c.eras.includes(eras.indexOf(a.era))&&c.faction===a.faction).map(c=>c.name));
 if(s=pending('joinedCrew','Which group do you join?','Crew',pool,'Era- and faction-compatible groups. Joining is an alternate-timeline story premise.'))return s;
 }
 if(a.crewMode==='Form your own group') {
 if(s=pending('crewName','Name your new group','Crew',options(['Dawn','Tempest','Blue Lantern','Silver Compass','Wild Tide','Red Horizon','Moonwake','Iron Gull'].map(n=>`${n} ${a.faction==='Pirate'?'Pirates':a.faction==='Marine'?'Unit':a.faction==='Revolutionary'?'Cell':'Company'}`))))return s;
 if(s=pending('crewSize','How many starting companions?','Crew',options([['1',25],['2',25],['3',20],['4',12],['5',8],['6',5],['8',3],['10',1.5],['12',0.5]]),'Companions exclude you. Every member gets an individual origin spin.'))return s;
 for(let i=1;i<=Number(a.crewSize);i++) {
 const canon=availableCharacters(a);
 if(s=pending(`member_${i}_origin`,`Companion ${i}: canon or original?`,'Crew',canon.length?options([['Original character',85],['Canon character',15]]):options([['Original character',1]]),'Original characters are generated locally from authored name, race, role and personality pools. No external AI service or account is needed.'))return s;
 if(a[`member_${i}_origin`]==='Canon character') {
 if(s=pending(`member_${i}_canon`,`Companion ${i}: who?`,'Crew',canon,'Curated era/faction pool without duplicate recruits. Leaders are especially unlikely. Recruitment rewrites their usual allegiance.'))return s;
 } else {
 const usedNames=Object.entries(a).filter(([k])=>/_generated$/.test(k)).map(([,v])=>v);
 const names=firstNames.flatMap((n,ni)=>surnames.map((last,li)=>`${last} ${n}`)).filter(n=>!usedNames.includes(n)&&n!==fullName(a));
 if(s=pending(`member_${i}_generated`,`Companion ${i}: name`,'Crew',options(names)))return s;
 if(s=pending(`member_${i}_race`,`Companion ${i}: race`,'Crew',races))return s;
 if(s=pending(`member_${i}_role`,`Companion ${i}: specialty`,'Crew',options(['Navigator','Doctor','Cook','Shipwright','Lookout','Helmsman','Fighter','Musician','Scholar','Quartermaster'])) )return s;
 if(s=pending(`member_${i}_trait`,`Companion ${i}: personality`,'Crew',options(['Fiercely loyal','Recklessly brave','Quiet strategist','Cheerful troublemaker','Suspicious survivor','Gentle giant at heart','Ambitious rival','Curious dreamer','Meticulous planner','Unshakable optimist'])) )return s;
 }
 }
 }
 return null;
}
export function fullName(a) {return a.name?`${a.family&&a.family!=='Original ancestral clan'?a.family:a.surname||''}${a.willD==='Yes'?' D.':''} ${a.name}`.trim():'Unknown adventurer';}
export function roll(history,random=Math.random) {const s=nextStep(history);if(!s)return null;const o=weightedPick(s.options,random);return {id:s.id,label:s.label,group:s.group,value:o.value,note:o.note||'',chance:probability(s.options,o.value)};}
export function validateHistory(input) {
 if(!Array.isArray(input)||input.length>200)throw new Error('Invalid character history');
 const clean=[];
 for(const item of input) {
 const s=nextStep(clean);const o=s?.options.find(o=>o.value===item?.value);
 if(!s||s.id!==item?.id||!o)throw new Error('This save does not match the current character rules.');
 clean.push({id:s.id,label:s.label,group:s.group,value:o.value,note:o.note||'',chance:probability(s.options,o.value)});
 }
 return clean;
}
export function characterDocument(history) {
 const a=values(history);
 return {schemaVersion:VERSION,game:'Grand Line Origins',complete:!nextStep(history),name:fullName(a),timeline:'Alternate canon ownership and recruitment',character:a,history,journey:{events:[],chapter:0}};
}
