'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Plus, AlertTriangle, Package, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const categories = ['paper', 'ink', 'form', 'supply']
const units = ['ream', 'piece', 'cartridge', 'pack', 'box', 'set']
const categoryLabels: Record<string, string> = { paper: 'Paper', ink: 'Ink/Toner', form: 'Forms', supply: 'Supplies' }

export function InventoryModule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [restockItem, setRestockItem] = useState<Record<string, unknown> | null>(null)
  const [restockQty, setRestockQty] = useState('')
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'paper',
    currentStock: '',
    minimumStock: '5',
    unit: 'ream',
  })

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      return json.items || json || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({ title: 'Item added!' })
    },
  })

  const restockMutation = useMutation({
    mutationFn: async ({ id, currentStock, addQty }: { id: string; currentStock: number; addQty: number }) => {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, currentStock: currentStock + addQty, restock: true }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({ title: 'Item restocked!' })
      setRestockItem(null)
      setRestockQty('')
    },
  })

  const getStockColor = (current: number, minimum: number) => {
    if (current <= 0) return 'text-red-600'
    if (current <= minimum * 0.5) return 'text-red-500'
    if (current <= minimum) return 'text-amber-500'
    return 'text-emerald-600'
  }

  const getStockBg = (current: number, minimum: number) => {
    if (current <= 0) return 'bg-red-50 border-red-200'
    if (current <= minimum) return 'bg-amber-50 border-amber-200'
    return 'bg-white'
  }

  const lowStockItems = items.filter((i: Record<string, unknown>) => (i.currentStock as number) <= (i.minimumStock as number))

  return (
    <div className="space-y-4">
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">Low Stock Alert - {lowStockItems.length} items need restocking</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item: Record<string, unknown>) => (
                <Badge key={item.id as string} variant="destructive" className="text-xs">
                  {item.itemName as string} ({item.currentStock as number}/{item.minimumStock as number})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Inventory</h3>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: Record<string, unknown>) => {
            const safeItemName = (item.itemName as string) || 'Unknown Item'
            const safeCategory = (item.category as string) || 'supply'
            const safeUnit = (item.unit as string) || 'piece'
            const safeCurrentStock = (item.currentStock as number) || 0
            const safeMinimumStock = (item.minimumStock as number) || 0
            const safeLastRestocked = item.lastRestocked as string | null
            return (
            <Card key={item.id as string} className={`hover:shadow-md transition-shadow ${getStockBg(safeCurrentStock, safeMinimumStock)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm truncate">{safeItemName}</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {categoryLabels[safeCategory] || safeCategory}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${getStockColor(safeCurrentStock, safeMinimumStock)}`}>
                      {safeCurrentStock}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {safeUnit} (min: {safeMinimumStock})
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => { setRestockItem(item); setRestockQty('') }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restock
                  </Button>
                </div>
                {safeLastRestocked && (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Last restocked: {new Date(safeLastRestocked).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} placeholder="e.g. A4 Paper (Ream)" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{categoryLabels[c]}</SelectItem>
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
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Current Stock</Label>
                <Input type="number" value={formData.currentStock} onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Minimum Stock</Label>
                <Input type="number" value={formData.minimumStock} onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={() => {
              createMutation.mutate({
                ...formData,
                currentStock: parseInt(formData.currentStock) || 0,
                minimumStock: parseInt(formData.minimumStock) || 5,
              })
              setShowForm(false)
              setFormData({ itemName: '', category: 'paper', currentStock: '', minimumStock: '5', unit: 'ream' })
            }} disabled={!formData.itemName}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={!!restockItem} onOpenChange={() => { setRestockItem(null); setRestockQty('') }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock - {restockItem?.itemName as string}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Current stock: <span className="font-semibold text-foreground">{restockItem?.currentStock as number} {restockItem?.unit as string}</span></p>
            <div>
              <Label>Add Quantity</Label>
              <Input type="number" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="Enter quantity" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRestockItem(null); setRestockQty('') }}>Cancel</Button>
            <Button onClick={() => {
              if (restockItem && restockQty) {
                restockMutation.mutate({
                  id: restockItem.id as string,
                  currentStock: restockItem.currentStock as number,
                  addQty: parseInt(restockQty) || 0,
                })
              }
            }} disabled={!restockQty}>Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
