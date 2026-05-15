import { isSupabaseConfigured } from '@/lib/supabase'

const MIGRATION_SQL = `-- Commission Rules table
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

-- Notifications table (for admin panel)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT now(),
  reference_id TEXT,
  reference_type TEXT
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (is_read, created_at DESC) WHERE is_read = false;

-- Storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES
  ('order-files', 'order-files', true, 10485760),
  ('documents', 'documents', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for order-files bucket
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'order-files');
CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'order-files' AND auth.role() = 'authenticated');
CREATE POLICY "Anon upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'order-files');
CREATE POLICY "Authenticated update" ON storage.objects FOR UPDATE USING (bucket_id = 'order-files');
CREATE POLICY "Anon update access" ON storage.objects FOR UPDATE USING (bucket_id = 'order-files');

-- Storage policies for documents bucket
CREATE POLICY "Public read access docs" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Authenticated upload docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Anon upload access docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Authenticated update docs" ON storage.objects FOR UPDATE USING (bucket_id = 'documents');
CREATE POLICY "Anon update access docs" ON storage.objects FOR UPDATE USING (bucket_id = 'documents');`

/**
 * POST /api/migrate/execute
 * 
 * Execute DDL migrations via the Supabase Management API.
 * Requires a Supabase personal access token in the request body.
 * 
 * Body: { accessToken: string }
 * 
 * Get your access token at: https://supabase.com/dashboard/account/tokens
 */
export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await req.json()
    const accessToken = body.accessToken

    if (!accessToken) {
      return Response.json({ 
        error: 'Access token required',
        message: 'Provide your Supabase personal access token. Get one at https://supabase.com/dashboard/account/tokens',
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

    console.log(`Executing migration via Management API for project ${ref}...`)

    const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`Management API error: ${response.status} ${text}`)
      return Response.json({ 
        error: `Management API returned ${response.status}`,
        details: text,
        message: response.status === 401 
          ? 'Invalid access token. Get a new one at https://supabase.com/dashboard/account/tokens'
          : response.status === 404 
            ? 'Project not found. The project may be paused or deleted. Restore it at https://supabase.com/dashboard'
            : 'Unexpected error from Supabase Management API.',
      }, { status: response.status })
    }

    const result = await response.json()
    console.log('Migration executed successfully:', result)

    return Response.json({
      status: 'success',
      message: 'Migration executed successfully! Tables created: commission_rules, whatsapp_notifications, notifications. Storage buckets created: order-files, documents.',
      result,
    })
  } catch (error) {
    console.error('Migration execution error:', error)
    return Response.json({ 
      error: 'Failed to execute migration',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
