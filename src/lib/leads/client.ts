'use client';

/**
 * Browser-side helpers for the lead-capture system.
 *
 * Exposes:
 *   - sendLeadEvent(): low-level POST to /api/v1/landing/lead-event
 *   - useLeadCapture(): React hook that returns helpers for forms
 *     (onBlurField, onStepComplete, onSubmit) bound to a widget + page
 *   - fireVisitorPixel(): page-view beacon, called once per pathname
 *
 * Failure is silent — lead capture must never block the UX.
 */
import { useCallback, useMemo } from 'react';

const LEAD_EVENT_URL = '/api/v1/landing/lead-event';
const PIXEL_URL = '/api/v1/landing/visitor-pixel';

export type LeadWidget =
  | 'QUICK_BUY'
  | 'PACKAGE_BUILDER'
  | 'A_LA_CARTE'
  | 'CALL_BOOKING'
  | 'EMAIL_SIGNUP'
  | 'CONTACT_FORM'
  | 'DRINK_CALCULATOR'
  | 'OTHER';

export type LeadEventType =
  | 'PAGE_VIEW'
  | 'FIELD_FOCUS'
  | 'FIELD_BLUR'
  | 'STEP_COMPLETE'
  | 'CART_ADD'
  | 'FORM_SUBMIT'
  | 'CHECKOUT_START'
  | 'CONVERSION'
  | 'CUSTOM';

export type LeadStatus =
  | 'ANONYMOUS'
  | 'PARTIAL'
  | 'SUBMITTED'
  | 'CONVERTED'
  | 'ARCHIVED';

export type Identify = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type SendLeadEventInput = {
  type: LeadEventType;
  page?: string;
  widget?: LeadWidget;
  fieldName?: string;
  fieldValue?: string | number | boolean | null;
  identify?: Identify;
  metadata?: Record<string, unknown>;
  setStatus?: LeadStatus;
  resumeCart?: unknown;
};

function readUtm(): Record<string, string | null> {
  if (typeof window === 'undefined') return {};
  try {
    const sp = new URLSearchParams(window.location.search);
    return {
      utmSource: sp.get('utm_source'),
      utmMedium: sp.get('utm_medium'),
      utmCampaign: sp.get('utm_campaign'),
      utmContent: sp.get('utm_content'),
      utmTerm: sp.get('utm_term'),
    };
  } catch {
    return {};
  }
}

export async function sendLeadEvent(input: SendLeadEventInput) {
  if (typeof window === 'undefined') return null;
  const utm = readUtm();
  try {
    const res = await fetch(LEAD_EVENT_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      keepalive: true, // survive page navigations
      body: JSON.stringify({
        type: input.type,
        page: input.page ?? window.location.pathname,
        widget: input.widget ?? 'OTHER',
        fieldName: input.fieldName ?? null,
        fieldValue:
          input.fieldValue == null ? null : String(input.fieldValue).slice(0, 2000),
        identify: input.identify ?? undefined,
        utm,
        metadata: input.metadata ?? null,
        setStatus: input.setStatus,
        resumeCart: input.resumeCart,
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      ok: boolean;
      sessionId: string;
      leadId: string | null;
    };
  } catch {
    return null;
  }
}

export async function fireVisitorPixel(page: string) {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(PIXEL_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      keepalive: true,
      body: JSON.stringify({
        page,
        referrer: document.referrer || null,
        utm: readUtm(),
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      ok: boolean;
      sessionId: string;
      leadId: string | null;
      returning: boolean;
    };
  } catch {
    return null;
  }
}

/**
 * React hook bound to a widget + page slug. Returns convenience functions
 * for the most common form-instrumentation patterns.
 */
export function useLeadCapture(opts: { widget: LeadWidget; page?: string }) {
  const { widget, page } = opts;

  const onBlurField = useCallback(
    (fieldName: string, value: string | number | null | undefined, identify?: Identify) => {
      if (value == null || String(value).trim() === '') return;
      void sendLeadEvent({
        type: 'FIELD_BLUR',
        widget,
        page,
        fieldName,
        fieldValue: value,
        identify,
      });
    },
    [widget, page],
  );

  const onStepComplete = useCallback(
    (stepKey: string, metadata?: Record<string, unknown>, identify?: Identify) => {
      void sendLeadEvent({
        type: 'STEP_COMPLETE',
        widget,
        page,
        fieldName: stepKey,
        identify,
        metadata,
      });
    },
    [widget, page],
  );

  const onFormSubmit = useCallback(
    (identify: Identify, metadata?: Record<string, unknown>, resumeCart?: unknown) => {
      void sendLeadEvent({
        type: 'FORM_SUBMIT',
        widget,
        page,
        identify,
        metadata,
        resumeCart,
        setStatus: 'SUBMITTED',
      });
    },
    [widget, page],
  );

  const onCheckoutStart = useCallback(
    (identify: Identify, metadata?: Record<string, unknown>, resumeCart?: unknown) => {
      void sendLeadEvent({
        type: 'CHECKOUT_START',
        widget,
        page,
        identify,
        metadata,
        resumeCart,
        setStatus: 'SUBMITTED',
      });
    },
    [widget, page],
  );

  return useMemo(
    () => ({ onBlurField, onStepComplete, onFormSubmit, onCheckoutStart, sendLeadEvent }),
    [onBlurField, onStepComplete, onFormSubmit, onCheckoutStart],
  );
}
