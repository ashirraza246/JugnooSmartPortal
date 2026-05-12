import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('from')
    const dateTo = searchParams.get('to')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const yesterdayISO = yesterday.toISOString()

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    const prevWeekAgo = new Date()
    prevWeekAgo.setDate(prevWeekAgo.getDate() - 14)
    const prevWeekAgoISO = prevWeekAgo.toISOString()

    // Apply date range if specified
    const filterFrom = dateFrom || todayISO
    const filterTo = dateTo || new Date().toISOString()

    // Today's orders count
    const { count: todayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    // Yesterday's orders count for comparison
    const { count: yesterdayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterdayISO)
      .lt('created_at', todayISO)

    // Today's revenue
    const { data: todayPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', todayISO)

    const todayRevenue = todayPayments?.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0

    // Yesterday's revenue for comparison
    const { data: yesterdayPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', yesterdayISO)
      .lt('created_at', todayISO)

    const yesterdayRevenue = yesterdayPayments?.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0

    // This week's revenue
    const { data: thisWeekPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', weekAgoISO)

    const thisWeekRevenue = thisWeekPayments?.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0

    // Previous week's revenue for comparison
    const { data: prevWeekPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', prevWeekAgoISO)
      .lt('created_at', weekAgoISO)

    const prevWeekRevenue = prevWeekPayments?.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0

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

    // Recent orders
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

    // Revenue last 7 days (bar chart)
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

    // Monthly Revenue Trend (last 6 months)
    const monthlyRevenue: { month: string; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date()
      startOfMonth.setMonth(startOfMonth.getMonth() - i)
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const endOfMonth = new Date()
      endOfMonth.setMonth(endOfMonth.getMonth() - i)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0)
      endOfMonth.setHours(23, 59, 59, 999)

      const { data: monthPayments } = await supabase
        .from('payments')
        .select('amount')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())

      const monthRevenue = monthPayments?.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0

      monthlyRevenue.push({
        month: startOfMonth.toLocaleDateString('en-PK', { month: 'short', year: '2-digit' }),
        revenue: monthRevenue,
      })
    }

    // Service Type Breakdown (for donut/pie chart)
    const { count: govtServicesCount } = await supabase
      .from('govt_services')
      .select('*', { count: 'exact', head: true })

    const { count: notarisationCount } = await supabase
      .from('notarisation_services')
      .select('*', { count: 'exact', head: true })

    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    const { count: serviceAppsCount } = await supabase
      .from('service_applications')
      .select('*', { count: 'exact', head: true })

    const serviceBreakdown = [
      { name: 'Govt Services', value: govtServicesCount || 0, color: '#1A3C5E' },
      { name: 'Notarisation', value: notarisationCount || 0, color: '#F5A623' },
      { name: 'Manual Orders', value: ordersCount || 0, color: '#2E7D32' },
      { name: 'Service Applications', value: serviceAppsCount || 0, color: '#7C3AED' },
    ]

    // Top Services ranking
    const { data: topGovtServices } = await supabase
      .from('govt_services')
      .select('service_name, service_type')
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: topServiceApps } = await supabase
      .from('service_applications')
      .select('service_name, service_type')
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: topOrders } = await supabase
      .from('orders')
      .select('order_type')
      .order('created_at', { ascending: false })
      .limit(50)

    // Count service occurrences
    const serviceCountMap: Record<string, number> = {}
    for (const s of (topGovtServices || [])) {
      const name = s.service_name || 'Unknown Govt Service'
      serviceCountMap[name] = (serviceCountMap[name] || 0) + 1
    }
    for (const s of (topServiceApps || [])) {
      const name = s.service_name || 'Unknown Service'
      serviceCountMap[name] = (serviceCountMap[name] || 0) + 1
    }
    for (const o of (topOrders || [])) {
      const name = o.order_type || 'other'
      serviceCountMap[name] = (serviceCountMap[name] || 0) + 1
    }

    const topServices = Object.entries(serviceCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Sparkline data for stats cards (7 day mini trends)
    const sparklineData = revenueChart.map(d => d.revenue)

    // Calculate trends
    const orderTrend = yesterdayOrders ? ((todayOrders || 0) - yesterdayOrders) / yesterdayOrders * 100 : 0
    const revenueTrend = yesterdayRevenue ? (todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100 : 0
    const weekTrend = prevWeekRevenue ? (thisWeekRevenue - prevWeekRevenue) / prevWeekRevenue * 100 : 0

    return Response.json({
      stats: {
        todayOrders: todayOrders || 0,
        todayRevenue,
        activeCustomers: totalCustomers || 0,
        pendingTasks: (pendingOrders || 0) + (pendingGovtServices || 0) + (pendingNotarisations || 0),
        // New comparison stats
        yesterdayOrders: yesterdayOrders || 0,
        yesterdayRevenue,
        thisWeekRevenue,
        orderTrend: Math.round(orderTrend * 10) / 10,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
        weekTrend: Math.round(weekTrend * 10) / 10,
        sparklineData,
      },
      revenueChart,
      monthlyRevenue,
      serviceBreakdown,
      topServices,
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
