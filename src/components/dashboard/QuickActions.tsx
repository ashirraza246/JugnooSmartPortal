'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, MessageSquare, UserPlus, AlertTriangle, Building2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'

interface QuickActionsProps {
  lowInventory: { id: string; itemName: string; currentStock: number; minimumStock: number }[]
  pendingGovtServices: number
  pendingNotarisations: number
}

export function QuickActions({ lowInventory, pendingGovtServices, pendingNotarisations }: QuickActionsProps) {
  const { setActiveModule } = useAppStore()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full justify-start gap-2"
            onClick={() => setActiveModule('orders')}
          >
            <Plus className="w-4 h-4" />
            New Order
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setActiveModule('whatsapp')}
          >
            <MessageSquare className="w-4 h-4" />
            Send WhatsApp Message
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setActiveModule('customers')}
          >
            <UserPlus className="w-4 h-4" />
            Add Customer
          </Button>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      {(pendingGovtServices > 0 || pendingNotarisations > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingGovtServices > 0 && (
              <button
                onClick={() => setActiveModule('govt')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Govt Services
                </span>
                <Badge className="bg-blue-100 text-blue-800">{pendingGovtServices}</Badge>
              </button>
            )}
            {pendingNotarisations > 0 && (
              <button
                onClick={() => setActiveModule('notarisation')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm">Notarisations</span>
                <Badge className="bg-blue-100 text-blue-800">{pendingNotarisations}</Badge>
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Low Inventory Alerts */}
      {lowInventory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowInventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModule('inventory')}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">{item.itemName || item.item_name || 'Unknown'}</span>
                  <Badge variant="destructive" className="text-xs">
                    {item.currentStock ?? item.current_stock ?? 0} / {item.minimumStock ?? item.minimum_stock ?? 0}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
