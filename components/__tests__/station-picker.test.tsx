import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { StationPicker } from '../station-picker';
import { LanguageProvider } from '@/components/language-provider';

const mockResults = [
  { id: '1', name: 'Saarbrücken Hbf' },
  { id: '2', name: 'Mainz Hbf' },
  { id: '3', name: 'Kaiserslautern Hbf' },
];

beforeEach(() => {
  // @ts-expect-error - vitest global fetch mock
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(mockResults) })
  );
});

afterEach(() => {
  // @ts-expect-error - reset vitest mocks
  vi.resetAllMocks();
});

test('keyboard navigation selects and activates options', async () => {
  const onNavigate = vi.fn();
  render(
    <LanguageProvider>
      <StationPicker onNavigate={onNavigate} />
    </LanguageProvider>
  );

  const input = screen.getByRole('searchbox');
  await userEvent.type(input, 'Sa');

  // wait for results to appear
  await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());

  // ArrowDown -> first item
  await userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('option', { selected: true })).toHaveAttribute(
    'id',
    'station-option-1'
  );

  // ArrowDown -> second item
  await userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('option', { selected: true })).toHaveAttribute(
    'id',
    'station-option-2'
  );

  // Enter should attempt to navigate
  await userEvent.keyboard('{Enter}');
  expect(onNavigate).toHaveBeenCalledWith('/station/2?name=Mainz%20Hbf');
});
