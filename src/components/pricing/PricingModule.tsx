'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const serviceTypes = ['printing', 'scanning', 'copying', 'lamination', 'photo', 'binding', 'govt', 'notarisation', 'other']
const units = ['per_page', 'per_document', 'per_service']

export function PricingModule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<Record<string, unknown> | null>(null)
  const [formData, setFormData] = useState({
    serviceType: 'printing',
    serviceName: '',
    unit: 'per_page',
    price: '',
  })

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: async () => {
      const res = await fetch('/api/pricing')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      return json.rules || json || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] })
      toast({ title: 'Pricing rule created!' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] })
      toast({ title: 'Pricing rule updated!' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/pricing?id=${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] })
      toast({ title: 'Pricing rule deleted!' })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] })
    },
  })

  const handleSubmit = () => {
    const data = {
      ...formData,
      price: parseFloat(formData.price) || 0,
    }
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, ...data })
    } else {
      createMutation.mutate(data)
    }
    setShowForm(false)
    setEditingRule(null)
    setFormData({ serviceType: 'printing', serviceName: '', unit: 'per_page', price: '' })
  }

  const handleEdit = (rule: Record<string, unknown>) => {
    setEditingRule(rule)
    setFormData({
      serviceType: rule.serviceType as string,
      serviceName: rule.serviceName as string,
      unit: rule.unit as string,
      price: String(rule.price),
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pricing Rules</h3>
        <Button onClick={() => { setEditingRule(null); setFormData({ serviceType: 'printing', serviceName: '', unit: 'per_page', price: '' }); setShowForm(true) }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Pricing Rule
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Price (Rs.)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-12 animate-pulse bg-muted/50" />
                    </TableRow>
                  ))
                ) : rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No pricing rules</TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule: Record<string, unknown>) => (
                    <TableRow key={rule.id as string}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{rule.serviceType as string}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{rule.serviceName as string}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{(rule.unit as string).replace(/_/g, ' ')}</TableCell>
                      <TableCell className="text-right font-semibold">Rs. {rule.price as number}</TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.isActive as boolean}
                          onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: rule.id as string, isActive: checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(rule)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => deleteMutation.mutate(rule.id as string)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Service Type</Label>
                <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>{u.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Service Name</Label>
              <Input value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} placeholder="e.g. B&W Printing (A4)" className="mt-1" />
            </div>
            <div>
              <Label>Price (Rs.)</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.serviceName || !formData.price}>
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
