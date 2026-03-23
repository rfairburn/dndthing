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
- `src/data/racesAndBackgrounds.ts` - Race data + **formatted backgrounds** (12 backgrounds with full details)
- `src/data/feats.ts` - 30 core feats with benefits/prerequisites

### Data Files (Generated from web scrape, commit these too)
- `src/data/spells.json` - 411 official D&D 2024 SRD spells (verified against wikidot.com)
- `src/data/subclasses.json` - 61 subclasses scraped from wikidot.com
- `src/data/feats.json` - 155 feats scraped from wikidot.com
- `src/data/spells.ts` - Transformer that creates SPELLS_BY_CLASS mapping from spells.json
- `src/data/subclasses.ts` - Transformer that maps subclass names to scraped data

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

### Documentation
- `AGENTS.md` - Agent instructions and project overview
- `README.md` - Main progject readme.

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
| spells.json | Web scraped | Raw spell data from wikidot.com | ✅ Yes |
| spells.ts | Transformer | Creates SPELLS_BY_CLASS mapping | ✅ Yes |
| subclasses.json | Web scraped | Raw subclass data from wikidot.com | ✅ Yes |
| subclasses.ts | Transformer | Maps friendly names to scraped data | ✅ Yes |
| feats.json | Web scraped | Raw feat data from wikidot.com | ⚠️ Optional (kept for reference) |
| feats.ts | Hardcoded | Core 30 feats with benefits/prerequisites | ✅ Yes |
| racesAndBackgrounds.ts | Hardcoded | Races + **12 formatted backgrounds** | ✅ Yes |

---

## Background Data Note

The **formatted backgrounds data is in `racesAndBackgrounds.ts`**, NOT in a separate JSON file. The scraper overwrote `backgrounds.json` with only 1 entry from wikidot.com, so we deleted it and rely on the TypeScript file which has all 12 backgrounds with full details (skill proficiencies, equipment, features, suggested characteristics).

---

## Quick Commands

```bash
# Validate scraped data against JSON Schema
npm run validate:spells
npm run validate:subclasses --schema src/data/schemas/subclass.schema.json
npm run validate:feats --schema src/data/schemas/feat.schema.json

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
