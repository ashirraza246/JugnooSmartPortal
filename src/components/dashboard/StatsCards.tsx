'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ShoppingCart, Users, AlertCircle, Wallet, ClipboardList } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    todayOrders: number
    todayRevenue: number
    activeCustomers: number
    pendingTasks: number
    totalOrders?: number
    yesterdayOrders?: number
    yesterdayRevenue?: number
    thisWeekRevenue?: number
    orderTrend?: number
    revenueTrend?: number
    weekTrend?: number
    sparklineData?: number[]
  }
  isLoading: boolean
}

// Mini sparkline component
function MiniSparkline({ data, color, width = 60, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height * 0.8 - height * 0.1
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Trend indicator
function TrendIndicator({ value, label }: { value: number; label: string }) {
  if (value === 0) return null
  const isPositive = value > 0
  return (
    <div className={`flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
      {isPositive ? (
        <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
      ) : (
        <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
      )}
      <span>{Math.abs(value).toFixed(1)}% {label}</span>
    </div>
  )
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const sparkData = stats.sparklineData || []

  const cards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      formattedValue: String(stats.todayOrders),
      icon: ShoppingCart,
      color: '#1A3C5E',
      bgColor: '#E8F0FE',
      sparkColor: '#1A3C5E',
      trend: stats.orderTrend,
      trendLabel: 'vs yesterday',
      comparison: stats.yesterdayOrders !== undefined ? `Yesterday: ${stats.yesterdayOrders}` : undefined,
    },
    {
      title: 'Revenue Today',
      value: stats.todayRevenue,
      formattedValue: stats.todayRevenue > 0 ? `Rs. ${stats.todayRevenue.toLocaleString()}` : 'No Revenue',
      icon: Wallet,
      color: '#2E7D32',
      bgColor: '#E8F5E9',
      sparkColor: '#2E7D32',
      trend: stats.revenueTrend,
      trendLabel: 'vs yesterday',
      comparison: stats.yesterdayRevenue !== undefined ? `Yesterday: Rs. ${stats.yesterdayRevenue.toLocaleString()}` : undefined,
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers,
      formattedValue: String(stats.activeCustomers),
      icon: Users,
      color: '#F5A623',
      bgColor: '#FFF3D6',
      sparkColor: '#F5A623',
      trend: 0,
      trendLabel: '',
      comparison: undefined,
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      formattedValue: String(stats.pendingTasks),
      icon: AlertCircle,
      color: '#E53935',
      bgColor: '#FFEBEE',
      sparkColor: '#E53935',
      trend: 0,
      trendLabel: '',
      comparison: undefined,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      formattedValue: String(stats.totalOrders || 0),
      icon: ClipboardList,
      color: '#7C3AED',
      bgColor: '#F3E5F5',
      sparkColor: '#7C3AED',
      trend: 0,
      trendLabel: '',
      comparison: undefined,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="h-16 ubl-skeleton-shimmer rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: card.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#6B7280] font-medium">{card.title}</p>
                    <p className="text-base sm:text-lg font-bold truncate" style={{ color: card.color }}>{card.formattedValue}</p>
                    {/* Trend indicator */}
                    {card.trend !== 0 && (
                      <TrendIndicator value={card.trend} label={card.trendLabel} />
                    )}
                    {/* Comparison text */}
                    {card.comparison && (
                      <p className="text-[9px] text-[#9CA3AF] mt-0.5">{card.comparison}</p>
                    )}
                  </div>
                  {/* Sparkline */}
                  {sparkData.length > 1 && (
                    <div className="shrink-0 mt-1 hidden sm:block">
                      <MiniSparkline data={sparkData} color={card.sparkColor} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
