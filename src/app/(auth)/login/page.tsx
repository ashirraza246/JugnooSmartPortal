'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { PremiumBootScreen } from '@/components/PremiumBootScreen'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBootScreen, setShowBootScreen] = useState(false)
  const [bootUserName, setBootUserName] = useState('')
  const [bootIsAdmin, setBootIsAdmin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Use the ACTUAL role from the API response (stored in auth context)
        // The login function already saves user with correct role to localStorage
        const savedUser = localStorage.getItem('jugnoo_user')
        const userData = savedUser ? JSON.parse(savedUser) : null
        const isAdminRole = userData?.role === 'admin'
        const userName = userData?.full_name || email.split('@')[0]

        setBootUserName(userName)
        setBootIsAdmin(isAdminRole)
        setShowBootScreen(true)
      }
    } catch {
      setError('Kuch ghalti ho gayi. Dobara try karein.')
      setLoading(false)
    }
  }

  const handleBootComplete = () => {
    router.push('/')
  }

  // Show premium boot screen after login
  if (showBootScreen) {
    return <PremiumBootScreen userName={bootUserName} isAdmin={bootIsAdmin} onComplete={handleBootComplete} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #001a33 0%, #003366 30%, #1a5276 60%, #2980b9 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3498db]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-auto max-w-[200px] h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-2xl bg-white"
            style={{ animation: 'logoFloat 4s ease-in-out infinite', boxShadow: '0 0 40px rgba(52,152,219,0.3)' }}
          >
            <img src="/jugnoo-photos-logo.jpg" alt="Jugnoo Photos" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white">Jugnoo Smart Portal</h1>
          <p className="text-white/60 mt-1">AI-Powered Business Management</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Apna account login karein</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="apna@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required disabled={loading} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-[#3498db] hover:text-[#2980b9] font-medium">Password bhool gaye?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Apna password daalein" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#003366] to-[#1a5276] hover:from-[#1a5276] hover:to-[#2980b9] text-white font-semibold py-2.5 shadow-lg transition-all duration-300" disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Login ho raha hai...</>) : (<>{'Login Karein'}<ArrowRight className="w-4 h-4 ml-2" /></>)}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">Account nahi hai? <Link href="/register" className="text-[#2980b9] hover:text-[#1a5276] font-semibold">Register Karein</Link></p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-medium flex items-center gap-1"><Sparkles className="w-3 h-3" /> Naya account? <Link href="/register" className="text-[#2980b9] font-semibold hover:underline ml-1">Register Karein</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
