'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '../orders/StatusBadge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, ArrowRight, Scale } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const notarisationFlow: Record<string, string> = {
  pending: 'in_process',
  in_process: 'completed',
}

const serviceTypeLabels: Record<string, string> = {
  deed: 'Deed',
  demand_payment: 'Demand for Payment',
  divorce: 'Divorce',
  e_notary: 'E-Notary',
  general: 'General',
}

const typeColors: Record<string, string> = {
  deed: 'bg-amber-100 text-amber-800',
  demand_payment: 'bg-red-100 text-red-800',
  divorce: 'bg-purple-100 text-purple-800',
  e_notary: 'bg-sky-100 text-sky-800',
  general: 'bg-gray-100 text-gray-800',
}

export function NotarisationModule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    serviceType: 'general',
    description: '',
    feeAmount: '',
    appointmentDate: '',
  })

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['notarisation'],
    queryFn: async () => {
      const res = await fetch('/api/notarisation')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      return json.services || json || []
    },
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-brief'],
    queryFn: async () => {
      const res = await fetch('/api/customers')
      const json = await res.json()
      return json.customers || json || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/notarisation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notarisation'] })
      toast({ title: 'Notarisation created!' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch('/api/notarisation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notarisation'] })
      toast({ title: 'Status updated!' })
    },
  })

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      customerId: formData.customerId || null,
      feeAmount: parseFloat(formData.feeAmount) || 0,
      appointmentDate: formData.appointmentDate || null,
    })
    setShowForm(false)
    setFormData({ customerId: '', serviceType: 'general', description: '', feeAmount: '', appointmentDate: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notarisation Services</h3>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Notarisation
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Scale className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notarisation records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((record: Record<string, unknown>) => {
            const safeServiceType = (record.serviceType as string) || 'general'
            const safeStatus = (record.status as string) || 'pending'
            const safeFeeAmount = (record.feeAmount as number) || 0
            return (
            <Card key={record.id as string} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">
                        {serviceTypeLabels[safeServiceType] || safeServiceType}
                      </h3>
                      <Badge className={`${typeColors[safeServiceType] || ''} text-[10px] px-1.5`}>
                        {safeServiceType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(record.customer as Record<string, string>)?.fullName || 'Unknown'}
                    </p>
                    {record.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {record.description as string}
                      </p>
                    )}
                    <div className="mt-2">
                      <StatusBadge status={safeStatus} type="notarisation" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold">Rs. {safeFeeAmount.toLocaleString()}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {record.appointmentDate
                      ? `Appt: ${new Date(record.appointmentDate as string).toLocaleDateString()}`
                      : 'No appointment'}
                  </span>
                  {notarisationFlow[safeStatus] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-emerald-600"
                      onClick={() => updateMutation.mutate({
                        id: record.id as string,
                        status: notarisationFlow[safeStatus],
                      })}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      {notarisationFlow[safeStatus]?.replace(/_/g, ' ')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Notarisation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer</Label>
              <Select value={formData.customerId} onValueChange={(v) => setFormData({ ...formData, customerId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c: Record<string, string>) => (
                    <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Service Type</Label>
                <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deed">Deed</SelectItem>
                    <SelectItem value="demand_payment">Demand for Payment</SelectItem>
                    <SelectItem value="divorce">Divorce</SelectItem>
                    <SelectItem value="e_notary">E-Notary</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fee (Rs.)</Label>
                <Input type="number" value={formData.feeAmount} onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Appointment Date</Label>
              <Input type="date" value={formData.appointmentDate} onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
