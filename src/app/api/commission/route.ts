import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest } from 'next/server'

function mapCommissionRule(r: Record<string, unknown>) {
  return {
    id: r.id,
    serviceType: r.service_type,
    serviceName: r.service_name,
    govtFee: Number(r.govt_fee) || 0,
    jugnooFee: Number(r.jugnoo_fee) || 0,
    commissionType: r.commission_type || 'fixed',
    commissionValue: Number(r.commission_value) || 0,
    minCommission: Number(r.min_commission) || 0,
    maxCommission: Number(r.max_commission) || 0,
    isActive: r.is_active !== false,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// GET - Fetch commission rules and summary
export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const includeSummary = searchParams.get('summary') === 'true'

    const { data: rules, error } = await supabase
      .from('commission_rules')
      .select('*')
      .order('service_type', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 400 })

    const mappedRules = (rules || []).map(mapCommissionRule)

    if (includeSummary) {
      // Calculate commission summary
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // Get completed applications from this month for commission calculation
      const { data: monthlyApps } = await supabase
        .from('service_applications')
        .select('service_type, service_name, fee_amount, status, created_at')
        .eq('status', 'completed')
        .gte('created_at', startOfMonth)

      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('order_type, total_amount, status, created_at')
        .eq('status', 'delivered')
        .gte('created_at', startOfMonth)

      // Build summary from commission rules
      const serviceBreakdown: Record<string, { serviceName: string; count: number; totalGovtFee: number; totalJugnooFee: number; totalCommission: number }> = {}
      let totalCommissionEarned = 0

      // Process applications
      const apps = monthlyApps || []
      for (const app of apps) {
        const appData = app as Record<string, unknown>
        const serviceType = appData.service_type as string
        const feeAmount = Number(appData.fee_amount) || 0

        // Find matching commission rule
        const matchingRule = mappedRules.find((r: Record<string, unknown>) => r.serviceType === serviceType && r.isActive)
        const commission = calculateCommission(matchingRule, feeAmount)

        if (!serviceBreakdown[serviceType]) {
          serviceBreakdown[serviceType] = {
            serviceName: (appData.service_name as string) || serviceType,
            count: 0,
            totalGovtFee: matchingRule ? Number(matchingRule.govtFee) : 0,
            totalJugnooFee: matchingRule ? Number(matchingRule.jugnooFee) : 0,
            totalCommission: 0,
          }
        }
        serviceBreakdown[serviceType].count++
        serviceBreakdown[serviceType].totalCommission += commission
        totalCommissionEarned += commission
      }

      // Process orders
      const orders = monthlyOrders || []
      for (const order of orders) {
        const orderData = order as Record<string, unknown>
        const orderType = orderData.order_type as string
        const totalAmount = Number(orderData.total_amount) || 0

        const matchingRule = mappedRules.find((r: Record<string, unknown>) => r.serviceType === orderType && r.isActive)
        const commission = calculateCommission(matchingRule, totalAmount)

        if (!serviceBreakdown[orderType]) {
          serviceBreakdown[orderType] = {
            serviceName: orderType.replace(/_/g, ' '),
            count: 0,
            totalGovtFee: matchingRule ? Number(matchingRule.govtFee) : 0,
            totalJugnooFee: matchingRule ? Number(matchingRule.jugnooFee) : 0,
            totalCommission: 0,
          }
        }
        serviceBreakdown[orderType].count++
        serviceBreakdown[orderType].totalCommission += commission
        totalCommissionEarned += commission
      }

      // Monthly trend (last 6 months)
      const monthlyTrend = []
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short' })

        const { data: monthApps } = await supabase
          .from('service_applications')
          .select('fee_amount, service_type')
          .eq('status', 'completed')
          .gte('created_at', monthDate.toISOString())
          .lte('created_at', monthEnd.toISOString())

        let monthCommission = 0
        for (const app of (monthApps || [])) {
          const appData = app as Record<string, unknown>
          const matchingRule = mappedRules.find((r: Record<string, unknown>) => r.serviceType === (appData.service_type as string) && r.isActive)
          monthCommission += calculateCommission(matchingRule, Number(appData.fee_amount) || 0)
        }
        monthlyTrend.push({ month: monthLabel, commission: monthCommission })
      }

      // Top earning services
      const topServices = Object.entries(serviceBreakdown)
        .map(([key, val]) => ({ type: key, ...val }))
        .sort((a, b) => b.totalCommission - a.totalCommission)
        .slice(0, 5)

      return Response.json({
        rules: mappedRules,
        summary: {
          totalCommissionEarned,
          serviceBreakdown,
          topServices,
          monthlyTrend,
        },
      })
    }

    return Response.json({ rules: mappedRules })
  } catch (error) {
    console.error('Commission GET error:', error)
    return Response.json({ error: 'Failed to fetch commission rules' }, { status: 500 })
  }
}

// POST - Create commission rule
export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { data, error } = await supabase.from('commission_rules').insert([{
      service_type: body.serviceType,
      service_name: body.serviceName,
      govt_fee: body.govtFee || 0,
      jugnoo_fee: body.jugnooFee || 0,
      commission_type: body.commissionType || 'fixed',
      commission_value: body.commissionValue || 0,
      min_commission: body.minCommission || 0,
      max_commission: body.maxCommission || 0,
      is_active: body.isActive !== false,
    }]).select()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ rule: mapCommissionRule(data[0]) })
  } catch (error) {
    console.error('Commission POST error:', error)
    return Response.json({ error: 'Failed to create commission rule' }, { status: 500 })
  }
}

// PUT - Update commission rule
export async function PUT(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const { id, ...updates } = body

    const mapped: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.serviceType !== undefined) mapped.service_type = updates.serviceType
    if (updates.serviceName !== undefined) mapped.service_name = updates.serviceName
    if (updates.govtFee !== undefined) mapped.govt_fee = updates.govtFee
    if (updates.jugnooFee !== undefined) mapped.jugnoo_fee = updates.jugnooFee
    if (updates.commissionType !== undefined) mapped.commission_type = updates.commissionType
    if (updates.commissionValue !== undefined) mapped.commission_value = updates.commissionValue
    if (updates.minCommission !== undefined) mapped.min_commission = updates.minCommission
    if (updates.maxCommission !== undefined) mapped.max_commission = updates.maxCommission
    if (updates.isActive !== undefined) mapped.is_active = updates.isActive

    const { data, error } = await supabase.from('commission_rules').update(mapped).eq('id', id).select()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ rule: mapCommissionRule(data[0]) })
  } catch (error) {
    console.error('Commission PUT error:', error)
    return Response.json({ error: 'Failed to update commission rule' }, { status: 500 })
  }
}

// DELETE - Delete commission rule
export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('commission_rules').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Commission DELETE error:', error)
    return Response.json({ error: 'Failed to delete commission rule' }, { status: 500 })
  }
}

// Helper: Calculate commission for a rule
function calculateCommission(rule: Record<string, unknown> | undefined, amount: number): number {
  if (!rule || !rule.isActive) {
    // Default: use jugnoo fee as commission
    return rule ? Number(rule.jugnooFee) || 0 : 0
  }

  let commission = 0
  if (rule.commissionType === 'percentage') {
    commission = (amount * Number(rule.commissionValue)) / 100
  } else {
    commission = Number(rule.commissionValue) || Number(rule.jugnooFee) || 0
  }

  // Apply min/max constraints
  if (rule.minCommission && commission < Number(rule.minCommission)) {
    commission = Number(rule.minCommission)
  }
  if (rule.maxCommission && commission > Number(rule.maxCommission)) {
    commission = Number(rule.maxCommission)
  }

  return commission
}
