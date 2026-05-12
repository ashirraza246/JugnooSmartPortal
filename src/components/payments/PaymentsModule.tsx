'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Banknote, TrendingUp, Calendar, Wallet, Upload, Image as ImageIcon, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PaymentVerification } from './PaymentVerification'
import { DataExport } from '@/components/shared/DataExport'
import { InvoiceDialog } from './InvoiceDialog'
import { type InvoiceData, downloadInvoicePDF } from '@/lib/invoice-pdf'

export function PaymentsModule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('records')
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    amount: '',
    paymentMethod: 'cash',
    notes: '',
  })
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<InvoiceData | null>(null)

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

  const handleCreate = async () => {
    let screenshotUrl: string | null = null

    // Upload screenshot if provided
    if (screenshotFile) {
      try {
        const formData = new FormData()
        formData.append('file', screenshotFile)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (uploadRes.ok) {
          screenshotUrl = uploadData.url
        }
      } catch {
        toast({ title: 'Screenshot upload failed', variant: 'destructive' })
      }
    }

    createMutation.mutate({
      orderId: formData.orderId || null,
      customerId: formData.customerId || null,
      amount: parseFloat(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes || null,
      screenshotUrl,
      verificationStatus: screenshotUrl ? 'screenshot_uploaded' : 'verified',
    })
    setShowForm(false)
    setFormData({ orderId: '', customerId: '', amount: '', paymentMethod: 'cash', notes: '' })
    setScreenshotFile(null)
  }

  const handleDownloadInvoice = (payment: Record<string, unknown>) => {
    const safeReceiptNumber = (payment.receiptNumber as string) || 'N/A'
    const safeCustomerName = (payment.customer as Record<string, string>)?.fullName || '-'
    const safeOrderNumber = (payment.order as Record<string, string>)?.orderNumber || '-'
    const safeAmount = (payment.amount as number) || 0
    const safePaymentMethod = (payment.paymentMethod as string) || 'cash'
    const safeCreatedAt = (payment.createdAt as string) || new Date().toISOString()

    const invoiceData: InvoiceData = {
      invoiceNumber: safeReceiptNumber,
      date: new Date(safeCreatedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }),
      customerName: safeCustomerName,
      orderNumber: safeOrderNumber !== '-' ? safeOrderNumber : undefined,
      items: [{
        description: safeOrderNumber !== '-' ? `Order #${safeOrderNumber} Payment` : 'Service Payment',
        quantity: 1,
        unitPrice: safeAmount,
        total: safeAmount,
      }],
      subtotal: safeAmount,
      totalAmount: safeAmount,
      paymentMethod: safePaymentMethod,
    }
    downloadInvoicePDF(invoiceData)
  }

  const handleOpenInvoice = (payment: Record<string, unknown>) => {
    const safeReceiptNumber = (payment.receiptNumber as string) || 'N/A'
    const safeCustomerName = (payment.customer as Record<string, string>)?.fullName || '-'
    const safeOrderNumber = (payment.order as Record<string, string>)?.orderNumber || '-'
    const safeAmount = (payment.amount as number) || 0
    const safePaymentMethod = (payment.paymentMethod as string) || 'cash'
    const safeCreatedAt = (payment.createdAt as string) || new Date().toISOString()

    const invoiceData: InvoiceData = {
      invoiceNumber: safeReceiptNumber,
      date: new Date(safeCreatedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }),
      customerName: safeCustomerName,
      orderNumber: safeOrderNumber !== '-' ? safeOrderNumber : undefined,
      items: [{
        description: safeOrderNumber !== '-' ? `Order #${safeOrderNumber} Payment` : 'Service Payment',
        quantity: 1,
        unitPrice: safeAmount,
        total: safeAmount,
      }],
      subtotal: safeAmount,
      totalAmount: safeAmount,
      paymentMethod: safePaymentMethod,
    }
    setSelectedInvoiceData(invoiceData)
    setInvoiceOpen(true)
  }

  const revenue = data?.revenue || { today: 0, thisWeek: 0, thisMonth: 0, total: 0 }
  const payments = data?.payments || []

  const summaryCards = [
    { title: 'Today', value: revenue.today, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'This Week', value: revenue.thisWeek, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'This Month', value: revenue.thisMonth, icon: Calendar, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Total', value: revenue.total, icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  // Export columns
  const exportColumns = [
    { key: 'receiptNumber', label: 'Receipt #' },
    { key: 'customerName', label: 'Customer' },
    { key: 'orderNumber', label: 'Order' },
    { key: 'amount', label: 'Amount (Rs.)' },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'createdAt', label: 'Date' },
  ]

  const exportData = payments.map((p: Record<string, unknown>) => ({
    receiptNumber: (p.receiptNumber as string) || 'N/A',
    customerName: (p.customer as Record<string, string>)?.fullName || '-',
    orderNumber: (p.order as Record<string, string>)?.orderNumber || '-',
    amount: ((p.amount as number) || 0).toLocaleString(),
    paymentMethod: (p.paymentMethod as string) || 'cash',
    createdAt: new Date((p.createdAt as string) || new Date()).toLocaleDateString(),
  }))

  return (
    <div className="space-y-4">
      {/* Revenue Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="border-0 shadow-sm rounded-2xl">
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-100 rounded-xl">
            <TabsTrigger value="records" className="rounded-lg text-xs">Payment Records</TabsTrigger>
            <TabsTrigger value="verification" className="rounded-lg text-xs">Verification Queue</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <DataExport
              data={exportData}
              filename="jugnoo-payments"
              columns={exportColumns}
              title="Jugnoo Photostate - Payments Report"
            />
            <Button onClick={() => setShowForm(true)} className="gap-2 bg-[#1A3C5E] hover:bg-[#15304D] rounded-xl">
              <Plus className="w-4 h-4" />
              Record Payment
            </Button>
          </div>
        </div>

        <TabsContent value="records" className="mt-4">
          <Card className="border-0 shadow-sm rounded-2xl">
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
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-20">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={8} className="h-12 animate-pulse bg-muted/50" />
                        </TableRow>
                      ))
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                        const safeVerStatus = (payment.verificationStatus as string) || 'verified'
                        const isVerified = safeVerStatus === 'verified' || safeVerStatus === 'completed'
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
                          <TableCell>
                            <Badge className={`text-[9px] border-0 rounded-lg ${
                              isVerified ? 'bg-emerald-50 text-emerald-700' :
                              safeVerStatus === 'screenshot_uploaded' ? 'bg-amber-50 text-amber-700' :
                              safeVerStatus === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {isVerified ? '✓ Verified' :
                               safeVerStatus === 'screenshot_uploaded' ? '⏳ Pending' :
                               safeVerStatus === 'rejected' ? '✕ Rejected' :
                               safeVerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(safeCreatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {isVerified ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[10px] gap-1 text-[#1A3C5E] hover:bg-[#E8F0FE] rounded-lg"
                                onClick={() => handleOpenInvoice(payment)}
                              >
                                <FileText className="w-3 h-3" />
                                Invoice
                              </Button>
                            ) : (
                              <span className="text-[10px] text-[#9CA3AF]">—</span>
                            )}
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
        </TabsContent>

        <TabsContent value="verification" className="mt-4">
          <PaymentVerification />
        </TabsContent>
      </Tabs>

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        invoiceData={selectedInvoiceData}
        whatsappNumber="923001234567"
      />

      {/* Record Payment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1A3C5E]">Record Payment</DialogTitle>
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

            {/* Payment Screenshot Upload */}
            {(formData.paymentMethod === 'jazzcash' || formData.paymentMethod === 'easypaisa' || formData.paymentMethod === 'bank_transfer' || formData.paymentMethod === 'online') && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#F5A623]" />
                  Payment Screenshot (Optional)
                </Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500
                      file:mr-2 file:py-2 file:px-3
                      file:rounded-xl file:border-0
                      file:text-xs file:font-medium
                      file:bg-[#E8F0FE] file:text-[#1A3C5E]
                      hover:file:bg-[#d0e2f7]"
                  />
                </div>
                {screenshotFile && (
                  <p className="text-[10px] text-emerald-600 mt-1">✓ {screenshotFile.name} selected</p>
                )}
              </div>
            )}

            <div>
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.amount} className="bg-[#1A3C5E] hover:bg-[#15304D] rounded-xl">Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
