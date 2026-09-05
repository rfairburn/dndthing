import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReferenceLibrary from './ReferenceLibrary';

describe('ReferenceLibrary', () => {
  it('searches spells and filters them by class', async () => {
    const user = userEvent.setup();
    render(<ReferenceLibrary />);

    const search = screen.getByPlaceholderText('Search spells...');
    await user.type(search, 'Druidcraft');

    expect(screen.getByRole('heading', { name: /^Druidcraft$/ })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Wizard$/ }));

    expect(screen.queryByRole('heading', { name: /^Druidcraft$/ })).toBeNull();
    expect(screen.getByText('No spells found matching your criteria.')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Druid$/ }));

    expect(screen.getByRole('heading', { name: /^Druidcraft$/ })).toBeTruthy();
  });

  it('filters searched spells by level and shows an empty state', async () => {
    const user = userEvent.setup();
    render(<ReferenceLibrary />);

    const search = screen.getByPlaceholderText('Search spells...');
    await user.type(search, 'magic ');
    await user.click(screen.getByRole('button', { name: /^Wizard$/ }));

    expect(screen.getByRole('heading', { name: /^Magic Missile$/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /^Magic Weapon$/ })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Level 1$/ }));

    expect(screen.getByRole('heading', { name: /^Magic Missile$/ })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /^Magic Weapon$/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: /^Level 2$/ }));

    expect(screen.queryByRole('heading', { name: /^Magic Missile$/ })).toBeNull();
    expect(screen.getByRole('heading', { name: /^Magic Weapon$/ })).toBeTruthy();

    await user.clear(search);
    await user.type(search, 'not-a-real-spell');

    expect(screen.getByText('No spells found matching your criteria.')).toBeTruthy();
  });
});