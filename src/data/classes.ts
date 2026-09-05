import type {
  ArmorProficiency,
  ClassData,
  ClassFeature,
  ClassType,
  StartingEquipment,
  WeaponProficiency
} from "../types";
import classesJson from "./classes.json";

/**
 * Transformer: Converts scraped classes.json into CLASSES record
 *
 * Each class is transformed to match the ClassData interface used throughout the app.
 */

/** Shape of each entry in classes.json as scraped from dnd2024.wikidot.com. */
interface RawClass {
  name: string;
  source: string;
  hitDie: number;
  primaryAbility: string;
  savingThrows: string[];
  skillProficiencies: string[];
  weaponProficiencies: string[];
  armorTraining: string[];
  startingEquipment: string;
  classFeatures: ClassFeature[];
}

function parseStartingEquipment(equipmentText: string): StartingEquipment[] {
  const equipmentList: StartingEquipment[] = [];

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

function toArmorProficiency(armor: string): ArmorProficiency {
  if (armor.includes('Light') && armor.includes('Medium') && armor.includes('Shields')) {
    return 'light_armor';
  } else if (armor.includes('Light')) {
    return 'light_armor';
  } else if (armor.includes('Medium')) {
    return 'medium_armor';
  } else if (armor.includes('Heavy')) {
    return 'heavy_armor';
  } else if (armor.includes('Shields')) {
    return 'shields';
  }
  return armor.toLowerCase() as ArmorProficiency;
}

function toWeaponProficiency(weapon: string): WeaponProficiency {
  if (weapon.includes('Simple') && weapon.includes('Martial')) {
    return 'simple_weapons';
  } else if (weapon.includes('Simple')) {
    return 'simple_melee_weapons';
  } else if (weapon.includes('Martial')) {
    return 'martial_melee_weapons';
  }
  return weapon.toLowerCase() as WeaponProficiency;
}

function transformClass(classJson: RawClass): ClassData {
  const classKey = classJson.name.toLowerCase();

  // Transform saving throws to lowercase array
  const savingThrows = classJson.savingThrows.map(s => s.toLowerCase());

  // Transform armor training to proficiency format
  const armorProficiencies = classJson.armorTraining.map(toArmorProficiency);

  // Transform weapon proficiencies
  const weaponProficiencies = classJson.weaponProficiencies.map(toWeaponProficiency);

  // Transform class features
  const classFeatures: ClassFeature[] = classJson.classFeatures.map(feature => ({
    level: feature.level,
    name: feature.name,
    description: feature.description
  }));

  return {
    class: classKey as ClassType,
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
export const CLASSES: Record<string, ClassData> = classesJson.reduce<Record<string, ClassData>>(
  (acc, classJson) => {
    const transformedClass = transformClass(classJson);
    acc[transformedClass.class] = transformedClass;
    return acc;
  },
  {}
);
