import type { AbilityScores, Character } from "../types";

export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const generateAbilityScores = (): AbilityScores => {
  // Standard array method
  const scores = [15, 14, 13, 12, 10, 8];
  
  return {
    strength: scores[0],
    dexterity: scores[1],
    constitution: scores[2],
    intelligence: scores[3],
    wisdom: scores[4],
    charisma: scores[5]
  };
};

export const rollAbilityScores = (): AbilityScores => {
  const rollStats = () => {
    const rolls = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, 
                   Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    rolls.sort((a, b) => a - b);
    return rolls.slice(1).reduce((sum, val) => sum + val, 0); // Drop lowest
  };

  return {
    strength: rollStats(),
    dexterity: rollStats(),
    constitution: rollStats(),
    intelligence: rollStats(),
    wisdom: rollStats(),
    charisma: rollStats()
  };
};

export const createCharacter = (name: string, race: any, background: any): Character => {
  const abilityScores = generateAbilityScores();
  
  return {
    id: Date.now().toString(),
    name,
    race: "human" as any,
    background: "acolyte" as any,
    classData: { class: "fighter" },
    level: 1,
    experiencePoints: 0,
    abilityScores,
    proficiencyBonus: 2,
    ac: 10 + calculateAbilityModifier(abilityScores.dexterity),
    speed: race.speed || 30,
    hitPoints: {
      current: 10,
      max: 10,
      temporary: 0
    },
    hitDice: {
      total: 1,
      value: "d8"
    },
    initiativeModifier: calculateAbilityModifier(abilityScores.dexterity),
    passiveWisdom: 10 + calculateAbilityModifier(abilityScores.wisdom),
    savingThrows: [],
    skillProficiencies: [],
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    languages: [...(race.languages || ["Common"])],
    traits: race.traits || [],
    featuresAndClasses: [
      { name: background.feature.name, description: background.feature.description, source: "background" as const }
    ],
    actions: [],
    inventory: [],
    goldPieces: 0,
    platinumPieces: 0,
    electrumPieces: 0,
    silverPieces: 0,
    copperPieces: 0,
    knownSpells: [],
    cantripsKnown: [],
    wizardSpellbook: []
  };
};

export const calculateAC = (abilityScores: AbilityScores, armorProficiencies: string[], wearingArmor?: string): number => {
  if (wearingArmor) {
    // Simple armor AC calculation
    switch (wearingArmor) {
      case "leather_armor": return 11 + calculateAbilityModifier(abilityScores.dexterity);
      case "studded_leather": return 12 + calculateAbilityModifier(abilityScores.dexterity);
      case "chain_mail": return 16;
      default: return 10 + calculateAbilityModifier(abilityScores.dexterity);
    }
  }
  
  // Unarmored defense for classes like monk, barbarian
  if (armorProficiencies.includes("light_armor")) {
    return 10 + calculateAbilityModifier(abilityScores.dexterity);
  }
  
  return 10;
};

export const formatGold = (gp: number, pp: number, ep: number, sp: number, cp: number): string => {
  const parts = [];
  if (pp > 0) parts.push(`${pp} pp`);
  if (ep > 0) parts.push(`${ep} ep`);
  if (sp > 0) parts.push(`${sp} sp`);
  if (cp > 0) parts.push(`${cp} cp`);
  
  return `${gp} gp ${parts.join(" ")}`.trim();
};

export const calculateProficiencyBonus = (level: number): number => {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
};

export const calculateHitPoints = (level: number, constitutionModifier: number, hitDie: number): { current: number; max: number } => {
  if (level === 1) {
    return { current: hitDie + constitutionModifier, max: hitDie + constitutionModifier };
  }
  
  const previousMax = calculateHitPoints(level - 1, constitutionModifier, hitDie).max;
  const newHP = Math.floor(Math.random() * (hitDie / 2)) + Math.ceil(hitDie / 2) + constitutionModifier;
  
  return { current: previousMax + newHP, max: previousMax + newHP };
};
