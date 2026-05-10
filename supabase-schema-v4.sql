-- Jugnoo Smart Portal V4 - Apply Flow Management Schema
-- Run this SQL in the Supabase SQL Editor to add apply flow fields

-- Add new columns to service_listings for admin-managed apply flow
DO $$
BEGIN
  -- Eligibility criteria text (admin editable)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'eligibility') THEN
    ALTER TABLE service_listings ADD COLUMN eligibility TEXT DEFAULT '';
  END IF;
  
  -- Deadlines info (JSONB: start_date, end_date, is_rolling, note)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'deadlines') THEN
    ALTER TABLE service_listings ADD COLUMN deadlines JSONB DEFAULT '{}';
  END IF;
  
  -- Loan tiers (JSONB array: tier, name, amount_min, amount_max, markup_rate, duration, collateral)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'loan_tiers') THEN
    ALTER TABLE service_listings ADD COLUMN loan_tiers JSONB DEFAULT '[]';
  END IF;
  
  -- Important details (JSONB array of strings or objects with title+description)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'important_details') THEN
    ALTER TABLE service_listings ADD COLUMN important_details JSONB DEFAULT '[]';
  END IF;
  
  -- Processing time text
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'processing_time') THEN
    ALTER TABLE service_listings ADD COLUMN processing_time TEXT DEFAULT '';
  END IF;
  
  -- Special notes text
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'special_notes') THEN
    ALTER TABLE service_listings ADD COLUMN special_notes TEXT DEFAULT '';
  END IF;
  
  -- Fee info text
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'fee_info') THEN
    ALTER TABLE service_listings ADD COLUMN fee_info TEXT DEFAULT '';
  END IF;
  
  -- Apply flow steps config (JSONB array: which steps to show, their labels, etc.)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'apply_steps') THEN
    ALTER TABLE service_listings ADD COLUMN apply_steps JSONB DEFAULT '[]';
  END IF;
END
$$;
