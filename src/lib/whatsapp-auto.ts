// WhatsApp Auto Message Triggers
// Generates wa.me links with pre-filled messages for various events

interface WhatsAppMessageConfig {
  phone: string
  message: string
}

interface OrderData {
  orderNumber?: string
  serviceName?: string
  customerName?: string
  status?: string
  amount?: number
  transactionId?: string
  paymentMethod?: string
}

// Format phone number for WhatsApp (Pakistan format)
function formatWhatsAppPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '')
  if (clean.startsWith('0')) return '92' + clean.substring(1)
  if (clean.startsWith('92')) return clean
  return clean
}

// Generate wa.me link
export function generateWhatsAppLink(phone: string, message: string): string {
  const formatted = formatWhatsAppPhone(phone)
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`
}

// Order Created → Send confirmation to customer
export function orderCreatedMessage(data: OrderData): WhatsAppMessageConfig {
  const message = `✅ *JUGNOO PHOTOSTATE - Order Confirmed*
━━━━━━━━━━━━━━━━━━━━━
📋 Order: #${data.orderNumber || 'N/A'}
🔧 Service: ${data.serviceName || 'N/A'}
📅 Date: ${new Date().toLocaleDateString()}
💰 Amount: Rs. ${data.amount?.toLocaleString() || 'N/A'}

Assalam o Alaikum ${data.customerName || ''}! Aap ka order receive ho gaya hai. Hum jald hi process karenge.

━━━━━━━━━━━━━━━━━━━━━
📸 _Jugnoo Photostate_
📍 _Chowk Azam, Layyah_
🤖 _AI-Powered Business Management_`

  return {
    phone: '',
    message,
  }
}

// Status Changed → Send status update
export function statusChangedMessage(data: OrderData, newStatus: string): WhatsAppMessageConfig {
  const statusEmojis: Record<string, string> = {
    pending: '⏳',
    in_progress: '🔄',
    ready: '✅',
    completed: '🎉',
    delivered: '📦',
    rejected: '❌',
    submitted: '📝',
    approved: '✅',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pending / زیر التوا',
    in_progress: 'In Progress / جاری',
    ready: 'Ready / تیار',
    completed: 'Completed / مکمل',
    delivered: 'Delivered / فراہم شدہ',
    rejected: 'Rejected / مسترد',
    submitted: 'Submitted / جمع شدہ',
    approved: 'Approved / منظور شدہ',
  }

  const emoji = statusEmojis[newStatus] || '📋'
  const label = statusLabels[newStatus] || newStatus

  const message = `${emoji} *Status Update - Jugnoo Photostate*
━━━━━━━━━━━━━━━━━━━━━
📋 Order: #${data.orderNumber || 'N/A'}
🔧 Service: ${data.serviceName || 'N/A'}
📊 Status: *${label}*

${newStatus === 'completed' ? '🎉 Mubarak! Aap ka order mukammal ho gaya hai! / Your order is complete!' : ''}
${newStatus === 'ready' ? '✅ Aap ka order tayar hai! / Your order is ready for pickup!' : ''}
${newStatus === 'in_progress' ? '🔄 Aap ka order par kaam ho raha hai. / Your order is being processed.' : ''}

━━━━━━━━━━━━━━━━━━━━━
📸 _Jugnoo Photostate_
📍 _Chowk Azam, Layyah_`

  return {
    phone: '',
    message,
  }
}

// Payment Confirmed → Send payment receipt
export function paymentConfirmedMessage(data: OrderData): WhatsAppMessageConfig {
  const message = `💰 *Payment Confirmed - Jugnoo Photostate*
━━━━━━━━━━━━━━━━━━━━━
📋 Order: #${data.orderNumber || 'N/A'}
🔧 Service: ${data.serviceName || 'N/A'}
💵 Amount: Rs. ${data.amount?.toLocaleString() || 'N/A'}
${data.paymentMethod ? `💳 Method: ${data.paymentMethod}` : ''}
${data.transactionId ? `🔑 Trx ID: ${data.transactionId}` : ''}

✅ Payment confirm ho gayi hai! / Payment confirmed!

━━━━━━━━━━━━━━━━━━━━━
📸 _Jugnoo Photostate_
📍 _Chowk Azam, Layyah_
🤖 _AI-Powered Business Management_`

  return {
    phone: '',
    message,
  }
}

// Document Ready → Send pickup notification
export function documentReadyMessage(data: OrderData): WhatsAppMessageConfig {
  const message = `📄 *Document Ready for Pickup!*
━━━━━━━━━━━━━━━━━━━━━
📋 Order: #${data.orderNumber || 'N/A'}
🔧 Service: ${data.serviceName || 'N/A'}

Assalam o Alaikum ${data.customerName || ''}! Aap ka document tayar hai! / Your document is ready!

📍 Pickup from: *Jugnoo Photostate, Chowk Azam, Layyah*
🕐 Working Hours: 9 AM - 9 PM

━━━━━━━━━━━━━━━━━━━━━
📸 _Jugnoo Photostate_
📍 _Chowk Azam, Layyah_
🤖 _AI-Powered Business Management_`

  return {
    phone: '',
    message,
  }
}

// Get all auto-trigger types
export const autoTriggers = {
  orderCreated: orderCreatedMessage,
  statusChanged: statusChangedMessage,
  paymentConfirmed: paymentConfirmedMessage,
  documentReady: documentReadyMessage,
} as const

export type AutoTriggerType = keyof typeof autoTriggers
