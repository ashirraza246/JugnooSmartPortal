'use client';

import { useSyncExternalStore, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import AppSidebar from '@/components/layout/AppSidebar';
import AppHeader from '@/components/layout/AppHeader';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ApplicationsList from '@/components/dashboard/ApplicationsList';
import ProfileSection from '@/components/dashboard/ProfileSection';
import ServicesBrowser from '@/components/services/ServicesBrowser';
import ServiceApplicationWizard from '@/components/services/ServiceApplicationWizard';
import SuccessPage from '@/components/services/SuccessPage';
import CVBuilder from '@/components/cv-builder/CVBuilder';

const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Home() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const activeView = useAppStore((s) => s.activeView);
  const user = useAppStore((s) => s.user);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const mounted = useHydrated();

  useEffect(() => {
    if (isAuthenticated && (activeView === 'login' || activeView === 'register')) {
      useAppStore.getState().setActiveView(user?.role === 'admin' ? 'admin' : 'dashboard');
    }
  }, [isAuthenticated, activeView, user]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001a33] via-[#003366] to-[#001a33]">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth pages (not authenticated)
  if (!isAuthenticated) {
    return (
      <>
        <AnimatePresence mode="wait">
          {activeView === 'register' ? (
            <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RegisterForm />
            </motion.div>
          ) : (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoginForm />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Authenticated layout with sidebar + header
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <CustomerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'services':
        return <ServicesBrowser />;
      case 'wizard':
        return <ServiceApplicationWizard />;
      case 'applications':
        return <ApplicationsList />;
      case 'profile':
        return <ProfileSection />;
      case 'cv-builder':
        return <CVBuilder />;
      case 'success':
        return <SuccessPage />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppSidebar />

      <motion.div
        animate={{ marginLeft: sidebarOpen ? 280 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block"
      >
        <div className="min-h-screen">
          <AppHeader />
          <main className="p-4 lg:p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </motion.div>

      {/* Mobile layout - no sidebar offset */}
      <div className="lg:hidden">
        <div className="min-h-screen">
          <AppHeader />
          <main className="p-4 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

    </div>
  );
}
