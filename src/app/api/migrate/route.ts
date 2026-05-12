import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const MIGRATION_SQL = `-- ============================================
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Commission Rules table
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

-- WhatsApp Notifications table
CREATE TABLE IF NOT EXISTS whatsapp_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'whatsapp_pending',
  subtype TEXT NOT NULL CHECK (subtype IN ('status_change', 'payment_confirmed', 'document_ready', 'order_created')),
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  wa_link TEXT NOT NULL,
  order_id UUID,
  application_id UUID,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE whatsapp_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON whatsapp_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_is_sent ON whatsapp_notifications(is_sent) WHERE is_sent = false;

-- Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- Add missing columns to service_listings
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
END $$;

-- Add missing columns to service_applications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'payment_method') THEN
    ALTER TABLE service_applications ADD COLUMN payment_method TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'personal_info') THEN
    ALTER TABLE service_applications ADD COLUMN personal_info JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'transaction_id') THEN
    ALTER TABLE service_applications ADD COLUMN transaction_id TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'uploaded_documents') THEN
    ALTER TABLE service_applications ADD COLUMN uploaded_documents JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'result_document_url') THEN
    ALTER TABLE service_applications ADD COLUMN result_document_url TEXT DEFAULT '';
  END IF;
END $$;

-- Seed site_settings
INSERT INTO site_settings (id, settings) VALUES ('main', '{"business": {"name": "Jugnoo Photostate", "address": "Chowk Azam, Layyah, Punjab, Pakistan", "phone": "0300-1234567", "whatsapp": "923001234567", "email": "info@jugnoo.pk"}, "payments": {"jazzCash": {"accountNumber": "0300-1234567", "accountHolderName": "Jugnoo Photostate"}, "easyPaisa": {"accountNumber": "0300-7654321", "accountHolderName": "Jugnoo Photostate"}, "bankTransfer": {"bankName": "UBL", "accountNumber": "1234-5678-9012", "accountHolderName": "Jugnoo Photostate", "iban": ""}}}') ON CONFLICT (id) DO NOTHING;`

function isNetworkError(error: unknown): boolean {
  if (!error) return false
  const msg = String(error)
  return msg.includes('fetch failed') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('network')
}

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ 
        error: 'Supabase not configured',
        sql: MIGRATION_SQL,
        message: 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then retry.',
      }, { status: 500 })
    }

    const results: string[] = []
    let networkError = false

    // Check commission_rules table
    const { data: crData, error: crError } = await supabase.from('commission_rules').select('id').limit(1)
    if (crError) {
      if (isNetworkError(crError.message) || isNetworkError(crError.details)) {
        results.push('commission_rules: ❌ NETWORK ERROR — cannot reach Supabase (project may be paused)')
        networkError = true
      } else if (crError.code === '42P01') {
        results.push('commission_rules: ⚠️  TABLE NOT FOUND — needs creation')
      } else {
        results.push(`commission_rules: ❌ error: ${crError.message}`)
      }
    } else {
      results.push('commission_rules: ✅ table exists')
    }

    // Check whatsapp_notifications table
    const { data: wnData, error: wnError } = await supabase.from('whatsapp_notifications').select('id').limit(1)
    if (wnError) {
      if (isNetworkError(wnError.message) || isNetworkError(wnError.details)) {
        results.push('whatsapp_notifications: ❌ NETWORK ERROR — cannot reach Supabase (project may be paused)')
        networkError = true
      } else if (wnError.code === '42P01') {
        results.push('whatsapp_notifications: ⚠️  TABLE NOT FOUND — needs creation')
      } else {
        results.push(`whatsapp_notifications: ❌ error: ${wnError.message}`)
      }
    } else {
      results.push('whatsapp_notifications: ✅ table exists')
    }

    // Check site_settings table
    const { error: settingsError } = await supabase.from('site_settings').select('id').limit(1)
    if (settingsError) {
      if (isNetworkError(settingsError.message) || isNetworkError(settingsError.details)) {
        results.push('site_settings: ❌ NETWORK ERROR — cannot reach Supabase')
        networkError = true
      } else if (settingsError.code === '42P01') {
        results.push('site_settings: ⚠️  TABLE NOT FOUND — needs creation')
      } else {
        results.push(`site_settings: ❌ error: ${settingsError.message}`)
      }
    } else {
      results.push('site_settings: ✅ table exists')
    }

    // Check service_applications columns
    const { error: appTest } = await supabase.from('service_applications').select('payment_method').limit(1)
    if (appTest) {
      if (isNetworkError(appTest.message) || isNetworkError(appTest.details)) {
        results.push('service_applications: ❌ NETWORK ERROR — cannot reach Supabase')
        networkError = true
      } else if (appTest.code === '42703') {
        results.push('service_applications: ⚠️  missing payment_method column')
      } else if (appTest.code === '42P01') {
        results.push('service_applications: ⚠️  TABLE NOT FOUND')
      } else {
        results.push(`service_applications: ✅ table and columns OK`)
      }
    } else {
      results.push('service_applications: ✅ table and columns OK')
    }

    const needsSetup = results.some(r => r.includes('NOT FOUND') || r.includes('needs creation') || r.includes('missing'))

    let status: string
    if (networkError) {
      status = 'network_error'
    } else if (needsSetup) {
      status = 'needs_setup'
    } else {
      status = 'ready'
    }

    return Response.json({
      status,
      results,
      sql: (networkError || needsSetup) ? MIGRATION_SQL : null,
      message: networkError
        ? 'Cannot reach Supabase. The project may be paused. Go to https://supabase.com/dashboard to restore it, then run the SQL below in the SQL Editor.'
        : needsSetup
          ? 'Some tables/columns need creation in Supabase SQL Editor. See SQL below.'
          : 'All tables and columns are ready!',
    })
  } catch (error) {
    console.error('Migration check error:', error)
    const isNetErr = isNetworkError(error)
    return Response.json({ 
      error: 'Failed to check migration status',
      sql: MIGRATION_SQL,
      message: isNetErr 
        ? 'Network error: Cannot reach Supabase. The project may be paused. Restore it at https://supabase.com/dashboard'
        : 'Unexpected error during migration check.',
    }, { status: 500 })
  }
}
