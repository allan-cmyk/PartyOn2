import { describe, it, expect } from 'vitest';
import {
  detectEscalation,
  detectAssistantHandoff,
  REASON_LABEL,
  type EscalationReason,
} from '../escalation-keywords';
import { parseContact, hasContact } from '../parse-contact';

describe('detectEscalation', () => {
  it('flags refund / cancellation language', () => {
    expect(detectEscalation('I want a refund for Saturday')).toBe('refund');
    expect(detectEscalation('please cancel my order')).toBe('refund');
    expect(detectEscalation('my delivery never received')).toBe('refund');
  });

  it('flags complaints', () => {
    expect(detectEscalation('this is unacceptable and terrible')).toBe('complaint');
    expect(detectEscalation("I'm really disappointed")).toBe('complaint');
  });

  it('flags legal / fraud language', () => {
    expect(detectEscalation('I will call my lawyer')).toBe('legal');
    expect(detectEscalation('this is a scam')).toBe('legal');
  });

  it('flags safety: minors + intoxication + injury', () => {
    expect(detectEscalation('you delivered to my son and he is underage')).toBe('safety');
    expect(detectEscalation('the driver seemed drunk')).toBe('safety');
    expect(detectEscalation('someone got hurt on the boat')).toBe('safety');
    expect(detectEscalation('there are minors at this party')).toBe('safety');
  });

  it('orders most-serious first (safety beats a co-occurring refund word)', () => {
    expect(detectEscalation('someone got hurt, we need a refund')).toBe('safety');
  });

  it('does NOT flag benign messages', () => {
    expect(detectEscalation('what time do we board the boat?')).toBeNull();
    expect(detectEscalation('can I get a keg for saturday')).toBeNull();
    expect(detectEscalation('')).toBeNull();
  });

  it('flags order problems (web-only order_issue) — the two real 2026-08 misses', () => {
    // Verbatim customer messages that slipped through with NO notification and
    // ended in a wrongly-charged order (operator report 2026-09-08).
    expect(
      detectEscalation("I was planning on picking up my order, but it's showing a delivery fee")
    ).toBe('order_issue');
    expect(
      detectEscalation(
        "trying to place an order for pick up but when I get to the stripe page to check out, it's still including the $25 delivery fee"
      )
    ).toBe('order_issue');
    expect(detectEscalation('I forgot to add the dank shots! Can you add them?')).toBe(
      'order_issue'
    );
    expect(detectEscalation('you sent the wrong item')).toBe('order_issue');
  });

  it('mirrored classes outrank order_issue when both match', () => {
    expect(detectEscalation("cancel my order — it's still showing a delivery fee")).toBe('refund');
  });

  it('does NOT flag plain pricing/zone questions as order issues', () => {
    expect(detectEscalation("what's the delivery fee for 78704?")).toBeNull();
    expect(detectEscalation('do you deliver to Lakeway?')).toBeNull();
    expect(detectEscalation('how much is delivery?')).toBeNull();
  });

  it('does not trip safety on "a minor issue"', () => {
    expect(detectEscalation('just a minor issue with the ice, no big deal')).toBeNull();
  });
});

describe('detectAssistantHandoff', () => {
  it("fires when Wayne's reply promises a human follow-up", () => {
    // Real phrasings from the playbook's chat renderings.
    expect(
      detectAssistantHandoff("I'm pinging Allan right now; leave your phone number")
    ).toBe('handoff');
    expect(
      detectAssistantHandoff("I've flagged this for the team — drop your name and number")
    ).toBe('handoff');
    expect(
      detectAssistantHandoff('Text (737) 371-9700 and a human will pick this up shortly.')
    ).toBe('handoff');
    expect(
      detectAssistantHandoff("drop your number and he'll get back to you as soon as he can")
    ).toBe('handoff');
  });

  it('stays quiet on ordinary helpful replies', () => {
    expect(detectAssistantHandoff('Happy to help — what headcount are we planning for?')).toBeNull();
    expect(
      detectAssistantHandoff('Order at partyondelivery.com/order and the cooler is stocked before you board.')
    ).toBeNull();
    expect(detectAssistantHandoff('')).toBeNull();
  });
});

describe('REASON_LABEL', () => {
  it('has a human-readable label for every reason (email subjects depend on it)', () => {
    const reasons: EscalationReason[] = [
      'safety',
      'legal',
      'refund',
      'complaint',
      'order_issue',
      'handoff',
    ];
    for (const r of reasons) {
      expect(REASON_LABEL[r]).toBeTruthy();
      expect(REASON_LABEL[r].length).toBeGreaterThan(4);
    }
  });
});

describe('parseContact', () => {
  it('extracts email, phone (last 10 digits), and first name', () => {
    const c = parseContact("Hey I'm Sarah, reach me at sarah.b@gmail.com or (512) 555-1234");
    expect(c.email).toBe('sarah.b@gmail.com');
    expect(c.phone).toBe('5125551234');
    expect(c.firstName).toBe('Sarah');
    expect(hasContact(c)).toBe(true);
  });

  it('normalizes +1 and punctuation in phones to last 10 digits', () => {
    expect(parseContact('call +1 512.555.9999').phone).toBe('5125559999');
    expect(parseContact('my number is 5125550000').phone).toBe('5125550000');
  });

  it('handles "my name is" and "this is"', () => {
    expect(parseContact('my name is Robert').firstName).toBe('Robert');
    expect(parseContact('this is Jessica, thanks!').firstName).toBe('Jessica');
  });

  it('does NOT read a verb after "I\'m" as a name', () => {
    // Regression: "I'm doing a wedding" used to capture the name "doing".
    expect(parseContact("I'm doing a wedding").firstName).toBeUndefined();
    expect(parseContact('I am planning a bachelorette').firstName).toBeUndefined();
    expect(parseContact("i'm looking for a keg").firstName).toBeUndefined();
    // A real capitalized name still parses, and phone is still captured alongside.
    const c = parseContact("I'm doing a wedding, my number is 512-555-1000");
    expect(c.firstName).toBeUndefined();
    expect(c.phone).toBe('5125551000');
  });

  it('parses a "phone--name--email" paste without mangling the email or dropping the name', () => {
    // Regression: a real WAYNE_CHAT lead (leads.id 7802a299…, 2026-08-28) typed
    // phone + name + email jammed together with "--". The old email regex let
    // the name + "--" become part of the local-part (stored `<last>--hello@…`)
    // and the name was left NULL. Values below are synthetic — the bug is in the
    // SHAPE, not the person. Email must be clean, name must split First/Last.
    const c = parseContact(
      "5125550147--jordan castellano--hello@example.com We're looking for more information on coolers and ice...",
    );
    expect(c.email).toBe('hello@example.com');
    expect(c.phone).toBe('5125550147');
    expect(c.firstName).toBe('Jordan');
    expect(c.lastName).toBe('Castellano');
    expect(hasContact(c)).toBe(true);
  });

  it('keeps genuine hyphens/dots/plus inside an email local-part', () => {
    // The "--" fix must not over-restrict: a single hyphen (or dot/plus) is a
    // valid local-part separator and stays part of the address.
    expect(parseContact('reach me at mary-jane.smith+parties@example.co.uk').email).toBe(
      'mary-jane.smith+parties@example.co.uk',
    );
  });

  it('handles the paste in email-first order too (the "--" after the domain)', () => {
    // "-" is legal in a domain as well, so the boundary has to hold on both
    // sides of the "@", not just the local-part.
    const c = parseContact('hello@example.com--jordan castellano--5125550147');
    expect(c.email).toBe('hello@example.com');
    expect(c.phone).toBe('5125550147');
    expect(c.firstName).toBe('Jordan');
    expect(c.lastName).toBe('Castellano');
  });

  it('accepts accented names in the paste, but only Latin script', () => {
    const c = parseContact('5125551234--José García--jose@example.com');
    expect(c.firstName).toBe('José');
    expect(c.lastName).toBe('García');
    // Cyrillic "А" (U+0410) renders exactly like Latin "A" on the board.
    expect(parseContact('5125551234--Аlex Castellano--a@example.com').firstName).toBeUndefined();
  });

  it('does NOT mint a name from prose "--" next to a phone number', () => {
    // A typed em-dash is not a contact dump. One-word segments, sign-offs, and
    // pronoun phrases must all stay unnamed — a wrong name reaches the CRM.
    expect(parseContact('call me at 5125551234 -- no rush').firstName).toBeUndefined();
    expect(parseContact('5125551234 -- Best regards').firstName).toBeUndefined();
    expect(parseContact('5125550147--austin--hello@x.com').firstName).toBeUndefined();
    expect(parseContact('5125551234 -- we are flexible').firstName).toBeUndefined();
  });

  it('only mines a name from a line that carries BOTH the phone and the email', () => {
    // capture.ts joins every user message with "\n"; a "--" in an earlier
    // message plus a number given later must not combine into a name, and two
    // one-word replies on adjacent lines must not read as First Last.
    const c = parseContact("we're doing a party -- big one -- Saturday\nmy number is 5125551234");
    expect(c.phone).toBe('5125551234');
    expect(c.firstName).toBeUndefined();
    expect(parseContact('Yes\nJordan--5125550147--hello@x.com').firstName).toBeUndefined();
    // A "--" aside beside a bare number on the SAME line is prose, not a paste.
    expect(parseContact('5125551234 -- big one').firstName).toBeUndefined();
    expect(parseContact('movie night--5125551234--see you then').firstName).toBeUndefined();
  });

  it('returns nothing identifiable for a plain message', () => {
    const c = parseContact('do you deliver to 78704?');
    expect(c.email).toBeUndefined();
    // a bare 5-digit zip must not be read as a phone
    expect(c.phone).toBeUndefined();
    expect(hasContact(c)).toBe(false);
  });

  it('handles empty input', () => {
    expect(hasContact(parseContact(''))).toBe(false);
  });
});
