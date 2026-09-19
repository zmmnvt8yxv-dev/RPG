import {options} from './data.js';
export const JOURNEY_VERSION = 2;
// Authored longevity settings, not claims about canonical life expectancy.
// Most races use a shared humanoid baseline because canon does not quantify them.
export const LIFESPANS = {
 default:{onset:70,limit:120}, Giant:{onset:220,limit:380},
 Dwarf:{onset:100,limit:180}, Buccaneer:{onset:75,limit:130},
};
export const XP_LEVELS = [0,10,30,70,140,260];
export const TRACKS = {
 fightingMastery:['Untrained','Novice','Practiced','Expert','Master','Legendary'],
 weapon:['Untrained','Novice','Practiced','Expert','Master','Legendary'],
 fruitMastery:['Just eaten','Basic control','Creative techniques','Expert control','Awakened'],
 haki:['Newly awakened','Basic control','Skilled','Advanced technique','World-class'],
 battleIQ:['Instinctive','Average','Tactical','Brilliant','Genius'],
 stat:['Ordinary','Trained','Exceptional','Elite','Monstrous','Legendary'],
};
export const TRAINING_LABELS = {
 fightingMastery:'Fighting mastery',fruitMastery:'Devil Fruit mastery',
 haki_observation:'Observation Haki',haki_armament:'Armament Haki',haki_conqueror:'Conqueror’s Haki',
 battleIQ:'Battle IQ',strength:'Strength',durability:'Durability',speed:'Speed',endurance:'Endurance',stamina:'Stamina',
};
export const EVENTS = [
 ['dream','Pursue your dream',13],['travel','Travel through the mapped world',10],['recovery','Recover from the journey',5],['reflection','Reflect and plan',4],['teaching','Pass on your experience',5],['homecoming','A call from home',3],['leadership','Your companions need direction',5],['revolutionaries','Meet the Revolutionaries',4],['training','Dedicated training',18],['quiet','Quiet months',12],['world','World event',7],
 ['pirates','Encounter pirates',9],['marines','Encounter Marines',6],['hunters','Bounty hunters',3],
 ['spar','Spar with colleagues',7],['fruit','Discover a Devil Fruit',2],['haki','A test of will',3],
 ['treasure','Hidden treasure',6],['weapon','Weapon cache',4],['recruit','A new companion',4],
 ['betrayal','Betrayal in the ranks',2],['storm','Storm at sea',5],['illness','Fall ill',3],
 ['rescue','Someone needs rescue',5],['island','Uncharted island',7],['duel','A rival challenges you',4],
 ['trade','A chance to trade',5],['mentor','Meet a wandering mentor',3],['timeskip','A passage of years',1],
 ['provisions','A fruit in your possession',3],['celebration','Port celebration',4],['shipwreck','Ship in distress',2],
];
export const EVENT_BY_ID = Object.fromEntries(EVENTS.map(([value,label,weight])=>[value,{value,label,weight}]));
export const COMBAT_EVENTS = ['pirates','marines','hunters','duel','betrayal','revolutionaries'];
export const THREATS = [
 {value:'rookie',label:'Rookie band',weight:40,power:12},
 {value:'seasoned',label:'Seasoned fighters',weight:32,power:24},
 {value:'veteran',label:'Veteran officer',weight:19,power:42},
 {value:'elite',label:'New World elite',weight:8,power:67},
 {value:'legend',label:'A living legend',weight:1,power:96},
];
export const INSTINCTS = options([
 ['Steady resolve',60,'No probability adjustment.'],
 ['Urge to flee',15,'Adds 7 percentage points to escape. Other outcomes shrink proportionally.'],
 ['Aggressive impulse',12,'Adds 7 percentage points to decisive victory.'],
 ['Protect your people',8,'Adds 7 percentage points to survival through mercy or rescue.'],
 ['Read the battlefield',5,'Adds 7 percentage points to controlled victory.'],
]);
export const WORLD_EVENTS = options([
 ['Marine crackdown',16,'Government control tightens. Marines become safer in controlled waters while outlaws face more scrutiny.'],
 ['Buster Call authorized',3,'A government annihilation order creates an extreme local danger zone.'],
 ['An island is eradicated',2,'A named island disappears from future travel routes in this alternate world.'],
 ['A new World Government law',10,'A new law can permanently change faction risk at ports and islands.'],
 ['A notorious pirate is executed',8,'A living canon pirate is removed from future encounter pools.'],
 ['An Emperor falls',6,'The power vacuum destabilizes the balance of power.'],
 ['A Revolutionary uprising',7,'Government control weakens and local conflict spreads.'],
 ['A mass prison break',5,'Dangerous prisoners return to the seas and government control slips.'],
 ['An island is liberated',12,'A local victory improves stability but weakens government control.'],
 ['Trade routes reopen',12,'Stability improves and trade brings a small dividend.'],
 ['Government amnesty',7,'Stability improves and your government bounty is reduced.'],
 ['War engulfs a kingdom',9,'World stability falls sharply.'],
 ['A golden age of discovery',3,'A calmer period improves stability and profitable exploration.'],
]);
export const ROLES = ['Navigator','Doctor','Cook','Shipwright','Lookout','Helmsman','Fighter','Musician','Scholar','Quartermaster'];
export const TREASURES = options([
 ['Bag of berries',50],['Jewels',25],['Ancient coin',12],['Eternal Pose',6],
 ['Medical supplies',5],['Protective armor',1.5],['Rare combat manual',0.5],
]);
export const OUTCOME_NOTES = {
 victory:'You defeat the opponent and survive.', lethal:'You win; your opponent is killed.',
 escape:'You escape the encounter.', wounded:'You lose and survive with injuries.',
 spared:'You lose, but mercy or rescue saves you.', captured:'You are captured; captivity replaces your next event pool.',
 death:'Your journey ends here.',
};
