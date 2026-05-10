'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  ready: 'bg-emerald-100 text-emerald-800',
  delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-800',
}

const priorityColors: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-600',
  urgent: 'bg-orange-100 text-orange-800',
  vip: 'bg-amber-100 text-amber-800',
}

export function RecentOrders({ orders, isLoading, onViewOrder }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
            ) : (
              orders.map((order) => {
                const safeStatus = order.status || 'pending'
                const safePriority = order.priority || 'normal'
                const safeOrderType = order.orderType || 'other'
                const safeAmount = order.totalAmount || 0

                return (
                  <button
                    key={order.id}
                    onClick={() => onViewOrder(order.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{order.orderNumber || 'N/A'}</span>
                        <Badge variant="secondary" className={statusColors[safeStatus] || 'bg-gray-100 text-gray-600'}>
                          {safeStatus.replace('_', ' ')}
                        </Badge>
                        {safePriority && safePriority !== 'normal' && (
                          <Badge variant="secondary" className={priorityColors[safePriority] || 'bg-gray-100 text-gray-600'}>
                            {safePriority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {order.customerName || 'Walk-in'} • {safeOrderType.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <span className="font-semibold text-sm ml-4">Rs. {safeAmount.toLocaleString()}</span>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
