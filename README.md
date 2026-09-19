# Grand Line Origins

A mobile-friendly, static One Piece character-creation game. Spin an animated weighted wheel for every part of your origin, with conditional follow-up wheels, an evolving character sheet and a roll log. No backend, API key, build step or paid service is required.

## Play locally

```sh
npm start
```

Open http://localhost:8000. ES modules require an HTTP server (do not double-click index.html).

```sh
npm test
```

The Node test suite checks 3,000 complete generated origins, weighted sampling, conditional branches, unique weapons/recruits, Haki levels, era/faction filtering, save validation and undo.

## Character creation

- Origin: time period, race and racial traits, famous bloodline and family connections, D., age, race-conditioned height.
- Identity: dream, faction, starting government bounty, surname and given name.
- Powers: awakened Haki, the combination of types, separate mastery for each; Devil Fruit possession, class/subtype, named fruit and mastery.
- Combat: fighting style, fighting mastery, appropriate weapons, three separate distinct swords for three-sword style, and mastery for each weapon.
- Attributes: battle IQ, strength, durability, speed, endurance and stamina.
- Companions: go solo, join an era/faction-appropriate group, or form and name a group. Roll a companion count and each companion's canon/original origin. Canon recruits use a curated era/faction pool without repeats. Original recruits get name, race, role and personality wheels.
- Saves: browser-local autosave, JSON export/import, undo and reset confirmation. Exports include a versioned history and empty journey event log for phase two.

## World model and limits

**All odds are authored game-balancing estimates, not official One Piece statistics.** The population baseline favors humans; rare races and extraordinary powers remain rare. This samples aspiring adventurers, not a world census. Every wheel exposes its normalized conditional probabilities. Tiny wheel slices may be unlabeled; the odds list includes every outcome. The pointer lands at the midpoint of the selected weighted slice.

This is an **alternate-timeline fan game**. Canon ownership of a named fruit or weapon is replaced by the player's result; recruiting a known character rewrites their allegiance. Era filters are curated starting-era eligibility, not an exhaustive continuity simulation. All fruit users lose swimming ability. Bloodlines grant narrative connections, not automatically inherited combat techniques. D. families force the initial; elsewhere D. results are speculative alternate ancestry. Zoan subtypes are presented as separate wheel outcomes. The catalog is curated, not every canon fruit, weapon, family or character. Includes Wano / early Egghead reveals.

Original companions are **procedurally generated from authored pools**, not live AI model output. A real AI backend can be added later without putting a secret key in browser code. Phase two's random-event/journey wheel is intentionally not implemented yet.

## Hosting on GitHub Pages

The repository contains a manual Pages workflow with tests. In GitHub **Settings → Pages**, choose **GitHub Actions** as the source. Run **Deploy game to Pages** under Actions. No deployment runs automatically on source push, so enabling public hosting is an explicit action. Asset paths are relative and work under the `/RPG/` project path.

The app works without network services after assets are loaded. Google Fonts is optional; system fonts are used if unavailable. Autosave is per browser and per origin, not cloud sync. Export JSON to transfer or back up a character.

## Structure

- `src/data.js` — editable weighted catalogs.
- `src/engine.js` — pure deterministic branching rules and save validation.
- `src/app.js` — UI, wheel drawing/animation, browser saves and downloads.
- `style.css` / `index.html` — responsive presentation.
- `tests/engine.test.js` — invariant and distribution tests.

One Piece belongs to Eiichiro Oda and its respective rights holders. This is an unofficial fan project.
