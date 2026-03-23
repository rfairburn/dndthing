import type { Race } from "../types";

export const RACES: Record<Race, any> = {
  human: {
    name: "Human",
    description: "Humans are versatile and ambitious, found in every corner of the multiverse.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    languages: ["Common"],
    traits: [
      { name: "Extra Language", description: "You can speak, read, and write one extra language of your choice." },
      { name: "All-Rounder", description: "You gain one skill proficiency of your choice." }
    ]
  },
  dwarf: {
    name: "Dwarf",
    description: "Dwarves are sturdy and hardy, known for their craftsmanship and resilience.",
    size: "Medium",
    speed: 25,
    abilityScoreIncrease: { constitution: 2 },
    darkvision: true,
    languages: ["Common", "Dwarvish"],
    traits: [
      { name: "Dwarven Resilience", description: "You have advantage on saving throws against poison, and you have resistance to the poison damage." },
      { name: "Dwarven Combat Training", description: "You gain proficiency with the battleaxe, handaxe, light hammer, and warhammer." },
      { name: "Tool Proficiency", description: "You gain proficiency with the smith's tools, brewer's supplies, or mason's tools." },
      { name: "Stonecunning", description: "Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus." }
    ]
  },
  elf: {
    name: "Elf",
    description: "Elves are graceful and magical, with keen senses and an affinity for arcane magic.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { dexterity: 2 },
    darkvision: true,
    languages: ["Common", "Elvish"],
    traits: [
      { name: "Fey Ancestry", description: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
      { name: "Trance", description: "Elves don't need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day." }
    ]
  },
  halfling: {
    name: "Halfling",
    description: "Halflings are small and nimble, known for their luck and agility.",
    size: "Small",
    speed: 25,
    abilityScoreIncrease: { dexterity: 2 },
    lucky: true,
    languages: ["Common", "Halfling"],
    traits: [
      { name: "Lucky", description: "When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll." },
      { name: "Brave", description: "You have advantage on saving throws against being frightened." },
      { name: "Halfling Nimbleness", description: "You can move through the space of any creature that is of a size larger than yours." }
    ]
  },
  dragonborn: {
    name: "Dragonborn",
    description: "Dragonborn are powerful and proud, with draconic ancestry and breath weapons.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { strength: 2, charisma: 1 },
    languages: ["Common", "Draconic"],
    traits: [
      { name: "Draconic Ancestry", description: "You have a draconic ancestry that determines your damage type and some of your other traits." },
      { name: "Breath Weapon", description: "You can use an action to exhale destructive energy. Your race determines the size, shape, and damage type of the exhalation." },
      { name: "Damage Resistance", description: "You have resistance to a damage type determined by your Draconic Ancestry." }
    ]
  },
  gnome: {
    name: "Gnome",
    description: "Gnomes are inventive and curious, with natural magic affinity.",
    size: "Small",
    speed: 25,
    abilityScoreIncrease: { intelligence: 2 },
    darkvision: true,
    languages: ["Common", "Gnomish"],
    traits: [
      { name: "Gnome Cunning", description: "You have advantage on Intelligence, Wisdom, and Charisma saving throws against magic." },
      { name: "Natural Illusionist", description: "You know the minor illusion cantrip. Intelligence is your spellcasting ability for it." }
    ]
  },
  "half-elf": {
    name: "Half-Elf",
    description: "Half-elves combine the best traits of humans and elves.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { charisma: 2 },
    darkvision: true,
    languages: ["Common", "Elvish"],
    traits: [
      { name: "Fey Ancestry", description: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
      { name: "Skill Versatility", description: "You gain proficiency in two skills of your choice." }
    ]
  },
  "half-orc": {
    name: "Half-Orc",
    description: "Half-orcs are tough and fierce, combining human versatility with orcish strength.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { strength: 2, constitution: 1 },
    darkvision: true,
    languages: ["Common", "Orc"],
    traits: [
      { name: "Darkvision", description: "You can see in dim light within 60 feet of you as if it were bright light." },
      { name: "Menacing", description: "You gain proficiency in the Intimidation skill." },
      { name: "Relentless Endurance", description: "When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can't use this feature again until you finish a long rest." },
      { name: "Savage Attacks", description: "When you score a critical hit with a melee weapon attack, you can roll one of the weapon's damage dice one additional time and add it to the extra damage of the critical hit." }
    ]
  },
  tiefling: {
    name: "Tiefling",
    description: "Tieflings have infernal heritage, with natural magic abilities.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { charisma: 2, intelligence: 1 },
    darkvision: true,
    languages: ["Common", "Infernal"],
    traits: [
      { name: "Hellish Resistance", description: "You have resistance to fire damage." },
      { name: "Darkvision", description: "You can see in dim light within 60 feet of you as if it were bright light." },
      { name: "Infernal Legacy", description: "You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell once with this feature and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for it." }
    ]
  }
};
