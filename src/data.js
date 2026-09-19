// All weights are authored game balance, never canonical census data.
export const options = rows => rows.map(row => typeof row === 'string' ? {value:row,label:row,weight:1} : {value:row[0],label:row[0],weight:row[1],note:row[2] || ''});
export const races = options([
 ['Human',7000,'70% of the adventure-biased origin pool. No automatic attribute shifts.'],
 ['Fish-man',700,'7%. Aquatic breathing and powerful physiology. Heritage: +2 Strength, +1 Durability, +1 Endurance.'],
 ['Merfolk',500,'5%. Aquatic heritage and exceptional movement. Heritage: +2 Speed, +1 Stamina.'],
 ['Mink',500,'5%. Electro potential and explosive mobility. Heritage: +2 Speed, +1 Stamina; Electro is an inherited secondary combat style.'],
 ['Sky Islander',450,'4.5%. Sky-island heritage. Heritage: +1 Speed, +1 Stamina.'],
 ['Longarm',250,'2.5%. Exceptional reach and leverage. Heritage: +1 Strength, +1 Fighting Mastery.'],
 ['Longleg',240,'2.4%. Exceptional reach and kicking leverage. Heritage: +1 Strength, +1 Speed.'],
 ['Giant',130,'1.3%. Enormous physique and longevity. Heritage: +2 Strength, +2 Durability, +1 Endurance.'],
 ['Dwarf',100,'1%. Tiny stature with extraordinary power and agility. Heritage: +2 Strength, +2 Speed, +1 Stamina.'],
 ['Snakeneck',60,'0.6%. Unusual reach and awareness. Heritage: +1 Speed, +1 Battle IQ.'],
 ['Three-eye',35,'0.35%. Rare three-eye heritage. Heritage: +2 Battle IQ.'],
 ['Lunarian',20,'0.2%. Extremely rare flame-wing lineage. Heritage: +2 Durability, +1 Strength, +1 Speed, +1 Endurance.'],
 ['Buccaneer',15,'0.15%. Extremely rare giant-related lineage. Heritage: +2 Strength, +2 Durability, +1 Endurance.']
]);
export const families = options([
 ['Monkey',14,'Strong-willed D. lineage. Game heritage guarantees Observation Haki and grants +1 Battle IQ, +1 Endurance, +1 Stamina.'],
 ['Portgas',9,'D. lineage with exceptional resolve. Heritage grants +1 Endurance and +1 Stamina and strongly improves starting Haki odds.'],
 ['Gol',6,'Extremely rare D. lineage. Game heritage guarantees Conqueror’s Haki and grants +1 Fighting Mastery, +1 Battle IQ, +1 Endurance.'],
 ['Trafalgar',10,'D. lineage associated here with precision and medicine. Heritage grants +2 Battle IQ and +1 Endurance.'],
 ['Jaguar',7,'Giant D. lineage. Heritage adds +1 Strength and +1 Durability on top of Giant physiology.'],
 ['Nefertari',9,'Royal D. lineage. Heritage grants +1 Battle IQ and +1 Stamina.'],
 ['Vinsmoke',10,'Germa royal lineage. Heritage grants +1 Strength, +1 Durability, +1 Speed and Black Leg-inspired kicks as a secondary style.'],
 ['Shimotsuki',13,'Wano sword lineage. Heritage grants +1 Fighting Mastery, +1 Speed and One-sword style as a secondary style.'],
 ['Kozuki',9,'Wano ruling lineage. Heritage grants +1 Fighting Mastery, +1 Durability and Two-sword style as a secondary style.'],
 ['Donquixote',7,'World Noble lineage. Game heritage guarantees Armament Haki and grants +1 Battle IQ, +1 Fighting Mastery.'],
 ['Charlotte',6,'A sprawling pirate lineage. Heritage grants +1 Durability, +1 Stamina and strongly improves starting Haki odds.']
]);
export const dFamilies = ['Monkey','Portgas','Gol','Trafalgar','Jaguar','Nefertari'];
export const RACE_TRAITS={
 Human:{bonuses:{}},
 'Fish-man':{bonuses:{strength:2,durability:1,endurance:1}},
 Merfolk:{bonuses:{speed:2,stamina:1}},
 Mink:{bonuses:{speed:2,stamina:1},style:'Electro martial arts'},
 'Sky Islander':{bonuses:{speed:1,stamina:1}},
 Longarm:{bonuses:{strength:1,fightingMastery:1}},
 Longleg:{bonuses:{strength:1,speed:1}},
 Giant:{bonuses:{strength:2,durability:2,endurance:1}},
 Dwarf:{bonuses:{strength:2,speed:2,stamina:1}},
 Snakeneck:{bonuses:{speed:1,battleIQ:1}},
 'Three-eye':{bonuses:{battleIQ:2}},
 Lunarian:{bonuses:{durability:2,strength:1,speed:1,endurance:1}},
 Buccaneer:{bonuses:{strength:2,durability:2,endurance:1}},
};
export const FAMILY_TRAITS={
 Monkey:{bonuses:{battleIQ:1,endurance:1,stamina:1},guaranteedHaki:['haki_observation'],hakiBonus:30},
 Portgas:{bonuses:{endurance:1,stamina:1},hakiBonus:30},
 Gol:{bonuses:{fightingMastery:1,battleIQ:1,endurance:1},guaranteedHaki:['haki_conqueror'],hakiBonus:60,conquerorMultiplier:12},
 Trafalgar:{bonuses:{battleIQ:2,endurance:1},hakiBonus:10},
 Jaguar:{bonuses:{strength:1,durability:1},style:'Brawling',hakiBonus:15},
 Nefertari:{bonuses:{battleIQ:1,stamina:1},hakiBonus:15},
 Vinsmoke:{bonuses:{strength:1,durability:1,speed:1},style:'Black Leg-inspired kicks'},
 Shimotsuki:{bonuses:{fightingMastery:1,speed:1},style:'One-sword style',hakiBonus:15},
 Kozuki:{bonuses:{fightingMastery:1,durability:1},style:'Two-sword style',hakiBonus:20},
 Donquixote:{bonuses:{battleIQ:1,fightingMastery:1},guaranteedHaki:['haki_armament'],hakiBonus:35},
 Charlotte:{bonuses:{durability:1,stamina:1},hakiBonus:30,conquerorMultiplier:2.5},
};
export function heritageProfile(character={}){
 const race=RACE_TRAITS[character.race]||RACE_TRAITS.Human,family=FAMILY_TRAITS[character.family]||{};
 const bonuses={...race.bonuses};
 for(const [key,value] of Object.entries(family.bonuses||{}))bonuses[key]=(bonuses[key]||0)+value;
 const styles=[race.style,family.style].filter(Boolean);
 const guaranteedHaki=[...new Set(family.guaranteedHaki||[])];
 return {bonuses,styles,guaranteedHaki,hakiBonus:family.hakiBonus||0,conquerorMultiplier:family.conquerorMultiplier||1};
}

export const mastery = options([['Untrained',35],['Novice',35],['Practiced',20],['Expert',8],['Master',1.8],['Legendary',0.2]]);
export const hakiMastery = options([['Newly awakened',57],['Basic control',30],['Skilled',11],['Advanced technique',1.9],['World-class',0.1]]);
export const fruitMastery = options([['Just eaten',40],['Basic control',35],['Creative techniques',18],['Expert control',6],['Awakened',1]]);
export const stats = options([['Ordinary',44],['Trained',32],['Exceptional',17],['Elite',6],['Monstrous',0.9],['Legendary',0.1]]);
export const fruits = {
 Paramecia: options([['Chop-Chop / Bara Bara',12],['Slip-Slip / Sube Sube',10],['Kilo-Kilo / Kilo Kilo',10],['Bomb-Bomb / Bomu Bomu',8],['Wax-Wax / Doru Doru',10],['Clone-Clone / Mane Mane',8],['Flower-Flower / Hana Hana',6],['Dice-Dice / Supa Supa',7],['Spike-Spike / Toge Toge',8],['Cage-Cage / Ori Ori',8],['Spring-Spring / Bane Bane',10],['Slow-Slow / Noro Noro',6],['Door-Door / Doa Doa',6],['Hollow-Hollow / Horo Horo',5],['Revive-Revive / Yomi Yomi',3,'Revival is conditional on death; Brook’s learned techniques are not automatic.'],['Shadow-Shadow / Kage Kage',4],['Clear-Clear / Suke Suke',5],['Paw-Paw / Nikyu Nikyu',1],['Op-Op / Ope Ope',1],['String-String / Ito Ito',3],['Venom-Venom / Doku Doku',3],['Magnet-Magnet / Jiki Jiki',4],['Quake-Quake / Gura Gura',0.5],['Soul-Soul / Soru Soru',0.5],['Mochi-Mochi / Mochi Mochi',2,'Special Paramecia, not a Logia.']]),
 'Standard Zoan': options(['Ox-Ox, Bison model','Ox-Ox, Giraffe model','Cat-Cat, Leopard model','Dog-Dog, Dachshund model','Dog-Dog, Jackal model','Dog-Dog, Wolf model','Bird-Bird, Falcon model','Bird-Bird, Albatross model','Horse-Horse','Mole-Mole','Human-Human','Snake-Snake, King Cobra model','Snake-Snake, Anaconda model','Turtle-Turtle','Bug-Bug, Rhinoceros Beetle model','Bug-Bug, Hornet model']),
 'Ancient Zoan': options(['Dragon-Dragon, Allosaurus model','Dragon-Dragon, Spinosaurus model','Dragon-Dragon, Pteranodon model','Dragon-Dragon, Brachiosaurus model','Dragon-Dragon, Pachycephalosaurus model','Dragon-Dragon, Triceratops model','Elephant-Elephant, Mammoth model','Cat-Cat, Saber Tiger model','Spider-Spider, Rosamygale Grauvogeli model']),
 'Mythical Zoan': options([['Bird-Bird, Phoenix model',8],['Human-Human, Buddha model',4],['Fish-Fish, Azure Dragon model',3],['Dog-Dog, Nine-Tailed Fox model',6],['Dog-Dog, Okuchi-no-Makami model',4],['Snake-Snake, Yamata-no-Orochi model',6],['Human-Human, Onyudo model',8],['Human-Human, Nika model',1,'Rubber-like powers at first. Awakening is not automatic.']]),
 Logia: options([['Smoke-Smoke / Moku Moku',20],['Sand-Sand / Suna Suna',15],['Flame-Flame / Mera Mera',12],['Rumble-Rumble / Goro Goro',5],['Ice-Ice / Hie Hie',5],['Dark-Dark / Yami Yami',2,'Does not grant the usual elemental intangibility.'],['Glint-Glint / Pika Pika',3],['Magma-Magma / Magu Magu',3],['Swamp-Swamp / Numa Numa',20],['Gas-Gas / Gasu Gasu',10],['Snow-Snow / Yuki Yuki',15],['Woods-Woods / Mori Mori',4]])
};
export const swords = options([['Forged katana',60],['Naval saber',30],['Heavy cutlass',25],['Shigure',6],['Yubashiri',3],['Sandai Kitetsu',3],['Kashu',3],['Wado Ichimonji',0.6],['Shusui',0.6],['Enma',0.4],['Ame no Habakiri',0.4],['Nidai Kitetsu',0.4],['Yoru',0.1],['Ace',0.1],['Shodai Kitetsu',0.1]]);
// Era indexes: Roger's final voyage; early Great Pirate Era; Summit War opening; New World opening.
export const crewCatalog = [
 ['Roger Pirates',[0],'Pirate'],['Whitebeard Pirates',[0,1,2],'Pirate'],['Red Hair Pirates',[1,2,3],'Pirate'],['Straw Hat Pirates',[2,3],'Pirate'],['Heart Pirates',[2,3],'Pirate'],['Kid Pirates',[2,3],'Pirate'],['Sun Pirates',[1,2,3],'Pirate'],['Kuja Pirates',[0,1,2,3],'Pirate'],['Beast Pirates',[1,2,3],'Pirate'],['Big Mom Pirates',[0,1,2,3],'Pirate'],['Blackbeard Pirates',[2,3],'Pirate'],['East Blue Marine branch',[0,1,2,3],'Marine'],['Marine Headquarters unit',[0,1,2,3],'Marine'],['G-5 unit',[3],'Marine'],['Revolutionary Army cell',[1,2,3],'Revolutionary'],['Freedom Fighters',[0],'Revolutionary'],['Cipher Pol field unit',[0,1,2,3],'Cipher Pol'],['Bounty hunter guild',[0,1,2,3],'Bounty hunter'],['Merchant convoy',[0,1,2,3],'Merchant'],['Independent expedition',[0,1,2,3],'Explorer'],['Island community',[0,1,2,3],'Civilian']
].map(([name,eras,faction])=>({name,eras,faction}));
export const characters = [
 ['Silvers Rayleigh',[0,1,2,3],'Pirate',1],['Scopper Gaban',[0,1,2,3],'Pirate',1],['Crocus',[0,1,2,3],'Pirate',3],['Kozuki Oden',[0],'Pirate',1],['Shanks',[1,2,3],'Pirate',1],['Benn Beckman',[1,2,3],'Pirate',2],['Yasopp',[1,2,3],'Pirate',3],['Marco',[0,1,2,3],'Pirate',2],['Jozu',[0,1,2,3],'Pirate',3],['Vista',[0,1,2,3],'Pirate',4],['Ace',[2],'Pirate',1],['Luffy',[2,3],'Pirate',1],['Zoro',[2,3],'Pirate',2],['Nami',[2,3],'Pirate',5],['Usopp',[2,3],'Pirate',8],['Sanji',[2,3],'Pirate',3],['Chopper',[2,3],'Pirate',6],['Robin',[2,3],'Pirate',4],['Franky',[2,3],'Pirate',5],['Brook',[2,3],'Pirate',4],['Jinbe',[1,2,3],'Pirate',3],['Law',[2,3],'Pirate',1],['Bepo',[2,3],'Pirate',8],['Penguin',[2,3],'Pirate',10],['Shachi',[2,3],'Pirate',10],['Killer',[2,3],'Pirate',3],['Hatchan',[1,2,3],'Pirate',10],['Garp',[0,1,2,3],'Marine',1],['Sengoku',[0,1,2,3],'Marine',1],['Tsuru',[0,1,2,3],'Marine',2],['Smoker',[2,3],'Marine',4],['Tashigi',[2,3],'Marine',10],['Koby',[2,3],'Marine',8],['Helmeppo',[2,3],'Marine',12],['Hina',[2,3],'Marine',6],['Dragon',[1,2,3],'Revolutionary',1],['Ivankov',[1,2,3],'Revolutionary',3],['Sabo',[3],'Revolutionary',2],['Koala',[3],'Revolutionary',10],['Belo Betty',[3],'Revolutionary',5],['Rob Lucci',[2,3],'Cipher Pol',2],['Kaku',[2,3],'Cipher Pol',5],['Kalifa',[2,3],'Cipher Pol',8],['Jabra',[2,3],'Cipher Pol',6],['Johnny',[2,3],'Bounty hunter',12],['Yosaku',[2,3],'Bounty hunter',12],['Daz Bonez',[2,3],'Bounty hunter',3],['Zeff',[1,2,3],'Civilian',3],['Iceburg',[2,3],'Civilian',5],['Paulie',[2,3],'Civilian',8],['Kaya',[2,3],'Civilian',8]
];
export const firstNames = ['Ren','Kaia','Rook','Mira','Finn','Sora','Nero','Iris','Taro','Vega','Mako','Luna','Flint','Coral','Jett','Aster','Rhea','Kiro','Dax','Nori'];
export const surnames = ['Storm','Vale','Drift','Reef','Voss','Ember','Tide','Flint','Marrow','Sable','Cross','Kestrel'];
export const dreams = options(['Find the One Piece','Chart every sea','Become the greatest swordsman','Discover the All Blue','Cure an incurable disease','Free an oppressed homeland','Uncover the lost history','Build a ship that circles the world','Protect a found family','End slavery','Become a Marine admiral','Find a lost relative','Create a sanctuary for every race','Become the richest merchant','Reach the moon','Write the true history of this era']);
