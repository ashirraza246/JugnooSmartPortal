'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FileText, Clock, CheckCircle2, AlertCircle, XCircle, Shield, Zap,
  Loader2, RefreshCw, Filter, Edit, Trash2, Lock, Printer, Download,
  CircleDot, ArrowRight,
} from 'lucide-react'
import { useState, useRef } from 'react'

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

export function MyApplications() {
  const { user } = useAuth()
  const { isUrdu } = useAppStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    applicantName: '',
    applicantPhone: '',
    applicantCnic: '',
    description: '',
  })
  const invoiceRef = useRef<HTMLDivElement>(null)

  const t = isUrdu ? {
    title: 'میری درخواستیں',
    subtitle: 'اپنی تمام درخواستیں اور ان کا حال دیکھیں',
    allStatus: 'تمام حالت',
    submitted: 'جمع شدہ',
    pending: 'زیر التوا',
    inProgress: 'جاری',
    completed: 'مکمل',
    rejected: 'مسترد',
    noApps: 'کوئی درخواست نہیں ہے',
    noAppsSub: 'ابھی تک کسی سروس کے لیے درخواست نہیں کی',
    mukammal: 'مکمل',
    approved: 'منظور شدہ',
    submitHogai: 'جمع ہو گئی',
    progressMein: 'جاری ہے',
    reviewMein: 'جائزے میں',
    rejectHogai: 'مسترد ہو گئی',
    service: 'سروس',
    applied: 'درخواست',
    note: 'نوٹ',
    paid: 'ادائیگی شدہ',
    partial: 'جزوی',
    unpaid: 'غیر ادا',
    edit: 'ترمیم',
    delete: 'حذف',
    locked: 'ادائیگی شدہ - تبدیلی نہیں ہو سکتی',
    editTitle: 'درخواست میں ترمیم',
    deleteTitle: 'درخواست حذف کریں',
    deleteConfirm: 'کیا آپ واقعی یہ درخواست حذف کرنا چاہتے ہیں؟',
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    confirmDelete: 'ہاں، حذف کریں',
    applicantName: 'درخواست دہندہ کا نام',
    phone: 'فون نمبر',
    cnic: 'شناختی کارڈ نمبر',
    description: 'تفصیل',
    editSuccess: 'درخواست اپ ڈیٹ ہو گئی!',
    deleteSuccess: 'درخواست حذف ہو گئی!',
    editError: 'ترمیم نہیں ہو سکی',
    deleteError: 'حذف نہیں ہو سکی',
    paidNoEdit: 'ادائیگی شدہ - تبدیلی نہیں',
    invoice: 'انوائس',
    print: 'پرنٹ',
    download: 'ڈاؤنلوڈ',
    downloadService: 'سروس ڈاؤنلوڈ',
    trxId: 'ٹرانزیکشن آئی ڈی',
    paymentMethod: 'پیمنٹ طریقہ',
    statusTracking: 'اسٹیٹس ٹریکنگ',
  } : {
    title: 'Meri Applications',
    subtitle: 'Apni saari applications aur unka status dekhein',
    allStatus: 'Sab Status',
    submitted: 'Submitted',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
    noApps: 'Koi application nahi hai',
    noAppsSub: 'Abhi tak koi service ke liye apply nahi kiya',
    mukammal: 'Mukammal',
    approved: 'Approved',
    submitHogai: 'Submit Ho Gayi',
    progressMein: 'Progress Mein',
    reviewMein: 'Review Mein',
    rejectHogai: 'Reject Ho Gayi',
    service: 'Service',
    applied: 'Applied',
    note: 'Note',
    paid: 'Paid',
    partial: 'Partial',
    unpaid: 'Unpaid',
    edit: 'Edit',
    delete: 'Delete',
    locked: 'Paid - No changes allowed',
    editTitle: 'Edit Application',
    deleteTitle: 'Delete Application',
    deleteConfirm: 'Are you sure you want to delete this application?',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Yes, Delete',
    applicantName: 'Applicant Name',
    phone: 'Phone Number',
    cnic: 'CNIC Number',
    description: 'Description',
    editSuccess: 'Application updated successfully!',
    deleteSuccess: 'Application deleted successfully!',
    editError: 'Could not edit',
    deleteError: 'Could not delete',
    paidNoEdit: 'Paid - No changes',
    invoice: 'Invoice',
    print: 'Print',
    download: 'Download',
    downloadService: 'Download Service',
    trxId: 'Transaction ID',
    paymentMethod: 'Payment Method',
    statusTracking: 'Status Tracking',
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-applications', user?.id, statusFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (user?.id) params.set('userId', user.id)
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

  const isUnpaid = (paymentStatus: string) => paymentStatus !== 'paid'

  const handleEditClick = (app: ServiceApplication) => {
    setSelectedApp(app)
    setEditForm({
      applicantName: app.applicant_name || '',
      applicantPhone: app.applicant_phone || '',
      applicantCnic: app.applicant_cnic || '',
      description: app.description || '',
    })
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (app: ServiceApplication) => {
    setSelectedApp(app)
    setDeleteDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!selectedApp) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/service-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApp.id,
          applicantName: editForm.applicantName,
          applicantCnic: editForm.applicantCnic,
          applicantPhone: editForm.applicantPhone,
          description: editForm.description,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        alert(result.error || t.editError)
        return
      }
      setEditDialogOpen(false)
      refetch()
    } catch {
      alert(t.editError)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedApp) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/service-applications?id=${selectedApp.id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (!res.ok) {
        alert(result.error || t.deleteError)
        return
      }
      setDeleteDialogOpen(false)
      refetch()
    } catch {
      alert(t.deleteError)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrintInvoice = (app: ServiceApplication) => {
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
        </div>
        <div>
          <div class="field"><div class="field-label">Service</div><div class="field-value">${app.service_name}</div></div>
          <div class="field"><div class="field-label">Status</div><div class="field-value"><span class="status-badge status-${app.status}">${app.status.replace(/_/g, ' ').toUpperCase()}</span></div></div>
          <div class="field"><div class="field-label">Payment</div><div class="field-value">${app.payment_status === 'paid' ? '✅ PAID' : '❌ UNPAID'}</div></div>
          ${app.transaction_id ? `<div class="field"><div class="field-label">Transaction ID</div><div class="field-value">${app.transaction_id}</div></div>` : ''}
          ${app.payment_method ? `<div class="field"><div class="field-label">Payment Method</div><div class="field-value">${app.payment_method}</div></div>` : ''}
        </div>
      </div>
      ${app.description ? `<div class="field"><div class="field-label">Description</div><div class="field-value">${app.description}</div></div>` : ''}
      <div class="amount-section">
        <div style="font-size:12px;color:#6B7280;margin-bottom:5px;">Service Fee</div>
        <div class="amount">Rs. ${app.fee_amount?.toLocaleString()}</div>
      </div>
      <div class="footer"><img src="${logoUrl}" alt="" class="footer-logo" /> Jugnoo Photostate · AI-Powered Business Management · Chowk Azam</div>
      </body></html>
    `
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
      case 'submitted': return <FileText className="w-5 h-5 text-[#1A3C5E]" />
      case 'pending': case 'in_progress': case 'under_review': return <Clock className="w-5 h-5 text-[#F5A623]" />
      case 'rejected': return <XCircle className="w-5 h-5 text-[#E53935]" />
      default: return <AlertCircle className="w-5 h-5 text-[#6B7280]" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return 'bg-emerald-50 text-[#2E7D32] border-0'
      case 'submitted': return 'bg-[#E8F0FE] text-[#1A3C5E] border-0'
      case 'pending': case 'in_progress': case 'under_review': return 'bg-[#FFF3D6] text-[#F5A623] border-0'
      case 'rejected': return 'bg-red-50 text-[#E53935] border-0'
      default: return 'bg-gray-50 text-[#6B7280] border-0'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t.mukammal
      case 'approved': return t.approved
      case 'submitted': return t.submitHogai
      case 'pending': return t.pending
      case 'in_progress': return t.progressMein
      case 'under_review': return t.reviewMein
      case 'rejected': return t.rejectHogai
      default: return status
    }
  }

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return <Badge className="bg-emerald-50 text-[#2E7D32] text-[10px] border-0">{t.paid}</Badge>
      case 'partial': return <Badge className="bg-[#FFF3D6] text-[#F5A623] text-[10px] border-0">{t.partial}</Badge>
      default: return <Badge className="bg-red-50 text-[#E53935] text-[10px] border-0">{t.unpaid}</Badge>
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

  // Status step progress for an application
  const renderStatusProgress = (status: string) => {
    const currentIdx = statusSteps.findIndex(s => s.key === status)
    const activeIdx = currentIdx >= 0 ? currentIdx : 0
    return (
      <div className="flex items-center gap-0.5 mt-2">
        {statusSteps.map((step, idx) => {
          const isCompleted = idx < activeIdx
          const isActive = idx === activeIdx
          const isRejected = status === 'rejected'
          return (
            <div key={step.key} className="flex items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                isCompleted ? 'bg-emerald-500 text-white' :
                isActive ? (isRejected ? 'bg-red-500 text-white' : 'bg-[#003366] text-white') :
                'bg-gray-200 text-gray-400'
              }`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              {idx < statusSteps.length - 1 && (
                <div className={`w-4 h-0.5 ${idx < activeIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
        <span className="text-[9px] ml-1 font-medium text-[#003366]">
          {isUrdu ? statusSteps[activeIdx]?.labelUrdu : statusSteps[activeIdx]?.label}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1C1E]">{t.title}</h2>
          <p className="text-[#6B7280] text-sm">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">{t.allStatus}</option>
            <option value="submitted">{t.submitted}</option>
            <option value="pending">{t.pending}</option>
            <option value="in_progress">{t.inProgress}</option>
            <option value="completed">{t.completed}</option>
            <option value="rejected">{t.rejected}</option>
          </select>
          <Button variant="outline" size="icon" className="border-gray-200" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 text-[#6B7280]" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#1A3C5E]" /></div>
      ) : (data || []).length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-20 h-20 mx-auto mb-4 opacity-10 text-[#1A3C5E]" />
          <h3 className="text-xl font-semibold text-[#1C1C1E]">{t.noApps}</h3>
          <p className="text-[#6B7280] mb-4">{t.noAppsSub}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data || []).map((app: ServiceApplication) => {
            const svcStyle = getServiceStyle(app.service_type)
            const unpaid = isUnpaid(app.payment_status)
            const isCompleted = app.status === 'completed'
            return (
              <Card
                key={app.id}
                className={`border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white ${
                  unpaid ? 'ring-1 ring-[#F5A623]/30' : ''
                }`}
              >
                <CardContent className="p-3 sm:p-4">
                  {/* Top row: icon + name + badges + amount */}
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    {/* Left: colored icon */}
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: svcStyle.bg, color: svcStyle.color }}
                    >
                      {getServiceIcon(app.service_type)}
                    </div>
                    {/* Center: name + meta info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C1C1E] truncate">{app.service_name}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{app.service_type} {t.service} · {new Date(app.created_at).toLocaleDateString()}</p>
                      {app.applicant_cnic && <p className="text-[10px] text-[#6B7280]/60 mt-0.5">CNIC: {app.applicant_cnic}</p>}
                      {app.transaction_id && <p className="text-[10px] text-[#F5A623] font-medium mt-0.5">Trx ID: {app.transaction_id}</p>}
                    </div>
                    {/* Right: badges + amount only (no action buttons here) */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge className={`${getStatusColor(app.status)} text-[10px] sm:text-xs rounded-lg px-2 sm:px-2.5`}>{getStatusLabel(app.status)}</Badge>
                      {getPaymentBadge(app.payment_status)}
                      <span className="text-sm font-bold text-[#1A3C5E]">Rs {app.fee_amount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Status Progress Bar - full width below top row */}
                  <div className="mt-2.5 pl-0 sm:pl-[52px]">
                    {renderStatusProgress(app.status)}
                  </div>

                  {/* Notes */}
                  {app.notes && (
                    <div className="mt-2 pl-0 sm:pl-[52px]">
                      <p className="text-xs text-[#6B7280] bg-[#F5F7FA] px-2 py-1 rounded-lg inline-block">{t.note}: {app.notes}</p>
                    </div>
                  )}

                  {/* Action buttons - full width row below status */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap pl-0 sm:pl-[52px]">
                    {/* Invoice/Print button - always show when paid */}
                    {app.payment_status === 'paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 min-w-[44px] px-3 border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white transition-colors text-[11px] rounded-lg"
                        onClick={() => handlePrintInvoice(app)}
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        {t.invoice}
                      </Button>
                    )}

                    {/* Download button - only when completed and has result document */}
                    {isCompleted && app.result_document_url && (
                      <Button
                        size="sm"
                        className="h-9 min-w-[44px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] gap-1 rounded-lg"
                        onClick={() => window.open(app.result_document_url!, '_blank')}
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t.download}
                      </Button>
                    )}

                    {/* Edit/Delete for unpaid */}
                    {unpaid ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 min-w-[44px] px-3 border-[#1A3C5E]/20 text-[#1A3C5E] hover:bg-[#1A3C5E] hover:text-white transition-colors text-[11px] rounded-lg"
                          onClick={() => handleEditClick(app)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          {t.edit}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 min-w-[44px] px-3 border-red-200 text-[#E53935] hover:bg-[#E53935] hover:text-white transition-colors text-[11px] rounded-lg"
                          onClick={() => handleDeleteClick(app)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          {t.delete}
                        </Button>
                      </>
                    ) : !isCompleted && (
                      <Badge className="bg-gray-100 text-[#6B7280] text-[9px] border-0 flex items-center gap-1 px-2 py-1">
                        <Lock className="w-3 h-3" />
                        {t.paidNoEdit}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1A3C5E]">{t.editTitle}</DialogTitle>
            <DialogDescription className="sr-only">{t.editTitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[#1C1C1E] text-sm font-medium">{t.applicantName}</Label>
              <Input id="edit-name" value={editForm.applicantName} onChange={(e) => setEditForm(prev => ({ ...prev, applicantName: e.target.value }))} className="border-gray-200 focus:border-[#1A3C5E]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-[#1C1C1E] text-sm font-medium">{t.phone}</Label>
              <Input id="edit-phone" value={editForm.applicantPhone} onChange={(e) => setEditForm(prev => ({ ...prev, applicantPhone: e.target.value }))} className="border-gray-200 focus:border-[#1A3C5E]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cnic" className="text-[#1C1C1E] text-sm font-medium">{t.cnic}</Label>
              <Input id="edit-cnic" value={editForm.applicantCnic} onChange={(e) => setEditForm(prev => ({ ...prev, applicantCnic: e.target.value }))} className="border-gray-200 focus:border-[#1A3C5E]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc" className="text-[#1C1C1E] text-sm font-medium">{t.description}</Label>
              <Textarea id="edit-desc" value={editForm.description} onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))} className="border-gray-200 focus:border-[#1A3C5E] min-h-20" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving} className="border-gray-200">{t.cancel}</Button>
            <Button onClick={handleEditSave} disabled={isSaving} className="bg-[#1A3C5E] hover:bg-[#15304D] text-white min-w-[44px]">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E53935]">{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-gray-200">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-[#E53935] hover:bg-[#C62828] text-white min-w-[44px]">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
