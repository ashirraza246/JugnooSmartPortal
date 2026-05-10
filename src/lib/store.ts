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
  | 'inventory'
  | 'team'
  | 'settings'

export type CustomerModuleKey =
  | 'customer-dashboard'
  | 'services'
  | 'my-applications'
  | 'my-orders'
  | 'payments'
  | 'whatsapp'
  | 'profile'
  | 'notifications'
  | 'cvbuilder'

export type ModuleKey = AdminModuleKey | CustomerModuleKey

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
  notifications: [
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
  ],
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: `notif_${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...state.notifications,
    ],
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    ),
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
  })),
}))
