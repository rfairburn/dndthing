# Frontend and Data Reference

## Important Files

### App and components
- `src/App.tsx`
- `src/components/CharacterGenerator.tsx`
- `src/components/ReferenceLibrary.tsx`
- `src/components/InventoryManager.tsx`

### Data and types
- `src/types/index.ts`
- `src/data/spells.json`
- `src/data/spells.ts`
- `src/data/subclasses.json`
- `src/data/subclasses.ts`
- `src/data/species.json`
- `src/data/species.ts`
- `src/data/backgrounds.json`
- `src/data/backgrounds.ts`
- `src/data/feats.json`
- `src/data/feats.ts`

## Data Modeling Guidance
- Prefer normalized keyed data and transformers over component-local hardcoded rules.
- Derive sorted arrays for UI rendering from record-like data structures.
- Keep rule interpretation in adapters/selectors, not in React components.
- Avoid duplicating the same game logic across multiple files.

## UI State Rules
- Use functional state updates: `setState(prev => ...)`.
- Be careful with async state transitions when multiple updates happen in one interaction flow.
- Verify mobile layouts after component changes.

## Expandable Card Pattern
When a card expands to full row width in a 3-column layout:
1. Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
2. Move the selected card to the leftmost slot in its row before expanding.
3. Use `col-span-1 md:col-span-2 lg:col-span-3` for the expanded item.
4. Reorder the rendered array so expansion starts at the row boundary.

Formula:
```ts
const rowStart = expandedIndex - (expandedIndex % 3);
```

## Change Checklist
- `npm run build`
- `npm run test` if present and relevant
- validate any scraped data affected by the UI/data change
- verify responsive behavior if the UI changed

## Current Architectural Direction
- Keep scraped/reference data in JSON, not embedded in `.ts` constants.
- Use `.ts` files as transformers/adapters into the UI-facing shape.
- Favor map/record-style sources of truth with deterministic sort order at render time.
