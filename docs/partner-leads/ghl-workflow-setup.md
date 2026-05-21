# GHL Workflow Setup — Partner Lead Follow-up

This is the internal ops doc for building the single GHL workflow that
auto-contacts every partner lead. Should take **~10 minutes** end-to-end.

## How GHL merge tags work (read this first)

You'll insert contact merge tags into SMS and email bodies many times in
this doc. Three things to know up front so you don't fight the UI:

1. **Don't hand-type `{{contact.xxx}}`.** GHL marks hand-typed tags as
   invalid (red error: *"There are issues in your custom variables, please
   fix them before saving."*). Every merge tag must be inserted via the
   picker.
2. **The picker is the ⚡ lightning-bolt icon** in the SMS/email toolbar.
   Click it → expand **Contact** → expand **Custom Fields** → click the
   field you want. GHL inserts a validated reference automatically.
3. **If a field you just created via API isn't in the picker, hard-refresh
   the browser tab** (`Cmd+Shift+R` / `Ctrl+Shift+R`). GHL aggressively
   caches the custom field list in the workflow editor.

Throughout this doc, `[Field Name]` inside SMS/email bodies means
*"insert this field via the picker"* — replace each one by clicking the
⚡ picker rather than typing it out.

## Prerequisites (one-time, already done)

- [x] 10 GHL custom fields exist (`partner_slug`, `partner_business_name`,
  `partner_perk`, `promo_code`, `source_widget`, `booking_ref`,
  `trip_date_display`, `trip_item_name`, `group_size`, `lead_admin_url`)
- [x] `?promo=<CODE>` URLs **auto-apply the discount** at checkout. Handled
  by `PromoCodeAutoApply` (root-layout component) — reads the param on
  landing, stashes in localStorage, fires `POST /api/v1/cart/discount`
  as soon as the cart has items. Customer sees a "Code X ready" badge
  until it applies. Any link you send (SMS, email, etc.) of the form
  `https://partyondelivery.com/order?promo=CENTEXBOATRENTALS` Just Works.
- [x] Centex affiliate row in our DB has a `webhookApiKey`
- [x] `notifyPartnerLead()` pushes contacts directly via GHL's Contacts API
- [ ] `GHL_API_PIT` and `GHL_LOCATION_ID` set in Vercel env (do this next)

## Step 1 — Add two env vars in Vercel (~2 min)

In **Vercel → Project Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `GHL_API_PIT` | *the GHL Private Integration Token you generated* |
| `GHL_LOCATION_ID` | `8sHw5nhRsBMoBtOH3dp4` |

Scope: **Production** (and Preview if you want test deploys to push to GHL too).

**Redeploy** to pick up the env vars — push any commit or hit "Redeploy" on
the latest deployment.

> The legacy `GHL_PARTNER_LEAD_WEBHOOK_URL` is no longer needed and can be
> removed once you've verified the new path works.

## Step 2 — Build the workflow (~7 min)

The architecture: our backend creates the GHL contact and applies the
`partner:<slug>` tag. The workflow triggers on that tag being added — no
inbound webhook step, no field mapping.

### 2a. Create the workflow

GHL → **Automation → Workflows → + Create Workflow → From Scratch**.

Name: **Partner Lead — Opt-in Follow-up**

### 2b. Configure the trigger

**Add New Trigger → Contact Tag → Tag Added**

- **Workflow Trigger Name**: Partner Lead New
- **Filter**: **Tag** `is added` `partner-lead-new`

That single universal tag is what our backend stamps on every partner lead
(in addition to a per-partner `partner:<slug>` tag for reporting). One tag
filter, every partner, zero workflow edits when adding new partners.

Save Trigger.

> **Note**: GHL's Tag Added trigger filter is exact-match only — it doesn't
> support "tag contains." That's why we use `partner-lead-new` as the
> trigger tag rather than trying to match `partner:*` as a prefix.

### 2c. Branch: does the contact have a phone number?

**Add Action → If/Else Condition** (or "Conditional Logic" in newer GHL UIs).

Condition: `Phone` `is not empty`

### 2d. TRUE branch (has phone) — SMS first, email fallback

#### Action: Send SMS

Build this body using the ⚡ picker for each bracketed field (see [How GHL
merge tags work](#how-ghl-merge-tags-work-read-this-first) above):

```
Hi [First Name]! Just saw you booked with [Partner Business Name] 🚤

Get [Partner Perk] on $150+ of drinks delivered straight to your dock with code [Promo Code]. Reply YES and I'll text you the link. Reply STOP to opt out.

— Party On Delivery
```

| Bracketed text | Picker path |
|---|---|
| `[First Name]` | ⚡ → Contact → First Name *(standard field, not under Custom Fields)* |
| `[Partner Business Name]` | ⚡ → Contact → Custom Fields → Partner Business Name |
| `[Partner Perk]` | ⚡ → Contact → Custom Fields → Partner Perk |
| `[Promo Code]` | ⚡ → Contact → Custom Fields → Promo Code |

Once inserted, the SMS body internally reads:

```
Hi {{contact.first_name}}! Just saw you booked with {{contact.partner_business_name}} 🚤

Get {{contact.partner_perk}} on $150+ of drinks delivered straight to your dock with code {{contact.promo_code}}. Reply YES and I'll text you the link. Reply STOP to opt out.

— Party On Delivery
```

The character counter at the bottom-right should read **~250 characters**.
If it shows the literal merge-tag text (~190 chars) instead, you typed
them as plain text — clear and re-insert via the picker.

> **Why `promo_code` instead of `{{contact.partner_slug | upper}}`?**
> GHL's SMS engine doesn't reliably apply Liquid filters like `| upper`.
> Our backend pre-uppercases the value (it stores the affiliate's `code`
> field, which is already uppercase, e.g. `CENTEXBOATRENTALS`). Use
> `Promo Code` anywhere you need the uppercased version of the slug.

#### Preview & send-test before continuing

In the SMS action, find **Test Workflow** or **Send Test SMS** (button
varies by GHL flavor). Pick one of the seeded test contacts as the
recipient — they're already loaded with the right field values:

- `TEST UniversalTag-DeleteMe` (`+15125550196`) — the cleanest test
- `TEST DirectAPI-DeleteMe` (`+15125550197`)
- `TEST PartnerLead-DeleteMe` (`+15125550199`)

The previewed SMS should read:

> Hi TEST! Just saw you booked with Centex Boat Rentals 🚤
> Get Free Delivery on $150+ of drinks delivered straight to your dock with code CENTEXBOATRENTALS. Reply YES and I'll text you the link. Reply STOP to opt out.
> — Party On Delivery

If you see actual `{{contact.xxx}}` substrings in the preview, the merge
tag was hand-typed. Clear it and re-insert via ⚡.

#### Action: Wait — event-based with 24h timeout

GHL doesn't have a mid-workflow "has the contact replied" condition. The
right primitive is an **event-based Wait**:

**Add Action → Wait**
- **Wait Type**: `Wait For An Event` (sometimes "Event-Based Wait")
- **Event**: `Contact Reply` *(some UIs name this "Inbound Message" or
  "Customer Replied")*
- **Timeout**: `1 Day`
- After saving, the Wait node will sprout two output paths labeled
  **Contact Reply** and **Time Out**. Drop the next steps onto each path
  as described below.

#### Contact Reply branch — only filter out opt-outs

> **Design choice that saves a lot of clicking**: don't try to classify
> every kind of affirmative ("yes", "y", "yeah", "sure", "send", "ok",
> emojis, typos, etc.). The customer already opted in by submitting the
> form; getting ANY reply at all is high-intent engagement. Just send them
> the link.
>
> The only group we DO need to detect is **opt-outs**, because we have to
> stop messaging those people. That's a short, finite list.

Under the **Contact Reply** node, click the dashed "Please select action"
box and chain these:

**1. Add Action → If/Else Condition** — name it "Opt-out check"

Condition field: **Replied message** *(GHL may label this "Last Customer
Reply", "Last Inbound Message", or "Trigger Reply" depending on UI
version — all variants point to the same thing.)*

Build with these OR rows:

| Row | Field | Operator | Value |
|---|---|---|---|
| 1 | Replied message | Contains | `stop` |
| 2 | Replied message | Contains | `unsubscribe` |
| 3 | Replied message | Contains | `not interested` |
| 4 | Replied message | Contains | `cancel` |
| 5 | Replied message | Contains | `remove me` |
| 6 | Replied message | Equals | `no` |

> **Note**: GHL automatically marks contacts DND when they reply STOP for
> SMS compliance, but we still want our own tag so we can suppress
> future emails and segment them out of campaigns. The list above also
> catches softer opt-outs ("not interested", "remove me", "cancel") that
> the auto-STOP filter misses.

**TRUE branch (opted out)** → Add Action → **Add Tag** → `partner-lead-optout` → END

**FALSE branch (anything else — affirmative, question, gibberish, all of it)** →

1. **Send SMS** (insert `[Promo Code]` via ⚡):
   ```
   Awesome! Order here, code [Promo Code] auto-applies the perk:
   https://partyondelivery.com/order?promo=[Promo Code]
   ```

2. *(Optional, recommended)* **Add Action → Add Tag** → `partner-lead-needs-followup`
   to mark them for a quick human review. Useful because some replies in
   this bucket will be real questions ("can you deliver to Lake LBJ?")
   that deserve a personal touch beyond the link.

3. *(Optional)* **Add Action → Internal Notification** to ping ops with
   a link to the conversation. Configure who gets it under
   GHL → Settings → My Profile → Notification preferences.

> **Why this is simpler than detecting affirmatives**:
> - 6 opt-out rows beats 12+ affirmative rows
> - No risk of missing real engagement signals like "👍", "do it",
>   "let's go", "what about Sunday?" — they all get the link
> - We don't pause to classify intent before responding

#### Time Out branch (24h elapsed, no reply) → Send fallback email

- Subject: `Last call: [Partner Perk] for your [Partner Business Name] trip`
- Body: friendly nudge, button → `https://partyondelivery.com/order?promo=[Promo Code]`
- All bracketed fields inserted via the ⚡ picker (Email editor has the
  same picker as SMS — look for the lightning bolt above the email body)

> **Note**: the URL with `?promo=[Promo Code]` needs the merge tag inserted
> via the picker, *not* hand-typed. GHL renders merge tags inside hyperlink
> URLs the same way it does in body text — just insert via ⚡ normally and
> the rendered link will read `…/order?promo=CENTEXBOATRENTALS`.

### 2e. FALSE branch (no phone) — Email immediately

#### Action: Send Email
- Subject: `Your [Partner Perk] from [Partner Business Name]`
- Body: same offer copy as the FALSE-reply branch above, CTA button →
  `https://partyondelivery.com/order?promo=[Promo Code]`
- All bracketed fields inserted via the ⚡ picker

#### Action: Wait 24 hours → If contact hasn't ordered, send follow-up email
*(Optional — same fallback nudge.)*

### 2f. Publish

Toggle the workflow from **Draft → Published** (top right).

## Step 3 — Smoke test (~2 min)

The fastest test path:

1. On your phone, open an **incognito** browser and visit:
   `https://partyondelivery.com/partners/centex-boat-rentals`
   *(This sets the `ref_code` cookie attributing you to Centex.)*
2. Then navigate to:
   `https://partyondelivery.com/partners/centex-boat-rentals/welcome`
3. Fill in your name + your real cell number + your email, submit.
4. Within ~30 seconds you should:
   - Get the SMS on your phone
   - See your lead at `https://partyondelivery.com/admin/leads`
   - See a new GHL contact tagged both `partner-lead-new` and
     `partner:centex-boat-rentals` with all 10 custom fields populated

If the SMS doesn't fire:
- Vercel logs should show `[GHL Partner Lead API] Upserted contact <id> for centex-boat-rentals ...`. If you see that line, the contact made it to GHL — issue is on the workflow side.
- GHL → Automation → Workflows → your workflow → **Stats** tab shows every trigger fire. Look for your test contact and check which action it stopped at.

## What customers actually experience

1. Customer books a Centex boat trip on FareHarbor.
2. Checks our opt-in checkbox at the bottom of the booking form.
3. FareHarbor's webhook fires → our `/api/webhooks/partner-lead` endpoint
   creates a Lead in our DB → our backend upserts the customer into GHL
   with both `partner-lead-new` and `partner:centex-boat-rentals` tags.
4. GHL's "Tag Added: partner-lead-new" trigger fires.
5. They get the SMS within ~30s. If they reply YES, they get the order
   link with the promo code auto-applied.

## Adding a new partner later (zero GHL changes)

For each new partner — say, an Airbnb host using Hostfully:

1. Create the partner's `Affiliate` row in our DB (or via `/admin/affiliates`)
2. Generate their `webhookApiKey`
3. Hand them the setup doc from `docs/partner-leads/centex-fareharbor-setup.md`
   (templated by partner slug)

The GHL workflow needs **no changes** — every partner lead gets the
`partner-lead-new` tag, so the existing trigger fires automatically. SMS
copy stays generic because it references `{{contact.partner_business_name}}`
dynamically — Centex's customer sees "Centex Boat Rentals" in the SMS;
the next partner's customer sees their partner's name.

If you want per-partner copy variations later (e.g. "boat trip" vs "Airbnb
stay"), clone the workflow and tighten the trigger to
`Tag is added: partner:centex-boat-rentals` exactly (using the per-partner
segmentation tag instead of the universal trigger tag). The simple version
handles 90% of partners.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Red error: *"There are issues in your custom variables, please fix them before saving"* | Hand-typed `{{contact.xxx}}` instead of using picker | Clear the field, re-insert via ⚡ |
| Custom field doesn't appear in the picker | GHL UI cache is stale | Hard-refresh the workflow tab (`Cmd+Shift+R`) |
| Picker shows global values only, no "Contact" tree | Wrong picker icon | Look for ⚡ specifically; some UIs hide contact tags behind a different button labeled "Insert" or `{ }` |
| Workflow trigger never fires | Tag isn't being applied | Check Vercel logs for `[GHL Partner Lead API] Upserted contact …`. If you see it, check GHL → Contacts → search for the test contact and confirm the `partner-lead-new` tag is present |
| Test SMS preview shows literal `{{contact.xxx}}` strings | Merge tag was typed not picked | Re-insert via picker |
| Test contact's preview shows blank for some fields | The seeded contacts only have fields we backfilled — re-run smoke test with a fresh real submission for full validation | Submit at `/partners/centex-boat-rentals/welcome` from a real browser |
| Reply-classification keyword list misses something common | We started with a conservative set (`yes`/`y`/`sure`/`send`/etc.) — review GHL → Conversations after first 50 leads | Add the missed keywords to the affirmative If/Else condition (OR branch) |
| Customer reply is a question and the workflow sends them the link anyway | Expected — we always include the link even on the unclear path so the customer can self-serve. The internal notification + user assignment makes sure a human follows up | Adjust the unclear-path SMS copy if the auto-link feels too cold |
