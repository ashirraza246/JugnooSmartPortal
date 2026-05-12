#!/usr/bin/env npx tsx
/**
 * Supabase Migration Runner
 * 
 * Usage:
 *   npx tsx scripts/run-migrations.ts [OPTIONS]
 * 
 * Options:
 *   --token=<ACCESS_TOKEN>   Supabase personal access token (for Management API)
 *   --service-key=<KEY>      Supabase service role key (for REST API)
 *   --db-url=<URL>           Direct PostgreSQL connection string
 * 
 * Environment variables (loaded from .env automatically):
 *   NEXT_PUBLIC_SUPABASE_URL        Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   Supabase anon key
 *   SUPABASE_SERVICE_ROLE_KEY       Service role key for DDL operations
 *   SUPABASE_ACCESS_TOKEN           Personal access token for Management API
 *   SUPABASE_DB_URL                 Direct PostgreSQL connection string
 * 
 * If no credentials are provided, prints the SQL for manual execution.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env file
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // .env file not found, skip
  }
}

loadEnv()

// Parse CLI args
const args = process.argv.slice(2)
function getArg(name: string): string {
  const arg = args.find(a => a.startsWith(`--${name}=`))
  return arg ? arg.slice(name.length + 3) : ''
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = getArg('service-key') || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const SUPABASE_ACCESS_TOKEN = getArg('token') || process.env.SUPABASE_ACCESS_TOKEN || ''
const SUPABASE_DB_URL = getArg('db-url') || process.env.SUPABASE_DB_URL || ''

const MIGRATION_SQL = `
-- ============================================
-- Migration: commission_rules table
-- ============================================
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

-- ============================================
-- Migration: whatsapp_notifications table
-- ============================================
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
`

async function checkTablesExist(): Promise<{ commission_rules: boolean; whatsapp_notifications: boolean }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { commission_rules: false, whatsapp_notifications: false }
  }

  const result = { commission_rules: false, whatsapp_notifications: false }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { error: crError } = await client.from('commission_rules').select('id').limit(1)
    result.commission_rules = !crError

    const { error: wnError } = await client.from('whatsapp_notifications').select('id').limit(1)
    result.whatsapp_notifications = !wnError
  } catch {
    // Cannot connect
  }

  return result
}

async function runWithServiceRoleKey(): Promise<boolean> {
  if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) return false

  console.log('🔑 Attempting migration via Supabase REST API with service role key...')

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    })

    if (response.ok) {
      console.log('✅ Migration executed successfully via RPC!')
      return true
    }
    
    const text = await response.text()
    console.log(`⚠️  RPC approach failed: ${response.status} ${text}`)
  } catch (err) {
    console.log(`⚠️  Could not reach Supabase: ${err}`)
  }

  return false
}

async function runWithManagementApi(): Promise<boolean> {
  if (!SUPABASE_ACCESS_TOKEN || !SUPABASE_URL) return false

  console.log('🔑 Attempting migration via Supabase Management API...')
  
  const ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    })

    if (response.ok) {
      console.log('✅ Migration executed successfully via Management API!')
      return true
    }
    
    const text = await response.text()
    console.log(`⚠️  Management API failed: ${response.status} ${text}`)
  } catch (err) {
    console.log(`⚠️  Could not reach Management API: ${err}`)
  }

  return false
}

async function runWithDirectConnection(): Promise<boolean> {
  if (!SUPABASE_DB_URL) return false

  console.log('🔑 Attempting migration via direct PostgreSQL connection...')
  console.log(`   psql "${SUPABASE_DB_URL.replace(/:[^:@]+@/, ':****@')}" -c "CREATE TABLE..."`)

  try {
    const { execSync } = await import('child_process')
    
    // Split the migration SQL into individual statements and execute them
    const statements = MIGRATION_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const stmt of statements) {
      const fullStmt = stmt + ';'
      console.log(`   Executing: ${fullStmt.substring(0, 60)}...`)
      execSync(`psql "${SUPABASE_DB_URL}" -c "${fullStmt.replace(/"/g, '\\"')}"`, {
        stdio: 'pipe',
        timeout: 30000,
      })
    }

    console.log('✅ Migration executed successfully via direct connection!')
    return true
  } catch (err) {
    console.log(`⚠️  Direct connection failed: ${err}`)
  }

  return false
}

async function main() {
  console.log('🚀 Jugnoo Smart Portal — Supabase Migration Runner\n')
  console.log(`   Project URL: ${SUPABASE_URL || '(not set)'}`)
  console.log(`   Access Token: ${SUPABASE_ACCESS_TOKEN ? '***provided***' : '(not set)'}`)
  console.log(`   Service Key:  ${SUPABASE_SERVICE_KEY ? '***provided***' : '(not set)'}`)
  console.log(`   DB URL:       ${SUPABASE_DB_URL ? '***provided***' : '(not set)'}\n`)

  // First, check if tables already exist
  console.log('🔍 Checking if tables already exist...')
  const tableStatus = await checkTablesExist()
  
  if (tableStatus.commission_rules && tableStatus.whatsapp_notifications) {
    console.log('✅ Both tables already exist! No migration needed.')
    return
  }

  if (tableStatus.commission_rules) {
    console.log('✅ commission_rules table already exists')
  } else {
    console.log('⚠️  commission_rules table needs to be created')
  }

  if (tableStatus.whatsapp_notifications) {
    console.log('✅ whatsapp_notifications table already exists')
  } else {
    console.log('⚠️  whatsapp_notifications table needs to be created')
  }

  console.log('')

  // Try each approach in order
  if (await runWithServiceRoleKey()) return
  if (await runWithManagementApi()) return
  if (await runWithDirectConnection()) return

  // Nothing worked — print instructions
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 MANUAL MIGRATION REQUIRED')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('None of the automated approaches worked. This is likely because:')
  console.log('  1. The Supabase project is paused (free tier auto-pauses after 7 days)')
  console.log('  2. No service role key or access token is configured')
  console.log('  3. Network/DNS restrictions prevent access from this environment\n')
  console.log('Options to run the migration:\n')
  console.log('  Option A: Run the SQL manually in Supabase SQL Editor')
  console.log('    1. Go to https://supabase.com/dashboard')
  console.log('    2. If the project is paused, click "Restore project"')
  console.log('    3. Navigate to SQL Editor')
  console.log('    4. Copy and paste the SQL below\n')
  console.log('  Option B: Run this script with an access token')
  console.log('    npx tsx scripts/run-migrations.ts --token=your_access_token')
  console.log('    Get your token at: https://supabase.com/dashboard/account/tokens\n')
  console.log('  Option C: Run this script with a service role key')
  console.log('    SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/run-migrations.ts\n')
  console.log('  Option D: Use the app\'s migration endpoint')
  console.log('    POST http://localhost:3000/api/migrate/execute')
  console.log('    Body: { "accessToken": "your_access_token" }\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('SQL TO RUN:\n')
  console.log(MIGRATION_SQL)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(console.error)
