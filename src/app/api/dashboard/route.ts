import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Today's orders count
    const { count: todayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    // Today's revenue
    const { data: todayPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', todayISO)

    const todayRevenue = todayPayments?.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0

    // Total customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress'])

    // Pending govt services
    const { count: pendingGovtServices } = await supabase
      .from('govt_services')
      .select('*', { count: 'exact', head: true })
      .in('status', ['applied', 'under_review'])

    // Pending notarisations
    const { count: pendingNotarisations } = await supabase
      .from('notarisation_services')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Recent orders - with safe defaults for null values
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number, order_type, status, priority, total_amount, created_at, customer:customers(full_name, whatsapp)')
      .order('created_at', { ascending: false })
      .limit(10)

    // Low inventory
    const { data: allInventory } = await supabase
      .from('inventory')
      .select('*')

    const lowInventory = (allInventory || [])
      .filter((item: { current_stock: number; minimum_stock: number }) => item.current_stock <= item.minimum_stock)
      .map((item: Record<string, unknown>) => ({
        id: item.id,
        itemName: item.item_name,
        category: item.category,
        currentStock: item.current_stock || 0,
        minimumStock: item.minimum_stock || 0,
        unit: item.unit,
        lastRestocked: item.last_restocked,
      }))

    // Revenue last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { data: payments7Days } = await supabase
      .from('payments')
      .select('amount, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    const revenueByDay: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      revenueByDay[key] = 0
    }
    for (const p of (payments7Days || [])) {
      const key = new Date(p.created_at).toISOString().split('T')[0]
      if (revenueByDay[key] !== undefined) {
        revenueByDay[key] += p.amount || 0
      }
    }

    const revenueChart = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }))

    return Response.json({
      stats: {
        todayOrders: todayOrders || 0,
        todayRevenue,
        activeCustomers: totalCustomers || 0,
        pendingTasks: (pendingOrders || 0) + (pendingGovtServices || 0) + (pendingNotarisations || 0),
      },
      revenueChart,
      recentOrders: (recentOrders || []).map((o: { id: string; order_number: string; order_type: string | null; status: string | null; priority: string | null; total_amount: number | null; created_at: string; customer?: { full_name: string } | null }) => ({
        id: o.id,
        orderNumber: o.order_number || '',
        customerName: o.customer?.full_name || 'Walk-in',
        orderType: o.order_type || 'other',
        status: o.status || 'pending',
        priority: o.priority || 'normal',
        totalAmount: o.total_amount || 0,
        createdAt: o.created_at,
      })),
      lowInventory,
      pendingGovtServices: pendingGovtServices || 0,
      pendingNotarisations: pendingNotarisations || 0,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return Response.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
