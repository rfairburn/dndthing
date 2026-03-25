import type { ClassData } from "../types";
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
  
  return {
    class: classKey as any,
    hitDie: classJson.hitDie,
    primaryAbility: classJson.primaryAbility.toLowerCase(),
    savingThrows,
    armorProficiencies,
    weaponProficiencies,
    toolProficiencies: [], // Will be added if present in scraped data
    startingEquipment: parseStartingEquipment(classJson.startingEquipment || ''),
    classFeatures
  };
}

// Create CLASSES record from all scraped classes
export const CLASSES: Record<string, ClassData> = classesJson.reduce((acc: Record<string, ClassData>, classJson: any) => {
  const transformedClass = transformClass(classJson);
  acc[transformedClass.class] = transformedClass;
  return acc;
}, {});
