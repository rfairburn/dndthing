import { describe, expect, it } from 'vitest';
import { calculateAbilityModifier } from './calculations';

/**
 * Boundary tests for the real ability modifier formula
 * (floor((score - 10) / 2)) covering negative scores, odd scores, and
 * even scores around the breakpoints.
 */
describe('calculateAbilityModifier', () => {
  it('returns negative modifiers for below-average scores', () => {
    expect(calculateAbilityModifier(1)).toBe(-5); // minimum score
    expect(calculateAbilityModifier(2)).toBe(-4);
    expect(calculateAbilityModifier(6)).toBe(-2);
    expect(calculateAbilityModifier(7)).toBe(-2);
    expect(calculateAbilityModifier(8)).toBe(-1);
    expect(calculateAbilityModifier(9)).toBe(-1);
  });

  it('is zero at the 10/11 breakpoint for even and odd scores', () => {
    expect(calculateAbilityModifier(10)).toBe(0); // even
    expect(calculateAbilityModifier(11)).toBe(0); // odd
  });

  it('scales positive modifiers for above-average scores', () => {
    expect(calculateAbilityModifier(12)).toBe(1); // even
    expect(calculateAbilityModifier(13)).toBe(1); // odd
    expect(calculateAbilityModifier(14)).toBe(2);
    expect(calculateAbilityModifier(15)).toBe(2); // odd pairs with even
    expect(calculateAbilityModifier(20)).toBe(5); // maximum base score
    expect(calculateAbilityModifier(30)).toBe(10); // maximum achievable
  });

  it('floors odd scores rather than rounding them', () => {
    // Odd scores round down: 9 -> -1 (not 0), 13 -> +1 (not +2).
    expect(calculateAbilityModifier(9)).toBe(-1);
    expect(calculateAbilityModifier(13)).toBe(1);
    expect(calculateAbilityModifier(21)).toBe(5);
  });
});
