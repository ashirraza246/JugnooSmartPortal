import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

function mapPricingRule(r: Record<string, unknown>) {
  return {
    id: r.id,
    serviceType: r.service_type,
    serviceName: r.service_name,
    unit: r.unit,
    price: r.price,
    isActive: r.is_active !== false,
    createdAt: r.created_at,
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { data, error } = await supabase.from('pricing_rules').select('*').order('service_type', { ascending: true })
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ rules: (data || []).map(mapPricingRule) })
  } catch (error) {
    console.error('Pricing GET error:', error)
    return Response.json({ error: 'Failed to fetch pricing rules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { data, error } = await supabase.from('pricing_rules').insert([{
      service_type: body.serviceType,
      service_name: body.serviceName,
      unit: body.unit,
      price: body.price,
      is_active: body.isActive !== false,
    }]).select()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ rule: mapPricingRule(data[0]) })
  } catch (error) {
    console.error('Pricing POST error:', error)
    return Response.json({ error: 'Failed to create pricing rule' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { id, ...updates } = body

    const mapped: Record<string, unknown> = {}
    if (updates.serviceType !== undefined) mapped.service_type = updates.serviceType
    if (updates.serviceName !== undefined) mapped.service_name = updates.serviceName
    if (updates.unit !== undefined) mapped.unit = updates.unit
    if (updates.price !== undefined) mapped.price = updates.price
    if (updates.isActive !== undefined) mapped.is_active = updates.isActive

    const { data, error } = await supabase.from('pricing_rules').update(mapped).eq('id', id).select()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ rule: mapPricingRule(data[0]) })
  } catch (error) {
    console.error('Pricing PUT error:', error)
    return Response.json({ error: 'Failed to update pricing rule' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('pricing_rules').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Pricing DELETE error:', error)
    return Response.json({ error: 'Failed to delete pricing rule' }, { status: 500 })
  }
}
