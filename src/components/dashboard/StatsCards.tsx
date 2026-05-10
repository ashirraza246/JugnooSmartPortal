'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, ShoppingCart, Users, AlertCircle } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    todayOrders: number
    todayRevenue: number
    activeCustomers: number
    pendingTasks: number
  }
  isLoading: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingCart,
      color: '#1A3C5E',
      bgColor: '#E8F0FE',
    },
    {
      title: 'Revenue Today',
      value: stats.todayRevenue > 0 ? `Rs. ${stats.todayRevenue.toLocaleString()}` : 'No Revenue',
      icon: TrendingUp,
      color: '#2E7D32',
      bgColor: '#E8F5E9',
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers,
      icon: Users,
      color: '#F5A623',
      bgColor: '#FFF3D6',
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: AlertCircle,
      color: '#E53935',
      bgColor: '#FFEBEE',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="h-16 ubl-skeleton-shimmer rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#6B7280] font-medium">{card.title}</p>
                    <p className="text-lg font-bold truncate" style={{ color: card.color }}>{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
