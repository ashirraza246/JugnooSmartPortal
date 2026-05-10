CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow all on site_settings') THEN
    CREATE POLICY "Allow all on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'required_documents') THEN
    ALTER TABLE service_listings ADD COLUMN required_documents JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'official_url') THEN
    ALTER TABLE service_listings ADD COLUMN official_url TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'apply_process') THEN
    ALTER TABLE service_listings ADD COLUMN apply_process TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_listings' AND column_name = 'personal_info_fields') THEN
    ALTER TABLE service_listings ADD COLUMN personal_info_fields JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'payment_method') THEN
    ALTER TABLE service_applications ADD COLUMN payment_method TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'personal_info') THEN
    ALTER TABLE service_applications ADD COLUMN personal_info JSONB DEFAULT '{}';
  END IF;
END $$;

INSERT INTO site_settings (id, settings) VALUES ('main', '{"business": {"name": "Jugnoo Photostate", "address": "Chowk Azam, Layyah, Punjab, Pakistan", "phone": "0300-1234567", "whatsapp": "923001234567", "email": "info@jugnoo.pk"}, "payments": {"jazzCash": {"accountNumber": "0300-1234567", "accountHolderName": "Jugnoo Photostate"}, "easyPaisa": {"accountNumber": "0300-7654321", "accountHolderName": "Jugnoo Photostate"}, "bankTransfer": {"bankName": "UBL", "accountNumber": "1234-5678-9012", "accountHolderName": "Jugnoo Photostate", "iban": ""}}}') ON CONFLICT (id) DO NOTHING;
