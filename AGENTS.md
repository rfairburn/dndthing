# D&D 2024 Character Generator - Agent Instructions

## Project Overview
React + TypeScript character generator for Dungeons & Dragons 2024 SRD with Wizard and Artificer classes. Uses Vite, Tailwind CSS v4, and React 19.

## Data Source of Truth
**http://dnd2024.wikidot.com/** - All spells, subclasses, feats, and rules verified against this official D&D 2024 SRD source.

---

## Key Implementation Rules

### Character Creation Flow (Official 2024 SRD)
1. **Species** → Base traits, size, speed
2. **Background** → +3 stat points (+2/+1 or +1/+1/+1 to listed abilities), feat, proficiencies, equipment
3. **Ability Scores** → Assign base scores (Standard Array/Point Buy 27 pts) THEN apply background bonuses

### Official Subclasses
**Wizard**: Order of Scribes, Bladeschool, War Magic, Chronurgy, Goldsmithy  
**Artificer**: Armorer, Alchemist, Battle Smith, Mystic

For detailed spellcasting rules and other mechanics, query the SRD PDF directly:
```bash
npm run parse:srd-pdf  # Parse once
npm run query:srd "wizard spellbook"  # Search for specific rules
npm run query:srd "cantrip progression"
npm run query:srd "background bonuses"
```

---

## Spell Database Protocol

Before adding/modifying any spell:
1. Query http://dnd2024.wikidot.com/ for official attributes
2. Verify school, casting time, range, components, duration
3. Check against existing entries to avoid duplicates
4. Run `npm run validate:<type>` after changes

---

## File Structure
```
src/
├── types/index.ts              # TypeScript interfaces and type definitions (Species, Background, etc.)
├── data/
│   ├── schemas/                # JSON Schema validation files (5 total)
│   │   ├── spell.schema.json   # Spell data schema
│   │   ├── subclass.schema.json# Subclass data schema
│   │   ├── feat.schema.json    # Feat data schema
│   │   ├── background.schema.json# Background data schema
│   │   └── species.schema.json # Species validation schema
│   ├── spells.json             # 411 official D&D 2024 SRD spells (scraped)
│   ├── spells.ts               # Transformer: creates SPELLS_BY_CLASS mapping
│   ├── subclasses.json         # 61 subclasses (scraped)
│   ├── subclasses.ts           # Transformer: maps friendly names to data
│   ├── species.json            # 21 scraped species entries with traits/size/speed
│   ├── species.ts              # Transformer: loads SPECIES record from scraped data
│   ├── backgrounds.json        # 56 backgrounds (complete)
│   ├── backgrounds.ts          # Background transformer with abilityScores/feat/proficiencies
│   ├── feats.json              # 155 feats (scraped, kept for reference)
│   └── feats.ts                # Core 30 hardcoded feats with benefits/prerequisites
├── components/
│   ├── CharacterGenerator.tsx  # Main character creation wizard (species → background → ability scores)
│   ├── ReferenceLibrary.tsx    # Searchable reference viewer (spells, species, backgrounds)
│   └── InventoryManager.tsx    # Equipment management
└── App.tsx                     # Navigation between views

scripts/
├── scrape-dnd2024.ts           # Web scraper (spells, subclasses, feats, backgrounds, species)
├── cache-manager.ts            # HTML caching utilities
├── validate-output.ts          # JSON Schema validation script (supports all 5 types)
└── test-scrape.ts              # Debug tool for individual items
```

---

## Development Commands

### Build & Run
```bash
npm install
npm run dev           # Dev server at http://localhost:5173
npm run build         # Production build (must pass TypeScript)
npm run preview       # Preview production build
```

### Data Validation (All 5 scraped types)
```bash
npm run validate:spells      # 411 spells
npm run validate:subclasses  # 61 subclasses
npm run validate:feats       # 30 feats
npm run validate:backgrounds # 56 backgrounds
npm run validate:species     # 21 species
```

**All validators must pass before committing scraped data changes.**

### Scraping
```bash
# Scrape all content types
npx tsx scripts/scrape-dnd2024.ts --types all

# Scrape specific types (comma-separated)
npx tsx scripts/scrape-dnd2024.ts --types "spells,subclasses"

# Targeted scrape with error recovery
npx tsx scripts/scrape-dnd2024.ts --types spells --items fireball,magic-missile --continue-on-error
```

---

## Code Quality Checklist
- [ ] TypeScript compilation passes (`npm run build`)
- [ ] All scraped data validated against JSON Schema (all 5 types)
- [ ] Mobile-responsive design verified
- [ ] No hardcoded magic strings (use type definitions)
- [ ] Class filtering uses `getSpellsForClass()` function
- [ ] Friendly names extracted from page titles, not URL slugs

---

## UI Implementation Patterns

### Expandable Cards with Reordering
When implementing expandable cards that span full row width:
1. Use 3-column grid layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
2. Move selected card to leftmost position before expanding using formula: `rowStart = expandedIndex - (expandedIndex % 3)`
3. Expanded cards span full row: `col-span-1 md:col-span-2 lg:col-span-3`
4. Reorder display array so selected card starts at position 0 of its row

### State Update Best Practices
- Use **functional state updates** (`setState(prev => {...})`) instead of direct state access to avoid stale values
- React state updates are asynchronous - immediate subsequent operations may capture old values
- This is critical when multiple state changes happen in quick succession (e.g., card click → size button click)

---

## Important Notes
- Cantrips are known separately, NOT in spellbook (verify via `npm run query:srd "wizard cantrip"`)
- Spellbook only contains level 1+ prepared spells (check SRD PDF for exact rules)  
- Prepared = Int mod + wizard level from spellbook (confirm via `npm run query:srd "prepared spells"`)
- All subclasses must match official SRD exactly
- Scraper disables JavaScript to prevent page script interference
- Browser instance reused across all scrapes for performance (~5-10x speedup)

---

## SRD PDF Rules Reference

**Source**: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf

The official D&D 2024 SRD PDF provides rules context for how scraped data fits together. Parsed output is NOT committed (licensing).

### Quick Search
```bash
# Parse the PDF first (run once)
npm run parse:srd-pdf

# Then search for specific rules
npm run query:srd <search term>

# Examples:
npm run query:srd "spell slots"
npm run query:srd "background bonuses"
npm run query:srd "species traits"
```

### When to Reference
- **Character creation flow**: Verify species → background → ability scores order
- **Spellcasting rules**: Confirm cantrip/spellbook/prepared spell mechanics  
- **Background stat bonuses**: Check +3 distribution rules (+2/+1 or +1/+1/+1)
- **Equipment/proficiencies**: Validate what backgrounds grant

### Parsed Output Location (Not Committed)
- `rules-reference/srd-text.json` - Structured sections (searchable)
- `rules-reference/srd-raw.txt` - Full raw text (for grep)

**Note**: Run `npm run parse:srd-pdf` once to download and parse. This directory is in .gitignore and will not be committed.

---

## Pre-commit Checklist
Before committing changes:
1. Run `npm run build` - TypeScript compilation must pass
2. Run validators for any modified scraped data types (e.g., `npm run validate:species`)
3. Verify mobile-responsive design if UI components changed
4. Check that no secrets or cache files are included in commit

---

## Common Agent Tasks

### Adding New Scraped Data Type
1. Create JSON Schema file in `src/data/schemas/`
2. Add scraper support in `scripts/scrape-dnd2024.ts`
3. Update `validate-output.ts` with type mapping (lines 28-30, 149-151)
4. Add npm script to `package.json`: `"validate:<type>": "tsx scripts/validate-output.ts --type <type>"`
5. Update documentation: README.md, COMMIT_GUIDE.md, AGENTS.md

### Fixing Scraper Issues
1. Use `--continue-on-error` flag for error recovery
2. Check cached HTML in `cache/wikidot/` for debugging
3. Adjust `--delay` parameter if rate limited (default 200ms)
4. Verify page structure hasn't changed on wikidot.com

### UI Component Updates
1. Always use functional state updates: `setCharacter(prev => {...})`
2. For expandable cards, implement reordering logic before expanding
3. Test across all viewport sizes (mobile, tablet, desktop)
