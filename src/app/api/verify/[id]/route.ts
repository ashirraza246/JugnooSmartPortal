import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { id: hash } = await params

    if (!hash) {
      return Response.json({ error: 'Verification hash required' }, { status: 400 })
    }

    // Try service_applications first
    const { data: application, error: appError } = await supabase
      .from('service_applications')
      .select('id, service_name, service_type, status, applicant_name, created_at, updated_at, verification_hash, fee_amount')
      .eq('verification_hash', hash)
      .single()

    if (application && !appError) {
      return Response.json({
        verified: true,
        type: 'service_application',
        document: {
          id: application.id,
          serviceName: application.service_name,
          serviceType: application.service_type,
          status: application.status,
          applicantName: application.applicant_name,
          issuedAt: application.updated_at || application.created_at,
          feeAmount: application.fee_amount,
          issuedBy: 'Jugnoo Photostate',
          location: 'Chowk Azam, Layyah, Punjab',
        },
      })
    }

    // Try orders
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, order_type, status, total_amount, created_at, updated_at, verification_hash, customer:customers(full_name)')
      .eq('verification_hash', hash)
      .single()

    if (order && !orderError) {
      return Response.json({
        verified: true,
        type: 'order',
        document: {
          id: order.id,
          orderNumber: order.order_number,
          orderType: order.order_type,
          status: order.status,
          customerName: (order.customer as Record<string, string>)?.full_name || 'Unknown',
          issuedAt: order.updated_at || order.created_at,
          totalAmount: order.total_amount,
          issuedBy: 'Jugnoo Photostate',
          location: 'Chowk Azam, Layyah, Punjab',
        },
      })
    }

    // No matching record found
    return Response.json({
      verified: false,
      error: 'Document not found or invalid verification hash',
    }, { status: 404 })
  } catch (error) {
    console.error('Verification error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}
