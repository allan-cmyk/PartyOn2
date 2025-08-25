-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Group Orders table
CREATE TABLE group_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  host_customer_id VARCHAR(255) NOT NULL,
  host_name VARCHAR(255),
  share_code VARCHAR(8) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'locked', 'completed', 'cancelled')),
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(50) NOT NULL,
  delivery_address JSONB NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 100.00,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  cart_total DECIMAL(10,2) DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_order_id, cart_id)
);

-- Group Messages table (for future use)
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_order_id UUID REFERENCES group_orders(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES group_participants(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_group_orders_share_code ON group_orders(share_code);
CREATE INDEX idx_group_orders_status ON group_orders(status);
CREATE INDEX idx_group_orders_host ON group_orders(host_customer_id);
CREATE INDEX idx_group_participants_group_order ON group_participants(group_order_id);
CREATE INDEX idx_group_participants_customer ON group_participants(customer_id);

-- Row Level Security (RLS)
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Policies for public access (adjust based on your auth strategy)
-- Allow anyone to read group orders by share code
CREATE POLICY "Group orders are viewable by share code" 
  ON group_orders FOR SELECT 
  USING (true);

-- Allow anyone to create group orders
CREATE POLICY "Anyone can create group orders" 
  ON group_orders FOR INSERT 
  WITH CHECK (true);

-- Allow hosts to update their own group orders
CREATE POLICY "Hosts can update their own group orders" 
  ON group_orders FOR UPDATE 
  USING (true); -- In production, check auth.uid() = host_customer_id

-- Allow anyone to view participants
CREATE POLICY "Participants are viewable" 
  ON group_participants FOR SELECT 
  USING (true);

-- Allow anyone to join group orders
CREATE POLICY "Anyone can join group orders" 
  ON group_participants FOR INSERT 
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_group_orders_updated_at 
  BEFORE UPDATE ON group_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();