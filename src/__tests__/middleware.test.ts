import { describe, it, expect } from 'vitest';
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
      expect(resolveRefCookieValue(urlOf('/partners/Mobile-Bartenders'))).toBe('MOBILE-BARTENDERS');
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

    it('returns null for unrelated paths', () => {
      expect(resolveRefCookieValue(urlOf('/'))).toBeNull();
      expect(resolveRefCookieValue(urlOf('/products'))).toBeNull();
      expect(resolveRefCookieValue(urlOf('/blog/some-post'))).toBeNull();
    });

    it('returns null when ?ref= is empty string', () => {
      expect(resolveRefCookieValue(urlOf('/?ref='))).toBeNull();
    });
  });
});
