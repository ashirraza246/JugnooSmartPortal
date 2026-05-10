'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  phone: string
  is_active: boolean
}

interface LoginResult {
  error: string | null
  user?: UserProfile | null
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  register: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>
  logout: () => void
  isAdmin: boolean
  isCustomer: boolean
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: () => {},
  isAdmin: false,
  isCustomer: true,
  refreshUser: () => {},
})

// ONLY these roles get admin access - hardcoded for security
const ADMIN_ROLES = ['admin', 'staff']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    let mounted = true
    try {
      const savedUser = localStorage.getItem('jugnoo_user')
      if (savedUser && mounted) {
        const parsed = JSON.parse(savedUser) as UserProfile
        setUser(parsed)
      }
    } catch {
      // ignore parse errors
    } finally {
      if (mounted) setLoading(false)
    }
    return () => { mounted = false }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (data.error) {
        return { error: data.error, user: null }
      }

      if (data.user) {
        const userData: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.full_name,
          role: data.user.role,  // Use ONLY the role from the database
          phone: data.user.phone,
          is_active: data.user.is_active,
        }
        setUser(userData)
        localStorage.setItem('jugnoo_user', JSON.stringify(userData))
        return { error: null, user: userData }
      }

      return { error: 'Email ya password ghalt hai', user: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Login failed', user: null }
    }
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string, phone: string): Promise<{ error: string | null }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone }),
      })

      const data = await res.json()
      if (data.error) {
        return { error: data.error }
      }

      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Registration failed' }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('jugnoo_user')
    window.location.href = '/login'
  }, [])

  const refreshUser = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('jugnoo_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as UserProfile
        setUser(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // CRITICAL: Admin check is based ONLY on the role field from database
  // 'admin' or 'staff' roles get admin access, everything else is customer
  const isAdmin = user?.role ? ADMIN_ROLES.includes(user.role) : false
  const isCustomer = !isAdmin

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isCustomer, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
