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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OrderFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  customers: { id: string; fullName: string }[]
}

const orderTypes = ['printing', 'scanning', 'copying', 'custom_print', 'photo_print', 'poster', 'form', 'other']
const priorities = ['normal', 'urgent', 'vip']

export function OrderForm({ open, onClose, onSubmit, customers }: OrderFormProps) {
  const [customerId, setCustomerId] = useState('')
  const [orderType, setOrderType] = useState('printing')
  const [priority, setPriority] = useState('normal')
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [pages, setPages] = useState('')
  const [copies, setCopies] = useState('1')

  const handleSubmit = () => {
    onSubmit({
      customerId: customerId || null,
      orderType,
      priority,
      description: description || null,
      totalAmount: parseFloat(totalAmount) || 0,
      specifications: { pages: parseInt(pages) || 1, copies: parseInt(copies) || 1 },
    })
    onClose()
    setCustomerId('')
    setOrderType('printing')
    setPriority('normal')
    setDescription('')
    setTotalAmount('')
    setPages('')
    setCopies('1')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select customer (optional)" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Order description..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Pages</Label>
              <Input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="1"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Copies</Label>
              <Input
                type="number"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                placeholder="1"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Amount (Rs.)</Label>
              <Input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
