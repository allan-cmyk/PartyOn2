'use client';

/**
 * Partner Integration card on the affiliate detail page.
 *
 * Surfaces the values an operator needs whenever they're talking to a
 * partner: the inbound webhook URL, the API key, and the welcome-page link.
 * Each is one-click copyable so handing them to a partner manager is
 * frictionless.
 *
 * Hidden when the affiliate has no webhookApiKey set yet — we don't want to
 * show "—" as the key everywhere for partners that haven't been wired up.
 */

import { useState, type ReactElement } from 'react';

interface Props {
  affiliateCode: string;
  partnerSlug: string | null;
  webhookApiKey: string | null;
}

const SITE_ORIGIN =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://partyondelivery.com';

export default function AffiliateIntegrationSection({
  affiliateCode,
  partnerSlug,
  webhookApiKey,
}: Props): ReactElement | null {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Hide the whole card when no integration credentials exist yet — keeps
  // the affiliate detail page clean for partners that aren't using webhooks.
  if (!webhookApiKey) return null;

  const slug = partnerSlug ?? affiliateCode.toLowerCase();
  const webhookUrl = `${SITE_ORIGIN}/api/webhooks/partner-lead?source=fareharbor`;
  const welcomeUrl = `${SITE_ORIGIN}/partners/${slug}/welcome?utm_source=fareharbor&utm_medium=confirmation_email&utm_campaign=${slug}_postbook`;

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Fallback for older browsers — select the input contents.
      window.prompt('Copy with Cmd/Ctrl+C:', value);
    }
  }

  return (
    <div className="mb-8 bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Partner Integration</h2>
        <span className="text-xs text-gray-500">For the partner&apos;s FareHarbor setup</span>
      </div>

      <div className="space-y-3">
        <Field
          label="Webhook URL (paste in FareHarbor → Webhooks)"
          value={webhookUrl}
          copyLabel="url"
          copiedKey={copiedKey}
          onCopy={() => copy('url', webhookUrl)}
        />

        <Field
          label="X-API-Key header (paste in FareHarbor → Webhook headers)"
          value={webhookApiKey}
          copyLabel="key"
          copiedKey={copiedKey}
          onCopy={() => copy('key', webhookApiKey)}
          sensitive
        />

        <Field
          label="Confirmation-email CTA link (paste in FareHarbor → Email Template)"
          value={welcomeUrl}
          copyLabel="welcome"
          copiedKey={copiedKey}
          onCopy={() => copy('welcome', welcomeUrl)}
        />
      </div>

      <p className="mt-3 text-xs text-gray-600">
        Setup guide:{' '}
        <a
          href="/docs/partner-leads/centex-fareharbor-setup.md"
          className="text-brand-blue hover:underline"
        >
          docs/partner-leads/centex-fareharbor-setup.md
        </a>
        {' · '}Treat the API key like a password — don&apos;t paste it into
        email or chat.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  copyLabel,
  copiedKey,
  onCopy,
  sensitive,
}: {
  label: string;
  value: string;
  copyLabel: string;
  copiedKey: string | null;
  onCopy: () => void;
  sensitive?: boolean;
}): ReactElement {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type={sensitive ? 'password' : 'text'}
          value={value}
          readOnly
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-xs font-mono bg-gray-50"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          onClick={onCopy}
          className="px-3 py-2 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 whitespace-nowrap"
        >
          {copiedKey === copyLabel ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
