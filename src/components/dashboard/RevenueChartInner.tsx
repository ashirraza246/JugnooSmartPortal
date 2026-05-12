'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickFormatter={(v) => `Rs.${v}`}
        />
        <Tooltip
          formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <Bar dataKey="revenue" fill="#F5A623" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Monthly Revenue Trend Line Chart
export function MonthlyTrendChart({ data }: { data: { month: string; revenue: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No monthly data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickFormatter={(v) => `Rs.${v}`}
        />
        <Tooltip
          formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#1A3C5E"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#1A3C5E', stroke: '#FFFFFF', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#F5A623', stroke: '#FFFFFF', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Service Type Breakdown Donut Chart
export function ServiceBreakdownChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No service data available
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="flex items-center gap-4">
      <div className="w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} (${total ? Math.round(value / total * 100) : 0}%)`, name]}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/2 space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] text-[#6B7280] flex-1 truncate">{item.name}</span>
            <span className="text-[11px] font-semibold text-[#1C1C1E]">{item.value}</span>
            <span className="text-[9px] text-[#9CA3AF]">
              {total ? Math.round(item.value / total * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
