import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { templateId, customerId, variables } = body

    // Get template
    const { data: template } = await supabase.from('whatsapp_templates').select('*').eq('id', templateId).single()
    if (!template) return Response.json({ error: 'Template not found' }, { status: 404 })

    // Get customer
    const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).single()
    if (!customer) return Response.json({ error: 'Customer not found' }, { status: 404 })

    // Replace variables
    let messageContent = template.content
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        messageContent = messageContent.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
      }
    }

    // Increment usage count
    await supabase.from('whatsapp_templates').update({ usage_count: template.usage_count + 1 }).eq('id', templateId)

    // Log message
    await supabase.from('whatsapp_messages').insert([{
      template_id: templateId,
      customer_id: customerId,
      message_content: messageContent,
      status: 'sent',
    }])

    // Generate WhatsApp link
    const phone = customer.whatsapp?.replace(/[^0-9]/g, '') || ''
    const encodedMessage = encodeURIComponent(messageContent)
    const waLink = phone ? `https://wa.me/${phone}?text=${encodedMessage}` : ''

    return Response.json({ messageContent, waLink, customerName: customer.full_name, phone })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
