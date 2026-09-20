# Grand Line Origins

A mobile-friendly, static One Piece character creator and fate-driven life simulator with recurring canon encounters and personal story arcs. Spin an animated weighted wheel for every part of your origin, with conditional follow-up wheels, an evolving character sheet and a roll log. Continue into an alternate-world journey after creating your character. No backend, API key, build step or paid service is required.

## Play locally

```sh
npm start
```

Requires Node.js. The development server binds to localhost; use `RPG_PORT=8766 npm start` for another port. Open http://localhost:8000. ES modules require an HTTP server (do not double-click index.html).

```sh
npm test
```

The Node test suite also checks capped-stat filtering, player-choice replay, techniques, campaigns, crew dreams and territory consequences. It checks 3,000 generated origins and 1,500 complete lifetimes across legacy and current rules, weighted sampling, conditional branches, unique weapons/recruits, Haki levels, era/faction filtering, transparent probability shifts, progression, one-roll combat resolution, four-month timing, time skips, captivity, race-based mortality, save migration and terminal death. Browser checks cover desktop/mobile rendering, embarkation, probability display, persistence, export/import and the death screen.

## Character creation

- Origin: time period, race and racial traits, famous bloodline and family connections, D., age, race-conditioned height. The adventure-biased race wheel is now 70% Human / 30% combined non-human, and the famous-bloodline check is 10%.
- Identity: dream, faction, starting government bounty, surname and given name.
- Powers: awakened Haki, the combination of types, separate mastery for each; Devil Fruit possession, class/subtype, named fruit and mastery.
- Combat: fighting style, fighting mastery, appropriate weapons, three separate distinct swords for three-sword style, and mastery for each weapon.
- Attributes: battle IQ, strength, durability, speed, endurance and stamina. Race/family heritage applies transparent full-rank starting shifts after the raw attribute rolls, capped at each track’s maximum.
- Companions: go solo, join an era/faction-appropriate group, or form and name a group. Roll a companion count and each companion's canon/original origin. Canon recruits use a curated era/faction pool without repeats. Original recruits get name, race, role and personality wheels.
- Saves: browser-local autosave, JSON export/import, undo and reset confirmation. Exports include the immutable origin and a versioned, replayable journey roll history. Old version-1 character exports remain importable.

## World model and limits

### Heritage balance

Race odds are authored for a fun adventurer pool rather than a world census: Human 70%, Fish-man 7%, Merfolk 5%, Mink 5%, Sky Islander 4.5%, Longarm 2.5%, Longleg 2.4%, Giant 1.3%, Dwarf 1%, Snakeneck 0.6%, Three-eye 0.35%, Lunarian 0.2%, Buccaneer 0.15%.

Starting rank shifts stack between race and family and cap at the end of the relevant track. Key racial effects: Fish-man +2 Strength / +1 Durability / +1 Endurance; Giant +2 Strength / +2 Durability / +1 Endurance; Dwarf +2 Strength / +2 Speed / +1 Stamina; Lunarian +2 Durability plus +1 Strength / Speed / Endurance; Buccaneer +2 Strength / +2 Durability / +1 Endurance. Other non-human peoples receive smaller thematic bonuses, and Mink heritage includes Electro as a secondary combat style.

The famous-bloodline roll is 10%. Human named-family weights total 100 before race filtering, with rarer lineages such as Gol made meaningfully possible without becoming common. Non-human bloodlines are no longer forced into Charlotte/Jaguar: Giants use a 70/30 Jaguar/original-clan split, while other non-humans use a 25/75 Charlotte/original-clan split.

Family effects are **game inheritance rules, not claims about canon genetics**. Monkey guarantees Observation Haki; Gol guarantees Conqueror’s Haki; Donquixote guarantees Armament Haki. Portgas and Charlotte strongly improve Haki odds without guaranteeing it. Vinsmoke grants Black Leg-inspired kicks as a secondary style, Shimotsuki grants One-sword style, Kozuki grants Two-sword style, and Jaguar grants Brawling. Families also grant themed starting-rank shifts such as Trafalgar +2 Battle IQ, Vinsmoke +1 Strength / Durability / Speed, and Shimotsuki +1 Fighting Mastery / Speed. Guaranteed secondary styles do not delete the separately rolled primary style or weapon setup.


**All odds are authored game-balancing estimates, not official One Piece statistics.** The population baseline favors humans; rare races and extraordinary powers remain rare. This samples aspiring adventurers, not a world census. Every wheel exposes its normalized conditional probabilities. Tiny wheel slices may be unlabeled; the odds list includes every outcome. The pointer lands at the midpoint of the selected weighted slice.

This is an **alternate-timeline fan game**. Canon ownership of a named fruit or weapon is replaced by the player's result; recruiting a known character rewrites their allegiance. Race and family bonuses are deliberately authored game mechanics rather than canonical statements that powers are genetically guaranteed. Era filters are curated starting-era eligibility, not an exhaustive continuity simulation. All fruit users lose swimming ability. Bloodlines grant narrative connections, not automatically inherited combat techniques. D. families force the initial; elsewhere D. results are speculative alternate ancestry. Zoan subtypes are presented as separate wheel outcomes. The catalog is curated, not every canon fruit, weapon, family or character. Includes Egghead revelations and an early Elbaph archive story.

Original companions are **procedurally generated from authored pools**, not live AI model output. A real AI backend can be added later without putting a secret key in browser code. The journey uses a curated cast of 71 canon characters with crew/unit affiliations, fighting styles and authored encounter premises. Eligibility follows the starting era and current sea; this is not a complete simulation of canon chronology or canon-character aging. Named journey recruits remain original characters. Existing-group support is an abstract modifier rather than a simulated roster of the entire canon crew.

## Player intent, mastery, and a world you can change

The next expansion adds **12 advanced techniques**, **10 crew-role stories with 30 milestones**, **6 canon-changing campaigns**, and **territory stewardship**. The complete [development and alternate-history guide](docs/DEVELOPMENT_GUIDE.md) documents every prerequisite, intent, consequence and source anchor.

- Choose whether to press an attack, protect your people, or withdraw; the combat wheel resolves that goal. Saga intentions similarly favor investigation, protection or self-interest. Choices are saved immediately, use no game time and cannot be undone.
- **No stat regression.** Capped stats disappear from practice targets. When no eligible target remains, training events disappear. Useless manuals, quiet practice, prison training and pure lessons are excluded. Mixed story rewards remain meaningful; a capped incidental lesson becomes legacy. The development journal shows mastered stats in gray.
- Advanced Haki applications, fruit control, signature techniques, blade discipline, footwork and command require existing skills. Learning a discipline is uncertain; failed attempts help future attempts. Each discipline can be learned once.
- Choose a companion to support, heal or reconcile with. Their personal milestones unlock navigator, doctor, cook, shipwright, lookout, helmsman, fighter, musician, scholar or quartermaster specialties. Benefits end when the companion leaves or dies.
- Attempt to **save Ace**, extract Vegapunk alive, free Alabasta or Dressrosa, overthrow Wano’s occupation, or claim an Emperor’s territory. Intelligence and coalition chapters precede the decisive operation. Death, capture and permanent failure are real possibilities; saved and killed characters remain part of the alternate-world record.
- A liberated territory needs governance. Defenses affect danger and raid risk; prosperity supports development. Tribute enriches you but erodes stability. At zero stability, the island rejects your stewardship.

The original 18 sagas and existing origin, geography and lifetime systems remain integrated. New rules use an explicit replay boundary: older saved chapters finish under their original rules before adopting player intent and the new progression behavior. Run `npm run docs:development` to regenerate the detailed guide.

## Branching canon sagas

The horizon wheel now opens **18 connected sagas: 72 authored scenes and 216 outcome edges**, supported by 14 additional canon encounter characters. Read the complete [saga atlas and branch trees](docs/SAGA_ATLAS.md), or expand the same atlas in the live story compass. Sources appear beside canon anchors; all player missions and endings are original alternate-timeline fiction.

Stories include Nami’s tribute ledger, Baratie’s starving raiders, Ohara’s scattered books, Flevance’s medical records, Alabasta’s conspiracy, Shandora’s bell, Water 7’s evacuation, Sabaody’s auctions, Marineford’s wounded, Fish-Man Island’s reconciliation, Dressrosa’s missing people, Whole Cake’s coerced contracts, Wano’s polluted water, Egghead’s broadcast, Elbaph’s library, and a Roger-era pilot’s journal. Two original voyages bring connected stories to ports without a canon saga.

The flow is **event wheel → saga wheel → player intent → consequence wheel**. A response follows an explicit edge to a different scene or a permanent ending. Each scene occupies one four-month chapter, with ordinary events between scenes; canon incidents are inspirations for these compressed alternate missions, not a day-by-day retelling. You can leave an island and return to its unfinished story. Named sites use exact QGIS names and regions; dead required cast members or destroyed sites can make a thread unavailable. Closed threads remain visible with the reason.

Evidence, trust, judgment, existing relationships, money, injuries, allegiance, and accumulated government heat shape the response weights. Outcomes change practice, leads, loyalty, reputation, money, injuries, captivity, and outlaw bounty. Refuge endings favor local recovery/rescue/homecoming; archives favor reflection and dream research. Reputation changes do not falsely increment personal meeting counters. Endings cannot be replayed for rewards. No saga grants a canon power or an instant cure. Separate three-stage campaigns can change major canon outcomes through preparation and a risky final operation.

Existing save documents retain schema 3 and rules version 2. `sagaCutover` marks the number of pre-expansion modern rolls: old outcomes, probabilities, and cast pools replay under their original eligibility before new sagas/cast become available. Exports store rolls and this boundary; saga state, evidence, bonds, and endings are reconstructed. Legacy version-1 pending events still finish through the frozen legacy engine.

`npm test` traverses every saga outcome and every complete path, round-trips saves at each stage, checks old-save fixtures from the pre-expansion revision, and tests geography, era/death gates, captivity, lasting rewards, and escaped UI text. Regenerate the checked-in atlas with `npm run docs:sagas` after changing authored scenes.

## The journey

Press **Begin your journey** on a completed origin. Before Chapter 1, a zero-time **starting-location wheel** chooses a real QGIS location; faction, family, crew affiliation and age shape its weights. The player chooses intent in combat, sagas, advanced training, crew stories, canon campaigns and territory stewardship; wheels resolve the consequences. Character creation retains undo and quick generation; the journey has no undo or reroll controls. On the web, **Spacebar** is the quick key for the primary Spin / Continue button when focus is not inside another interactive control.

The main wheel contains 37 event categories, conditionally filtered: training, quiet months, world events, pirates, Marines, bounty hunters, sparring, Devil Fruit discovery, Haki awakening, treasure, weapon caches, recruitment, betrayal, storms, illness, rescue, islands, duels, trade, mentors, time skips, stored-fruit decisions, celebrations, ships in distress, dream milestones, travel, recovery, reflection, teaching, homecoming, leadership and revolutionary contacts. Captivity substitutes two prison/escape events until release. Sagas and canon campaigns require eligible stories; crew, technique and territory events appear only when their prerequisites are met.

- **Clock:** one resolved event advances four months. Opponent, instinct and reward wheels within it add no extra time. Time skips explicitly replace four months with 1, 2, 5 or 10 years. An event near the maximum lifespan is capped at the remaining months.
- **Instincts:** fate may roll an urge to flee, aggression, protectiveness or tactical awareness. For example, a 33% escape chance becomes 40%: this is **+7 percentage points**, with other outcomes reduced proportionally. Base and adjusted probabilities are visible. Steady resolve makes no change. Training has a similar automatic inspiration/distraction wheel. Age, injuries, companions and opponent strength also weight the impulse wheel.
- **Combat:** a named character/crew wheel and an automatic reception wheel establish the context. A peaceful reception leads to a social-resolution wheel; a hostile reception leads to an instinct wheel and exactly **one encounter-resolution wheel** decides victory, lethal victory, escape, injury, mercy/rescue, capture or death. Combat rating includes ranks, Haki, fruit mastery, weapons, allies, equipment, injuries and aging. Named opponents have individually authored ratings. Lacking Armament makes attacking a Logia harder. Offensive impulses scale down when the opponent greatly outclasses you; the urge to flee still adds seven percentage points. This is a game rating, not canonical power scaling.
- **Growth:** practice thresholds are 0, 10, 30, 70, 140 and 260; shorter mastery tracks use only the applicable thresholds. Training builds progress rather than rerolling a character's existing ranks. Haki awakening adds a missing type. A newly eaten fruit begins at its lowest mastery.
- **Inventory:** fruit can be eaten, stored, sold, gifted or lost as fate decides. Stored fruit can reappear in a later provisions event. A character who already has a fruit cannot eat a second. Held fruits are excluded from new discovery pools. Compatible weapons replace the least-practiced slot, keeping the old weapon in inventory; the new weapon starts at novice mastery. Medical supplies are used automatically, manuals grant practice, and armor affects combat rating.
- **World:** world events now change persistent **stability** and government control instead of giving every character the same risk. Your displayed 0–5 danger is derived from allegiance, local sea tier, bounty, active laws and local danger zones. Stable government waters can be near 0–1 for a Marine while remaining near 5 for a pirate; instability pushes both sides toward dangerous middle/high values. Buster Calls, island eradication, new laws, pirate executions, uprisings, prison breaks and wars can reshape later travel and encounter pools.
- **Crew turns:** every named companion gets a deterministic background turn after each completed chapter. They can strengthen, pursue personal goals, gain or lose loyalty, get hurt, leave the crew or die. These rolls are hidden from the main wheel but written into the chapter effects and replay identically from an export.
- **Death:** lethal combat, dangerous travel, rescues, island expeditions, captivity and aging can permanently end a run, with lethality scaling upward in dangerous conditions. Companion deaths are also permanent in the alternate world. The final character, counters, cause, age, timeline and every roll remain exportable. Results commit before their animations, so a refresh resumes after the result instead of rerolling it (when browser storage is available).

### Aging settings

These are **authored balance estimates**, not official lifespans. Most races share a humanoid baseline because canon does not provide precise lifespan data for them.

| Race | Aging-risk onset | Maximum game lifespan |
| --- | ---: | ---: |
| Giant | 220 years | 380 years |
| Dwarf | 100 years | 180 years |
| Buccaneer | 75 years | 130 years |
| All other supported races | 70 years | 120 years |

After onset, monthly mortality rises along a cubic curve. A dedicated aging wheel checks the cumulative probability across **all months** of the chapter, including a time skip. It does not advance time again. Reaching the maximum yields a mandatory old-age death result; there is no arbitrary chapter limit.

### Save compatibility

The browser key remains `grand-line-origins:v1` so existing saves are found. New exports use document schema 3 and journey rules version 2. Old origins and schema-2 journeys are accepted. Journeys created before the starting-location wheel keep their previously reconstructed starting geography and skip the new Chapter-0 setup spin; newly created journeys record the setup-roll version so unresolved and resolved starting-point saves replay correctly. Previous journey rolls are replayed with the frozen `journey-v1.js` and `journey-data-v1.js` rules. A partially resolved older event finishes under those same rules before adopting the new story system. Export stores the validated legacy prefix and new rolls separately; derived character/story fields are reconstructed, not trusted. Death stays terminal and reloads do not reroll fate. Importing an earlier legitimate backup can still restore its earlier state; this is local persistence, not server-enforced anti-cheat.

## A character with a life, not an interchangeable event queue

- **Young and newly powered:** relative youth favors training and mentors. A newly eaten, still-unfamiliar fruit creates a two-year control-learning window: training events are four times as attractive and fruit mastery targets receive a strong priority. The arc naturally ends as mastery or time advances.
- **Aging and injury:** life stages scale with race. A human in their seventies enters the legacy years; an eighty-year-old giant does not. Elder training excludes raw strength, speed, endurance, stamina and durability grinding, emphasizing existing techniques and judgment. Recovery, teaching, leadership, reflection and homecoming become more frequent. Injuries favor care and limit strenuous practice.
- **Dreams:** all 16 origin dreams have four distinct milestones. Their relevant activities receive higher weights. Later milestones require travel, time, skills and sometimes specific accomplishments. The greatest-swordsman claim requires a recorded victory over Mihawk; curing a disease requires a doctor’s guidance; an admiral requires a Marine commission. Fate can open a Marine training berth or sword apprenticeship when the initial character does not fit that dream. Fulfillment does not end the run: legacy continues.
- **Places:** the journey begins with a weighted spin across the 230-location QGIS world graph, then travel continues on that same map. The 45 authored routes control Reverse Mountain and Paradise progression; where the source map intentionally has no authored route yet, same-sea sailing uses QGIS coordinates to surface nearby destinations. Territory, climate and mapped hazards feed danger and encounter context.
- **Canon meetings:** opponents are people such as Smoker, Buggy, Luffy, Law, Shanks, Mihawk and their crews or units. Temperament, faction, bounty and previous meetings influence whether weapons are drawn at all. Friendly meetings can bring help, lessons or dream leads. Hostile meetings still have only one battle-resolution wheel.
- **Memory:** help produces allies; hostility leaves grudges; recurring characters remember their meetings. A character killed by a journey outcome stays dead and disappears from both encounter and mentor pools. This changes your alternate world, not the official story.
- **Named teachers:** a teacher’s expertise changes training-target weights; Koushirou favors blades, while a medical dream favors Crocus or Kureha when available.
- **Variety:** the previous four chapters reduce repeated event weights, while the previous two lessons reduce repeated training targets. Story prose, encounter cards, milestone tracks, a relationship strip and a persistent island journal make the changes visible.

Canon names, affiliations and broad abilities provide the setting. Ratings, likelihoods, life priorities, dialogue-free story premises and reactions to the player are authored game fiction, not canonical events or official statistics. Current cast affiliations are curated era snapshots, so later canonical changes are not automatically replayed.

### QGIS world-data bridge

The QGIS export is now live game data rather than only a schema contract. `src/world/` contains a browser-friendly export of the cleaned GeoPackage: **230 locations, 45 authored routes, 8 regions and 14 danger zones**. `src/world-map.js` resolves legacy place names, authored route direction, Log/Eternal Pose requirements, route travel days/danger, faction territory and coordinate-nearest sailing.

Reverse Mountain and Paradise honor the authored route graph instead of inventing shortcuts. The four Blues and the current New World dataset use same-region QGIS coordinates where explicit route authoring is still incomplete. Calm Belt and Red Line geography contribute additional danger. Destructive alternate-world events remove real map destinations from later travel pools.

The original high-resolution QGIS raster is source material rather than a required runtime dependency; gameplay uses the structured GeoPackage-derived data so the static site remains lightweight.

## Hosting on GitHub Pages

The repository contains a manual Pages workflow with tests. In GitHub **Settings → Pages**, choose **GitHub Actions** as the source. Run **Deploy game to Pages** under Actions. No deployment runs automatically on source push, so enabling public hosting is an explicit action. Asset paths are relative and work under the `/RPG/` project path.

The app works without network services after assets are loaded. Google Fonts is optional; system fonts are used if unavailable. Autosave is per browser and per origin, not cloud sync. Export JSON to transfer or back up a character.

## Structure

- `src/data.js` — editable weighted catalogs.
- `src/engine.js` — pure deterministic branching rules and save validation.
- `src/journey-data.js` — event catalogs, instincts, growth tracks and longevity settings.
- `src/journey.js` — current journey state machine, progression, aging and versioned save replay.
- `src/development.js` / `src/development-view.js` — progression rules, intent definitions and the development journal.
- `src/techniques.js` / `src/crew-stories.js` / `src/crossroads.js` — advanced applications, companion dreams, alternate history and territory stewardship.
- `src/saga-data.js` / `src/sagas.js` / `src/saga-view.js` — authored saga graphs, deterministic consequences, eligibility and the in-game branch atlas.
- `src/story-data.js` / `src/story.js` — canon cast, locations, dream milestones, priorities and relationship memory.
- `src/world/` / `src/world-map.js` — QGIS-derived locations, routes, regions, danger zones and browser travel-graph adapter.
- `src/simulation.js` — faction-sensitive danger, world stability, destructive world events and deterministic companion background turns.
- `src/journey-v1.js` / `src/journey-data-v1.js` — frozen compatibility rules for existing saves.
- `src/app.js` — creator/journey UI, wheel animation, live character, timeline, browser saves and downloads.
- `style.css` / `index.html` — responsive presentation.
- `tests/engine.test.js` / `tests/journey.test.js` / `tests/legacy-journey.test.js` — origin and lifetime invariant tests.

One Piece belongs to Eiichiro Oda and its respective rights holders. This is an unofficial fan project.

Pirates in Marine or World Government territory have a restricted horizon: confront or evade patrols, face bounty hunters, find loot or weapons, sail away, or pursue available story operations. Training, ordinary trade, recruitment, and celebrations return outside hostile territory. A hidden refuge permits recovery; liberated territory restores normal options. Other pirate flags are not automatically enemies. Older saves retain their recorded outcomes and finish pending chapters under their original rules.

Voyage momentum: after four completed non-travel chapters on the same island, travel takes exactly 70% of the horizon wheel. Each additional chapter raises it to 80%, 90%, then a 95% cap. Arrival resets the count; individual spins and intent selections do not count as chapters. Captivity still requires escape before sailing.

Onward travel follows the Blues → their own Reverse Mountain entrance → Reverse Mountain → Twins Cape → Paradise’s charted island routes → Sabaody → a coated-ship passage through Fish-Man Island → the New World → Lodestar. The New World itinerary is an authored game route, not a canonical map of every magnetic heading. Lodestar requires at least five distinct visited New World locations and the final approach from Elbaph; reaching it does not unlock Laugh Tale. Missing side-island exits reconnect within their own sea, destroyed destinations remain excluded, and historical saves retain their original route pools.

Geography references: [Reverse Mountain’s four ascending canals](https://live-action.onepiece-base.com/location/reverse-mountain/), [Sabaody and ship coating](https://one-piece.com/story/sabaody/index.html), and [Lodestar](https://onepiece.fandom.com/wiki/Lodestar_Island). The pacing percentages, island-count threshold, and added itinerary are game rules.

Family combat inheritance now shapes the primary-style wheel: Shimotsuki and Kozuki guarantee a one-, two-, or three-sword style, favoring their existing family specialty. Monkey and Jaguar have exactly 60% Brawling; Vinsmoke has exactly 60% Black Leg-inspired kicks. The other 40% retains alternative styles. These are game rules. Sword styles still generate the matching number of unique weapons and mastery rolls. Already-rolled styles and historical probabilities are preserved; unfinished origins use the new rules when they reach the style wheel.
