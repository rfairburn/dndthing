import type { SpellWithClasses, ClassType } from "../types";
import rawSpellsData from "./spells.json";

export const SPELLS_BY_CLASS: Record<ClassType, (SpellWithClasses & { classes: ClassType[] })[]> = {
  artificer: [],
  barbarian: [],
  bard: [],
  cleric: [],
  druid: [],
  fighter: [],
  monk: [],
  paladin: [],
  ranger: [],
  rogue: [],
  sorcerer: [],
  warlock: [],
  wizard: []
};

(rawSpellsData as any[]).forEach(spell => {
  SPELLS_BY_CLASS.artificer.push(spell);
  SPELLS_BY_CLASS.barbarian.push(spell);
  SPELLS_BY_CLASS.bard.push(spell);
  SPELLS_BY_CLASS.cleric.push(spell);
  SPELLS_BY_CLASS.druid.push(spell);
  SPELLS_BY_CLASS.fighter.push(spell);
  SPELLS_BY_CLASS.monk.push(spell);
  SPELLS_BY_CLASS.paladin.push(spell);
  SPELLS_BY_CLASS.ranger.push(spell);
  SPELLS_BY_CLASS.rogue.push(spell);
  SPELLS_BY_CLASS.sorcerer.push(spell);
  SPELLS_BY_CLASS.warlock.push(spell);
  SPELLS_BY_CLASS.wizard.push(spell);
});

export function getSpellsForClass(cls: ClassType): (SpellWithClasses & { classes: ClassType[] })[] {
  return SPELLS_BY_CLASS[cls].filter(spell => spell.classes.includes(cls));
}
