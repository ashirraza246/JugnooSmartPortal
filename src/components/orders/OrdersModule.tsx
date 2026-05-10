'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import { OrderForm } from './OrderForm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Filter, ArrowRight, Trash2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

const statusFlow = ['pending', 'in_progress', 'ready', 'delivered']

export function OrdersModule() {
  const { searchQuery } = useAppStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const json = await res.json()
      return json.orders || json || []
    },
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-brief'],
    queryFn: async () => {
      const res = await fetch('/api/customers')
      const json = await res.json()
      return json.customers || json || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({ title: 'Order created!' })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({ title: 'Order status updated!' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/orders?id=${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({ title: 'Order deleted!' })
    },
  })

  const getNextStatus = (currentStatus: string) => {
    const safeStatus = currentStatus || 'pending'
    const idx = statusFlow.indexOf(safeStatus)
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8} className="h-12 animate-pulse bg-muted/50" />
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: Record<string, unknown>) => {
                    const safeStatus = (order.status as string) || 'pending'
                    const safePriority = (order.priority as string) || 'normal'
                    const safeOrderType = (order.orderType as string) || 'other'
                    const safeTotalAmount = (order.totalAmount as number) || 0
                    const safePaymentStatus = (order.paymentStatus as string) || 'unpaid'

                    return (
                      <TableRow key={order.id as string} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedOrder(order)}>
                        <TableCell className="font-medium">{(order.orderNumber as string) || 'N/A'}</TableCell>
                        <TableCell>{(order.customer as Record<string, string>)?.fullName || 'Walk-in'}</TableCell>
                        <TableCell className="capitalize">{safeOrderType.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          <StatusBadge status={safeStatus} type="order" />
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={safePriority} />
                        </TableCell>
                        <TableCell className="text-right font-medium">Rs. {safeTotalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            safePaymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                            safePaymentStatus === 'partial' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }>
                            {safePaymentStatus.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {getNextStatus(safeStatus) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-emerald-600 hover:text-emerald-700"
                                onClick={() => updateStatusMutation.mutate({
                                  id: order.id as string,
                                  status: getNextStatus(safeStatus),
                                })}
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                {getNextStatus(safeStatus)?.replace(/_/g, ' ')}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-600"
                              onClick={() => deleteMutation.mutate(order.id as string)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details - {(selectedOrder?.orderNumber as string) || 'N/A'}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{(selectedOrder.customer as Record<string, string>)?.fullName || 'Walk-in'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium capitalize">{((selectedOrder.orderType as string) || 'other').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-0.5"><StatusBadge status={(selectedOrder.status as string) || 'pending'} type="order" /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <div className="mt-0.5"><PriorityBadge priority={(selectedOrder.priority as string) || 'normal'} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-medium">Rs. {((selectedOrder.totalAmount as number) || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Paid:</span>
                  <p className="font-medium">Rs. {((selectedOrder.paidAmount as number) || 0).toLocaleString()}</p>
                </div>
              </div>
              {selectedOrder.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="text-sm mt-0.5">{selectedOrder.description as string}</p>
                </div>
              )}
              {selectedOrder.specifications && (
                <div>
                  <span className="text-sm text-muted-foreground">Specifications:</span>
                  <pre className="text-xs mt-0.5 bg-muted p-2 rounded">
                    {JSON.stringify(selectedOrder.specifications, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {getNextStatus((selectedOrder.status as string) || 'pending') && (
                  <Button
                    className="gap-1"
                    onClick={() => {
                      const nextStatus = getNextStatus((selectedOrder.status as string) || 'pending')
                      if (nextStatus) {
                        updateStatusMutation.mutate({
                          id: selectedOrder.id as string,
                          status: nextStatus,
                        })
                        setSelectedOrder(null)
                      }
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Move to {getNextStatus((selectedOrder.status as string) || 'pending')?.replace(/_/g, ' ')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Order Form */}
      <OrderForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        customers={customers.map((c: Record<string, string>) => ({ id: c.id, fullName: c.fullName }))}
      />
    </div>
  )
}
