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

interface RevenueChartProps {
  data: { date: string; revenue: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
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
  )
}
