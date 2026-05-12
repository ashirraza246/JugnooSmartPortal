'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Load recharts client-side only to prevent SSR crashes
const ChartComponent = dynamic(
  () => import('./RevenueChartInner'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6B7280]">Chart load ho raha hai...</p>
        </div>
      </div>
    ),
  }
)

const MonthlyChartComponent = dynamic(
  () => import('./RevenueChartInner').then(mod => ({ default: mod.MonthlyTrendChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#1A3C5E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6B7280]">Loading...</p>
        </div>
      </div>
    ),
  }
)

const ServiceBreakdownComponent = dynamic(
  () => import('./RevenueChartInner').then(mod => ({ default: mod.ServiceBreakdownChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6B7280]">Loading...</p>
        </div>
      </div>
    ),
  }
)

interface RevenueChartProps {
  data: { date: string; revenue: number }[]
  monthlyRevenue?: { month: string; revenue: number }[]
  serviceBreakdown?: { name: string; value: number; color: string }[]
  topServices?: { name: string; count: number }[]
}

export function RevenueChart({ data, monthlyRevenue, serviceBreakdown, topServices }: RevenueChartProps) {
  return (
    <div className="space-y-6">
      {/* 7-Day Revenue Bar Chart */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#1C1C1E]">Revenue (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartComponent data={data} />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Trend Line Chart */}
      {monthlyRevenue && monthlyRevenue.length > 0 && (
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#1C1C1E]">Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <MonthlyChartComponent data={monthlyRevenue} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom row: Service Breakdown + Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Type Breakdown */}
        {serviceBreakdown && serviceBreakdown.length > 0 && (
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1C1C1E]">Service Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ServiceBreakdownComponent data={serviceBreakdown} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Services */}
        {topServices && topServices.length > 0 && (
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1C1C1E]">Top Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topServices.map((service, index) => {
                  const maxCount = topServices[0]?.count || 1
                  const percentage = Math.round((service.count / maxCount) * 100)
                  return (
                    <div key={service.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#1C1C1E] font-medium truncate flex-1">
                          <span className="text-[#F5A623] font-bold mr-1.5">#{index + 1}</span>
                          {service.name}
                        </span>
                        <span className="text-xs font-semibold text-[#1A3C5E] ml-2">{service.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-[#1A3C5E] to-[#F5A623]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
