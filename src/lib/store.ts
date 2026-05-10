import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service, ServiceCategory } from './data';
import { serviceCategories } from './data';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  phone?: string;
  cnic?: string;
  city?: string;
  income?: number;
  age?: number;
  gender?: string;
}

export interface Application {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  amount?: number;
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: string;
  formData: Record<string, string>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status' | 'payment' | 'deadline' | 'info';
  isRead: boolean;
  createdAt: string;
}

export interface PaymentConfig {
  jazzCashNumber: string;
  easyPaisaNumber: string;
  bankName: string;
  bankAccount: string;
  bankTitle: string;
}

export interface CVData {
  fullName: string;
  fatherName: string;
  cnic: string;
  phone: string;
  address: string;
  city: string;
  age: string;
  gender: string;
  education: string;
  skills: string[];
  workExperience: string;
  languages: string[];
  template: string;
}

// Store type
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Services
  categories: ServiceCategory[];
  selectedService: Service | null;
  selectedCategory: ServiceCategory | null;

  // Applications
  currentStep: number;
  applications: Application[];
  currentApplication: Partial<Application> | null;
  selectedLoanAmount: number;
  selectedLoanTier: string;

  // Notifications
  notifications: Notification[];

  // Payment
  paymentConfig: PaymentConfig;
  servicePrices: Record<string, number>;

  // CV
  cvData: CVData;

  // UI
  sidebarOpen: boolean;
  activeView: 'login' | 'register' | 'dashboard' | 'services' | 'wizard' | 'cv-builder' | 'admin' | 'applications' | 'profile' | 'eligibility' | 'payment' | 'success';

  // Auth Actions
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;

  // Service Actions
  setSelectedService: (service: Service | null) => void;
  setSelectedCategory: (category: ServiceCategory | null) => void;

  // Application Actions
  setCurrentStep: (step: number) => void;
  submitApplication: (application: Application) => void;
  setCurrentApplication: (app: Partial<Application> | null) => void;
  setSelectedLoanAmount: (amount: number) => void;
  setSelectedLoanTier: (tier: string) => void;
  resetWizard: () => void;

  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;

  // Payment Actions
  updatePaymentConfig: (config: Partial<PaymentConfig>) => void;
  setServicePrice: (serviceId: string, price: number) => void;

  // CV Actions
  updateCVData: (data: Partial<CVData>) => void;
  resetCVData: () => void;

  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: AppState['activeView']) => void;
}

const defaultPaymentConfig: PaymentConfig = {
  jazzCashNumber: '0300-1234567',
  easyPaisaNumber: '0312-9876543',
  bankName: 'United Bank Limited (UBL)',
  bankAccount: '1234-5678-9012-3456',
  bankTitle: 'Jugnoo Smart Portal - Government Services',
};

const defaultCVData: CVData = {
  fullName: '',
  fatherName: '',
  cnic: '',
  phone: '',
  address: '',
  city: '',
  age: '',
  gender: '',
  education: '',
  skills: [],
  workExperience: '',
  languages: ['Urdu'],
  template: '',
};

// Demo notifications
const demoNotifications: Notification[] = [
  {
    id: 'demo-1',
    userId: 'demo',
    title: 'Application Submitted',
    message: 'Aap ki Ehsaas Kafalat application successfully submit ho gayi hai. 3-5 din mein status update milega.',
    type: 'status',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    userId: 'demo',
    title: 'Payment Confirmed',
    message: 'Rs. 500 ka payment receive ho gaya hai. Aap ki application process ho rahi hai.',
    type: 'payment',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-3',
    userId: 'demo',
    title: 'Deadline Reminder',
    message: 'PM Kamyab Jawan Loan ki last date 31 December 2025 hai. Jaldi apply karein!',
    type: 'deadline',
    isRead: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'demo-4',
    userId: 'demo',
    title: 'New Service Available',
    message: 'Sehat Card Plus ab Jugnoo Portal par available hai. Abhi apply karein!',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth Initial State
      user: null,
      isAuthenticated: false,

      // Services Initial State
      categories: serviceCategories,
      selectedService: null,
      selectedCategory: null,

      // Applications Initial State
      currentStep: 1,
      applications: [],
      currentApplication: null,
      selectedLoanAmount: 0,
      selectedLoanTier: '',

      // Notifications Initial State
      notifications: demoNotifications,

      // Payment Initial State
      paymentConfig: defaultPaymentConfig,
      servicePrices: {},

      // CV Initial State
      cvData: defaultCVData,

      // UI Initial State
      sidebarOpen: true,
      activeView: 'login',

      // Auth Actions
      login: (email: string, password: string) => {
        if (email === 'admin@jugnoo.pk' && password === 'jugnoo123') {
          const adminUser: User = {
            id: 'admin-001',
            email: 'admin@jugnoo.pk',
            name: 'Admin Jugnoo',
            role: 'admin',
          };
          set({
            user: adminUser,
            isAuthenticated: true,
            activeView: 'admin',
          });
          return true;
        }
        // Check existing registered users
        const registeredUsers = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('jugnoo-users') || '[]')
          : [];
        const found = registeredUsers.find(
          (u: { email: string; password: string }) => u.email === email && u.password === password
        );
        if (found) {
          const user: User = {
            id: found.id,
            email: found.email,
            name: found.name,
            role: 'customer',
            phone: found.phone,
            cnic: found.cnic,
            city: found.city,
            income: found.income,
            age: found.age,
            gender: found.gender,
          };
          set({
            user,
            isAuthenticated: true,
            activeView: 'dashboard',
          });
          return true;
        }
        return false;
      },

      register: (name: string, email: string, password: string) => {
        const registeredUsers = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('jugnoo-users') || '[]')
          : [];
        const exists = registeredUsers.find(
          (u: { email: string }) => u.email === email
        );
        if (exists) return false;

        const newUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          password,
          role: 'customer',
          phone: '',
          cnic: '',
          city: '',
          income: undefined,
          age: undefined,
          gender: '',
        };
        registeredUsers.push(newUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('jugnoo-users', JSON.stringify(registeredUsers));
        }
        const user: User = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: 'customer',
        };
        set({
          user,
          isAuthenticated: true,
          activeView: 'dashboard',
        });
        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          activeView: 'login',
          selectedService: null,
          selectedCategory: null,
          currentStep: 1,
          currentApplication: null,
          selectedLoanAmount: 0,
          selectedLoanTier: '',
          sidebarOpen: true,
        });
      },

      updateUserProfile: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data };
          set({ user: updatedUser });
          // Also update in localStorage registered users
          if (typeof window !== 'undefined') {
            const registeredUsers = JSON.parse(localStorage.getItem('jugnoo-users') || '[]');
            const idx = registeredUsers.findIndex((u: { id: string }) => u.id === currentUser.id);
            if (idx >= 0) {
              registeredUsers[idx] = { ...registeredUsers[idx], ...data };
              localStorage.setItem('jugnoo-users', JSON.stringify(registeredUsers));
            }
          }
        }
      },

      // Service Actions
      setSelectedService: (service) => set({ selectedService: service }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Application Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      submitApplication: (application) => {
        set((state) => ({
          applications: [...state.applications, application],
        }));
        // Add notification
        get().addNotification({
          userId: application.userId,
          title: 'Application Submitted',
          message: `Aap ki ${application.serviceName} application successfully submit ho gayi hai.`,
          type: 'status',
          isRead: false,
        });
      },
      setCurrentApplication: (app) => set({ currentApplication: app }),
      setSelectedLoanAmount: (amount) => set({ selectedLoanAmount: amount }),
      setSelectedLoanTier: (tier) => set({ selectedLoanTier: tier }),
      resetWizard: () =>
        set({
          currentStep: 1,
          selectedLoanAmount: 0,
          selectedLoanTier: '',
          currentApplication: null,
        }),

      // Notification Actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      // Payment Actions
      updatePaymentConfig: (config) => {
        set((state) => ({
          paymentConfig: { ...state.paymentConfig, ...config },
        }));
      },
      setServicePrice: (serviceId, price) => {
        set((state) => ({
          servicePrices: { ...state.servicePrices, [serviceId]: price },
        }));
      },

      // CV Actions
      updateCVData: (data) => {
        set((state) => ({
          cvData: { ...state.cvData, ...data },
        }));
      },
      resetCVData: () => set({ cvData: defaultCVData }),

      // UI Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveView: (view) => set({ activeView: view }),
    }),
    {
      name: 'jugnoo-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        applications: state.applications,
        notifications: state.notifications,
        paymentConfig: state.paymentConfig,
        servicePrices: state.servicePrices,
        activeView: state.activeView,
        cvData: state.cvData,
      }),
    }
  )
);
