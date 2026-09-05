import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Character } from '../types';
import InventoryManager from './InventoryManager';

const createCharacter = (): Character => ({
  id: 'test-character',
  name: 'Test Character',
  background: 'sage',
  classData: { class: 'wizard' },
  level: 1,
  experiencePoints: 0,
  abilityScores: {
    strength: 12,
    dexterity: 14,
    constitution: 13,
    intelligence: 16,
    wisdom: 10,
    charisma: 8,
  },
  proficiencyBonus: 2,
  ac: 10,
  speed: 30,
  hitPoints: { current: 8, max: 8, temporary: 0 },
  hitDice: { total: 1, value: '1d6' },
  initiativeModifier: 2,
  passiveWisdom: 10,
  savingThrows: [],
  skillProficiencies: [],
  armorProficiencies: [],
  weaponProficiencies: [],
  toolProficiencies: [],
  languages: ['Common'],
  traits: [],
  featuresAndClasses: [],
  actions: [],
  inventory: [],
  goldPieces: 17,
  platinumPieces: 3,
  electrumPieces: 5,
  silverPieces: 11,
  copperPieces: 7,
  knownSpells: [],
  cantripsKnown: [],
  wizardSpellbook: [],
});

function InventoryHarness({ initialCharacter }: { initialCharacter: Character }) {
  const [character, setCharacter] = useState(initialCharacter);

  return <InventoryManager character={character} setCharacter={setCharacter} />;
}

function getCurrencyRow(label: string): HTMLElement {
  const row = screen.getByText(label, { exact: true }).parentElement;
  if (!row) {
    throw new Error(`Currency row not found: ${label}`);
  }
  return row;
}

function getItemRow(name: string): HTMLElement {
  const row = screen.getByText(name, { exact: true }).parentElement?.parentElement;
  if (!row) {
    throw new Error(`Inventory item not found: ${name}`);
  }
  return row;
}

describe('InventoryManager', () => {
  it('adds quick gear and custom items through the controlled character callback', async () => {
    const user = userEvent.setup();
    render(<InventoryHarness initialCharacter={createCharacter()} />);

    await user.click(screen.getByRole('button', { name: /^Backpack$/ }));
    expect(screen.getAllByText('Backpack', { exact: true })).toHaveLength(2);

    const input = screen.getByPlaceholderText('Enter item name...');
    await user.type(input, 'Custom compass');
    await user.click(screen.getByRole('button', { name: /^Add Custom Item$/ }));

    expect(screen.getByText('Custom compass', { exact: true })).toBeTruthy();
    expect(within(getItemRow('Custom compass')).getByText('1')).toBeTruthy();

    expect(getCurrencyRow('Platinum (pp)').textContent).toContain('3');
    expect(getCurrencyRow('Gold (gp)').textContent).toContain('17');
    expect(getCurrencyRow('Electrum (ep)').textContent).toContain('5');
    expect(getCurrencyRow('Silver (sp)').textContent).toContain('11');
    expect(getCurrencyRow('Copper (cp)').textContent).toContain('7');
  });

  it('increments, decrements, and removes an inventory item', async () => {
    const user = userEvent.setup();
    render(<InventoryHarness initialCharacter={createCharacter()} />);

    await user.type(screen.getByPlaceholderText('Enter item name...'), 'Custom compass');
    await user.click(screen.getByRole('button', { name: /^Add Custom Item$/ }));

    let itemRow = getItemRow('Custom compass');
    await user.click(within(itemRow).getByRole('button', { name: /^\+$/ }));
    itemRow = getItemRow('Custom compass');
    expect(within(itemRow).getByText('2')).toBeTruthy();

    await user.click(within(itemRow).getByRole('button', { name: /^-$/ }));
    itemRow = getItemRow('Custom compass');
    expect(within(itemRow).getByText('1')).toBeTruthy();

    await user.click(within(itemRow).getByRole('button', { name: /^×$/ }));

    expect(screen.queryByText('Custom compass', { exact: true })).toBeNull();
    expect(screen.getByText('No items in inventory')).toBeTruthy();
    expect(getCurrencyRow('Gold (gp)').textContent).toContain('17');
  });
});