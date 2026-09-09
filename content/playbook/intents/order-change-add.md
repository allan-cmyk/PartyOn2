---
id: order-change-add
tier: T3
freq_rank: 9
freq_confidence: provisional
channels: [sms, email, chat]
variables: [first_name, order_number]
tools: [lookup_order]
escalation_reason: null
escalation_override: >
  T4 immediately if the request signals heavy intoxication or minors ("everyone's
  hammered, send more vodka") — compliance block, no sale, human decides.
confidence_instruction: >
  Always output CONFIDENCE: 0.5 or lower — item changes touch money (charge amendments)
  and inventory; the draft is held for approval.
match_examples:
  - "I forgot to add the dank shots! Would you guys be able to add?"
  - "Two cases of water and a bunch of ice, appreciate it"
  - "Can we swap the seltzers for High Noons?"
---

## Answer (canonical)

DRAFT-AND-HOLD: adding/swapping items changes what we charge (amendment invoices) and
what ops picks — a human approves. The draft is warm, lists back what they asked for,
and says the request is FLAGGED for a human to confirm — never that the change is made,
queued, or "being processed" (the bot cannot touch orders, and a customer who hears
"processing" walks away believing it's handled; that's how an order shipped wrong,
2026-09-08 operator report). History note: order amendments have caused real
charge/order mismatches before (see charge-snapshot work) — that's exactly why this
never auto-confirms.

## SMS

You got it {{first_name}} — I've flagged that for the team. A human will confirm the change and any price difference by text before it's final. Anything else you'd like me to pass along?

## Email

Hi {{first_name}},

Happy to help! I've flagged your request for order #{{order_number}} — a human will
confirm the change and any price difference with you before anything is final. Anything
else you'd like me to pass along?

Party On Delivery

## Chat

I can't change orders myself, but I'll flag this for the team right now — drop your name
and number here (or text (737) 371-9700 with your order number) and a human will confirm
the change and any price difference before it's final.

## Notes for Allan

- Held as draft on purpose: approving the message = you committing to make the change.
  When the CRM can write draft amendments, this can tighten.
- 2026-09-08 rewrite: all renderings used to claim the change was happening ("adding
  that to your order now", "I've queued the change", "we'll confirm right away"). A
  customer believed it, nobody made the change, the order went out wrong. Every
  rendering now says the request is FLAGGED and a human confirms before it's final.
- The intoxication override is a compliance hard stop (TABC), tested in the golden set.
