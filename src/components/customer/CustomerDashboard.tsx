'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package, FileText, MessageSquare, ArrowRight,
  Clock, CheckCircle2, AlertCircle, Loader2, Sparkles, CreditCard,
  Shield, Zap, UserCircle, ClipboardList
} from 'lucide-react'

export function CustomerDashboard() {
  const { user } = useAuth()
  const { setActiveModule, isUrdu } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: ['customer-dashboard', user?.id],
    queryFn: async () => {
      try {
        const res = await fetch('/api/customer-dashboard')
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } catch {
        return { stats: { totalApplications: 0, pendingApplications: 0, completedApplications: 0, availableServices: 0 }, recentApplications: [], recentPayments: [] }
      }
    },
    retry: false,
  })

  const stats = data?.stats || { totalApplications: 0, pendingApplications: 0, completedApplications: 0, availableServices: 0 }

  const t = isUrdu ? {
    totalApps: 'کل درخواستیں',
    pending: 'زیر التوا',
    completed: 'مکمل',
    available: 'دستیاب سروسز',
    quickActions: 'فوری عمل',
    browseServices: 'سروسز',
    myApplications: 'درخواستیں',
    payments: 'پیمنٹس',
    profile: 'پروفائل',
    recentApps: 'حالیہ درخواستیں',
    viewAll: 'سب دیکھیں',
    noApps: 'ابھی تک کوئی درخواست نہیں',
    firstApp: 'پہلی درخواست جمع کرائیں',
    applyNow: 'درخواست دیں',
    trackStatus: 'ٹریک کریں',
  } : {
    totalApps: 'Total Applications',
    pending: 'Pending',
    completed: 'Completed',
    available: 'Available Services',
    quickActions: 'Quick Actions',
    browseServices: 'Services',
    myApplications: 'Applications',
    payments: 'Payments',
    profile: 'Profile',
    recentApps: 'Recent Applications',
    viewAll: 'View All',
    noApps: 'No applications yet',
    firstApp: 'Submit your first application',
    applyNow: 'Apply Now',
    trackStatus: 'Track Status',
  }

  const quickActions = [
    { label: t.browseServices, icon: Sparkles, module: 'services' as const, bgColor: '#E8F0FE', iconColor: '#1A3C5E' },
    { label: t.myApplications, icon: FileText, module: 'my-applications' as const, bgColor: '#FFF3D6', iconColor: '#F5A623' },
    { label: t.payments, icon: CreditCard, module: 'payments' as const, bgColor: '#E8F5E9', iconColor: '#2E7D32' },
    { label: t.profile, icon: UserCircle, module: 'profile' as const, bgColor: '#F3E5F5', iconColor: '#7B1FA2' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
      case 'submitted': case 'pending': case 'in_progress': case 'under_review': return <Clock className="w-4 h-4 text-[#F5A623]" />
      case 'rejected': return <AlertCircle className="w-4 h-4 text-[#E53935]" />
      default: return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return 'bg-emerald-50 text-[#2E7D32]'
      case 'submitted': case 'pending': case 'in_progress': case 'under_review': return 'bg-amber-50 text-[#F5A623]'
      case 'rejected': return 'bg-red-50 text-[#E53935]'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'government': return <Shield className="w-4 h-4" />
      case 'notarisation': return <Zap className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getServiceBg = (type: string) => {
    switch (type) {
      case 'government': return { bg: '#E8F0FE', color: '#1A3C5E' }
      case 'notarisation': return { bg: '#FFF3D6', color: '#F5A623' }
      default: return { bg: '#F3F4F6', color: '#6B7280' }
    }
  }

  return (
    <div className="space-y-6">
      {/* HERO CARD - UBL Style */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#F5A623]/10 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-[#F5A623] text-sm font-medium mb-1">{t.totalApps}</p>
          <p className="text-4xl sm:text-5xl font-bold mb-6">
            {isLoading ? '...' : stats.totalApplications}
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-[#F5A623] hover:bg-[#FFB300] text-[#1A3C5E] font-semibold rounded-xl h-11 px-6 shadow-sm"
              onClick={() => setActiveModule('services')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t.applyNow}
            </Button>
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl h-11 px-6"
              onClick={() => setActiveModule('my-applications')}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              {t.trackStatus}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t.pending, value: stats.pendingApplications, color: '#F5A623', bgColor: '#FFF3D6' },
          { label: t.completed, value: stats.completedApplications, color: '#2E7D32', bgColor: '#E8F5E9' },
          { label: t.available, value: stats.availableServices || 0, color: '#1A3C5E', bgColor: '#E8F0FE' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {isLoading ? '...' : stat.value}
              </p>
              <p className="text-[11px] text-[#6B7280] font-medium mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Icons - UBL Style */}
      <div>
        <h3 className="text-base font-semibold text-[#1C1C1E] mb-3">{t.quickActions}</h3>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setActiveModule(action.module)}
              className="flex flex-col items-center gap-2 py-3 min-h-[44px]"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: action.bgColor }}
              >
                <action.icon className="w-5 h-5" style={{ color: action.iconColor }} />
              </div>
              <span className="text-[11px] font-medium text-[#6B7280] text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Applications - UBL Style List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[#1C1C1E]">{t.recentApps}</h3>
          <Button variant="ghost" size="sm" className="text-[#1A3C5E] hover:text-[#1A3C5E]/70" onClick={() => setActiveModule('my-applications')}>
            {t.viewAll} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#1A3C5E]" /></div>
            ) : (data?.recentApplications || []).length === 0 ? (
              <div className="text-center py-10 text-[#6B7280]">
                <FileText className="w-12 h-12 mx-auto mb-3 text-[#1A3C5E]/10" />
                <p className="text-sm">{t.noApps}</p>
                <Button variant="link" className="text-[#F5A623] mt-1" onClick={() => setActiveModule('services')}>{t.firstApp}</Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {(data?.recentApplications || []).slice(0, 5).map((app: { id: string; service_name: string; service_type: string; status: string; created_at: string }) => {
                  const svcStyle = getServiceBg(app.service_type)
                  return (
                    <div key={app.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F5F7FA] transition-colors">
                      {/* Colored icon in rounded square */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: svcStyle.bg, color: svcStyle.color }}
                      >
                        {getServiceIcon(app.service_type)}
                      </div>
                      {/* Center: Title + subtitle */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1C1C1E] truncate">{app.service_name}</p>
                        <p className="text-xs text-[#6B7280]">{app.service_type} · {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      {/* Right: Status badge */}
                      <Badge className={`text-[10px] font-medium rounded-lg px-2.5 py-0.5 border-0 ${getStatusColor(app.status)}`}>
                        {app.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
