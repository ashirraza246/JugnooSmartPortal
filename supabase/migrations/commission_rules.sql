CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  govt_fee NUMERIC DEFAULT 0,
  jugnoo_fee NUMERIC DEFAULT 0,
  commission_type TEXT DEFAULT 'fixed' CHECK (commission_type IN ('fixed', 'percentage')),
  commission_value NUMERIC DEFAULT 0,
  min_commission NUMERIC DEFAULT 0,
  max_commission NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON commission_rules FOR ALL USING (true) WITH CHECK (true);
