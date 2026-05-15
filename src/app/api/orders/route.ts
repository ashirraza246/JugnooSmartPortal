import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'
import { triggerStatusWhatsAppNotification, triggerPaymentWhatsAppNotification } from '@/lib/whatsapp-auto-trigger'

function mapOrder(o: Record<string, unknown>) {
  const customer = o.customer as Record<string, unknown> | null
  return {
    id: o.id,
    orderNumber: o.order_number,
    orderType: o.order_type || 'other',
    status: o.status || 'pending',
    priority: o.priority || 'normal',
    totalAmount: o.total_amount || 0,
    paidAmount: o.paid_amount || 0,
    paymentStatus: o.payment_status || 'unpaid',
    description: o.description,
    specifications: o.specifications,
    customerId: o.customer_id,
    assignedToId: o.assigned_to_id,
    completedAt: o.completed_at,
    createdAt: o.created_at,
    customer: customer ? { fullName: customer.full_name, whatsapp: customer.whatsapp } : null,
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const orderType = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const from = (page - 1) * limit

    let query = supabase.from('orders').select('*, customer:customers(full_name, whatsapp)', { count: 'exact' }).order('created_at', { ascending: false }).range(from, from + limit - 1)

    if (status) query = query.eq('status', status)
    if (orderType) query = query.eq('order_type', orderType)

    const { data, count, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 400 })

    return Response.json({ orders: (data || []).map(mapOrder), total: count })
  } catch (error) {
    console.error('Orders GET error:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()

    // Generate order number
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    const datePrefix = new Date().toISOString().slice(0,10).replace(/-/g, '')
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const orderNumber = `JUG-${datePrefix}-${randomSuffix}`

    const { data, error } = await supabase.from('orders').insert([{
      order_number: orderNumber,
      customer_id: body.customerId || null,
      order_type: body.orderType,
      status: body.status || 'pending',
      priority: body.priority || 'normal',
      description: body.description || null,
      specifications: body.specifications || null,
      total_amount: body.totalAmount || 0,
      paid_amount: body.paidAmount || 0,
      payment_status: body.paymentStatus || 'unpaid',
      assigned_to_id: body.assignedToId || null,
    }]).select('*, customer:customers(full_name, whatsapp)')

    if (error) return Response.json({ error: error.message }, { status: 400 })

    const order = mapOrder(data[0])

    // Auto-trigger WhatsApp notification for new order
    if (order.customer?.whatsapp) {
      triggerStatusWhatsAppNotification({
        orderId: order.id as string,
        customerPhone: order.customer.whatsapp,
        customerName: order.customer.fullName || 'Customer',
        serviceName: (order.orderType as string || 'Service').replace(/_/g, ' '),
        orderNumber: order.orderNumber as string,
        newStatus: 'pending',
        amount: order.totalAmount as number,
      }).catch(err => console.error('WhatsApp auto-trigger failed:', err))
    }

    return Response.json({ order })
  } catch (error) {
    console.error('Orders POST error:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { id, ...updates } = body

    // Fetch the current order to check for status changes
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*, customer:customers(full_name, whatsapp)')
      .eq('id', id)
      .single()

    const previousStatus = (existingOrder as Record<string, unknown>)?.status as string | undefined
    const previousPaymentStatus = (existingOrder as Record<string, unknown>)?.payment_status as string | undefined

    const mapped: Record<string, unknown> = {}
    if (updates.status !== undefined) mapped.status = updates.status
    if (updates.priority !== undefined) mapped.priority = updates.priority
    if (updates.description !== undefined) mapped.description = updates.description
    if (updates.totalAmount !== undefined) mapped.total_amount = updates.totalAmount
    if (updates.paidAmount !== undefined) mapped.paid_amount = updates.paidAmount
    if (updates.paymentStatus !== undefined) mapped.payment_status = updates.paymentStatus
    if (updates.assignedToId !== undefined) mapped.assigned_to_id = updates.assignedToId
    if (updates.status === 'delivered') mapped.completed_at = new Date().toISOString()

    const { data, error } = await supabase.from('orders').update(mapped).eq('id', id).select('*, customer:customers(full_name, whatsapp)')
    if (error) return Response.json({ error: error.message }, { status: 400 })

    const order = mapOrder(data[0])
    let whatsappLink: string | null = null
    let whatsappMessage: string | null = null

    // Auto-trigger WhatsApp on status change
    if (updates.status && updates.status !== previousStatus) {
      const customer = existingOrder?.customer as Record<string, unknown> | null
      const customerPhone = customer?.whatsapp as string || ''
      const customerName = customer?.full_name as string || 'Customer'

      if (customerPhone) {
        const result = await triggerStatusWhatsAppNotification({
          orderId: id,
          customerPhone,
          customerName,
          serviceName: (order.orderType as string || 'Service').replace(/_/g, ' '),
          orderNumber: order.orderNumber as string,
          newStatus: updates.status,
          amount: order.totalAmount as number,
        })
        if (result) {
          whatsappLink = result.link
          whatsappMessage = result.message
        }
      }
    }

    // Auto-trigger WhatsApp on payment confirmation
    if (updates.paymentStatus === 'paid' && updates.paymentStatus !== previousPaymentStatus) {
      const customer = existingOrder?.customer as Record<string, unknown> | null
      const customerPhone = customer?.whatsapp as string || ''
      const customerName = customer?.full_name as string || 'Customer'

      if (customerPhone) {
        const result = await triggerPaymentWhatsAppNotification({
          customerPhone,
          customerName,
          orderNumber: order.orderNumber as string,
          serviceName: (order.orderType as string || 'Service').replace(/_/g, ' '),
          amount: order.totalAmount as number,
          paymentMethod: 'Cash',
        })
        whatsappLink = result.link
        whatsappMessage = result.message
      }
    }

    return Response.json({
      order,
      whatsappNotification: whatsappLink ? { link: whatsappLink, message: whatsappMessage } : null,
    })
  } catch (error) {
    console.error('Orders PUT error:', error)
    return Response.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Orders DELETE error:', error)
    return Response.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
