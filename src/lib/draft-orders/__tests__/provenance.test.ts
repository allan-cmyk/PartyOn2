import { describe, expect, it } from 'vitest';
import {
  FULL_MOON_TICKET_DRAFT_CREATED_BY,
  GROUP_ORDER_DRAFT_CREATED_BY,
  isSelfServeDeliveryDraft,
  landingDraftCreatedBy,
  mustMeetLeadTimeToPay,
} from '../provenance';

describe('isSelfServeDeliveryDraft', () => {
  it('flags drafts minted by the public landing quote route and the legacy group checkout', () => {
    expect(landingDraftCreatedBy('bachelorette')).toBe('landing:bachelorette');
    expect(isSelfServeDeliveryDraft({ createdBy: landingDraftCreatedBy('bachelorette') })).toBe(true);
    expect(isSelfServeDeliveryDraft({ createdBy: GROUP_ORDER_DRAFT_CREATED_BY })).toBe(true);
  });

  it.each([
    null,
    '',
    'admin',
    'ops-agent',
    'ops-agent-cli',
    FULL_MOON_TICKET_DRAFT_CREATED_BY,
    'xlanding:bachelor',
  ])('does not flag operator invoices or event tickets (createdBy %s)', (createdBy) => {
    expect(isSelfServeDeliveryDraft({ createdBy })).toBe(false);
  });
});

describe('mustMeetLeadTimeToPay', () => {
  const sentAt = new Date('2026-09-10T15:00:00.000Z');

  it('holds a self-serve draft to the minimum until an invoice is sent for it', () => {
    expect(mustMeetLeadTimeToPay({ createdBy: 'landing:bachelor', sentAt: null })).toBe(true);
    expect(mustMeetLeadTimeToPay({ createdBy: GROUP_ORDER_DRAFT_CREATED_BY, sentAt: null })).toBe(true);
    expect(mustMeetLeadTimeToPay({ createdBy: 'landing:wedding', sentAt })).toBe(false);
  });

  it('never holds operator invoices to it', () => {
    expect(mustMeetLeadTimeToPay({ createdBy: null, sentAt: null })).toBe(false);
    expect(mustMeetLeadTimeToPay({ createdBy: 'ops-agent-cli', sentAt: null })).toBe(false);
  });
});
