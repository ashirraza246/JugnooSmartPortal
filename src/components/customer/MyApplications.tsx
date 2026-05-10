'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText, Clock, CheckCircle2, AlertCircle, XCircle,
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
      case 'completed': case 'approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'submitted': return <FileText className="w-5 h-5 text-blue-500" />
      case 'pending': case 'in_progress': case 'under_review': return <Clock className="w-5 h-5 text-amber-500" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <AlertCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': case 'in_progress': case 'under_review': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
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
      case 'paid': return <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{t.paid}</Badge>
      case 'partial': return <Badge className="bg-amber-100 text-amber-700 text-[10px]">{t.partial}</Badge>
      default: return <Badge className="bg-red-100 text-red-700 text-[10px]">{t.unpaid}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003366]">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-blue-100">
              <Filter className="w-4 h-4 mr-1" />
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
          <Button variant="outline" size="icon" className="border-blue-100" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (data || []).length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-20 h-20 mx-auto mb-4 opacity-15" />
          <h3 className="text-xl font-semibold mb-2">{t.noApps}</h3>
          <p className="text-muted-foreground mb-4">{t.noAppsSub}</p>
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
          }) => (
            <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex">
                <div className="w-1.5 bg-gradient-to-b from-[#003366] to-[#2980b9]" />
                <CardContent className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <h4 className="font-semibold">{app.service_name}</h4>
                        <p className="text-sm text-muted-foreground">{app.service_type} {t.service}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{t.applied}: {new Date(app.created_at).toLocaleDateString()}</span>
                          {app.applicant_cnic && <span className="text-xs text-muted-foreground">CNIC: {app.applicant_cnic}</span>}
                        </div>
                        {app.notes && (
                          <p className="text-xs text-muted-foreground mt-1 bg-blue-50/50 px-2 py-1 rounded">{t.note}: {app.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusColor(app.status)} text-xs`}>{getStatusLabel(app.status)}</Badge>
                      {getPaymentBadge(app.payment_status)}
                      <span className="text-sm font-bold text-[#003366]">Rs {app.fee_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
