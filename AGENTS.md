# D&D 2024 Character Generator - Agent Instructions

## Project Overview
React + TypeScript character generator for Dungeons & Dragons 2024 SRD. Main stack: Vite, React 19, Tailwind CSS v4.

## Source of Truth
- Primary source: `http://dnd2024.wikidot.com/`
- When Wikidot and the SRD PDF differ, Wikidot wins.
- Do not trust SRD PDF charts/tables for numerical progression data. Verify spell slots, class tables, and progression numbers against Wikidot.
- Artificer is not in the official SRD PDF. Use Wikidot only:
  - `http://dnd2024.wikidot.com/artificer:main`

## Core Game Invariants
- Character creation order is `Species -> Background -> Ability Scores`.
- Background grants the +3 ability score increase (`+2/+1` or `+1/+1/+1` to listed abilities).
- Wizard cantrips are tracked separately from the spellbook.
- Wizard spellbook contains level 1+ spells only.
- Friendly names should come from page titles, not URL slugs.

## Working Rules
- Prefer scraped JSON or data transformers over hardcoded rules in components.
- For scraped data changes, validate only the affected type(s) plus any related build/test checks.
- For scraper work, test with `--max-items` or `--items` before running a full scrape.
- Use functional React state updates when changing nested character state.
- Preserve mobile behavior when changing UI components.

## Validation Checklist
Run the smallest relevant set:

```bash
npm run build
npm run test
npm run validate:<type>
```

Examples:
- `npm run validate:spells`
- `npm run validate:subclasses`
- `npm run validate:backgrounds`
- `npm run validate:species`
- `npm run validate:feats`

## High-Risk Areas
- `scripts/scrape-dnd2024.ts`: keep source-of-truth, fallback, and debug logic separated.
- `src/components/CharacterGenerator.tsx`: large stateful flow; keep edits minimal and verify step-by-step behavior.
- `src/data/*.ts`: prefer adapters/transformers over duplicating rules in multiple places.

## Reference Docs
Open these only when relevant:

- `docs/agent/scraping.md` - scraper workflow, commands, and data-validation guidance
- `docs/agent/srd-rules.md` - SRD query workflow and rules lookup notes
- `docs/agent/frontend-data.md` - UI/state patterns, data-shape guidance, and file map

## Common Commands
```bash
npm run dev
npm run build
npx tsx scripts/scrape-dnd2024.ts --types <type> --max-items 5
npm run query:srd "<search terms>"
```
