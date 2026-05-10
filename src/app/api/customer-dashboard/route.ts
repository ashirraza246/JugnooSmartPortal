import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    // Get user's applications count
    let applicationsQuery = supabase.from('service_applications').select('*', { count: 'exact' })
    if (userId) applicationsQuery = applicationsQuery.eq('user_id', userId)

    const { count: totalApplications } = await applicationsQuery

    // Pending applications
    let pendingQuery = supabase.from('service_applications').select('*', { count: 'exact' }).in('status', ['submitted', 'pending', 'in_progress', 'under_review'])
    if (userId) pendingQuery = pendingQuery.eq('user_id', userId)

    const { count: pendingApplications } = await pendingQuery

    // Completed applications
    let completedQuery = supabase.from('service_applications').select('*', { count: 'exact' }).in('status', ['completed', 'approved'])
    if (userId) completedQuery = completedQuery.eq('user_id', userId)

    const { count: completedApplications } = await completedQuery

    // Total payments
    let paymentsQuery = supabase.from('payments').select('amount')
    if (userId) {
      // Get customer id from user id
      const { data: customerData } = await supabase.from('customers').select('id').eq('email', (await supabase.from('users').select('email').eq('id', userId).single()).data?.email).single()
      if (customerData) {
        paymentsQuery = paymentsQuery.eq('customer_id', customerData.id)
      }
    }
    const { data: payments } = await paymentsQuery
    const totalPayments = (payments || []).reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0)

    // Available services count
    const { count: availableServices } = await supabase
      .from('service_listings')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Recent applications
    let recentQuery = supabase.from('service_applications').select('*').order('created_at', { ascending: false }).limit(5)
    if (userId) recentQuery = recentQuery.eq('user_id', userId)

    const { data: recentApplications } = await recentQuery

    return Response.json({
      stats: {
        totalApplications: totalApplications || 0,
        pendingApplications: pendingApplications || 0,
        completedApplications: completedApplications || 0,
        totalPayments: totalPayments || 0,
        availableServices: availableServices || 0,
      },
      recentApplications: recentApplications || [],
    })
  } catch (error) {
    console.error('Customer dashboard error:', error)
    return Response.json({
      stats: { totalApplications: 0, pendingApplications: 0, completedApplications: 0, totalPayments: 0, availableServices: 0 },
      recentApplications: [],
    })
  }
}
