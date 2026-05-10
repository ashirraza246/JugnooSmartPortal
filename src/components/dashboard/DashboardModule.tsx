'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { StatsCards } from './StatsCards'
import { RevenueChart } from './RevenueChart'
import { RecentOrders } from './RecentOrders'
import { QuickActions } from './QuickActions'
import { Sparkles, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        <div className="text-center py-8 text-[#6B7280]">
          <p>Dashboard data load nahi ho saka. Page refresh karein.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Card - Admin UBL Style */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#F5A623]/10 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-[#F5A623] text-sm font-medium mb-1">Admin Dashboard</p>
          <p className="text-3xl sm:text-4xl font-bold mb-2">
            {isLoading ? '...' : (data?.stats?.todayOrders || 0)} Orders Today
          </p>
          <p className="text-white/70 text-sm">Manage your business at a glance</p>
          <div className="flex items-center gap-3 mt-4">
            <Button
              size="sm"
              className="bg-[#F5A623] hover:bg-[#FFB300] text-[#1A3C5E] font-semibold rounded-xl h-10 px-5 shadow-sm"
              onClick={() => setActiveModule('orders')}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              View Orders
            </Button>
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl h-10 px-5"
              onClick={() => setActiveModule('customers')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Customers
            </Button>
          </div>
        </div>
      </div>

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
