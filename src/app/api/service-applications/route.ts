import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { userId, serviceType, serviceName, applicantName, applicantCnic, applicantPhone, applicantWhatsapp, description, feeAmount } = body

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
    const { id, status, paymentStatus, notes, applicantName, applicantCnic, applicantPhone, description } = body

    if (!id) {
      return Response.json({ error: 'Application ID chahiye' }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (paymentStatus) updates.payment_status = paymentStatus
    if (notes) updates.notes = notes

    // If this is a customer edit (has applicant fields), check if the application is paid
    if (applicantName !== undefined || applicantCnic !== undefined || applicantPhone !== undefined || description !== undefined) {
      const { data: existingApp } = await supabase
        .from('service_applications')
        .select('payment_status')
        .eq('id', id)
        .single()

      if (existingApp?.payment_status === 'paid') {
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

    return Response.json({ message: 'Application update ho gayi hai!' })
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
