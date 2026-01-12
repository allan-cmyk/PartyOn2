# Contact Research Plan

**Goal:** Gather complete contact information for all 73 BYOB venues
**Timeline:** Complete within 1 week (before outreach launch)
**Estimated Time:** 15-20 hours total

---

## Data Points to Collect

For each venue, we need:

| Field | Priority | Source |
|-------|----------|--------|
| Website URL | Critical | Google search |
| Email (general) | Critical | Website contact page |
| Email (events/booking) | High | Website or inquiry form |
| Phone number | High | Website, Google Business |
| Instagram handle | High | Website footer, Google search |
| Facebook page | Medium | Website footer, Google search |
| Contact person name | Medium | LinkedIn, website team page |
| Capacity (min/max) | Medium | Website, The Knot, WeddingWire |
| Price range | Medium | Website, review sites |
| Address | Low | Google Maps |

---

## Research Process

### Phase 1: Automated Collection (2-3 hours)

**Tools to Use:**
1. **Hunter.io** - Find email addresses by domain
2. **Apollo.io** - Company and contact lookup
3. **Google Sheets + ImportXML** - Scrape basic info from websites

**Process:**
1. Create list of all venue names
2. Google search: "[venue name] Austin TX"
3. Record website URL
4. Use Hunter.io to find email patterns

### Phase 2: Manual Website Research (8-10 hours)

**For each venue:**

```
1. Open venue website
2. Navigate to Contact page → record email, phone
3. Check footer → record social media links
4. Navigate to About/Team page → record contact names
5. Check FAQ or Pricing page → record capacity, pricing info
6. Screenshot any BYOB policy text (for verification)
```

**Time Estimate:** ~5-8 minutes per venue × 73 venues = 6-10 hours

### Phase 3: Social Media Verification (2-3 hours)

**For each venue:**

1. Search Instagram: venue name + Austin
2. Verify it's the correct business
3. Record handle and follower count
4. Check if DMs are open
5. Note any recent activity (active vs dormant account)

### Phase 4: Fill Gaps with Secondary Sources (2-3 hours)

**Sources to check:**
- **The Knot** - Wedding venue listings with capacity, pricing
- **WeddingWire** - Same as above
- **Yelp** - Phone numbers, addresses
- **Google Maps** - Business info, phone, hours
- **LinkedIn** - Contact person names, roles
- **Facebook** - Business pages often have email/phone

---

## Prioritization Strategy

### Tier 1: Research First (High Value Venues)
Focus on these 25 venues first - highest likelihood of partnership and order value:

**Wedding Venues (Highest $$$):**
- #21 Brodie Homestead
- #23 Star Hill Ranch
- #24 Villa Antonia
- #25 The Grand Lady
- #26 The Vista on Seward Hill
- #27 Antebellum Oaks
- #30 Ranch Austin
- #66 Kindred Oaks
- #68 Kali-Kate
- #69 The Creek Haus
- #70 Vista West Ranch
- #71 Ma Maison
- #72 Two Wishes Ranch
- #73 The Vineyards at Chappel Lodge

**Lake/Boat Venues (Unique Niche):**
- #56 Tide Up Boat Rentals
- #57 ATX Aquafun
- #58 Lone Star Pedal Barge
- #59 Captain Verde's Party Boats

**High-End Event Spaces:**
- #35 Fair Market
- #37 The Riley Building
- #40 800 Congress
- #11 Lady Bird Johnson Wildflower Center
- #13 Laguna Gloria

### Tier 2: Research Second (Medium Value)
- Modern/Industrial spaces (#31-40)
- Gardens & Outdoor (#11-20)
- Historic venues (#1-10)

### Tier 3: Research Last (Lower Priority)
- Public/Community facilities (#41-46) - bureaucratic barriers
- Art studios/Entertainment (#60-65) - lower ticket size
- Party bikes (#51-54) - seasonal, lower volume

---

## Data Entry Template

Use this format when adding to venues.csv:

```csv
id,venue_name,...,website,email,phone,instagram,facebook,capacity_min,capacity_max,...
21,Brodie Homestead,...,https://brodiehomestead.com,info@brodiehomestead.com,512-555-1234,@brodiehomestead,facebook.com/brodiehomestead,50,200,...
```

---

## Quality Checks

Before marking a venue as "researched":

- [ ] Website URL is correct and working
- [ ] Email looks legitimate (not info@example.com)
- [ ] Phone number has correct area code (512, 737, 830)
- [ ] Instagram handle verified as correct business
- [ ] Capacity range is reasonable for venue type

---

## Tools & Resources

### Free Tools
- **Hunter.io** (50 free searches/month) - Email finder
- **Google Search operators** - `site:instagram.com "venue name" austin`
- **Wayback Machine** - Find old contact info if pages changed

### Paid Tools (Optional)
- **Apollo.io** ($49/mo) - Comprehensive contact database
- **ZoomInfo** ($$$$) - Enterprise-grade but overkill
- **Instantly.io enrichment** - May include lead enrichment

### Useful Search Queries
```
"venue name" austin contact
"venue name" austin email
"venue name" austin instagram
site:theknot.com "venue name"
site:weddingwire.com "venue name"
site:yelp.com "venue name" austin
```

---

## VA Outsourcing Option

If you want to outsource this research:

**Fiverr/Upwork Brief:**
```
I need contact information researched for 73 event venues in Austin, TX.

For each venue, find:
- Website URL
- Email address (preferably events/booking email)
- Phone number
- Instagram handle
- Facebook page URL
- Estimated guest capacity (min-max)

Deliverable: Completed CSV file with all fields filled.
Timeline: 5 days
Budget: $100-150

I will provide the list of venue names and a template CSV.
```

**Estimated VA Cost:** $1.50-2.00 per venue = $110-150 total

---

## Progress Tracking

Update venues.csv `contact_status` field:
- `not_started` - No research done
- `in_progress` - Partially complete
- `complete` - All fields filled
- `unverified` - Info found but needs verification
- `no_info` - Cannot find contact info

---

## Next Steps After Research

Once contact info is gathered:
1. Import to Instantly.io for email campaign
2. Create Instagram DM list for outreach
3. Prepare phone call list for follow-ups
4. Segment by priority tier for sequenced outreach
