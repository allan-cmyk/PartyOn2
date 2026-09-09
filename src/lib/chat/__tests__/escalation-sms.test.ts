import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildEscalationSmsBody, sendChatEscalationSms } from '../escalation-sms';
import type { ChatEscalationSmsInput } from '../escalation-sms';

const base: ChatEscalationSmsInput = {
  conversationId: 'conv-123',
  reason: 'order_issue',
  lastUserMessage: "I was planning on picking up my order, but it's showing a delivery fee",
  contact: { firstName: 'Anthony', email: 'a@example.com', phone: '5126224061' },
  leadUrl: 'https://partyondelivery.com/admin/leads?lead=abc',
};

function stubTwilioEnv() {
  vi.stubEnv('TWILIO_ACCOUNT_SID', 'ACxxxxxxxx');
  vi.stubEnv('TWILIO_AUTH_TOKEN', 'secret-token');
  vi.stubEnv('TWILIO_FROM_NUMBER', '+15125550100');
  vi.stubEnv('OPS_ALERT_PHONE', '+15125767975');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('buildEscalationSmsBody', () => {
  it('carries the label, trigger snippet, contact, and where to act', () => {
    const body = buildEscalationSmsBody(base);
    expect(body).toContain('Order problem / needs action');
    expect(body).toContain('showing a delivery fee');
    expect(body).toContain('Anthony');
    expect(body).toContain('5126224061');
    expect(body).toContain('/admin/leads?lead=abc');
  });

  it('never exceeds 320 chars, even with absurd inputs', () => {
    const body = buildEscalationSmsBody({
      ...base,
      lastUserMessage: 'x'.repeat(2000),
      contact: { firstName: 'A'.repeat(200), email: `${'b'.repeat(200)}@x.com`, phone: '5551234567' },
    });
    expect(body.length).toBeLessThanOrEqual(320);
  });

  it('collapses whitespace in the snippet and falls back when no contact', () => {
    const body = buildEscalationSmsBody({
      ...base,
      lastUserMessage: 'line one\n\n   line two',
      contact: {},
      leadUrl: null,
    });
    expect(body).toContain('line one line two');
    expect(body).toContain('no contact yet');
    expect(body).toContain('partyondelivery.com/admin/leads');
  });
});

describe('sendChatEscalationSms', () => {
  it('no-ops (false) when any Twilio env var is missing', async () => {
    stubTwilioEnv();
    vi.stubEnv('TWILIO_AUTH_TOKEN', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    await expect(sendChatEscalationSms(base)).resolves.toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('POSTs the Twilio Messages API with basic auth and the built body; true on 2xx', async () => {
    stubTwilioEnv();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchSpy);

    await expect(sendChatEscalationSms(base)).resolves.toBe(true);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.twilio.com/2010-04-01/Accounts/ACxxxxxxxx/Messages.json');
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe(
      `Basic ${Buffer.from('ACxxxxxxxx:secret-token').toString('base64')}`
    );
    const params = (init as RequestInit).body as URLSearchParams;
    expect(params.get('To')).toBe('+15125767975');
    expect(params.get('From')).toBe('+15125550100');
    expect(params.get('Body')).toBe(buildEscalationSmsBody(base));
  });

  it('returns false on a non-2xx response (caller will not stamp on SMS alone)', async () => {
    stubTwilioEnv();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'auth error' })
    );
    await expect(sendChatEscalationSms(base)).resolves.toBe(false);
  });

  it('returns false when fetch rejects (never throws into the capture path)', async () => {
    stubTwilioEnv();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(sendChatEscalationSms(base)).resolves.toBe(false);
  });
});
