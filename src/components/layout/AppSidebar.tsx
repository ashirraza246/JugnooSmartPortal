'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Bell,
  CreditCard,
  User,
  Briefcase,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings,
  Users,
  BarChart3,
  X,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const customerNavItems = [
  { id: 'dashboard' as const, label: 'Home / ہوم', icon: LayoutDashboard },
  { id: 'services' as const, label: 'Services / خدمات', icon: FileText },
  { id: 'applications' as const, label: 'My Applications / درخواستیں', icon: Briefcase },
  { id: 'cv-builder' as const, label: 'CV Builder / سی وی', icon: GraduationCap },
  { id: 'profile' as const, label: 'Profile / پروفائل', icon: User },
];

const adminNavItems = [
  { id: 'admin' as const, label: 'Dashboard / ڈیش بورڈ', icon: BarChart3 },
  { id: 'services' as const, label: 'Services / خدمات', icon: FileText },
  { id: 'applications' as const, label: 'Applications / درخواستیں', icon: Briefcase },
  { id: 'profile' as const, label: 'Settings / ترتیبات', icon: Settings },
];

export default function AppSidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const user = useAppStore((s) => s.user);
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const logout = useAppStore((s) => s.logout);

  const navItems = user?.role === 'admin' ? adminNavItems : customerNavItems;

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId as typeof activeView);
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 72,
          x: sidebarOpen || typeof window !== 'undefined' ? 0 : -280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full sidebar-gradient z-50 flex flex-col overflow-hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3 min-h-[72px]">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#2980b9] to-[#d4a843] flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <h2 className="text-white font-bold text-lg whitespace-nowrap">Jugnoo</h2>
                <p className="text-blue-300 text-xs whitespace-nowrap">Smart Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-white/60 hover:text-white hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-white/60 hover:text-white flex lg:hidden items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Separator className="bg-white/10" />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 touch-target
                    ${isActive
                      ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                      : 'text-blue-200/80 hover:bg-white/8 hover:text-white'
                    }
                  `}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    ${isActive ? 'bg-[#2980b9]' : 'bg-white/5'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && sidebarOpen && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4a843]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2980b9] to-[#d4a843] flex items-center justify-center">
              {user?.role === 'admin' ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-blue-300 text-xs truncate">{user?.role === 'admin' ? 'Admin' : 'Customer'}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={logout}
                  className="text-red-300 hover:text-red-200 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
