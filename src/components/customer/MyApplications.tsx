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
  Loader2, RefreshCw, Filter, Edit, Trash2, Lock,
} from 'lucide-react'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ServiceApplication {
  id: string
  service_name: string
  service_type: string
  status: string
  payment_status: string
  fee_amount: number
  applicant_name: string
  applicant_cnic: string
  applicant_phone: string
  description: string
  created_at: string
  updated_at: string
  notes: string
}

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
    deleteConfirm: 'کیا آپ واقعی یہ درخواست حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    confirmDelete: 'ہاں، حذف کریں',
    applicantName: 'درخواست دہندہ کا نام',
    phone: 'فون نمبر',
    cnic: 'شناختی کارڈ نمبر',
    description: 'تفصیل',
    editSuccess: 'درخواست کامیابی سے اپ ڈیٹ ہو گئی!',
    deleteSuccess: 'درخواست کامیابی سے حذف ہو گئی!',
    editError: 'ترمیم نہیں ہو سکی',
    deleteError: 'حذف نہیں ہو سکی',
    paidNoEdit: 'ادائیگی شدہ - تبدیلی نہیں',
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
    deleteConfirm: 'Are you sure you want to delete this application? This action cannot be undone.',
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
      default: return { bg: '#F3F4F6', color: '#6B7280' }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1C1E]">{t.title}</h2>
          <p className="text-[#6B7280] text-sm">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-gray-200">
              <Filter className="w-4 h-4 mr-1 text-[#6B7280]" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatus}</SelectItem>
              <SelectItem value="submitted">{t.submitted}</SelectItem>
              <SelectItem value="pending">{t.pending}</SelectItem>
              <SelectItem value="in_progress">{t.inProgress}</SelectItem>
              <SelectItem value="completed">{t.completed}</SelectItem>
              <SelectItem value="rejected">{t.rejected}</SelectItem>
            </SelectContent>
          </Select>
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
            return (
              <Card
                key={app.id}
                className={`border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white ${
                  unpaid ? 'ring-1 ring-[#F5A623]/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Left: colored icon in rounded square */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: svcStyle.bg, color: svcStyle.color }}
                    >
                      {getServiceIcon(app.service_type)}
                    </div>
                    {/* Center: Title + subtitle */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C1C1E] truncate">{app.service_name}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{app.service_type} {t.service} · {new Date(app.created_at).toLocaleDateString()}</p>
                      {app.applicant_cnic && <p className="text-[10px] text-[#6B7280]/60 mt-0.5">CNIC: {app.applicant_cnic}</p>}
                      {app.notes && (
                        <p className="text-xs text-[#6B7280] mt-1 bg-[#F5F7FA] px-2 py-1 rounded-lg inline-block">{t.note}: {app.notes}</p>
                      )}
                    </div>
                    {/* Right: Status badge + amount + actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className={`${getStatusColor(app.status)} text-xs rounded-lg px-2.5`}>{getStatusLabel(app.status)}</Badge>
                      {getPaymentBadge(app.payment_status)}
                      <span className="text-sm font-bold text-[#1A3C5E]">Rs {app.fee_amount?.toLocaleString()}</span>

                      {/* Action buttons row */}
                      {unpaid ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 min-w-[44px] px-2.5 border-[#1A3C5E]/20 text-[#1A3C5E] hover:bg-[#1A3C5E] hover:text-white transition-colors"
                            onClick={() => handleEditClick(app)}
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            <span className="text-xs">{t.edit}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 min-w-[44px] px-2.5 border-red-200 text-[#E53935] hover:bg-[#E53935] hover:text-white transition-colors"
                            onClick={() => handleDeleteClick(app)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            <span className="text-xs">{t.delete}</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <Badge className="bg-gray-100 text-[#6B7280] text-[9px] border-0 flex items-center gap-1 px-2 py-1">
                            <Lock className="w-3 h-3" />
                            {t.paidNoEdit}
                          </Badge>
                        </div>
                      )}
                    </div>
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
            <DialogDescription className="sr-only">
              {t.editTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[#1C1C1E] text-sm font-medium">{t.applicantName}</Label>
              <Input
                id="edit-name"
                value={editForm.applicantName}
                onChange={(e) => setEditForm(prev => ({ ...prev, applicantName: e.target.value }))}
                className="border-gray-200 focus:border-[#1A3C5E]"
                placeholder={t.applicantName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-[#1C1C1E] text-sm font-medium">{t.phone}</Label>
              <Input
                id="edit-phone"
                value={editForm.applicantPhone}
                onChange={(e) => setEditForm(prev => ({ ...prev, applicantPhone: e.target.value }))}
                className="border-gray-200 focus:border-[#1A3C5E]"
                placeholder={t.phone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cnic" className="text-[#1C1C1E] text-sm font-medium">{t.cnic}</Label>
              <Input
                id="edit-cnic"
                value={editForm.applicantCnic}
                onChange={(e) => setEditForm(prev => ({ ...prev, applicantCnic: e.target.value }))}
                className="border-gray-200 focus:border-[#1A3C5E]"
                placeholder={t.cnic}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc" className="text-[#1C1C1E] text-sm font-medium">{t.description}</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="border-gray-200 focus:border-[#1A3C5E] min-h-20"
                placeholder={t.description}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSaving}
              className="border-gray-200"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={isSaving}
              className="bg-[#1A3C5E] hover:bg-[#15304D] text-white min-w-[44px]"
            >
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
            <AlertDialogCancel disabled={isDeleting} className="border-gray-200">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-[#E53935] hover:bg-[#C62828] text-white min-w-[44px]"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
