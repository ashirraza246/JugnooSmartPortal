import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

function mapNotarisation(n: Record<string, unknown>) {
  const customer = n.customer as Record<string, unknown> | null
  return {
    id: n.id,
    customerId: n.customer_id,
    serviceType: n.service_type,
    description: n.description,
    documents: n.documents,
    feeAmount: n.fee_amount || 0,
    feePaid: n.fee_paid || false,
    status: n.status || 'pending',
    appointmentDate: n.appointment_date,
    completedAt: n.completed_at,
    createdAt: n.created_at,
    customer: customer ? { fullName: customer.full_name, whatsapp: customer.whatsapp } : null,
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''

    let query = supabase.from('notarisation_services').select('*, customer:customers(full_name, whatsapp)').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ services: (data || []).map(mapNotarisation) })
  } catch (error) {
    console.error('Notarisation GET error:', error)
    return Response.json({ error: 'Failed to fetch notarisations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { data, error } = await supabase.from('notarisation_services').insert([{
      customer_id: body.customerId || null,
      service_type: body.serviceType,
      description: body.description || null,
      documents: body.documents || null,
      fee_amount: body.feeAmount || 0,
      fee_paid: body.feePaid || false,
      status: body.status || 'pending',
      appointment_date: body.appointmentDate || null,
    }]).select()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ service: mapNotarisation(data[0]) })
  } catch (error) {
    console.error('Notarisation POST error:', error)
    return Response.json({ error: 'Failed to create notarisation' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { id, ...updates } = body

    const mapped: Record<string, unknown> = {}
    if (updates.status !== undefined) mapped.status = updates.status
    if (updates.description !== undefined) mapped.description = updates.description
    if (updates.feePaid !== undefined) mapped.fee_paid = updates.feePaid
    if (updates.appointmentDate !== undefined) mapped.appointment_date = updates.appointmentDate
    if (updates.status === 'completed') mapped.completed_at = new Date().toISOString()

    const { data, error } = await supabase.from('notarisation_services').update(mapped).eq('id', id).select()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ service: mapNotarisation(data[0]) })
  } catch (error) {
    console.error('Notarisation PUT error:', error)
    return Response.json({ error: 'Failed to update notarisation' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('notarisation_services').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Notarisation DELETE error:', error)
    return Response.json({ error: 'Failed to delete notarisation' }, { status: 500 })
  }
}
