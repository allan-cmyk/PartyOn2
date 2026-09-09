# Escalation policy

When the bot must stop being helpful and get a human. The keyword lists below MIRROR the
code-owned lists in `partyon-crm/apps/web/lib/ai-inbox/escalation-triggers.ts` — the
ingest lint fails if they drift. **Changing a trigger = a CRM pull request**, not a
playbook edit.

## When to escalate (any one is sufficient)

1. **Tier rule**: the matched intent card is T4 → always. T3 → draft held for approval.
2. **Keyword triggers** (mirrored below) fire regardless of intent match.
3. **Low confidence**: model confidence < 0.6 → held as draft (`low_confidence`).
4. **Negative sentiment** and **repeat contact** (same sender ≥3 messages in 24h with no
   human reply) — engine-computed.
5. **Judgment overrides** (the bot is told): minors/intoxication signals, safety
   incidents, anything about chargebacks or fraud, media/PR inquiries, and any request
   to change money (refund, cancel, price adjustment).

## Destinations (interim — until the CRM escalations queue is live)

| Class | Route | Examples |
|---|---|---|
| **Urgent** (day-of, safety, money-in-flight) | SMS to Allan's cell 512-576-7975 | boat leaving, delivery failed, minors/intoxication, injury |
| **Standard** (everything else T4 + T3 drafts) | info@partyondelivery.com | refund requests, complaints, quotes awaiting approval |

Once the CRM is deployed: escalations land in the `escalations` table (with reason +
confidence), replies are held as drafts (`ai-inbox-process-inbound.ts`), and notify rules
take over. The classes above map 1:1.

## Customer-facing ack (what the customer hears at T4)

Per-channel copy lives on each T4 card. The shape is always: acknowledge → name the next
step → give a time expectation. Never argue, never explain policy, never promise an
outcome ("Allan will make the final call on the refund" — not "you'll get a refund").

## Keyword mirror (source of truth: escalation-triggers.ts — do not edit here)

### refund_keyword
```
refund, chargeback, charge back, money back, never received, haven't received,
have not received, didn't receive, did not receive, still waiting,
cancel my subscription, cancel subscription, cancel my order, cancel order
```

### complaint_keyword
```
complaint, unacceptable, terrible, awful, worst, disappointed, frustrated,
angry, ridiculous, unhappy
```

### legal_keyword
```
lawyer, attorney, legal, lawsuit, sue, dispute, scam, fraud,
better business bureau, bbb
```

### safety_keyword
```
underage, under age, under 21, not 21, fake id, minors, teenager, high school,
drunk, wasted, hammered, intoxicated, blacked out, passed out, overserved,
over served, alcohol poisoning, too much to drink,
got hurt, injured, injury, ambulance, hospital, emergency
```

### repeat_phrase
```
fourth attempt, fourth time, third time, third attempt, once again, yet again,
asked again, asking again, texted again, called again, messaged again,
still no response, no response, follow up, following up, as i mentioned, like i said
```

### Other engine reasons (no keyword list)
`low_confidence` (< 0.6), `negative_sentiment`, `repeat_contact`

## Known gaps — resolved 2026-07-07 (operator review round)

Both gaps raised at v1 were fixed in a partyon-crm PR the same day this mirror updated:

- Bare "again" removed from `repeat_phrase` (it over-triggered on "can't wait to do it
  again!"); replaced with qualified variants (once/yet/asked/asking/texted/called/
  messaged again).
- New `safety_keyword` class: minors + intoxication + injury language now escalates by
  keyword, not just via the compliance prompt + T4 cards. Bare "minor" is deliberately
  excluded ("a minor issue" would false-positive) — the AI judgment override remains
  the primary net for phrasings like "he is 19."

NOTE: this mirror and the fork's `escalation-triggers.ts` must merge together — the
ingest lint fails on either side alone.

## Web-chat-only triggers — NOT part of the CRM mirror above

Source of truth: `src/lib/chat/escalation-keywords.ts`
(`ORDER_ISSUE_KEYWORDS`, `HANDOFF_PHRASES`). These exist because the web chat replies
instantly with NO human in the loop (the CRM inbox drafts-and-holds, so a human always
sees those threads); anything a human must act on has to email the operator directly.
Added 2026-09-08 after two misses: customers reported orders charging a wrong fee, the
bot promised it would be "corrected right away", no keyword fired, and nobody was
notified.

- `order_issue` — customer-side phrases signalling a problem with an existing order or
  checkout ("wrong item", "still including the delivery fee", "forgot to add", "can't
  check out"). Fires the operator email AND the operator SMS (below).
- Operator SMS pager (2026-09-08): every customer-side escalation reason also texts
  Allan's cell via the Twilio REST API (`src/lib/chat/escalation-sms.ts`; env
  `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER` +
  `OPS_ALERT_PHONE`, inert until all four are set — GHL is abandoned, 2026-09-08).
  `handoff` stays email-only so routine promised follow-ups don't page.
- `handoff` — matched against the BOT'S OWN reply: whenever it tells a customer a human
  will follow up ("I'm pinging Allan right now", "a human will pick this up"), the
  operator email fires so the promise is always true. Customer-side reasons win when
  both match.
- Separately, the web chat also emails the operator whenever a conversation captures a
  lead (contact info given) and no escalation email went out on that turn.

Changing these lists is a normal web-repo edit (no CRM PR needed) — they are not
ingested by the CRM. If the CRM ever gains equivalent inbox alerting, fold them into
the shared taxonomy properly.
