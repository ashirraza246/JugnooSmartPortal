'use client'

import { useAuth } from '@/lib/auth'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PremiumBootScreen } from '@/components/PremiumBootScreen'
import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, Suspense, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Loader2, Bell, CheckCheck, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Admin modules - dynamic import
const DashboardModule = dynamic(() => import('@/components/dashboard/DashboardModule').then(m => ({ default: m.DashboardModule })), { ssr: false })
const WhatsappModule = dynamic(() => import('@/components/whatsapp/WhatsappModule').then(m => ({ default: m.WhatsappModule })), { ssr: false })
const OrdersModule = dynamic(() => import('@/components/orders/OrdersModule').then(m => ({ default: m.OrdersModule })), { ssr: false })
const CustomersModule = dynamic(() => import('@/components/customers/CustomersModule').then(m => ({ default: m.CustomersModule })), { ssr: false })
const GovtModule = dynamic(() => import('@/components/govt/GovtModule').then(m => ({ default: m.GovtModule })), { ssr: false })
const NotarisationModule = dynamic(() => import('@/components/notarisation/NotarisationModule').then(m => ({ default: m.NotarisationModule })), { ssr: false })
const PaymentsModule = dynamic(() => import('@/components/payments/PaymentsModule').then(m => ({ default: m.PaymentsModule })), { ssr: false })
const PricingModule = dynamic(() => import('@/components/pricing/PricingModule').then(m => ({ default: m.PricingModule })), { ssr: false })
const InventoryModule = dynamic(() => import('@/components/inventory/InventoryModule').then(m => ({ default: m.InventoryModule })), { ssr: false })
const SettingsModule = dynamic(() => import('@/components/settings/SettingsModule').then(m => ({ default: m.SettingsModule })), { ssr: false })
const ServiceManagerModule = dynamic(() => import('@/components/services/ServiceManagerModule').then(m => ({ default: m.ServiceManagerModule })), { ssr: false })
const TeamManagementModule = dynamic(() => import('@/components/team/TeamManagementModule').then(m => ({ default: m.TeamManagementModule })), { ssr: false })
const CVBuilderModule = dynamic(() => import('@/components/cvbuilder/CVBuilderModule').then(m => ({ default: m.CVBuilderModule })), { ssr: false })
const DocumentServicesModule = dynamic(() => import('@/components/documents/DocumentServicesModule').then(m => ({ default: m.DocumentServicesModule })), { ssr: false })
const CommissionModule = dynamic(() => import('@/components/commission/CommissionModule').then(m => ({ default: m.CommissionModule })), { ssr: false })

// Customer modules - dynamic import
const CustomerDashboard = dynamic(() => import('@/components/customer/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })), { ssr: false })
const ServicesBrowser = dynamic(() => import('@/components/customer/ServicesBrowser').then(m => ({ default: m.ServicesBrowser })), { ssr: false })
const MyApplications = dynamic(() => import('@/components/customer/MyApplications').then(m => ({ default: m.MyApplications })), { ssr: false })
const CustomerPayments = dynamic(() => import('@/components/customer/CustomerPayments').then(m => ({ default: m.CustomerPayments })), { ssr: false })
const CustomerProfile = dynamic(() => import('@/components/customer/CustomerProfile').then(m => ({ default: m.CustomerProfile })), { ssr: false })
const SupportChat = dynamic(() => import('@/components/customer/SupportChat').then(m => ({ default: m.SupportChat })), { ssr: false })
const HelpPage = dynamic(() => import('@/components/customer/HelpPage').then(m => ({ default: m.HelpPage })), { ssr: false })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Admin-only module keys - customers can NEVER access these
// Only modules that are EXCLUSIVELY admin (not shared with customer portal)
// 'payments' and 'whatsapp' are SHARED between admin & customer, so NOT in this list
const ADMIN_ONLY_MODULES = ['dashboard', 'orders', 'customers', 'govt', 'notarisation', 'service-mgmt', 'documents', 'cvbuilder', 'pricing', 'commission', 'inventory', 'team', 'settings']

function ModuleFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3C5E] mx-auto" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  )
}

function AdminContent() {
  const { activeModule } = useAppStore()

  const modules: Record<string, React.ComponentType> = {
    dashboard: DashboardModule,
    whatsapp: WhatsappModule,
    orders: OrdersModule,
    customers: CustomersModule,
    govt: GovtModule,
    notarisation: NotarisationModule,
    'service-mgmt': ServiceManagerModule,
    payments: PaymentsModule,
    pricing: PricingModule,
    inventory: InventoryModule,
    team: TeamManagementModule,
    settings: SettingsModule,
    documents: DocumentServicesModule,
    cvbuilder: CVBuilderModule,
    commission: CommissionModule,
    help: HelpPage,
  }

  const ActiveComponent = modules[activeModule] || DashboardModule

  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Suspense fallback={<ModuleFallback />}>
            <ActiveComponent />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

function NotificationList() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotification, clearAllNotifications, isUrdu } = useAppStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1C1E]">{isUrdu ? 'اطلاعات' : 'Notifications'}</h2>
          <p className="text-[#6B7280]">{isUrdu ? 'اپنی تمام اطلاعات دیکھیں' : 'Dekhein apni saari notifications'}</p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.filter(n => !n.isRead).length > 0 && (
            <Button size="sm" onClick={markAllNotificationsRead} className="bg-[#1A3C5E] text-white rounded-xl">
              <CheckCheck className="w-4 h-4 mr-1" />
              {isUrdu ? 'سب پڑھیں' : 'Sab Parhein'}
            </Button>
          )}
          {notifications.length > 0 && (
            <Button size="sm" variant="outline" onClick={clearAllNotifications} className="text-red-500 border-red-200 hover:bg-red-50">
              {isUrdu ? 'سب ہٹائیں' : 'Clear All'}
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-10 text-[#1A3C5E]" />
          <h3 className="text-lg font-semibold text-[#1C1C1E]">{isUrdu ? 'کوئی اطلاع نہیں' : 'Koi notification nahi'}</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} className={`border-0 shadow-sm overflow-hidden cursor-pointer group relative rounded-2xl ${!notif.isRead ? 'bg-[#E8F0FE]/30' : ''}`} onClick={() => markNotificationRead(notif.id)}>
              <div className="flex">
                <div className={`w-1.5 ${
                  notif.type === 'status' ? 'bg-[#1A3C5E]' :
                  notif.type === 'payment' ? 'bg-[#2E7D32]' :
                  notif.type === 'deadline' ? 'bg-[#F5A623]' : 'bg-purple-500'
                }`} />
                <CardContent className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-[#1A3C5E]' : 'text-[#6B7280]'}`}>{notif.title}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge className={`text-[10px] border-0 ${
                        notif.type === 'status' ? 'bg-[#E8F0FE] text-[#1A3C5E]' :
                        notif.type === 'payment' ? 'bg-emerald-50 text-[#2E7D32]' :
                        notif.type === 'deadline' ? 'bg-[#FFF3D6] text-[#F5A623]' : 'bg-purple-50 text-purple-700'
                      }`}>{notif.type}</Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); clearNotification(notif.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
                        title={isUrdu ? 'ہٹائیں' : 'Dismiss'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomerContent() {
  const { activeModule, setActiveModule } = useAppStore()

  // SECURITY: If activeModule is an admin-only module, redirect to customer dashboard
  useEffect(() => {
    if (ADMIN_ONLY_MODULES.includes(activeModule)) {
      setActiveModule('customer-dashboard')
    }
  }, [activeModule, setActiveModule])

  const modules: Record<string, React.ComponentType> = {
    'customer-dashboard': CustomerDashboard,
    'services': ServicesBrowser,
    'my-applications': MyApplications,
    'my-orders': MyApplications,
    'payments': CustomerPayments,
    'profile': CustomerProfile,
    'notifications': NotificationList,
    'support-chat': SupportChat,
    help: HelpPage,
  }

  const ActiveComponent = modules[activeModule] || CustomerDashboard

  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Suspense fallback={<ModuleFallback />}>
            <ActiveComponent />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, loading, isAdmin } = useAuth()
  const [showBootScreen, setShowBootScreen] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowBootScreen(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (showBootScreen && loading) {
    return <PremiumBootScreen />
  }

  if (loading) {
    return <PremiumBootScreen autoHide={false} />
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {isAdmin ? <AdminContent /> : <CustomerContent />}
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
