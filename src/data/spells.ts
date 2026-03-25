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
  spell.classes.forEach((cls: ClassType) => {
    if (SPELLS_BY_CLASS[cls]) {
      SPELLS_BY_CLASS[cls].push(spell);
    }
  });
});

export function getSpellsForClass(cls: ClassType): (SpellWithClasses & { classes: ClassType[] })[] {
  return SPELLS_BY_CLASS[cls];
}
