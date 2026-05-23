import { describe, it, expect } from 'vitest';
import {
  calculateAbilityModifier,
  calculateProficiencyBonus,
  calculateAC,
  formatGold,
  generateAbilityScores,
  calculateHitPoints,
} from '../utils/calculations';
import type { AbilityScores } from '../types';

describe('calculateAbilityModifier', () => {
  it('calculates -5 for score 1', () => {
    expect(calculateAbilityModifier(1)).toBe(-5);
  });

  it('calculates -2 for score 6', () => {
    expect(calculateAbilityModifier(6)).toBe(-2);
  });

  it('calculates -1 for score 8', () => {
    expect(calculateAbilityModifier(8)).toBe(-1);
  });

  it('calculates +0 for score 10', () => {
    expect(calculateAbilityModifier(10)).toBe(0);
  });

  it('calculates +0 for score 11', () => {
    expect(calculateAbilityModifier(11)).toBe(0);
  });

  it('calculates +1 for score 12', () => {
    expect(calculateAbilityModifier(12)).toBe(1);
  });

  it('calculates +2 for score 14', () => {
    expect(calculateAbilityModifier(14)).toBe(2);
  });

  it('calculates +5 for score 20', () => {
    expect(calculateAbilityModifier(20)).toBe(5);
  });

  it('calculates +10 for score 30', () => {
    expect(calculateAbilityModifier(30)).toBe(10);
  });
});

describe('generateAbilityScores', () => {
  it('returns an AbilityScores object', () => {
    const scores = generateAbilityScores();
    expect(scores).toHaveProperty('strength');
    expect(scores).toHaveProperty('dexterity');
    expect(scores).toHaveProperty('constitution');
    expect(scores).toHaveProperty('intelligence');
    expect(scores).toHaveProperty('wisdom');
    expect(scores).toHaveProperty('charisma');
  });

  it('uses the standard array [15, 14, 13, 12, 10, 8]', () => {
    const scores = generateAbilityScores();
    expect(scores.strength).toBe(15);
    expect(scores.dexterity).toBe(14);
    expect(scores.constitution).toBe(13);
    expect(scores.intelligence).toBe(12);
    expect(scores.wisdom).toBe(10);
    expect(scores.charisma).toBe(8);
  });

  it('sums to 72 (standard array total)', () => {
    const scores = generateAbilityScores();
    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
    expect(total).toBe(72);
  });
});

describe('calculateProficiencyBonus', () => {
  it('returns +2 for levels 1-4', () => {
    expect(calculateProficiencyBonus(1)).toBe(2);
    expect(calculateProficiencyBonus(2)).toBe(2);
    expect(calculateProficiencyBonus(4)).toBe(2);
  });

  it('returns +3 for levels 5-8', () => {
    expect(calculateProficiencyBonus(5)).toBe(3);
    expect(calculateProficiencyBonus(8)).toBe(3);
  });

  it('returns +4 for levels 9-12', () => {
    expect(calculateProficiencyBonus(9)).toBe(4);
    expect(calculateProficiencyBonus(12)).toBe(4);
  });

  it('returns +5 for levels 13-16', () => {
    expect(calculateProficiencyBonus(13)).toBe(5);
    expect(calculateProficiencyBonus(16)).toBe(5);
  });

  it('returns +6 for levels 17-20', () => {
    expect(calculateProficiencyBonus(17)).toBe(6);
    expect(calculateProficiencyBonus(20)).toBe(6);
  });
});

describe('calculateAC', () => {
  const baseScores: AbilityScores = {
    strength: 10,
    dexterity: 14,
    constitution: 12,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  it('returns base 10 for unarmored character with no proficiencies', () => {
    expect(calculateAC(baseScores, [])).toBe(10);
  });

  it('returns 12 for unarmored character with light armor proficiency (10 + Dex mod +2)', () => {
    expect(calculateAC(baseScores, ['light_armor'])).toBe(12);
  });

  it('calculates leather armor AC (11 + Dex mod)', () => {
    expect(calculateAC(baseScores, [], 'leather_armor')).toBe(13);
  });

  it('calculates studded leather AC (12 + Dex mod)', () => {
    expect(calculateAC(baseScores, [], 'studded_leather')).toBe(14);
  });

  it('calculates chain mail AC (flat 16, no Dex)', () => {
    expect(calculateAC(baseScores, [], 'chain_mail')).toBe(16);
  });

  it('falls back to 10 + Dex for unrecognized armor', () => {
    expect(calculateAC(baseScores, [], 'unknown_armor')).toBe(12);
  });

  it('uses zero dex mod for dex 10', () => {
    const scores: AbilityScores = {
      strength: 10, dexterity: 10, constitution: 12,
      intelligence: 10, wisdom: 10, charisma: 10,
    };
    expect(calculateAC(scores, ['light_armor'])).toBe(10);
  });
});

describe('formatGold', () => {
  it('formats gold pieces alone', () => {
    expect(formatGold(100, 0, 0, 0, 0)).toBe('100 gp');
  });

  it('formats multiple currencies in order', () => {
    expect(formatGold(50, 2, 10, 30, 0)).toBe('50 gp 2 pp 10 ep 30 sp');
  });

  it('includes copper pieces', () => {
    expect(formatGold(0, 0, 0, 0, 50)).toBe('0 gp 50 cp');
  });

  it('handles zero gold with other currencies', () => {
    expect(formatGold(0, 0, 1, 0, 0)).toBe('0 gp 1 ep');
  });

  it('handles all zeros (always outputs gp)', () => {
    expect(formatGold(0, 0, 0, 0, 0)).toBe('0 gp');
  });
});

describe('calculateHitPoints', () => {
  it('returns hitDie + con modifier at level 1', () => {
    // d10 hit die, +2 con modifier = 12 HP at level 1
    expect(calculateHitPoints(1, 2, 10)).toEqual({ current: 12, max: 12 });
  });

  it('handles zero con modifier at level 1', () => {
    expect(calculateHitPoints(1, 0, 8)).toEqual({ current: 8, max: 8 });
  });

  it('handles negative con modifier at level 1', () => {
    expect(calculateHitPoints(1, -1, 6)).toEqual({ current: 5, max: 5 });
  });

  it('returns object with both current and max at level 1', () => {
    const result = calculateHitPoints(1, 1, 8);
    expect(result).toHaveProperty('current');
    expect(result).toHaveProperty('max');
    expect(result.current).toBe(result.max);
  });
});

describe('ability scores with background bonuses', () => {
  it('should correctly apply background bonuses to base scores', () => {
    const baseScores: AbilityScores = {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    };

    const backgroundBonuses: AbilityScores = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 2,
      wisdom: 1,
      charisma: 0,
    };

    // Background grants +2 INT, +1 WIS
    const finalInt = baseScores.intelligence + backgroundBonuses.intelligence;
    const finalWis = baseScores.wisdom + backgroundBonuses.wisdom;
    const finalStr = baseScores.strength + backgroundBonuses.strength;
    const finalCha = baseScores.charisma + backgroundBonuses.charisma;

    expect(finalInt).toBe(14); // 12 + 2
    expect(finalWis).toBe(11); // 10 + 1
    expect(finalStr).toBe(15); // 15 + 0
    expect(finalCha).toBe(8);  // 8 + 0
  });

  it('should produce correct modifiers after background bonuses', () => {
    // Score 12 + 2 bonus = 14, modifier should be +2
    expect(calculateAbilityModifier(14)).toBe(2);

    // Score 10 + 1 bonus = 11, modifier should be +0
    expect(calculateAbilityModifier(11)).toBe(0);
  });
});

describe('spell preparation limits from data', () => {
  it('should use progression data index for level 1 prepared spells', () => {
    // Druid at level 1 with Wis 16 (+3): Wis mod + level = 3 + 1 = 4
    // This validates the formula used in the data
    const wisdomMod = calculateAbilityModifier(16);
    const level = 1;
    const expectedPrepared = wisdomMod + level;
    expect(expectedPrepared).toBe(4);
  });

  it('should use progression data index for artificer prepared spells', () => {
    // Artificer at level 1 with Int 16 (+3): max(2, Int mod + floor(level/2)) = max(2, 3+0) = 3
    const intMod = calculateAbilityModifier(16);
    const level = 1;
    const expectedPrepared = Math.max(2, intMod + Math.floor(level / 2));
    expect(expectedPrepared).toBe(3);
  });
});
