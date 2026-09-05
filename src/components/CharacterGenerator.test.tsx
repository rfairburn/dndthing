import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import CharacterGenerator from './CharacterGenerator';
import { BACKGROUNDS } from '../data/backgrounds';
import type { Character } from '../types';

/**
 * Integration tests for the real CharacterGenerator component using real
 * scraped data. Only window.alert is mocked. The BACKGROUNDS import is used
 * solely to compare against the same scraped dataset the component consumes;
 * expectations never re-implement component initialization logic.
 */

const SAVED_CHARACTER_KEY = 'dnd_character';

function readSavedCharacter(): Character {
  const raw = localStorage.getItem(SAVED_CHARACTER_KEY);
  expect(raw, 'expected a saved character snapshot in localStorage').toBeTruthy();
  return JSON.parse(raw as string) as Character;
}

function nextButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement;
}

function expectNextDisabled(disabled: boolean) {
  expect(nextButton().disabled).toBe(disabled);
}

async function advanceSteps(user: UserEvent, count: number) {
  for (let i = 0; i < count; i++) {
    await user.click(nextButton());
  }
}

async function completeNameAndSpeciesSteps(user: UserEvent, name: string) {
  await user.type(screen.getByPlaceholderText(/enter your character's name/i), name);
  expectNextDisabled(false);
  await user.click(nextButton()); // -> species

  await user.click(screen.getByRole('button', { name: /^Dwarf/ }));
  expectNextDisabled(false);
  await user.click(nextButton()); // -> background
}

/** The ability-score selection card for one ability (contains the array buttons). */
function abilityScoreCard(ability: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: ability });
  const card = heading.closest('div');
  if (!card) throw new Error(`No ability card found for ${ability}`);
  return card;
}

/** The background-bonus counter panel for one ability (contains +/- buttons). */
function backgroundBonusPanel(ability: string): HTMLElement {
  const labels = screen.getAllByText(new RegExp(`^${ability}$`, 'i'));
  const panel = labels
    .map((label) => label.parentElement)
    .find(
      (parent) =>
        parent &&
        Array.from(parent.querySelectorAll('button')).some((button) => button.textContent === '+'),
    );
  if (!panel) throw new Error(`No background bonus panel found for ${ability}`);
  return panel;
}

async function addBackgroundBonus(user: UserEvent, ability: string, times: number) {
  const plus = within(backgroundBonusPanel(ability)).getByRole('button', { name: '+' });
  for (let i = 0; i < times; i++) {
    await user.click(plus);
  }
}

async function saveCharacter(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: 'Save Character' }));
}

describe('CharacterGenerator integration', () => {
  let alertSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.clear();
  });

  it('gates progression behind entering a name and selecting a species', async () => {
    const user = userEvent.setup();
    render(<CharacterGenerator />);

    // Name step: Next is disabled until a name is typed.
    expectNextDisabled(true);
    await user.type(screen.getByPlaceholderText(/enter your character's name/i), 'Berrian');
    expectNextDisabled(false);
    await user.click(nextButton());

    // Species step: Next is disabled until a species card is clicked.
    expect(screen.getByRole('heading', { name: 'Choose Your Species' })).toBeTruthy();
    expectNextDisabled(true);
    await user.click(screen.getByRole('button', { name: /^Dwarf/ }));
    expectNextDisabled(false);
    await user.click(nextButton());

    expect(screen.getByRole('heading', { name: 'Choose Your Background' })).toBeTruthy();
  });

  it('applies a standard-array swap and background bonuses exactly once in review and save', async () => {
    const user = userEvent.setup();
    render(<CharacterGenerator />);

    await completeNameAndSpeciesSteps(user, 'Vex');

    // Pick the Criminal background (Dexterity/Constitution/Intelligence bonuses).
    await user.click(screen.getByRole('button', { name: /Criminal/ }));
    await user.click(nextButton()); // -> ability scores

    // Standard-array swap: give Dexterity the 15 (Strength gets the 14 in exchange).
    await user.click(within(abilityScoreCard('dexterity')).getByRole('button', { name: '15' }));

    // Distribute background bonuses: +2 Dexterity, +1 Constitution.
    await addBackgroundBonus(user, 'dexterity', 2);
    await addBackgroundBonus(user, 'constitution', 1);

    await advanceSteps(user, 5); // -> class, subclass, spells, inventory, review
    expect(screen.getByRole('heading', { name: 'Character Summary' })).toBeTruthy();

    // Review shows the bonus-boosted total exactly once: Dex 15 base + 2 = 17.
    expect(screen.getAllByText('17')).toHaveLength(1);

    await saveCharacter(user);
    expect(alertSpy).toHaveBeenCalledWith('Character saved!');

    const saved = readSavedCharacter();
    // Exact snapshot: swapped array plus each background bonus applied once
    // (a double-applied Dex bonus would yield 19, a missing swap yields 15).
    expect(saved.abilityScores).toEqual({
      strength: 14,
      dexterity: 17,
      constitution: 14,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    });
  });

  it('does not retain old skills or duplicate background features when switching backgrounds', async () => {
    const user = userEvent.setup();
    render(<CharacterGenerator />);

    await completeNameAndSpeciesSteps(user, 'Thokk');

    // Select Acolyte first, then switch to Criminal.
    await user.click(screen.getByRole('button', { name: /Acolyte/ }));
    await user.click(screen.getByRole('button', { name: /Criminal/ }));
    await user.click(nextButton());

    await advanceSteps(user, 5); // -> class, subclass, spells, inventory, review
    await saveCharacter(user);

    const saved = readSavedCharacter();
    const savedSkills = saved.skillProficiencies.map((entry) => entry.skill);

    // Criminal's skills replaced Acolyte's; none of Acolyte's remain.
    expect(savedSkills.sort()).toEqual([...BACKGROUNDS.criminal.skillProficiencies].sort());
    for (const staleSkill of BACKGROUNDS.acolyte.skillProficiencies) {
      expect(savedSkills).not.toContain(staleSkill);
    }

    // Empty placeholder background features are intentionally omitted by the
    // UI cleanup, and the scraped dataset carries no real background feature,
    // so switching must leave none — never a blank or duplicated entry.
    const backgroundFeatures = saved.featuresAndClasses.filter(
      (feature) => feature.source === 'background',
    );
    expect(backgroundFeatures).toEqual([]);
  });

  it('clears wizard cantrips and spellbook when switching to Fighter', async () => {
    const user = userEvent.setup();
    render(<CharacterGenerator />);

    await completeNameAndSpeciesSteps(user, 'Morden');
    await advanceSteps(user, 2); // -> class step (background/abilities left at defaults)

    // Choose Wizard: cantrips and spellbook initialize from real spell data.
    await user.click(screen.getByRole('button', { name: /^wizard/i }));
    await advanceSteps(user, 4); // -> subclass, spells, inventory, review
    await saveCharacter(user);

    let saved = readSavedCharacter();
    // Wizard init grants 3 known cantrips plus a 6-spell level-1 spellbook.
    expect(saved.cantripsKnown).toHaveLength(3);
    expect(saved.wizardSpellbook).toHaveLength(6);

    // Go back to the class step and switch to Fighter.
    await user.click(screen.getByRole('button', { name: 'Class' }));
    await user.click(screen.getByRole('button', { name: /^fighter/i }));
    await advanceSteps(user, 4); // -> review again
    await saveCharacter(user);

    saved = readSavedCharacter();
    expect(saved.classData.class).toBe('fighter');
    expect(saved.cantripsKnown).toEqual([]);
    expect(saved.wizardSpellbook).toEqual([]);
  });
});
