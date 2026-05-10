'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CustomerForm } from './CustomerForm'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Star, Pencil, Trash2, MessageSquare, Eye } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

export function CustomersModule() {
  const { searchQuery, setActiveModule } = useAppStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [tagFilter, setTagFilter] = useState('all')
  const [vipOnly, setVipOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Record<string, unknown> | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Record<string, unknown> | null>(null)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', searchQuery, tagFilter, vipOnly],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (tagFilter !== 'all') params.set('tags', tagFilter)
      if (vipOnly) params.set('vip', 'true')
      const res = await fetch(`/api/customers?${params}`)
      if (!res.ok) throw new Error('Failed to fetch customers')
      const json = await res.json()
      return json.customers || json || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({ title: 'Customer added!' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({ title: 'Customer updated!' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/customers?id=${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({ title: 'Customer deleted!' })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="bisp">BISP</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={vipOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVipOnly(!vipOnly)}
            className="gap-1"
          >
            <Star className="w-3.5 h-3.5" />
            VIP Only
          </Button>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setShowForm(true) }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>CNIC</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-12 animate-pulse bg-muted/50" />
                    </TableRow>
                  ))
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer: Record<string, unknown>) => {
                    const safeFullName = (customer.fullName as string) || 'Unknown'
                    const safeWhatsapp = (customer.whatsapp as string) || '-'
                    const safeCnic = (customer.cnic as string) || '-'
                    const safeTags = (customer.tags as string) || ''
                    const safeOrdersCount = (customer.ordersCount as number) || 0
                    const safeTotalSpent = (customer.totalSpent as number) || 0
                    return (
                    <TableRow key={customer.id as string}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{safeFullName}</span>
                          {customer.isVip && (
                            <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5">VIP</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{safeWhatsapp}</TableCell>
                      <TableCell className="text-sm">{safeCnic}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {safeTags.split(',').filter(Boolean).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">{tag.trim()}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{safeOrdersCount}</TableCell>
                      <TableCell className="text-right font-medium">Rs. {safeTotalSpent.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedCustomer(customer)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCustomer(customer); setShowForm(true) }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => deleteMutation.mutate(customer.id as string)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
                  {(selectedCustomer.fullName as string).charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCustomer.fullName as string}</h3>
                  {selectedCustomer.isVip && <Badge className="bg-amber-100 text-amber-800">VIP Customer</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">WhatsApp:</span>
                  <p className="font-medium">{(selectedCustomer.whatsapp as string) || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">CNIC:</span>
                  <p className="font-medium">{(selectedCustomer.cnic as string) || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{(selectedCustomer.email as string) || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Spent:</span>
                  <p className="font-medium">Rs. {(selectedCustomer.totalSpent as number).toLocaleString()}</p>
                </div>
              </div>
              {(selectedCustomer.address as string) && (
                <div>
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <p className="text-sm">{selectedCustomer.address as string}</p>
                </div>
              )}
              {(selectedCustomer.notes as string) && (
                <div>
                  <span className="text-sm text-muted-foreground">Notes:</span>
                  <p className="text-sm">{selectedCustomer.notes as string}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="gap-1" onClick={() => {
                  if (selectedCustomer.whatsapp) {
                    window.open(`https://wa.me/${(selectedCustomer.whatsapp as string).replace(/[^0-9]/g, '')}`, '_blank')
                  }
                }}>
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Form */}
      <CustomerForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingCustomer(null) }}
        onSubmit={(data) => {
          if (editingCustomer) {
            updateMutation.mutate(data)
          } else {
            createMutation.mutate(data)
          }
        }}
        initialData={editingCustomer || undefined}
      />
    </div>
  )
}
