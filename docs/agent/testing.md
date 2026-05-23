# Testing Reference

## Framework
- **Vitest** v4 — shares config with Vite, fast, zero-config setup
- **jsdom** environment — DOM APIs available for future React component tests

## Configuration
Vitest config lives in `vitest.config.ts` (separate from `vite.config.ts` to avoid TypeScript errors during `npm run build`):
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,          // describe/it/expect available without import
    environment: 'jsdom',   // DOM simulation for React component tests
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
```

## Commands

### Run all tests once
```bash
npm run test
```

### Watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

## Test File Location
Tests live in `src/__tests__/`. The naming convention is `*.test.ts` or `*.test.tsx`.

```
src/__tests__/
  utils.test.ts        # Unit tests for calculations.ts
```

## Current Test Coverage

| Module | File | Tests | Coverage |
|--------|------|-------|----------|
| `calculations.ts` | `utils.test.ts` | 37 | Ability modifiers, proficiency bonus, AC calculation, gold formatting, HP calculation, standard array, background bonus application |

### What's Tested
- `calculateAbilityModifier` — all score ranges (1-30)
- `generateAbilityScores` — standard array output and sum
- `calculateProficiencyBonus` — all level brackets (1-20)
- `calculateAC` — unarmored, armor types, Dex interaction
- `formatGold` — multi-currency formatting
- `calculateHitPoints` — level 1 HP with various con modifiers
- Background bonus application logic
- Spell preparation formula validation (druid, artificer)

## Writing New Tests

```ts
import { describe, it, expect } from 'vitest';
import { someFunction } from '../path/to/module';

describe('someFunction', () => {
  it('does something', () => {
    expect(someFunction(input)).toBe(expected);
  });
});
```

### Testing React Components
Use jsdom environment for rendering:
```ts
import { render, screen } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

it('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('expected text')).toBeTruthy();
});
```

> **Note:** `@testing-library/react` is not installed. Install it if needed:
> ```bash
> npm install -D @testing-library/react @testing-library/jest-dom
> ```

## Adding Tests to CI/CD
Run `npm run test` as part of your build/validation pipeline. It exits non-zero on failure.
