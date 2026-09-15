/**
 * The onboarding tour waits for the 21+ age gate (it renders above every
 * modal) and never starts inside partner embeds. Before the delivery-window
 * pop-up was retired the tour waited on that pop-up, which never fired in
 * embeds — this keeps both behaviors now that only the age gate is awaited.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

const tourMock = vi.hoisted(() => ({ startTour: vi.fn(), isRunning: false }));
vi.mock('../useTour', () => ({ default: () => tourMock }));

import DashboardTour from '../DashboardTour';

// A small in-memory localStorage: the shared test setup's stand-in doesn't
// implement the whole Storage API, and the tour reads the age-gate flag from it.
let store: Map<string, string>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  tourMock.startTour.mockClear();
  store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
  window.history.replaceState({}, '', '/dashboard/ABC123');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.history.replaceState({}, '', '/');
});

describe('DashboardTour', () => {
  it('starts for a host once the age gate has been answered', () => {
    localStorage.setItem('age_verified', '1');
    render(<DashboardTour isHost hasPartyType shareCode="ABC123" />);

    vi.advanceTimersByTime(600);

    expect(tourMock.startTour).toHaveBeenCalledWith('welcome', expect.any(Array));
  });

  it('waits for the age gate before starting', () => {
    render(<DashboardTour isHost hasPartyType shareCode="ABC123" />);

    vi.advanceTimersByTime(2000);
    expect(tourMock.startTour).not.toHaveBeenCalled();

    localStorage.setItem('age_verified', '1');
    vi.advanceTimersByTime(1000);
    expect(tourMock.startTour).toHaveBeenCalledTimes(1);
  });

  it('never starts inside a partner embed', () => {
    localStorage.setItem('age_verified', '1');
    window.history.replaceState({}, '', '/dashboard/ABC123?embed=1');
    render(<DashboardTour isHost hasPartyType shareCode="ABC123" />);

    vi.advanceTimersByTime(2000);

    expect(tourMock.startTour).not.toHaveBeenCalled();
  });
});
