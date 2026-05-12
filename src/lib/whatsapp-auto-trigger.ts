// WhatsApp Auto-Trigger Integration
// Automatically prepares WhatsApp messages when order/application status changes
// Stores pending notifications in Supabase for the admin to send via wa.me links

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  generateWhatsAppLink,
  statusChangedMessage,
  paymentConfirmedMessage,
  documentReadyMessage,
  orderCreatedMessage,
} from '@/lib/whatsapp-auto'

// ─── Types ───────────────────────────────────────────────────────────

interface StatusChangeParams {
  orderId?: string
  applicationId?: string
  customerPhone: string
  customerName: string
  serviceName: string
  orderNumber?: string
  newStatus: string
  amount?: number
}

interface PaymentNotificationParams {
  customerPhone: string
  customerName: string
  orderNumber?: string
  serviceName: string
  amount: number
  paymentMethod: string
  transactionId?: string
}

interface WhatsAppNotification {
  id: string
  type: 'whatsapp_pending'
  subtype: 'status_change' | 'payment_confirmed' | 'document_ready' | 'order_created'
  customer_phone: string
  customer_name: string
  message: string
  wa_link: string
  order_id?: string
  application_id?: string
  is_sent: boolean
  created_at: string
}

// ─── Core Trigger Functions ─────────────────────────────────────────

/**
 * Called when an order/application status changes.
 * Generates WhatsApp message, creates wa.me link, stores in DB.
 */
export async function triggerStatusWhatsAppNotification(
  params: StatusChangeParams
): Promise<{ link: string; message: string } | null> {
  try {
    if (!isSupabaseConfigured()) return null
    if (!params.customerPhone) return null

    // Generate the WhatsApp message
    const msgConfig = statusChangedMessage(
      {
        orderNumber: params.orderNumber,
        serviceName: params.serviceName,
        customerName: params.customerName,
        amount: params.amount,
      },
      params.newStatus
    )

    // Generate the wa.me link
    const link = generateWhatsAppLink(params.customerPhone, msgConfig.message)

    // If the status is "ready" or "completed", also prepare a document-ready message
    if (params.newStatus === 'ready' || params.newStatus === 'completed') {
      const docMsg = documentReadyMessage({
        orderNumber: params.orderNumber,
        serviceName: params.serviceName,
        customerName: params.customerName,
      })
      const docLink = generateWhatsAppLink(params.customerPhone, docMsg.message)

      // Store the document-ready notification
      await storeNotification({
        subtype: 'document_ready',
        customerPhone: params.customerPhone,
        customerName: params.customerName,
        message: docMsg.message,
        waLink: docLink,
        orderId: params.orderId,
        applicationId: params.applicationId,
      })
    }

    // Store the status change notification
    await storeNotification({
      subtype: 'status_change',
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      message: msgConfig.message,
      waLink: link,
      orderId: params.orderId,
      applicationId: params.applicationId,
    })

    return { link, message: msgConfig.message }
  } catch (error) {
    console.error('WhatsApp auto-trigger error (status):', error)
    return null
  }
}

/**
 * Called when payment is confirmed.
 * Generates WhatsApp payment receipt, creates wa.me link, stores in DB.
 */
export async function triggerPaymentWhatsAppNotification(
  params: PaymentNotificationParams
): Promise<{ link: string; message: string }> {
  try {
    if (!isSupabaseConfigured() || !params.customerPhone) {
      // Return a basic link even without Supabase
      const msgConfig = paymentConfirmedMessage({
        orderNumber: params.orderNumber,
        serviceName: params.serviceName,
        customerName: params.customerName,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        transactionId: params.transactionId,
      })
      const link = generateWhatsAppLink(params.customerPhone, msgConfig.message)
      return { link, message: msgConfig.message }
    }

    const msgConfig = paymentConfirmedMessage({
      orderNumber: params.orderNumber,
      serviceName: params.serviceName,
      customerName: params.customerName,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      transactionId: params.transactionId,
    })

    const link = generateWhatsAppLink(params.customerPhone, msgConfig.message)

    // Store the payment notification
    await storeNotification({
      subtype: 'payment_confirmed',
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      message: msgConfig.message,
      waLink: link,
    })

    return { link, message: msgConfig.message }
  } catch (error) {
    console.error('WhatsApp auto-trigger error (payment):', error)
    const msgConfig = paymentConfirmedMessage({
      orderNumber: params.orderNumber,
      serviceName: params.serviceName,
      customerName: params.customerName,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      transactionId: params.transactionId,
    })
    const link = generateWhatsAppLink(params.customerPhone, msgConfig.message)
    return { link, message: msgConfig.message }
  }
}

/**
 * Called when a new order is created.
 */
export async function triggerOrderCreatedWhatsAppNotification(
  params: StatusChangeParams
): Promise<{ link: string; message: string } | null> {
  try {
    if (!isSupabaseConfigured() || !params.customerPhone) return null

    const msgConfig = orderCreatedMessage({
      orderNumber: params.orderNumber,
      serviceName: params.serviceName,
      customerName: params.customerName,
      amount: params.amount,
    })

    const link = generateWhatsAppLink(params.customerPhone, msgConfig.message)

    await storeNotification({
      subtype: 'order_created',
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      message: msgConfig.message,
      waLink: link,
      orderId: params.orderId,
    })

    return { link, message: msgConfig.message }
  } catch (error) {
    console.error('WhatsApp auto-trigger error (order created):', error)
    return null
  }
}

// ─── Fetch Pending Notifications ────────────────────────────────────

/**
 * Get pending WhatsApp notifications that haven't been sent yet.
 */
export async function getPendingWhatsAppNotifications(): Promise<WhatsAppNotification[]> {
  try {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
      .from('whatsapp_notifications')
      .select('*')
      .eq('is_sent', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      // Table might not exist yet - return empty
      console.warn('WhatsApp notifications table not available:', error.message)
      return []
    }

    return (data || []).map(mapNotification)
  } catch (error) {
    console.error('Failed to fetch pending WhatsApp notifications:', error)
    return []
  }
}

/**
 * Mark a WhatsApp notification as sent.
 */
export async function markWhatsAppNotificationSent(id: string): Promise<void> {
  try {
    if (!isSupabaseConfigured()) return

    await supabase
      .from('whatsapp_notifications')
      .update({ is_sent: true, sent_at: new Date().toISOString() })
      .eq('id', id)
  } catch (error) {
    console.error('Failed to mark notification as sent:', error)
  }
}

// ─── Internal Helpers ───────────────────────────────────────────────

interface StoreNotificationParams {
  subtype: 'status_change' | 'payment_confirmed' | 'document_ready' | 'order_created'
  customerPhone: string
  customerName: string
  message: string
  waLink: string
  orderId?: string
  applicationId?: string
}

async function storeNotification(params: StoreNotificationParams): Promise<void> {
  try {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase.from('whatsapp_notifications').insert([
      {
        type: 'whatsapp_pending',
        subtype: params.subtype,
        customer_phone: params.customerPhone,
        customer_name: params.customerName,
        message: params.message,
        wa_link: params.waLink,
        order_id: params.orderId || null,
        application_id: params.applicationId || null,
        is_sent: false,
      },
    ])

    if (error) {
      // Table might not exist yet - log but don't throw
      console.warn('Could not store WhatsApp notification:', error.message)
    }
  } catch (error) {
    console.error('Error storing WhatsApp notification:', error)
  }
}

function mapNotification(n: Record<string, unknown>): WhatsAppNotification {
  return {
    id: n.id as string,
    type: (n.type as string) as 'whatsapp_pending',
    subtype: (n.subtype as string) as WhatsAppNotification['subtype'],
    customer_phone: n.customer_phone as string,
    customer_name: n.customer_name as string,
    message: n.message as string,
    wa_link: n.wa_link as string,
    order_id: n.order_id as string | undefined,
    application_id: n.application_id as string | undefined,
    is_sent: n.is_sent as boolean,
    created_at: n.created_at as string,
  }
}
