import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { triggerStatusWhatsAppNotification, triggerPaymentWhatsAppNotification, triggerOrderCreatedWhatsAppNotification } from '@/lib/whatsapp-auto-trigger'

export async function GET(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')

    let query = supabase.from('service_applications').select('*').order('created_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)
    if (status) query = query.eq('status', status)
    if (serviceType) query = query.eq('service_type', serviceType)

    const { data, error } = await query

    if (error) {
      // Table might not exist yet
      return Response.json([])
    }

    return Response.json(data || [])
  } catch (error) {
    console.error('Service applications GET error:', error)
    return Response.json([])
  }
}

/**
 * Auto-create a customer in the 'customers' table if they don't exist yet.
 * This ensures new orders show up in the admin's Customers tab.
 */
async function autoCreateCustomer(params: {
  name: string | null
  phone: string | null
  whatsapp: string | null
  cnic: string | null
  email?: string | null
}) {
  try {
    if (!isSupabaseConfigured()) return

    const phone = params.phone || params.whatsapp
    if (!phone && !params.cnic) return // Need at least phone or CNIC to match

    // Check if customer already exists by phone or CNIC
    let existingQuery = supabase.from('customers').select('id').limit(1)

    if (phone) {
      existingQuery = existingQuery.eq('whatsapp', phone)
    } else if (params.cnic) {
      existingQuery = existingQuery.eq('cnic', params.cnic)
    }

    const { data: existing } = await existingQuery

    if (existing && existing.length > 0) {
      // Customer already exists - update their order count
      if (existing[0]?.id) {
        await supabase.rpc('increment_orders_count', { customer_id: existing[0].id }).catch(() => {
          // RPC might not exist, just ignore
        })
      }
      return
    }

    // Create new customer
    const { error: createError } = await supabase.from('customers').insert([{
      full_name: params.name || 'Customer',
      whatsapp: params.whatsapp || params.phone || null,
      cnic: params.cnic || null,
      email: params.email || null,
      tags: 'auto-created',
      notes: 'Automatically created from service application',
      is_vip: false,
      orders_count: 1,
      total_spent: 0,
    }])

    if (createError) {
      console.warn('Could not auto-create customer:', createError.message)
    } else {
      console.info('Auto-created customer for:', params.name || params.phone)
    }
  } catch (err) {
    console.warn('Auto-create customer error:', err)
  }
}

/**
 * Create an admin notification for a new order/application
 */
async function createNewOrderNotification(appId: string, serviceName: string, customerName: string) {
  try {
    if (!isSupabaseConfigured()) return

    // Insert into notifications table in Supabase
    await supabase.from('notifications').insert([{
      type: 'new_order',
      title: 'New Order Received',
      message: `${customerName} placed an order for ${serviceName}`,
      is_read: false,
      category: 'status',
    }]).then(({ error }) => {
      if (error) {
        console.warn('Could not create notification (Supabase):', error.message)
      }
    })
  } catch (err) {
    console.warn('Create notification error:', err)
  }
}

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { userId, serviceType, serviceName, applicantName, applicantCnic, applicantPhone, applicantWhatsapp, description, feeAmount, paymentMethod, transactionId, personalInfo, uploadedDocuments } = body

    if (!serviceName || !serviceType) {
      return Response.json({ error: 'Service name aur type chahiye' }, { status: 400 })
    }

    // Try to insert into service_applications table
    const { data, error } = await supabase.from('service_applications').insert([{
      user_id: userId || null,
      service_type: serviceType,
      service_name: serviceName,
      applicant_name: applicantName || 'Customer',
      applicant_cnic: applicantCnic || null,
      applicant_phone: applicantPhone || null,
      applicant_whatsapp: applicantWhatsapp || null,
      description: description || null,
      fee_amount: feeAmount || 0,
      payment_status: 'unpaid',
      payment_method: paymentMethod || null,
      transaction_id: transactionId || null,
      personal_info: personalInfo || null,
      uploaded_documents: uploadedDocuments || null,
      status: 'submitted',
    }]).select().single()

    if (error) {
      // If service_applications table doesn't exist, try using govt_services as fallback
      if (error.code === '42P01') {
        const { data: fallbackData, error: fallbackError } = await supabase.from('govt_services').insert([{
          customer_id: null,
          service_type: serviceType,
          service_name: serviceName,
          status: 'applied',
          fee_amount: feeAmount || 0,
          fee_paid: false,
          notes: `Applicant: ${applicantName}, CNIC: ${applicantCnic}, Phone: ${applicantPhone}, WhatsApp: ${applicantWhatsapp}, Details: ${description}`,
        }]).select().single()

        if (fallbackError) {
          return Response.json({ error: fallbackError.message }, { status: 400 })
        }

        return Response.json({ id: fallbackData.id, message: 'Application submit ho gayi hai!' })
      }
      return Response.json({ error: error.message }, { status: 400 })
    }

    // Auto-create customer in customers table (for admin panel Customers tab)
    await autoCreateCustomer({
      name: applicantName,
      phone: applicantPhone,
      whatsapp: applicantWhatsapp,
      cnic: applicantCnic,
    })

    // Create notification for admin about new order
    await createNewOrderNotification(data.id, serviceName, applicantName || 'Customer')

    // Auto-trigger WhatsApp notification for new application
    const phone = applicantWhatsapp || applicantPhone || ''
    if (phone) {
      triggerStatusWhatsAppNotification({
        applicationId: data.id,
        customerPhone: phone,
        customerName: applicantName || 'Customer',
        serviceName,
        newStatus: 'submitted',
        amount: feeAmount,
      }).catch(err => console.error('WhatsApp auto-trigger failed:', err))
    }

    return Response.json({ id: data.id, message: 'Application submit ho gayi hai!' })
  } catch (error) {
    console.error('Service applications POST error:', error)
    return Response.json({ error: 'Application submit nahi ho saki.' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { id, status, paymentStatus, notes, applicantName, applicantCnic, applicantPhone, description, resultDocumentUrl } = body

    if (!id) {
      return Response.json({ error: 'Application ID chahiye' }, { status: 400 })
    }

    // Fetch the current application to detect status changes
    const { data: existingApp } = await supabase
      .from('service_applications')
      .select('status, payment_status, applicant_name, applicant_phone, applicant_whatsapp, service_name, fee_amount, result_document_url')
      .eq('id', id)
      .single()

    const previousStatus = (existingApp as Record<string, unknown>)?.status as string | undefined
    const previousPaymentStatus = (existingApp as Record<string, unknown>)?.payment_status as string | undefined
    const currentDocUrl = (existingApp as Record<string, unknown>)?.result_document_url as string | undefined

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (paymentStatus) updates.payment_status = paymentStatus
    if (notes) updates.notes = notes
    if (resultDocumentUrl !== undefined) updates.result_document_url = resultDocumentUrl

    // If this is a customer edit (has applicant fields), check if the application is paid
    if (applicantName !== undefined || applicantCnic !== undefined || applicantPhone !== undefined || description !== undefined) {
      const { data: existingApp2 } = await supabase
        .from('service_applications')
        .select('payment_status')
        .eq('id', id)
        .single()

      if (existingApp2?.payment_status === 'paid') {
        return Response.json({ error: 'Paid applications cannot be edited' }, { status: 403 })
      }

      if (applicantName !== undefined) updates.applicant_name = applicantName
      if (applicantCnic !== undefined) updates.applicant_cnic = applicantCnic
      if (applicantPhone !== undefined) updates.applicant_phone = applicantPhone
      if (description !== undefined) updates.description = description
    }

    const { error } = await supabase.from('service_applications').update(updates).eq('id', id)

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    let whatsappLink: string | null = null
    let whatsappMessage: string | null = null

    // Auto-trigger WhatsApp on status change
    if (status && status !== previousStatus && existingApp) {
      const customerPhone = ((existingApp as Record<string, unknown>).applicant_whatsapp || (existingApp as Record<string, unknown>).applicant_phone) as string || ''
      const customerName = (existingApp as Record<string, unknown>).applicant_name as string || 'Customer'
      const serviceName = (existingApp as Record<string, unknown>).service_name as string || 'Service'
      const feeAmount = (existingApp as Record<string, unknown>).fee_amount as number || 0

      if (customerPhone) {
        const result = await triggerStatusWhatsAppNotification({
          applicationId: id,
          customerPhone,
          customerName,
          serviceName,
          newStatus: status,
          amount: feeAmount,
        })
        if (result) {
          whatsappLink = result.link
          whatsappMessage = result.message
        }
      }
    }

    // Auto-trigger WhatsApp on payment confirmation
    if (paymentStatus === 'paid' && paymentStatus !== previousPaymentStatus && existingApp) {
      const customerPhone = ((existingApp as Record<string, unknown>).applicant_whatsapp || (existingApp as Record<string, unknown>).applicant_phone) as string || ''
      const customerName = (existingApp as Record<string, unknown>).applicant_name as string || 'Customer'
      const serviceName = (existingApp as Record<string, unknown>).service_name as string || 'Service'
      const feeAmount = (existingApp as Record<string, unknown>).fee_amount as number || 0

      if (customerPhone) {
        const result = await triggerPaymentWhatsAppNotification({
          customerPhone,
          customerName,
          serviceName,
          amount: feeAmount,
          paymentMethod: (existingApp as Record<string, unknown>).payment_method as string || 'Cash',
        })
        whatsappLink = result.link
        whatsappMessage = result.message
      }
    }

    // If document was uploaded and status is completed, include document URL in WhatsApp
    if (resultDocumentUrl && status === 'completed' && existingApp) {
      const customerPhone = ((existingApp as Record<string, unknown>).applicant_whatsapp || (existingApp as Record<string, unknown>).applicant_phone) as string || ''
      if (customerPhone && resultDocumentUrl) {
        // Create a WhatsApp message that includes the document link
        const customerName = (existingApp as Record<string, unknown>).applicant_name as string || 'Customer'
        const serviceName = (existingApp as Record<string, unknown>).service_name as string || 'Service'
        const feeAmount = (existingApp as Record<string, unknown>).fee_amount as number || 0
        const docLink = !resultDocumentUrl.startsWith('data:') ? resultDocumentUrl : ''

        const message = `Assalam o Alaikum ${customerName}! ✅

*Jugnoo Photostate - Order Complete*
━━━━━━━━━━━━━━━━━
🔧 Service: ${serviceName}
💰 Amount: Rs. ${feeAmount?.toLocaleString()}
📊 Status: COMPLETED ✅

${docLink ? `📥 *Download your work here:*
${docLink}` : '📥 Your work has been completed. Please visit the shop to collect it.'}

━━━━━━━━━━━━━━━━━
Thank you for choosing Jugnoo! 🙏

https://jugnoosmartportal.vercel.app`

        const cleanPhone = customerPhone.replace(/[^0-9]/g, '')
        const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone
        const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`

        whatsappLink = waLink
        whatsappMessage = message
      }
    }

    return Response.json({
      message: 'Application update ho gayi hai!',
      whatsappNotification: whatsappLink ? { link: whatsappLink, message: whatsappMessage } : null,
    })
  } catch (error) {
    console.error('Service applications PUT error:', error)
    return Response.json({ error: 'Application update nahi ho saki.' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Application ID chahiye' }, { status: 400 })
    }

    // First check if the application is paid - don't allow deletion of paid applications
    const { data: app } = await supabase
      .from('service_applications')
      .select('payment_status')
      .eq('id', id)
      .single()

    if (app?.payment_status === 'paid') {
      return Response.json({ error: 'Paid applications cannot be deleted' }, { status: 403 })
    }

    const { error } = await supabase.from('service_applications').delete().eq('id', id)

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ message: 'Application delete ho gayi!' })
  } catch (error) {
    console.error('Service applications DELETE error:', error)
    return Response.json({ error: 'Application delete nahi ho saki.' }, { status: 500 })
  }
}
