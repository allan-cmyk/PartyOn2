/**
 * Rush requests (inside the 24-hour minimum): the lead is tagged `rush`, the
 * request is stamped, and the operator is emailed — once per lead and day
 * within 6 hours — without ever throwing into the customer's response.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  lead: { findUnique: vi.fn(), update: vi.fn() },
}));
vi.mock('@/lib/database/client', () => ({ prisma: prismaMock }));

const emailMock = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend-client', () => emailMock);

import {
  RUSH_LEAD_TAG,
  buildRushAlertEmail,
  recordRushRequest,
  type RushRequestInput,
} from '../rush-request';

const NOW = new Date('2026-09-16T20:00:00.000Z');
const HOUR = 60 * 60 * 1000;

const INPUT: RushRequestInput = {
  leadId: 'lead-1',
  source: 'package-builder',
  deliveryDate: '2026-09-16',
  partyType: 'bachelorette',
  headcount: 12,
  firstName: 'Sam',
  lastName: 'Rivera',
  email: 'sam@example.com',
  phone: '512-555-0100',
};

beforeEach(() => {
  vi.clearAllMocks();
  emailMock.sendEmail.mockResolvedValue('resend-id');
  prismaMock.lead.update.mockResolvedValue({});
});

describe('recordRushRequest', () => {
  it('tags the lead, stamps the request, and emails the operator', async () => {
    prismaMock.lead.findUnique
      .mockResolvedValueOnce({ tags: ['vip'], metadata: { unifiedQuote: { source: 'package-builder' } } })
      .mockResolvedValueOnce({
        metadata: {
          unifiedQuote: { source: 'package-builder' },
          rushRequest: { deliveryDate: '2026-09-16', source: 'package-builder', requestedAt: NOW.toISOString() },
        },
      });

    await recordRushRequest(INPUT, NOW);

    const stamp = prismaMock.lead.update.mock.calls[0][0];
    expect(stamp.where).toEqual({ id: 'lead-1' });
    expect(stamp.data.tags).toEqual(['vip', RUSH_LEAD_TAG]);
    expect(stamp.data.metadata).toMatchObject({
      unifiedQuote: { source: 'package-builder' },
      rushRequest: { deliveryDate: '2026-09-16', source: 'package-builder', requestedAt: NOW.toISOString() },
    });
    expect(emailMock.sendEmail).toHaveBeenCalledTimes(1);

    // After the send, the alert time is stamped so a quick retry stays quiet.
    const alerted = prismaMock.lead.update.mock.calls[1][0];
    expect(alerted.data.metadata.rushRequest).toMatchObject({
      deliveryDate: '2026-09-16',
      alertedAt: NOW.toISOString(),
    });
  });

  it('does not add a second rush tag', async () => {
    prismaMock.lead.findUnique.mockResolvedValue({ tags: [RUSH_LEAD_TAG], metadata: null });
    await recordRushRequest(INPUT, NOW);
    expect(prismaMock.lead.update.mock.calls[0][0].data.tags).toEqual([RUSH_LEAD_TAG]);
  });

  it('stays quiet on another try for the same day within 6 hours', async () => {
    const alertedAt = new Date(NOW.getTime() - HOUR).toISOString();
    prismaMock.lead.findUnique.mockResolvedValue({
      tags: [RUSH_LEAD_TAG],
      metadata: { rushRequest: { deliveryDate: '2026-09-16', alertedAt } },
    });

    await recordRushRequest(INPUT, NOW);

    expect(emailMock.sendEmail).not.toHaveBeenCalled();
    // The original alert time is kept so the quiet window doesn't slide.
    expect(prismaMock.lead.update.mock.calls[0][0].data.metadata.rushRequest.alertedAt).toBe(alertedAt);
  });

  it('emails again after 6 hours', async () => {
    prismaMock.lead.findUnique.mockResolvedValue({
      tags: [],
      metadata: { rushRequest: { deliveryDate: '2026-09-16', alertedAt: new Date(NOW.getTime() - 7 * HOUR).toISOString() } },
    });
    await recordRushRequest(INPUT, NOW);
    expect(emailMock.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('emails again for a different requested day', async () => {
    prismaMock.lead.findUnique.mockResolvedValue({
      tags: [],
      metadata: { rushRequest: { deliveryDate: '2026-09-15', alertedAt: new Date(NOW.getTime() - HOUR).toISOString() } },
    });
    await recordRushRequest(INPUT, NOW);
    expect(emailMock.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('still emails when the lead row could not be saved', async () => {
    await recordRushRequest({ ...INPUT, leadId: null }, NOW);
    expect(prismaMock.lead.findUnique).not.toHaveBeenCalled();
    expect(emailMock.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('never throws when the database or the email send fails', async () => {
    prismaMock.lead.findUnique.mockRejectedValue(new Error('db down'));
    emailMock.sendEmail.mockRejectedValue(new Error('resend down'));
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(recordRushRequest(INPUT, NOW)).resolves.toBeUndefined();

    quiet.mockRestore();
  });
});

describe('buildRushAlertEmail', () => {
  it('escapes customer-typed values and keeps the subject on one line', () => {
    const { subject, html } = buildRushAlertEmail({
      ...INPUT,
      firstName: '<img src=x onerror=alert(1)>',
      lastName: 'Evil\r\nBcc: victim@example.com',
    });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('links the lead card and names the requested day', () => {
    const { html, subject } = buildRushAlertEmail(INPUT);
    expect(html).toContain('https://partyondelivery.com/admin/leads?lead=lead-1');
    expect(subject).toBe('Rush request: Sam Rivera wants delivery Wed, Sep 16');
  });
});
