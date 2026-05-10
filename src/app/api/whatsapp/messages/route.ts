import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*, template:whatsapp_templates(name), customer:customers(full_name, whatsapp)')
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ messages: data })
  } catch (error) {
    console.error('Messages GET error:', error)
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
