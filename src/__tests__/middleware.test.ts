import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { resolveRefCookieValue } from '@/middleware';

function urlOf(input: string): URL {
  return new URL(input, 'https://partyondelivery.com');
}

describe('resolveRefCookieValue', () => {
  describe('?ref= query param', () => {
    it('uppercases and returns the ref code', () => {
      expect(resolveRefCookieValue(urlOf('/?ref=premier'))).toBe('PREMIER');
      expect(resolveRefCookieValue(urlOf('/?ref=DTRBARTENDING'))).toBe('DTRBARTENDING');
    });

    it('works on any path', () => {
      expect(resolveRefCookieValue(urlOf('/products?ref=POUR24'))).toBe('POUR24');
    });
  });

  describe('/partners/<slug> path', () => {
    it('uppercases the slug', () => {
      expect(resolveRefCookieValue(urlOf('/partners/premier-party-cruises'))).toBe('PREMIER-PARTY-CRUISES');
    });

    it('captures the slug from a sub-path (e.g. /partners/<slug>/order)', () => {
      expect(resolveRefCookieValue(urlOf('/partners/inn-cahoots/order'))).toBe('INN-CAHOOTS');
    });

    it('matches case-insensitively on the literal "/partners/" prefix', () => {
      expect(resolveRefCookieValue(urlOf('/Partners/connected-austin'))).toBe('CONNECTED-AUSTIN');
    });

    it('lowercases the slug before re-uppercasing it (canonical form)', () => {
      expect(resolveRefCookieValue(urlOf('/partners/Cocktail-Cowboys'))).toBe('COCKTAIL-COWBOYS');
    });
  });

  describe('precedence', () => {
    it('?ref= beats the partner path when both are present', () => {
      expect(resolveRefCookieValue(urlOf('/partners/premier-party-cruises?ref=DTRBARTENDING'))).toBe('DTRBARTENDING');
    });
  });

  describe('paths that should NOT set a cookie', () => {
    it('returns null for the partner index page (no slug)', () => {
      expect(resolveRefCookieValue(urlOf('/partners'))).toBeNull();
      expect(resolveRefCookieValue(urlOf('/partners/'))).toBeNull();
    });

    it('returns null for /partners/pitch (sales page, not an affiliate)', () => {
      expect(resolveRefCookieValue(urlOf('/partners/pitch'))).toBeNull();
      expect(resolveRefCookieValue(urlOf('/partners/pitch/anything'))).toBeNull();
    });

    it('returns null for generic category landers with no Affiliate row (would overwrite real attribution)', () => {
      for (const slug of [
        'anderson-mill-marina-boat-club',
        'austin-wedding-dj',
        'boat-babes',
        'hotels-resorts',
        'mobile-bartenders',
        'property-management',
        'vacation-rentals',
      ]) {
        expect(resolveRefCookieValue(urlOf(`/partners/${slug}`))).toBeNull();
        // Excluded regardless of the case the URL was typed in…
        expect(resolveRefCookieValue(urlOf(`/partners/${slug.toUpperCase()}`))).toBeNull();
        // …and on sub-paths.
        expect(resolveRefCookieValue(urlOf(`/partners/${slug}/order`))).toBeNull();
      }
    });

    it('cannot be bypassed with percent-encoding', () => {
      expect(resolveRefCookieValue(urlOf('/partners/vacation%2Drentals'))).toBeNull();
      expect(resolveRefCookieValue(urlOf('/partners/Vacation%2DRentals/order'))).toBeNull();
    });

    it('still honors an explicit ?ref= on an excluded page', () => {
      expect(resolveRefCookieValue(urlOf('/partners/vacation-rentals?ref=COWBOYS'))).toBe('COWBOYS');
    });

    it('returns null for unrelated paths', () => {
      expect(resolveRefCookieValue(urlOf('/'))).toBeNull();
      expect(resolveRefCookieValue(urlOf('/products'))).toBeNull();
      expect(resolveRefCookieValue(urlOf('/blog/some-post'))).toBeNull();
    });

    it('returns null when ?ref= is empty string', () => {
      expect(resolveRefCookieValue(urlOf('/?ref='))).toBeNull();
    });
  });

  describe('static partner page coverage (drift guard)', () => {
    // Static pages under src/app/partners/ shadow the dynamic [slug] route.
    // Each one must be EITHER backed by a real Affiliate row (its slug
    // attributes via the path cookie) OR listed in middleware.ts's
    // NON_AFFILIATE_PARTNER_PAGES (so it can't clobber a real partner's
    // cookie with an unresolvable value). A new static lander that is in
    // neither list silently destroys attribution — this test makes that a
    // build failure instead.
    const AFFILIATE_BACKED = [
      'cocktail-cowboys', // COWBOYS
      'connected-austin', // CONNECTED
      'inn-cahoots', // MISCHIEF
      'lake-travis-yacht-rentals', // LTYACHTRENTALS
      // PREMIER's partnerSlug is not set in the DB yet (its CTAs carry
      // ?ref=PREMIER, so the funnel attributes regardless). Listed here as
      // intentionally path-cookied; see the 2026-09-19 affiliate audit.
      'premier-party-cruises',
    ];

    it('every static /partners page is affiliate-backed or excluded', () => {
      const partnersDir = path.join(process.cwd(), 'src/app/partners');
      const staticSlugs = fs
        .readdirSync(partnersDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && e.name !== '[slug]')
        .map((e) => e.name);

      expect(staticSlugs.length).toBeGreaterThan(0);
      for (const slug of staticSlugs) {
        const excluded = resolveRefCookieValue(urlOf(`/partners/${slug}`)) === null;
        expect(
          excluded || AFFILIATE_BACKED.includes(slug),
          `New static partner page "${slug}": add it to AFFILIATE_BACKED here if it has an Affiliate row, or to NON_AFFILIATE_PARTNER_PAGES in src/middleware.ts if not`
        ).toBe(true);
      }
    });
  });
});
