'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  BarChart3, Users, FileText, CreditCard, Settings,
  DollarSign, TrendingUp, Eye, CheckCircle, XCircle,
  Clock, Edit, Save, Building, Smartphone,
  ArrowLeft, Plus, Trash2, Sparkles,
  MessageCircle, Upload, Printer, Download,
  RefreshCw, Filter, Loader2, Shield, Zap,
  CheckCircle2, AlertCircle, Paperclip, Send,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { serviceCategories } from '@/lib/data'

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
  applicant_cnic: string
  applicant_phone: string
  description: string
  personal_info: Record<string, string> | null
  notes: string
  result_document_url: string | null
  created_at: string
  updated_at: string
}

const statusSteps = [
  { key: 'submitted', label: 'Submitted', labelUrdu: 'جمع شدہ' },
  { key: 'pending', label: 'Pending', labelUrdu: 'زیر التوا' },
  { key: 'in_progress', label: 'In Progress', labelUrdu: 'جاری' },
  { key: 'completed', label: 'Completed', labelUrdu: 'مکمل' },
]

export default function AdminDashboard() {
  const paymentConfig = useAppStore((s) => s.paymentConfig)
  const updatePaymentConfig = useAppStore((s) => s.updatePaymentConfig)
  const servicePrices = useAppStore((s) => s.servicePrices)
  const setServicePrice = useAppStore((s) => s.setServicePrice)

  const queryClient = useQueryClient()

  // Local state
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editPayment, setEditPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState(paymentConfig)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState<number>(0)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadAppId, setUploadAppId] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [payApp, setPayApp] = useState<ServiceApplication | null>(null)
  const [payTransactionId, setPayTransactionId] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusChangeApp, setStatusChangeApp] = useState<ServiceApplication | null>(null)
  const [newStatus, setNewStatus] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all applications (no userId = all for admin)
  const { data: applications = [], isLoading, refetch } = useQuery<ServiceApplication[]>({
    queryKey: ['admin-applications', statusFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
        const res = await fetch(`/api/service-applications?${params}`)
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } catch {
        return []
      }
    },
    retry: false,
  })

  // Also fetch all applications without filter for stats
  const { data: allApplications = [] } = useQuery<ServiceApplication[]>({
    queryKey: ['admin-all-applications'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/service-applications')
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } catch {
        return []
      }
    },
    retry: false,
  })

  // Mutation for updating application status
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch('/api/service-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-applications'] })
      toast.success('Status update ho gaya / Status updated')
    },
    onError: () => {
      toast.error('Status update nahi hua / Status update failed')
    },
  })

  // Mutation for updating payment status
  const paymentMutation = useMutation({
    mutationFn: async ({ id, paymentStatus, transactionId, paymentMethod }: {
      id: string; paymentStatus: string; transactionId?: string; paymentMethod?: string
    }) => {
      const body: Record<string, string> = { id, paymentStatus }
      if (transactionId) body.transactionId = transactionId
      if (paymentMethod) body.paymentMethod = paymentMethod
      const res = await fetch('/api/service-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to update payment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-applications'] })
      toast.success('Payment status update ho gayi / Payment status updated')
    },
    onError: () => {
      toast.error('Payment update nahi hui / Payment update failed')
    },
  })

  // Mutation for uploading result document
  const uploadMutation = useMutation({
    mutationFn: async ({ id, file, appId }: { id: string; file: File; appId: string }) => {
      // Step 1: Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('appId', appId)

      setUploadProgress(10)
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      setUploadProgress(60)

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || 'Upload failed')
      }

      const { url } = await uploadRes.json()
      setUploadProgress(80)

      // Step 2: Save URL to application
      const updateRes = await fetch('/api/service-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resultDocumentUrl: url }),
      })

      if (!updateRes.ok) throw new Error('Failed to save document URL')
      setUploadProgress(100)
      return updateRes.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-applications'] })
      toast.success('Document upload ho gaya / Document uploaded successfully')
      setUploadDialogOpen(false)
      setUploadFile(null)
      setUploadProgress(0)
    },
    onError: (error) => {
      toast.error(error.message || 'Upload nahi hua / Upload failed')
      setUploadProgress(0)
    },
  })

  // Stats
  const totalApps = allApplications.length
  const pendingApps = allApplications.filter(a => a.status === 'submitted' || a.status === 'pending').length
  const completedApps = allApplications.filter(a => a.status === 'completed').length
  const totalRevenue = allApplications
    .filter(a => a.payment_status === 'paid')
    .reduce((sum, a) => sum + (a.fee_amount || 0), 0)

  // Handlers
  const handleSavePayment = () => {
    updatePaymentConfig(paymentForm)
    setEditPayment(false)
    toast.success('Payment details update ho gayi / Payment details updated')
  }

  const handleSavePrice = (serviceId: string) => {
    setServicePrice(serviceId, editingPrice)
    setEditingServiceId(null)
    toast.success('Price update ho gayi / Price updated')
  }

  const handleStatusChange = (app: ServiceApplication, targetStatus: string) => {
    if (targetStatus === 'completed') {
      // Show upload dialog instead of directly completing
      setStatusChangeApp(app)
      setNewStatus(targetStatus)
      setStatusDialogOpen(true)
    } else {
      statusMutation.mutate({ id: app.id, status: targetStatus })
    }
  }

  const handleStatusConfirm = () => {
    if (!statusChangeApp || !newStatus) return
    statusMutation.mutate({ id: statusChangeApp.id, status: newStatus })
    setStatusDialogOpen(false)

    // If changing to completed, open upload dialog
    if (newStatus === 'completed') {
      setUploadAppId(statusChangeApp.id)
      setUploadDialogOpen(true)
    }
  }

  const handleUploadSubmit = () => {
    if (!uploadAppId || !uploadFile) {
      toast.error('File select karein / Please select a file')
      return
    }
    setIsUploading(true)
    uploadMutation.mutate(
      { id: uploadAppId, file: uploadFile, appId: uploadAppId },
      {
        onSettled: () => setIsUploading(false),
      }
    )
  }

  const handleMarkAsPaid = (app: ServiceApplication) => {
    setPayApp(app)
    setPayTransactionId('')
    setPayMethod('cash')
    setPayDialogOpen(true)
  }

  const handlePayConfirm = () => {
    if (!payApp) return
    paymentMutation.mutate({
      id: payApp.id,
      paymentStatus: 'paid',
      transactionId: payTransactionId || undefined,
      paymentMethod: payMethod,
    })
    setPayDialogOpen(false)
  }

  // Invoice generation
  const handlePrintInvoice = (app: ServiceApplication) => {
    const printContent = `
      <html><head><title>Invoice - ${app.service_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1C1C1E; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #003366; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #003366; }
        .invoice-label { font-size: 14px; color: #6B7280; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .field { margin-bottom: 8px; }
        .field-label { font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-value { font-size: 14px; font-weight: 500; }
        .amount-section { background: #F5F7FA; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: right; }
        .amount { font-size: 28px; font-weight: bold; color: #003366; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-submitted { background: #E8F0FE; color: #1A3C5E; }
        .status-pending { background: #FFF3D6; color: #F5A623; }
        .status-in_progress { background: #E8F0FE; color: #003366; }
        .status-completed { background: #E8F5E9; color: #2E7D32; }
        .footer { margin-top: 40px; font-size: 11px; color: #6B7280; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 15px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <div><div class="logo">JUGNOO PHOTOSTATE</div><div style="font-size:12px;color:#6B7280;">Chowk Azam, Layyah, Punjab</div></div>
        <div style="text-align:right"><div class="invoice-label">INVOICE / رسید</div><div style="font-size:12px;color:#6B7280;">#${app.id.slice(0,8).toUpperCase()}</div><div style="font-size:11px;color:#6B7280;">${new Date(app.created_at).toLocaleDateString('en-PK')}</div></div>
      </div>
      <div class="grid">
        <div>
          <div class="field"><div class="field-label">Customer / گاہک</div><div class="field-value">${app.applicant_name || 'N/A'}</div></div>
          <div class="field"><div class="field-label">CNIC / شناختی کارڈ</div><div class="field-value">${app.applicant_cnic || 'N/A'}</div></div>
          <div class="field"><div class="field-label">Phone / فون</div><div class="field-value">${app.applicant_phone || 'N/A'}</div></div>
        </div>
        <div>
          <div class="field"><div class="field-label">Service / سروس</div><div class="field-value">${app.service_name}</div></div>
          <div class="field"><div class="field-label">Status / حالت</div><div class="field-value"><span class="status-badge status-${app.status}">${app.status.replace(/_/g, ' ').toUpperCase()}</span></div></div>
          <div class="field"><div class="field-label">Payment / ادائیگی</div><div class="field-value">${app.payment_status === 'paid' ? '✅ PAID / ادا شدہ' : '❌ UNPAID / غیر ادا'}</div></div>
          ${app.transaction_id ? `<div class="field"><div class="field-label">Transaction ID / لین دین نمبر</div><div class="field-value">${app.transaction_id}</div></div>` : ''}
          ${app.payment_method ? `<div class="field"><div class="field-label">Payment Method / طریقہ ادائیگی</div><div class="field-value">${app.payment_method}</div></div>` : ''}
        </div>
      </div>
      ${app.description ? `<div class="field"><div class="field-label">Description / تفصیل</div><div class="field-value">${app.description}</div></div>` : ''}
      <div class="amount-section">
        <div style="font-size:12px;color:#6B7280;margin-bottom:5px;">Service Fee / سروس فیس</div>
        <div class="amount">Rs. ${app.fee_amount?.toLocaleString()}</div>
      </div>
      <div class="footer">Jugnoo Photostate · AI-Powered Business Management · Chowk Azam · https://jugnoosmartportal.vercel.app</div>
      </body></html>
    `
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
    }
  }

  // WhatsApp receipt
  const handleWhatsAppReceipt = (app: ServiceApplication) => {
    const phone = (app.applicant_phone || '').replace(/[^0-9]/g, '')
    // Ensure phone starts with country code
    const formattedPhone = phone.startsWith('0') ? '92' + phone.substring(1) : phone.startsWith('92') ? phone : '92' + phone

    const message = `Assalam o Alaikum! 📋

*Jugnoo Photostate - Payment Receipt*
━━━━━━━━━━━━━━━━━
Service: ${app.service_name}
Amount: Rs. ${app.fee_amount?.toLocaleString()}
Status: ${app.status.replace(/_/g, ' ').toUpperCase()}
Transaction ID: ${app.transaction_id || 'N/A'}
Date: ${new Date(app.created_at).toLocaleDateString('en-PK')}
━━━━━━━━━━━━━━━━━
Thank you for choosing Jugnoo! 🙏

https://jugnoosmartportal.vercel.app`

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  // WhatsApp completed work
  const handleWhatsAppCompleted = (app: ServiceApplication) => {
    const phone = (app.applicant_phone || '').replace(/[^0-9]/g, '')
    const formattedPhone = phone.startsWith('0') ? '92' + phone.substring(1) : phone.startsWith('92') ? phone : '92' + phone

    const message = `Assalam o Alaikum! ✅

*Jugnoo Photostate - Order Complete*
━━━━━━━━━━━━━━━━━
Service: ${app.service_name}
Amount: Rs. ${app.fee_amount?.toLocaleString()}
Status: COMPLETED ✅

Your work is ready! Download here:
${app.result_document_url || 'Document URL not available'}
━━━━━━━━━━━━━━━━━
Thank you for choosing Jugnoo! 🙏

https://jugnoosmartportal.vercel.app`

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  // Get all services flat for Prices tab
  const allServices = serviceCategories.flatMap((cat) =>
    cat.services.map((svc) => ({
      ...svc,
      categoryName: cat.name,
      categoryColor: cat.color,
    }))
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-[10px] rounded-lg"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'approved':
        return <Badge className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-[10px] rounded-lg"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'in_progress':
        return <Badge className="bg-[#E8F0FE] text-[#003E6B] border-0 text-[10px] rounded-lg"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>
      case 'pending':
        return <Badge className="bg-[#FFF3D6] text-[#F5A623] border-0 text-[10px] rounded-lg"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'submitted':
        return <Badge className="bg-[#E8F0FE] text-[#1A3C5E] border-0 text-[10px] rounded-lg"><FileText className="w-3 h-3 mr-1" />Submitted</Badge>
      case 'rejected':
        return <Badge className="bg-[#FFEBEE] text-[#E53935] border-0 text-[10px] rounded-lg"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-[#E8F0FE] text-[#1A3C5E] border-0 text-[10px] rounded-lg"><Clock className="w-3 h-3 mr-1" />{status}</Badge>
    }
  }

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] border-0 rounded-lg">✅ Paid</Badge>
      case 'partial':
        return <Badge className="bg-[#FFF3D6] text-[#F5A623] text-[10px] border-0 rounded-lg">Partial</Badge>
      default:
        return <Badge className="bg-[#FFEBEE] text-[#E53935] text-[10px] border-0 rounded-lg">Unpaid</Badge>
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'government': return <Shield className="w-4 h-4" />
      case 'notarisation': return <Zap className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getServiceStyle = (type: string) => {
    switch (type) {
      case 'government': return { bg: '#E8F0FE', color: '#1A3C5E' }
      case 'notarisation': return { bg: '#FFF3D6', color: '#F5A623' }
      case 'cv_builder': return { bg: '#FFF3E0', color: '#E65100' }
      default: return { bg: '#F3F4F6', color: '#6B7280' }
    }
  }

  // Status step progress
  const renderStatusProgress = (status: string) => {
    const currentIdx = statusSteps.findIndex(s => s.key === status)
    const activeIdx = currentIdx >= 0 ? currentIdx : 0
    const progressPercent = (activeIdx / (statusSteps.length - 1)) * 100

    return (
      <div className="mt-2 space-y-1">
        <Progress value={progressPercent} className="h-1.5 bg-gray-200" />
        <div className="flex items-center gap-0.5">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx < activeIdx
            const isActive = idx === activeIdx
            return (
              <div key={step.key} className="flex items-center">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold transition-all ${
                  isCompleted ? 'bg-emerald-500 text-white' :
                  isActive ? 'bg-[#003366] text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`w-3 h-0.5 ${idx < activeIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
          <span className="text-[8px] ml-1 font-medium text-[#003366]">{statusSteps[activeIdx]?.label}</span>
        </div>
      </div>
    )
  }

  // Get next possible statuses
  const getNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case 'submitted': return ['pending', 'in_progress', 'completed', 'rejected']
      case 'pending': return ['in_progress', 'completed', 'rejected']
      case 'in_progress': return ['completed', 'rejected']
      case 'completed': return ['in_progress']
      case 'rejected': return ['submitted', 'pending', 'in_progress']
      default: return ['submitted', 'pending', 'in_progress', 'completed']
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted'
      case 'pending': return 'Pending'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Card - UBL Digital Style */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#F5A623]/10 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-[#F5A623] text-sm font-medium mb-1">Admin Panel / ایڈمن پینل</p>
          <p className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</p>
          <p className="text-white/70 text-sm">Manage services, orders, prices & payments</p>
          <div className="flex items-center gap-3 mt-4">
            <Button
              size="sm"
              className="bg-[#F5A623] hover:bg-[#FFB300] text-[#1A3C5E] font-semibold rounded-xl h-10 px-5 shadow-sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl h-10 px-5"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Stats
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Applications', value: totalApps, color: '#1A3C5E', bgColor: '#E8F0FE', icon: FileText },
          { label: 'Pending', value: pendingApps, color: '#F5A623', bgColor: '#FFF3D6', icon: Clock },
          { label: 'Completed', value: completedApps, color: '#2E7D32', bgColor: '#E8F5E9', icon: CheckCircle },
          { label: 'Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: '#7B1FA2', bgColor: '#F3E5F5', icon: TrendingUp },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bgColor }}>
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6B7280] font-medium">{stat.label}</p>
                      <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F5F7FA] h-auto p-1.5 rounded-xl">
          <TabsTrigger value="overview" className="text-xs touch-target data-[state=active]:bg-[#1A3C5E] data-[state=active]:text-white rounded-lg data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs touch-target data-[state=active]:bg-[#1A3C5E] data-[state=active]:text-white rounded-lg data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-1" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="prices" className="text-xs touch-target data-[state=active]:bg-[#1A3C5E] data-[state=active]:text-white rounded-lg data-[state=active]:shadow-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            Prices
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs touch-target data-[state=active]:bg-[#1A3C5E] data-[state=active]:text-white rounded-lg data-[state=active]:shadow-sm">
            <CreditCard className="w-4 h-4 mr-1" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base text-[#1C1C1E]">Recent Applications / حالیہ درخواستیں</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1A3C5E]" />
                </div>
              ) : allApplications.length === 0 ? (
                <div className="text-center py-10 text-[#6B7280]">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-[#1A3C5E]/10" />
                  <p className="text-sm">Koi application nahi / No applications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allApplications.slice(0, 5).map((app) => {
                    const svcStyle = getServiceStyle(app.service_type)
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: svcStyle.bg, color: svcStyle.color }}>
                            {getServiceIcon(app.service_type)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1C1C1E] text-sm">{app.service_name}</p>
                            <p className="text-[10px] text-[#6B7280]">
                              {app.applicant_name} | {new Date(app.created_at).toLocaleDateString('en-PK')} | Rs. {app.fee_amount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(app.status)}
                          {getPaymentBadge(app.payment_status)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab - MAIN FEATURE */}
        <TabsContent value="orders" className="space-y-4">
          {/* Filter bar */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm font-medium text-[#1C1C1E]">Filter by Status:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                    className={`h-8 rounded-lg text-xs ${statusFilter === 'all' ? 'bg-[#1A3C5E] text-white' : 'border-gray-200 text-[#6B7280]'}`}
                  >
                    All ({allApplications.length})
                  </Button>
                  {['submitted', 'pending', 'in_progress', 'completed', 'rejected'].map(s => (
                    <Button
                      key={s}
                      size="sm"
                      variant={statusFilter === s ? 'default' : 'outline'}
                      onClick={() => setStatusFilter(s)}
                      className={`h-8 rounded-lg text-xs ${statusFilter === s ? 'bg-[#1A3C5E] text-white' : 'border-gray-200 text-[#6B7280]'}`}
                    >
                      {getStatusLabel(s)} ({allApplications.filter(a => a.status === s).length})
                    </Button>
                  ))}
                  <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200" onClick={() => refetch()}>
                    <RefreshCw className="w-3 h-3 text-[#6B7280]" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A3C5E]" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-20 h-20 mx-auto mb-4 opacity-10 text-[#1A3C5E]" />
              <h3 className="text-xl font-semibold text-[#1C1C1E]">No applications found</h3>
              <p className="text-[#6B7280] mb-4">Koi application nahi hai is filter mein</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const svcStyle = getServiceStyle(app.service_type)
                const isPaid = app.payment_status === 'paid'
                const isCompleted = app.status === 'completed'
                const hasDocument = !!app.result_document_url
                const nextStatuses = getNextStatuses(app.status)

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow ${
                      !isPaid ? 'ring-1 ring-[#F5A623]/30' : ''
                    }`}>
                      <CardContent className="p-4 sm:p-5">
                        {/* Header row */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: svcStyle.bg, color: svcStyle.color }}
                          >
                            {getServiceIcon(app.service_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-[#1C1C1E] text-sm">{app.service_name}</p>
                                <p className="text-[10px] text-[#6B7280] mt-0.5">
                                  {app.service_type} · #{app.id.slice(0,8).toUpperCase()} · {new Date(app.created_at).toLocaleDateString('en-PK')}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                {getStatusBadge(app.status)}
                                {getPaymentBadge(app.payment_status)}
                              </div>
                            </div>

                            {/* Customer info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                              <div>
                                <span className="text-[#6B7280]">Name:</span>
                                <p className="font-medium text-[#1C1C1E] truncate">{app.applicant_name || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#6B7280]">CNIC:</span>
                                <p className="font-medium text-[#1C1C1E] truncate">{app.applicant_cnic || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#6B7280]">Phone:</span>
                                <p className="font-medium text-[#1C1C1E] truncate">{app.applicant_phone || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#6B7280]">Amount:</span>
                                <p className="font-bold text-[#1A3C5E]">Rs. {app.fee_amount?.toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Transaction ID */}
                            {app.transaction_id && (
                              <p className="text-[10px] text-[#F5A623] font-medium mt-1">
                                Trx ID: {app.transaction_id} {app.payment_method ? `(${app.payment_method})` : ''}
                              </p>
                            )}

                            {/* Status Progress */}
                            {renderStatusProgress(app.status)}

                            {/* Notes */}
                            {app.notes && (
                              <p className="text-[10px] text-[#6B7280] bg-[#F5F7FA] px-2 py-1 rounded-lg inline-block mt-2">
                                Note: {app.notes}
                              </p>
                            )}

                            {/* Result document link */}
                            {isCompleted && hasDocument && (
                              <div className="mt-2 flex items-center gap-2">
                                <Paperclip className="w-3 h-3 text-[#2E7D32]" />
                                <a
                                  href={app.result_document_url!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#003E6B] underline hover:text-[#1A3C5E]"
                                >
                                  View Completed Document
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap pl-0 sm:pl-[56px]">
                          {/* Status Change Dropdown */}
                          <Select
                            onValueChange={(val) => handleStatusChange(app, val)}
                            disabled={statusMutation.isPending}
                          >
                            <SelectTrigger className="h-8 w-auto min-w-[120px] rounded-lg border-[#1A3C5E]/20 text-[11px] text-[#1A3C5E]" size="sm">
                              <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {nextStatuses.map(s => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s === 'completed' ? '✅ ' : s === 'rejected' ? '❌ ' : '🔄 '}{getStatusLabel(s)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Mark as Paid */}
                          {!isPaid && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(app)}
                              disabled={paymentMutation.isPending}
                              className="h-8 min-w-[44px] px-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[11px] rounded-lg"
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Mark Paid
                            </Button>
                          )}

                          {/* Invoice button - show when paid */}
                          {isPaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 min-w-[44px] px-3 border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white text-[11px] rounded-lg"
                              onClick={() => handlePrintInvoice(app)}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Invoice
                            </Button>
                          )}

                          {/* Print Invoice */}
                          {isPaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 min-w-[44px] px-3 border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white text-[11px] rounded-lg"
                              onClick={() => handlePrintInvoice(app)}
                            >
                              <Printer className="w-3 h-3 mr-1" />
                              Print
                            </Button>
                          )}

                          {/* WhatsApp Receipt - show when paid */}
                          {isPaid && (
                            <Button
                              size="sm"
                              className="h-8 min-w-[44px] px-3 bg-[#25D366] hover:bg-[#1DA851] text-white text-[11px] rounded-lg"
                              onClick={() => handleWhatsAppReceipt(app)}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              WhatsApp
                            </Button>
                          )}

                          {/* Upload Work button - when completed */}
                          {isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 min-w-[44px] px-3 border-[#F5A623]/30 text-[#F5A623] hover:bg-[#F5A623] hover:text-[#1A3C5E] text-[11px] rounded-lg"
                              onClick={() => {
                                setUploadAppId(app.id)
                                setUploadFile(null)
                                setUploadProgress(0)
                                setUploadDialogOpen(true)
                              }}
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              {hasDocument ? 'Re-upload' : 'Upload Work'}
                            </Button>
                          )}

                          {/* Send via WhatsApp - when completed + has document */}
                          {isCompleted && hasDocument && (
                            <Button
                              size="sm"
                              className="h-8 min-w-[44px] px-3 bg-[#25D366] hover:bg-[#1DA851] text-white text-[11px] rounded-lg"
                              onClick={() => handleWhatsAppCompleted(app)}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Send via WhatsApp
                            </Button>
                          )}

                          {/* Download Document - when has result */}
                          {isCompleted && hasDocument && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 min-w-[44px] px-3 border-[#2E7D32]/30 text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white text-[11px] rounded-lg"
                              onClick={() => window.open(app.result_document_url!, '_blank')}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Prices Tab */}
        <TabsContent value="prices" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base text-[#1C1C1E]">Service Prices / سروس کی قیمتیں</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-2">
                  {allServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: service.categoryColor }}
                        />
                        <div>
                          <p className="font-medium text-[#1C1C1E] text-sm">{service.name}</p>
                          <p className="text-[10px] text-[#6B7280]">{service.categoryName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingServiceId === service.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(parseInt(e.target.value) || 0)}
                              className="w-24 h-8 text-sm rounded-xl"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSavePrice(service.id)}
                              className="bg-[#1A3C5E] text-white h-8 rounded-xl"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1A3C5E] text-sm">
                              Rs. {servicePrices[service.id] ?? service.price}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingServiceId(service.id)
                                setEditingPrice(servicePrices[service.id] ?? service.price)
                              }}
                              className="h-8 w-8 p-0 rounded-lg"
                            >
                              <Edit className="w-4 h-4 text-[#6B7280]" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Config Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1C1C1E]">Payment Details / ادائیگی کی تفصیلات</CardTitle>
                {!editPayment ? (
                  <Button size="sm" onClick={() => setEditPayment(true)} className="bg-[#1A3C5E] text-white rounded-xl h-8">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSavePayment} className="bg-[#2E7D32] text-white rounded-xl h-8">
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditPayment(false)} className="rounded-xl h-8">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-[#1C1C1E]">JazzCash</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">JazzCash Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.jazzCashNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, jazzCashNumber: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.jazzCashNumber}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-[#1C1C1E]">EasyPaisa</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">EasyPaisa Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.easyPaisaNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, easyPaisaNumber: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.easyPaisaNumber}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center">
                    <Building className="w-5 h-5 text-[#1A3C5E]" />
                  </div>
                  <h3 className="font-semibold text-[#1C1C1E]">Bank Transfer</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">Bank Name</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.bankName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">Account Number</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankAccount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankAccount: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.bankAccount}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs">Account Title</Label>
                  {editPayment ? (
                    <Input
                      value={paymentForm.bankTitle}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankTitle: e.target.value })}
                      className="h-12 bg-[#F5F7FA] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl"
                    />
                  ) : (
                    <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{paymentConfig.bankTitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1A3C5E]">Upload Completed Work / مکمل کام اپلوڈ کریں</DialogTitle>
            <DialogDescription className="sr-only">Upload the completed document for this application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[#1C1C1E] text-sm font-medium">Select File</Label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setUploadFile(file)
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-dashed border-2 border-[#1A3C5E]/20 hover:border-[#1A3C5E] rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2 text-[#1A3C5E]" />
                  <span className="text-sm text-[#6B7280]">
                    {uploadFile ? uploadFile.name : 'Click to select file'}
                  </span>
                </Button>
              </div>
              <p className="text-[10px] text-[#6B7280]">
                Accepted: PDF, Images (JPG, PNG, GIF), Documents (DOC, DOCX, XLS, XLSX, TXT) · Max 10MB
              </p>
            </div>

            {/* File preview */}
            {uploadFile && (
              <div className="p-3 bg-[#F5F7FA] rounded-xl flex items-center gap-3">
                <Paperclip className="w-4 h-4 text-[#1A3C5E]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1C1E] truncate">{uploadFile.name}</p>
                  <p className="text-[10px] text-[#6B7280]">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setUploadFile(null)}
                >
                  <XCircle className="w-4 h-4 text-[#E53935]" />
                </Button>
              </div>
            )}

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B7280]">Uploading...</span>
                  <span className="font-medium text-[#1A3C5E]">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={isUploading} className="border-gray-200">
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || isUploading}
              className="bg-[#1A3C5E] hover:bg-[#15304D] text-white min-w-[44px]"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-1" />Upload</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#2E7D32]">Mark as Paid / ادائیگی شدہ</DialogTitle>
            <DialogDescription className="sr-only">Mark this application as paid</DialogDescription>
          </DialogHeader>
          {payApp && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-[#F5F7FA] rounded-xl">
                <p className="font-semibold text-[#1C1C1E] text-sm">{payApp.service_name}</p>
                <p className="text-xs text-[#6B7280]">{payApp.applicant_name} · Rs. {payApp.fee_amount?.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[#1C1C1E] text-sm font-medium">Payment Method / طریقہ ادائیگی</Label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger className="border-gray-200 focus:border-[#1A3C5E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash / نقد</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other / دیگر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#1C1C1E] text-sm font-medium">Transaction ID (Optional) / لین دین نمبر</Label>
                <Input
                  value={payTransactionId}
                  onChange={(e) => setPayTransactionId(e.target.value)}
                  placeholder="Enter transaction ID..."
                  className="border-gray-200 focus:border-[#1A3C5E]"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPayDialogOpen(false)} disabled={paymentMutation.isPending} className="border-gray-200">
              Cancel
            </Button>
            <Button
              onClick={handlePayConfirm}
              disabled={paymentMutation.isPending}
              className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white min-w-[44px]"
            >
              {paymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-1" />Confirm Paid</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1A3C5E]">
              Change Status to {getStatusLabel(newStatus)}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === 'completed'
                ? 'This will mark the order as completed. You can then upload the completed work document.'
                : `Are you sure you want to change the status to ${getStatusLabel(newStatus)}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              disabled={statusMutation.isPending}
              className="bg-[#1A3C5E] hover:bg-[#15304D] text-white min-w-[44px]"
            >
              {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
