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
  Shield, Zap, Heart, GraduationCap
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
    welcome: 'السلام علیکم',
    subtitle: 'جگنو فوٹو اسٹیٹ کی تمام سروسز اب آپ کی انگلیوں پر ہیں۔ گھر بیٹھے درخواست دیں اور ٹریک کریں۔',
    totalApps: 'کل درخواستیں',
    pending: 'زیر التوا',
    completed: 'مکمل',
    available: 'دستیاب سروسز',
    quickActions: 'فوری عمل',
    browseServices: 'سروسز دیکھیں',
    applyNow: 'درخواست دیں',
    whatsappMsg: 'واٹس ایپ',
    paymentHistory: 'پیمنٹ ہسٹری',
    myProfile: 'میرا پروفائل',
    recentApps: 'حالیہ درخواستیں',
    viewAll: 'سب دیکھیں',
    noApps: 'ابھی تک کوئی درخواست نہیں',
    firstApp: 'پہلی درخواست جمع کرائیں',
  } : {
    welcome: 'Assalam-o-Alaikum',
    subtitle: 'Jugnoo Photostate ke saare services ab aapke fingertips par hain. Ghar bethy apply karein aur track karein.',
    totalApps: 'Total Applications',
    pending: 'Pending',
    completed: 'Completed',
    available: 'Available Services',
    quickActions: 'Quick Actions',
    browseServices: 'Services Browse Karein',
    applyNow: 'Application Apply Karein',
    whatsappMsg: 'WhatsApp Message',
    paymentHistory: 'Payment History',
    myProfile: 'My Profile',
    recentApps: 'Recent Applications',
    viewAll: 'Sab dekhein',
    noApps: 'Abhi tak koi application nahi hai',
    firstApp: 'Pehli application submit karein',
  }

  const quickActions = [
    { label: t.browseServices, subLabel: isUrdu ? 'سروسز دیکھیں' : 'Govt & Private Services', icon: Sparkles, module: 'services' as const, color: 'from-blue-500 to-blue-700' },
    { label: t.applyNow, subLabel: isUrdu ? 'درخواست دیں' : 'Abhi apply karein', icon: FileText, module: 'services' as const, color: 'from-[#003366] to-[#1a5276]' },
    { label: t.whatsappMsg, subLabel: isUrdu ? 'واٹس ایپ' : 'Message bhejein', icon: MessageSquare, module: 'whatsapp' as const, color: 'from-emerald-500 to-teal-600' },
    { label: t.paymentHistory, subLabel: isUrdu ? 'پیمنٹ ہسٹری' : 'Payment record dekhein', icon: CreditCard, module: 'payments' as const, color: 'from-indigo-500 to-purple-600' },
    { label: t.myProfile, subLabel: isUrdu ? 'میرا پروفائل' : 'Profile update karein', icon: Package, module: 'profile' as const, color: 'from-cyan-500 to-blue-600' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'submitted': case 'pending': case 'in_progress': case 'under_review': return <Clock className="w-4 h-4 text-amber-500" />
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return 'bg-emerald-100 text-emerald-700'
      case 'submitted': case 'pending': case 'in_progress': case 'under_review': return 'bg-amber-100 text-amber-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner - UBL Premium Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001829] via-[#003366] to-[#2980b9] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-300" />
            <span className="text-sm font-medium text-blue-200">{t.welcome}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user?.full_name || (isUrdu ? 'کسٹمر' : 'Customer')}!</h1>
          <p className="text-white/70 max-w-md text-sm leading-relaxed">{t.subtitle}</p>
          <div className="mt-4 flex items-center gap-3">
            <Button
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm shadow-sm"
              onClick={() => setActiveModule('services')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isUrdu ? 'سروسز دیکھیں' : 'Browse Services'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Premium UBL Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t.totalApps, value: stats.totalApplications, icon: FileText, gradient: 'from-blue-500 to-blue-700' },
          { label: t.pending, value: stats.pendingApplications, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
          { label: t.completed, value: stats.completedApplications, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
          { label: t.available, value: stats.availableServices || 0, icon: Sparkles, gradient: 'from-[#003366] to-[#2980b9]' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-sm`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-[#003366]">{isLoading ? '...' : stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - UBL Card Style */}
      <div>
        <h3 className="text-lg font-semibold text-[#003366] mb-3">{t.quickActions}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-5 px-3 flex flex-col items-center gap-2.5 hover:shadow-md transition-all border-2 border-[#003366]/10 hover:border-transparent hover:bg-[#003366]/5 group rounded-xl"
              onClick={() => setActiveModule(action.module)}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-center text-[#003366]">{action.label}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{action.subLabel}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#003366]">{t.recentApps}</h3>
          <Button variant="ghost" size="sm" className="text-[#2980b9] hover:text-[#003366]" onClick={() => setActiveModule('my-applications')}>
            {t.viewAll} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#2980b9]" /></div>
            ) : (data?.recentApplications || []).length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 text-[#003366]/15" />
                <p className="text-sm">{t.noApps}</p>
                <Button variant="link" className="text-[#2980b9] mt-1" onClick={() => setActiveModule('services')}>{t.firstApp}</Button>
              </div>
            ) : (
              <div className="divide-y divide-blue-50">
                {(data?.recentApplications || []).slice(0, 5).map((app: { id: string; service_name: string; service_type: string; status: string; created_at: string }) => (
                  <div key={app.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#003366]/3 transition-colors">
                    {getStatusIcon(app.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[#003366]">{app.service_name}</p>
                      <p className="text-xs text-muted-foreground">{app.service_type} - {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className={`text-[10px] ${getStatusColor(app.status)}`}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
