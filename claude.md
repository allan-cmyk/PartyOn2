# PartyOn Delivery - Premium Alcohol Delivery Platform

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

## Shopify Integration Architecture
```
/lib/shopify/
  ├── client.ts         # GraphQL client
  ├── types.ts          # TypeScript interfaces
  ├── queries/          # Product queries
  ├── mutations/        # Cart mutations
  ├── utils.ts          # Helper functions
  └── hooks/            # React hooks (useProducts, useCart)
```

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

## Commands
- Development: `npm run dev` (runs on port 3000)
- Build: `npm run build`
- Lint: `npm run lint`

## Important Notes
- All images reference existing assets in `/public/images/`
- Removed conflicting (main) route group pages
- Using Shopify Storefront API version 2024-01
- Cart persists in localStorage