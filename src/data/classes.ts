import type { ClassData, SpellcastingInfo } from "../types";
import classesJson from "./classes.json";

/**
 * Transformer: Converts scraped classes.json into CLASSES record
 * 
 * Each class is transformed to match the ClassData interface used throughout the app.
 */

function parseStartingEquipment(equipmentText: string): Array<{ item: string; quantity?: number; choose?: { from: string[]; count: number } }> {
  const equipmentList: Array<{ item: string; quantity?: number; choose?: { from: string[]; count: number } }> = [];
  
  // Parse "Choose A or B: (A) X, Y, Z; or (B) W" format
  const chooseMatch = equipmentText.match(/Choose\s+(?:\w+\s+or\s+\w+\s+)?(?:\(([A-Z])\)\s*)?([\w,\s&]+)(?:;\s*or\s*\(([A-Z])\)\s*([\w,\s&]+))?/i);
  
  if (chooseMatch) {
    const option1 = chooseMatch[2]?.split(',').map(s => s.trim()) || [];
    const option2 = chooseMatch[4]?.split(',').map(s => s.trim()) || [];
    
    equipmentList.push({
      item: 'Choose starting equipment',
      choose: {
        from: [...option1, ...option2],
        count: 1
      }
    });
  } else {
    // Simple comma-separated list
    const items = equipmentText.split(',').map(s => s.trim());
    items.forEach(item => {
      const quantityMatch = item.match(/(\d+)\s*x?\s*(\w+)/i);
      if (quantityMatch) {
        equipmentList.push({
          item: quantityMatch[2],
          quantity: parseInt(quantityMatch[1])
        });
      } else {
        equipmentList.push({ item });
      }
    });
  }
  
  return equipmentList;
}

// Spell slot progression from SRD (levels 1-20)
const spellSlotProgression = {
  level1: [0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  level2: [0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  level3: [0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  level4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  level5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  level6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  level7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  level8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  level9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
};

// Artificer spellcasting info (from wikidot - NOT in SRD PDF)
const artificerSpellcastingInfo: SpellcastingInfo = {
  cantripsKnown: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4],
  spellsPrepared: (abilityMod: number, level: number) => {
    // Artificer prepares Int mod + half level (rounded down), minimum 2
    return Math.max(2, abilityMod + Math.floor(level / 2));
  },
  spellSlots: {
    level1: [0, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level2: [0, 0, 0, 0, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    level4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  }
};

// Druid spellcasting info (from SRD)
const druidSpellcastingInfo: SpellcastingInfo = {
  cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  spellsPrepared: (abilityMod: number, level: number) => {
    // Druid prepares Wis mod + druid level
    return abilityMod + level;
  },
  spellSlots: spellSlotProgression
};

// Bard spellcasting info (from wikidot - SRD has page break issues)
const bardSpellcastingInfo: SpellcastingInfo = {
  cantripsKnown: [2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  spellsPrepared: (abilityMod: number, level: number) => {
    // Bard prepares Cha mod + bard level
    return abilityMod + level;
  },
  spellSlots: {
    level1: [0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level2: [0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level3: [0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level4: [0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    level6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    level7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    level8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    level9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
  }
};

// Cleric spellcasting info (from SRD)
const clericSpellcastingInfo: SpellcastingInfo = {
  cantripsKnown: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  spellsPrepared: (abilityMod: number, level: number) => {
    // Cleric prepares Wis mod + cleric level
    return abilityMod + level;
  },
  spellSlots: {
    level1: [0, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    level2: [0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level3: [0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level4: [0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4],
    level6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4, 4, 4],
    level7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4],
    level8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4],
    level9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3]
  }
};

// Paladin spellcasting info (from SRD)
const paladinSpellcastingInfo: SpellcastingInfo = {
  cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  spellsPrepared: (abilityMod: number, level: number) => {
    // Paladin prepares Cha mod + paladin level
    return abilityMod + level;
  },
  spellSlots: {
    level1: [0, 0, 0, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    level2: [0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3],
    level5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3],
    level6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3],
    level7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3],
    level8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    level9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
};

// Ranger spellcasting info (from wikidot - max 5th level slots)
const rangerSpellcastingInfo: SpellcastingInfo = {
  cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  spellsPrepared: (abilityMod: number, level: number) => {
    // Ranger prepares Wis mod + ranger level
    return abilityMod + level;
  },
  spellSlots: {
    level1: [0, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level2: [0, 0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    level4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    level5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2]
  }
};

// Sorcerer spellcasting info (from SRD)
const sorcererSpellcastingInfo: SpellcastingInfo = {
  cantripsKnown: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  spellsPrepared: (abilityMod: number, level: number) => {
    // Sorcerer prepares Cha mod + sorcerer level
    return abilityMod + level;
  },
  spellSlots: {
    level1: [0, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level2: [0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level3: [0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level4: [0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    level6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 4, 4],
    level7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 4, 4],
    level8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 4],
    level9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4]
  }
};

// Warlock spellcasting info (from SRD)
const warlockSpellcastingInfo: SpellcastingInfo = {
  cantripsKnown: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  spellsPrepared: (abilityMod: number, level: number) => {
    // Warlock prepares Cha mod + warlock level
    return abilityMod + level;
  },
  spellSlots: {
    level1: [0, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    level2: [0, 0, 0, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    level3: [0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    level4: [0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7],
    level5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7],
    level6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 7, 7, 7],
    level7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 7],
    level8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 5, 6],
    level9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4]
  }
};

function transformClass(classJson: any): ClassData {
  const classKey = classJson.name.toLowerCase();
  
  // Transform saving throws to lowercase array
  const savingThrows = Array.isArray(classJson.savingThrows) 
    ? classJson.savingThrows.map((s: string) => s.toLowerCase())
    : [];
  
  // Transform armor training to proficiency format
  const armorProficiencies = (classJson.armorTraining || []).map((armor: string) => {
    if (armor.includes('Light') && armor.includes('Medium') && armor.includes('Shields')) {
      return 'light_armor' as const;
    } else if (armor.includes('Light')) {
      return 'light_armor' as const;
    } else if (armor.includes('Medium')) {
      return 'medium_armor' as const;
    } else if (armor.includes('Heavy')) {
      return 'heavy_armor' as const;
    } else if (armor.includes('Shields')) {
      return 'shields' as const;
    }
    return armor.toLowerCase() as any;
  });
  
  // Transform weapon proficiencies
  const weaponProficiencies = (classJson.weaponProficiencies || []).map((weapon: string) => {
    if (weapon.includes('Simple') && weapon.includes('Martial')) {
      return 'simple_weapons' as const;
    } else if (weapon.includes('Simple')) {
      return 'simple_melee_weapons' as const;
    } else if (weapon.includes('Martial')) {
      return 'martial_melee_weapons' as const;
    }
    return weapon.toLowerCase() as any;
  });
  
  // Transform class features
  const classFeatures = (classJson.classFeatures || []).map((feature: any) => ({
    level: feature.level,
    name: feature.name,
    description: feature.description
  }));
  
  let spellcastingInfo: SpellcastingInfo | undefined;
  
  // Add spellcasting info for spellcasting classes
  if (classKey === 'artificer') {
    spellcastingInfo = artificerSpellcastingInfo;
  } else if (classKey === 'bard') {
    spellcastingInfo = bardSpellcastingInfo;
  } else if (classKey === 'cleric') {
    spellcastingInfo = clericSpellcastingInfo;
  } else if (classKey === 'druid') {
    spellcastingInfo = druidSpellcastingInfo;
  } else if (classKey === 'paladin') {
    spellcastingInfo = paladinSpellcastingInfo;
  } else if (classKey === 'ranger') {
    spellcastingInfo = rangerSpellcastingInfo;
  } else if (classKey === 'sorcerer') {
    spellcastingInfo = sorcererSpellcastingInfo;
  } else if (classKey === 'warlock') {
    spellcastingInfo = warlockSpellcastingInfo;
  }
  
  return {
    class: classKey as any,
    hitDie: classJson.hitDie,
    primaryAbility: classJson.primaryAbility.toLowerCase(),
    savingThrows,
    armorProficiencies,
    weaponProficiencies,
    toolProficiencies: [], // Will be added if present in scraped data
    startingEquipment: parseStartingEquipment(classJson.startingEquipment || ''),
    classFeatures,
    spellcastingInfo
  };
}

// Create CLASSES record from all scraped classes
export const CLASSES: Record<string, ClassData> = classesJson.reduce((acc: Record<string, ClassData>, classJson: any) => {
  const transformedClass = transformClass(classJson);
  acc[transformedClass.class] = transformedClass;
  return acc;
}, {});
