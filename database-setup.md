# Database Setup for PartyOn Delivery

## Quick Setup Steps

### 1. Vercel Postgres Setup
1. Go to your Vercel Dashboard
2. Select your project (party-on-delivery)
3. Go to the "Storage" tab
4. Click "Create Database" → Select "Postgres"
5. Name it: `partyon-postgres`
6. Click "Create"

### 2. Vercel KV Setup (Optional but Recommended)
1. Same Storage tab
2. Click "Create Database" → Select "KV"
3. Name it: `partyon-kv`
4. Click "Create"

### 3. Install Dependencies
```bash
npm install @vercel/postgres @vercel/kv prisma @prisma/client
npm install -D @types/node
```

### 4. Pull Environment Variables
```bash
vercel env pull .env.development.local
```

## Database Schema

```sql
-- Partner Inquiries
CREATE TABLE partner_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  number_of_rooms VARCHAR(50),
  monthly_volume VARCHAR(50),
  current_provider VARCHAR(255),
  interests TEXT[],
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group Orders (replacing Supabase)
CREATE TABLE group_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  host_customer_id VARCHAR(255) NOT NULL,
  host_name VARCHAR(255),
  share_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(50) NOT NULL,
  delivery_address JSONB NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 100.00,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group Order Participants
CREATE TABLE group_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_order_id UUID REFERENCES group_orders(id) ON DELETE CASCADE,
  customer_id VARCHAR(255),
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  cart_id VARCHAR(255) NOT NULL,
  age_verified BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  cart_total DECIMAL(10,2) DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_cart_per_order UNIQUE(group_order_id, cart_id)
);

-- Order Analytics (supplementing Shopify data)
CREATE TABLE order_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_order_id VARCHAR(255) UNIQUE,
  customer_id VARCHAR(255),
  order_total DECIMAL(10,2),
  delivery_date DATE,
  delivery_time VARCHAR(50),
  delivery_address JSONB,
  order_source VARCHAR(50), -- 'direct', 'group', 'partner'
  partner_id UUID,
  group_order_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_group_orders_share_code ON group_orders(share_code);
CREATE INDEX idx_group_orders_host ON group_orders(host_customer_id);
CREATE INDEX idx_participants_group ON group_participants(group_order_id);
CREATE INDEX idx_participants_cart ON group_participants(cart_id);
CREATE INDEX idx_analytics_customer ON order_analytics(customer_id);
CREATE INDEX idx_partner_inquiries_email ON partner_inquiries(email);
```

## KV (Redis) Usage

We'll use Vercel KV for:
1. **Active group order sessions**: `group:active:{shareCode}` → participant data
2. **Cart synchronization**: `cart:sync:{cartId}` → real-time cart updates
3. **Share code lookups**: `share:{shareCode}` → group_order_id (fast lookup)
4. **Rate limiting**: `rate:{ip}` → request count
5. **Session management**: `session:{sessionId}` → user data

## Data Flow

1. **Group Orders**:
   - Postgres: Persistent storage of orders and participants
   - KV: Active session data, real-time updates

2. **Regular Orders**:
   - Shopify: Main order processing
   - Postgres: Analytics and reporting only

3. **Partner Inquiries**:
   - Postgres: All partner applications and leads

## Next Steps

After setting up the databases in Vercel:

1. Run the migration:
```bash
npm run db:migrate
```

2. Update environment variables in `.env.local`:
```env
# These will be auto-added by Vercel
POSTGRES_URL="..."
POSTGRES_URL_NON_POOLING="..."
KV_URL="..."
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

3. The app will automatically use Vercel Postgres/KV instead of Supabase when these are configured.