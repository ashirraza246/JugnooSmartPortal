import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

function mapPayment(p: Record<string, unknown>) {
  const customer = p.customer as Record<string, unknown> | null
  const order = p.order as Record<string, unknown> | null
  return {
    id: p.id,
    orderId: p.order_id,
    customerId: p.customer_id,
    amount: p.amount || 0,
    paymentMethod: p.payment_method || 'cash',
    receiptNumber: p.receipt_number,
    notes: p.notes,
    createdAt: p.created_at,
    customer: customer ? { fullName: customer.full_name } : null,
    order: order ? { orderNumber: order.order_number } : null,
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const customerId = searchParams.get('customerId')
    const from = (page - 1) * limit

    let query = supabase.from('payments').select('*, customer:customers(full_name), order:orders(order_number)', { count: 'exact' }).order('created_at', { ascending: false }).range(from, from + limit - 1)

    // Filter by customer ID if provided
    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    if (period === 'today') {
      const today = new Date(); today.setHours(0,0,0,0)
      query = query.gte('created_at', today.toISOString())
    } else if (period === 'week') {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('created_at', weekAgo.toISOString())
    } else if (period === 'month') {
      const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte('created_at', monthAgo.toISOString())
    }

    const { data, count, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 400 })

    // Revenue summary (only for admin, not filtered by customer)
    const today = new Date(); today.setHours(0,0,0,0)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1)

    const summaryQueries = customerId
      ? [
          supabase.from('payments').select('amount').eq('customer_id', customerId).gte('created_at', today.toISOString()),
          supabase.from('payments').select('amount').eq('customer_id', customerId).gte('created_at', weekAgo.toISOString()),
          supabase.from('payments').select('amount').eq('customer_id', customerId).gte('created_at', monthAgo.toISOString()),
          supabase.from('payments').select('amount').eq('customer_id', customerId),
        ]
      : [
          supabase.from('payments').select('amount').gte('created_at', today.toISOString()),
          supabase.from('payments').select('amount').gte('created_at', weekAgo.toISOString()),
          supabase.from('payments').select('amount').gte('created_at', monthAgo.toISOString()),
          supabase.from('payments').select('amount'),
        ]

    const [todayRes, weekRes, monthRes, totalRes] = await Promise.all(summaryQueries)

    const sumPayments = (data: { amount: number }[] | null) => data?.reduce((s, p) => s + (p.amount || 0), 0) || 0

    return Response.json({
      payments: (data || []).map(mapPayment),
      total: count,
      revenue: {
        today: sumPayments(todayRes.data),
        thisWeek: sumPayments(weekRes.data),
        thisMonth: sumPayments(monthRes.data),
        total: sumPayments(totalRes.data),
      }
    })
  } catch (error) {
    console.error('Payments GET error:', error)
    return Response.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const receiptNumber = `RCT-${Date.now()}`

    const { data, error } = await supabase.from('payments').insert([{
      order_id: body.orderId || null,
      customer_id: body.customerId || null,
      amount: body.amount,
      payment_method: body.paymentMethod || 'cash',
      receipt_number: receiptNumber,
      notes: body.notes || null,
    }]).select()

    if (error) return Response.json({ error: error.message }, { status: 400 })

    // Update order payment status
    if (body.orderId) {
      const { data: order } = await supabase.from('orders').select('total_amount, paid_amount').eq('id', body.orderId).single()
      if (order) {
        const newPaid = (order.paid_amount || 0) + body.amount
        await supabase.from('orders').update({
          paid_amount: newPaid,
          payment_status: newPaid >= order.total_amount ? 'paid' : 'partial',
        }).eq('id', body.orderId)
      }
    }

    return Response.json({ payment: mapPayment(data[0]) })
  } catch (error) {
    console.error('Payments POST error:', error)
    return Response.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('payments').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Payments DELETE error:', error)
    return Response.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}
