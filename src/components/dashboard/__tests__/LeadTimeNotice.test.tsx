/**
 * The dashboard's early refusal notice: shown only while a confirmed delivery
 * window is in the future but inside the 24-hour minimum (ADR-0010), so the
 * guest learns checkout is closed before building a cart, not at the pay button.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LeadTimeNotice, { isInsideLeadTime } from '../LeadTimeNotice';
import { DASHBOARD_LEAD_TIME_MESSAGE } from '@/lib/delivery/lead-time';

// Wed 2026-09-16 3:00 PM CDT. Thu noon is 21h out; Thu 3:00 PM is exactly 24h.
const NOW = new Date('2026-09-16T20:00:00.000Z');

function tab(overrides: Record<string, unknown> = {}) {
  return {
    status: 'OPEN' as const,
    deliveryDate: '2026-09-17T12:00:00.000Z',
    deliveryDateConfirmed: true,
    deliveryTime: '12:00 PM - 2:00 PM',
    ...overrides,
  };
}

describe('isInsideLeadTime', () => {
  it('is true for a window that starts in under 24 hours', () => {
    expect(isInsideLeadTime(tab(), NOW)).toBe(true);
  });

  it('is false at exactly 24 hours or more — checkout is still open', () => {
    expect(isInsideLeadTime(tab({ deliveryTime: '3:00 PM - 3:30 PM' }), NOW)).toBe(false);
  });

  it('is false once the window has started (the wording would be wrong)', () => {
    expect(
      isInsideLeadTime(tab({ deliveryDate: '2026-09-16T12:00:00.000Z', deliveryTime: '10:00 AM - 10:30 AM' }), NOW),
    ).toBe(false);
  });

  it('is false without a confirmed date', () => {
    expect(isInsideLeadTime(tab({ deliveryDateConfirmed: false }), NOW)).toBe(false);
    expect(isInsideLeadTime(tab({ deliveryDate: null }), NOW)).toBe(false);
  });
});

describe('LeadTimeNotice', () => {
  it('shows the dashboard cutoff message inside 24 hours', () => {
    render(<LeadTimeNotice tab={tab()} groupStatus="ACTIVE" now={NOW} />);
    expect(screen.getByText(DASHBOARD_LEAD_TIME_MESSAGE)).toBeInTheDocument();
    // No shortcut unless the page says this viewer can edit the tab.
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders nothing for a cancelled order or a fulfilled tab', () => {
    const cancelled = render(<LeadTimeNotice tab={tab()} groupStatus="CANCELLED" now={NOW} />);
    expect(cancelled.container).toBeEmptyDOMElement();
    const fulfilled = render(
      <LeadTimeNotice tab={tab({ status: 'FULFILLED' })} groupStatus="ACTIVE" now={NOW} />,
    );
    expect(fulfilled.container).toBeEmptyDOMElement();
  });

  it('gives a host a shortcut to move the delivery later', () => {
    const onChangeDelivery = vi.fn();
    render(
      <LeadTimeNotice tab={tab()} groupStatus="ACTIVE" onChangeDelivery={onChangeDelivery} now={NOW} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /later time/i }));
    expect(onChangeDelivery).toHaveBeenCalledTimes(1);
  });
});
