# D&D Character Generator - Commit Guide

## Files to COMMIT (Source Code)

### Core Application
- `src/App.tsx` - Main app component with navigation
- `src/components/CharacterGenerator.tsx` - Character creation wizard
- `src/components/ReferenceLibrary.tsx` - Spell/feat/background reference viewer
- `src/components/InventoryManager.tsx` - Equipment management

### Type Definitions
- `src/types/index.ts` - All TypeScript interfaces and types

### Data Files (Hardcoded, manually maintained)
- `src/data/classes.ts` - Class definitions with features and spellcasting info
- `src/data/feats.ts` - 30 core feats with benefits/prerequisites

### Data Files (Generated from web scrape, commit these too)
- `src/data/spells.json` - 411 official D&D 2024 SRD spells (verified against wikidot.com)
- `src/data/subclasses.json` - 61 subclasses scraped from wikidot.com
- `src/data/feats.json` - 155 feats scraped from wikidot.com (kept for reference)
- `src/data/backgrounds.json` - 56 backgrounds with ability scores, feats, proficiencies
- `src/data/species.json` - 21 species entries with traits, sizes, speed
- `src/data/spells.ts` - Transformer that creates SPELLS_BY_CLASS mapping from spells.json
- `src/data/subclasses.ts` - Transformer that maps subclass names to scraped data
- `src/data/backgrounds.ts` - Background transformer with abilityScores/feat/proficiencies
- `src/data/species.ts` - Transformer: loads SPECIES record from scraped data

### Configuration & Build
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS v4 configuration
- `.gitignore` - Git ignore rules

### Scripts (Development tools)
- `scripts/scrape-dnd2024.ts` - Main web scraper for wikidot.com
- `scripts/cache-manager.ts` - HTML caching utilities
- `scripts/validate-output.ts` - JSON Schema validation script
- `scripts/test-scrape.ts` - Debug tool for individual items

### Schemas (JSON Schema files for validation)
- `src/data/schemas/spell.schema.json` - Spell data schema
- `src/data/schemas/subclass.schema.json` - Subclass data schema
- `src/data/schemas/feat.schema.json` - Feat data schema
- `src/data/schemas/background.schema.json` - Background data schema
- `src/data/schemas/species.schema.json` - Species data schema

### Documentation
- `AGENTS.md` - Agent instructions and project overview
- `README.md` - Main project readme
- `COMMIT_GUIDE.md` - This commit guide

---

## Files NOT to Commit (Generated/Cache)

### Build Output
- `dist/` - Production build artifacts
- `.vite/` - Vite cache directory

### Dependencies
- `node_modules/` - npm dependencies

### Cache Files
- `cache/wikidot/spells/*.html` - Cached HTML from web scraping (can be regenerated)
- `cache/wikidot/failed/*.html` - Failed scrape attempts (debug only)

---

## Data File Structure Summary

| File | Source | Purpose | Commit? |
|------|--------|---------|---------|
| spells.json | Web scraped | Raw spell data from wikidot.com (411 items) | ✅ Yes |
| spells.ts | Transformer | Creates SPELLS_BY_CLASS mapping | ✅ Yes |
| subclasses.json | Web scraped | Raw subclass data from wikidot.com (61 items) | ✅ Yes |
| subclasses.ts | Transformer | Maps friendly names to scraped data | ✅ Yes |
| feats.json | Web scraped | Raw feat data from wikidot.com (155 items) | ✅ Yes |
| feats.ts | Hardcoded | Core 30 feats with benefits/prerequisites | ✅ Yes |
| backgrounds.json | Web scraped | Backgrounds with ability scores, feats, proficiencies (56 items) | ✅ Yes |
| backgrounds.ts | Transformer | Background transformer with abilityScores/feat/proficiencies | ✅ Yes |
| species.json | Web scraped | Species entries with traits, sizes, speed (21 items) | ✅ Yes |
| species.ts | Transformer | Loads SPECIES record from scraped data | ✅ Yes |

All 5 scraped data types have JSON Schema validators for complete coverage.

---

## Validation Commands

```bash
# Validate all scraped data types against JSON Schema
npm run validate:spells      # 411 spells
npm run validate:subclasses  # 61 subclasses
npm run validate:feats       # 30 feats
npm run validate:backgrounds # 56 backgrounds
npm run validate:species     # 21 species

# All 5 scraped data types have validators for complete coverage
```

---

## Quick Commands

```bash
# Build the app
npm run build

# Run dev server
npm run dev

# Scrape all content types
npx tsx scripts/scrape-dnd2024.ts --type all --continue-on-error
```

---

## Git Workflow

1. Make changes to source files
2. Run `npm run build` to verify TypeScript compilation passes
3. Commit with descriptive message
4. Push to remote (if applicable)

**Never commit:** `dist/`, `node_modules/`, or cache directories
