/**
 * Rush requests (inside the 24-hour minimum): the lead is tagged `rush`, the
 * request is stamped, and the operator is emailed — once per lead per 6 hours,
 * within a global hourly cap, with a warning when the submitted contact
 * doesn't match the lead on file — without ever throwing into the response.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  lead: { findUnique: vi.fn(), update: vi.fn() },
}));
vi.mock('@/lib/database/client', () => ({ prisma: prismaMock }));

const emailMock = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend-client', () => emailMock);

const rateMock = vi.hoisted(() => ({ checkRateLimit: vi.fn() }));
vi.mock('@/lib/security/rate-limit', () => rateMock);

// leadCapture (for sanitizeName) pulls in the lead pipeline; keep it inert.
vi.mock('@/lib/leads/pipeline', () => ({
  enrollLeadIfEligible: vi.fn(),
  handleSubmitSignal: vi.fn(),
}));

import {
  RUSH_LEAD_TAG,
  buildRushAlertEmail,
  recordRushRequest,
  resolveRushRequest,
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
  rateMock.checkRateLimit.mockResolvedValue(true);
  prismaMock.lead.update.mockResolvedValue({});
});

describe('recordRushRequest', () => {
  it('tags the lead, stamps the request, and emails the operator', async () => {
    prismaMock.lead.findUnique
      .mockResolvedValueOnce({
        tags: ['vip'],
        metadata: { unifiedQuote: { source: 'package-builder' } },
        email: 'sam@example.com',
        phone: '5125550100',
      })
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
      rushRequest: {
        deliveryDate: '2026-09-16',
        source: 'package-builder',
        requestedAt: NOW.toISOString(),
        requestedBy: { email: 'sam@example.com', phone: '5125550100' },
      },
    });
    expect(rateMock.checkRateLimit).toHaveBeenCalledWith('rush-alert-email', 'global', expect.any(Number), 3600);
    expect(emailMock.sendEmail).toHaveBeenCalledTimes(1);

    // After the send, the alert time is stamped so a quick retry stays quiet.
    const alerted = prismaMock.lead.update.mock.calls[1][0];
    expect(alerted.data.metadata.rushRequest).toMatchObject({
      deliveryDate: '2026-09-16',
      alertedAt: NOW.toISOString(),
    });
  });

  it('does not add a second rush tag', async () => {
    prismaMock.lead.findUnique.mockResolvedValue({ tags: [RUSH_LEAD_TAG], metadata: null, email: null, phone: null });
    await recordRushRequest(INPUT, NOW);
    expect(prismaMock.lead.update.mock.calls[0][0].data.tags).toEqual([RUSH_LEAD_TAG]);
  });

  it('sends one email per lead per 6 hours, even when the requested day changes', async () => {
    const alertedAt = new Date(NOW.getTime() - HOUR).toISOString();
    prismaMock.lead.findUnique.mockResolvedValue({
      tags: [RUSH_LEAD_TAG],
      metadata: { rushRequest: { deliveryDate: '2026-09-15', alertedAt } },
      email: null,
      phone: null,
    });

    await recordRushRequest(INPUT, NOW);

    expect(emailMock.sendEmail).not.toHaveBeenCalled();
    // The latest request is recorded; the original alert time is kept so the
    // quiet window doesn't slide.
    expect(prismaMock.lead.update.mock.calls[0][0].data.metadata.rushRequest).toMatchObject({
      deliveryDate: '2026-09-16',
      alertedAt,
    });
  });

  it('emails again after 6 hours', async () => {
    prismaMock.lead.findUnique.mockResolvedValue({
      tags: [RUSH_LEAD_TAG],
      metadata: { rushRequest: { deliveryDate: '2026-09-16', alertedAt: new Date(NOW.getTime() - 7 * HOUR).toISOString() } },
      email: null,
      phone: null,
    });
    await recordRushRequest(INPUT, NOW);
    expect(emailMock.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('skips the email past the global hourly cap but still tags the lead', async () => {
    rateMock.checkRateLimit.mockResolvedValue(false);
    prismaMock.lead.findUnique.mockResolvedValue({ tags: [], metadata: null, email: null, phone: null });
    const quiet = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await recordRushRequest(INPUT, NOW);

    expect(prismaMock.lead.update.mock.calls[0][0].data.tags).toEqual([RUSH_LEAD_TAG]);
    expect(emailMock.sendEmail).not.toHaveBeenCalled();
    quiet.mockRestore();
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

  it('strips invisible formatting characters from names', () => {
    const { subject, html } = buildRushAlertEmail({ ...INPUT, firstName: 'Sam‮​', lastName: 'Rivera' });
    expect(subject).not.toMatch(/[‮​]/);
    expect(html).not.toMatch(/[‮​]/);
  });

  it('links the lead card and names the requested day', () => {
    const { html, subject } = buildRushAlertEmail(INPUT);
    expect(html).toContain('https://partyondelivery.com/admin/leads?lead=lead-1');
    expect(subject).toBe('Rush request: Sam Rivera wants delivery Wed, Sep 16');
  });

  it('warns when the submitted contact does not match the lead on file', () => {
    const { html } = buildRushAlertEmail(INPUT, { email: 'someone-else@example.com', phone: '(512) 555-0100' });
    expect(html).toContain('Check before calling');
    expect(html).toContain('someone-else@example.com');
  });

  it('does not warn when the details match apart from formatting', () => {
    const { html } = buildRushAlertEmail(INPUT, { email: ' SAM@example.com', phone: '+1 512-555-0100' });
    expect(html).not.toContain('Check before calling');
  });
});

describe('resolveRushRequest', () => {
  const RUSH_BY_SAM = {
    deliveryDate: '2026-09-16',
    alertedAt: new Date(NOW.getTime() - HOUR).toISOString(),
    requestedBy: { email: 'sam@example.com', phone: '5125550100' },
  };

  it('clears the flag when the same customer books a bookable day, and forgets the old alert', async () => {
    prismaMock.lead.findUnique.mockResolvedValue({
      tags: ['vip', RUSH_LEAD_TAG],
      metadata: { rushRequest: RUSH_BY_SAM },
    });

    // Same person, formatted differently.
    await resolveRushRequest('lead-1', { email: 'Sam@Example.com', phone: '(512) 555-0100' }, NOW);

    const data = prismaMock.lead.update.mock.calls[0][0].data;
    expect(data.tags).toEqual(['vip']);
    expect(data.metadata.rushRequest).toMatchObject({ deliveryDate: '2026-09-16', resolvedAt: NOW.toISOString() });
    // A genuinely new rush from this lead later must still email.
    expect(data.metadata.rushRequest).not.toHaveProperty('alertedAt');
  });

  it("leaves the flag alone when someone else's details matched the lead", async () => {
    prismaMock.lead.findUnique.mockResolvedValue({
      tags: [RUSH_LEAD_TAG],
      metadata: { rushRequest: RUSH_BY_SAM },
    });

    // Sam's phone number, a stranger's email.
    await resolveRushRequest('lead-1', { email: 'stranger@example.com', phone: '512-555-0100' }, NOW);

    expect(prismaMock.lead.update).not.toHaveBeenCalled();
  });

  it('does nothing for a lead without the rush tag', async () => {
    prismaMock.lead.findUnique.mockResolvedValue({ tags: ['vip'], metadata: null });
    await resolveRushRequest('lead-1', { email: 'sam@example.com' }, NOW);
    expect(prismaMock.lead.update).not.toHaveBeenCalled();
  });

  it('never throws', async () => {
    prismaMock.lead.findUnique.mockRejectedValue(new Error('db down'));
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(resolveRushRequest('lead-1', { email: 'sam@example.com' }, NOW)).resolves.toBeUndefined();
    quiet.mockRestore();
  });
});
