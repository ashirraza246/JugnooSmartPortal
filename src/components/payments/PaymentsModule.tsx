'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Banknote, TrendingUp, Calendar, Wallet } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function PaymentsModule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    amount: '',
    paymentMethod: 'cash',
    notes: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await fetch('/api/payments')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['orders-brief'],
    queryFn: async () => {
      const res = await fetch('/api/orders')
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
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({ title: 'Payment recorded!' })
    },
  })

  const handleCreate = () => {
    createMutation.mutate({
      orderId: formData.orderId || null,
      customerId: formData.customerId || null,
      amount: parseFloat(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes || null,
    })
    setShowForm(false)
    setFormData({ orderId: '', customerId: '', amount: '', paymentMethod: 'cash', notes: '' })
  }

  const revenue = data?.revenue || { today: 0, thisWeek: 0, thisMonth: 0, total: 0 }
  const payments = data?.payments || []

  const summaryCards = [
    { title: 'Today', value: revenue.today, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'This Week', value: revenue.thisWeek, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'This Month', value: revenue.thisMonth, icon: Calendar, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Total', value: revenue.total, icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-4">
      {/* Revenue Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="font-bold text-lg">Rs. {card.value.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payment Records</h3>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Record Payment
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-12 animate-pulse bg-muted/50" />
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No payments recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment: Record<string, unknown>) => {
                    const safeReceiptNumber = (payment.receiptNumber as string) || 'N/A'
                    const safeCustomerName = (payment.customer as Record<string, string>)?.fullName || '-'
                    const safeOrderNumber = (payment.order as Record<string, string>)?.orderNumber || '-'
                    const safeAmount = (payment.amount as number) || 0
                    const safePaymentMethod = (payment.paymentMethod as string) || 'cash'
                    const safeCreatedAt = (payment.createdAt as string) || new Date().toISOString()
                    return (
                    <TableRow key={payment.id as string}>
                      <TableCell className="font-medium">{safeReceiptNumber}</TableCell>
                      <TableCell>{safeCustomerName}</TableCell>
                      <TableCell>{safeOrderNumber}</TableCell>
                      <TableCell className="text-right font-semibold">Rs. {safeAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          safePaymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700' :
                          safePaymentMethod === 'jazzcash' ? 'bg-red-50 text-red-700' :
                          safePaymentMethod === 'easypaisa' ? 'bg-green-50 text-green-700' :
                          safePaymentMethod === 'bank_transfer' ? 'bg-blue-50 text-blue-700' :
                          safePaymentMethod === 'online' ? 'bg-sky-50 text-sky-700' :
                          'bg-amber-50 text-amber-700'
                        }>
                          {safePaymentMethod === 'jazzcash' ? 'JazzCash' :
                           safePaymentMethod === 'easypaisa' ? 'EasyPaisa' :
                           safePaymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                           safePaymentMethod === 'online' ? 'Online' :
                           safePaymentMethod.charAt(0).toUpperCase() + safePaymentMethod.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(safeCreatedAt).toLocaleDateString()}
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

      {/* Record Payment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Customer</Label>
                <Select value={formData.customerId} onValueChange={(v) => setFormData({ ...formData, customerId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c: Record<string, string>) => (
                      <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Order (optional)</Label>
                <Select value={formData.orderId} onValueChange={(v) => setFormData({ ...formData, orderId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {orders.map((o: Record<string, string>) => (
                      <SelectItem key={o.id} value={o.id}>{o.orderNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (Rs.)</Label>
                <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="partial">Partial Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.amount}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
