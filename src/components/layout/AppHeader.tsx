'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function AppHeader() {
  const user = useAppStore((s) => s.user);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const logout = useAppStore((s) => s.logout);
  const activeView = useAppStore((s) => s.activeView);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard / ڈیش بورڈ',
      services: 'Services / خدمات',
      wizard: 'Apply / درخواست',
      applications: 'My Applications / درخواستیں',
      'cv-builder': 'CV Builder / سی وی بنائیں',
      profile: 'Profile / پروفائل',
      admin: 'Admin Panel / ایڈمن',
      eligibility: 'Eligibility / اہلیت',
      payment: 'Payment / ادائیگی',
      success: 'Success / کامیابی',
    };
    return titles[activeView] || 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
          >
            <Menu className="w-6 h-6 text-[#003366]" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-[#003366]">{getViewTitle()}</h1>
          </div>
        </div>

        {/* Search bar - hidden on mobile */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search services... / تلاش کریں"
              className="pl-9 h-10 bg-gray-50 border-gray-200 focus:border-[#2980b9] focus:ring-[#2980b9]"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors touch-target"
            >
              <Avatar className="w-9 h-9 border-2 border-[#2980b9]">
                <AvatarFallback className="bg-gradient-to-br from-[#003366] to-[#2980b9] text-white text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#003366] leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-400 leading-tight">{user?.role === 'admin' ? 'Admin' : 'Customer'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-[#001a33] to-[#003366]">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-[#d4a843]">
                        <AvatarFallback className="bg-[#2980b9] text-white text-lg font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-semibold">{user?.name}</p>
                        <p className="text-blue-200 text-sm">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        useAppStore.getState().setActiveView('profile');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile / پروفائل</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout / لاگ آؤٹ</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
