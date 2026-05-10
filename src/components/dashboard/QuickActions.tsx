'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, MessageSquare, UserPlus, AlertTriangle, Building2, Scale } from 'lucide-react'
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
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#1C1C1E]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full justify-start gap-2 bg-[#1A3C5E] hover:bg-[#0F2A42] text-white rounded-xl h-11"
            onClick={() => setActiveModule('orders')}
          >
            <Plus className="w-4 h-4" />
            New Order
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-[#1A3C5E]/20 text-[#1A3C5E] hover:bg-[#E8F0FE] rounded-xl h-11"
            onClick={() => setActiveModule('whatsapp')}
          >
            <MessageSquare className="w-4 h-4" />
            Send WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-[#1A3C5E]/20 text-[#1A3C5E] hover:bg-[#E8F0FE] rounded-xl h-11"
            onClick={() => setActiveModule('customers')}
          >
            <UserPlus className="w-4 h-4" />
            Add Customer
          </Button>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      {(pendingGovtServices > 0 || pendingNotarisations > 0) && (
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#1C1C1E] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F5A623]" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingGovtServices > 0 && (
              <button
                onClick={() => setActiveModule('govt')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F7FA] transition-colors"
              >
                <span className="text-sm flex items-center gap-2 text-[#1C1C1E]">
                  <Building2 className="w-4 h-4 text-[#1A3C5E]" />
                  Govt Services
                </span>
                <Badge className="bg-[#E8F0FE] text-[#1A3C5E] border-0 text-[10px]">{pendingGovtServices}</Badge>
              </button>
            )}
            {pendingNotarisations > 0 && (
              <button
                onClick={() => setActiveModule('notarisation')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F7FA] transition-colors"
              >
                <span className="text-sm flex items-center gap-2 text-[#1C1C1E]">
                  <Scale className="w-4 h-4 text-[#F5A623]" />
                  Notarisations
                </span>
                <Badge className="bg-[#FFF3D6] text-[#F5A623] border-0 text-[10px]">{pendingNotarisations}</Badge>
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Low Inventory Alerts */}
      {lowInventory.length > 0 && (
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#1C1C1E] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E53935]" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowInventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModule('inventory')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F7FA] transition-colors"
                >
                  <span className="text-sm text-[#1C1C1E]">{item.itemName || item.item_name || 'Unknown'}</span>
                  <Badge className="bg-[#FFEBEE] text-[#E53935] border-0 text-[10px]">
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
