# D&D 2024 Character Generator

A React + TypeScript web app for building D&D characters, currently a **partial builder**: it implements the species → background → ability scores creation flow, plus reference and inventory views, using data scraped from dnd2024.wikidot.com. The review step can save a single-character snapshot to browser `localStorage` (save only — there is no load/restore UI and no sheet export), and it does not implement the full rules set — coverage of classes, subclasses, spells, feats, and species is limited to what the datasets contain.

## Sources and licensing

Two distinct references are involved; they are not interchangeable:

- **Project reference (scraped data): [http://dnd2024.wikidot.com/](http://dnd2024.wikidot.com/)** — the project's preferred reference for verifying spells, subclasses, feats, backgrounds, species, and classes. By project policy, when the SRD PDF is incomplete or conflicts with the wikidot site, wikidot takes precedence. **Wikidot is not the official SRD**: it mixes SRD 5.2.1 content with non-SRD, legacy, and expanded content (for example, the Artificer class is sourced from an Eberron supplement). Scraped content is therefore **not** automatically SRD- or OGL-licensed: source attribution is only a pointer to where an entry came from — the underlying source's own license and terms of use govern what may be redistributed.
- **Official rules reference: the SRD 5.2.1 PDF** ([https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf)), licensed **CC BY 4.0**. It is downloaded and parsed locally for rules lookup; parsed output lives in `rules-reference/` and is gitignored. Note the Artificer class is not in the SRD PDF at all.

Spell changes must be verified against the wikidot pages (school, casting time, range, components, duration) before being committed.

## Setup

```bash
nvm use              # select Node 24.15 per .nvmrc
npm ci               # lockfile-based install (same as CI)
npm run dev          # dev server at http://localhost:5173
npm run build        # type-check + production build
npm run preview      # preview the production build
npm run check        # TypeScript type-check (app, scripts, and config files)
npm test             # Vitest + React Testing Library suite
npm run lint         # ESLint
npm run validate     # JSON Schema validation of all six scraped datasets
npm run test:browser # real-browser smoke test (requires a prior npm run build)
```

**Node.js 24.15** is pinned via `.nvmrc` and `engines` in `package.json`; use `nvm use` (or any Node 24.15+ runtime) and install with `npm ci`, which installs exactly the locked dependency tree used by CI. Use `npm install` only when intentionally updating dependencies. Tests (`npm test`) and data validation (`npm run validate`) are separate concerns: the Vitest suite covers app code and scraper unit tests, while the validators check every scraped dataset against its JSON Schema — see [Validation](#validation).

## What the app does today

- **CharacterGenerator** — species → background → ability scores flow (standard array; background bonuses applied after base assignment), then class/subclass selection. The spells step is scaffolding only: the `CLASSES` adapter currently produces no `spellcastingInfo`, so every class renders as non-spellcasting and spell selection/progression is not wired.
- **ReferenceLibrary** — searchable viewer over spells, feats, backgrounds, and species data.
- **InventoryManager** — equipment management for the in-progress character.

Persistence is limited to the save-only `localStorage` snapshot described above (no load/restore UI, no export); treat the builder as a partial implementation, not a complete rules engine.

## Data

Scraped datasets live in `src/data/*.json` and are committed. Small adapter modules turn the raw JSON into typed records the UI consumes:

| File | Role |
|------|------|
| `src/data/spells.json` + `src/data/spells.ts` | Scraped spells; adapter builds `SPELLS_BY_CLASS` and `getSpellsForClass()` |
| `src/data/classes.json` + `src/data/classes.ts` | Scraped class data (includes Artificer from its Eberron source); adapter builds `CLASSES` |
| `src/data/subclasses.json` | Scraped subclass dataset (descriptions, sources); subclass lists per class are declared in `CharacterGenerator.tsx` |
| `src/data/backgrounds.json` + `src/data/backgrounds.ts` | Scraped backgrounds; adapter builds `BACKGROUNDS` |
| `src/data/species.json` + `src/data/species.ts` | Scraped species; adapter builds `SPECIES` |
| `src/data/feats.json` | Scraped feats; imported directly by `ReferenceLibrary`, which builds its feats view from this file |
| `src/data/schemas/` | JSON Schemas used by the validation script |
| `src/types/index.ts` | Shared TypeScript interfaces |

Dataset sizes change with every scrape, so no counts are documented here — the validators report them.

## Web scraper

`scripts/scrape-dnd2024.ts` scrapes wikidot pages into `src/data/*.json` using Puppeteer (JavaScript disabled to avoid page-script interference) and axios.

```bash
npx tsx scripts/scrape-dnd2024.ts --types all
npx tsx scripts/scrape-dnd2024.ts --types "spells,subclasses"
npx tsx scripts/scrape-dnd2024.ts --types spells --items "fireball,magic-missile" --continue-on-error
```

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--types` | `-t` | `all` | Comma-separated: spells, subclasses, feats, backgrounds, species, classes, or `all` (see note below) |
| `--items` | `-i` | (empty) | Specific item names to scrape (comma-separated) |
| `--max-items` | `-m` | null | Limit to first N items (testing) |
| `--continue-on-error` | `-c` | false | Keep going after item errors |
| `--delay` | `-d` | 200 | Delay between requests (ms); raise if rate-limited |
| `--retries` | `-r` | 3 | Retries per item with exponential backoff |

**Caution:** every scrape writes complete datasets to the fixed filenames in `src/data/`. A targeted scrape (e.g. `--items fireball,magic-missile`) **overwrites** the full dataset with only the targeted items unless the file is restored or extended afterwards. Cached HTML in `cache/` can help debug parsing issues.

The browser instance is reused across items within a run for performance.

**Note:** `--types all` (the default, also used by `npm run scrape:all`) currently scrapes only **spells, subclasses, feats, and backgrounds**. Species and classes are implemented but must be requested explicitly by name, e.g. `--types species,classes` — don't assume `all` covers all six types.

## Validation

Each scraped type is validated against its JSON Schema with Ajv:

```bash
npm run validate:spells
npm run validate:subclasses
npm run validate:feats
npm run validate:backgrounds
npm run validate:species
npm run validate:classes
```

Run the validators for any dataset you modify; all must pass before committing scraped-data changes. `npm run validate` runs all six (including `classes.json`) in one go; there is no dataset validation inside `npm test`.

## Debug scraping tool

`npm run test:scrape` runs `scripts/test-scrape.ts`, a **debug CLI** for a single spell page. It fetches the page once (saving a copy to `cache/wikidot/spells/` for offline debugging), runs it through the exact extraction logic used by the production scraper (`parseSpellHtml`), prints the extracted record, and exits nonzero on failure. Pass a spell slug as the argument (default `cure-wounds`); `--help` prints usage without fetching anything. It is not a test suite — automated tests live in the Vitest suite run by `npm test`.

## SRD PDF rules lookup

```bash
npm run parse:srd-pdf            # once; downloads & parses the PDF into rules-reference/ (gitignored)
npm run query:srd "spell slots"  # search parsed sections
```

Use the parsed SRD text to cross-check how scraped data fits together (creation flow order, spellcasting mechanics, background bonuses). Where the PDF is incomplete or conflicts with wikidot, project policy is that wikidot wins — but remember wikidot content may fall outside the SRD.

## Browser smoke test

`npm run test:browser` (`scripts/browser-smoke.ts`) is a deterministic, offline smoke test that loads the real app in Chromium against both a dev server and the production preview, and asserts the Character Generator renders and navigation to the Reference Library works on desktop (1280×900) and 375px mobile without horizontal overflow. Any page error, `console.error`, missing element, or external request fails the run.

- **Build prerequisite:** run `npm run build` first so `dist/` exists for preview mode.
- **Browser install:** Chromium ships with Puppeteer; if launch fails, install it with `npx puppeteer browsers install chrome` or point `PUPPETEER_EXECUTABLE_PATH` at an existing Chrome/Chromium.
- **Sandbox:** Chromium launches sandboxed by default. Set `PUPPETEER_NO_SANDBOX=1` only on constrained hosts (CI containers, or systems where AppArmor blocks unprivileged user namespaces) — not as a local default.

## Troubleshooting

- **Rate limiting** — increase `--delay` (e.g. 500+) and use `--continue-on-error`.
- **Puppeteer launch failures** — install the browser (`npx puppeteer browsers install chrome`) or point `PUPPETEER_EXECUTABLE_PATH` at an existing Chrome/Chromium; on constrained hosts, see [Browser smoke test](#browser-smoke-test).
- **Parser breakage** — if wikidot markup changed, check cached HTML in `cache/` and update selectors.

## License

Project source code is the authors' own. Data in `src/data/` is scraped from third-party sources: each entry records its source, but attribution alone does not grant any license — the underlying source's own license and terms of use govern redistribution, and they vary. The official SRD 5.2.1 text itself is CC BY 4.0. No blanket OGL or SRD-coverage claim applies to the scraped datasets.
