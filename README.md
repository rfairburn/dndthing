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
- `backgrounds.json` - Background data with ability scores, feats, proficiencies
- `species.json` - Species data with traits, sizes, speed (21 entries)

### Validation

Validate scraped output against JSON Schema (auto-detects schema based on type):

```bash
# Validate all types
npm run validate:spells      # 411 spells
npm run validate:subclasses  # 61 subclasses
npm run validate:feats       # 30 feats
npm run validate:backgrounds # 56 backgrounds
npm run validate:species     # 21 species

# Or use --type flag directly with the script
npx tsx scripts/validate-output.ts --type spells
npx tsx scripts/validate-output.ts --type subclasses
npx tsx scripts/validate-output.ts --type feats
npx tsx scripts/validate-output.ts --type backgrounds
npx tsx scripts/validate-output.ts --type species
```

All 5 scraped data types have JSON Schema validators for complete coverage.

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
│   │   ├── schemas/           # JSON Schema files for validation (5 total)
│   │   ├── spells.json        # 411 official D&D 2024 SRD spells
│   │   ├── spells.ts          # Transformer: creates SPELLS_BY_CLASS mapping
│   │   ├── subclasses.json    # 61 subclasses scraped from wikidot.com
│   │   ├── subclasses.ts      # Transformer: maps friendly names to data
│   │   ├── feats.json         # Optional: 155 feats (kept for reference)
│   │   ├── feats.ts           # Core 30 hardcoded feats with benefits/prerequisites
│   │   ├── backgrounds.json   # 56 backgrounds with ability scores, feats, proficiencies
│   │   ├── backgrounds.ts     # Background transformer with abilityScores/feat/proficiencies
│   │   ├── species.json       # 21 scraped species entries with traits/sizes/speed
│   │   └── species.ts         # Transformer: loads SPECIES record from scraped data
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

## Rules Reference

For official D&D 2024 SRD rules context, use the included PDF parser tools:

**Source**: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf

### Quick Search for Rules
```bash
# First, parse the PDF (run once)
npm run parse:srd-pdf

# Then search for specific rules
npm run query:srd <search term>

# Examples:
npm run query:srd "spell slots"
npm run query:srd "background bonuses"  
npm run query:srd "species traits"
npm run query:srd "wizard spellbook"
```

### When to Reference the SRD PDF
- **Character creation flow**: Verify species → background → ability scores order
- **Spellcasting rules**: Confirm cantrip/spellbook/prepared spell mechanics
- **Background stat bonuses**: Check +3 distribution rules (+2/+1 or +1/+1/+1)
- **Equipment/proficiencies**: Validate what backgrounds grant

**Note**: The parsed output is in `rules-reference/` which is gitignored (not committed for licensing reasons). Re-run `npm run parse:srd-pdf` as needed.

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
