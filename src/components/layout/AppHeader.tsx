'use client'

import { useAppStore, type ModuleKey } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { Menu, Search, Shield, UserCircle, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import NotificationBell from '@/components/notifications/NotificationBell'

const moduleTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  whatsapp: 'WhatsApp Templates',
  orders: 'Orders',
  customers: 'Customers',
  govt: 'Government Services',
  notarisation: 'Notarisation',
  'service-mgmt': 'Service Manager',
  documents: 'Document Services',
  cvbuilder: 'CV Builder',
  payments: 'Payments',
  pricing: 'Pricing Rules',
  inventory: 'Inventory',
  team: 'Team & Access',
  settings: 'Settings',
  'customer-dashboard': 'Home',
  services: 'Services',
  'my-applications': 'My Applications',
  'my-orders': 'My Orders',
  profile: 'Profile',
  notifications: 'Notifications',
  cvbuilder: 'CV Builder',
}

const moduleTitlesUrdu: Record<string, string> = {
  dashboard: 'ڈیش بورڈ',
  whatsapp: 'واٹس ایپ ٹیمپلیٹس',
  orders: 'آرڈرز',
  customers: 'کسٹمرز',
  govt: 'سرکاری سروسز',
  notarisation: 'نٹریزیشن',
  'service-mgmt': 'سروس مینیجر',
  documents: 'دستاویز سروسز',
  cvbuilder: 'سی وی بلڈر',
  payments: 'پیمنٹس',
  pricing: 'قیمتیں',
  inventory: 'انوینٹری',
  team: 'ٹیم و رسائی',
  settings: 'سیٹنگز',
  'customer-dashboard': 'ہوم',
  services: 'سروسز',
  'my-applications': 'میری درخواستیں',
  'my-orders': 'میرے آرڈرز',
  profile: 'پروفائل',
  notifications: 'اطلاعات',
  cvbuilder: 'سی وی بنائیں',
}

export function AppHeader() {
  const { activeModule, setSidebarOpen, searchQuery, setSearchQuery, isUrdu, toggleUrdu } = useAppStore()
  const { isAdmin, user } = useAuth()

  const titles = isUrdu ? moduleTitlesUrdu : moduleTitles

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-blue-100/60 px-4 sm:px-6 py-3 shadow-sm relative">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2980b9]/30 to-transparent" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden hover:bg-blue-50" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5 text-[#003366]" />
        </Button>

        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#003366] hidden sm:block">
            {titles[activeModule] || 'Dashboard'}
          </h2>
          <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-[10px] border-[#003366]/30 text-[#003366] bg-[#003366]/5">
            {isAdmin ? <><Shield className="w-3 h-3 text-[#2980b9]" /> Admin</> : <><UserCircle className="w-3 h-3 text-[#2980b9]" /> Customer</>}
          </Badge>
        </div>

        <div className="flex-1 max-w-md ml-auto sm:ml-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2980b9]" />
            <Input
              placeholder={isUrdu ? 'تلاش کریں...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-[#003366]/5 border-[#003366]/10 focus-visible:ring-[#2980b9]/30 focus-visible:border-[#2980b9]/50 placeholder:text-[#003366]/30"
            />
          </div>
        </div>

        {/* Urdu Toggle Button - Premium Style */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleUrdu}
          className={`gap-1.5 border-2 font-medium transition-all rounded-lg ${
            isUrdu
              ? 'bg-gradient-to-r from-[#003366] to-[#2980b9] text-white border-[#003366] shadow-sm'
              : 'border-[#003366]/30 text-[#003366] hover:bg-[#003366]/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          {isUrdu ? 'English' : 'اردو'}
        </Button>

        <NotificationBell />
      </div>
    </header>
  )
}
