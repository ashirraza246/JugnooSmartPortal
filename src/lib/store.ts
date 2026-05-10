import { create } from 'zustand'

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
}))
