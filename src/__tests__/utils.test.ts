import { describe, it, expect } from 'vitest';

describe('ability modifier calculation', () => {
  it('calculates +0 modifier for score 10', () => {
    expect(Math.floor((10 - 10) / 2)).toBe(0);
  });

  it('calculates +1 modifier for score 12', () => {
    expect(Math.floor((12 - 10) / 2)).toBe(1);
  });

  it('calculates +2 modifier for score 14', () => {
    expect(Math.floor((14 - 10) / 2)).toBe(2);
  });

  it('calculates -1 modifier for score 8', () => {
    expect(Math.floor((8 - 10) / 2)).toBe(-1);
  });
});

describe('ability scores with background bonuses', () => {
  it('should include background bonuses in final scores', () => {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
    
    // Base scores from standard array
    const baseScores: Record<typeof abilities[number], number> = {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8
    };
    
    // Background bonuses
    const backgroundBonuses: Record<typeof abilities[number], number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 2,
      wisdom: 1,
      charisma: 0
    };
    
    // Calculate final scores
    const finalScores: Record<typeof abilities[number], number> = {} as any;
    
    abilities.forEach(ability => {
      const baseValue = baseScores[ability];
      const bonusValue = backgroundBonuses[ability];
      finalScores[ability] = baseValue + bonusValue;
    });
    
    // Verify results
    expect(finalScores.intelligence).toBe(14); // 12 + 2
    expect(finalScores.wisdom).toBe(11); // 10 + 1
    expect(finalScores.strength).toBe(15); // 15 + 0
    expect(finalScores.charisma).toBe(8); // 8 + 0
  });
});

describe('spell preparation limits', () => {
  it('should calculate correct prepared spells for druid', () => {
    // Druid formula: Wis mod + druid level
    const wisdom = 16;
    const wisdomMod = Math.floor((wisdom - 10) / 2); // +3
    const level = 1;
    const expectedPrepared = wisdomMod + level; // 3 + 1 = 4
    
    expect(expectedPrepared).toBe(4);
  });

  it('should calculate correct prepared spells for artificer', () => {
    // Artificer formula: Int mod + half level (rounded down), min 2
    const intelligence = 16;
    const intelligenceMod = Math.floor((intelligence - 10) / 2); // +3
    const level = 1;
    const expectedPrepared = Math.max(2, intelligenceMod + Math.floor(level / 2)); // 3 + 0 = 3
    
    expect(expectedPrepared).toBe(3);
  });
});
