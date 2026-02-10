# PartyOn Delivery - Systems Documentation

This document provides comprehensive documentation for the two major custom systems built for PartyOn Delivery:
1. **Inventory Management System** - AI-powered inventory tracking and predictions
2. **Group Ordering System** - Collaborative ordering for events and parties

---

# Part 1: Inventory Management System

## Overview

The Inventory Management System is an AI-powered solution for tracking inventory, counting stock via images, answering natural language queries, and predicting stockouts. It uses **OpenRouter** to access Claude models for all AI operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTORY MANAGEMENT SYSTEM                   │
├─────────────────────────────────────────────────────────────────┤

IMAGE-BASED COUNTING:
  User uploads image(s) → POST /api/v1/ai/inventory/count
  → Claude Vision analyzes image
  → Returns: product counts, confidence scores, quality assessment
  → User reviews and applies counts to database

NATURAL LANGUAGE QUERIES:
  User asks question → POST /api/v1/ai/inventory/query
  → Builds context from current inventory + 30-day sales
  → Claude analyzes and answers
  → Returns: answer, relevant items, suggested actions

PREDICTIONS:
  GET /api/v1/ai/inventory/predictions?quick=true (instant, local)
  GET /api/v1/ai/inventory/predictions (AI-powered, detailed)
  → Analyzes sales history and trends
  → Returns: stockout predictions, reorder recommendations

CORE OPERATIONS:
  POST /api/v1/inventory (adjust, transfer, count)
  → Updates InventoryItem table
  → Creates InventoryMovement audit records
  → Triggers LowStockAlert if threshold breached
```

---

## AI Features

### 1. Image-Based Inventory Counting

**Purpose:** Analyze photos of shelves/storage to automatically count products.

**How it works:**
1. User uploads one or more images (base64 or URL)
2. Claude Vision identifies products and estimates quantities
3. Returns confidence scores (0-1) for each count
4. User reviews and can apply counts to database

**API Endpoint:**
```bash
POST /api/v1/ai/inventory/count
Content-Type: application/json

{
  "images": ["data:image/jpeg;base64,..."],
  "locationId": "loc-123",
  "knownProducts": [
    {
      "id": "prod-1",
      "name": "Tito's Vodka 750ml",
      "packagingDescription": "Clear bottle with white label"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "productName": "Tito's Vodka 750ml",
        "estimatedQuantity": 24,
        "confidence": 0.85,
        "notes": "Two rows deep on shelf"
      }
    ],
    "totalItemsCounted": 24,
    "imageQuality": "good",
    "suggestions": ["Better lighting would improve accuracy"],
    "processingTime": 2340
  }
}
```

**Key Files:**
- `src/lib/ai/inventory-counter.ts` - Core counting logic
- `src/app/api/v1/ai/inventory/count/route.ts` - API endpoint
- `src/app/ops/inventory/count/page.tsx` - UI for counting

---

### 2. Natural Language Queries

**Purpose:** Ask questions about inventory in plain English.

**Query Types Supported:**
| Type | Example Question |
|------|------------------|
| `low_stock` | "What items are running low?" |
| `reorder` | "What should I reorder this week?" |
| `stock_level` | "How much Tito's do we have?" |
| `search` | "Find all whiskey products" |
| `comparison` | "Compare wine sales vs beer" |
| `summary` | "Give me an inventory overview" |
| `recommendation` | "How can I optimize stock levels?" |

**API Endpoint:**
```bash
POST /api/v1/ai/inventory/query
Content-Type: application/json

{
  "query": "What items need to be reordered this week?",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Based on current stock and sales velocity, 3 items need reordering...",
    "relevantItems": [
      { "id": "prod-1", "name": "Tito's Vodka", "quantity": 5, ... }
    ],
    "suggestedActions": [
      { "type": "reorder", "label": "Reorder Tito's Vodka", "data": { "quantity": 24 } }
    ],
    "queryType": "reorder"
  }
}
```

**Pre-built Quick Queries:**
- "What's running low?"
- "Reorder suggestions"
- "Inventory summary"
- "Best sellers"
- "Dead stock"

**Key Files:**
- `src/lib/ai/inventory-assistant.ts` - Query processing
- `src/app/api/v1/ai/inventory/query/route.ts` - API endpoint

---

### 3. Stock Predictions

**Purpose:** Predict stockouts and recommend reorder timing/quantities.

**Two Modes:**

| Mode | Speed | Accuracy | Use Case |
|------|-------|----------|----------|
| Quick (`?quick=true`) | Instant | Good | Real-time dashboards |
| AI-Powered | 2-5 seconds | Better | Weekly planning |

**Urgency Levels:**
| Level | Meaning |
|-------|---------|
| `critical` | Will stock out before reorder can arrive |
| `high` | Will stock out within lead time |
| `medium` | Will reach reorder point within 7 days |
| `low` | Will reach reorder point within 14 days |
| `none` | Adequate stock for foreseeable future |

**API Endpoint:**
```bash
# Quick local predictions
GET /api/v1/ai/inventory/predictions?quick=true

# AI-powered predictions
GET /api/v1/ai/inventory/predictions

# For specific product
GET /api/v1/ai/inventory/predictions?productId=prod-123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "productId": "prod-1",
        "productName": "Tito's Vodka 750ml",
        "currentStock": 12,
        "predictedDaysUntilStockout": 8,
        "predictedStockoutDate": "2026-01-28",
        "averageDailySales": 1.5,
        "salesTrend": "increasing",
        "confidence": 0.82,
        "urgency": "high",
        "recommendation": {
          "recommendedQuantity": 36,
          "recommendedOrderDate": "2026-01-22",
          "estimatedCost": 540.00,
          "reasoning": "Based on 1.5 units/day with 3-day lead time"
        }
      }
    ],
    "criticalItems": [...],
    "upcomingStockouts": [...],
    "totalReorderCost": 1250.00,
    "generatedAt": "2026-01-20T..."
  }
}
```

**Key Files:**
- `src/lib/ai/prediction-engine.ts` - Prediction logic
- `src/app/api/v1/ai/inventory/predictions/route.ts` - API endpoint
- `src/app/ops/inventory/predictions/page.tsx` - Predictions UI

---

## Core Inventory Operations

### Adjust Inventory

```bash
POST /api/v1/inventory
{
  "operation": "adjust",
  "productId": "prod-123",
  "variantId": "var-456",
  "locationId": "loc-789",
  "quantity": -5,
  "reason": "damaged",
  "type": "DAMAGED"
}
```

**Movement Types:** `RECEIVED`, `SOLD`, `ADJUSTMENT`, `RETURN`, `TRANSFER`, `AI_COUNT`, `DAMAGED`, `EXPIRED`

### Transfer Between Locations

```bash
POST /api/v1/inventory
{
  "operation": "transfer",
  "productId": "prod-123",
  "fromLocationId": "loc-001",
  "toLocationId": "loc-002",
  "quantity": 10,
  "reason": "Restocking downtown location"
}
```

### Set Inventory Count

```bash
POST /api/v1/inventory
{
  "operation": "count",
  "locationId": "loc-123",
  "counts": [
    { "productId": "prod-1", "quantity": 24 },
    { "productId": "prod-2", "quantity": 12 }
  ],
  "countedBy": "user-456"
}
```

---

## Database Schema

### Core Tables

```sql
InventoryLocation
├── id (UUID)
├── name (String)
├── address (JSON)
├── isActive (Boolean)
└── isDefault (Boolean)

InventoryItem
├── id (UUID)
├── productId (FK)
├── variantId (FK)
├── locationId (FK)
├── quantity (Int)
├── reservedQuantity (Int)
├── lowStockThreshold (Int)
├── reorderPoint (Int)
├── costPerUnit (Decimal)
├── lastCountedAt (DateTime)
└── lastCountedBy (String)

InventoryMovement
├── id (UUID)
├── inventoryItemId (FK)
├── type (Enum)
├── quantity (Int)
├── previousQuantity (Int)
├── newQuantity (Int)
├── reason (String)
├── referenceType (String)
├── referenceId (String)
├── aiConfidence (Float)
├── aiImageUrl (String)
└── createdBy, createdAt

LowStockAlert
├── id (UUID)
├── productId, variantId, locationId (FKs)
├── currentQuantity (Int)
├── threshold (Int)
├── status (ACTIVE | ACKNOWLEDGED | RESOLVED)
└── acknowledgedAt, acknowledgedBy
```

### AI Tables

```sql
AIInventoryCount
├── id (UUID)
├── locationId (FK)
├── imageUrl (String)
├── status (PROCESSING | COMPLETED | FAILED | PENDING_REVIEW | APPLIED)
├── rawResponse (JSON)
├── detectedItems (JSON)
├── overallConfidence (Float)
└── reviewedAt, reviewedBy, appliedAt

AIInventoryQuery
├── id (UUID)
├── query (Text)
├── response (JSON)
├── tokensUsed (Int)
├── modelUsed (String)
└── createdBy, createdAt
```

---

## Environment Variables

```bash
# REQUIRED for AI features
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# REQUIRED for database
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/ai/inventory/count` | POST | Image-based counting | ✅ Working |
| `/api/v1/ai/inventory/count` | GET | Get count history | ✅ Working |
| `/api/v1/ai/inventory/count/[id]/apply` | POST | Apply AI count to DB | ⚠️ Partial |
| `/api/v1/ai/inventory/query` | POST | Natural language query | ✅ Working |
| `/api/v1/ai/inventory/predictions` | GET | Stock predictions | ✅ Working |
| `/api/v1/inventory` | GET | List inventory items | ✅ Working |
| `/api/v1/inventory` | POST | Adjust/transfer/count | ✅ Working |
| `/api/v1/inventory/locations` | GET/POST | Manage locations | ✅ Working |
| `/api/v1/inventory/alerts` | GET/POST | Low stock alerts | ✅ Working |

---

## UI Pages

| Page | URL | Purpose |
|------|-----|---------|
| Inventory Dashboard | `/ops/inventory` | Overview, stats, filters |
| AI Counting | `/ops/inventory/count` | Upload images, review counts |
| Predictions | `/ops/inventory/predictions` | View stockout forecasts |

---

## What's Complete vs Incomplete

### ✅ Complete
- Image-based inventory counting via Claude Vision
- Natural language queries about inventory
- Stock predictions with urgency levels
- Core inventory operations (adjust, transfer, count)
- Location management
- Low stock alerts
- Movement history tracking
- Ops dashboard pages

### ⚠️ Partially Complete
- AI count application to database (logic needs refinement)
- Advanced analytics dashboards
- Inventory reports

### ❌ Not Implemented
- Auto-generated purchase orders
- Barcode/QR scanning
- Multi-location comparison dashboard
- Supplier integration

---

# Part 1.5: Local Checkout + Stripe Payment System

## Overview

The Local Checkout System allows orders to be processed entirely through the local database with Stripe payments, bypassing Shopify checkout. This is the foundation for eventually migrating away from Shopify for inventory management.

## Status: ✅ WORKING (Tested Jan 22, 2026)

## Architecture

```
LOCAL CHECKOUT FLOW:
  User adds to cart → POST /api/v1/cart
  Cart stored in PostgreSQL (Cart, CartItem tables)

  User fills checkout form → POST /api/v1/cart/delivery
  Delivery info saved to cart

  User clicks "Proceed to Payment" → POST /api/v1/checkout
  Creates Stripe Checkout Session
  Redirects to Stripe hosted checkout

  User pays with card → Stripe processes payment

  Stripe sends webhook → POST /api/webhooks/stripe
  checkout.session.completed event triggers:
    1. Create/find Customer record (supports guest checkout)
    2. Create Order record with Stripe IDs
    3. Create OrderItem records
    4. Mark cart as CONVERTED

  User redirected to success page
```

## Feature Flag

**Enable local checkout by setting in `.env.local`:**
```env
NEXT_PUBLIC_USE_CUSTOM_CART=true
```

When `true`:
- Cart uses `/api/v1/cart` (PostgreSQL)
- Checkout uses `/api/v1/checkout` (Stripe)
- Orders stored locally with Stripe payment IDs

When `false`:
- Cart uses Shopify Storefront API
- Checkout redirects to Shopify

## Environment Variables Required

```env
# Feature flag
NEXT_PUBLIC_USE_CUSTOM_CART=true

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # From Stripe CLI
```

## Key Files

| File | Purpose |
|------|---------|
| `src/contexts/CartContext.tsx` | Cart state, USE_CUSTOM_CART flag |
| `src/lib/inventory/services/cart-service.ts` | Cart CRUD operations |
| `src/lib/inventory/services/order-service.ts` | Order creation from Stripe session |
| `src/lib/stripe/checkout.ts` | Stripe session creation |
| `src/lib/stripe/webhooks.ts` | Webhook event processing |
| `src/app/api/v1/cart/route.ts` | Cart API endpoint |
| `src/app/api/v1/checkout/route.ts` | Checkout session API |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook endpoint |

## Testing Locally

```bash
# Terminal 1: Start dev server
npm run dev -- --port 3005

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to localhost:3005/api/webhooks/stripe

# Test card: 4242 4242 4242 4242, any future expiry, any CVC
```

## What's Working ✅
- Local cart storage (PostgreSQL)
- Stripe Checkout session creation
- Payment processing
- Webhook handling (all events return 200)
- Order creation from checkout
- Guest checkout (auto-creates Customer record)
- Customer email/phone capture from Stripe

## What's Not Yet Tested
- Inventory decrement on order (code exists, needs verification)
- Order confirmation emails (RESEND_API_KEY not configured)
- Refund handling

## Bug Fixes Applied (Jan 22, 2026)
1. **Guest checkout support**: `order-service.ts` now creates Customer record from Stripe session if cart has no customerId
2. **Payment intent type**: Handle `session.payment_intent` as object or string

---

# Part 2: Group Ordering System

## Overview

The Group Ordering System enables collaborative ordering for events and parties. A host creates a group order, shares a code with friends, everyone shops independently with their own cart, and all orders deliver together with **FREE DELIVERY** for all participants.

## Architecture

```
HOST CREATES GROUP ORDER
  └─ /group/create
     └─ Generates unique 6-char share code
     └─ Creates GroupOrder in database
     └─ Redirected to /group/dashboard

PARTICIPANTS JOIN
  └─ /group/{shareCode}
     └─ Age verification required
     └─ Enter name/email
     └─ GroupParticipant created
     └─ FREE DELIVERY discount applied to cart
     └─ Redirected to /products to shop

SHOPPING PHASE
  └─ Each participant shops independently
  └─ Cart totals sync to group in real-time
  └─ Host sees live dashboard updates

CHECKOUT (Single Payment Model)
  └─ Host locks group (no new joins)
  └─ Host creates checkout
  └─ All carts merged into Shopify Draft Order
  └─ Host receives invoice
  └─ Host pays for entire group
  └─ Single delivery to event address
```

---

## User Flows

### Host Flow

1. **Navigate to** `/group/create`
2. **Fill form:**
   - Event name (e.g., "BACH-SARAH-2026")
   - Your name
   - Delivery date (72+ hours, no Sundays)
   - Delivery time slot
   - Delivery address (or select partner location)
3. **Click "Create Group Order"**
4. **Share the code** via the modal (copy link, email, SMS)
5. **Monitor dashboard** at `/group/dashboard`
   - See all participants in real-time
   - View cart totals and item counts
   - See who has checked out
6. **When ready, close the group** (prevents new joins)
7. **Create checkout** (merges all carts into one order)
8. **Pay via invoice** sent to your email

### Participant Flow

1. **Receive share link** from host (e.g., `/group/ABC123`)
2. **Click link** to view group details
3. **Verify age** (21+ required)
4. **Enter name and email**
5. **Click "Join & Start Shopping"**
6. **Shop normally** - free delivery is automatic
7. **Checkout when ready** - your items are included in the group order

---

## Share Code System

**Format:** 6 characters using:
- Letters: A-Z (excluding I, O to avoid confusion)
- Numbers: 2-9 (excluding 0, 1 to avoid confusion)

**Example:** `ABC234`, `XYZ789`

**Sharing Options:**
- **Copy Link:** `https://partyondelivery.com/group/ABC234`
- **Copy Code:** Just the code for text/voice sharing
- **Email:** Opens email client with pre-written message
- **SMS:** Opens text app with share message

---

## Customer-Facing Features

### /group/create - Create Group Order

| Field | Required | Description |
|-------|----------|-------------|
| Event Name | Yes | Displayed to participants, used in share messages |
| Your Name | Yes | Host name shown on group |
| Delivery Date | Yes | 72+ hours from now, no Sundays |
| Delivery Time | Yes | 1-hour slots from 9am-8pm |
| Address | Yes | Partner location dropdown or manual entry |

### /group/{code} - Group Landing Page

Shows:
- Event name and delivery details
- Host name
- Current participants (name, status)
- Join form (if order is active)
- "Already joined" message if participant

### /group/dashboard - Host Dashboard

Shows:
- **Stats:** Total participants, checked out count, total items
- **Participants List:** Name, status (Shopping/Checked out), cart total
- **Progress Bar:** X of Y participants checked out
- **Items Ordered:** Aggregated view of all items
- **Actions:** Remove participant, Close group, Create checkout

---

## Host Features

| Feature | Description |
|---------|-------------|
| **Real-time Updates** | Dashboard refreshes every 5 seconds |
| **Remove Participant** | Soft-deletes participant from group |
| **Close Group** | Prevents new joins, enables checkout |
| **Create Checkout** | Merges all carts into single Draft Order |
| **View Items** | See aggregated items from all participants |

---

## Admin/Ops Features

### /ops/group-orders - Group Orders List

- Paginated list of all group orders
- Search by name or share code
- Filter by status (ACTIVE, LOCKED, COMPLETED, CANCELLED, CLOSED)
- Shows: Host, date, participant count, total value

### /ops/group-orders/{id} - Group Order Detail

- Full order details
- Participant list with checkout status
- Items ordered
- Payment information

---

## API Endpoints

### Group Order Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/group-orders/create` | POST | Create new group order |
| `/api/group-orders/[code]` | GET | Get group order by share code |
| `/api/group-orders/[code]/lock-order` | POST | Close group to new participants |
| `/api/group-orders/[code]/remove-participant` | POST | Remove participant from group |
| `/api/group-orders/[code]/update-cart` | POST | Sync participant cart totals |
| `/api/group-orders/[code]/items` | GET | Get aggregated items |
| `/api/group-orders/[code]/create-checkout` | POST | Merge carts into draft order |

### Participant Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/group-orders/id/[id]/join` | POST | Join group order |

### Admin APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/admin/group-orders` | GET | List all group orders |
| `/api/v1/admin/group-orders/[id]` | GET | Get specific group order |

---

## Database Schema

### GroupOrder

```sql
GroupOrder
├── id (UUID)
├── name (String) -- Event name
├── hostCustomerId (String)
├── hostName (String)
├── shareCode (String, UNIQUE, INDEXED)
├── status (ACTIVE | LOCKED | CLOSED | COMPLETED | CANCELLED)
├── deliveryDate (DateTime)
├── deliveryTime (String)
├── deliveryAddress (JSON)
├── minimumOrderAmount (Decimal, default 0)
├── expiresAt (DateTime, 7 days)
├── multiPaymentEnabled (Boolean, default false)
├── paymentDeadline (DateTime)
├── hostDecision (Enum)
└── createdAt, updatedAt
```

### GroupParticipant

```sql
GroupParticipant
├── id (UUID)
├── groupOrderId (FK)
├── customerId (String, nullable)
├── guestName (String)
├── guestEmail (String)
├── cartId (String) -- Shopify cart ID
├── ageVerified (Boolean)
├── status (ACTIVE | REMOVED | CHECKED_OUT)
├── cartTotal (Decimal)
├── itemCount (Int)
├── joinedAt (DateTime)
├── checkedOutAt (DateTime)
├── shopifyOrderId (String)
└── shopifyOrderName (String)

UNIQUE: (groupOrderId, cartId)
```

### GroupOrderItem

```sql
GroupOrderItem
├── id (UUID)
├── groupOrderId (FK)
├── participantId (FK)
├── shopifyLineId (String)
├── title (String)
├── variantTitle (String)
├── quantity (Int)
├── price (Decimal)
├── imageUrl (String)
└── createdAt
```

---

## Key Definitions

| Term | Definition |
|------|------------|
| **Share Code** | 6-character unique identifier for a group order (e.g., ABC234) |
| **Host** | Person who creates the group order, makes delivery decisions, pays for merged order |
| **Participant** | Person who joins an existing group order and shops independently |
| **Cart Merging** | Process of combining all participant carts into a single Shopify Draft Order |
| **Free Delivery** | Automatic discount applied to all participants in a group order |

### Status Definitions

**Group Order Status:**
| Status | Meaning |
|--------|---------|
| `ACTIVE` | Accepting new participants, shopping phase |
| `LOCKED` / `CLOSED` | No new joins, ready for checkout |
| `COMPLETED` | Order has been paid |
| `CANCELLED` | Group was cancelled |

**Participant Status:**
| Status | Meaning |
|--------|---------|
| `ACTIVE` | Currently shopping |
| `CHECKED_OUT` | Completed purchase |
| `REMOVED` | Host removed from group |

---

## Free Delivery System

1. When participant joins, discount code `GROUPFREEDELIVERY` is applied
2. Discount must exist in Shopify Admin as "Free Shipping"
3. Cart attributes set:
   - `group_order: "true"`
   - `share_code: "{CODE}"`
   - `group_name: "{NAME}"`
   - `delivery_date: "{DATE}"`
   - `delivery_time: "{TIME}"`

---

## Key Files

### Library
- `src/lib/group-orders/types.ts` - TypeScript types
- `src/lib/group-orders/api.ts` - Client-side API wrapper
- `src/lib/group-orders/database.ts` - Prisma database layer
- `src/lib/group-orders/hooks.ts` - React hooks
- `src/lib/group-orders/free-delivery.ts` - Discount management

### Context
- `src/contexts/GroupOrderContext.tsx` - Global state management

### Pages
- `src/app/group/create/page.tsx` - Create group
- `src/app/group/[code]/page.tsx` - Join/view group
- `src/app/group/join/page.tsx` - Join landing page
- `src/app/group/dashboard/page.tsx` - Host dashboard
- `src/app/ops/group-orders/page.tsx` - Admin list
- `src/app/ops/group-orders/[id]/page.tsx` - Admin detail

### Components
- `src/components/group-orders/ShareGroupOrder.tsx` - Share modal
- `src/components/group-orders/GroupOrderItems.tsx` - Items display

---

## What's Complete vs Incomplete

### ✅ Production Ready
- Group order creation with validation
- Unique share code generation
- Participant joining with age verification
- Free delivery automatic application
- Real-time host dashboard (5-second refresh)
- Cart sync across participants
- Participant removal
- Group locking/closing
- Merged checkout via Shopify Draft Orders
- Admin dashboard for ops team
- Join landing page (`/group/join`)

### ⚠️ Partially Complete
- Multi-payment system (APIs built, UI not complete)
- Stripe payment integration (logic written, needs UI)
- Checkout success pages (routes exist but empty)
- QR code generation (component structure present, not active)

### ❌ Not Implemented
- Split payment UI flow
- Individual participant checkout pages
- Refund handling UI
- Webhook integration for order status updates

---

# Quick Reference

## Environment Variables Required

```bash
# AI Features
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Database
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# Shopify (for group orders)
NEXT_PUBLIC_SHOPIFY_DOMAIN=store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxx
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
```

## Common Operations

### Test Inventory AI Query
```bash
curl -X POST http://localhost:3000/api/v1/ai/inventory/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is running low?"}'
```

### Get Stock Predictions
```bash
curl http://localhost:3000/api/v1/ai/inventory/predictions?quick=true
```

### Create Group Order (API)
```bash
curl -X POST http://localhost:3000/api/group-orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Party",
    "deliveryDate": "2026-01-25",
    "deliveryTime": "2:00 PM - 3:00 PM",
    "deliveryAddress": {
      "address1": "123 Main St",
      "city": "Austin",
      "province": "TX",
      "zip": "78701",
      "country": "US"
    },
    "customerId": "guest_123",
    "customerName": "John Doe"
  }'
```

---

*Last updated: January 2026*
