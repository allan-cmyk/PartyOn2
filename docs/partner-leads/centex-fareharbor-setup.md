# Centex Boat Rentals × Party On Delivery — Setup Guide

This is the operator's handout for setting up the Party On Delivery lead-capture
flow on Centex's FareHarbor booking pipeline. **Total time: ~15 minutes.**

> **Internal note** (delete before sharing with Centex): the GHL workflow side
> is documented separately in [ghl-workflow-setup.md](./ghl-workflow-setup.md).
> That has to be live before this setup actually produces follow-up SMS — but
> the lead capture itself works the moment Centex finishes Steps 1–3 below.

There are three possible setup branches depending on what's already in place at
Centex. **Start with question 1 below** to figure out which branch applies.

---

## Q1: Does your FareHarbor account already have a webhook configured?

Log in to FareHarbor → **Settings → Integrations → Webhooks**. Is there
already a webhook URL listed?

- **No (most operators)** → Use **Branch A** below. Easiest path.
- **Yes, but I'm willing to send to a Zapier or alternate endpoint** →
  Branch A still works (we provide the URL). You'd be replacing your
  existing one — only do this if you don't mind switching.
- **Yes, and I rely on it for my own CRM** → Use **Branch B** (API polling).
  We never sit in front of your booking pipeline.
- **I don't want to touch the webhook at all** → Use **Branch C** (email
  CTA only). Lower capture but zero risk.

---

## Branch A — Direct FareHarbor webhook (~5 minutes)

### Step 1: Paste the Party On Delivery webhook URL

In FareHarbor → **Settings → Integrations → Webhooks**, paste this URL:

```
https://partyondelivery.com/api/webhooks/partner-lead?source=fareharbor
```

Add a header:

```
X-API-Key: <KEY WE WILL PROVIDE YOU SEPARATELY>
```

> Treat the key like a password — don't paste it in email or chat. We send
> it through our admin panel directly.

Save and toggle the webhook **active**.

### Step 2: Add an opt-in checkbox to your booking form

In FareHarbor → **Settings → Custom Fields → Book Form Customization**, click
**Add Custom Field**. Use exactly these settings:

| Field | Value |
|---|---|
| **Type** | Checkbox |
| **Title** | `Free alcohol delivery info from Party On Delivery` |
| **Default state** | Unchecked (do NOT pre-check) |
| **Required** | No |
| **Help text** | `By checking this box you agree to receive marketing SMS and email from Party On Delivery. Msg & data rates may apply. Reply STOP to unsubscribe.` |

Save. The field will show up at the bottom of your booking form.

> **Important:** The title must contain "party on delivery" or "alcohol
> delivery" (case-insensitive). That's how our endpoint identifies which
> field is the opt-in.

### Step 3: Add a CTA to your confirmation email *(recommended, optional)*

In FareHarbor → **Settings → Email Templates → Confirmation Email**, paste
this HTML block above the footer:

```html
<div style="margin: 24px 0; padding: 20px; background: #0B74B8; border-radius: 8px; text-align: center; color: #ffffff; font-family: Arial, sans-serif;">
  <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 20px;">
    Make your Lake Travis trip legendary
  </h3>
  <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 14px;">
    Free alcohol delivery on orders $150+ from Party On Delivery —
    delivered to your dock, hotel, or short-term rental.
  </p>
  <a href="https://partyondelivery.com/partners/centex-boat-rentals/welcome?utm_source=fareharbor&utm_medium=confirmation_email&utm_campaign=centex_postbook"
     style="display: inline-block; padding: 12px 24px; background: #F2D34F; color: #111111; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Claim your free delivery →
  </a>
</div>
```

Save.

### Step 4: Test it

1. Open `https://fareharbor.com/embeds/book/centexboatrentals/` in a
   private/incognito browser.
2. Add a test booking with your own email and phone, **check the opt-in
   checkbox**, and complete checkout.
3. Within 30 seconds, log into your Party On Delivery admin panel at
   `/admin/leads` and confirm your test lead appears.
4. You should also receive an SMS from us — the GHL automation fires
   immediately on opt-in.

If anything is missing, see the troubleshooting section at the bottom.

---

## Branch B — API polling (~10 minutes; FareHarbor approval required)

This path doesn't touch your existing webhook. We pull bookings from
FareHarbor's External API every 15 minutes, look at the opt-in checkbox,
and create leads.

### Step 1: Request API access from FareHarbor

Send this email to `support@fareharbor.com`:

> Subject: Request for External API access — Centex Boat Rentals
>
> Hi FareHarbor team,
>
> I'd like to grant Party On Delivery (a partner of ours) read-only API
> access to my Centex Boat Rentals account so they can pick up bookings
> where customers have opted in to their alcohol delivery service.
>
> Please send me an Application Key and User Key I can share with them.
>
> Thanks,
> [Your name]

FareHarbor typically responds in 1–5 business days with credentials.

### Step 2: Forward keys to Party On Delivery

Once you have the `X-FareHarbor-API-App` and `X-FareHarbor-API-User`
values, share them with us via the admin panel (we'll give you a secure
URL). Don't paste them into email.

### Step 3: Add the opt-in checkbox

Same as **Step 2 of Branch A** above. The field is read by the API
poller exactly the same way the webhook reads it.

### Step 4: Add the confirmation email CTA *(recommended)*

Same as **Step 3 of Branch A** above.

---

## Branch C — Confirmation email only (~3 minutes; zero FareHarbor changes)

If you don't want to touch the booking form or the webhook at all, just add
the email CTA from **Step 3 of Branch A**. Customers click the button →
land on our co-branded welcome page → enter their info themselves.

Capture rate is lower (~5–15% click-through on confirmation emails vs.
~20–35% on in-flow checkboxes), but it's the lowest-friction path and
ships immediately.

---

## Troubleshooting

### "Webhook fired but no lead shows up in /admin/leads"

- Check the `Skip reason` field on the most recent request in your
  FareHarbor webhook delivery log. Common reasons:
  - `Customer did not opt in (checkbox unchecked)` — expected.
  - `Opt-in custom field not found on booking — merchant setup incomplete` —
    the checkbox title doesn't contain "party on delivery" or "alcohol
    delivery." Fix the title.
  - `No email or phone on booking contact` — booking went through without
    contact info. Rare.

### "I'm getting test leads from real customers who didn't check the box"

That should be impossible — the webhook silently skips unchecked bookings.
Double-check the field title contains the right substring. If you see leads
with `source_widget = PARTNER_FAREHARBOR_WEBHOOK` from someone who says
they didn't opt in, contact us immediately so we can audit.

### "I want to change the SMS message we send customers"

Message copy lives in our GoHighLevel pipeline, tagged
`partner:centex-boat-rentals`. We can edit it any time without code
changes — let us know what you want it to say.

---

## What customers experience

1. Customer books a boat trip with Centex on FareHarbor.
2. On the booking form they see one extra optional checkbox at the bottom:
   *"Free alcohol delivery info from Party On Delivery."*
3. If they check it, they get an SMS within ~30 seconds:
   *"Hi {first_name}! Saw you're booked with Centex Boat Rentals for
   {trip_date}. Want free delivery on $150+ of drinks to the dock? Reply
   YES."*
4. If they don't check it but read the confirmation email, they can still
   click the CTA and land on our welcome page where they can opt in
   themselves.
5. Either way: their info shows up in your Party On Delivery admin panel
   at `/admin/leads`, attributed to Centex.
