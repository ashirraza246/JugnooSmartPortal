'use client'

import { useAppStore, type ModuleKey } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, MessageSquare, ClipboardList, Users, Building2,
  Scale, Banknote, DollarSign, Package, Settings, X,
  LogOut, Home, Sparkles, FileText, CreditCard, UserCircle, Shield,
  UsersRound, ListChecks, Stamp, FilePlus2, Globe, Bell,
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
  { key: 'cvbuilder', label: 'CV Builder', labelUrdu: 'سی وی بنائیں', icon: FilePlus2, group: 'services' },
  { key: 'payments', label: 'Payments', labelUrdu: 'پیمنٹس', icon: CreditCard, group: 'finance' },
  { key: 'whatsapp', label: 'WhatsApp', labelUrdu: 'واٹس ایپ', icon: MessageSquare, group: 'main' },
  { key: 'profile', label: 'Profile', labelUrdu: 'پروفائل', icon: UserCircle, group: 'account' },
]

export function AppSidebar() {
  const { activeModule, setActiveModule, sidebarOpen, setSidebarOpen } = useAppStore()
  const { user, logout, isAdmin } = useAuth()
  const isUrdu = useAppStore(s => s.isUrdu)

  const navItems = isAdmin ? adminNavItems : customerNavItems
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

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-[280px] bg-gradient-to-b from-[#001829] via-[#002b4d] to-[#001829] text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto shadow-xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo - Premium UBL Style */}
        <div className="flex items-center justify-between px-5 py-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/30 border-2 border-blue-400/30 bg-white/10 backdrop-blur-sm">
              <img src="/jugnoo-logo.png" alt="Jugnoo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">Jugnoo</h1>
              <p className="text-blue-300 text-[10px] font-medium tracking-wider uppercase">Smart Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Role Badge */}
        <div className="px-5 pb-3 shrink-0">
          <div className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide',
            isAdmin
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-400/30'
              : 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-400/30'
          )}>
            {isAdmin ? <Shield className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
            {isAdmin ? (isUrdu ? 'ایڈمن پینل' : 'Admin Panel') : (isUrdu ? 'کسٹمر پورٹل' : 'Customer Portal')}
          </div>
        </div>

        <Separator className="bg-white/10 shrink-0" />

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0 px-3 py-4">
          <nav className="space-y-4">
            {groups.map(group => (
              <div key={group}>
                <p className="text-[9px] font-bold text-blue-400/60 uppercase tracking-[0.15em] px-3 mb-2">{groupLabels[group] || group}</p>
                <div className="space-y-0.5">
                  {navItems.filter(item => item.group === group).map((item) => {
                    const Icon = item.icon
                    const isActive = activeModule === item.key
                    return (
                      <button
                        key={item.key}
                        onClick={() => { setActiveModule(item.key); setSidebarOpen(false) }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 rounded-xl font-medium transition-all duration-200',
                          isAdmin ? 'py-2.5 text-[13px]' : 'py-3 text-sm',
                          isActive
                            ? 'bg-white/10 backdrop-blur-md shadow-inner border border-white/10 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <Icon className={cn(isAdmin ? 'w-[18px] h-[18px]' : 'w-5 h-5', isActive ? 'text-blue-300' : 'text-slate-500')} />
                        {isUrdu ? item.labelUrdu : item.label}
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />}
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
        <div className="shrink-0 p-4 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
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
  )
}
