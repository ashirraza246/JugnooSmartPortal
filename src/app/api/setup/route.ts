import { supabase, isSupabaseConfigured, checkTablesExist } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ configured: false, tablesExist: false, needsSetup: true })
    }

    const tablesExist = await checkTablesExist()
    return Response.json({ configured: true, tablesExist, needsSetup: !tablesExist })
  } catch (error) {
    console.error('Setup check error:', error)
    return Response.json({ configured: false, tablesExist: false, needsSetup: true })
  }
}

// POST - Initialize database including user_credentials table
export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check if user_credentials table exists by trying to select from it
    const { error: checkError } = await supabase
      .from('user_credentials')
      .select('id')
      .limit(1)

    if (checkError && checkError.code === 'PGRST205') {
      // Table doesn't exist - we need to create it via SQL
      // Since we can't run DDL via REST API, return instructions
      return Response.json({
        needsTable: true,
        message: 'user_credentials table nahi mili. Supabase SQL Editor mein yeh SQL run karein:',
        sql: `CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on user_credentials" ON user_credentials FOR ALL USING (true) WITH CHECK (true);

-- Admin password set karein
INSERT INTO user_credentials (user_id, password_hash)
SELECT id, 'jugnoo123' FROM users WHERE email = 'admin@jugnoo.pk'
ON CONFLICT DO NOTHING;`
      })
    }

    // Table exists, seed admin credentials if not already there
    const { data: adminCreds } = await supabase
      .from('user_credentials')
      .select('id')
      .eq('user_id', (await supabase.from('users').select('id').eq('email', 'admin@jugnoo.pk').single()).data?.id)
      .limit(1)

    if (!adminCreds || adminCreds.length === 0) {
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@jugnoo.pk')
        .single()

      if (adminUser) {
        await supabase.from('user_credentials').insert([{
          user_id: adminUser.id,
          password_hash: 'jugnoo123',
        }])
      }
    }

    return Response.json({
      needsTable: false,
      message: 'Database setup complete',
      tablesReady: true
    })
  } catch (error) {
    console.error('Setup POST error:', error)
    return Response.json({ error: 'Setup failed' }, { status: 500 })
  }
}
