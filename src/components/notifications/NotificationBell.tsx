'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const clearNotification = useAppStore((s) => s.clearNotification);
  const clearAllNotifications = useAppStore((s) => s.clearAllNotifications);
  const { isAdmin } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'status': return 'bg-[#E8F0FE] text-[#1A3C5E]';
      case 'payment': return 'bg-[#E8F5E9] text-[#2E7D32]';
      case 'deadline': return 'bg-[#FFF3D6] text-[#F5A623]';
      case 'info': return 'bg-[#F3E5F5] text-[#7B1FA2]';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'status': return 'Status';
      case 'payment': return 'Payment';
      case 'deadline': return 'Deadline';
      case 'info': return 'Info';
      default: return type;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Abhi / Just now';
    if (hours < 24) return `${hours} ghante pehle / ${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} din pehle / ${days}d ago`;
    return date.toLocaleDateString('en-PK');
  };

  // Both admin and customer headers are now navy blue, so bell is always white
  const bellColor = 'text-white';
  const bellHoverBg = 'hover:bg-white/10';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors touch-target min-w-[44px] min-h-[44px] flex items-center justify-center ${bellHoverBg}`}
      >
        <Bell className={`w-5 h-5 ${bellColor}`} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop - click to close */}
            <div
              className="fixed inset-0 bg-black/30 z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification panel */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden z-50
                w-[calc(100vw-16px)] sm:w-96 max-h-[80vh]"
            >
              {/* Mobile drag handle */}
              <div className="flex justify-center pt-2 pb-0 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-[#1A3C5E] to-[#003E6B] flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-sm">Notifications / اطلاعات</h3>
                  <p className="text-blue-200 text-xs">{unreadCount} padhi nahi / unread</p>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={markAllNotificationsRead}
                      className="text-blue-200 hover:text-white hover:bg-white/10 text-xs h-8"
                    >
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Sab parhein
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearAllNotifications}
                      className="text-red-300 hover:text-red-200 hover:bg-red-500/10 text-xs h-8"
                      title="Sab hatao / Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  {/* Close button - visible on all screens */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="text-blue-200 hover:text-white hover:bg-white/10 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notification list */}
              <ScrollArea className="max-h-[60vh]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Koi notification nahi / No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.slice(0, 10).map((notif) => (
                      <motion.div
                        key={notif.id}
                        className={`p-3 cursor-pointer hover:bg-[#F5F7FA] transition-colors group relative ${
                          !notif.isRead ? 'bg-[#E8F0FE]/30' : ''
                        }`}
                        onClick={() => markNotificationRead(notif.id)}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeColor(notif.type)}`}>
                            {getTypeLabel(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-[#1A3C5E]' : 'text-[#6B7280]'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notif.isRead && (
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#F5A623] mt-2" />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notif.id);
                              }}
                              className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-opacity"
                              title="Hatao / Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
