# PartyOn Delivery - Venue Partnership Strategy

**Version:** 2.0
**Last Updated:** January 2025
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Partnership Tiers](#partnership-tiers)
3. [Current Implementation Status](#current-implementation-status)
4. [Technical Architecture](#technical-architecture)
5. [Landing Page Template Specifications](#landing-page-template-specifications)
6. [Onboarding Workflow](#onboarding-workflow)
7. [Commission Tracking](#commission-tracking)
8. [Marketing Materials](#marketing-materials)
9. [Roadmap](#roadmap)
10. [Appendix](#appendix)

---

## Executive Summary

### The Opportunity

PartyOn Delivery is Austin's premier alcohol delivery service for events and special occasions. We're building a network of preferred BYOB venue partners to create a seamless experience for couples and event planners.

### Why Venues Partner With Us

- **We deliver directly to the venue** - Customers don't transport alcohol
- **We calculate quantities** - No over-buying or running out
- **We handle returns** - Up to 25% of unopened product can be returned
- **We're fully compliant** - Licensed, insured, and TABC compliant (protects venue)
- **We drive traffic** - Marketing through our BYOB Venues page and SEO

### Current Partnership Stats

| Metric | Count |
|--------|-------|
| Total BYOB Venues Listed | 75+ |
| Premier Partners | 2 (Premier Party Cruises, Rich's Art Gallery) |
| Featured Partners | 1 (Pecan Springs Ranch) |
| Listed Partners | 72+ |
| Active Landing Pages | 1 (Premier Party Cruises) |

---

## Partnership Tiers

### Premier Partner (Exclusive) - 9% Commission

**What Venues Get:**
- Video feature and story on BYOB Venues page (top placement)
- "Free Delivery" badge prominently displayed
- Featured in email newsletters and social media
- **Custom landing page** on PartyOn website dedicated to venue
- Drink calculator customized with popular event types
- Priority placement in all venue searches
- Co-marketing opportunities (joint Instagram posts, etc.)
- Quarterly performance reports

**What We Ask:**
- Exclusive preferred vendor status for alcohol delivery
- Prominent link on venue website (homepage or vendors page)
- Mention PartyOn when couples/planners ask about alcohol
- Display PartyOn QR code card at venue
- Provide testimonial/quote for marketing use
- Share 2-3 high-quality photos of bar setups at venue

**Best For:** High-volume wedding venues ready for a true partnership

---

### Featured Partner - 7% Commission

**What Venues Get:**
- "Free Delivery" badge on venue listing
- Featured placement in category on BYOB page
- Dedicated landing page on PartyOn website
- Drink calculator for event types
- Listed in relevant blog posts and guides
- Access to co-branded materials (PDF guides, etc.)

**What We Ask:**
- Preferred vendor status (doesn't have to be exclusive)
- Link to PartyOn on website (FAQ or vendors page)
- Mention PartyOn as an option when asked about alcohol
- Optional: Display QR code card at venue

**Best For:** Established venues wanting increased exposure

---

### Listed Partner - 5% Commission

**What Venues Get:**
- Basic listing on BYOB Venues page
- Venue name, category, and description displayed
- Link to venue website from our page
- Included in category searches

**What We Ask:**
- Link to PartyOn somewhere on website
- Permission to list on BYOB page

**Best For:** Venues wanting to test partnership before upgrading

---

## Current Implementation Status

### Completed Features

| Feature | Status | Location |
|---------|--------|----------|
| BYOB Venues Directory | Done | `/austin-byob-venues` |
| Partner Spotlight Section | Done | Top of venues page |
| Venue Cards with Partner Badges | Done | `VenueCard.tsx` |
| Venue Detail Modal (Mobile) | Done | `VenueDetailModal.tsx` |
| Partner Types System | Done | `/lib/partners/types.ts` |
| Landing Page Data Structure | Done | `/lib/partners/landing-pages.ts` |
| Premier Party Cruises Page | Partial | `/partners/premier-party-cruises` |
| Drink Calculator | Done | `DrinkCalculator.tsx` |
| Group Order System | Done | `/group/*` |

### In Progress

| Feature | Status | Priority |
|---------|--------|----------|
| Premier Party Cruises - Full Template | In Progress | HIGH |
| Rich's Art Gallery Landing Page | Not Started | HIGH |
| Pecan Springs Ranch Landing Page | Not Started | MEDIUM |

### Not Started

| Feature | Priority | Notes |
|---------|----------|-------|
| Commission Tracking Dashboard | LOW | Manual tracking for now |
| Partner Onboarding Automation | LOW | Manual process for now |
| Partner Performance Reports | LOW | Future enhancement |

---

## Technical Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    VENUE PARTNERSHIP DATA                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  byob-venues.json          landing-pages.ts                 │
│  ┌──────────────┐         ┌──────────────────┐             │
│  │ 75+ venues   │         │ Partner landing  │             │
│  │ with:        │         │ page data:       │             │
│  │ - name       │         │ - hero content   │             │
│  │ - category   │         │ - video URL      │             │
│  │ - image      │         │ - FAQs           │             │
│  │ - partnerStatus        │ - order types    │             │
│  │ - partnerSlug│         │ - bullet points  │             │
│  └──────────────┘         └──────────────────┘             │
│         │                          │                        │
│         ▼                          ▼                        │
│  /austin-byob-venues      /partners/[slug]                  │
│  (Directory Page)         (Landing Pages)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── app/
│   ├── austin-byob-venues/
│   │   └── page.tsx              # BYOB venues directory
│   ├── partners/
│   │   ├── page.tsx              # General partners directory
│   │   └── premier-party-cruises/
│   │       └── page.tsx          # Partner landing page
│   └── venues/
│       └── [slug]/
│           └── page.tsx          # Dynamic venue pages (future)
├── components/
│   ├── byob-venues/
│   │   ├── VenueCard.tsx
│   │   ├── VenueGrid.tsx
│   │   ├── VenueFilters.tsx
│   │   ├── VenueDetailModal.tsx
│   │   └── HeroMosaicGrid.tsx
│   └── partners/
│       ├── PartnerHero.tsx       # Hero with video background
│       ├── PartnerHeroVideo.tsx  # YouTube video embed
│       ├── OrderTypeSelector.tsx # Order type selection
│       ├── PartnerFAQ.tsx        # FAQ accordion
│       ├── DrinkCalculator.tsx   # Drink quantity calculator
│       └── JoinOrderModal.tsx    # Join group order modal
├── data/
│   ├── byob-venues.json          # All venue data
│   └── austin-partners.json      # General partners data
└── lib/
    └── partners/
        ├── types.ts              # TypeScript interfaces
        └── landing-pages.ts      # Landing page data
```

### Partner Status Values

```typescript
// In byob-venues.json
{
  "partnerStatus": "premier" | "featured" | "listed" | "none",
  "partnerSlug": "kebab-case-slug"  // Used for landing page URL
}
```

---

## Landing Page Template Specifications

### Required Sections (in order)

1. **Navigation** - OldFashionedNavigation component
2. **Hero Section** - Video/image background with CTAs
3. **About Section** - Venue description and key features (NEW)
4. **Order Section** - Order type selection and form
5. **Services Section** - What PartyOn provides (NEW)
6. **Gallery Section** - Venue photos (NEW - optional)
7. **Testimonials** - Customer quotes (NEW - optional)
8. **FAQ Section** - Accordion-style FAQs
9. **Drink Calculator** - Quantity estimation tool
10. **CTA Section** - Final call-to-action (NEW)
11. **Footer** - Standard footer component

### Hero Section Requirements

```tsx
// Required props for PartnerHero
{
  name: string;           // "Premier Party Cruises"
  tagline: string;        // "Lake Travis Party Boat Rentals"
  heroVideoId?: string;   // YouTube video ID
  heroImageUrl: string;   // Fallback image
  bulletPoints: [{
    text: string;
    icon: 'delivery' | 'group' | 'perks' | 'check';
  }];
  priceIndicator: '$' | '$$' | '$$$';
}
```

### Order Types Configuration

```typescript
// Available order type icons
type OrderTypeIcon = 'anchor' | 'home' | 'building' | 'calendar' | 'users';

// Example configuration
orderTypes: [
  {
    id: 'venue',
    label: 'Order for Event at Venue',
    description: 'Order drinks delivered to [Venue Name]',
    icon: 'building',
  },
  {
    id: 'airbnb',
    label: 'Order for Rental Property',
    description: 'Order drinks delivered to your Airbnb/VRBO',
    icon: 'home',
  },
]
```

### FAQ Requirements

- Minimum 5 FAQs per partner
- Should include:
  - How delivery works
  - Quantity recommendations (link to calculator)
  - What's included in service
  - Group ordering explanation
  - Link to venue website

### Mobile Responsiveness

- Hero: Full-width, video scales proportionally
- Order buttons: Stack vertically on mobile
- FAQ: Full accordion functionality
- Drink calculator: Simplified mobile layout

---

## Onboarding Workflow

### Phase 1: Initial Contact

1. Venue expresses interest (form, email, or referral)
2. Schedule 15-minute discovery call
3. Determine appropriate partnership tier
4. Send partnership agreement

### Phase 2: Setup (1-2 business days)

1. **Listed Partner:**
   - Add to byob-venues.json
   - Set `partnerStatus: "listed"`
   - Deploy to production

2. **Featured Partner:**
   - Add to byob-venues.json with `partnerStatus: "featured"`
   - Create partnerSlug
   - Build landing page from template
   - Deploy to production

3. **Premier Partner:**
   - All Featured steps +
   - Request video content or use existing
   - Custom hero section
   - Extended FAQ section
   - Featured in spotlight section

### Phase 3: Activation

1. Send venue their listing/landing page link
2. Request venue add PartyOn link to their website
3. Provide QR code materials (if applicable)
4. Add to partner communication list

### Phase 4: Ongoing

- Monthly commission calculation and payment
- Quarterly performance review (Premier only)
- Annual partnership renewal discussion

---

## Commission Tracking

### Current Process (Manual)

1. Orders tagged with venue name in Shopify notes
2. Monthly export of orders with venue tags
3. Calculate commission based on tier
4. Send payment via Venmo/PayPal by 15th

### Future Enhancement: Automated Tracking

```typescript
// Proposed: Add to Shopify order attributes
{
  "partnerVenueId": "premier-party-cruises",
  "partnerTier": "premier",
  "commissionRate": 0.09,
  "commissionAmount": 45.00
}
```

### Commission Examples

| Order Size | Listed (5%) | Featured (7%) | Premier (9%) |
|------------|-------------|---------------|--------------|
| $500 | $25 | $35 | $45 |
| $1,000 | $50 | $70 | $90 |
| $1,500 | $75 | $105 | $135 |
| $2,000 | $100 | $140 | $180 |
| $3,000 | $150 | $210 | $270 |
| $5,000 | $250 | $350 | $450 |

---

## Marketing Materials

### Digital Assets Needed

| Asset | Status | Use Case |
|-------|--------|----------|
| Partner landing page template | In Progress | All landing pages |
| QR code generator | Not Started | Physical cards at venues |
| Co-branded PDF guide | Not Started | Venue handout for clients |
| Email templates | Not Started | Partner communications |
| Social media graphics | Not Started | Joint promotions |

### Physical Materials

| Material | Status | Distribution |
|----------|--------|--------------|
| QR code cards | Not Started | Premier/Featured venues |
| Counter display | Not Started | Premier venues |
| Brochure | Not Started | Wedding venue packets |

---

## Roadmap

### Phase 1: Template Completion (Current)

- [x] Create strategy document
- [ ] Complete Premier Party Cruises as template
- [ ] Add missing sections (About, Services, CTA)
- [ ] Add Navigation and Footer
- [ ] Test and refine mobile experience

### Phase 2: Expand Partner Pages

- [ ] Create Rich's Art Gallery landing page
- [ ] Create Pecan Springs Ranch landing page
- [ ] Build reusable dynamic route `/venues/[slug]`

### Phase 3: Partner Growth

- [ ] Identify 10 high-potential venues to approach
- [ ] Create outreach email templates
- [ ] Build partner inquiry form improvements
- [ ] Create onboarding documentation

### Phase 4: Automation

- [ ] Automated commission tracking
- [ ] Partner dashboard (view orders, commission)
- [ ] Automated monthly reports
- [ ] Integration with accounting

---

## Appendix

### A. ROI Projections for Venues

#### Wedding Venues

| Metric | Conservative | Average | Strong |
|--------|--------------|---------|--------|
| Events per month | 4 | 8 | 12 |
| Average alcohol order | $1,200 | $1,800 | $2,500 |
| Commission (5%) | $240/mo | $720/mo | $1,500/mo |
| Annual passive income | $2,880 | $8,640 | $18,000 |

#### Party Boats/Entertainment

| Metric | Conservative | Average | Strong |
|--------|--------------|---------|--------|
| Events per month | 8 | 15 | 25 |
| Average alcohol order | $300 | $500 | $800 |
| Commission (5%) | $120/mo | $375/mo | $1,000/mo |
| Annual passive income | $1,440 | $4,500 | $12,000 |

### B. Current Partner Venues

| Venue | Tier | Landing Page | Status |
|-------|------|--------------|--------|
| Premier Party Cruises | Premier | `/partners/premier-party-cruises` | Active |
| Rich's Art Gallery | Premier | Not built | Pending |
| Pecan Springs Ranch | Featured | Not built | Pending |

### C. FAQ Template for New Partners

1. How does delivery work?
2. How many drinks do I need? (link to calculator)
3. Still need to book [venue type]? (link to venue site)
4. What's included in the service?
5. Can I order for a group?
6. What if I have unopened bottles? (returns policy)
7. Do you deliver ice and mixers?

### D. Contact Information

- **Partnership Inquiries:** info@partyondelivery.com
- **Phone:** 737.371.9700
- **Partnership Page:** partyondelivery.com/austin-partners

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| Jan 2025 | 2.0 | Comprehensive rewrite with technical specs |
| Jan 2025 | 1.0 | Initial partnership offer document |

---

*PartyOn Delivery - Austin's Premier Event Alcohol Delivery Service*
*Fully Licensed | TABC Compliant | Insured*
