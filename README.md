# Grand Line Origins

A mobile-friendly, static One Piece character creator and fate-driven life simulator with recurring canon encounters and personal story arcs. Spin an animated weighted wheel for every part of your origin, with conditional follow-up wheels, an evolving character sheet and a roll log. Continue into an alternate-world journey after creating your character. No backend, API key, build step or paid service is required.

## Play locally

```sh
npm start
```

Open http://localhost:8000. ES modules require an HTTP server (do not double-click index.html).

```sh
npm test
```

The Node test suite checks 3,000 generated origins and 1,500 complete lifetimes across legacy and current rules, weighted sampling, conditional branches, unique weapons/recruits, Haki levels, era/faction filtering, transparent probability shifts, progression, one-roll combat resolution, four-month timing, time skips, captivity, race-based mortality, save migration and terminal death. Browser checks cover desktop/mobile rendering, embarkation, probability display, persistence, export/import and the death screen.

## Character creation

- Origin: time period, race and racial traits, famous bloodline and family connections, D., age, race-conditioned height.
- Identity: dream, faction, starting government bounty, surname and given name.
- Powers: awakened Haki, the combination of types, separate mastery for each; Devil Fruit possession, class/subtype, named fruit and mastery.
- Combat: fighting style, fighting mastery, appropriate weapons, three separate distinct swords for three-sword style, and mastery for each weapon.
- Attributes: battle IQ, strength, durability, speed, endurance and stamina.
- Companions: go solo, join an era/faction-appropriate group, or form and name a group. Roll a companion count and each companion's canon/original origin. Canon recruits use a curated era/faction pool without repeats. Original recruits get name, race, role and personality wheels.
- Saves: browser-local autosave, JSON export/import, undo and reset confirmation. Exports include the immutable origin and a versioned, replayable journey roll history. Old version-1 character exports remain importable.

## World model and limits

**All odds are authored game-balancing estimates, not official One Piece statistics.** The population baseline favors humans; rare races and extraordinary powers remain rare. This samples aspiring adventurers, not a world census. Every wheel exposes its normalized conditional probabilities. Tiny wheel slices may be unlabeled; the odds list includes every outcome. The pointer lands at the midpoint of the selected weighted slice.

This is an **alternate-timeline fan game**. Canon ownership of a named fruit or weapon is replaced by the player's result; recruiting a known character rewrites their allegiance. Era filters are curated starting-era eligibility, not an exhaustive continuity simulation. All fruit users lose swimming ability. Bloodlines grant narrative connections, not automatically inherited combat techniques. D. families force the initial; elsewhere D. results are speculative alternate ancestry. Zoan subtypes are presented as separate wheel outcomes. The catalog is curated, not every canon fruit, weapon, family or character. Includes Wano / early Egghead reveals.

Original companions are **procedurally generated from authored pools**, not live AI model output. A real AI backend can be added later without putting a secret key in browser code. The journey uses a curated cast of 57 canon characters with crew/unit affiliations, fighting styles and authored encounter premises. Eligibility follows the starting era and current sea; this is not a complete simulation of canon chronology or canon-character aging. Named journey recruits remain original characters. Existing-group support is an abstract modifier rather than a simulated roster of the entire canon crew.

## The journey

Press **Begin your journey** on a completed origin. Before Chapter 1, a zero-time **starting-location wheel** chooses a real QGIS location; faction, family, crew affiliation and age shape its weights. There are no tactical choices: the user only spins and advances to the next wheel. Character creation retains undo and quick generation; the journey has no undo or reroll controls. On the web, **Spacebar** is the quick key for the primary Spin / Continue button when focus is not inside another interactive control.

The main wheel contains 32 event categories, conditionally filtered: training, quiet months, world events, pirates, Marines, bounty hunters, sparring, Devil Fruit discovery, Haki awakening, treasure, weapon caches, recruitment, betrayal, storms, illness, rescue, islands, duels, trade, mentors, time skips, stored-fruit decisions, celebrations, ships in distress, dream milestones, travel, recovery, reflection, teaching, homecoming, leadership and revolutionary contacts. Captivity substitutes two prison/escape events until release.

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
- `src/story-data.js` / `src/story.js` — canon cast, locations, dream milestones, priorities and relationship memory.
- `src/world/` / `src/world-map.js` — QGIS-derived locations, routes, regions, danger zones and browser travel-graph adapter.
- `src/simulation.js` — faction-sensitive danger, world stability, destructive world events and deterministic companion background turns.
- `src/journey-v1.js` / `src/journey-data-v1.js` — frozen compatibility rules for existing saves.
- `src/app.js` — creator/journey UI, wheel animation, live character, timeline, browser saves and downloads.
- `style.css` / `index.html` — responsive presentation.
- `tests/engine.test.js` / `tests/journey.test.js` / `tests/legacy-journey.test.js` — origin and lifetime invariant tests.

One Piece belongs to Eiichiro Oda and its respective rights holders. This is an unofficial fan project.
