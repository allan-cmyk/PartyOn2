'use client';

/**
 * GLOBAL FORM CAPTURE WATCHER
 *
 * Backstop lead-capture for every form on the site. Mounted once in the
 * root layout. Attaches a document-level `focusout` listener and, when an
 * input/textarea blurs with a contact-flavored value, fires a FIELD_BLUR
 * lead-event so the partial submission shows up in /admin/brians-stuff
 * → Leads — even if the specific form wasn't manually instrumented.
 *
 * Why a global hook instead of wiring each form?
 *   - Future forms get tracking for free
 *   - Third-party / partner pages get tracking for free
 *   - Removes the risk of an engineer adding a form and forgetting to
 *     thread the useLeadCapture hook through it
 *
 * Heuristics for "is this a contact field?"
 *   1. <input type="email">           → email
 *   2. <input type="tel">             → phone
 *   3. autocomplete="email|tel|name"  → email/phone/firstName/lastName
 *   4. name / id / placeholder matching email|phone|name patterns
 *
 * Anything that doesn't match falls through silently (no API call).
 *
 * Skipped contexts (we don't want internal-tool noise):
 *   - /admin, /ops, /dashboard, /affiliate (logged-in tools)
 *   - Any input inside an element with data-lead-capture="skip"
 *   - Any form-element whose modal already calls useLeadCapture()
 *     explicitly — those modals stamp the form root with
 *     data-lead-capture="manual" so we don't double-capture.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { sendLeadEvent, type LeadWidget } from '@/lib/leads/client';

const SKIP_PATH_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/ops(\/|$)/,
  /^\/dashboard(\/|$)/,
  /^\/affiliate(\/|$)/,
  /^\/api\//,
];

const NAME_PATTERN = /name|fname|firstname|lastname|fullname/i;
const EMAIL_PATTERN = /email|e-mail/i;
const PHONE_PATTERN = /phone|tel\b|mobile|cell/i;

// Per-cookie de-dupe: don't re-fire the exact same field+value combo within
// a single tab session (cuts noise from autofocus → blur → re-blur cycles).
const recentByField = new Map<string, string>();

type FieldClassification = {
  fieldKind: 'firstName' | 'lastName' | 'email' | 'phone' | null;
  fieldName: string;
};

function classifyField(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldClassification {
  const autocomplete = (el.getAttribute('autocomplete') ?? '').toLowerCase();
  const type = (el.getAttribute('type') ?? '').toLowerCase();
  const name = (el.getAttribute('name') ?? '').toLowerCase();
  const id = (el.id ?? '').toLowerCase();
  const placeholder = (el.getAttribute('placeholder') ?? '').toLowerCase();
  const aria = (el.getAttribute('aria-label') ?? '').toLowerCase();
  const haystack = `${name} ${id} ${placeholder} ${aria}`;

  if (type === 'email' || EMAIL_PATTERN.test(autocomplete) || EMAIL_PATTERN.test(haystack)) {
    return { fieldKind: 'email', fieldName: 'email' };
  }
  if (type === 'tel' || PHONE_PATTERN.test(autocomplete) || PHONE_PATTERN.test(haystack)) {
    return { fieldKind: 'phone', fieldName: 'phone' };
  }
  if (autocomplete === 'given-name' || /firstname|first-name|fname/i.test(name + id + placeholder + aria)) {
    return { fieldKind: 'firstName', fieldName: 'firstName' };
  }
  if (autocomplete === 'family-name' || /lastname|last-name|lname/i.test(name + id + placeholder + aria)) {
    return { fieldKind: 'lastName', fieldName: 'lastName' };
  }
  if (
    autocomplete === 'name' ||
    NAME_PATTERN.test(haystack)
  ) {
    return { fieldKind: 'firstName', fieldName: 'name' };
  }
  return { fieldKind: null, fieldName: name || id || 'unknown' };
}

function inferWidget(el: Element): LeadWidget {
  // Walk up the DOM looking for an explicit data-lead-widget tag.
  let node: Element | null = el;
  while (node) {
    const attr = node.getAttribute?.('data-lead-widget');
    if (attr) return attr.toUpperCase().replace(/-/g, '_') as LeadWidget;
    node = node.parentElement;
  }
  return 'OTHER';
}

function shouldSkip(el: Element): boolean {
  // 1) Honors-an-explicit-opt-out attribute anywhere up the tree.
  let node: Element | null = el;
  while (node) {
    const sentinel = node.getAttribute?.('data-lead-capture');
    if (sentinel === 'skip' || sentinel === 'manual') return true;
    node = node.parentElement;
  }
  return false;
}

export default function FormCaptureWatcher() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (SKIP_PATH_PATTERNS.some((re) => re.test(pathname))) return;

    const handler = (ev: FocusEvent) => {
      const t = ev.target;
      if (!(t instanceof HTMLInputElement) && !(t instanceof HTMLTextAreaElement) && !(t instanceof HTMLSelectElement)) {
        return;
      }
      // Skip password, hidden, file, submit, button, checkbox, radio.
      const type = (t.getAttribute('type') ?? '').toLowerCase();
      if (['password', 'hidden', 'file', 'submit', 'button', 'checkbox', 'radio'].includes(type)) return;

      const value = ('value' in t ? t.value : '').trim();
      if (!value || value.length < 2) return;
      if (shouldSkip(t)) return;

      const { fieldKind, fieldName } = classifyField(t);
      if (!fieldKind) return; // Only capture obvious contact fields.

      // De-dupe identical re-fires (same field + same value).
      if (recentByField.get(fieldName) === value) return;
      recentByField.set(fieldName, value);

      const identify: Record<string, string> = {};
      identify[fieldKind] = value;

      const widget = inferWidget(t);

      void sendLeadEvent({
        type: 'FIELD_BLUR',
        widget,
        page: pathname,
        fieldName,
        fieldValue: value,
        identify: identify as Parameters<typeof sendLeadEvent>[0]['identify'],
        metadata: { source: 'global-form-watcher' },
      });
    };

    document.addEventListener('focusout', handler, true);
    return () => {
      document.removeEventListener('focusout', handler, true);
    };
  }, [pathname]);

  return null;
}
