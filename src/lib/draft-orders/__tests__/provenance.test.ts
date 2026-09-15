import { describe, expect, it } from 'vitest';
import {
  GROUP_ORDER_DRAFT_CREATED_BY,
  isSelfServeDraftOrder,
  landingDraftCreatedBy,
} from '../provenance';

describe('isSelfServeDraftOrder', () => {
  it('flags drafts minted by the public landing quote route', () => {
    expect(landingDraftCreatedBy('bachelorette')).toBe('landing:bachelorette');
    expect(isSelfServeDraftOrder({ createdBy: landingDraftCreatedBy('bachelorette') })).toBe(true);
    expect(isSelfServeDraftOrder({ createdBy: landingDraftCreatedBy('disco-cruise-event') })).toBe(true);
  });

  it('flags legacy group-checkout host invoices', () => {
    expect(isSelfServeDraftOrder({ createdBy: GROUP_ORDER_DRAFT_CREATED_BY })).toBe(true);
  });

  it.each([null, '', 'ops-agent', 'admin', 'allan@partyondelivery.com', 'xlanding:bachelor'])(
    'leaves operator invoices exempt (createdBy %s)',
    (createdBy) => {
      expect(isSelfServeDraftOrder({ createdBy })).toBe(false);
    },
  );
});
