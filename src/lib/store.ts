import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'status' | 'payment' | 'deadline' | 'info'
  isRead: boolean
  createdAt: string
  link?: string
}

export type AdminModuleKey =
  | 'dashboard'
  | 'whatsapp'
  | 'orders'
  | 'customers'
  | 'govt'
  | 'notarisation'
  | 'service-mgmt'
  | 'documents'
  | 'cvbuilder'
  | 'payments'
  | 'pricing'
  | 'commission'
  | 'inventory'
  | 'team'
  | 'settings'
  | 'help'

export type CustomerModuleKey =
  | 'customer-dashboard'
  | 'services'
  | 'my-applications'
  | 'my-orders'
  | 'payments'
  | 'whatsapp'
  | 'profile'
  | 'notifications'
  | 'support-chat'
  | 'help'

export type ModuleKey = AdminModuleKey | CustomerModuleKey

// --- Notification localStorage persistence ---
const NOTIFICATION_READ_KEY = 'jugnoo_notification_read_ids'
const NOTIFICATION_DISMISSED_KEY = 'jugnoo_notification_dismissed'

// Get read notification IDs from localStorage
function getReadIdsFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(NOTIFICATION_READ_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch {}
  return new Set()
}

// Save read notification IDs to localStorage
function saveReadIdsToStorage(ids: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify([...ids]))
  } catch {}
}

// Check if a notification ID has been dismissed (hidden) by user
function getDismissedIdsFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(NOTIFICATION_DISMISSED_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch {}
  return new Set()
}

// Save dismissed notification IDs to localStorage
function saveDismissedIdsToStorage(ids: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NOTIFICATION_DISMISSED_KEY, JSON.stringify([...ids]))
  } catch {}
}

// Default notifications (only shown if not dismissed)
const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'Jugnoo Smart Portal mein Khush Aamdeed!',
    message: 'Aap ka account successfully create ho gaya hai. Ab aap services apply kar sakte hain.',
    type: 'info',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'BISP Registration Open Hai',
    message: 'BISP ki registration saal bhar khuli rehti hai. Abhi apply karein!',
    type: 'deadline',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

// Initialize notifications with read status from localStorage
function initializeNotifications(): Notification[] {
  const readIds = getReadIdsFromStorage()
  const dismissedIds = getDismissedIdsFromStorage()
  return defaultNotifications
    .filter(n => !dismissedIds.has(n.id))
    .map(n => ({
      ...n,
      isRead: readIds.has(n.id),
    }))
}

interface AppState {
  activeModule: ModuleKey
  setActiveModule: (module: ModuleKey) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedOrderId: string | null
  setSelectedOrderId: (id: string | null) => void
  selectedCustomerId: string | null
  setSelectedCustomerId: (id: string | null) => void
  selectedServiceCategory: string | null
  setSelectedServiceCategory: (category: string | null) => void
  isUrdu: boolean
  toggleUrdu: () => void
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module, selectedOrderId: null, selectedCustomerId: null }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedOrderId: null,
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  selectedServiceCategory: null,
  setSelectedServiceCategory: (category) => set({ selectedServiceCategory: category }),
  isUrdu: false,
  toggleUrdu: () => set((state) => ({ isUrdu: !state.isUrdu })),
  notifications: initializeNotifications(),
  addNotification: (notification) => set((state) => {
    const newNotif: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    return {
      notifications: [newNotif, ...state.notifications],
    }
  }),
  markNotificationRead: (id) => set((state) => {
    // Save to localStorage
    const readIds = getReadIdsFromStorage()
    readIds.add(id)
    saveReadIdsToStorage(readIds)

    return {
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }
  }),
  markAllNotificationsRead: () => set((state) => {
    // Save all IDs to localStorage
    const readIds = getReadIdsFromStorage()
    state.notifications.forEach(n => readIds.add(n.id))
    saveReadIdsToStorage(readIds)

    return {
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }
  }),
  clearNotification: (id) => set((state) => {
    // Mark as dismissed in localStorage so it doesn't reappear
    const dismissedIds = getDismissedIdsFromStorage()
    dismissedIds.add(id)
    saveDismissedIdsToStorage(dismissedIds)

    // Also mark as read
    const readIds = getReadIdsFromStorage()
    readIds.add(id)
    saveReadIdsToStorage(readIds)

    return {
      notifications: state.notifications.filter((n) => n.id !== id),
    }
  }),
  clearAllNotifications: () => set((state) => {
    // Mark all as dismissed in localStorage
    const dismissedIds = getDismissedIdsFromStorage()
    const readIds = getReadIdsFromStorage()
    state.notifications.forEach(n => {
      dismissedIds.add(n.id)
      readIds.add(n.id)
    })
    saveDismissedIdsToStorage(dismissedIds)
    saveReadIdsToStorage(readIds)

    return {
      notifications: [],
    }
  }),
}))
