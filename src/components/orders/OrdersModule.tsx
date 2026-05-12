'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Filter, ArrowRight, Trash2, FileText, RefreshCw, CheckCircle2, Clock, XCircle, DollarSign, CreditCard, Printer, MessageCircle, Upload, Download, Link as LinkIcon } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

const statusFlow = ['pending', 'in_progress', 'ready', 'delivered']

type TabKey = 'manual-orders' | 'service-applications'

export function OrdersModule() {
  const { searchQuery } = useAppStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<TabKey>('service-applications')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null)
  const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null)
  const [appStatusFilter, setAppStatusFilter] = useState('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadApp, setUploadApp] = useState<ServiceApplication | null>(null)
  const [documentUrl, setDocumentUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailApp, setDetailApp] = useState<ServiceApplication | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Service Applications types
  interface ServiceApplication {
    id: string
    service_name: string
    service_type: string
    status: string
    payment_status: string
    payment_method: string | null
    transaction_id: string | null
    fee_amount: number
    applicant_name: string
    applicant_cnic: string | null
    applicant_phone: string | null
    applicant_whatsapp: string | null
    description: string | null
    personal_info: Record<string, string> | null
    notes: string | null
    result_document_url: string | null
    created_at: string
    updated_at: string
  }

  // Fetch service applications
  const { data: applications = [], isLoading: appsLoading, refetch: refetchApps } = useQuery({
    queryKey: ['service-applications-admin', appStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (appStatusFilter !== 'all') params.set('status', appStatusFilter)
      const res = await fetch(`/api/service-applications?${params}`)
      if (!res.ok) throw new Error('Failed')
      return res.json() as Promise<ServiceApplication[]>
    },
  })

  // Update application status/payment
  const updateAppMutation = useMutation({
    mutationFn: async ({ id, status, paymentStatus, notes, resultDocumentUrl }: { id: string; status?: string; paymentStatus?: string; notes?: string; resultDocumentUrl?: string }) => {
      const body: Record<string, unknown> = { id }
      if (status) body.status = status
      if (paymentStatus) body.paymentStatus = paymentStatus
      if (notes) body.notes = notes
      if (resultDocumentUrl !== undefined) body.resultDocumentUrl = resultDocumentUrl
      const res = await fetch('/api/service-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-applications-admin'] })
      toast({ title: 'Application updated!' })
    },
  })

  // Manual Orders (existing)
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

  const getAppStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'approved': return 'bg-emerald-100 text-emerald-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-amber-100 text-amber-800'
      case 'submitted': return 'bg-[#E8F0FE] text-[#1A3C5E]'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAppStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted'
      case 'pending': return 'Pending'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  const getNextAppStatus = (current: string) => {
    const flow = ['submitted', 'pending', 'in_progress', 'completed']
    const idx = flow.indexOf(current)
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null
  }

  // Generate and print invoice for admin
  const handleAdminInvoice = (app: ServiceApplication) => {
    const logoUrl = window.location.origin + '/jugnoo-photos-logo.jpg'
    const printContent = `
      <html><head><title>Invoice - ${app.service_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1C1C1E; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #003366; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-area { display: flex; align-items: center; gap: 12px; }
        .logo-img { width: 60px; height: auto; border-radius: 8px; }
        .logo-text { font-size: 20px; font-weight: bold; color: #003366; line-height: 1.2; }
        .logo-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
        .invoice-label { font-size: 14px; color: #6B7280; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .field { margin-bottom: 8px; }
        .field-label { font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-value { font-size: 14px; font-weight: 500; }
        .amount-section { background: linear-gradient(135deg, #F5F7FA, #E8F0FE); padding: 20px; border-radius: 12px; margin-top: 20px; text-align: right; border: 1px solid #003366/10; }
        .amount { font-size: 32px; font-weight: bold; color: #003366; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-submitted { background: #E8F0FE; color: #1A3C5E; }
        .status-pending { background: #FFF3D6; color: #F5A623; }
        .status-in_progress { background: #E8F0FE; color: #003366; }
        .status-completed { background: #E8F5E9; color: #2E7D32; }
        .footer { margin-top: 40px; font-size: 11px; color: #6B7280; text-align: center; border-top: 2px solid #003366; padding-top: 15px; }
        .footer-logo { width: 18px; height: 18px; vertical-align: middle; border-radius: 3px; margin-right: 4px; }
        .stamp { position: fixed; bottom: 80px; right: 60px; font-size: 48px; color: rgba(0,51,102,0.08); font-weight: bold; transform: rotate(-15deg); }
        .gold-accent { width: 100%; height: 3px; background: linear-gradient(90deg, #003366, #F5A623, #003366); border-radius: 2px; margin-bottom: 20px; }
      </style></head><body>
      <div class="gold-accent"></div>
      <div class="header">
        <div class="logo-area">
          <img src="${logoUrl}" alt="Jugnoo Photos" class="logo-img" />
          <div>
            <div class="logo-text">JUGNOO PHOTOSTATE</div>
            <div class="logo-sub">Chowk Azam, Layyah, Punjab</div>
            <div class="logo-sub" style="color:#F5A623;">AI-Powered Business Management</div>
          </div>
        </div>
        <div style="text-align:right"><div class="invoice-label">INVOICE</div><div style="font-size:12px;color:#6B7280;">#${app.id.slice(0,8).toUpperCase()}</div><div style="font-size:11px;color:#6B7280;">${new Date(app.created_at).toLocaleDateString()}</div></div>
      </div>
      <div class="grid">
        <div>
          <div class="field"><div class="field-label">Customer</div><div class="field-value">${app.applicant_name || 'N/A'}</div></div>
          <div class="field"><div class="field-label">CNIC</div><div class="field-value">${app.applicant_cnic || 'N/A'}</div></div>
          <div class="field"><div class="field-label">Phone</div><div class="field-value">${app.applicant_phone || 'N/A'}</div></div>
          ${app.applicant_whatsapp ? `<div class="field"><div class="field-label">WhatsApp</div><div class="field-value">${app.applicant_whatsapp}</div></div>` : ''}
        </div>
        <div>
          <div class="field"><div class="field-label">Service</div><div class="field-value">${app.service_name}</div></div>
          <div class="field"><div class="field-label">Type</div><div class="field-value">${app.service_type}</div></div>
          <div class="field"><div class="field-label">Status</div><div class="field-value"><span class="status-badge status-${app.status}">${app.status.replace(/_/g, ' ').toUpperCase()}</span></div></div>
          <div class="field"><div class="field-label">Payment</div><div class="field-value">${app.payment_status === 'paid' ? 'PAID' : 'UNPAID'}</div></div>
          ${app.transaction_id ? `<div class="field"><div class="field-label">Transaction ID</div><div class="field-value">${app.transaction_id}</div></div>` : ''}
          ${app.payment_method ? `<div class="field"><div class="field-label">Payment Method</div><div class="field-value">${app.payment_method}</div></div>` : ''}
        </div>
      </div>
      ${app.description ? `<div class="field"><div class="field-label">Description</div><div class="field-value">${app.description}</div></div>` : ''}
      ${app.personal_info && Object.keys(app.personal_info).length > 0 ? `<div style="margin-top:15px;padding:10px;background:#F9FAFB;border-radius:8px;"><div class="field-label" style="margin-bottom:8px;">Service Details</div>${Object.entries(app.personal_info).filter(([,v]) => v).map(([k,v]) => `<div style="font-size:12px;margin-bottom:4px;"><strong>${k}:</strong> ${v}</div>`).join('')}</div>` : ''}
      <div class="amount-section">
        <div style="font-size:12px;color:#6B7280;margin-bottom:5px;">Service Fee</div>
        <div class="amount">Rs. ${app.fee_amount?.toLocaleString()}</div>
      </div>
      <div class="stamp">ADMIN COPY</div>
      <div class="footer"><img src="${logoUrl}" alt="" class="footer-logo" /> Jugnoo Photostate · AI-Powered Business Management · Chowk Azam · ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
      </body></html>
    `
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Share invoice via WhatsApp
  const handleWhatsAppInvoice = (app: ServiceApplication) => {
    const phone = app.applicant_whatsapp || app.applicant_phone || ''
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    // Format: if starts with 0, replace with 92 (Pakistan)
    const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone.startsWith('92') ? cleanPhone : cleanPhone

    const invoiceText = `🧾 *JUGNOO PHOTOSTATE - Invoice*
━━━━━━━━━━━━━━━━━━━━━
📋 Invoice: #${app.id.slice(0,8).toUpperCase()}
📅 Date: ${new Date(app.created_at).toLocaleDateString()}

👤 *Customer:* ${app.applicant_name || 'N/A'}
🪪 CNIC: ${app.applicant_cnic || 'N/A'}
📱 Phone: ${app.applicant_phone || 'N/A'}

🔧 *Service:* ${app.service_name}
📂 Type: ${app.service_type}
📊 Status: ${app.status.replace(/_/g, ' ').toUpperCase()}
💰 Payment: ${app.payment_status === 'paid' ? '✅ PAID' : '❌ UNPAID'}
${app.transaction_id ? `🔑 Trx ID: ${app.transaction_id}` : ''}
${app.payment_method ? `💳 Method: ${app.payment_method}` : ''}

💵 *Amount: Rs. ${app.fee_amount?.toLocaleString()}*

━━━━━━━━━━━━━━━━━━━━━
📸 _Jugnoo Photostate_
📍 _Chowk Azam, Layyah, Punjab_
🤖 _AI-Powered Business Management_`

    const url = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(invoiceText)}`
      : `https://wa.me/?text=${encodeURIComponent(invoiceText)}`
    window.open(url, '_blank')
  }

  // Open WhatsApp chat with customer
  const handleWhatsAppChat = (app: ServiceApplication) => {
    const phone = app.applicant_whatsapp || app.applicant_phone || ''
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone.startsWith('92') ? cleanPhone : cleanPhone
    const url = formattedPhone
      ? `https://wa.me/${formattedPhone}`
      : 'https://wa.me/'
    window.open(url, '_blank')
  }

  // Upload file to Supabase Storage
  const handleFileUpload = async (file: File, appId: string) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('appId', appId)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (!res.ok) {
        toast({ title: 'Upload failed', description: result.error, variant: 'destructive' })
        return null
      }
      return result.url
    } catch (err) {
      toast({ title: 'Upload failed', variant: 'destructive' })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Handle upload dialog submit
  const handleUploadSubmit = async () => {
    if (!uploadApp) return

    let finalUrl = documentUrl

    // If user selected a file, upload it
    const fileInput = fileInputRef.current
    if (fileInput?.files && fileInput.files.length > 0) {
      const uploadedUrl = await handleFileUpload(fileInput.files[0], uploadApp.id)
      if (uploadedUrl) {
        finalUrl = uploadedUrl
      } else {
        return
      }
    }

    if (!finalUrl) {
      toast({ title: 'Please provide a document URL or upload a file', variant: 'destructive' })
      return
    }

    // Update the application with the document URL and mark as completed
    updateAppMutation.mutate({
      id: uploadApp.id,
      status: 'completed',
      resultDocumentUrl: finalUrl,
    })
    setUploadDialogOpen(false)
    setUploadApp(null)
    setDocumentUrl('')
  }

  // Handle advancing status with upload option on completion
  const handleAdvanceStatus = (app: ServiceApplication) => {
    const nextStatus = getNextAppStatus(app.status)
    if (!nextStatus) return

    if (nextStatus === 'completed') {
      // Open upload dialog instead of directly completing
      setUploadApp(app)
      setDocumentUrl('')
      setUploadDialogOpen(true)
    } else {
      updateAppMutation.mutate({ id: app.id, status: nextStatus })
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('service-applications')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'service-applications'
              ? 'bg-[#003366] text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />
          Customer Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('manual-orders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'manual-orders'
              ? 'bg-[#003366] text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-1.5" />
          Manual Orders ({orders.length})
        </button>
      </div>

      {/* SERVICE APPLICATIONS TAB */}
      {activeTab === 'service-applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchApps()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          {appsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#003366] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#003366]" />
                <p className="text-muted-foreground">No customer applications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app: ServiceApplication) => (
                <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    {/* Top row: icon + info + badges */}
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#003366] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1C1C1E] truncate">{app.service_name}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {app.applicant_name} · {app.service_type} · {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        {app.applicant_phone && (
                          <p className="text-xs text-[#6B7280] mt-0.5">Phone: {app.applicant_phone}</p>
                        )}
                        {app.transaction_id && (
                          <p className="text-xs text-[#F5A623] mt-0.5 font-medium">Trx ID: {app.transaction_id}</p>
                        )}
                        {app.payment_method && (
                          <p className="text-[10px] text-[#6B7280]">Payment: {app.payment_method}</p>
                        )}
                      </div>
                      {/* Right side - Status + Payment + Amount */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className={`${getAppStatusColor(app.status)} text-[10px] border-0 rounded-lg px-2`}>
                          {getAppStatusLabel(app.status)}
                        </Badge>
                        <Badge className={`text-[10px] border-0 rounded-lg px-2 ${
                          app.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {app.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                        </Badge>
                        <span className="text-sm font-bold text-[#003366]">Rs {app.fee_amount?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action buttons row */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap pl-0 sm:pl-[52px]">
                      {/* Mark as Paid button */}
                      {app.payment_status !== 'paid' && (
                        <Button
                          size="sm"
                          className="h-8 min-w-[44px] px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-lg"
                          onClick={() => updateAppMutation.mutate({ id: app.id, paymentStatus: 'paid' })}
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Mark Paid
                        </Button>
                      )}

                      {/* Advance Status */}
                      {getNextAppStatus(app.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 min-w-[44px] px-2.5 text-[11px] border-[#003366] text-[#003366] gap-1 rounded-lg"
                          onClick={() => handleAdvanceStatus(app)}
                        >
                          <ArrowRight className="w-3.5 h-3.5" /> {getNextAppStatus(app.status)}
                        </Button>
                      )}

                      {/* Invoice - Print */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 min-w-[44px] px-2.5 text-[11px] border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white gap-1 rounded-lg"
                        onClick={() => handleAdminInvoice(app)}
                      >
                        <Printer className="w-3.5 h-3.5" /> Invoice
                      </Button>

                      {/* WhatsApp Invoice */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 min-w-[44px] px-2.5 text-[11px] border-green-300 text-green-700 hover:bg-green-600 hover:text-white gap-1 rounded-lg"
                        onClick={() => handleWhatsAppInvoice(app)}
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </Button>

                      {/* WhatsApp Chat - direct chat */}
                      {(app.applicant_whatsapp || app.applicant_phone) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 min-w-[44px] px-2.5 text-[11px] border-green-200 text-green-600 hover:bg-green-500 hover:text-white gap-1 rounded-lg"
                          onClick={() => handleWhatsAppChat(app)}
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Chat
                        </Button>
                      )}

                      {/* Upload / Deliver - only when in_progress or completed without document */}
                      {(app.status === 'in_progress' || (app.status === 'completed' && !app.result_document_url)) && (
                        <Button
                          size="sm"
                          className="h-8 min-w-[44px] px-2.5 text-[11px] bg-[#003366] hover:bg-[#002244] text-white gap-1 rounded-lg"
                          onClick={() => {
                            setUploadApp(app)
                            setDocumentUrl(app.result_document_url || '')
                            setUploadDialogOpen(true)
                          }}
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Work
                        </Button>
                      )}

                      {/* View/Download delivered document */}
                      {app.result_document_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 min-w-[44px] px-2.5 text-[11px] border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white gap-1 rounded-lg"
                          onClick={() => window.open(app.result_document_url!, '_blank')}
                        >
                          <Download className="w-3.5 h-3.5" /> View File
                        </Button>
                      )}
                    </div>

                    {/* Personal Info Preview */}
                    {app.personal_info && Object.keys(app.personal_info).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 pl-0 sm:pl-[52px]">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-[#6B7280] hover:text-[#003366]">View Details</summary>
                          <div className="mt-1.5 grid grid-cols-2 gap-1">
                            {Object.entries(app.personal_info).map(([key, value]) => (
                              value && <span key={key} className="text-[#6B7280]"><span className="font-medium text-[#1C1C1E]">{key}:</span> {value}</span>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                    {app.notes && (
                      <p className="text-xs text-[#6B7280] mt-2 bg-[#F5F7FA] px-2 py-1 rounded pl-0 sm:pl-[52px]">Notes: {app.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MANUAL ORDERS TAB */}
      {activeTab === 'manual-orders' && (
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
                          No manual orders found
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
      )}

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003366]">Upload Completed Work</DialogTitle>
            <DialogDescription>
              {uploadApp ? `Upload or link the completed work for: ${uploadApp.service_name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Option 1: Upload file */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1C1C1E]">Upload File (PDF, Image, Document)</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  className="block w-full text-sm text-gray-500
                    file:mr-2 file:py-2 file:px-3
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-[#003366] file:text-white
                    hover:file:bg-[#002244]
                    file:cursor-pointer file:min-h-[44px]"
                />
              </div>
              <p className="text-[10px] text-[#6B7280]">Max 10MB. Supported: PDF, Images, Word, Excel</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-[#6B7280]">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Option 2: Paste URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1C1C1E]">Paste Document URL</Label>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#6B7280] shrink-0" />
                <Input
                  placeholder="https://example.com/document.pdf"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="border-gray-200 focus:border-[#003366]"
                />
              </div>
              <p className="text-[10px] text-[#6B7280]">Google Drive, Dropbox, or any direct link</p>
            </div>

            {/* WhatsApp delivery option */}
            {uploadApp && (uploadApp.applicant_whatsapp || uploadApp.applicant_phone) && (
              <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700">
                  After uploading, you can share this with the customer on WhatsApp using the WhatsApp button.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setUploadDialogOpen(false); setUploadApp(null); setDocumentUrl('') }} className="border-gray-200">
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={isUploading}
              className="bg-[#003366] hover:bg-[#002244] text-white min-w-[120px]"
            >
              {isUploading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-1.5" /> Upload & Complete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
