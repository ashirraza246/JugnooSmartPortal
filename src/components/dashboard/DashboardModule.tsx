'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { StatsCards } from './StatsCards'
import { RevenueChart } from './RevenueChart'
import { RecentOrders } from './RecentOrders'
import { QuickActions } from './QuickActions'

export function DashboardModule() {
  const { setSelectedOrderId, setActiveModule } = useAppStore()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Failed to load dashboard')
        return res.json()
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        throw err
      }
    },
    retry: false,
  })

  const handleViewOrder = (id: string) => {
    setSelectedOrderId(id)
    setActiveModule('orders')
  }

  // Show error state but don't crash
  if (error && !data) {
    return (
      <div className="space-y-6">
        <StatsCards
          stats={{ todayOrders: 0, todayRevenue: 0, activeCustomers: 0, pendingTasks: 0 }}
          isLoading={false}
        />
        <div className="text-center py-8 text-muted-foreground">
          <p>Dashboard data load nahi ho saka. Page refresh karein.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StatsCards
        stats={data?.stats || { todayOrders: 0, todayRevenue: 0, activeCustomers: 0, pendingTasks: 0 }}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.revenueChart || []} />
        </div>
        <div>
          <QuickActions
            lowInventory={data?.lowInventory || []}
            pendingGovtServices={data?.pendingGovtServices || 0}
            pendingNotarisations={data?.pendingNotarisations || 0}
          />
        </div>
      </div>

      <RecentOrders
        orders={data?.recentOrders || []}
        isLoading={isLoading}
        onViewOrder={handleViewOrder}
      />
    </div>
  )
}
