# D&D 2024 SRD Character Generator

A React + TypeScript character generator for Dungeons & Dragons 2024 SRD, featuring Wizard and Artificer classes with full spell database integration.

## Data Source of Truth

**http://dnd2024.wikidot.com/** - All spells, subclasses, feats, and rules are verified against this official D&D 2024 SRD source.

---

## Application Usage

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development Mode

Run the development server with hot reload:

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Linting & Type Checking

```bash
# TypeScript type checking
npm run check

# ESLint linting
npm run lint
```

---

## Web Scraper Usage

The included scraper (`scripts/scrape-dnd2024.ts`) extracts D&D 2024 SRD content from wikidot.com and saves it to `src/data/`.

### Installation for Scraping

Additional dependencies required:

```bash
npm install puppeteer axios ajv tsx yargs@^17.7.0
```

### Basic Usage

**Scrape all content types:**
```bash
npx tsx scripts/scrape-dnd2024.ts --types all
```

**Scrape specific types (comma-separated):**
```bash
# Spells only
npx tsx scripts/scrape-dnd2024.ts --types spells

# Multiple types
npx tsx scripts/scrape-dnd2024.ts --types "spells,subclasses"

# Feats and backgrounds
npx tsx scripts/scrape-dnd2024.ts --types feats,backgrounds
```

**Scrape specific items (comma-separated names):**
```bash
# Specific spells
npx tsx scripts/scrape-dnd2024.ts --types spells --items "fireball,magic-missile"

# Single item with limit
npx tsx scripts/scrape-dnd2024.ts --types backgrounds --items acolyte --max-items 1
```

### CLI Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--types` | `-t` | string | "all" | Content types to scrape (comma-separated: spells, subclasses, feats, backgrounds, all) |
| `--items` | `-i` | string | "" | Specific item names to scrape (comma-separated) |
| `--max-items` | `-m` | number | null | Limit scrape to first N items (for testing) |
| `--continue-on-error` | `-c` | boolean | false | Continue scraping after errors instead of stopping |
| `--delay` | `-d` | number | 200 | Delay between requests in milliseconds |
| `--retries` | `-r` | number | 3 | Max retry attempts per item with exponential backoff |

### Examples

**Test scrape with single item:**
```bash
npx tsx scripts/scrape-dnd2024.ts --types spells --items acid-splash --max-items 1
```

**Full background scrape with error recovery:**
```bash
npx tsx scripts/scrape-dnd2024.ts --types backgrounds --continue-on-error
```

**Scrape specific subclasses:**
```bash
npx tsx scripts/scrape-dnd2024.ts --types subclasses --items "order-of-scribes,bladeschool"
```

### Output Files

Scraper writes to fixed filenames in `src/data/`:

- `spells.json` - All spells with attributes (level, school, components, etc.)
- `subclasses.json` - Subclass data with descriptions and sources
- `feats.json` - Feat data with benefits and prerequisites
- `backgrounds.json` - Background data (note: formatted backgrounds are in TypeScript)

### Validation

Validate scraped output against JSON Schema (auto-detects schema based on type):

```bash
# Validate all types
npm run validate:spells
npm run validate:subclasses
npm run validate:feats
npm run validate:backgrounds

# Or use --type flag directly with the script
npx tsx scripts/validate-output.ts --type spells
npx tsx scripts/validate-output.ts --type subclasses
```

---

## Project Structure

```
dnd-character-generator/
├── scripts/
│   ├── scrape-dnd2024.ts      # Main scraper (spells, subclasses, feats, backgrounds)
│   ├── cache-manager.ts       # HTML caching utilities
│   ├── validate-output.ts     # JSON Schema validation script
│   └── test-scrape.ts         # Debug tool for individual items
├── src/
│   ├── data/
│   │   ├── schemas/           # JSON Schema files for validation
│   │   ├── spells.json        # 411 official D&D 2024 SRD spells
│   │   ├── spells.ts          # Transformer: creates SPELLS_BY_CLASS mapping
│   │   ├── subclasses.json    # 61 subclasses scraped from wikidot.com
│   │   ├── subclasses.ts      # Transformer: maps friendly names to data
│   │   ├── feats.json         # Optional: 155 feats (kept for reference)
│   │   ├── feats.ts           # Core 30 hardcoded feats with benefits/prerequisites
│   │   └── racesAndBackgrounds.ts # Races + 12 formatted backgrounds
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces and type definitions
│   ├── components/
│   │   ├── CharacterGenerator.tsx  # Main character creation wizard
│   │   ├── ReferenceLibrary.tsx    # Searchable reference viewer
│   │   └── InventoryManager.tsx    # Equipment management
│   └── App.tsx                # Navigation between views
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite build configuration
```

---

## Key Implementation Notes

### Wizard Spellcasting Rules (Official 2024 SRD)

1. **Cantrips**: Know three Wizard cantrips separately - NOT in spellbook (+1 at levels 4 and 10)
2. **Spellbook**: Contains ONLY level 1+ spells, starts with exactly 6 level 1 spells, gains +2 per wizard level after 1st (formula: `6 + (level-1)*2`)
3. **Prepared Spells**: Choose Int mod + wizard level spells from spellbook (minimum one)

### Official Subclasses

**Wizard**: Order of Scribes, Bladeschool, War Magic, Chronurgy, Goldsmithy  
**Artificer**: Armorer, Alchemist, Battle Smith, Mystic

---

## Troubleshooting

### Rate Limiting

If you encounter rate limiting from wikidot.com:
- Increase delay: `--delay 500` or higher
- Use continue-on-error mode to recover partial data

### JavaScript Errors

The scraper disables JavaScript by default to prevent interference. If a page requires JS, this may cause parsing issues.

### Browser Issues

If Puppeteer fails to launch:
```bash
# Install Chromium dependencies (Linux)
npx puppeteer browsers install chrome

# Or use existing browser
export PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
```

---

## License

This project uses D&D 2024 SRD content which is licensed under the Open Game License (OGL). See http://dnd2024.wikidot.com/ for official terms.
