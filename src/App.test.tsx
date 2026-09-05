import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the character generator view by default', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /D&D 2024 SRD Character Generator/i }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Character Name' })).toBeTruthy();
    expect(screen.getByPlaceholderText(/enter your character's name/i)).toBeTruthy();
    expect(screen.queryByPlaceholderText(/search spells/i)).toBeNull();
  });

  it('navigates to the Reference Library and back', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Reference Library' }));
    expect(screen.getByPlaceholderText(/search spells/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Character Name' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Character Generator' }));
    expect(screen.getByRole('heading', { name: 'Character Name' })).toBeTruthy();
    expect(screen.queryByPlaceholderText(/search spells/i)).toBeNull();
  });
});
