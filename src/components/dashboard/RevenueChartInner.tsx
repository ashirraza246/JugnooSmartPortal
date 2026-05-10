'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface RevenueChartInnerProps {
  data: { date: string; revenue: number }[]
}

export default function RevenueChartInner({ data }: RevenueChartInnerProps) {
  const formattedData = data.map((d) => {
    const dateObj = new Date(d.date)
    return {
      ...d,
      label: dateObj.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' }),
    }
  })

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Abhi koi revenue data nahi hai
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickFormatter={(v) => `Rs.${v}`}
        />
        <Tooltip
          formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            backgroundColor: 'hsl(var(--card))',
          }}
        />
        <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
