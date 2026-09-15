/**
 * The chat's date picker starts at the first day with a delivery window 24+
 * hours out (ADR-0010) and points rushes at a call or text — the retired
 * "today and tomorrow are fair game / 24-hr menu" copy must stay gone.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/leads/client', () => ({ sendLeadEvent: vi.fn() }));
vi.mock('@/lib/analytics/attribution', () => ({ getAttribution: vi.fn(() => undefined) }));

import PartyChat from '../PartyChat';
import { RUSH_NOTE } from '@/lib/delivery/lead-time';

// Wed 2026-09-16 8:31 PM CDT: none of Thursday's windows are 24h out any
// more, so the picker must start on Friday the 18th.
const NOW = new Date('2026-09-17T01:31:00.000Z');

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PartyChat date step', () => {
  it('starts the picker at the earliest bookable day and shows the rush note', () => {
    const { container } = render(<PartyChat isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /order drinks now/i }));

    const input = container.querySelector<HTMLInputElement>('input[type="date"]');
    expect(input).not.toBeNull();
    expect(input?.min).toBe('2026-09-18');
    expect(screen.getByText(RUSH_NOTE)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/today and tomorrow|24-hr menu|deep in stock/i);
  });
});
