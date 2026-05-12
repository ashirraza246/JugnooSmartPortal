'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, BarChart3, Layers, Percent } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const serviceTypes = ['printing', 'scanning', 'copying', 'lamination', 'photo', 'binding', 'govt', 'notarisation', 'cv_builder', 'other']
const commissionTypes = ['fixed', 'percentage']

interface CommissionRule {
  id: string
  serviceType: string
  serviceName: string
  govtFee: number
  jugnooFee: number
  commissionType: string
  commissionValue: number
  minCommission: number
  maxCommission: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CommissionSummary {
  totalCommissionEarned: number
  serviceBreakdown: Record<string, { serviceName: string; count: number; totalGovtFee: number; totalJugnooFee: number; totalCommission: number }>
  topServices: { type: string; serviceName: string; count: number; totalCommission: number }[]
  monthlyTrend: { month: string; commission: number }[]
}

export function CommissionModule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null)
  const [activeTab, setActiveTab] = useState('pricing')

  const [formData, setFormData] = useState({
    serviceType: 'printing',
    serviceName: '',
    govtFee: '',
    jugnooFee: '',
    commissionType: 'fixed',
    commissionValue: '',
    minCommission: '',
    maxCommission: '',
  })

  // Fetch commission rules
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['commission'],
    queryFn: async () => {
      const res = await fetch('/api/commission')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      return (json.rules || json || []) as CommissionRule[]
    },
  })

  // Fetch commission summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['commission-summary'],
    queryFn: async () => {
      const res = await fetch('/api/commission?summary=true')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      return json.summary as CommissionSummary
    },
    enabled: activeTab === 'summary',
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission'] })
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] })
      toast({ title: 'Commission rule created!' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission'] })
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] })
      toast({ title: 'Commission rule updated!' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/commission?id=${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission'] })
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] })
      toast({ title: 'Commission rule deleted!' })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch('/api/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission'] })
    },
  })

  const handleSubmit = () => {
    const data = {
      serviceType: formData.serviceType,
      serviceName: formData.serviceName,
      govtFee: parseFloat(formData.govtFee) || 0,
      jugnooFee: parseFloat(formData.jugnooFee) || 0,
      commissionType: formData.commissionType,
      commissionValue: parseFloat(formData.commissionValue) || 0,
      minCommission: parseFloat(formData.minCommission) || 0,
      maxCommission: parseFloat(formData.maxCommission) || 0,
    }
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, ...data })
    } else {
      createMutation.mutate(data)
    }
    setShowForm(false)
    setEditingRule(null)
    resetForm()
  }

  const handleEdit = (rule: CommissionRule) => {
    setEditingRule(rule)
    setFormData({
      serviceType: rule.serviceType,
      serviceName: rule.serviceName,
      govtFee: String(rule.govtFee),
      jugnooFee: String(rule.jugnooFee),
      commissionType: rule.commissionType,
      commissionValue: String(rule.commissionValue),
      minCommission: String(rule.minCommission),
      maxCommission: String(rule.maxCommission),
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      serviceType: 'printing',
      serviceName: '',
      govtFee: '',
      jugnooFee: '',
      commissionType: 'fixed',
      commissionValue: '',
      minCommission: '',
      maxCommission: '',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1C1C1E]">Commission & Pricing Management</h3>
          <p className="text-sm text-[#6B7280]">Manage service pricing, commission rules and track earnings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F5F7FA] border border-gray-200 rounded-xl p-1">
          <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:bg-[#003366] data-[state=active]:text-white gap-1.5 text-sm">
            <Layers className="w-4 h-4" /> Service Pricing
          </TabsTrigger>
          <TabsTrigger value="rules" className="rounded-lg data-[state=active]:bg-[#003366] data-[state=active]:text-white gap-1.5 text-sm">
            <Percent className="w-4 h-4" /> Commission Rules
          </TabsTrigger>
          <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-[#003366] data-[state=active]:text-white gap-1.5 text-sm">
            <BarChart3 className="w-4 h-4" /> Summary
          </TabsTrigger>
        </TabsList>

        {/* ─── SERVICE PRICING TAB ─── */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">All services with pricing breakdown</p>
            <Button onClick={() => { setEditingRule(null); resetForm(); setShowForm(true) }} className="gap-2 bg-[#003366] hover:bg-[#002244] text-white rounded-xl">
              <Plus className="w-4 h-4" /> Add Service Pricing
            </Button>
          </div>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Service Name</TableHead>
                      <TableHead className="text-right">Govt Fee (Rs.)</TableHead>
                      <TableHead className="text-right">Jugnoo Fee (Rs.)</TableHead>
                      <TableHead className="text-right">Total Fee (Rs.)</TableHead>
                      <TableHead>Status</TableHead>
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
                    ) : rules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No service pricing rules yet. Click &quot;Add Service Pricing&quot; to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{rule.serviceType.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{rule.serviceName}</TableCell>
                          <TableCell className="text-right">Rs. {rule.govtFee.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">Rs. {rule.jugnooFee.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-[#003366]">Rs. {(rule.govtFee + rule.jugnooFee).toLocaleString()}</TableCell>
                          <TableCell>
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: rule.id, isActive: checked })}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(rule)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => deleteMutation.mutate(rule.id)}>
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
        </TabsContent>

        {/* ─── COMMISSION RULES TAB ─── */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">Configure commission rules per service</p>
            <Button onClick={() => { setEditingRule(null); resetForm(); setShowForm(true) }} className="gap-2 bg-[#003366] hover:bg-[#002244] text-white rounded-xl">
              <Plus className="w-4 h-4" /> Add Commission Rule
            </Button>
          </div>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                      <TableHead className="text-right">Max</TableHead>
                      <TableHead>Active</TableHead>
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
                    ) : rules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No commission rules yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{rule.serviceName}</p>
                              <p className="text-xs text-[#6B7280] capitalize">{rule.serviceType.replace(/_/g, ' ')}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={rule.commissionType === 'percentage' ? 'bg-amber-50 text-amber-700 border-0' : 'bg-[#E8F0FE] text-[#003366] border-0'}>
                              {rule.commissionType === 'percentage' ? <Percent className="w-3 h-3 mr-1" /> : <DollarSign className="w-3 h-3 mr-1" />}
                              {rule.commissionType.charAt(0).toUpperCase() + rule.commissionType.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {rule.commissionType === 'percentage' ? `${rule.commissionValue}%` : `Rs. ${rule.commissionValue.toLocaleString()}`}
                          </TableCell>
                          <TableCell className="text-right text-sm text-[#6B7280]">Rs. {rule.minCommission.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-sm text-[#6B7280]">Rs. {rule.maxCommission.toLocaleString()}</TableCell>
                          <TableCell>
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: rule.id, isActive: checked })}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(rule)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => deleteMutation.mutate(rule.id)}>
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
        </TabsContent>

        {/* ─── COMMISSION SUMMARY TAB ─── */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          {summaryLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#003366] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Total Commission This Month</p>
                        <p className="text-xl font-bold text-emerald-600">Rs. {(summaryData?.totalCommissionEarned || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#003366]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Active Services</p>
                        <p className="text-xl font-bold text-[#003366]">{rules.filter(r => r.isActive).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Total Service Types</p>
                        <p className="text-xl font-bold text-amber-600">{Object.keys(summaryData?.serviceBreakdown || {}).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trend Chart */}
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[#1C1C1E]">Monthly Commission Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summaryData?.monthlyTrend || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Commission']}
                        />
                        <Bar dataKey="commission" fill="#003366" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Earning Services */}
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[#1C1C1E]">Top Earning Services</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {(summaryData?.topServices || []).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No completed services this month
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">Commission Earned</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summaryData?.topServices.map((service) => (
                          <TableRow key={service.type}>
                            <TableCell className="font-medium">{service.serviceName}</TableCell>
                            <TableCell className="text-right">{service.count}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600">Rs. {service.totalCommission.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Service Breakdown */}
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[#1C1C1E]">Commission Breakdown by Service</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {Object.keys(summaryData?.serviceBreakdown || {}).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No commission data available yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">Govt Fee</TableHead>
                          <TableHead className="text-right">Jugnoo Fee</TableHead>
                          <TableHead className="text-right">Total Commission</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(summaryData?.serviceBreakdown || {}).map(([type, data]) => (
                          <TableRow key={type}>
                            <TableCell className="font-medium">{data.serviceName}</TableCell>
                            <TableCell className="text-right">{data.count}</TableCell>
                            <TableCell className="text-right">Rs. {data.totalGovtFee.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-emerald-600">Rs. {data.totalJugnooFee.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-bold text-[#003366]">Rs. {data.totalCommission.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Commission Rule' : 'Add Commission Rule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Service Type</Label>
                <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commission Type</Label>
                <Select value={formData.commissionType} onValueChange={(v) => setFormData({ ...formData, commissionType: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {commissionTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Service Name</Label>
              <Input value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} placeholder="e.g. CNIC Application" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Govt Fee (Rs.)</Label>
                <Input type="number" value={formData.govtFee} onChange={(e) => setFormData({ ...formData, govtFee: e.target.value })} placeholder="0" className="mt-1" />
              </div>
              <div>
                <Label>Jugnoo Fee (Rs.)</Label>
                <Input type="number" value={formData.jugnooFee} onChange={(e) => setFormData({ ...formData, jugnooFee: e.target.value })} placeholder="0" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Commission Value {formData.commissionType === 'percentage' ? '(%)' : '(Rs.)'}</Label>
              <Input type="number" value={formData.commissionValue} onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })} placeholder={formData.commissionType === 'percentage' ? '10' : '500'} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Commission (Rs.)</Label>
                <Input type="number" value={formData.minCommission} onChange={(e) => setFormData({ ...formData, minCommission: e.target.value })} placeholder="0" className="mt-1" />
              </div>
              <div>
                <Label>Max Commission (Rs.)</Label>
                <Input type="number" value={formData.maxCommission} onChange={(e) => setFormData({ ...formData, maxCommission: e.target.value })} placeholder="0" className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingRule(null); resetForm() }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.serviceName || !formData.commissionValue} className="bg-[#003366] hover:bg-[#002244] text-white">
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
