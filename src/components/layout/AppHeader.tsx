'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore, type ModuleKey } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { Menu, Search, Shield, UserCircle, Globe, LogOut, HelpCircle, MessageCircle, Phone, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
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
  'support-chat': 'Support',
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
  'support-chat': 'سپورٹ',
}

export function AppHeader() {
  const { activeModule, setSidebarOpen, searchQuery, setSearchQuery, isUrdu, toggleUrdu, setActiveModule } = useAppStore()
  const { isAdmin, user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const titles = isUrdu ? moduleTitlesUrdu : moduleTitles
  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
        setSupportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Customer portal header - Dark navy UBL style
  if (!isAdmin) {
    return (
      <header className="sticky top-0 z-30 bg-[#1A3C5E] px-4 sm:px-6 py-3 shadow-sm relative">
        <div className="flex items-center gap-3">
          {/* Hamburger for desktop sidebar on mobile */}
          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/10 text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>

          {/* Greeting */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-base truncate">
              {isUrdu ? 'السلام علیکم' : 'Hello'}, {userName} 👋
            </h2>
          </div>

          {/* Urdu Toggle - styled for dark background */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleUrdu}
            className={`gap-1 font-medium transition-all rounded-lg border-0 ${
              isUrdu
                ? 'bg-[#F5A623] text-[#1A3C5E] hover:bg-[#FFB300]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Globe className="w-4 h-4" />
            {isUrdu ? 'EN' : 'اردو'}
          </Button>

          <NotificationBell />

          {/* Profile avatar - Clickable */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setSupportOpen(false) }}
              className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-[#1A3C5E] font-semibold text-sm shrink-0 hover:ring-2 hover:ring-[#F5A623]/50 hover:ring-offset-2 hover:ring-offset-[#1A3C5E] transition-all min-w-[44px] min-h-[44px]"
            >
              {userInitial}
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  {/* Mobile backdrop */}
                  <div className="fixed inset-0 z-40 sm:hidden" onClick={() => { setUserMenuOpen(false); setSupportOpen(false) }} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden z-50"
                  >
                    {/* User info header */}
                    <div className="p-4 bg-gradient-to-r from-[#1A3C5E] to-[#003E6B]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-[#1A3C5E] font-semibold text-sm">
                          {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{userName}</p>
                          <p className="text-blue-200 text-xs truncate">{userEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      {/* Profile */}
                      <button
                        onClick={() => { setActiveModule('profile'); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-[#1A3C5E]" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-[#1C1C1E]">{isUrdu ? 'پروفائل' : 'My Profile'}</p>
                          <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'اپنی تفصیلات دیکھیں' : 'View & edit your details'}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>

                      {/* Help */}
                      <button
                        onClick={() => { setActiveModule('customer-dashboard'); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FFF3D6] flex items-center justify-center">
                          <HelpCircle className="w-4 h-4 text-[#F5A623]" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-[#1C1C1E]">{isUrdu ? 'مدد' : 'Help'}</p>
                          <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'استعمال کرنے کی مدد' : 'How to use the app'}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>

                      {/* Support */}
                      <button
                        onClick={() => setSupportOpen(!supportOpen)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-[#2E7D32]" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-[#1C1C1E]">{isUrdu ? 'سپورٹ' : 'Support'}</p>
                          <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'ہم سے رابطہ کریں' : 'Chat with us or WhatsApp'}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${supportOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Support submenu */}
                      <AnimatePresence>
                        {supportOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-14 pr-4 py-2 space-y-1">
                              {/* Internal Chat */}
                              <button
                                onClick={() => { setActiveModule('support-chat'); setUserMenuOpen(false) }}
                                className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4 text-[#1A3C5E]" />
                                <div className="text-left">
                                  <p className="text-xs font-medium text-[#1C1C1E]">{isUrdu ? 'انٹرنل چیٹ' : 'Live Chat'}</p>
                                  <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'ایپ کے اندر چیٹ کریں' : 'Chat within the app'}</p>
                                </div>
                              </button>

                              {/* WhatsApp Support */}
                              <a
                                href="https://wa.me/923001234567?text=Hi%20Jugnoo%20Support%2C%20I%20need%20help%20with..."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <Phone className="w-4 h-4 text-green-600" />
                                <div className="text-left">
                                  <p className="text-xs font-medium text-[#1C1C1E]">{isUrdu ? 'واٹس ایپ سپورٹ' : 'WhatsApp Support'}</p>
                                  <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'واٹس ایپ پر چیٹ کریں' : 'Chat on WhatsApp'}</p>
                                </div>
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Divider */}
                      <div className="my-1 mx-4 border-t border-gray-100" />

                      {/* Sign Out */}
                      <button
                        onClick={() => { setUserMenuOpen(false); logout() }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-red-600">{isUrdu ? 'سائن آؤٹ' : 'Sign Out'}</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    )
  }

  // Admin header - UBL navy/gold style (matching customer portal)
  return (
    <header className="sticky top-0 z-30 bg-[#1A3C5E] px-4 sm:px-6 py-3 shadow-sm relative">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/10 text-white" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white hidden sm:block">
            {titles[activeModule] || 'Dashboard'}
          </h2>
          <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-[10px] border-[#F5A623]/40 text-[#F5A623] bg-[#F5A623]/10">
            <><Shield className="w-3 h-3 text-[#F5A623]" /> Admin</>
          </Badge>
        </div>

        <div className="flex-1 max-w-md ml-auto sm:ml-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              placeholder={isUrdu ? 'تلاش کریں...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#F5A623]/30 focus-visible:border-[#F5A623]/50 rounded-xl"
            />
          </div>
        </div>

        {/* Urdu Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleUrdu}
          className={`gap-1.5 font-medium transition-all rounded-lg border-0 ${
            isUrdu
              ? 'bg-[#F5A623] text-[#1A3C5E] hover:bg-[#FFB300]'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Globe className="w-4 h-4" />
          {isUrdu ? 'English' : 'اردو'}
        </Button>

        <NotificationBell />

        {/* Admin user avatar - Clickable */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setSupportOpen(false) }}
            className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-[#1A3C5E] font-semibold text-sm shrink-0 hover:ring-2 hover:ring-[#F5A623]/50 hover:ring-offset-2 hover:ring-offset-[#1A3C5E] transition-all min-w-[44px] min-h-[44px]"
          >
            {userInitial}
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40 sm:hidden" onClick={() => { setUserMenuOpen(false); setSupportOpen(false) }} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden z-50"
                >
                  {/* User info header */}
                  <div className="p-4 bg-gradient-to-r from-[#1A3C5E] to-[#003E6B]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-[#1A3C5E] font-semibold text-sm">
                        {userInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{userName}</p>
                        <p className="text-blue-200 text-xs truncate">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    {/* Profile / Settings */}
                    <button
                      onClick={() => { setActiveModule('settings'); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] flex items-center justify-center">
                        <UserCircle className="w-4 h-4 text-[#1A3C5E]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-[#1C1C1E]">{isUrdu ? 'سیٹنگز' : 'Settings'}</p>
                        <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'ایڈمن سیٹنگز' : 'Admin settings & profile'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>

                    {/* Help */}
                    <button
                      onClick={() => { setActiveModule('dashboard'); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#FFF3D6] flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-[#F5A623]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-[#1C1C1E]">{isUrdu ? 'مدد' : 'Help'}</p>
                        <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'استعمال کرنے کی مدد' : 'How to use the app'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>

                    {/* Support */}
                    <button
                      onClick={() => setSupportOpen(!supportOpen)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-[#2E7D32]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-[#1C1C1E]">{isUrdu ? 'سپورٹ' : 'Support'}</p>
                        <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'ہم سے رابطہ کریں' : 'Chat with us or WhatsApp'}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${supportOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Support submenu */}
                    <AnimatePresence>
                      {supportOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-14 pr-4 py-2 space-y-1">
                            {/* Internal Chat */}
                            <button
                              onClick={() => { setActiveModule('dashboard'); setUserMenuOpen(false) }}
                              className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4 text-[#1A3C5E]" />
                              <div className="text-left">
                                <p className="text-xs font-medium text-[#1C1C1E]">{isUrdu ? 'انٹرنل چیٹ' : 'Live Chat'}</p>
                                <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'ایپ کے اندر چیٹ کریں' : 'Chat within the app'}</p>
                              </div>
                            </button>

                            {/* WhatsApp Support */}
                            <a
                              href="https://wa.me/923001234567?text=Hi%20Jugnoo%20Support%2C%20I%20need%20help%20with..."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Phone className="w-4 h-4 text-green-600" />
                              <div className="text-left">
                                <p className="text-xs font-medium text-[#1C1C1E]">{isUrdu ? 'واٹس ایپ سپورٹ' : 'WhatsApp Support'}</p>
                                <p className="text-[10px] text-[#6B7280]">{isUrdu ? 'واٹس ایپ پر چیٹ کریں' : 'Chat on WhatsApp'}</p>
                              </div>
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="my-1 mx-4 border-t border-gray-100" />

                    {/* Sign Out */}
                    <button
                      onClick={() => { setUserMenuOpen(false); logout() }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-red-600">{isUrdu ? 'سائن آؤٹ' : 'Sign Out'}</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
