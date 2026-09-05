/**
 * Typed record shapes produced by the scraper's page parsers.
 *
 * These types describe exactly what the in-page extraction callbacks return;
 * the scrapers serialize these records straight into the `src/data/*.json`
 * datasets, so the shapes must stay in sync with the parsers.
 */

/** V/S/M component flags extracted from a spell's components line. */
export interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
}

/** One spell page record (`src/data/spells.json`). */
export interface SpellRecord {
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components: SpellComponents;
  duration?: string;
  description?: string;
  classes: string[];
  atHigherLevels?: string;
}

/** One subclass page record (`src/data/subclasses.json`). */
export interface SubclassRecord {
  name: string;
  description?: string;
  source?: string;
}

/** One feat page record (`src/data/feats.json`). */
export interface FeatRecord {
  name: string;
  description?: string;
  source?: string;
}

/** One background page record (`src/data/backgrounds.json`). */
export interface BackgroundRecord {
  name: string;
  source?: string;
  abilityScores?: string[];
  feat?: string;
  skillProficiencies?: string[];
  toolProficiency?: string[];
  equipment?: string;
  description?: string;
}

/** One named species trait. */
export interface SpeciesTrait {
  name: string;
  description: string;
}

/** One species page record (`src/data/species.json`). */
export interface SpeciesRecord {
  name: string;
  source?: string;
  creatureType?: string;
  speed?: number;
  traits?: SpeciesTrait[];
  description?: string;
  sizeDescription?: string;
  sizes?: string[];
}

/** One class feature entry keyed by level. */
export interface ClassFeature {
  level: number;
  name: string;
  description: string;
}

/** One class page record (`src/data/classes.json`). */
export interface ClassRecord {
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

/**
 * Window shape augmented with the `__name` keep-names shim that tsx (esbuild)
 * expects in the page context: compiled `page.evaluate` callbacks may call it
 * to preserve function names. The scraper predefines it as an identity
 * function because page JavaScript is disabled during parsing.
 */
export type NameShimWindow = Window & {
  __name?: <T>(fn: T) => T;
};
