# Group Orders Implementation Guide

## Overview
Group ordering allows multiple people to collaborate on a single PartyOn Delivery order. A host creates the group order, shares it with participants, and manages the checkout process.

## Architecture

### Database Schema
```sql
-- Group Orders table
CREATE TABLE group_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  host_customer_id VARCHAR(255) NOT NULL,
  share_code VARCHAR(8) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, locked, completed, cancelled
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(50) NOT NULL,
  delivery_address JSONB NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 100.00,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group Participants table
CREATE TABLE group_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_order_id UUID REFERENCES group_orders(id) ON DELETE CASCADE,
  customer_id VARCHAR(255),
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  cart_id VARCHAR(255) NOT NULL,
  age_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active', -- active, removed
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_order_id, cart_id)
);

-- Group Messages table (optional for v2)
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_order_id UUID REFERENCES group_orders(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES group_participants(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_group_orders_share_code ON group_orders(share_code);
CREATE INDEX idx_group_orders_status ON group_orders(status);
CREATE INDEX idx_group_participants_group_order ON group_participants(group_order_id);
```

### API Endpoints

#### POST /api/group-orders/create
Create a new group order
```typescript
Request: {
  name: string
  deliveryDate: string
  deliveryTime: string
  deliveryAddress: Address
  customerId: string
}
Response: {
  id: string
  shareCode: string
  shareUrl: string
}
```

#### GET /api/group-orders/[code]
Get group order by share code
```typescript
Response: {
  id: string
  name: string
  hostName: string
  status: string
  deliveryInfo: {
    date: string
    time: string
    address: Address
  }
  participants: Participant[]
  totalAmount: number
  itemCount: number
}
```

#### POST /api/group-orders/[id]/join
Join a group order
```typescript
Request: {
  cartId: string
  customerId?: string
  guestName?: string
  guestEmail?: string
}
Response: {
  participantId: string
  groupOrderId: string
}
```

#### GET /api/group-orders/[id]/participants
List all participants and their carts

#### POST /api/group-orders/[id]/lock
Lock order for checkout (host only)

#### POST /api/group-orders/[id]/checkout
Create consolidated checkout (host only)

#### DELETE /api/group-orders/[id]/participants/[participantId]
Remove a participant (host only)

## Frontend Components

### 1. CreateGroupOrderModal
Location: `/src/components/group-orders/CreateGroupOrderModal.tsx`
- Modal triggered from cart
- Form for order details
- Generates share code
- Creates group order via API

### 2. GroupOrderContext
Location: `/src/contexts/GroupOrderContext.tsx`
- Manages group order state
- Provides methods for joining/leaving
- Syncs with cart context

### 3. GroupOrderLanding
Location: `/app/group/[code]/page.tsx`
- Public landing page for share links
- Shows order details and participants
- Join button with age verification

### 4. GroupOrderDashboard
Location: `/src/components/group-orders/GroupOrderDashboard.tsx`
- Host view of all participants
- Order management controls
- Lock and checkout actions

### 5. ShareGroupOrder
Location: `/src/components/group-orders/ShareGroupOrder.tsx`
- Share modal with multiple options
- Copy link, QR code, messaging

## User Flows

### Creating a Group Order
1. User adds items to cart
2. Clicks "Start Group Order" in cart
3. Fills out delivery details in modal
4. System creates order and generates share code
5. Share modal appears with options

### Joining a Group Order
1. Participant receives share link
2. Lands on group order page
3. Views order details and current participants
4. Clicks "Join Order"
5. Completes age verification
6. Redirected to shop with group context active

### Managing a Group Order (Host)
1. Host accesses dashboard via account
2. Views all participants and selections
3. Can remove participants if needed
4. Monitors progress to minimum order
5. Locks order when ready
6. Proceeds to consolidated checkout

### Checkout Process
1. Host locks the order
2. System creates master cart via Shopify API
3. All participant items consolidated
4. Host completes checkout
5. Success page shows individual totals
6. Participants notified of completion

## Implementation Plan

### Phase 1: Core Infrastructure
- Database setup
- API endpoints
- Basic types and interfaces

### Phase 2: Creation Flow
- Create modal component
- Share functionality
- Group order context

### Phase 3: Participant Experience
- Landing page
- Join flow with age verification
- Cart integration

### Phase 4: Host Management
- Dashboard component
- Participant management
- Order locking

### Phase 5: Checkout Integration
- Cart consolidation
- Checkout redirect
- Success page updates

### Phase 6: Polish & Testing
- Error handling
- Loading states
- Edge cases

## Security Considerations
- Validate host permissions server-side
- Rate limit group creation
- Secure share code generation
- Age verification for all participants
- Prevent checkout with unverified participants

## Performance Optimizations
- Cache group data with Redis
- Debounce cart updates
- Efficient cart merging
- Paginate large participant lists
- Use SWR for data fetching with polling

## Future Enhancements
- Group chat functionality
- Split payment integration
- Recurring group orders
- Group order templates
- Analytics dashboard