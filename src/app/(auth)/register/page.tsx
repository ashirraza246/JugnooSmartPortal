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
import { Printer, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Loader2, CheckCircle2, Shield, Key } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isAdminRegistration, setIsAdminRegistration] = useState(false)
  const [adminCode, setAdminCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords match nahi kartay')
      return
    }
    if (password.length < 6) {
      setError('Password kam az kam 6 characters ka hona chahiye')
      return
    }

    setLoading(true)
    try {
      if (isAdminRegistration) {
        // Register admin via setup-admin route
        const res = await fetch('/api/auth/setup-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName, phone, adminCode }),
        })
        const data = await res.json()
        if (data.error) {
          setError(data.error)
        } else {
          setSuccess(true)
          setTimeout(() => router.push('/login'), 3000)
        }
      } else {
        const result = await register(email, password, fullName, phone)
        if (result.error) {
          setError(result.error)
        } else {
          setSuccess(true)
          setTimeout(() => router.push('/login'), 3000)
        }
      }
    } catch {
      setError('Kuch ghalti ho gayi. Dobara try karein.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold">Registration Successful!</h2>
              <p className="text-muted-foreground">Ab aap login page par redirect ho rahe hain...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #001a33 0%, #003366 30%, #1a5276 60%, #2980b9 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3498db]/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-auto max-w-[180px] h-16 rounded-2xl overflow-hidden mx-auto mb-3 shadow-2xl bg-white" style={{ boxShadow: '0 0 30px rgba(52,152,219,0.3)' }}>
            <img src="/jugnoo-photos-logo.jpg" alt="Jugnoo Photos" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Jugnoo Smart Portal</h1>
          <p className="text-amber-200/70 text-sm">Naya Account Banayein</p>
        </div>
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center">Register Karein</CardTitle>
            <CardDescription className="text-center">Apna account banayein aur portal access karein</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}

              {/* Account Type Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-border">
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${!isAdminRegistration ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  onClick={() => setIsAdminRegistration(false)}
                >
                  <User className="w-4 h-4" /> Customer
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${isAdminRegistration ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  onClick={() => setIsAdminRegistration(true)}
                >
                  <Shield className="w-4 h-4" /> Admin / Staff
                </button>
              </div>

              {isAdminRegistration && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800 font-medium mb-1 flex items-center gap-1"><Key className="w-3 h-3" /> Admin Registration</p>
                  <p className="text-xs text-amber-700">Admin/Staff account ke liye admin code chahiye. Shop owner se code lein.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Pura Naam</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="fullName" placeholder="Apna pura naam likhein" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required disabled={loading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="923001234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" required disabled={loading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="apna@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required disabled={loading} />
                </div>
              </div>
              {isAdminRegistration && (
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="adminCode" placeholder="Admin code daalein" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className="pl-10" required disabled={loading} />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Kam az kam 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Password dobara likhein" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" required disabled={loading} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2.5 shadow-lg" disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Account ban raha hai...</>) : (<>Account Banayein<ArrowRight className="w-4 h-4 ml-2" /></>)}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Pehle se account hai? <Link href="/login" className="text-amber-600 hover:text-amber-700 font-semibold">Login Karein</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
