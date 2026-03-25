export interface AbilityScore {
  name: string;
  modifier: number;
}

export interface Character {
  id: string;
  name: string;
  playerName?: string;
  species?: Species;
  selectedSize?: "Small" | "Medium";
  background: Background;
  classData: ClassEntry;
  level: number;
  experiencePoints: number;
  abilityScores: AbilityScores;
  proficiencyBonus: number;
  ac: number;
  speed: number;
  hitPoints: {
    current: number;
    max: number;
    temporary: number;
  };
  hitDice: {
    total: number;
    value: string; // e.g., "8d8"
  };
  initiativeModifier: number;
  passiveWisdom: number;
  savingThrows: SavingThrowProficiency[];
  skillProficiencies: SkillProficiency[];
  armorProficiencies: ArmorProficiency[];
  weaponProficiencies: WeaponProficiency[];
  toolProficiencies: ToolProficiency[];
  languages: string[];
  traits: CharacterTrait[];
  featuresAndClasses: Feature[];
  actions: Action[];
  inventory: Item[];
  goldPieces: number;
  platinumPieces: number;
  electrumPieces: number;
  silverPieces: number;
  copperPieces: number;
  knownSpells: string[]; // spell names (prepared spells for wizard, known spells for others)
  cantripsKnown: string[]; // spell names
  wizardSpellbook: string[]; // all spells in wizard's spellbook (separate from prepared)
  notes?: string;
}

export interface SpellWithClasses {
  name: string;
  level: number;
  school: School;
  castingTime: string;
  range: string;
  components: Components;
  duration: string;
  description: string;
  atHigherLevels?: string;
  targets?: string;
  classes: ClassType[];
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type Species = 
  | "aasimar" 
  | "boggart" 
  | "changeling" 
  | "dhampir" 
  | "dragonborn" 
  | "dwarf" 
  | "elf" 
  | "faerie" 
  | "flamekin" 
  | "gnome" 
  | "goliath" 
  | "halfling" 
  | "human" 
  | "kalashtar" 
  | "khoravar" 
  | "lorwyn-changeling" 
  | "orc" 
  | "rimekin" 
  | "shifter" 
  | "tiefling" 
  | "warforged";

export interface CharacterTrait {
  name: string;
  description: string;
}

export type Background = 
  | "acolyte" 
  | "criminal" 
  | "entertainer" 
  | "folk_hero" 
  | "guild_artisan" 
  | "hermit" 
  | "noble" 
  | "outlander" 
  | "sage" 
  | "sailor" 
  | "soldier" 
  | "urchin";

export interface BackgroundData {
  name: string;
  description: string;
  source?: string;
  abilityScores?: string[];
  feat?: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  equipment: string[];
  feature: {
    name: string;
    description: string;
  };
}

export type ClassType = 
  | "artificer" 
  | "barbarian" 
  | "bard" 
  | "cleric" 
  | "druid" 
  | "fighter" 
  | "monk" 
  | "paladin" 
  | "ranger" 
  | "rogue" 
  | "sorcerer" 
  | "warlock" 
  | "wizard";

export interface ClassEntry {
  class: ClassType;
  subclass?: Subclass;
}

export type Subclass = 
  // Artificer (4)
  | "artificer_armorer" 
  | "artificer_alchemist" 
  | "artificer_battle_smith"
  | "artificer_mystic"
  // Barbarian (4)
  | "barbarian_path_of_the_beast" 
  | "barbarian_path_of_the_berserker" 
  | "barbarian_path_of_wild_magic"
  | "barbarian_path_of_the_totem_warrior"
  // Bard (4)
  | "bard_college_of_creation" 
  | "bard_college_of_glamour" 
  | "bard_college_of_lore"
  | "bard_college_of_valor"
  // Cleric (4)
  | "cleric_domain_of_life" 
  | "cleric_domain_of_light" 
  | "cleric_domain_of_trickery"
  | "cleric_domain_of_war"
  // Druid (4)
  | "druid_circle_of_the_land" 
  | "druid_circle_of_the_moon" 
  | "druid_circle_of_wildfire"
  | "druid_circle_of_stars"
  // Fighter (4)
  | "fighter_champion" 
  | "fighter_eldritch_knight" 
  | "fighter_battle_master"
  | "fighter_rune_knight"
  // Monk (4)
  | "monk_way_of_the_open_hand" 
  | "monk_way_of_shadow" 
  | "monk_way_of_the_ascendant_dragon"
  | "monk_way_of_mercy"
  // Paladin (4)
  | "paladin_oath_of_devotion" 
  | "paladin_oath_of_the_ancients" 
  | "paladin_oath_of_vengeance"
  | "paladin_oath_of_conquest"
  // Ranger (4)
  | "ranger_beast_master" 
  | "ranger_fey_wanderer" 
  | "ranger_gloom_stalker"
  | "ranger_hunter"
  // Rogue (4)
  | "rogue_thief" 
  | "rogue_assassin" 
  | "rogue_arcane_trickster"
  | "rogue_soulknife"
  // Sorcerer (4)
  | "sorcerer_draconic_bloodline" 
  | "sorcerer_wild_magic" 
  | "sorcerer_aberrant_mind"
  | "sorcerer_storm_sorcery"
  // Warlock (4)
  | "warlock_the_fiend" 
  | "warlock_the_archfey" 
  | "warlock_the_great_old_one"
  | "warlock_the_celestial"
  // Wizard (4)
  | "wizard_school_of_abjuration" 
  | "wizard_school_of_divination" 
  | "wizard_school_of_evocation"
  | "wizard_school_of_illusion";

export interface SpellcastingInfo {
  cantripsKnown?: number[];
  spellsKnown?: number[];
  spellsPrepared?: (abilityMod: number, level: number) => number;
  spellSlots: Record<string, number[]>;
}

export interface ClassData {
  class: ClassType;
  hitDie: number;
  primaryAbility: string;
  savingThrows: string[];
  armorProficiencies: ArmorProficiency[];
  weaponProficiencies: WeaponProficiency[];
  toolProficiencies?: ToolProficiency[];
  startingEquipment: StartingEquipment[];
  classFeatures: ClassFeature[];
  spellcastingInfo?: SpellcastingInfo;
}

export interface StartingEquipment {
  item: string;
  quantity?: number;
  costInGoldPieces?: number;
  choose?: {
    from: string[];
    count: number;
  };
}

export interface ClassFeature {
  level: number;
  name: string;
  description: string;
}

export type ArmorProficiency = 
  | "light_armor" 
  | "medium_armor" 
  | "heavy_armor" 
  | "shields"
  | "all_armor_types"
  | "non_metal_shields";

export type WeaponProficiency = 
  | "simple_melee_weapons" 
  | "martial_melee_weapons" 
  | "simple_ranged_weapons" 
  | "martial_ranged_weapons"
  | "simple_weapons"
  | "martial_weapons"
  | "clubs"
  | "darts"
  | "javelins"
  | "maces"
  | "quarterstaffs"
  | "scimitars"
  | "sickles"
  | "slings"
  | "spears"
  | "shortswords"
  | "hand_crossbows"
  | "longswords"
  | "rapiers"
  | "daggers"
  | "light_crossbows";

export type ToolProficiency = string; // e.g., "thieves' tools", "healer's kit"

export interface SavingThrowProficiency {
  ability: string;
  proficient: boolean;
}

export interface SkillProficiency {
  skill: string;
  proficient: boolean;
}

export interface Feature {
  name: string;
  description: string;
  level?: number;
  source: "class" | "species" | "background" | "feat";
}

export type Action = 
  | "attack" 
  | "cast_a_spell" 
  | "dash" 
  | "disengage" 
  | "dodge" 
  | "help" 
  | "hide" 
  | "use_an_object" 
  | "prepare_or_douse_a_torch" 
  | "pull_unarmed_strike" 
  | "push" 
  | "read_a_scroll" 
  | "search" 
  | "seek" 
  | "tune_in_to_the_ether" 
  | "wait";

export interface ActionData {
  name: Action;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  weight?: number; // in pounds
  costInGoldPieces?: number;
  category: "weapon" | "armor" | "adventure_gear" | "spellcasting_focus" | "food_and_drink" | "gold";
  properties?: string[];
  damage?: {
    die: number;
    type: "bludgeoning" | "piercing" | "slashing";
  };
}

export interface Spell {
  name: string;
  level: number; // 0-9, or 0 for cantrip
  school: School;
  castingTime: string;
  range: string;
  components: Components;
  duration: string;
  description: string;
  atHigherLevels?: string;
  targets?: string;
}

export type School = 
  | "abjuration" 
  | "conjuration" 
  | "divination" 
  | "enchantment" 
  | "evocation" 
  | "illusion" 
  | "necromancy" 
  | "transmutation";

export interface Components {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialCost?: number;
}

export type SpellcastingAbility = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export interface Feat {
  name: string;
  description: string;
  prerequisites?: Prerequisite[];
  benefits: string[];
  source?: string;
}

export interface Prerequisite {
  abilityScore: string;
  minimum: number;
}

export interface SubclassData {
  name: string;
  description: string;
  source: string;
}
