---
id: corporate-event-inquiry
tier: T3
freq_rank: 25
freq_confidence: provisional
channels: [sms, email, chat, voice]
variables: [first_name]
tools: []
escalation_reason: null
confidence_instruction: >
  Output CONFIDENCE: 0.5 or lower — corporate deals are custom (invoices, volume);
  drafts gather specifics and are held for approval. NEVER offer NET payment terms —
  we don't do them; invoices are paid before the event.
match_examples:
  - "We're planning a company offsite for 70 guests"
  - "Can you invoice our company for a client event?"
  - "Do you offer corporate accounts?"
---

## Answer (canonical)

Verified: we do corporate events end-to-end — itemized quote/invoice to approve (finance
teams like it), delivery + optional bartenders + setup; invoices are payable by
corporate card, ACH, or wire before the event. We do NOT offer NET payment terms — if
asked directly, say invoices are paid up front, warmly and without apology. Drafts
confirm the offering, gather date/headcount/venue/budget, and promise Allan's follow-up
with an itemized proposal. Self-serve option (verified 2026-09-28): planners who'd rather
talk it through can book a 15-minute Party Consultation phone call at
123.partyondelivery.com/planning-call (slots every day 10 AM–12 PM and 1–4 PM Central,
at least 4 hours ahead).

## SMS

Hey {{first_name}}! We do corporate events all the time — itemized quote/invoice your finance team can approve, delivery + bartenders + setup if you want it. Reply with date, headcount + venue and Allan will send a proposal. Or book a 15-min call: 123.partyondelivery.com/planning-call

## Email

Hi {{first_name}},

We handle corporate events end-to-end: premium spirits and curated wine, full bar setups
and TABC-certified bartenders if you want them, and an itemized quote/invoice your
finance team can approve before anything's locked. Invoices can be paid by corporate
card, ACH, or wire.

Reply with your date, headcount, venue, and rough budget per person, and Allan will send
over a proposal. Rather talk it through first? Book a 15-minute phone call any day
between 10 AM–12 PM or 1–4 PM Central here:
123.partyondelivery.com/planning-call

Party On Delivery

## Board Email

<!-- First-person variant for the /admin/leads reply composer (a human sends this
     personally). The ## Email above stays third-person for the CRM auto-drafter. -->

Hi {{first_name}},

We handle corporate events end-to-end: premium spirits and curated wine, full bar setups
and TABC-certified bartenders if you want them, and an itemized quote/invoice your
finance team can approve before anything's locked. Invoices can be paid by corporate
card, ACH, or wire.

Reply with your date, headcount, venue, and rough budget per person, and I'll put
together a proposal for you. Rather talk it through first? Grab a 15-minute call on my
calendar here:
123.partyondelivery.com/planning-call

## Chat

We do corporate events end-to-end — itemized quote/invoice for your finance team,
delivery, bartenders, setup. Want to talk it through? Book a 15-minute phone call at
123.partyondelivery.com/planning-call (slots every day 10 AM–12 PM and 1–4 PM Central).
Or text your date, headcount, and venue to (737) 371-9700 and Allan will send a proposal.

## Voice

Confirm the offering; capture company, date, headcount, venue, budget; promise a
proposal. Offer to text the planning-call booking link if they'd rather schedule a call.

## Notes for Allan

- Verified 2026-07-07: NET terms are NOT offered — removed from this card and from the
  /faqs copy + landing-pages directory description the same day. Invoices are paid
  before the event (corporate card / ACH / wire, per the corporate landing config).
- 2026-09-28: every channel now offers the self-serve 15-min Party Consultation
  (planning-call booking link) next to the date/headcount/venue ask — same link the
  corporate lander's planning-call CTA uses.
