'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth'
import {
  UsersRound, Plus, Shield, UserCircle, Loader2,
  Trash2, Mail, Phone, User, KeyRound, Crown,
} from 'lucide-react'

interface TeamMember {
  id: string
  email: string
  full_name: string
  role: string
  phone: string
  is_active: boolean
  created_at: string
}

export function TeamManagementModule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState({ email: '', fullName: '', phone: '', password: '', role: 'admin' })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/team')
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        return data.members || [] as TeamMember[]
      } catch {
        return [] as TeamMember[]
      }
    },
    retry: false,
  })

  const addMemberMutation = useMutation({
    mutationFn: async (data: { email: string; fullName: string; phone: string; password: string; role: string }) => {
      const res = await fetch('/api/auth/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to add member')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      toast({ title: 'Team member add ho gaya!', description: 'Ab woh admin panel access kar sakta hai.' })
      setShowAddDialog(false)
      setAddForm({ email: '', fullName: '', phone: '', password: '', role: 'admin' })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/auth/team?userId=${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      toast({ title: 'Member removed!' })
      setDeleteConfirm(null)
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const handleAdd = () => {
    if (!addForm.email || !addForm.fullName || !addForm.password) {
      toast({ title: 'Sab fields fill karein', variant: 'destructive' })
      return
    }
    addMemberMutation.mutate(addForm)
  }

  const members = (teamMembers || []) as TeamMember[]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><UsersRound className="w-6 h-6 text-amber-500" /> Team & Access</h2>
          <p className="text-muted-foreground">Apni team ke members ko admin panel access dein ya manage karein</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <Plus className="w-4 h-4" /> Add Team Member
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Admin Panel Access</p>
              <p className="text-xs text-amber-700 mt-1">Yahan par aap apni shop ke team members ko admin panel ka access de sakte hain. Har member ko apna email aur password hoga, jis sy woh login kar ke admin panel use kar sakay ga. Admin panel se woh orders manage, customers dekh, services apply, WhatsApp templates use - sab kuch kar sakte hain.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      ) : members.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <UsersRound className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-1">Koi team member nahi mila</h3>
            <p className="text-muted-foreground">Naya team member add karein</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const isMainAdmin = member.email === 'admin@jugnoo.pk'
            const isCurrentUser = member.email === currentUser?.email
            return (
              <Card key={member.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex">
                  <div className={`w-1.5 shrink-0 ${isMainAdmin ? 'bg-gradient-to-b from-amber-400 to-amber-600' : 'bg-gradient-to-b from-blue-400 to-blue-600'}`} />
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${isMainAdmin ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                          {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{member.full_name || member.email}</h4>
                            {isMainAdmin && <Badge className="bg-amber-100 text-amber-700 text-[10px] gap-1"><Crown className="w-3 h-3" /> Owner</Badge>}
                            {isCurrentUser && !isMainAdmin && <Badge className="bg-blue-100 text-blue-700 text-[10px]">You</Badge>}
                            <Badge className={`${member.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'} text-[10px]`}>
                              {member.role === 'admin' ? 'Admin' : 'Customer'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</span>
                            {member.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {member.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${member.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} text-[10px]`}>
                          {member.is_active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                        {!isMainAdmin && !isCurrentUser && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setDeleteConfirm(member.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersRound className="w-5 h-5 text-amber-500" />
              Add Team Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">Naya member add karne ke baad, woh apny email aur password sy login kar ke admin panel access kar sakay ga.</p>
            </div>
            <div>
              <Label className="flex items-center gap-1"><User className="w-4 h-4" /> Pura Naam *</Label>
              <Input value={addForm.fullName} onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })} placeholder="e.g. Ahmed Khan" className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Mail className="w-4 h-4" /> Email *</Label>
              <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="e.g. ahmed@jugnoo.pk" className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Phone className="w-4 h-4" /> Phone</Label>
              <Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="0300-1234567" className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><KeyRound className="w-4 h-4" /> Password *</Label>
              <Input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Member ka password set karein" className="mt-1" />
              <p className="text-[10px] text-muted-foreground mt-1">Yeh password member ko dena hai login ke liye</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addMemberMutation.isPending} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {addMemberMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Team Member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Yeh member admin panel ka access lose kar jayega. Lekin customer account reh sakta hai.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && removeMemberMutation.mutate(deleteConfirm)} disabled={removeMemberMutation.isPending}>
              {removeMemberMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
