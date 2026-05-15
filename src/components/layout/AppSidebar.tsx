'use client'

import { useAppStore, type ModuleKey } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, MessageSquare, ClipboardList, Users, Building2,
  Scale, Banknote, DollarSign, Package, Settings, X,
  LogOut, Home, Sparkles, FileText, CreditCard, UserCircle, Shield,
  UsersRound, ListChecks, Stamp, FilePlus2, Globe, Bell,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const adminNavItems: { key: ModuleKey; label: string; labelUrdu: string; icon: React.ElementType; group: string }[] = [
  { key: 'dashboard', label: 'Dashboard', labelUrdu: 'ڈیش بورڈ', icon: LayoutDashboard, group: 'main' },
  { key: 'orders', label: 'Orders', labelUrdu: 'آرڈرز', icon: ClipboardList, group: 'main' },
  { key: 'customers', label: 'Customers', labelUrdu: 'کسٹمرز', icon: Users, group: 'main' },
  { key: 'whatsapp', label: 'WhatsApp', labelUrdu: 'واٹس ایپ', icon: MessageSquare, group: 'main' },
  { key: 'govt', label: 'Govt Services', labelUrdu: 'سرکاری سروسز', icon: Building2, group: 'services' },
  { key: 'notarisation', label: 'Notarisation', labelUrdu: 'نٹریزیشن', icon: Scale, group: 'services' },
  { key: 'service-mgmt', label: 'Service Manager', labelUrdu: 'سروس مینیجر', icon: ListChecks, group: 'services' },
  { key: 'documents', label: 'Doc Services', labelUrdu: 'دستاویز سروسز', icon: Stamp, group: 'services' },
  { key: 'cvbuilder', label: 'CV Builder', labelUrdu: 'سی وی بلڈر', icon: FilePlus2, group: 'services' },
  { key: 'payments', label: 'Payments', labelUrdu: 'پیمنٹس', icon: Banknote, group: 'finance' },
  { key: 'pricing', label: 'Pricing', labelUrdu: 'قیمتیں', icon: DollarSign, group: 'finance' },
  { key: 'commission', label: 'Commission', labelUrdu: 'کمیشن', icon: DollarSign, group: 'finance' },
  { key: 'inventory', label: 'Inventory', labelUrdu: 'انوینٹری', icon: Package, group: 'manage' },
  { key: 'team', label: 'Team & Access', labelUrdu: 'ٹیم و رسائی', icon: UsersRound, group: 'manage' },
  { key: 'settings', label: 'Settings', labelUrdu: 'سیٹنگز', icon: Settings, group: 'manage' },
]

const customerNavItems: { key: ModuleKey; label: string; labelUrdu: string; icon: React.ElementType; group: string }[] = [
  { key: 'customer-dashboard', label: 'Home', labelUrdu: 'ہوم', icon: Home, group: 'main' },
  { key: 'services', label: 'Services', labelUrdu: 'سروسز', icon: Sparkles, group: 'main' },
  { key: 'my-applications', label: 'My Applications', labelUrdu: 'میری درخواستیں', icon: FileText, group: 'main' },
  { key: 'my-orders', label: 'My Orders', labelUrdu: 'میرے آرڈرز', icon: ClipboardList, group: 'main' },
  { key: 'notifications', label: 'Notifications', labelUrdu: 'اطلاعات', icon: Bell, group: 'main' },
  { key: 'payments', label: 'Payments', labelUrdu: 'پیمنٹس', icon: CreditCard, group: 'finance' },
  { key: 'support-chat', label: 'Support', labelUrdu: 'سپورٹ', icon: Headphones, group: 'main' },
  { key: 'profile', label: 'Profile', labelUrdu: 'پروفائل', icon: UserCircle, group: 'account' },
]

// Bottom nav items for mobile customer - 5 icons max
const bottomNavItems: { key: ModuleKey; label: string; labelUrdu: string; icon: React.ElementType }[] = [
  { key: 'customer-dashboard', label: 'Home', labelUrdu: 'ہوم', icon: Home },
  { key: 'services', label: 'Services', labelUrdu: 'سروسز', icon: Sparkles },
  { key: 'my-applications', label: 'Applications', labelUrdu: 'درخواستیں', icon: FileText },
  { key: 'payments', label: 'Payments', labelUrdu: 'پیمنٹس', icon: CreditCard },
  { key: 'profile', label: 'Profile', labelUrdu: 'پروفائل', icon: UserCircle },
]

// Bottom nav items for mobile admin - 5 icons max
const adminBottomNavItems: { key: ModuleKey; label: string; labelUrdu: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', labelUrdu: 'ڈیش بورڈ', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', labelUrdu: 'آرڈرز', icon: ClipboardList },
  { key: 'customers', label: 'Customers', labelUrdu: 'کسٹمرز', icon: Users },
  { key: 'payments', label: 'Payments', labelUrdu: 'پیمنٹس', icon: Banknote },
  { key: 'settings', label: 'Settings', labelUrdu: 'سیٹنگز', icon: Settings },
]

export function AppSidebar() {
  const { activeModule, setActiveModule, sidebarOpen, setSidebarOpen } = useAppStore()
  const { user, logout, isAdmin } = useAuth()
  const isUrdu = useAppStore(s => s.isUrdu)

  const navItems = isAdmin ? adminNavItems : customerNavItems
  const mobileNavItems = isAdmin ? adminBottomNavItems : bottomNavItems
  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()

  const groups = [...new Set(navItems.map(item => item.group))]
  const groupLabels: Record<string, string> = isUrdu ? {
    main: isAdmin ? 'مرکزی' : 'فوری رسائی',
    services: 'سروسز',
    finance: 'مالی',
    manage: 'انتظامیہ',
    account: 'اکاؤنٹ',
  } : {
    main: isAdmin ? 'Main' : 'Quick Access',
    services: 'Services',
    finance: 'Finance',
    manage: 'Management',
    account: 'Account',
  }

  // For mobile customers, render bottom nav instead of sidebar
  if (!isAdmin) {
    return (
      <>
        {/* Desktop Sidebar for Customer - UBL Navy/Gold Style */}
        <>
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <aside className={cn(
            'fixed top-0 left-0 z-[60] h-full w-[280px] bg-gradient-to-b from-[#1A3C5E] via-[#003E6B] to-[#1A3C5E] text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto shadow-xl',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}>
            {/* Logo - UBL Style */}
            <div className="flex items-center justify-between px-5 py-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-auto max-w-[220px] h-16 rounded-xl overflow-hidden bg-white shadow-lg shadow-[#F5A623]/30 border-2 border-[#F5A623]/40 flex items-center justify-center px-3 py-1.5">
                  <img src="/jugnoo-photos-logo.jpg" alt="Jugnoo Photos" className="w-full h-full object-contain" />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Role Badge */}
            <div className="px-5 pb-3 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide bg-gradient-to-r from-[#F5A623]/20 to-[#FFB300]/20 text-[#F5A623] border border-[#F5A623]/30">
                <UserCircle className="w-3 h-3" />
                {isUrdu ? 'کسٹمر پورٹل' : 'Customer Portal'}
              </div>
            </div>

            <Separator className="bg-white/10 shrink-0" />

            {/* Navigation */}
            <ScrollArea className="flex-1 min-h-0 px-3 py-4">
              <nav className="space-y-4">
                {groups.map(group => (
                  <div key={group}>
                    <p className="text-[9px] font-bold text-[#F5A623]/60 uppercase tracking-[0.15em] px-3 mb-2">{groupLabels[group] || group}</p>
                    <div className="space-y-0.5">
                      {navItems.filter(item => item.group === group).map((item) => {
                        const Icon = item.icon
                        const isActive = activeModule === item.key
                        return (
                          <button
                            key={item.key}
                            onClick={() => { setActiveModule(item.key); setSidebarOpen(false) }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 rounded-xl font-medium transition-all duration-200 py-3 text-sm',
                              isActive
                                ? 'bg-white/10 backdrop-blur-md shadow-inner border border-white/10 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                          >
                            <Icon className={cn('w-5 h-5', isActive ? 'text-[#F5A623]' : 'text-slate-500')} />
                            {isUrdu ? item.labelUrdu : item.label}
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F5A623] shadow-sm shadow-[#F5A623]/50" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </ScrollArea>

            <Separator className="bg-white/10 shrink-0" />

            {/* User Info & Logout */}
            <div className="shrink-0 p-4 space-y-3 lg:pb-4 pb-20">
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F5A623] to-[#FFB300] flex items-center justify-center text-[#1A3C5E] font-semibold text-sm shadow-sm shrink-0">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{userName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-2 justify-start rounded-lg" onClick={logout}>
                <LogOut className="w-4 h-4" />
                {isUrdu ? 'لاگ آؤٹ' : 'Logout'}
              </Button>
            </div>
          </aside>
        </>

        {/* Mobile Bottom Navigation - Customer UBL Style */}
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] transition-transform duration-300",
          sidebarOpen ? "translate-y-full" : "translate-y-0"
        )} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="flex items-center justify-around h-16">
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeModule === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveModule(item.key)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] transition-colors duration-200',
                    isActive ? 'text-[#1A3C5E]' : 'text-gray-400'
                  )}
                >
                  <div className="relative">
                    <Icon className={cn('w-5 h-5', isActive ? 'text-[#1A3C5E]' : 'text-gray-400')} />
                    {isActive && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F5A623]" />
                    )}
                  </div>
                  <span className={cn(
                    'text-[10px] leading-tight',
                    isActive ? 'text-[#1A3C5E] font-semibold' : 'text-gray-400 font-medium'
                  )}>
                    {isUrdu ? item.labelUrdu : item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </>
    )
  }

  // Admin sidebar - UBL Navy/Gold Style (matching customer portal)
  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-[60] h-full w-[280px] bg-gradient-to-b from-[#1A3C5E] via-[#003E6B] to-[#1A3C5E] text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto shadow-xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo - Premium UBL Style */}
        <div className="flex items-center justify-between px-5 py-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-auto max-w-[220px] h-16 rounded-xl overflow-hidden bg-white shadow-lg shadow-[#F5A623]/30 border-2 border-[#F5A623]/40 flex items-center justify-center px-3 py-1.5">
              <img src="/jugnoo-photos-logo.jpg" alt="Jugnoo Photos" className="w-full h-full object-contain" />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Role Badge */}
        <div className="px-5 pb-3 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide bg-gradient-to-r from-[#F5A623]/20 to-[#FFB300]/20 text-[#F5A623] border border-[#F5A623]/30">
            <Shield className="w-3 h-3" />
            {isUrdu ? 'ایڈمن پینل' : 'Admin Panel'}
          </div>
        </div>

        <Separator className="bg-white/10 shrink-0" />

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0 px-3 py-4">
          <nav className="space-y-4">
            {groups.map(group => (
              <div key={group}>
                <p className="text-[9px] font-bold text-[#F5A623]/60 uppercase tracking-[0.15em] px-3 mb-2">{groupLabels[group] || group}</p>
                <div className="space-y-0.5">
                  {navItems.filter(item => item.group === group).map((item) => {
                    const Icon = item.icon
                    const isActive = activeModule === item.key
                    return (
                      <button
                        key={item.key}
                        onClick={() => { setActiveModule(item.key); setSidebarOpen(false) }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 rounded-xl font-medium transition-all duration-200 py-2.5 text-[13px]',
                          isActive
                            ? 'bg-white/10 backdrop-blur-md shadow-inner border border-white/10 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <Icon className={cn('w-[18px] h-[18px]', isActive ? 'text-[#F5A623]' : 'text-slate-500')} />
                        {isUrdu ? item.labelUrdu : item.label}
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F5A623] shadow-sm shadow-[#F5A623]/50" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <Separator className="bg-white/10 shrink-0" />

        {/* User Info & Logout */}
        <div className="shrink-0 p-4 space-y-3 lg:pb-4 pb-20">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F5A623] to-[#FFB300] flex items-center justify-center text-[#1A3C5E] font-semibold text-sm shadow-sm shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-2 justify-start rounded-lg" onClick={logout}>
            <LogOut className="w-4 h-4" />
            {isUrdu ? 'لاگ آؤٹ' : 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Admin UBL Style */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] transition-transform duration-300",
        sidebarOpen ? "translate-y-full" : "translate-y-0"
      )} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16">
          {adminBottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeModule === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveModule(item.key)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] transition-colors duration-200',
                  isActive ? 'text-[#1A3C5E]' : 'text-gray-400'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-5 h-5', isActive ? 'text-[#1A3C5E]' : 'text-gray-400')} />
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F5A623]" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] leading-tight',
                  isActive ? 'text-[#1A3C5E] font-semibold' : 'text-gray-400 font-medium'
                )}>
                  {isUrdu ? item.labelUrdu : item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
