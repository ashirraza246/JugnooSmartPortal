'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText, Clock, CheckCircle2, AlertCircle, XCircle, Shield, Zap,
  Loader2, RefreshCw, Filter
} from 'lucide-react'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function MyApplications() {
  const { user } = useAuth()
  const { isUrdu } = useAppStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
          {(data || []).map((app: {
            id: string
            service_name: string
            service_type: string
            status: string
            payment_status: string
            fee_amount: number
            applicant_name: string
            applicant_cnic: string
            created_at: string
            updated_at: string
            notes: string
          }) => {
            const svcStyle = getServiceStyle(app.service_type)
            return (
              <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white">
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
                    {/* Right: Status badge + amount */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className={`${getStatusColor(app.status)} text-xs rounded-lg px-2.5`}>{getStatusLabel(app.status)}</Badge>
                      {getPaymentBadge(app.payment_status)}
                      <span className="text-sm font-bold text-[#1A3C5E]">Rs {app.fee_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
