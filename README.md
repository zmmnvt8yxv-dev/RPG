# Grand Line Origins

A mobile-friendly, static One Piece character creator and fate-driven life simulator. Spin an animated weighted wheel for every part of your origin, with conditional follow-up wheels, an evolving character sheet and a roll log. Continue into an alternate-world journey after creating your character. No backend, API key, build step or paid service is required.

## Play locally

```sh
npm start
```

Open http://localhost:8000. ES modules require an HTTP server (do not double-click index.html).

```sh
npm test
```

The Node test suite checks 3,000 generated origins and 1,000 complete lifetimes, weighted sampling, conditional branches, unique weapons/recruits, Haki levels, era/faction filtering, transparent probability shifts, progression, one-roll combat resolution, four-month timing, time skips, captivity, race-based mortality, save migration and terminal death. Browser checks cover desktop/mobile rendering, embarkation, probability display, persistence, export/import and the death screen.

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

Original companions are **procedurally generated from authored pools**, not live AI model output. A real AI backend can be added later without putting a secret key in browser code. The journey uses original encounter archetypes and generated world events, not a simulation of every canon person or political relationship. Named journey recruits are original characters. Existing-group support is an abstract modifier rather than a simulated roster of the entire canon crew.

## The journey

Press **Begin your journey** on a completed origin. There are no tactical choices: the user only spins and advances to the next wheel. Character creation retains undo and quick generation; the journey has no undo or reroll controls.

The main wheel contains 24 event categories, conditionally filtered: training, quiet months, world events, pirates, Marines, bounty hunters, sparring, Devil Fruit discovery, Haki awakening, treasure, weapon caches, recruitment, betrayal, storms, illness, rescue, islands, duels, trade, mentors, time skips, stored-fruit decisions, celebrations and ships in distress. Captivity substitutes two prison/escape events until release.

- **Clock:** one resolved event advances four months. Opponent, instinct and reward wheels within it add no extra time. Time skips explicitly replace four months with 1, 2, 5 or 10 years. An event near the maximum lifespan is capped at the remaining months.
- **Instincts:** fate may roll an urge to flee, aggression, protectiveness or tactical awareness. For example, a 33% escape chance becomes 40%: this is **+7 percentage points**, with other outcomes reduced proportionally. Base and adjusted probabilities are visible. Steady resolve makes no change. Training has a similar automatic inspiration/distraction wheel.
- **Combat:** opponent and instinct wheels establish the context; exactly **one encounter-resolution wheel** decides victory, lethal victory, escape, injury, mercy/rescue, capture or death. Combat rating includes ranks, Haki, fruit mastery, weapons, allies, equipment, injuries and aging. This is a game rating, not canonical power scaling.
- **Growth:** practice thresholds are 0, 10, 30, 70, 140 and 260; shorter mastery tracks use only the applicable thresholds. Training builds progress rather than rerolling a character's existing ranks. Haki awakening adds a missing type. A newly eaten fruit begins at its lowest mastery.
- **Inventory:** fruit can be eaten, stored, sold, gifted or lost as fate decides. Stored fruit can reappear in a later provisions event. A character who already has a fruit cannot eat a second. Held fruits are excluded from new discovery pools. Compatible weapons replace the least-practiced slot, keeping the old weapon in inventory; the new weapon starts at novice mastery. Medical supplies are used automatically, manuals grant practice, and armor affects combat rating.
- **World:** generated events change a persistent danger level (0–5), altering encounter frequency and enemy strength. They do not follow canon's fixed chronology.
- **Death:** lethal events or aging permanently end the run. The final character, counters, cause, age, timeline and every roll remain exportable. Results commit before their animations, so a refresh resumes after the result instead of rerolling it (when browser storage is available).

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

The browser key remains `grand-line-origins:v1` so existing saves are found. New exports use document schema 2 and journey rules version 1. Loading reconstructs the live character from the validated origin and ordered journey results; exported derived character fields are not trusted. Partial events, including pending aging checks, resume exactly. No rolls can follow death. This is local persistence, not a server-enforced anti-cheat system: importing an earlier legitimate backup can restore its earlier state.

## Hosting on GitHub Pages

The repository contains a manual Pages workflow with tests. In GitHub **Settings → Pages**, choose **GitHub Actions** as the source. Run **Deploy game to Pages** under Actions. No deployment runs automatically on source push, so enabling public hosting is an explicit action. Asset paths are relative and work under the `/RPG/` project path.

The app works without network services after assets are loaded. Google Fonts is optional; system fonts are used if unavailable. Autosave is per browser and per origin, not cloud sync. Export JSON to transfer or back up a character.

## Structure

- `src/data.js` — editable weighted catalogs.
- `src/engine.js` — pure deterministic branching rules and save validation.
- `src/journey-data.js` — event catalogs, instincts, growth tracks and longevity settings.
- `src/journey.js` — journey state machine, probability modifiers, progression, aging and save replay.
- `src/app.js` — creator/journey UI, wheel animation, live character, timeline, browser saves and downloads.
- `style.css` / `index.html` — responsive presentation.
- `tests/engine.test.js` / `tests/journey.test.js` — origin and lifetime invariant tests.

One Piece belongs to Eiichiro Oda and its respective rights holders. This is an unofficial fan project.
