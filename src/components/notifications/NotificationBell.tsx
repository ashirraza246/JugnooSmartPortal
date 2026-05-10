'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const clearNotification = useAppStore((s) => s.clearNotification);
  const clearAllNotifications = useAppStore((s) => s.clearAllNotifications);
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
      case 'status': return 'bg-blue-100 text-blue-700';
      case 'payment': return 'bg-green-100 text-green-700';
      case 'deadline': return 'bg-orange-100 text-orange-700';
      case 'info': return 'bg-purple-100 text-purple-700';
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors touch-target"
      >
        <Bell className="w-6 h-6 text-[#003366]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#001a33] to-[#003366] flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Notifications / اطلاعات</h3>
                <p className="text-blue-200 text-xs">{unreadCount} padhi nahi / unread</p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllNotificationsRead}
                    className="text-blue-200 hover:text-white hover:bg-white/10 text-xs"
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
                    className="text-red-300 hover:text-red-200 hover:bg-red-500/10 text-xs"
                    title="Sab hatao / Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <ScrollArea className="max-h-96">
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
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors group relative ${
                        !notif.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => markNotificationRead(notif.id)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notif.type)}`}>
                          {getTypeLabel(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.isRead ? 'font-semibold text-[#003366]' : 'text-gray-700'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notif.isRead && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#2980b9] mt-2" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notif.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
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
        )}
      </AnimatePresence>
    </div>
  );
}
