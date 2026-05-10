'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email daalein')
      return
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password kam az kam 6 characters ka hona chahiye')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords match nahi kartay')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: newPassword || undefined }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Kuch ghalti ho gayi. Dobara try karein.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #001a33 0%, #003366 30%, #1a5276 60%, #2980b9 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3498db]/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 shadow-2xl shadow-amber-500/20">
            <img src="/jugnoo-logo.png" alt="Jugnoo" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Jugnoo Smart Portal</h1>
        </div>
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center">Password Reset</CardTitle>
            <CardDescription className="text-center">Apna email aur naya password daalein</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-emerald-700 font-medium">Password update ho gaya!</p>
                <p className="text-sm text-muted-foreground">Ab naye password se login karein.</p>
                <Link href="/login">
                  <Button className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Login Page par Jayein
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Registered Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="apna@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required disabled={loading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Naya Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="newPassword" type={showPassword ? 'text' : 'password'} placeholder="Kam az kam 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 pr-10" disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {newPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Naya Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Naya password dobara likhein" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" disabled={loading} />
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2.5 shadow-lg" disabled={loading}>
                  {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Reset ho raha hai...</>) : 'Password Reset Karein'}
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Login par wapas jayein
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
