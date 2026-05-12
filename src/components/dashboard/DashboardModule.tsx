'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { StatsCards } from './StatsCards'
import { RevenueChart } from './RevenueChart'
import { RecentOrders } from './RecentOrders'
import { QuickActions } from './QuickActions'
import { Sparkles, ClipboardList, Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export function DashboardModule() {
  const { setSelectedOrderId, setActiveModule } = useAppStore()
  const queryClient = useQueryClient()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', dateFrom, dateTo],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (dateFrom) params.set('from', new Date(dateFrom).toISOString())
        if (dateTo) params.set('to', new Date(dateTo + 'T23:59:59').toISOString())
        const res = await fetch(`/api/dashboard?${params}`)
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

  const handleApplyDateFilter = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    setDatePickerOpen(false)
  }

  const handleClearDateFilter = () => {
    setDateFrom('')
    setDateTo('')
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    setDatePickerOpen(false)
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

          {/* Trend indicators in hero */}
          {data?.stats && (data.stats.orderTrend !== 0 || data.stats.revenueTrend !== 0) && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
              {data.stats.orderTrend !== 0 && (
                <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${data.stats.orderTrend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.stats.orderTrend > 0 ? '↑' : '↓'} {Math.abs(data.stats.orderTrend).toFixed(1)}% orders vs yesterday
                </div>
              )}
              {data.stats.revenueTrend !== 0 && (
                <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${data.stats.revenueTrend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.stats.revenueTrend > 0 ? '↑' : '↓'} {Math.abs(data.stats.revenueTrend).toFixed(1)}% revenue vs yesterday
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4 flex-wrap">
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

            {/* Date Range Picker */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl h-10 px-4 gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  {(dateFrom || dateTo) ? 'Date Filter Active' : 'Date Range'}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 rounded-2xl" align="end">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#1A3C5E]" />
                    <span className="text-sm font-semibold text-[#1A3C5E]">Filter by Date Range</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-[#6B7280]">From</Label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-[#6B7280]">To</Label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-[#1A3C5E] hover:bg-[#15304D] text-white rounded-xl h-9"
                      onClick={handleApplyDateFilter}
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl h-9"
                      onClick={handleClearDateFilter}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <StatsCards
        stats={data?.stats || { todayOrders: 0, todayRevenue: 0, activeCustomers: 0, pendingTasks: 0 }}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={data?.revenueChart || []}
            monthlyRevenue={data?.monthlyRevenue || []}
            serviceBreakdown={data?.serviceBreakdown || []}
            topServices={data?.topServices || []}
          />
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
