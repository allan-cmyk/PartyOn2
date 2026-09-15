/**
 * The dashboard's checkout-cutoff notice (ADR-0010): a "closes at" heads-up
 * when the cutoff is less than a day away, the refusal message once the
 * delivery is inside 24 hours, and nothing for paid-up tabs — with the
 * "move it later" shortcut only for a host on a tab nobody has paid on.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LeadTimeNotice, { leadTimeState } from '../LeadTimeNotice';
import { DASHBOARD_LEAD_TIME_MESSAGE } from '@/lib/delivery/lead-time';

// Wed 2026-09-16 3:00 PM CDT. Thu noon is 21h out; Thu 3:00 PM is exactly 24h.
const NOW = new Date('2026-09-16T20:00:00.000Z');

function tab(overrides: Record<string, unknown> = {}) {
  return {
    status: 'OPEN' as const,
    deliveryDate: '2026-09-17T12:00:00.000Z',
    deliveryDateConfirmed: true,
    deliveryTime: '12:00 PM - 2:00 PM',
    draftItems: [],
    purchasedItems: [],
    ...overrides,
  };
}

describe('leadTimeState', () => {
  it('is closed for a window that starts in under 24 hours', () => {
    expect(leadTimeState(tab(), NOW)).toBe('closed');
  });

  it('is still open (closing) at exactly 24 hours, matching the checkout gate', () => {
    expect(leadTimeState(tab({ deliveryTime: '3:00 PM - 3:30 PM' }), NOW)).toBe('closing');
  });

  it('is closing when the cutoff is less than a day away', () => {
    expect(leadTimeState(tab({ deliveryTime: '8:30 PM - 9:00 PM' }), NOW)).toBe('closing');
  });

  it('is quiet when the cutoff is more than a day away', () => {
    expect(
      leadTimeState(tab({ deliveryDate: '2026-09-18T12:00:00.000Z', deliveryTime: '4:00 PM - 4:30 PM' }), NOW),
    ).toBeNull();
  });

  it('is quiet once the window has started, or without a confirmed date', () => {
    expect(
      leadTimeState(tab({ deliveryDate: '2026-09-16T12:00:00.000Z', deliveryTime: '10:00 AM - 10:30 AM' }), NOW),
    ).toBeNull();
    expect(leadTimeState(tab({ deliveryDateConfirmed: false }), NOW)).toBeNull();
    expect(leadTimeState(tab({ deliveryDate: null }), NOW)).toBeNull();
  });
});

describe('LeadTimeNotice', () => {
  it('shows the refusal message inside 24 hours', () => {
    render(<LeadTimeNotice tab={tab()} groupStatus="ACTIVE" now={NOW} />);
    expect(screen.getByText(DASHBOARD_LEAD_TIME_MESSAGE)).toBeInTheDocument();
    // No shortcut unless the page says this viewer can edit the tab.
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('says when ordering closes while the cutoff is still ahead', () => {
    render(
      <LeadTimeNotice tab={tab({ deliveryTime: '8:30 PM - 9:00 PM' })} groupStatus="ACTIVE" now={NOW} />,
    );
    // Thu 8:30 PM delivery → online ordering closes Wed 8:30 PM (Austin).
    expect(
      screen.getByText(/Online ordering for this delivery closes Wed, 8:30\sPM CDT — 24 hours before delivery\./),
    ).toBeInTheDocument();
  });

  it('renders nothing for a cancelled order, a fulfilled tab, or a fully paid tab', () => {
    const cancelled = render(<LeadTimeNotice tab={tab()} groupStatus="CANCELLED" now={NOW} />);
    expect(cancelled.container).toBeEmptyDOMElement();
    const fulfilled = render(
      <LeadTimeNotice tab={tab({ status: 'FULFILLED' })} groupStatus="ACTIVE" now={NOW} />,
    );
    expect(fulfilled.container).toBeEmptyDOMElement();
    const paid = render(
      <LeadTimeNotice tab={tab({ purchasedItems: [{ id: 'p1' }] })} groupStatus="ACTIVE" now={NOW} />,
    );
    expect(paid.container).toBeEmptyDOMElement();
  });

  it('gives a host a shortcut to move an unpaid delivery later', () => {
    const onChangeDelivery = vi.fn();
    render(
      <LeadTimeNotice tab={tab()} groupStatus="ACTIVE" onChangeDelivery={onChangeDelivery} now={NOW} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /later time/i }));
    expect(onChangeDelivery).toHaveBeenCalledTimes(1);
  });

  it('never offers to move a delivery someone has already paid for', () => {
    render(
      <LeadTimeNotice
        tab={tab({ purchasedItems: [{ id: 'p1' }], draftItems: [{ id: 'd1' }] })}
        groupStatus="ACTIVE"
        onChangeDelivery={vi.fn()}
        now={NOW}
      />,
    );
    // Unpaid items remain, so the message still shows — but no shortcut.
    expect(screen.getByText(DASHBOARD_LEAD_TIME_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
