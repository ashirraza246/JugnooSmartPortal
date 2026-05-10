'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface CustomerFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function CustomerForm({ open, onClose, onSubmit, initialData }: CustomerFormProps) {
  const [fullName, setFullName] = useState((initialData?.fullName as string) || '')
  const [whatsapp, setWhatsapp] = useState((initialData?.whatsapp as string) || '')
  const [cnic, setCnic] = useState((initialData?.cnic as string) || '')
  const [email, setEmail] = useState((initialData?.email as string) || '')
  const [address, setAddress] = useState((initialData?.address as string) || '')
  const [tags, setTags] = useState((initialData?.tags as string) || '')
  const [notes, setNotes] = useState((initialData?.notes as string) || '')
  const [isVip, setIsVip] = useState((initialData?.isVip as boolean) || false)

  const handleSubmit = () => {
    if (!fullName.trim()) return
    onSubmit({
      ...(initialData?.id ? { id: initialData.id } : {}),
      fullName,
      whatsapp: whatsapp || null,
      cnic: cnic || null,
      email: email || null,
      address: address || null,
      tags: tags || null,
      notes: notes || null,
      isVip,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cust-name">Full Name *</Label>
            <Input
              id="cust-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Muhammad Ahmed Khan"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cust-whatsapp">WhatsApp Number</Label>
              <Input
                id="cust-whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="923001234567"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cust-cnic">CNIC</Label>
              <Input
                id="cust-cnic"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="35201-1234567-1"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cust-email">Email</Label>
            <Input
              id="cust-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cust-address">Address</Label>
            <Input
              id="cust-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House #, Street, Area"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cust-tags">Tags (comma separated)</Label>
            <Input
              id="cust-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="regular, vip, bisp, student"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cust-notes">Notes</Label>
            <Textarea
              id="cust-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="cust-vip"
              checked={isVip}
              onCheckedChange={setIsVip}
            />
            <Label htmlFor="cust-vip">VIP Customer</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!fullName.trim()}>
            {initialData ? 'Update' : 'Add Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
