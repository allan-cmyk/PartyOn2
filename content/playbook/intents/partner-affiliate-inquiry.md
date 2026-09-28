---
id: partner-affiliate-inquiry
tier: T3
freq_rank: 13
freq_confidence: provisional
channels: [sms, email, chat]
variables: [first_name]
tools: []
escalation_reason: null
escalation_override: >
  Affiliate PAYOUT questions ("when is payout, I haven't been paid since April") are
  money → escalate T4-standard (refund_keyword-adjacent), not a partner draft.
confidence_instruction: >
  Output CONFIDENCE: 0.5 or lower — real partnership conversations are
  relationship-building Allan does personally; drafts are held. Distinguish from
  spam-vendor: a real local business proposing something specific vs a cold blast.
match_examples:
  - "Hi Allan, it's Sloan of Sloan Seasonings — great to meet you at NACE. Does this week work to meet?"
  - "My client already did their alcohol pickup, but will for sure offer your services on the next one"
  - "hey just checking when payout is because i haven't got paid since april"  # → T4 override
  - "Not available tonight, looking forward to the next one!"  # networking-cruise RSVP
---

## Answer (canonical)

Real partners get Allan, not a bot. The draft: warm, short, specific to what they
proposed, and commits only to Allan following up. B2B networking-cruise RSVPs get a warm
host-voice ack (no business content). Payout questions: T4 — money questions from
partners are trust-critical.

Self-serve option (verified 2026-09-28): a real partner inquiry (business, affiliate,
venue, vacation rental) can book a 30-minute Partnership Call — a Google Meet video call —
at 123.partyondelivery.com/partnership-call (slots every day 10 AM–12 PM and 1–4 PM
Central, at least 4 hours ahead). Offer it alongside Allan's follow-up; skip it for RSVPs
and payout questions.

## SMS

Hey {{first_name}}, great to hear from you! Flagging this for Allan personally — he handles all partner stuff himself and will get back to you shortly. Want to skip the back-and-forth? Grab a 30-min video call: 123.partyondelivery.com/partnership-call

## Email

Hi {{first_name}},

Great to hear from you — partnerships are something Allan handles personally, so I've
flagged this straight to him and he'll follow up shortly. Appreciate you thinking of us!

If it's easier to just talk it through, you can book a 30-minute Google Meet video call
any day between 10 AM–12 PM or 1–4 PM Central here:
123.partyondelivery.com/partnership-call

Party On Delivery

## Board Email

<!-- First-person variant for the /admin/leads reply composer (a human sends this
     personally). The ## Email above stays third-person for the CRM auto-drafter. -->

Hi {{first_name}},

Great to hear from you — I handle partnerships personally and I'd love to explore how we
can work together. I'll follow up shortly with next steps. Appreciate you thinking of us!

If it's easier, grab a 30-minute Google Meet on my calendar at a time that works for you:
123.partyondelivery.com/partnership-call

## Chat

Partner stuff goes straight to Allan personally. Quickest route: book a 30-minute
Partnership Call (Google Meet video call) at 123.partyondelivery.com/partnership-call —
slots every day 10 AM–12 PM and 1–4 PM Central, at least 4 hours ahead. Or drop your
name, business, and number (or email info@partyondelivery.com) and he'll follow up
shortly.

## Notes for Allan

- The corpus is full of YOUR outreach getting replies (networking cruises, Eventective
  leads) — the bot must never cold-pitch on your behalf; it only handles inbound warmly.
- Affiliate program mechanics exist in-app (/affiliate); a future card could route
  "how do I become an affiliate" to the intake link once you bless that flow.
- 2026-09-28: every reply now offers the self-serve Partnership Call (30-min Google
  Meet, the partnership-call booking link) next to your personal follow-up — not for
  networking-cruise RSVPs or payout questions.
