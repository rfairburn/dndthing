import { describe, expect, it } from 'vitest';
import { SPELLS_BY_CLASS, getSpellsForClass } from './spells';
import rawSpellsData from './spells.json';

/** Minimal shape of each spells.json entry needed for the independent checks. */
type RawJsonSpell = { name: string; classes: string[] };
const rawSpells = rawSpellsData as unknown as RawJsonSpell[];

/**
 * Tests for the real spell index built from the real scraped spells.json.
 * Expected values are independent, representative facts (specific known
 * spell/class pairs and cantrip levels) plus a full ordered membership check
 * derived directly from the raw JSON, not copies of the indexing loop.
 */

const ALL_CLASSES = Object.keys(SPELLS_BY_CLASS) as (keyof typeof SPELLS_BY_CLASS)[];

describe('SPELLS_BY_CLASS index', () => {
  it('covers exactly the 13 playable classes', () => {
    expect(ALL_CLASSES).toHaveLength(13);
    expect(ALL_CLASSES).toEqual(
      expect.arrayContaining([
        'artificer',
        'barbarian',
        'bard',
        'cleric',
        'druid',
        'fighter',
        'monk',
        'paladin',
        'ranger',
        'rogue',
        'sorcerer',
        'warlock',
        'wizard'
      ])
    );
  });

  it('holds representative class spells with their raw spell attributes', () => {
    const fireball = SPELLS_BY_CLASS.wizard.find(spell => spell.name === 'Fireball');
    expect(fireball).toBeDefined();
    expect(fireball!.level).toBe(3);
    expect(fireball!.school).toBe('evocation');
    expect(fireball!.classes).toContain('wizard');
    expect(fireball!.classes).toContain('sorcerer');
  });

  it('keeps cantrips at level 0 inside class buckets', () => {
    const acidSplash = SPELLS_BY_CLASS.wizard.find(spell => spell.name === 'Acid Splash');
    expect(acidSplash).toBeDefined();
    expect(acidSplash!.level).toBe(0);

    const eldritchBlast = SPELLS_BY_CLASS.warlock.find(spell => spell.name === 'Eldritch Blast');
    expect(eldritchBlast).toBeDefined();
    expect(eldritchBlast!.level).toBe(0);

    const everyRepresentativeCantripIsLevel0 = SPELLS_BY_CLASS.warlock
      .filter(spell => ['Acid Splash', 'Blade Ward', 'Chill Touch'].includes(spell.name))
      .every(spell => spell.level === 0);
    expect(everyRepresentativeCantripIsLevel0).toBe(true);
  });

  it('excludes representative spells from classes that do not cast them', () => {
    // Fireball (sorcerer/wizard only) must not appear in the cleric bucket.
    expect(SPELLS_BY_CLASS.cleric.some(spell => spell.name === 'Fireball')).toBe(false);
    // Eldritch Blast is warlock-only.
    expect(SPELLS_BY_CLASS.warlock.some(spell => spell.name === 'Eldritch Blast')).toBe(true);
    expect(SPELLS_BY_CLASS.cleric.some(spell => spell.name === 'Eldritch Blast')).toBe(false);
    // Guidance belongs to artificer/cleric/druid, not wizard.
    expect(SPELLS_BY_CLASS.wizard.some(spell => spell.name === 'Guidance')).toBe(false);
    expect(SPELLS_BY_CLASS.cleric.some(spell => spell.name === 'Guidance')).toBe(true);
  });

  it('places multi-class spells into every listed class bucket exactly once', () => {
    for (const cls of ['artificer', 'bard', 'cleric', 'druid', 'paladin', 'ranger'] as const) {
      const occurrences = SPELLS_BY_CLASS[cls].filter(spell => spell.name === 'Cure Wounds');
      expect(occurrences, `Cure Wounds in ${cls}`).toHaveLength(1);
      expect(occurrences[0].classes).toContain(cls);
    }
    expect(SPELLS_BY_CLASS.warlock.some(spell => spell.name === 'Cure Wounds')).toBe(false);
  });

  it('leaves non-caster class buckets empty', () => {
    // Barbarians, fighters, monks, and rogues have no class spell list in the
    // scraped dataset, so their buckets must be empty rather than copies of
    // the full spell list.
    for (const cls of ['barbarian', 'fighter', 'monk', 'rogue'] as const) {
      expect(SPELLS_BY_CLASS[cls], `${cls} bucket`).toEqual([]);
    }
  });

  it('does not duplicate the full list in any single bucket', () => {
    // Sanity bound: no bucket should ever hold a full-list copy; the wizard
    // list is the largest legitimate bucket and stays well under 411 spells.
    const largestBucket = Math.max(...ALL_CLASSES.map(cls => SPELLS_BY_CLASS[cls].length));
    expect(largestBucket).toBeLessThan(300);
  });
});

describe('getSpellsForClass', () => {
  it('returns the class bucket itself, not a copy', () => {
    for (const cls of ALL_CLASSES) {
      expect(getSpellsForClass(cls), `${cls} helper`).toBe(SPELLS_BY_CLASS[cls]);
    }
  });

  it('matches raw spells.json membership exactly, in order, for every class', () => {
    for (const cls of ALL_CLASSES) {
      const expectedNames = rawSpells
        .filter(spell => spell.classes.includes(cls))
        .map(spell => spell.name);
      expect(SPELLS_BY_CLASS[cls].map(spell => spell.name), `${cls} bucket`).toEqual(expectedNames);
    }
  });

  it('matches representative known spell lists per class', () => {
    const wizardSpells = getSpellsForClass('wizard').map(spell => spell.name);
    expect(wizardSpells).toContain('Fireball');
    expect(wizardSpells).toContain('Wish');
    expect(wizardSpells).toContain('Acid Splash');
    expect(wizardSpells).not.toContain('Cure Wounds');

    const paladinSpells = getSpellsForClass('paladin').map(spell => spell.name);
    expect(paladinSpells).toContain('Cure Wounds');
    expect(paladinSpells).not.toContain('Fireball');
    expect(paladinSpells).not.toContain('Wish');
    expect(paladinSpells).not.toContain('Acid Splash');

    const sorcererSpells = getSpellsForClass('sorcerer').map(spell => spell.name);
    expect(sorcererSpells).toContain('Fireball');
    expect(sorcererSpells).toContain('Wish');
    expect(sorcererSpells).not.toContain('Guidance');
  });

  it('returns non-caster classes an empty list', () => {
    expect(getSpellsForClass('barbarian')).toEqual([]);
    expect(getSpellsForClass('fighter')).toEqual([]);
  });
});
