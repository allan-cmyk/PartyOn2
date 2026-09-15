import { describe, expect, it } from 'vitest';
import {
  FULL_MOON_TICKET_DRAFT_CREATED_BY,
  GROUP_ORDER_DRAFT_CREATED_BY,
  isSelfServeDeliveryDraft,
  landingDraftCreatedBy,
  operatorSentCreatedBy,
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
    'ops-sent:landing:bachelor',
  ])('does not flag operator invoices, operator-sent drafts or event tickets (createdBy %s)', (createdBy) => {
    expect(isSelfServeDeliveryDraft({ createdBy })).toBe(false);
  });
});

describe('operatorSentCreatedBy', () => {
  it('makes a self-serve draft an operator invoice, keeping where it came from', () => {
    const sent = operatorSentCreatedBy(landingDraftCreatedBy('bachelorette'));
    expect(sent).toBe('ops-sent:landing:bachelorette');
    expect(isSelfServeDeliveryDraft({ createdBy: sent })).toBe(false);
    expect(operatorSentCreatedBy(GROUP_ORDER_DRAFT_CREATED_BY)).toBe('ops-sent:group-order-system');
  });

  it('leaves operator invoices, tickets and already-sent drafts unchanged', () => {
    expect(operatorSentCreatedBy(null)).toBeNull();
    expect(operatorSentCreatedBy('ops-agent-cli')).toBe('ops-agent-cli');
    expect(operatorSentCreatedBy(FULL_MOON_TICKET_DRAFT_CREATED_BY)).toBe(FULL_MOON_TICKET_DRAFT_CREATED_BY);
    expect(operatorSentCreatedBy('ops-sent:landing:bachelor')).toBe('ops-sent:landing:bachelor');
  });
});
