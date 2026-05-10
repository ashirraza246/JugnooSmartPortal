import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

function mapGovtService(s: Record<string, unknown>) {
  const customer = s.customer as Record<string, unknown> | null
  return {
    id: s.id,
    customerId: s.customer_id,
    serviceType: s.service_type,
    serviceName: s.service_name,
    applicationId: s.application_id,
    status: s.status || 'applied',
    documents: s.documents,
    feeAmount: s.fee_amount || 0,
    feePaid: s.fee_paid || false,
    notes: s.notes,
    appliedDate: s.applied_date,
    statusUpdatedAt: s.status_updated_at,
    createdAt: s.created_at,
    customer: customer ? { fullName: customer.full_name, whatsapp: customer.whatsapp } : null,
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const serviceType = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    let query = supabase.from('govt_services').select('*, customer:customers(full_name, whatsapp)').order('created_at', { ascending: false })
    if (serviceType) query = query.eq('service_type', serviceType)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ services: (data || []).map(mapGovtService) })
  } catch (error) {
    console.error('Govt services GET error:', error)
    return Response.json({ error: 'Failed to fetch govt services' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { data, error } = await supabase.from('govt_services').insert([{
      customer_id: body.customerId || null,
      service_type: body.serviceType,
      service_name: body.serviceName,
      application_id: body.applicationId || null,
      status: body.status || 'applied',
      documents: body.documents || null,
      fee_amount: body.feeAmount || 0,
      fee_paid: body.feePaid || false,
      notes: body.notes || null,
      applied_date: body.appliedDate || new Date().toISOString().split('T')[0],
    }]).select()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ service: mapGovtService(data[0]) })
  } catch (error) {
    console.error('Govt services POST error:', error)
    return Response.json({ error: 'Failed to create govt service' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { id, ...updates } = body

    const mapped: Record<string, unknown> = { status_updated_at: new Date().toISOString() }
    if (updates.status !== undefined) mapped.status = updates.status
    if (updates.notes !== undefined) mapped.notes = updates.notes
    if (updates.feePaid !== undefined) mapped.fee_paid = updates.feePaid
    if (updates.documents !== undefined) mapped.documents = updates.documents

    const { data, error } = await supabase.from('govt_services').update(mapped).eq('id', id).select()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ service: mapGovtService(data[0]) })
  } catch (error) {
    console.error('Govt services PUT error:', error)
    return Response.json({ error: 'Failed to update govt service' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('govt_services').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Govt services DELETE error:', error)
    return Response.json({ error: 'Failed to delete govt service' }, { status: 500 })
  }
}
