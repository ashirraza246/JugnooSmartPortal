'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClipboardList } from 'lucide-react'

interface RecentOrdersProps {
  orders: {
    id: string
    orderNumber: string
    customerName: string
    orderType: string
    status: string
    priority: string
    totalAmount: number
    createdAt: string
  }[]
  isLoading: boolean
  onViewOrder: (id: string) => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-[#FFF3D6] text-[#F5A623]',
  in_progress: 'bg-[#E8F0FE] text-[#1A3C5E]',
  ready: 'bg-[#E8F5E9] text-[#2E7D32]',
  delivered: 'bg-[#F5F7FA] text-[#6B7280]',
  cancelled: 'bg-[#FFEBEE] text-[#E53935]',
}

const priorityColors: Record<string, string> = {
  normal: 'bg-[#F5F7FA] text-[#6B7280]',
  urgent: 'bg-[#FFF3D6] text-[#F5A623]',
  vip: 'bg-[#F3E5F5] text-[#7B1FA2]',
}

export function RecentOrders({ orders, isLoading, onViewOrder }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#1C1C1E]">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 ubl-skeleton-shimmer rounded-xl" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#1C1C1E]">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-96">
          {orders.length === 0 ? (
            <div className="text-center py-10 text-[#6B7280]">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-[#1A3C5E]/10" />
              <p className="text-sm">No recent orders</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => {
                const safeStatus = order.status || 'pending'
                const safePriority = order.priority || 'normal'
                const safeOrderType = order.orderType || 'other'
                const safeAmount = order.totalAmount || 0

                return (
                  <button
                    key={order.id}
                    onClick={() => onViewOrder(order.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#F5F7FA] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center shrink-0">
                        <ClipboardList className="w-4 h-4 text-[#1A3C5E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1C1C1E]">{order.orderNumber || 'N/A'}</span>
                          <Badge className={`text-[10px] border-0 rounded-lg px-2 py-0.5 ${statusColors[safeStatus] || 'bg-[#F5F7FA] text-[#6B7280]'}`}>
                            {safeStatus.replace('_', ' ')}
                          </Badge>
                          {safePriority && safePriority !== 'normal' && (
                            <Badge className={`text-[10px] border-0 rounded-lg px-2 py-0.5 ${priorityColors[safePriority] || 'bg-[#F5F7FA] text-[#6B7280]'}`}>
                              {safePriority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                          {order.customerName || 'Walk-in'} • {safeOrderType.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-[#1A3C5E] ml-4">Rs. {safeAmount.toLocaleString()}</span>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
