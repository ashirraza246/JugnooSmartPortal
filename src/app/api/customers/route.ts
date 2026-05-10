import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

function mapCustomer(c: Record<string, unknown>) {
  return {
    id: c.id,
    fullName: c.full_name,
    whatsapp: c.whatsapp,
    cnic: c.cnic,
    email: c.email,
    address: c.address,
    tags: c.tags,
    notes: c.notes,
    isVip: c.is_vip || false,
    ordersCount: c.orders_count || 0,
    totalSpent: c.total_spent || 0,
    createdAt: c.created_at,
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags') || ''
    const vipOnly = searchParams.get('vip') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const from = (page - 1) * limit

    let query = supabase.from('customers').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, from + limit - 1)

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,whatsapp.ilike.%${search}%,cnic.ilike.%${search}%`)
    }
    if (tags) query = query.ilike('tags', `%${tags}%`)
    if (vipOnly) query = query.eq('is_vip', true)

    const { data, count, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 400 })

    return Response.json({ customers: (data || []).map(mapCustomer), total: count })
  } catch (error) {
    console.error('Customers GET error:', error)
    return Response.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { data, error } = await supabase.from('customers').insert([{
      full_name: body.fullName,
      whatsapp: body.whatsapp || null,
      cnic: body.cnic || null,
      email: body.email || null,
      address: body.address || null,
      tags: body.tags || null,
      notes: body.notes || null,
      is_vip: body.isVip || false,
    }]).select()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ customer: mapCustomer(data[0]) })
  } catch (error) {
    console.error('Customers POST error:', error)
    return Response.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { id, ...updates } = body

    const mapped: Record<string, unknown> = {}
    if (updates.fullName !== undefined) mapped.full_name = updates.fullName
    if (updates.whatsapp !== undefined) mapped.whatsapp = updates.whatsapp
    if (updates.cnic !== undefined) mapped.cnic = updates.cnic
    if (updates.email !== undefined) mapped.email = updates.email
    if (updates.address !== undefined) mapped.address = updates.address
    if (updates.tags !== undefined) mapped.tags = updates.tags
    if (updates.notes !== undefined) mapped.notes = updates.notes
    if (updates.isVip !== undefined) mapped.is_vip = updates.isVip

    const { data, error } = await supabase.from('customers').update(mapped).eq('id', id).select()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ customer: mapCustomer(data[0]) })
  } catch (error) {
    console.error('Customers PUT error:', error)
    return Response.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Customers DELETE error:', error)
    return Response.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
