---
id: cruise-order-deadline
tier: T2
freq_rank: 17
freq_confidence: provisional
channels: [sms, email, chat, voice]
variables: [first_name]
tools: []
escalation_reason: null
confidence_instruction: >
  High confidence for "is it too late / when do we need to order by." Online ordering
  closes 24 hours before the delivery window (lead-time-24h-minimum). If their delivery
  is less than 24 hours away, never promise it — route them to the text line AND flag so
  a human decides.
match_examples:
  - "Quick question, don't the drinks have to be ordered 48 hours in advance to guarantee delivery? Wouldn't it be too late for tomorrow's 11am boat?"
  - "We're on the 3:30 boat tomorrow, is it too late to get drinks delivered?"
  - "When do we need to place the order by?"
---

## Answer (canonical)

The verified policy (ADR-0010, 2026-09-13): every online order — storefront and boat
dashboards — must be placed at least 24 hours before the delivery window starts, and
checkout refuses anything sooner. 48 hours ahead is still the recommended window for
guaranteed availability. More than 24 hours out: they can still order online. Less than
24 hours out: online ordering is closed — never promise delivery; send them to text
(737) 371-9700, where the team decides case-by-case and may hand-build an invoice, and
flag the conversation.

## SMS

Hey {{first_name}}! Online orders close 24 hrs before your delivery window (48 hrs ahead is safest). Cutting it closer? I've flagged your date — a human will look and tell you honestly if we can still help. No promises, but we'll try!

## Email

Hi {{first_name}},

Online orders need to be placed at least 24 hours before your delivery window starts —
48 hours ahead is the safest bet. If you're still outside that window, fill your cart now
at partyondelivery.com/order (or your boat dashboard link) and you're set.

If your delivery is less than 24 hours away, online checkout is closed. I've flagged your
date so someone can take a look and tell you honestly whether we can still help — no
promises.

Party On Delivery

## Chat

Online orders need to be in at least 24 hours before your delivery window (48 hours ahead
is the safest bet) — checkout won't take anything sooner. More than 24 hours out? Order
now at partyondelivery.com/order or through your boat dashboard link. Less than 24 hours
away? Text (737) 371-9700 with your boat date/time — the team decides case-by-case and
can't promise it, but they'll tell you straight whether it's possible.

## Voice

State the 24-hour online cutoff (48 hours recommended). For anything inside 24 hours take
name/number/date, make no promise, and flag it for a fast callback.

## Notes for Allan

- 2026-09-14: rewritten for ADR-0010 (24-hour minimum on every customer checkout,
  dashboards included). The 2026-07-07 "no same-day cutoff — case-by-case" answer is
  superseded; inside 24 hours the only path is the text line → an operator-built invoice.
- Order #527 (the incident behind ADR-0010) was exactly this card's scenario: a next-day
  boat delivery ordered about 20 hours ahead.
