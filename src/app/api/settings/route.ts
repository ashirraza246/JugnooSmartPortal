import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(getDefaultSettings())
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single()

    if (error || !data) {
      return Response.json(getDefaultSettings())
    }

    return Response.json(data.settings || getDefaultSettings())
  } catch (error) {
    console.error('Settings GET error:', error)
    return Response.json(getDefaultSettings())
  }
}

export async function PUT(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const settings = await req.json()

    // Upsert into site_settings table
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        id: 'main',
        settings: settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return helpful error
      if (error.code === '42P01') {
        return Response.json({
          error: 'site_settings table nahi mili. Supabase SQL Editor mein yeh run karein:',
          sql: getSettingsTableSQL(),
          needsSetup: true,
        }, { status: 400 })
      }
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true, settings: data.settings })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return Response.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

function getDefaultSettings() {
  return {
    business: {
      name: 'Jugnoo Photostate',
      address: 'Chowk Azam, Layyah, Punjab, Pakistan',
      phone: '0300-1234567',
      whatsapp: '923001234567',
      email: 'info@jugnoo.pk',
    },
    payments: {
      jazzCash: {
        accountNumber: '0300-1234567',
        accountHolderName: 'Jugnoo Photostate',
      },
      easyPaisa: {
        accountNumber: '0300-7654321',
        accountHolderName: 'Jugnoo Photostate',
      },
      bankTransfer: {
        bankName: 'UBL',
        accountNumber: '1234-5678-9012',
        accountHolderName: 'Jugnoo Photostate',
        iban: '',
      },
    },
  }
}

function getSettingsTableSQL() {
  return `CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO site_settings (id, settings) VALUES ('main', '${JSON.stringify(getDefaultSettings())}');`
}
