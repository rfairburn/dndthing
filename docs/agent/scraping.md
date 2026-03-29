# Scraping Reference

## Scraper Files
- `scripts/scrape-dnd2024.ts`
- `scripts/cache-manager.ts`
- `scripts/validate-output.ts`
- `scripts/test-scrape.ts`

## Supported Scrape Types
- `spells`
- `subclasses`
- `feats`
- `backgrounds`
- `species`
- `classes`
- `spell-progression`

## Workflow
1. Reproduce with a limited scrape.
2. Fix parsing or transformation logic.
3. Re-run the limited scrape.
4. Validate the affected data type.
5. Only then run the full scrape if needed.

## Commands

### Targeted testing
```bash
npx tsx scripts/scrape-dnd2024.ts --types spells --max-items 5
npx tsx scripts/scrape-dnd2024.ts --types subclasses --max-items 3
npx tsx scripts/scrape-dnd2024.ts --types spell-progression --max-items 2
npx tsx scripts/scrape-dnd2024.ts --types spells --items fireball,magic-missile
```

### Full or broader scrape
```bash
npx tsx scripts/scrape-dnd2024.ts --types all
npx tsx scripts/scrape-dnd2024.ts --types "spells,subclasses"
npx tsx scripts/scrape-dnd2024.ts --types spells --items fireball,magic-missile --continue-on-error
```

### Validation
```bash
npm run validate:spells
npm run validate:subclasses
npm run validate:backgrounds
npm run validate:species
npm run validate:feats
```

## Scraper Rules
- Wikidot is the authoritative source.
- Do not treat SRD PDF tables as authoritative for progression numbers.
- Scraper logic should keep parse results, fallback logic, and debug instrumentation separate.
- Friendly names come from page titles, not slugs.
- Prefer testing with `--max-items` or `--items` to avoid expensive full runs.

## Debugging Notes
- Use `--continue-on-error` for recovery during broad scrapes.
- Check `cache/wikidot/` when a page needs inspection.
- Adjust `--delay` if rate limiting appears.
- Verify page structure before changing selectors.

## Adding a New Scraped Type
1. Add a schema in `src/data/schemas/`.
2. Add scraper support in `scripts/scrape-dnd2024.ts`.
3. Update `scripts/validate-output.ts`.
4. Add `validate:<type>` to `package.json`.
5. Document the new type in repo docs if the workflow changes.
