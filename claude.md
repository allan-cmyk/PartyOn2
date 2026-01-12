# PartyOn Delivery - Premium Alcohol Delivery Platform

---
## ⚠️ CRITICAL: Session Initialization Rules

**Claude Code: At the start of EVERY new session, you MUST read these global rule files:**
1. `global-rules/core/universal-principles.md` - Universal standards (KISS, YAGNI, DRY, file limits, security)
2. `global-rules/workflows/prp-methodology.md` - PRP workflow and development methodology
3. `global-rules/archon/CLAUDE.md` - **ARCHON-FIRST task management rule** (check Archon before TodoWrite)
4. `global-rules/nextjs/rasmus--nextjs-rules.md` - Next.js 15 patterns and requirements
5. `global-rules/react/rasmus--react-rules.md` - React 19 component standards and documentation

**DO NOT proceed with any coding tasks until these files are read and understood.**

**Key Requirements from Global Rules:**
- 500 line max per file, 200 lines per component, 50 lines per function
- NEVER use `any` type, MUST use `ReactElement` not `JSX.Element`
- Zod validation for ALL external data
- 80% minimum test coverage - NO EXCEPTIONS
- Complete JSDoc documentation for ALL exports
- Archon-first for task management (TodoWrite is secondary only)

---

## Project Overview
PartyOn Delivery is a premium alcohol delivery service in Austin, Texas, offering scheduled deliveries for events, parties, and special occasions. The platform features an elegant, luxury design aesthetic and is fully integrated with Shopify for e-commerce operations.

## Core Features

### 🛒 E-Commerce Platform
- **Shopify Integration**: Full Storefront API integration for products, cart, and checkout
- **Product Management**: Dynamic product display with categories and filtering
- **Cart System**: Persistent shopping cart with add/remove/update functionality
- **Checkout Flow**: Complete checkout with delivery scheduling and address validation

### 👥 Customer System
- **Authentication**: Shopify Customer Accounts API for login/signup
- **Account Dashboard**: View orders, manage addresses, track history
- **Age Verification**: Required modal for alcohol purchases
- **Loyalty Points**: (Built but temporarily disabled)

### 📦 Delivery System
- **Scheduled Delivery**: 72-hour advance booking requirement
- **Express Delivery**: 3-hour express option for premium fee
- **Zone Coverage**: Austin area with zip code validation
- **Time Slots**: Available delivery windows with capacity management
- **Minimum Orders**: $100-150 depending on delivery zone

### 🔔 Order Processing
- **Webhook System**: Real-time order updates from Shopify
- **Order Tracking**: Customer order history and status updates
- **Delivery Notes**: Special instructions for drivers
- **HMAC Verification**: Secure webhook signature validation

### 👥 Group Orders ✅ PRODUCTION READY
- **Share System**: Create group orders with unique share codes and QR codes
- **Participant Management**: Join orders, track contributions, remove participants
- **Host Dashboard**: Real-time view of all participants and their carts (`/group/dashboard`)
- **Cart Sync**: Automatic sync of cart totals across all participants
- **Lock & Checkout**: Host locks order when minimum is met
- **Progress Tracking**: Visual progress bar for minimum order amount
- **Draft Orders**: All carts merged into single Shopify Draft Order
- **Invoice System**: Host receives invoice via email for payment
- **Shop Pay Integration**: Secure checkout via Shopify's payment system
- **Production Tested**: Draft Order API verified working (Dec 26, 2024)

## Current Status (as of latest session)

### ✅ Completed
1. **Old-Fashioned Theme Implementation**
   - Created sophisticated navigation with dropdown menus
   - Redesigned all main pages with luxury aesthetic
   - Replaced all emojis with elegant SVG icons
   - Added Cormorant Garamond serif font
   - Gold accent color: #D4AF37
   - Wide letter spacing for elegant typography

2. **Pages Redesigned**
   - Homepage - Distinguished hero with service showcases
   - Services (Weddings, Boat Parties, Bach Parties)
   - About - Company story with timeline
   - Contact - Elegant contact form
   - Delivery Areas - Interactive neighborhood selector
   - Order - Multi-step booking form

3. **Shopify Integration**
   - Connected to Shopify store: premier-concierge.myshopify.com
   - Created GraphQL client and queries
   - Product listing page with filters
   - Individual product detail pages
   - Cart functionality (hooks ready)
   - TypeScript types for all Shopify data

### ✅ Recently Completed
1. **Shopping Cart UI** - Elegant slide-out cart drawer with animations
2. **Age Verification** - Modal blocks cart access for unverified users
3. **Delivery Scheduling** - Pre-checkout delivery date/time selection
4. **Search Functionality** - Product search in navigation and results page
5. **Collection Pages** - Dynamic collection pages and landing page
6. **Corporate Events Page** - Professional service offerings
7. **Footer Pages** - Terms, Privacy, and FAQs pages
8. **Minimum Order Validation** - Enforced in delivery scheduler
9. **Customer Authentication** - Login/signup with Shopify customer accounts
10. **Account Dashboard** - Customer profile, order history, addresses
11. **Order Tracking** - View past orders and order details
12. **Checkout Success Page** - Post-purchase confirmation with order details
13. **Webhook Infrastructure** - Ready to receive Shopify order/customer events

### ✅ Group Ordering (NEW)
1. **Group Order Creation** - Hosts can create shareable group orders
2. **Share System** - Unique codes and links for easy sharing
3. **Participant Management** - Join orders, track contributions
4. **Database Integration** - Supabase support with fallback to in-memory
5. **Age Verification** - Required for all participants

### ✅ Latest Updates (Session: Dec 26, 2024)
1. **Partner Program Page** - B2B partnerships with tiered benefits
2. **Product Filtering Fixed** - Now uses actual Shopify collections and productTypes
3. **Customer API Integration** - Full read/modify access tested and working
4. **Loyalty Points System** - 4-tier system (Bronze/Silver/Gold/Platinum) with benefits
5. **Complete Checkout Flow** - Full checkout page with forms, delivery scheduling, loyalty redemption
6. **Product Categorization** - Proper mapping of Shopify data to UI categories

### ✅ Completed (Dec 26, 2024 - Latest Session)
1. **Shopify Admin API** - Configured and working
2. **Webhook Registration** - All 6 webhooks registered and verified
3. **Customer Accounts API** - Enabled and tested successfully
4. **Webhook Verification** - HMAC signature validation implemented
5. **Loyalty Points** - Temporarily disabled (commented out)
6. **Group Orders** - PRODUCTION READY with dashboard, cart sync, and checkout
7. **Draft Order API** - Integrated and tested for merged group checkouts
8. **Invoice System** - Email invoices sent to group hosts
9. **Shop Pay Checkout** - Verified working with test orders

### ✅ Completed (Latest Session - Performance Optimization)
1. **Products Page Performance Overhaul** - 85-90% faster load times
2. **Image Optimization** - Shopify CDN transformations with device-specific sizes
3. **API Route with CDN Caching** - 5-minute edge caching, instant repeat visits
4. **SWR Implementation** - Client-side caching and smart revalidation
5. **Server-Side Filtering** - Shopify Query Language for efficient filtering
6. **Loading Skeletons** - Improved perceived performance
7. **Mobile Optimizations** - Lazy loading, priority hints, reduced animations

### ✅ Completed (Latest Session - Meta Pixel Integration)
1. **Meta Pixel Component** - Facebook/Instagram tracking with env variable support (`src/components/MetaPixel.tsx`)
2. **PageView Tracking** - Automatic on all page loads
3. **AddToCart Events** - Fires when items added to cart (`CartContext.tsx`)
4. **ViewContent Events** - Fires on product detail page views (`ProductDetailClient.tsx`)
5. **Purchase Events** - Fires on checkout success with order value (`checkout/success/page.tsx`)
6. **Environment Config** - `NEXT_PUBLIC_META_PIXEL_ID` with fallback to default

### 📋 Todo
1. Production testing with real group orders
2. Split payment options for group orders (researching feasibility)
3. Email/SMS notifications (optional - not required per client)

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15.3.5 with TypeScript
- **Styling**: Tailwind CSS with custom luxury theme
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React Context API for cart, customer, and group orders
- **Data Fetching**: SWR for caching and revalidation

### Backend Integration
- **E-Commerce**: Shopify Storefront API (GraphQL)
- **Admin Operations**: Shopify Admin API for webhooks
- **Authentication**: Shopify Customer Accounts API
- **Database**: Supabase (optional) with in-memory fallback
- **Webhooks**: HMAC-verified POST endpoints

### Key Integrations
1. **Shopify Storefront API**: Product catalog, cart, checkout
2. **Shopify Admin API**: Webhook registration, order management
3. **Customer API**: Authentication, account management
4. **Webhook System**: Order and customer event processing
5. **Group Orders**: Custom API with share codes

## Environment Variables
```env
# Shopify Configuration
NEXT_PUBLIC_SHOPIFY_DOMAIN=premier-concierge.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=[configured]
SHOPIFY_API_KEY=[configured]
SHOPIFY_API_SECRET_KEY=[configured]
SHOPIFY_ADMIN_ACCESS_TOKEN=[configured]
SHOPIFY_WEBHOOK_SECRET=[configured]
NEXT_PUBLIC_APP_URL=https://party-on-delivery.vercel.app

# AI Configuration
OPENROUTER_API_KEY=[configured]
```

## Key Design Principles
1. **Typography**: Cormorant Garamond for headings, Inter for body
2. **Colors**: White backgrounds, gray text hierarchy, gold accents
3. **Spacing**: Wide letter-spacing (tracking-[0.1em] to tracking-[0.15em])
4. **Icons**: Only SVG icons, no emojis
5. **Tone**: Professional, luxury, distinguished

## 🚨 Landing Page Layout Standards (CRITICAL)

The navigation is **fixed position with `h-24`** (96px / 6rem). ALL landing pages MUST account for this.

### Hero Section Patterns

**Pattern A: Full-Bleed Hero (image edge-to-edge)**
Use when hero image should extend to edges of viewport:
```tsx
<section className="relative h-[50vh] md:h-[60vh] mt-24 flex items-center justify-center overflow-hidden">
  <Image src="..." fill className="object-cover" />
  {/* Content */}
</section>
```
- `mt-24` pushes hero below fixed nav (REQUIRED)
- Use `h-[Xvh]` for responsive height
- Can use `md:h-[Yvh]` for different desktop height

**Pattern B: Content Page (no full-bleed hero)**
Use for text-heavy pages without edge-to-edge images:
```tsx
<section className="pt-32 pb-16 px-8 bg-gray-50">
  {/* Content starts with breathing room below nav */}
</section>
```
- `pt-32` = 128px (96px nav + 32px breathing room)

### Common Mistakes to AVOID

| Wrong | Correct | Why |
|-------|---------|-----|
| `h-[100vh] pt-[200px]` | `h-[60vh] mt-24` | Don't hack with huge padding |
| No margin/padding | `mt-24` or `pt-32` | Content hidden behind nav |
| `pt-24` only | `pt-32` or `mt-24` | `pt-24` = exactly nav height (no room) |
| Different mobile/desktop hacks | Consistent pattern | Hard to maintain |

### Quick Reference

| Page Type | Hero Class | Example Pages |
|-----------|------------|---------------|
| Full-bleed image hero | `mt-24 h-[50vh] md:h-[60vh]` | /order, /products, /delivery/* |
| Shorter image hero | `mt-24 h-[35vh] md:h-[40vh]` | /order (current) |
| Content/form page | `pt-32` | /terms, /privacy, /blog, /faqs |
| Full-height hero | `mt-24 h-[calc(100vh-96px)]` | Special cases only |

### Audit Checklist for New Landing Pages
- [ ] Does hero section have `mt-24` (full-bleed) or `pt-32` (content)?
- [ ] Test on mobile: is content visible below nav?
- [ ] Test on desktop: proper spacing below nav?
- [ ] No hacky mobile-specific padding overrides?

## Shopify Integration Architecture
```
/lib/shopify/
  ├── client.ts           # GraphQL client
  ├── types.ts            # TypeScript interfaces
  ├── queries/            # Product queries (optimized + legacy)
  ├── mutations/          # Cart mutations
  ├── utils.ts            # Helper functions + image optimization
  ├── image-utils.ts      # Shopify CDN image transformations
  ├── query-builder.ts    # Shopify Query Language builder
  └── hooks/              # React hooks with SWR caching

/app/api/products/
  └── route.ts            # API route with CDN edge caching

/components/skeletons/
  ├── ProductCardSkeleton.tsx
  └── MobileProductCardSkeleton.tsx
```

## Performance Architecture (New)
```
Browser Request
    ↓
Next.js API Route (/api/products)
    ↓
Vercel Edge Network Cache (5min)
    ↓
SWR Client Cache (5min)
    ↓
Shopify Storefront API (optimized queries)
    ↓
Optimized Response (~80KB vs 400KB before)
```

**Key Optimizations:**
- **CDN Edge Caching**: 5-minute cache at CDN edge (instant for most users)
- **SWR Caching**: Client-side cache with smart revalidation
- **Optimized Queries**: Minimal fields, 1 image instead of 5, 1 variant instead of 10
- **Server-Side Filtering**: Shopify Query Language reduces data transfer by 50%
- **Image Optimization**: Device-specific sizes via Shopify CDN
- **Lazy Loading**: Native browser lazy loading + priority hints

**Results:**
- Initial load: 85-90% faster (8-12s → 0.5-1s desktop, 15-25s → 2-3s mobile)
- Repeat visits: 97-99% faster (instant from cache)
- Payload: 80% smaller (400KB → 80KB)

## Special Requirements
1. **Age Verification**: Required for alcohol sales
2. **72-Hour Notice**: All orders require advance booking
3. **Delivery Zones**: Austin area only (zip code validation)
4. **Order Minimums**: $100-150 depending on area

## Next Steps
1. Build shopping cart UI component
2. Implement age verification flow
3. Create checkout process
4. Add delivery scheduling
5. Test full purchase flow

## Group Ordering Architecture
```
/lib/group-orders/
  ├── types.ts          # TypeScript interfaces
  ├── api.ts            # API client
  ├── hooks.ts          # React hooks (useGroupOrder, etc)
  ├── database.ts       # Database abstraction layer
  └── store.ts          # In-memory fallback store

/app/api/group-orders/
  ├── create/           # Create new group order
  ├── [code]/           # Get by share code
  └── id/[id]/join/     # Join group order

/components/group-orders/
  ├── CreateGroupOrderModal.tsx
  ├── ShareGroupOrder.tsx
  └── (more to come: Dashboard, Checkout)
```

## Blog Generation System

### **SEO-Optimized Content Generation**

The automated blog system uses **Claude 3.5 Sonnet via OpenRouter** to generate SEO-optimized, 2,000+ word blog posts with comprehensive structured data.

**Key Features:**
- **HTML Tables with Schema.org Markup** - All comparisons use semantic tables with microdata
- **Comprehensive Structured Data** - Article, FAQPage, and LocalBusiness schemas
- **AI Search Optimized** - Direct answers, FAQ sections, factual data presentation
- **Mobile-First Design** - Max 4 columns per table for readability
- **Austin Local SEO** - Geo-coordinates, local business markup, neighborhood references

**Automatic Table Generation for:**
- Pricing comparisons (packages, tiers, service options)
- Venue comparisons (capacity, location, amenities, costs)
- Timeline planning (booking windows, deadlines)
- Package inclusions (what's in each tier)
- Budget breakdowns (itemized cost estimates)
- Service area coverage (zip codes, delivery fees)

**Required Sections:**
1. Engaging introduction with Austin personality
2. 5-7 main content sections with descriptive H2 headings
3. At least ONE HTML comparison table
4. FAQ section with 3-5 Q&A pairs
5. Conclusion with clear CTA
6. Schema.org JSON-LD block with Article, FAQPage, LocalBusiness schemas

**Schema.org Implementation:**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Article", ... },
    { "@type": "FAQPage", ... },
    { "@type": "LocalBusiness", ... }
  ]
}
```

**Run Blog Generation:**
```bash
npm run generate-blog
```

**Documentation:**
- Full setup guide: `BLOG_AUTOMATION_SETUP.md`
- Topics list: `scripts/topics.json`
- Script: `scripts/automated-daily-blog.ts`

## Commands
- Development: `npm run dev` (runs on port 3000)
- Build: `npm run build`
- Lint: `npm run lint`
- Generate Blog: `npm run generate-blog`

## Important Notes
- All images reference existing assets in `/public/images/`
- Removed conflicting (main) route group pages
- Using Shopify Storefront API version 2024-01
- Cart persists in localStorage

## 🚨 Address Handling for Shop Pay Integration (Critical Fix)

### The Problem
Shop Pay doesn't read cart attributes for shipping address. Cart attributes are for custom data (delivery instructions), NOT the actual shipping address that Shop Pay uses. Customers' addresses aren't passing through to Shop Pay checkout.

### The Solution
Use checkout URL parameters to pre-fill Shop Pay address fields while keeping cart attributes as backup for internal use.

### Implementation Plan

#### Phase 1: Address Parser Utility
Create `/lib/utils/addressParser.ts` to parse single address field into components:
```typescript
// Expected formats:
// "123 Main St, Austin, TX 78701"
// "123 Main St, Apt 4B, Austin, TX 78701"
// Parser should extract:
// - address1: street address
// - address2: apartment/suite (optional)
// - city: default to "Austin" for local delivery
// - province: "TX"
// - country: "US"
// - zip: extract from end of string
```

#### Phase 2: Update Checkout Redirect
Modify both `Cart.tsx` and `MobileCart.tsx` to:
1. Parse address into components using addressParser
2. Save to cart attributes (for backup/internal use)
3. Build checkout URL with parameters:
```javascript
const checkoutUrl = new URL(updatedCart.checkoutUrl);
checkoutUrl.searchParams.append('payment', 'shop_pay');
checkoutUrl.searchParams.append('checkout[shipping_address][address1]', parsedAddress.address1);
checkoutUrl.searchParams.append('checkout[shipping_address][city]', parsedAddress.city);
checkoutUrl.searchParams.append('checkout[shipping_address][province]', 'TX');
checkoutUrl.searchParams.append('checkout[shipping_address][country]', 'US');
checkoutUrl.searchParams.append('checkout[shipping_address][zip]', zipCode);
checkoutUrl.searchParams.append('checkout[shipping_address][phone]', phone);
window.location.replace(checkoutUrl.toString());
```

#### Phase 3: Future Improvements (Optional)
- Consider Google Places Autocomplete for better address parsing
- Split address input into separate fields (street, apt/suite)
- Validate zip codes are within Texas (not just Austin)

### Key URL Parameters for Shop Pay
Full example of checkout URL with all parameters:
```
https://store.myshopify.com/checkouts/abc123
?payment=shop_pay
&checkout[shipping_address][address1]=123 Main St
&checkout[shipping_address][address2]=Apt 4B
&checkout[shipping_address][city]=Austin
&checkout[shipping_address][province]=TX
&checkout[shipping_address][country]=US
&checkout[shipping_address][zip]=78701
&checkout[shipping_address][phone]=512-555-0123
&checkout[email]=customer@example.com
```

### Testing Checklist
- [ ] Test in incognito to ensure parameters work for all customers
- [ ] Verify Shop Pay respects the address parameters
- [ ] Confirm cart attributes still save as backup
- [ ] Test with various address formats
- [ ] Verify phone number formatting works

### Research Findings
- This is the OFFICIAL Shopify method for pre-filling checkout
- Used by DoorDash, Uber Eats, and major Shopify merchants
- Shop Pay confirmed to respect these parameters
- Must parse address into separate fields - Shop Pay won't parse a single string


### Global Rules
This file contains universal development principles and workflows that apply to **ALL projects**, regardless of technology stack. Project-specific rules are loaded conditionally based on the technologies you're using. Additional resources can be found in the /.claude folder

---

## 🎯 Core Development Principles

![[global-rules/core/universal-principles.md]]

---

## 🔄 PRP Development Workflow

![[global-rules/workflows/prp-methodology.md]]

---

## 🏛️ Archon Integration

![[global-rules/archon/CLAUDE.md]]

---

## 📚 Language & Framework-Specific Rules

The following rules are loaded based on your project's technology stack. Claude Code will use these when working with the respective technologies.

### Python Development

![[global-rules/python/rasmus--python-rules.md]]

### Pydantic AI Agents

**Use when building AI agents with Pydantic AI:**

![[global-rules/pydantic-ai/pydantic-ai-rules.md]]

### Next.js Development

**Use when building Next.js applications:**

![[global-rules/nextjs/rasmus--nextjs-rules.md]]

### React Development

**Use when working with React components:**

![[global-rules/react/rasmus--react-rules.md]]

### Node.js Backend Development

**Use when building Node.js APIs or backend services:**

![[global-rules/node/rasmus--node-rules.md]]

### Astro Static Sites

**Use when building Astro websites:**

![[global-rules/astro/rasmus--astro-rules.md]]

---

## 🎯 Project Type Detection

Claude Code automatically adapts based on project context:

- **Detects Python projects** → Applies Python rules + relevant framework rules
- **Detects Next.js/React** → Applies JavaScript/TypeScript + framework rules
- **Detects AI agent development** → Applies Pydantic AI specialized rules
- **Detects Node.js APIs** → Applies Node.js backend patterns
- **Detects Astro projects** → Applies static site generation rules

You can also explicitly tell Claude what you're building:
- "I'm building a Next.js app with..."
- "This is a Pydantic AI agent for..."
- "Working on a Node.js API that..."

---

## 🚀 Quick Start Guide

### For New Projects

1. **Define Requirements**: Create `PRPs/INITIAL.md`
2. **Generate PRP**: Run `/generate-prp PRPs/INITIAL.md`
3. **Review PRP**: Validate completeness
4. **Execute**: Run `/execute-prp PRPs/generated-prp.md`
5. **Validate**: Run validation gates

### For Existing Codebases

1. **Explore**: Run `/primer` or ask Claude to investigate
2. **Plan**: Collaborate on approach and architecture
3. **Create PRP**: Generate focused PRP for feature
4. **Execute**: Implement following PRP blueprint
5. **Validate**: Ensure all tests pass

---

## 📂 Project Organization

```
your-project/
├── .claude/
│   ├── commands/          # Custom slash commands
│   └── settings.local.json # Permissions
├── PRPs/
│   ├── INITIAL.md        # Requirements (new projects)
│   ├── templates/        # PRP templates by project type
│   └── *.md             # Generated PRPs
├── global-rules/         # Imported global rules (optional)
├── CLAUDE.md            # This file
├── .env.example         # Environment variable template
└── README.md            # Project documentation
```

---

## ✅ Universal Quality Standards

Every project, regardless of type, should meet these standards:

- **Code Quality**
  - Files < 500 lines
  - Functions < 50 lines
  - Clear naming conventions
  - Comprehensive error handling

- **Security**
  - No hardcoded secrets
  - Environment variables in .env
  - Input validation
  - Secure dependencies

- **Testing**
  - Minimum 80% coverage
  - Unit + integration tests
  - Edge case handling
  - Validation gates in PRPs

- **Documentation**
  - Clear README
  - Inline comments for complex logic
  - API documentation
  - Setup instructions

---

## 🔧 Available Tools & Workflows

### Slash Commands

- `/generate-prp` - Create comprehensive PRP from INITIAL.md
- `/execute-prp` - Implement feature from PRP
- `/primer` - Explore and understand codebase
- `/generate-pydantic-ai-prp` - Specialized AI agent PRP
- `/execute-pydantic-ai-prp` - Implement AI agent from PRP
- `/hackathon-prp-parallel` - Rapid parallel development

### MCP Servers

- **Archon** - Knowledge management, task tracking, RAG
- (Add other MCP servers as you integrate them)

### Development Tools

- **TodoWrite** - Track multi-step tasks within sessions
- **WebSearch** - Research documentation and examples
- **Glob/Grep** - Explore codebase patterns

---

## 🎓 Philosophy

This universal framework is built on these principles:

1. **PRP-Driven Development** - Structured planning enables one-pass implementation
2. **Context Engineering** - Comprehensive context yields quality results
3. **Progressive Validation** - Test early, test often, catch issues fast
4. **Technology Agnostic** - Core principles apply across all stacks
5. **Modular Loading** - Use only the rules relevant to your project
6. **Continuous Learning** - Refine PRPs and patterns based on experience

---

## 💡 Best Practices

- **Start with universal principles** - They apply to every project
- **Load framework rules as needed** - Don't overwhelm context with irrelevant rules
- **Create focused PRPs** - Target specific features, not entire systems
- **Validate progressively** - Syntax → Types → Tests → Integration
- **Document decisions** - Capture rationale in PRPs and commit messages
- **Iterate and improve** - Refine your PRP templates over time

---
