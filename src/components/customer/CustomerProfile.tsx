'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Phone, MapPin, Shield, Edit2, Save, Loader2 } from 'lucide-react'

export function CustomerProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, ...form }),
      })
      const data = await res.json()
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      } else {
        // Update local storage
        const updatedUser = { ...user, ...form }
        localStorage.setItem('jugnoo_user', JSON.stringify(updatedUser))
        setEditing(false)
        toast({ title: 'Profile Updated!', description: 'Aapki profile update ho gayi hai.' })
      }
    } catch {
      toast({ title: 'Error', description: 'Profile update nahi ho saki.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Meri Profile</h2>
        <p className="text-muted-foreground">Apni profile information update karein</p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        <CardContent className="pt-0 -mt-10">
          <div className="flex items-end gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-amber-600 bg-gradient-to-br from-amber-100 to-orange-100">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="pb-1">
              <h3 className="text-xl font-bold">{user?.full_name}</h3>
              <p className="text-sm text-muted-foreground">{user?.role === 'admin' ? 'Admin' : 'Customer'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Profile Details</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              {editing ? <><Save className="w-4 h-4 mr-1" /> Save</> : <><Edit2 className="w-4 h-4 mr-1" /> Edit</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><User className="w-4 h-4" /> Pura Naam</Label>
            {editing ? (
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Apna pura naam" />
            ) : (
              <p className="text-sm p-2 bg-muted/50 rounded-lg">{user?.full_name || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
            <p className="text-sm p-2 bg-muted/50 rounded-lg">{user?.email || 'N/A'}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</Label>
            {editing ? (
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            ) : (
              <p className="text-sm p-2 bg-muted/50 rounded-lg">{user?.phone || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Shield className="w-4 h-4" /> Account Type</Label>
            <p className="text-sm p-2 bg-muted/50 rounded-lg capitalize">{user?.role || 'customer'}</p>
          </div>

          {editing && (
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Profile Save Karein'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
