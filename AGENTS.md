# D&D 2024 Character Generator - Agent Instructions

## Project Overview
React + TypeScript character generator for Dungeons & Dragons 2024 SRD with Wizard and Artificer classes. Uses Vite, Tailwind CSS v4, and React 19.

## Data Source of Truth
**http://dnd2024.wikidot.com/** - All spells, subclasses, feats, and rules verified against this official D&D 2024 SRD source.

---

## Key Implementation Rules

### Wizard Spellcasting (Official 2024 SRD)
1. **Cantrips**: Know three Wizard cantrips separately - NOT in spellbook (+1 at levels 4 and 10)
2. **Spellbook**: Contains ONLY level 1+ spells, starts with exactly 6 level 1 spells, gains +2 per wizard level after 1st (`6 + (level-1)*2`)
3. **Prepared Spells**: Choose Int mod + wizard level from spellbook (minimum one)

### Official Subclasses
**Wizard**: Order of Scribes, Bladeschool, War Magic, Chronurgy, Goldsmithy  
**Artificer**: Armorer, Alchemist, Battle Smith, Mystic

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
├── types/index.ts              # TypeScript interfaces and type definitions
├── data/
│   ├── schemas/                # JSON Schema validation files
│   ├── spells.json             # 411 official D&D 2024 SRD spells (scraped)
│   ├── spells.ts               # Transformer: creates SPELLS_BY_CLASS mapping
│   ├── subclasses.json         # 61 subclasses (scraped)
│   ├── subclasses.ts           # Transformer: maps friendly names to data
│   ├── feats.ts                # Core 30 hardcoded feats with benefits/prerequisites
│   └── racesAndBackgrounds.ts  # Races + 12 formatted backgrounds
├── components/
│   ├── CharacterGenerator.tsx  # Main character creation wizard
│   ├── ReferenceLibrary.tsx    # Searchable reference viewer
│   └── InventoryManager.tsx    # Equipment management
└── App.tsx                     # Navigation between views

scripts/
├── scrape-dnd2024.ts           # Web scraper (spells, subclasses, feats, backgrounds)
├── cache-manager.ts            # HTML caching utilities
├── validate-output.ts          # JSON Schema validation script
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

### Data Validation
```bash
npm run validate:spells
npm run validate:subclasses
npm run validate:feats
npm run validate:backgrounds
```

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
- [ ] All spell data validated against JSON Schema
- [ ] Mobile-responsive design verified
- [ ] No hardcoded magic strings (use type definitions)
- [ ] Class filtering uses `getSpellsForClass()` function
- [ ] Friendly names extracted from page titles, not URL slugs

---

## Important Notes
- Cantrips are known separately, NOT in spellbook
- Spellbook only contains level 1+ prepared spells  
- Prepared = Int mod + wizard level from spellbook
- All subclasses must match official SRD exactly
- Scraper disables JavaScript to prevent page script interference
- Browser instance reused across all scrapes for performance (~5-10x speedup)
