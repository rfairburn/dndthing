# D&D Character Generator — Commit Guide

## Commit

### Application source
- `src/App.tsx` — view navigation
- `src/components/CharacterGenerator.tsx` — creation wizard (species → background → ability scores), including the per-class subclass lists
- `src/components/ReferenceLibrary.tsx` — searchable spells/feats/backgrounds/species viewer
- `src/components/InventoryManager.tsx` — equipment management
- `src/main.tsx`, `src/index.css`, `src/App.css`, `src/assets/` — entry point and styling
- `src/utils/calculations.ts` — shared math helpers
- `src/types/index.ts` — shared TypeScript interfaces

### Data (all committed)
- `src/data/spells.json` — scraped spells (from dnd2024.wikidot.com)
- `src/data/spells.ts` — JSON transformer → `SPELLS_BY_CLASS` / `getSpellsForClass()`
- `src/data/classes.json` — scraped class data (incl. Artificer from its Eberron source)
- `src/data/classes.ts` — JSON transformer → `CLASSES`
- `src/data/subclasses.json` — scraped subclass dataset
- `src/data/backgrounds.json` + `src/data/backgrounds.ts` — scraped backgrounds + JSON transformer → `BACKGROUNDS`
- `src/data/species.json` + `src/data/species.ts` — scraped species + JSON transformer → `SPECIES`
- `src/data/feats.json` — scraped feats (imported directly by `ReferenceLibrary`)
- `src/data/schemas/*.json` — JSON Schemas (spell, subclass, feat, background, species, class) for the validation script

Dataset sizes change with each scrape; the validators report counts, so no numbers are listed here.

### Scripts
- `scripts/scrape-dnd2024.ts` — wikidot scraper (spells, subclasses, feats, backgrounds, species, classes; `--types all` covers only spells/subclasses/feats/backgrounds — see README)
- `scripts/validate-output.ts` — JSON Schema validation CLI
- `scripts/browser-smoke.ts` — deterministic real-browser smoke test (`npm run test:browser`)
- `scripts/parse-srd-pdf.ts` — downloads/parses the SRD 5.2.1 PDF into gitignored `rules-reference/`
- `scripts/query-srd.ts` — search tool over the parsed SRD text
- `scripts/test-scrape.ts` — debug CLI that runs one spell page through the production parser (not a test suite)

### Config & docs
- `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `postcss.config.js`, `eslint.config.js`, `index.html`, `.gitignore`, `.nvmrc`, `public/`
- `README.md`, `AGENTS.md`, `COMMIT_GUIDE.md`

## Never commit
- `node_modules/`, `dist/` (build output)
- `cache/` — scraped HTML cache (regenerable)
- `rules-reference/` — parsed SRD PDF output (generated locally)
- Local work notes, scratch documents, or planning files

## Before committing
1. `npm run build` passes (includes TypeScript compilation)
2. `npm run check` and `npm test` pass
3. Validators pass for any modified datasets — either `npm run validate` (all six, including `classes.json`) or the relevant per-type validator:
   ```bash
   npm run validate:spells
   npm run validate:subclasses
   npm run validate:feats
   npm run validate:backgrounds
   npm run validate:species
   npm run validate:classes
   ```
4. `npm run test:browser` passes (run `npm run build` first so `dist/` exists for preview mode)
5. No cache or generated files staged

## Notes
- Scrapes write whole files to fixed paths in `src/data/`; a targeted `--items` scrape overwrites the full dataset. Review dataset diffs before committing.
- Data originates from dnd2024.wikidot.com (the project's preferred reference, which includes non-SRD content) — check source attributions rather than assuming SRD/OGL coverage.
