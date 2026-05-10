'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Phone, Shield, Edit2, Save, Loader2 } from 'lucide-react'

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
        <h2 className="text-2xl font-bold text-[#1C1C1E]">Meri Profile</h2>
        <p className="text-[#6B7280]">Apni profile information update karein</p>
      </div>

      {/* Profile Card - Navy header instead of orange */}
      <Card className="border-0 shadow-sm overflow-hidden rounded-2xl">
        <div className="h-24 bg-gradient-to-r from-[#1A3C5E] to-[#003E6B]" />
        <CardContent className="pt-0 -mt-10">
          <div className="flex items-end gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-[#1A3C5E] bg-gradient-to-br from-[#E8F0FE] to-[#F5F7FA]">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="pb-1">
              <h3 className="text-xl font-bold text-[#1C1C1E]">{user?.full_name}</h3>
              <p className="text-sm text-[#6B7280]">{user?.role === 'admin' ? 'Admin' : 'Customer'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-[#1C1C1E]">Profile Details</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
              className={editing
                ? 'bg-[#F5A623] text-[#1A3C5E] hover:bg-[#FFB300] border-0 font-semibold rounded-xl'
                : 'border-[#1A3C5E]/20 text-[#1A3C5E] hover:bg-[#E8F0FE] rounded-xl'
              }
            >
              {editing ? <><Save className="w-4 h-4 mr-1" /> Save</> : <><Edit2 className="w-4 h-4 mr-1" /> Edit</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[#6B7280]"><User className="w-4 h-4" /> Pura Naam</Label>
            {editing ? (
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Apna pura naam"
                className="h-12 bg-[#F3F4F6] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl focus:ring-0 focus:ring-offset-0"
              />
            ) : (
              <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{user?.full_name || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[#6B7280]"><Mail className="w-4 h-4" /> Email</Label>
            <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{user?.email || 'N/A'}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[#6B7280]"><Phone className="w-4 h-4" /> Phone</Label>
            {editing ? (
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                className="h-12 bg-[#F3F4F6] border-transparent focus:border-[#1A3C5E] focus:bg-white rounded-xl focus:ring-0 focus:ring-offset-0"
              />
            ) : (
              <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl text-[#1C1C1E]">{user?.phone || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[#6B7280]"><Shield className="w-4 h-4" /> Account Type</Label>
            <p className="text-sm p-3 bg-[#F5F7FA] rounded-xl capitalize text-[#1C1C1E]">{user?.role || 'customer'}</p>
          </div>

          {editing && (
            <Button
              className="w-full bg-[#1A3C5E] hover:bg-[#0F2A42] text-white rounded-xl h-12 font-semibold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Profile Save Karein'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
