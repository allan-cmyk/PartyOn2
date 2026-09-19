/**
 * resolveAffiliateByRef — the shared ref_code resolver used by checkout, the
 * attribution endpoint, linkOrderToAffiliate, and the webhook email lookups.
 *
 * The middleware writes the cookie in TWO forms: an Affiliate.code from
 * ?ref=<code>, or an UPPERCASED partnerSlug from a /partners/<slug> visit
 * ("COCKTAIL-COWBOYS" for code "COWBOYS"). The 2026-09 affiliate audit found
 * checkout resolved only the code form, silently dropping the perk and the
 * commission for every partner-page visitor who checked out via the cart.
 *
 * Contract pinned here:
 *  1. both forms resolve (code case-insensitively, slug via lowercase);
 *  2. a code match deterministically beats another affiliate's slug match;
 *  3. refs failing the charset guard NEVER reach a query — Prisma's
 *     insensitive mode compiles to unescaped ILIKE, where '%'/'_' are
 *     wildcards ('%' matched an arbitrary prod affiliate, 2026-09-19);
 *  4. the resolver returns non-ACTIVE rows (callers own the status gate);
 *  5. the query projects only attribution fields — never secrets.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  // Pathological cross-affiliate collision: one row's code equals another's slug.
  { id: 'aff-surge-code', code: 'SURGE', partnerSlug: null, status: 'ACTIVE' },
  { id: 'aff-surge-slug', code: 'SURGEA364', partnerSlug: 'surge', status: 'ACTIVE' },
  { id: 'aff-draft', code: 'DRAFTY', partnerSlug: 'drafty-slug', status: 'DRAFT' },
];

interface CodeWhere {
  code: { equals: string; mode: string };
}
interface SlugWhere {
  partnerSlug: string;
}

// findFirst models the code arm: case-insensitive EQUALITY. (The real DB
// treats the query as ILIKE, where '%'/'_' are wildcards — the resolver's
// charset guard must keep such refs from ever reaching this call, which the
// call-count assertions below verify.)
const findFirst = vi.fn(async ({ where }: { where: CodeWhere; select?: Record<string, true> }) => {
  return FIXTURES.find((r) => r.code.toLowerCase() === where.code.equals.toLowerCase()) ?? null;
});

// findUnique models the slug arm: exact equality on the unique column.
const findUnique = vi.fn(async ({ where }: { where: SlugWhere; select?: Record<string, true> }) => {
  return FIXTURES.find((r) => r.partnerSlug === where.partnerSlug) ?? null;
});

vi.mock('@/lib/database/client', () => ({
  prisma: {
    affiliate: {
      findFirst: (...args: unknown[]) =>
        findFirst(...(args as [{ where: CodeWhere; select?: Record<string, true> }])),
      findUnique: (...args: unknown[]) =>
        findUnique(...(args as [{ where: SlugWhere; select?: Record<string, true> }])),
    },
  },
}));

import { resolveAffiliateByRef, getAffiliateBySlug } from '@/lib/affiliates/affiliate-service';

beforeEach(() => {
  findFirst.mockClear();
  findUnique.mockClear();
});

describe('resolveAffiliateByRef — dual-form resolution', () => {
  it('resolves a real code (?ref= form)', async () => {
    expect((await resolveAffiliateByRef('COWBOYS'))?.id).toBe('aff-cowboys');
  });

  it('resolves a code case-insensitively', async () => {
    expect((await resolveAffiliateByRef('cowboys'))?.id).toBe('aff-cowboys');
  });

  it('resolves the uppercased-slug cookie form set by /partners/<slug> visits', async () => {
    expect((await resolveAffiliateByRef('COCKTAIL-COWBOYS'))?.id).toBe('aff-cowboys');
  });

  it('resolves the FIVE-STAR/FIVESTAR pair from the 2026-07-08 review note', async () => {
    expect((await resolveAffiliateByRef('FIVE-STAR'))?.id).toBe('aff-fivestar');
  });

  it('resolves a code for an affiliate with no partner slug', async () => {
    expect((await resolveAffiliateByRef('CHICKTRIPS'))?.id).toBe('aff-chicktrips');
  });

  it('trims surrounding whitespace', async () => {
    expect((await resolveAffiliateByRef('  COWBOYS  '))?.id).toBe('aff-cowboys');
  });

  it('returns null for well-formed junk (non-affiliate partner pages) after both lookups', async () => {
    expect(await resolveAffiliateByRef('VACATION-RENTALS')).toBeNull();
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(findUnique).toHaveBeenCalledTimes(1);
  });
});

describe('resolveAffiliateByRef — deterministic precedence', () => {
  it('a code match beats another affiliate whose slug is the same string', async () => {
    // 'surge' is aff-surge-code's code (insensitively) AND aff-surge-slug's slug.
    const affiliate = await resolveAffiliateByRef('surge');
    expect(affiliate?.id).toBe('aff-surge-code');
    // The slug arm must not even run once the code arm hit.
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe('resolveAffiliateByRef — wildcard/charset guard (ILIKE injection)', () => {
  it.each(['%', '_______', '%COWBOYS%', 'COWBOY_', '', '   ', 'a'.repeat(65), 'evil;--', 'ü-slug'])(
    'never queries for %j',
    async (ref) => {
      expect(await resolveAffiliateByRef(ref)).toBeNull();
      expect(findFirst).not.toHaveBeenCalled();
      expect(findUnique).not.toHaveBeenCalled();
    }
  );
});

describe('getAffiliateBySlug — same wildcard guard (public partner page + lead stamping)', () => {
  it('resolves a real slug', async () => {
    expect((await getAffiliateBySlug('five-star'))?.id).toBe('aff-fivestar');
  });

  it.each(['%', '_______', 'ev%il', ''])('never queries for %j', async (slug) => {
    // /partners/%25 previously fell through to the ILIKE code arm and could
    // render an arbitrary partner's page (contact info included).
    expect(await getAffiliateBySlug(slug)).toBeNull();
    expect(findFirst).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe('resolveAffiliateByRef — status and projection', () => {
  it('returns non-ACTIVE rows (callers own the status gate)', async () => {
    const affiliate = await resolveAffiliateByRef('DRAFTY');
    expect(affiliate?.status).toBe('DRAFT');
  });

  it('selects only attribution fields — never credentials or payout secrets', async () => {
    await resolveAffiliateByRef('COWBOYS');
    const select = findFirst.mock.calls[0]?.[0]?.select as Record<string, true> | undefined;
    expect(select).toBeDefined();
    const fields = Object.keys(select ?? {});
    expect(fields).toEqual(
      expect.arrayContaining(['id', 'code', 'status', 'customerPerk', 'email', 'commissionRateOverride'])
    );
    for (const secret of ['passwordHash', 'payoutDetails', 'callbackApiKey', 'webhookApiKey']) {
      expect(fields).not.toContain(secret);
    }
  });
});
