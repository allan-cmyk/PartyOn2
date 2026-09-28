---
id: callback-request
tier: T2
freq_rank: 27
freq_confidence: provisional
channels: [sms, email, chat, voice]
variables: [first_name]
tools: []
escalation_reason: null
confidence_instruction: >
  High confidence when the customer asks for a call or leaves a number to be called.
  Ack + flag so a human actually calls — never pretend a call is scheduled by a system.
match_examples:
  - "Hi! Please call me back at (555) 605-4966"
  - "Can someone give me a call about an order for this weekend?"
  - "Yes, sorry, I will give you a call back in a few minutes"
---

## Answer (canonical)

Confirm the number, promise the callback, flag the conversation (standard) — urgent if
their event is same-day. If they said THEY'LL call US, just warm-ack.

Self-serve option (verified 2026-09-28): they can also pick a time themselves — a
15-minute Party Consultation at 123.partyondelivery.com/planning-call (event planning,
quotes), or a 10-minute Boat Call at 123.partyondelivery.com/boat-call when it's clearly
about a Lake Travis boat/cruise. Slots run every day 10 AM–12 PM and 1–4 PM Central, booked
at least 4 hours ahead — so anything happening today stays on the callback/text path.
Offer the link alongside the callback, never instead of it.

## SMS

You got it {{first_name}} — flagged for a callback at this number. If it's about something happening today, reply "TODAY" and I'll mark it urgent. Rather pick a time yourself? Book a 15-min call: 123.partyondelivery.com/planning-call

## Email

Hi {{first_name}},

Absolutely — I've flagged your message for a callback. If it's about an event happening
today, reply "TODAY" and it jumps the line. Otherwise expect a call shortly during
delivery hours (10 AM – 9 PM Mon–Sat).

Rather pick a time yourself? You can book a 15-minute phone call any day between
10 AM–12 PM or 1–4 PM Central (at least 4 hours ahead) here:
123.partyondelivery.com/planning-call

Party On Delivery

## Board Email

<!-- First-person variant for the /admin/leads reply composer (a human sends this
     personally). The ## Email above stays third-person for the CRM auto-drafter. -->

Hi {{first_name}},

Absolutely — got your message and I'll give you a call. If it's about an event happening
today, reply "TODAY" and I'll bump you to the top. Otherwise I'll reach out during
delivery hours (10 AM – 9 PM Mon–Sat).

If it's easier, grab a 15-minute call on my calendar at a time that works for you:
123.partyondelivery.com/planning-call

## Chat

Sure thing — drop your number here and I'll flag it for a callback. If it's about
something today, say so and it jumps the line. (Fastest path is always texting
(737) 371-9700.)

Rather pick a time yourself? Book a 15-minute phone call at
123.partyondelivery.com/planning-call — or, if it's about a Lake Travis boat/cruise, a
10-minute Boat Call at 123.partyondelivery.com/boat-call instead. Slots run every day
10 AM–12 PM and 1–4 PM Central, at least 4 hours ahead.

## Voice

Caller already called — this is the message-taking path: name, number, topic, urgency.
If they'd rather pick a time, offer to text them the planning-call booking link (boat-call
for cruise questions).

## Notes for Allan

- 258 inbound calls in the corpus had no text body — the receptionist phase is where
  this card really earns; until then it keeps SMS/email callback asks from dying.
- 2026-09-28: added the self-serve booking links (planning-call; boat-call for cruise
  context) as an option next to the callback — the "Allan will call you" path stays.
  Links always end the sentence with a space or line break, never punctuation.
