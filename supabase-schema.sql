-- Jugnoo Smart Portal - Supabase Database Schema
-- Run this SQL in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users (Staff)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  whatsapp TEXT,
  cnic TEXT,
  email TEXT,
  address TEXT,
  tags TEXT,
  notes TEXT,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_type TEXT NOT NULL DEFAULT 'printing',
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  description TEXT,
  specifications JSONB,
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 4. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  description TEXT,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) DEFAULT 0,
  specifications JSONB
);

-- 5. WhatsApp Templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WhatsApp Messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'sent'
);

-- 7. Government Services
CREATE TABLE IF NOT EXISTS govt_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  application_id TEXT,
  status TEXT DEFAULT 'applied',
  documents JSONB,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  fee_paid BOOLEAN DEFAULT false,
  notes TEXT,
  applied_date DATE,
  status_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notarisation Services
CREATE TABLE IF NOT EXISTS notarisation_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  documents JSONB,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  fee_paid BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  appointment_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  receipt_number TEXT,
  notes TEXT,
  received_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Pricing Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_stock INT DEFAULT 0,
  minimum_stock INT DEFAULT 5,
  unit TEXT NOT NULL DEFAULT 'piece',
  last_restocked DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp);
CREATE INDEX IF NOT EXISTS idx_templates_category ON whatsapp_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_favorite ON whatsapp_templates(is_favorite);
CREATE INDEX IF NOT EXISTS idx_govt_status ON govt_services(status);
CREATE INDEX IF NOT EXISTS idx_notarisation_status ON notarisation_services(status);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(current_stock);

-- Enable Row Level Security (RLS) - Allow all for now (app handles auth)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE govt_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE notarisation_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations
DO $$
BEGIN
  -- Users
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow all on users') THEN
    CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Customers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Allow all on customers') THEN
    CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow all on orders') THEN
    CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Order Items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Allow all on order_items') THEN
    CREATE POLICY "Allow all on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- WhatsApp Templates
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_templates' AND policyname = 'Allow all on whatsapp_templates') THEN
    CREATE POLICY "Allow all on whatsapp_templates" ON whatsapp_templates FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- WhatsApp Messages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_messages' AND policyname = 'Allow all on whatsapp_messages') THEN
    CREATE POLICY "Allow all on whatsapp_messages" ON whatsapp_messages FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Govt Services
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'govt_services' AND policyname = 'Allow all on govt_services') THEN
    CREATE POLICY "Allow all on govt_services" ON govt_services FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Notarisation Services
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notarisation_services' AND policyname = 'Allow all on notarisation_services') THEN
    CREATE POLICY "Allow all on notarisation_services" ON notarisation_services FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Allow all on payments') THEN
    CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Pricing Rules
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricing_rules' AND policyname = 'Allow all on pricing_rules') THEN
    CREATE POLICY "Allow all on pricing_rules" ON pricing_rules FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Inventory
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Allow all on inventory') THEN
    CREATE POLICY "Allow all on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Service Categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_categories' AND policyname = 'Allow all on service_categories') THEN
    CREATE POLICY "Allow all on service_categories" ON service_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_whatsapp_templates_updated_at ON whatsapp_templates;
CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_govt_services_updated_at ON govt_services;
CREATE TRIGGER update_govt_services_updated_at BEFORE UPDATE ON govt_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_notarisation_services_updated_at ON notarisation_services;
CREATE TRIGGER update_notarisation_services_updated_at BEFORE UPDATE ON notarisation_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
