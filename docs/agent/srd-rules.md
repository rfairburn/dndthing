# SRD Rules Reference

## Primary Rule Source
- Use `http://dnd2024.wikidot.com/` first.
- Use the SRD PDF only for supplementary rules context when Wikidot is missing or unclear.
- Never trust SRD PDF charts/tables for spell slots, class progression, or other numerical tables.

## SRD PDF Source
- `https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf`

## Parsed Output
Generated locally and not committed:
- `rules-reference/srd-text.json`
- `rules-reference/srd-raw.txt`

## Basic Commands
```bash
npm run parse:srd-pdf
npm run query:srd "wizard spellbook"
npm run query:srd "background bonuses"
```

## Query Strategy

### Class feature lookups
Use `<ClassName> <FeatureName>`:

```bash
npm run query:srd "Cleric Spellcasting"
npm run query:srd "Wizard Spellbook"
npm run query:srd "Druid Cantrips"
npm run query:srd "Sorcerer Prepared Spells"
```

### Generic rules lookups
```bash
npm run query:srd "spell slots"
npm run query:srd "prepared spells"
npm run query:srd "species traits"
```

### Raw grep fallback
```bash
grep -n "ClassName\\|FeatureName" rules-reference/srd-raw.txt
```

## Interpretation Notes
- Artificer is not in the official SRD PDF. Use Wikidot for all Artificer rules.
- Some subclass details may be incomplete in the PDF.
- If `query:srd` warns that it is re-scoring results, broader search terms may work better.

## Known Rules to Preserve
- Character creation order is `Species -> Background -> Ability Scores`.
- Background grants the +3 ability score increase.
- Wizard cantrips are known separately from the spellbook.
- Wizard spellbook holds level 1+ spells only.
