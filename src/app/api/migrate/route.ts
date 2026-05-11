import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const results: string[] = []

    // Try to create site_settings table via insert (will fail if table doesn't exist)
    const { error: settingsError } = await supabase.from('site_settings').upsert({
      id: 'main',
      settings: {
        business: {
          name: 'Jugnoo Photostate',
          address: 'Chowk Azam, Layyah, Punjab, Pakistan',
          phone: '0300-1234567',
          whatsapp: '923001234567',
          email: 'info@jugnoo.pk',
        },
        payments: {
          jazzCash: { accountNumber: '0300-1234567', accountHolderName: 'Jugnoo Photostate' },
          easyPaisa: { accountNumber: '0300-7654321', accountHolderName: 'Jugnoo Photostate' },
          bankTransfer: { bankName: 'UBL', accountNumber: '1234-5678-9012', accountHolderName: 'Jugnoo Photostate', iban: '' },
        },
      },
    }, { onConflict: 'id' })

    if (settingsError) {
      if (settingsError.code === '42P01') {
        results.push('site_settings table NOT FOUND - needs manual creation in Supabase SQL Editor')
      } else {
        results.push(`site_settings error: ${settingsError.message}`)
      }
    } else {
      results.push('site_settings table OK - settings saved')
    }

    // Try to add columns to service_listings by doing a test update
    const { data: testService } = await supabase.from('service_listings').select('id').limit(1).single()
    if (testService) {
      const { error: updateError } = await supabase.from('service_listings').update({
        required_documents: [],
        official_url: '',
        apply_process: '',
        personal_info_fields: [],
      }).eq('id', testService.id)

      if (updateError) {
        results.push(`service_listings columns may be missing: ${updateError.message}`)
      } else {
        results.push('service_listings columns OK')
      }
    } else {
      results.push('service_listings table empty - will use defaults')
    }

    // Try service_applications columns
    const { error: appTest } = await supabase.from('service_applications').select('payment_method').limit(1)
    if (appTest && appTest.code === '42703') {
      results.push('service_applications missing payment_method column - needs ALTER TABLE')
    } else if (appTest && appTest.code === '42P01') {
      results.push('service_applications table NOT FOUND')
    } else {
      results.push('service_applications table OK')
    }

    const needsManualSetup = results.some(r => r.includes('NOT FOUND') || r.includes('missing') || r.includes('needs'))

    return Response.json({
      status: needsManualSetup ? 'needs_setup' : 'ready',
      results,
      sql: needsManualSetup ? getMigrationSQL() : null,
      message: needsManualSetup
        ? 'Some tables/columns need manual creation in Supabase SQL Editor. See SQL below.'
        : 'All tables and columns are ready!',
    })
  } catch (error) {
    console.error('Migration check error:', error)
    return Response.json({ error: 'Failed to check migration status' }, { status: 500 })
  }
}

function getMigrationSQL() {
  return `-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'transaction_id') THEN
    ALTER TABLE service_applications ADD COLUMN transaction_id TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'uploaded_documents') THEN
    ALTER TABLE service_applications ADD COLUMN uploaded_documents JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'payment_method') THEN
    ALTER TABLE service_applications ADD COLUMN payment_method TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_applications' AND column_name = 'result_document_url') THEN
    ALTER TABLE service_applications ADD COLUMN result_document_url TEXT DEFAULT '';
  END IF;
END $$;

INSERT INTO site_settings (id, settings) VALUES ('main', '{"business": {"name": "Jugnoo Photostate", "address": "Chowk Azam, Layyah, Punjab, Pakistan", "phone": "0300-1234567", "whatsapp": "923001234567", "email": "info@jugnoo.pk"}, "payments": {"jazzCash": {"accountNumber": "0300-1234567", "accountHolderName": "Jugnoo Photostate"}, "easyPaisa": {"accountNumber": "0300-7654321", "accountHolderName": "Jugnoo Photostate"}, "bankTransfer": {"bankName": "UBL", "accountNumber": "1234-5678-9012", "accountHolderName": "Jugnoo Photostate", "iban": ""}}}') ON CONFLICT (id) DO NOTHING;`
}
