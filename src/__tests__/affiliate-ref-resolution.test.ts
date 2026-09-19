/**
 * resolveAffiliateByRef — the ref_code cookie resolver used by checkout and
 * the attribution endpoint.
 *
 * The middleware writes the cookie in TWO forms: an Affiliate.code from
 * ?ref=<code>, or an UPPERCASED partnerSlug from a /partners/<slug> visit
 * ("COCKTAIL-COWBOYS" for code "COWBOYS"). The 2026-09 affiliate audit found
 * checkout resolved only the code form, silently dropping the perk and the
 * commission for every partner-page visitor who checked out via the cart.
 * These tests pin the dual-form contract.
 */

import { describe, it, expect, vi } from 'vitest';

interface AffiliateRow {
  id: string;
  code: string;
  partnerSlug: string | null;
  status: string;
}

const FIXTURES: AffiliateRow[] = [
  { id: 'aff-cowboys', code: 'COWBOYS', partnerSlug: 'cocktail-cowboys', status: 'ACTIVE' },
  { id: 'aff-fivestar', code: 'FIVESTAR', partnerSlug: 'five-star', status: 'ACTIVE' },
  { id: 'aff-chicktrips', code: 'CHICKTRIPS', partnerSlug: null, status: 'ACTIVE' },
];

// Mimic Prisma's matching for the exact WHERE shape the resolver sends:
// OR [ code equals-insensitive, partnerSlug equals ]. Evaluating the clause
// (rather than returning a canned row) keeps the test honest about the query.
interface RefWhere {
  OR: Array<{
    code?: { equals: string; mode: string };
    partnerSlug?: string;
  }>;
}

const findFirst = vi.fn(async ({ where }: { where: RefWhere }) => {
  for (const row of FIXTURES) {
    for (const clause of where.OR) {
      if (clause.code && row.code.toLowerCase() === clause.code.equals.toLowerCase()) return row;
      if (clause.partnerSlug !== undefined && row.partnerSlug === clause.partnerSlug) return row;
    }
  }
  return null;
});

vi.mock('@/lib/database/client', () => ({
  prisma: {
    affiliate: {
      findFirst: (...args: unknown[]) => findFirst(...(args as [{ where: RefWhere }])),
    },
  },
}));

import { resolveAffiliateByRef } from '@/lib/affiliates/affiliate-service';

describe('resolveAffiliateByRef', () => {
  it('resolves a real code (?ref= form)', async () => {
    const affiliate = await resolveAffiliateByRef('COWBOYS');
    expect(affiliate?.id).toBe('aff-cowboys');
  });

  it('resolves a code case-insensitively', async () => {
    const affiliate = await resolveAffiliateByRef('cowboys');
    expect(affiliate?.id).toBe('aff-cowboys');
  });

  it('resolves the uppercased-slug cookie form set by /partners/<slug> visits', async () => {
    const affiliate = await resolveAffiliateByRef('COCKTAIL-COWBOYS');
    expect(affiliate?.id).toBe('aff-cowboys');
  });

  it('resolves the FIVE-STAR/FIVESTAR pair from the 2026-07-08 review note', async () => {
    const affiliate = await resolveAffiliateByRef('FIVE-STAR');
    expect(affiliate?.id).toBe('aff-fivestar');
  });

  it('resolves a code for an affiliate with no partner slug', async () => {
    const affiliate = await resolveAffiliateByRef('CHICKTRIPS');
    expect(affiliate?.id).toBe('aff-chicktrips');
  });

  it('returns null for junk values (non-affiliate partner pages)', async () => {
    const affiliate = await resolveAffiliateByRef('VACATION-RENTALS');
    expect(affiliate).toBeNull();
  });
});
