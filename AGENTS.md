# D&D 2024 Character Generator — Agent Instructions

## Project overview

React 19 + TypeScript + Vite + Tailwind CSS v4 character builder for D&D content scraped from [http://dnd2024.wikidot.com/](http://dnd2024.wikidot.com/). This is a **partial builder**: it implements the species → background → ability scores creation flow, a reference library, and an inventory manager. The review step saves a single-character snapshot to `localStorage['dnd_character']` (save only — no load/restore UI, no export), and there is no guarantee of full rules coverage — features exist only where the data and components support them. The spells step is scaffolding: the `CLASSES` adapter currently emits no `spellcastingInfo`, so every class renders as non-spellcasting and spell selection/progression is not wired.

## Sources — keep the distinction straight

- **[http://dnd2024.wikidot.com/](http://dnd2024.wikidot.com/)** is the project's **preferred reference** for all scraped data (spells, subclasses, feats, backgrounds, species, classes). By **project policy**, when the official SRD PDF is incomplete or conflicts with wikidot, wikidot takes precedence. However, wikidot is **not the official SRD**: it contains non-SRD, legacy, and expanded content (e.g. the Artificer class, sourced from an Eberron book). Do not treat scraped content as automatically SRD-covered or OGL-licensed.
- **The official SRD 5.2.1 PDF** ([https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf)) is licensed **CC BY 4.0** and provides rules context. The Artificer class is not in it. Parsed output goes to `rules-reference/` (gitignored).

**Spell changes**: before adding or modifying any spell, verify school, casting time, range, components, and duration against the wikidot page, avoid duplicates, and run the relevant validator. This verification requirement is project policy.

Do **not** hardcode rule formulas (e.g. prepared-spell counts) or canonical subclass lists into docs or code comments without verifying against the sources above; subclass lists per class live in `src/components/CharacterGenerator.tsx`, and the datasets are the source of record.

## Environment

- **Node.js 24.15** (pinned via `.nvmrc` / `engines`).

```bash
nvm use                # select Node 24.15 per .nvmrc
npm ci                 # lockfile-based install (npm install only when updating deps)
npm run dev            # dev server at http://localhost:5173
npm run build          # tsc -b && vite build — must pass
npm run check          # TypeScript type-check (app, scripts, and config files)
npm test               # Vitest + React Testing Library suite
npm run lint           # ESLint
npm run validate       # JSON Schema validation of all six scraped datasets
npm run test:browser   # real-browser smoke test; run npm run build first (dist/ prerequisite)
```

`npm test` contains no dataset validation. Data validation is `npm run validate` (or the per-type validators). The browser smoke test launches Chromium sandboxed by default; set `PUPPETEER_NO_SANDBOX=1` only on constrained hosts (CI containers, AppArmor-restricted systems), never as a local default.

`npm run test:scrape` is **not a test**: it is a debug CLI (`scripts/test-scrape.ts`) that fetches one spell page (default `cure-wounds`, pass a slug as argument), caches the HTML, and runs it through the production extraction logic (`parseSpellHtml`), printing the extracted record and exiting nonzero on failure. Automated tests are the Vitest suite.

## Data architecture (verified)

Scraped JSON datasets are committed under `src/data/`; adapters transform them into typed records. Dataset sizes change with each scrape — don't rely on counts.

- `spells.json` → `spells.ts` (JSON transformer) → `SPELLS_BY_CLASS`, `getSpellsForClass()`
- `classes.json` → `classes.ts` (JSON transformer) → `CLASSES` (includes Artificer from its Eberron source; no `spellcastingInfo` populated, so the spells step is inert for every class)
- `subclasses.json` — scraped subclass dataset; per-class subclass lists are declared in `CharacterGenerator.tsx`
- `backgrounds.json` → `backgrounds.ts` (JSON transformer) → `BACKGROUNDS`
- `species.json` → `species.ts` (JSON transformer) → `SPECIES`
- `feats.json` — scraped feats, imported directly by `ReferenceLibrary` (which builds its feats view from the JSON)
- `schemas/` — JSON Schemas (incl. `class.schema.json`) used by `scripts/validate-output.ts`
- `types/index.ts` — shared interfaces

Components: `CharacterGenerator.tsx` (creation wizard), `ReferenceLibrary.tsx` (searchable viewer), `InventoryManager.tsx` (equipment); `App.tsx` wires the views; `utils/calculations.ts` holds shared math.

## Commands

### Validation
```bash
npm run validate:spells
npm run validate:subclasses
npm run validate:feats
npm run validate:backgrounds
npm run validate:species
npm run validate:classes
```
Run the validators for any dataset you modify; all must pass before committing scraped-data changes. `npm run validate` runs all six (including `classes.json`) in one go. There is no dataset validation inside `npm test`.

### Scraping
`scripts/scrape-dnd2024.ts` supports `--types` (`-t`: spells, subclasses, feats, backgrounds, species, classes, or `all`), `--items` (`-i`), `--max-items` (`-m`), `--continue-on-error` (`-c`), `--delay` (`-d`, default 200ms), `--retries` (`-r`, default 3). JavaScript is disabled in Puppeteer to avoid page-script interference; the browser is reused across items in a run.

**Note:** `--types all` (the default, also used by `npm run scrape:all`) currently scrapes only **spells, subclasses, feats, and backgrounds**; species and classes must be requested explicitly by name (e.g. `--types species,classes`).

```bash
npx tsx scripts/scrape-dnd2024.ts --types all
npx tsx scripts/scrape-dnd2024.ts --types "spells,subclasses"
npx tsx scripts/scrape-dnd2024.ts --types spells --items fireball,magic-missile --continue-on-error
```

**Warning:** scrapes write complete files to fixed paths (`src/data/spells.json`, etc.). A targeted `--items` scrape **overwrites** the whole dataset with only the targeted items unless the data is restored or merged afterwards.

### SRD PDF lookup
```bash
npm run parse:srd-pdf            # once; downloads & parses into gitignored rules-reference/
npm run query:srd "spell slots"  # search parsed sections; supports "ClassName FeatureName" queries
```

## Before committing changes

1. `npm run build` passes
2. `npm run check`, `npm test`, `npm run lint`, and `npm run validate` pass
3. Validators pass for any modified datasets
4. `npm run test:browser` passes (run `npm run build` first so `dist/` exists for preview mode; set `PUPPETEER_NO_SANDBOX=1` only on constrained hosts)
5. No secrets or cache files staged (`cache/` and `rules-reference/` are gitignored)
6. UI changes verified on mobile and desktop widths

## Code conventions

- Use functional state updates (`setState(prev => ...)`) — React state updates are async and quick successive updates capture stale values otherwise.
- Expandable cards in a 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`): reorder the display array so the expanded card starts its row (`rowStart = expandedIndex - (expandedIndex % 3)`) and span the full row (`md:col-span-2 lg:col-span-3`).
- Class spell filtering goes through `getSpellsForClass()`, not raw dataset filtering.
- No hardcoded magic strings; use the types in `src/types/index.ts`.

## Scraper debugging

- Use `--continue-on-error` for partial-failure recovery; raise `--delay` if rate-limited.
- Cached HTML in `cache/wikidot/` is useful for diagnosing selector breakage when wikidot markup changes.
