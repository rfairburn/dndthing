import type { ClassType, School, SpellWithClasses } from "../types";
import rawSpellsData from "./spells.json";

/** Shape of each entry in spells.json as scraped from dnd2024.wikidot.com. */
type RawSpell = Omit<SpellWithClasses, "school" | "classes"> & {
  school: string;
  classes: string[];
};

const SPELL_CLASSES: ClassType[] = [
  "artificer",
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard"
];

const isClassType = (value: string): value is ClassType =>
  SPELL_CLASSES.includes(value as ClassType);

const SPELLS: SpellWithClasses[] = (rawSpellsData as RawSpell[]).map(spell => ({
  ...spell,
  school: spell.school as School,
  classes: spell.classes.filter(isClassType)
}));

export const SPELLS_BY_CLASS: Record<ClassType, SpellWithClasses[]> = SPELL_CLASSES.reduce(
  (acc, cls) => {
    acc[cls] = [];
    return acc;
  },
  {} as Record<ClassType, SpellWithClasses[]>
);

// Populate each class bucket exactly once with only the spells that list the
// class, so no class array ever holds a copy of the full spell list.
for (const spell of SPELLS) {
  for (const cls of spell.classes) {
    SPELLS_BY_CLASS[cls].push(spell);
  }
}

export function getSpellsForClass(cls: ClassType): SpellWithClasses[] {
  return SPELLS_BY_CLASS[cls];
}
