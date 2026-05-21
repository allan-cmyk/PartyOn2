/**
 * Source-to-normalizer dispatch for incoming partner leads.
 *
 * Adding a new partner platform = adding a normalizer file + an entry here.
 * The inbound webhook endpoint and the public landing-page endpoint both
 * consume this module.
 */

import type { PartnerLeadSource, NormalizerResult } from '../types';
import { normalizeFareharborPayload } from './fareharbor';
import { normalizeLandingPagePayload, type LandingPageLeadInput } from './landing-page';

export { normalizeFareharborPayload, normalizeLandingPagePayload };
export type { LandingPageLeadInput };

/**
 * Run an arbitrary partner payload through the matching normalizer.
 *
 * Returns `{ ok: false, reason }` for unknown sources or malformed payloads.
 */
export function normalizePartnerPayload(source: PartnerLeadSource, payload: unknown): NormalizerResult {
  switch (source) {
    case 'fareharbor':
      return normalizeFareharborPayload(payload);
    case 'landing_page':
      return normalizeLandingPagePayload((payload ?? {}) as LandingPageLeadInput);
    case 'manual':
      // Manual ingestion uses the landing-page shape (admin-side form posts the
      // same payload); but skips the "this is a CTA click" widget hint.
      return normalizeLandingPagePayload({
        ...((payload ?? {}) as LandingPageLeadInput),
        cameFromConfirmationEmail: false,
      });
    default: {
      // Exhaustiveness check — TS will yell here if we add a new source
      // without handling it.
      const _exhaustive: never = source;
      return { ok: false, reason: `Unknown partner-lead source: ${String(_exhaustive)}` };
    }
  }
}
