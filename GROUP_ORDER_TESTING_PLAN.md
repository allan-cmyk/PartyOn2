# Group Orders Individual Checkout - Full Testing Plan

## Instructions for Claude

You are helping test the **individual checkout** group ordering system for PartyOn Delivery, an alcohol delivery service in Austin, TX.

**NEW MODEL:** Each participant joins, shops, and checks out INDEPENDENTLY. The group perk is FREE DELIVERY for everyone.

**Your role:**
1. Guide the user through each test step
2. Ask them to report what they see after each action
3. Mark tests as PASS or FAIL based on their feedback
4. Help troubleshoot any issues encountered
5. Keep track of progress through the plan

**Key URLs:**
- Production site: https://party-on-delivery.vercel.app
- Create group order: https://party-on-delivery.vercel.app/group/create
- Host dashboard: https://party-on-delivery.vercel.app/group/dashboard
- Products page: https://party-on-delivery.vercel.app/products

**Testing requires:**
- Two browser windows (one regular for Host, one incognito for Participant)
- Shopify discount code `GROUPFREEDELIVERY` must be set up (Free Shipping)
- Webhook for Order creation must point to the app

**Start by asking:**
"Are you ready to begin testing? Please open two browser windows - one regular (Host) and one incognito (Participant)."

---

## Prerequisites Checklist

Before testing, verify in Shopify Admin:

- [ ] Discount code `GROUPFREEDELIVERY` exists (Free Shipping, no minimum)
- [ ] Webhook for Order creation points to `https://party-on-delivery.vercel.app/api/webhooks/shopify`

---

## Test 1: Create Group Order (HOST)

**Browser:** Regular window (Host)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Go to `/group/create` | Create form page loads |
| 1.2 | Fill in: Your Name = "Test Host" | Input accepted |
| 1.3 | Fill in: Event Name = "Test Party" | Input accepted |
| 1.4 | Select Delivery Date (72+ hours from now) | Date picker enforces minimum |
| 1.5 | Select Time Window (any slot) | Dropdown works |
| 1.6 | Fill Address: 123 Test St, Austin, TX 78701 | Address fields work |
| 1.7 | Click "CREATE GROUP ORDER" | Redirects to `/group/dashboard` |
| 1.8 | Verify dashboard shows order | Shows share code, event name, FREE DELIVERY badge |

**After Test 1, ask:** "What is the share code displayed on the dashboard?"

**Record share code:** _______________

---

## Test 2: Share Modal

**Browser:** Host window

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Click "SHARE" button on dashboard | Share modal opens |
| 2.2 | Check share modal contents | Shows code, QR code, copy button |
| 2.3 | Click copy link button | Link copied to clipboard |

**After Test 2, ask:** "Please paste the share link you copied."

**Record share URL:** _______________

---

## Test 3: Join Group Order (PARTICIPANT)

**Browser:** Incognito window (Participant)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Navigate to the share URL | Landing page loads |
| 3.2 | Verify page shows event name | "Test Party" displayed |
| 3.3 | Verify "FREE DELIVERY" badge visible | Green badge with checkmark |
| 3.4 | Verify delivery details shown | Date, time, address displayed |
| 3.5 | Enter Name: "Test Participant" | Input accepted |
| 3.6 | Enter Email: "test@example.com" | Input accepted |
| 3.7 | Click "JOIN & START SHOPPING" | Age verification modal appears |
| 3.8 | Complete age verification (21+) | Redirects to `/products` |

**After Test 3, ask:** "Were you redirected to the products page after age verification?"

---

## Test 4: Verify Free Delivery Applied (PARTICIPANT)

**Browser:** Incognito window (Participant)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | On products page, add any item to cart | Item added |
| 4.2 | Click cart icon to open drawer | Cart drawer slides open |
| 4.3 | Look for "Group Order" section | Green section at bottom |
| 4.4 | Check for "FREE DELIVERY" badge | Badge visible in group section |
| 4.5 | Check event name displayed | Shows "Test Party" |
| 4.6 | Check delivery date/time shown | Shows scheduled delivery |
| 4.7 | Check "Delivery" line item | Shows "FREE" (not "Calculated") |

**After Test 4, ask:** "Does the cart show 'FREE' for delivery and display the group order info?"

---

## Test 5: Host Dashboard Updates

**Browser:** Host window

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Go to `/group/dashboard` | Dashboard loads |
| 5.2 | Check Participants count | Shows "1" participant |
| 5.3 | Find "Test Participant" in list | Name and email displayed |
| 5.4 | Check participant status badge | Shows "Shopping" (yellow) |
| 5.5 | Check items count | Shows "1 items" (or current count) |
| 5.6 | Check Checkout Progress section | Shows "0/1 checked out" |

**After Test 5, ask:** "Does the dashboard show the participant with 'Shopping' status?"

---

## Test 6: Participant Checkout Flow

**Browser:** Incognito window (Participant)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Ensure cart has at least 1 item | Cart shows items |
| 6.2 | Click "PROCEED TO CHECKOUT" | Loading overlay appears |
| 6.3 | Verify NO delivery scheduler popup | Skips scheduler (uses group delivery) |
| 6.4 | Wait for redirect | Redirects to Shopify checkout |
| 6.5 | Check shipping address pre-filled | 123 Test St, Austin, TX 78701 |
| 6.6 | Check shipping options | Free shipping should be available |

**After Test 6, ask:** "Did checkout skip the delivery scheduler and go directly to Shopify? Is the address pre-filled?"

---

## Test 7: Complete Checkout (PARTICIPANT)

**Browser:** Incognito window (Participant)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Enter email: test@example.com | Accepted |
| 7.2 | Enter name: Test Participant | Accepted |
| 7.3 | Enter phone: 512-555-0123 | Accepted |
| 7.4 | Verify shipping address correct | Austin, TX 78701 |
| 7.5 | Select free shipping (if not auto-selected) | Free option available |
| 7.6 | Enter payment info (test card) | Use Shopify test card if available |
| 7.7 | Complete order | Order confirmation page |

**After Test 7, ask:** "What is the order number from the confirmation page?"

**Record order number:** _______________

---

## Test 8: Post-Checkout Dashboard Update

**Browser:** Host window

| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | Go to dashboard (may need to wait 10-30 sec) | Page loads |
| 8.2 | Find "Test Participant" in list | Still listed |
| 8.3 | Check status badge | Changed to "Checked out" (green) |
| 8.4 | Check for order number | Shows Shopify order number |
| 8.5 | Check Checkout Progress | Updated to "1/1 checked out" |
| 8.6 | Check "What's Been Ordered" section | Shows purchased items |

**After Test 8, ask:** "Does the participant show as 'Checked out' with the order number?"

---

## Test 9: Items Visibility

**Browser:** Both windows

| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Host: Check "What's Been Ordered" section | Shows items purchased |
| 9.2 | Participant: Go to `/group/[CODE]` | Page loads |
| 9.3 | Participant: Check "What's Been Ordered" | Same items visible |
| 9.4 | Verify privacy | Does NOT show who bought each item |

**After Test 9, ask:** "Can both Host and Participant see the purchased items?"

---

## Test 10: Close Group (HOST)

**Browser:** Host window

| Step | Action | Expected Result |
|------|--------|-----------------|
| 10.1 | On dashboard, find "CLOSE GROUP" button | Button visible |
| 10.2 | Click "CLOSE GROUP" | Confirmation dialog appears |
| 10.3 | Confirm closure | Status changes to "Closed" |
| 10.4 | Verify CLOSE GROUP button gone | Button no longer shown |

**After Test 10, ask:** "Is the group status now showing as 'Closed'?"

---

## Test 11: Verify Closed Group Blocks Joins

**Browser:** New incognito window (different person)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 11.1 | Open share URL in new incognito | Page loads |
| 11.2 | Check for warning message | Shows "group is closed" warning |
| 11.3 | Verify NO join form | Form not displayed |
| 11.4 | Verify can still see participants | List is visible |

**After Test 11, ask:** "Does it show that the group is closed to new participants?"

---

## Test 12: Verify Shopify Order Attributes

**Location:** Shopify Admin

| Step | Action | Expected Result |
|------|--------|-----------------|
| 12.1 | Go to Shopify Admin > Orders | Order list loads |
| 12.2 | Find the test order | Order visible |
| 12.3 | Open order details | Details page loads |
| 12.4 | Check order attributes/notes | Contains group order info |

**Expected attributes:**
- `group_order: true`
- `share_code: [CODE]`
- `group_name: Test Party`
- `delivery_date: [date]`
- `delivery_time: [time slot]`

**After Test 12, ask:** "Do you see the group_order attributes in the Shopify order?"

---

## Results Summary

```
Test 1  (Create Group Order):     PASS / FAIL
Test 2  (Share Modal):            PASS / FAIL
Test 3  (Join Group Order):       PASS / FAIL
Test 4  (Free Delivery Applied):  PASS / FAIL
Test 5  (Host Dashboard Updates): PASS / FAIL
Test 6  (Checkout Flow):          PASS / FAIL
Test 7  (Complete Checkout):      PASS / FAIL
Test 8  (Post-Checkout Update):   PASS / FAIL
Test 9  (Items Visibility):       PASS / FAIL
Test 10 (Close Group):            PASS / FAIL
Test 11 (Blocked Joins):          PASS / FAIL
Test 12 (Shopify Attributes):     PASS / FAIL

Overall: ___/12 tests passed
```

---

## Troubleshooting Guide

**Issue: Free delivery not showing in cart**
- Discount code `GROUPFREEDELIVERY` may not exist in Shopify
- Cart may not have been updated after joining
- Try refreshing the page

**Issue: Dashboard not updating after checkout**
- Webhook may not be configured correctly
- Check if webhook points to correct URL
- Wait 30 seconds and refresh

**Issue: Participant status not changing to "Checked out"**
- Webhook didn't fire or failed
- Check Vercel logs for webhook errors
- Verify email matches between join form and checkout

**Issue: Checkout not skipping delivery scheduler**
- GroupOrderContext may not be set
- Check localStorage for `groupOrderCode`
- Try rejoining the group order

**Issue: Address not pre-filled at Shopify checkout**
- URL parameters may not be passing correctly
- Check browser console for errors
- Verify deliveryAddress object has all fields

---

## Notes Section

_Document any bugs or unexpected behavior here:_

1.
2.
3.
4.
5.
