'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Edit2, Trash2, FileText, CheckCircle2, X as XIcon,
  Loader2, GripVertical, Building2, GraduationCap, Banknote,
  Printer, Scan, Scale, MoreHorizontal, ListChecks, Sparkles,
  UserCircle, Shield, Clock, Info, Wallet, CreditCard, Calendar,
  AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react'

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  govt_scheme: { label: 'Govt Schemes', icon: Building2, color: 'text-blue-600 bg-blue-50' },
  scholarship: { label: 'Scholarships', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
  loan: { label: 'Loans', icon: Banknote, color: 'text-purple-600 bg-purple-50' },
  printing: { label: 'Printing', icon: Printer, color: 'text-[#003366] bg-blue-50' },
  scanning: { label: 'Scanning & Copy', icon: Scan, color: 'text-cyan-600 bg-cyan-50' },
  notarisation: { label: 'Notarisation', icon: Scale, color: 'text-rose-600 bg-rose-50' },
  other: { label: 'Other Services', icon: MoreHorizontal, color: 'text-gray-600 bg-gray-50' },
}

interface RequiredDoc {
  id: string
  name: string
  is_mandatory: boolean
  description: string
}

interface PersonalInfoField {
  id: string
  label: string
  field_type: 'text' | 'cnic' | 'phone' | 'date' | 'select' | 'number' | 'textarea'
  is_required: boolean
  placeholder?: string
  options?: string[]
}

interface LoanTier {
  tier: number
  name: string
  amount_min: number
  amount_max: number
  markup_rate: string
  duration: string
  collateral: boolean
}

interface DeadlineInfo {
  start_date: string
  end_date: string
  is_rolling: boolean
  note: string
}

interface ServiceItem {
  id: string
  name: string
  category: string
  description: string
  icon: string
  base_price: number
  features: string[]
  required_documents: RequiredDoc[]
  personal_info_fields: PersonalInfoField[]
  is_active: boolean
  sort_order: number
  official_url: string
  apply_process: string
  // Apply Flow Fields (admin manageable)
  eligibility: string
  deadlines: DeadlineInfo | Record<string, never>
  loan_tiers: LoanTier[]
  important_details: string[]
  processing_time: string
  special_notes: string
  fee_info: string
  apply_steps: string[]
}

const emptyDeadline: DeadlineInfo = {
  start_date: '',
  end_date: '',
  is_rolling: true,
  note: '',
}

const emptyForm: Omit<ServiceItem, 'id'> = {
  name: '',
  category: 'govt_scheme',
  description: '',
  icon: 'FileText',
  base_price: 0,
  features: [],
  required_documents: [],
  personal_info_fields: [],
  is_active: true,
  sort_order: 0,
  official_url: '',
  apply_process: '',
  eligibility: '',
  deadlines: {},
  loan_tiers: [],
  important_details: [],
  processing_time: '',
  special_notes: '',
  fee_info: '',
  apply_steps: [],
}

export function ServiceManagerModule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [newFeature, setNewFeature] = useState('')
  const [newDoc, setNewDoc] = useState({ name: '', is_mandatory: true, description: '' })
  const [newField, setNewField] = useState({ label: '', field_type: 'text' as const, is_required: true, placeholder: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [quickPriceEdit, setQuickPriceEdit] = useState<string | null>(null)
  const [quickPriceValue, setQuickPriceValue] = useState<number>(0)
  // Apply flow state
  const [newImportantDetail, setNewImportantDetail] = useState('')
  const [newLoanTier, setNewLoanTier] = useState<Partial<LoanTier>>({ tier: 1, name: '', amount_min: 0, amount_max: 0, markup_rate: '0%', duration: '3 years', collateral: false })
  const [newApplyStep, setNewApplyStep] = useState('')
  const [formTab, setFormTab] = useState('basic')

  const { data: services, isLoading } = useQuery({
    queryKey: ['service-listings-admin', categoryFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (categoryFilter !== 'all') params.set('category', categoryFilter)
        const res = await fetch(`/api/service-listings?${params}`)
        if (!res.ok) throw new Error('Failed')
        return res.json() as Promise<ServiceItem[]>
      } catch {
        return [] as ServiceItem[]
      }
    },
    retry: false,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: ServiceItem) => {
      const isEdit = !!data.id
      const res = await fetch('/api/service-listings', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-listings-admin'] })
      queryClient.invalidateQueries({ queryKey: ['service-listings'] })
      toast({ title: 'Service saved!' })
      setShowForm(false)
      setEditingService(null)
      setFormData(emptyForm)
      setFormTab('basic')
    },
    onError: () => {
      toast({ title: 'Error saving service', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/service-listings?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-listings-admin'] })
      queryClient.invalidateQueries({ queryKey: ['service-listings'] })
      toast({ title: 'Service deleted!' })
      setDeleteConfirm(null)
    },
    onError: () => {
      toast({ title: 'Error deleting service', variant: 'destructive' })
    },
  })

  const handleEdit = (service: ServiceItem) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      icon: service.icon || 'FileText',
      base_price: service.base_price || 0,
      features: service.features || [],
      required_documents: (service as Record<string, unknown>).required_documents
        ? ((service as Record<string, unknown>).required_documents as RequiredDoc[])
        : [],
      personal_info_fields: (service as Record<string, unknown>).personal_info_fields
        ? ((service as Record<string, unknown>).personal_info_fields as PersonalInfoField[])
        : [],
      is_active: service.is_active !== false,
      sort_order: service.sort_order || 0,
      official_url: (service as Record<string, unknown>).official_url as string || '',
      apply_process: (service as Record<string, unknown>).apply_process as string || '',
      eligibility: (service as Record<string, unknown>).eligibility as string || '',
      deadlines: (service as Record<string, unknown>).deadlines as DeadlineInfo || {},
      loan_tiers: (service as Record<string, unknown>).loan_tiers as LoanTier[] || [],
      important_details: (service as Record<string, unknown>).important_details as string[] || [],
      processing_time: (service as Record<string, unknown>).processing_time as string || '',
      special_notes: (service as Record<string, unknown>).special_notes as string || '',
      fee_info: (service as Record<string, unknown>).fee_info as string || '',
      apply_steps: (service as Record<string, unknown>).apply_steps as string[] || [],
    })
    setFormTab('basic')
    setShowForm(true)
  }

  // Quick price update
  const handleQuickPriceSave = async (serviceId: string) => {
    try {
      const res = await fetch('/api/service-listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: serviceId, base_price: quickPriceValue }),
      })
      if (!res.ok) throw new Error('Failed')
      queryClient.invalidateQueries({ queryKey: ['service-listings-admin'] })
      queryClient.invalidateQueries({ queryKey: ['service-listings'] })
      toast({ title: 'Price updated!' })
      setQuickPriceEdit(null)
    } catch {
      toast({ title: 'Failed to update price', variant: 'destructive' })
    }
  }

  const handleSave = () => {
    const payload: ServiceItem = {
      id: editingService?.id || `svc_${Date.now()}`,
      ...formData,
    }
    saveMutation.mutate(payload)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })
  }

  const addDoc = () => {
    if (newDoc.name.trim()) {
      const doc: RequiredDoc = {
        id: `doc_${Date.now()}`,
        name: newDoc.name.trim(),
        is_mandatory: newDoc.is_mandatory,
        description: newDoc.description.trim(),
      }
      setFormData({ ...formData, required_documents: [...formData.required_documents, doc] })
      setNewDoc({ name: '', is_mandatory: true, description: '' })
    }
  }

  const removeDoc = (id: string) => {
    setFormData({ ...formData, required_documents: formData.required_documents.filter(d => d.id !== id) })
  }

  const addField = () => {
    if (newField.label.trim()) {
      const field: PersonalInfoField = {
        id: `field_${Date.now()}`,
        label: newField.label.trim(),
        field_type: newField.field_type,
        is_required: newField.is_required,
        placeholder: newField.placeholder.trim(),
      }
      setFormData({ ...formData, personal_info_fields: [...(formData.personal_info_fields || []), field] })
      setNewField({ label: '', field_type: 'text', is_required: true, placeholder: '' })
    }
  }

  const removeField = (id: string) => {
    setFormData({ ...formData, personal_info_fields: (formData.personal_info_fields || []).filter(f => f.id !== id) })
  }

  // Apply flow helpers
  const addImportantDetail = () => {
    if (newImportantDetail.trim()) {
      setFormData({ ...formData, important_details: [...(formData.important_details || []), newImportantDetail.trim()] })
      setNewImportantDetail('')
    }
  }

  const removeImportantDetail = (index: number) => {
    setFormData({ ...formData, important_details: (formData.important_details || []).filter((_, i) => i !== index) })
  }

  const addLoanTier = () => {
    if (newLoanTier.name?.trim()) {
      const tier: LoanTier = {
        tier: newLoanTier.tier || (formData.loan_tiers?.length || 0) + 1,
        name: newLoanTier.name.trim(),
        amount_min: newLoanTier.amount_min || 0,
        amount_max: newLoanTier.amount_max || 0,
        markup_rate: newLoanTier.markup_rate || '0%',
        duration: newLoanTier.duration || '3 years',
        collateral: newLoanTier.collateral || false,
      }
      setFormData({ ...formData, loan_tiers: [...(formData.loan_tiers || []), tier] })
      setNewLoanTier({ tier: tier.tier + 1, name: '', amount_min: 0, amount_max: 0, markup_rate: '5%', duration: '5 years', collateral: false })
    }
  }

  const removeLoanTier = (index: number) => {
    setFormData({ ...formData, loan_tiers: (formData.loan_tiers || []).filter((_, i) => i !== index) })
  }

  const addApplyStep = () => {
    if (newApplyStep.trim()) {
      setFormData({ ...formData, apply_steps: [...(formData.apply_steps || []), newApplyStep.trim()] })
      setNewApplyStep('')
    }
  }

  const removeApplyStep = (index: number) => {
    setFormData({ ...formData, apply_steps: (formData.apply_steps || []).filter((_, i) => i !== index) })
  }

  const getDeadlineObj = (): DeadlineInfo => {
    const d = formData.deadlines
    if (!d || Object.keys(d).length === 0) return emptyDeadline
    return d as DeadlineInfo
  }

  const updateDeadline = (field: keyof DeadlineInfo, value: string | boolean) => {
    const current = getDeadlineObj()
    setFormData({ ...formData, deadlines: { ...current, [field]: value } })
  }

  const serviceList = (services || []) as ServiceItem[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[#003366]"><ListChecks className="w-6 h-6 text-[#2980b9]" /> Service Manager</h2>
          <p className="text-muted-foreground">Services manage karein, apply flow set karein, eligibility aur fees set karein</p>
        </div>
        <Button onClick={() => { setEditingService(null); setFormData(emptyForm); setFormTab('basic'); setShowForm(true) }} className="gap-2 bg-gradient-to-r from-[#003366] to-[#2980b9] text-white">
          <Plus className="w-4 h-4" /> New Service
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button variant={categoryFilter === 'all' ? 'default' : 'outline'} size="sm"
          className={categoryFilter === 'all' ? 'bg-gradient-to-r from-[#003366] to-[#2980b9] text-white' : ''}
          onClick={() => setCategoryFilter('all')}>
          <Sparkles className="w-4 h-4 mr-1" /> Sab Services
        </Button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <Button key={key} variant={categoryFilter === key ? 'default' : 'outline'} size="sm"
            onClick={() => setCategoryFilter(key)}>
            <config.icon className="w-4 h-4 mr-1" /> {config.label}
          </Button>
        ))}
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#2980b9]" /></div>
      ) : serviceList.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-1">Koi service nahi mili</h3>
            <p className="text-muted-foreground">Nayi service add karein ya category change karein</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {serviceList.map((service) => {
            const config = categoryConfig[service.category] || categoryConfig.other
            const reqDocs = (service as Record<string, unknown>).required_documents as RequiredDoc[] | undefined
            const officialUrl = (service as Record<string, unknown>).official_url as string | undefined
            const applyProcess = (service as Record<string, unknown>).apply_process as string | undefined
            const eligibility = (service as Record<string, unknown>).eligibility as string | undefined
            const loanTiers = (service as Record<string, unknown>).loan_tiers as LoanTier[] | undefined
            const importantDetails = (service as Record<string, unknown>).important_details as string[] | undefined
            const Icon = config.icon

            return (
              <Card key={service.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex">
                  <div className="w-1.5 bg-gradient-to-b from-[#003366] to-[#2980b9] shrink-0" />
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{service.name}</h4>
                          <Badge variant="secondary" className="text-[10px]">{config.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(service)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteConfirm(service.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs mb-2">
                      {quickPriceEdit === service.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Rs</span>
                          <Input
                            type="number"
                            value={quickPriceValue}
                            onChange={(e) => setQuickPriceValue(parseFloat(e.target.value) || 0)}
                            className="h-6 w-20 text-xs p-1 border-blue-200"
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-emerald-600" onClick={() => handleQuickPriceSave(service.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => setQuickPriceEdit(null)}>
                            <XIcon className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-1 group cursor-pointer"
                          onClick={() => { setQuickPriceEdit(service.id); setQuickPriceValue(service.base_price || 0) }}
                          title="Click to edit price"
                        >
                          <span className="font-bold text-[#003366]">Rs {service.base_price?.toLocaleString()}</span>
                          <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                      <Badge className={service.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'} variant="secondary">
                        {service.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Apply Flow Status - Quick Summary */}
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      <div className={`text-[9px] px-1.5 py-1 rounded text-center ${eligibility ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                        <Shield className="w-2.5 h-2.5 mx-auto mb-0.5" />
                        {eligibility ? 'Eligibility ✓' : 'No Eligibility'}
                      </div>
                      <div className={`text-[9px] px-1.5 py-1 rounded text-center ${(service as Record<string, unknown>).deadlines && Object.keys((service as Record<string, unknown>).deadlines as object).length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                        <Clock className="w-2.5 h-2.5 mx-auto mb-0.5" />
                        Deadlines
                      </div>
                      <div className={`text-[9px] px-1.5 py-1 rounded text-center ${importantDetails && importantDetails.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                        <Info className="w-2.5 h-2.5 mx-auto mb-0.5" />
                        {importantDetails?.length || 0} Details
                      </div>
                    </div>

                    {/* Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {service.features.map((f, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full">{f}</span>
                        ))}
                      </div>
                    )}

                    {/* Required Documents */}
                    {reqDocs && reqDocs.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-[10px] font-semibold text-[#003366] mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Required Documents ({reqDocs.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {reqDocs.map(doc => (
                            <span key={doc.id} className={`text-[9px] px-1.5 py-0.5 rounded ${doc.is_mandatory ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                              {doc.is_mandatory ? '*' : ''}{doc.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Loan Tiers */}
                    {loanTiers && loanTiers.length > 0 && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-[10px] font-semibold text-purple-700 mb-1 flex items-center gap-1">
                          <Banknote className="w-3 h-3" /> Loan Tiers ({loanTiers.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {loanTiers.map((tier, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded">
                              T{tier.tier}: Rs.{tier.amount_min?.toLocaleString()}-{tier.amount_max?.toLocaleString()} ({tier.markup_rate})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official URL & Apply Process */}
                    {(officialUrl || applyProcess) && (
                      <div className="mt-2 text-[10px] text-muted-foreground">
                        {officialUrl && <p className="truncate">URL: {officialUrl}</p>}
                        {applyProcess && <p className="line-clamp-1">Process: {applyProcess}</p>}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Service Dialog - WITH APPLY FLOW TABS */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditingService(null); setFormData(emptyForm); setFormTab('basic') } }}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-[#2980b9]" />
              {editingService ? 'Edit Service' : 'New Service'}
            </DialogTitle>
          </DialogHeader>

          {/* Tabbed Interface */}
          <Tabs value={formTab} onValueChange={setFormTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="basic" className="text-xs py-2">Basic Info</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs py-2">Docs & Fields</TabsTrigger>
              <TabsTrigger value="applyflow" className="text-xs py-2 relative">
                Apply Flow
                {!formData.eligibility && !(formData.important_details?.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs py-2">Advanced</TabsTrigger>
            </TabsList>

            {/* TAB 1: Basic Info */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Service Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ehsaas Program" className="mt-1" />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Service ki detail..." rows={2} className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Service Fee (Rs.) *</Label>
                  <Input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })} className="mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">Yeh fee customer ko pay karni hogi apply karne ke liye</p>
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
              </div>

              <div>
                <Label>Fee Info / Note</Label>
                <Textarea value={formData.fee_info} onChange={(e) => setFormData({ ...formData, fee_info: e.target.value })} placeholder="e.g. No government fee. Photostate shop service charge: Rs. 300-500." rows={2} className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">Yeh text customer ko fee step mein dikhega</p>
              </div>

              <div>
                <Label>Official Website URL</Label>
                <Input value={formData.official_url} onChange={(e) => setFormData({ ...formData, official_url: e.target.value })} placeholder="https://example.gov.pk" className="mt-1" />
              </div>

              <div>
                <Label>Apply Process / Steps</Label>
                <Textarea value={formData.apply_process} onChange={(e) => setFormData({ ...formData, apply_process: e.target.value })} placeholder="1. Website par jayein&#10;2. Registration karein&#10;3. Documents upload karein&#10;4. Submit karein" rows={3} className="mt-1" />
              </div>

              {/* Features */}
              <div>
                <Label>Features / Included Items</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="e.g. Online Application" className="flex-1" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.features.map((f, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1">
                      {f}
                      <button onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-red-500"><XIcon className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
                <Label>Service Active hai</Label>
              </div>
            </TabsContent>

            {/* TAB 2: Documents & Fields */}
            <TabsContent value="documents" className="space-y-4 mt-4">
              {/* Required Documents */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="text-[#003366] font-semibold flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" /> Required Documents for Apply
                </Label>
                <p className="text-xs text-blue-700 mb-3">Yeh woh documents hain jo customer sy leny honge application ke liye.</p>

                <div className="space-y-2 mb-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })} placeholder="Document name, e.g. CNIC Copy" className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDoc())} />
                    </div>
                    <div className="flex items-center gap-1.5 px-2">
                      <Switch checked={newDoc.is_mandatory} onCheckedChange={(v) => setNewDoc({ ...newDoc, is_mandatory: v })} className="scale-75" />
                      <span className="text-[10px] text-muted-foreground">{newDoc.is_mandatory ? 'Required' : 'Optional'}</span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addDoc} className="h-8"><Plus className="w-3 h-3" /></Button>
                  </div>
                  <Input value={newDoc.description} onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })} placeholder="Description (optional)" className="h-8 text-xs" />
                </div>

                {formData.required_documents.length > 0 && (
                  <div className="space-y-1.5">
                    {formData.required_documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                        <div className="flex items-center gap-2">
                          {doc.is_mandatory ? (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">Required</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">Optional</span>
                          )}
                          <span className="text-xs font-medium">{doc.name}</span>
                          {doc.description && <span className="text-[10px] text-muted-foreground">- {doc.description}</span>}
                        </div>
                        <button onClick={() => removeDoc(doc.id)} className="text-red-400 hover:text-red-600"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {formData.required_documents.length === 0 && (
                  <p className="text-xs text-blue-600/70 italic">Abhi koi required document add nahi kiya</p>
                )}
              </div>

              {/* Personal Info Fields */}
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <Label className="text-emerald-800 font-semibold flex items-center gap-2 mb-2">
                  <UserCircle className="w-4 h-4" /> Personal Info Fields (Customer Form)
                </Label>
                <p className="text-xs text-emerald-700 mb-3">Yeh woh fields hain jo customer ko fill karni hongi. Agar koi fields add nahi ki toh default fields aayengi.</p>

                <div className="space-y-2 mb-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input value={newField.label} onChange={(e) => setNewField({ ...newField, label: e.target.value })} placeholder="Field label, e.g. Father Name" className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addField())} />
                    </div>
                    <div className="w-28">
                      <Select value={newField.field_type} onValueChange={(v: any) => setNewField({ ...newField, field_type: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="cnic">CNIC</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                      <Switch checked={newField.is_required} onCheckedChange={(v) => setNewField({ ...newField, is_required: v })} className="scale-75" />
                      <span className="text-[9px] text-muted-foreground">{newField.is_required ? 'Req' : 'Opt'}</span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addField} className="h-8"><Plus className="w-3 h-3" /></Button>
                  </div>
                  <Input value={newField.placeholder} onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })} placeholder="Placeholder text (optional)" className="h-8 text-xs" />
                </div>

                {(formData.personal_info_fields || []).length > 0 && (
                  <div className="space-y-1.5">
                    {(formData.personal_info_fields || []).map(field => (
                      <div key={field.id} className="flex items-center justify-between p-2 bg-white rounded border border-emerald-100">
                        <div className="flex items-center gap-2">
                          {field.is_required ? (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">Required</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">Optional</span>
                          )}
                          <span className="text-xs font-medium">{field.label}</span>
                          <span className="text-[9px] px-1 py-0.5 bg-gray-100 text-gray-600 rounded">{field.field_type}</span>
                        </div>
                        <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-600"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {(formData.personal_info_fields || []).length === 0 && (
                  <p className="text-xs text-emerald-600/70 italic">Abhi koi custom field add nahi kiya. Default fields use hongi.</p>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Apply Flow Manager - THE KEY NEW SECTION */}
            <TabsContent value="applyflow" className="space-y-4 mt-4">
              <div className="bg-gradient-to-r from-[#003366]/5 to-[#2980b9]/5 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-[#003366] font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Yeh woh data hai jo customer ko apply flow mein step-by-step dikhega. Har section ko fill karein takay customer ko sahi information mile.
                </p>
              </div>

              {/* Step 1: Eligibility */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Label className="text-amber-800 font-semibold flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" /> Step 1: Eligibility / اہلیت
                </Label>
                <p className="text-xs text-amber-700 mb-3">Is service ke liye kya eligibility hai? Yeh text customer ko eligibility step mein dikhega.</p>
                <Textarea
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  placeholder="e.g. Pakistani citizen with valid CNIC. Age 21-45 years. Monthly income below Rs. 50,000. Government employees NOT eligible."
                  rows={3}
                  className="border-amber-200 focus-visible:ring-amber-300"
                />
                {!formData.eligibility && (
                  <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Agar yeh khaali rahega toh customer ko &quot;Koi khaas eligibility nahi&quot; dikhega
                  </p>
                )}
              </div>

              {/* Step 2: Deadlines */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <Label className="text-red-800 font-semibold flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" /> Step 2: Deadlines / آخری تاریخ
                </Label>
                <p className="text-xs text-red-700 mb-3">Is service ke liye deadlines set karein ya year-round hai?</p>

                <div className="flex items-center gap-3 mb-3">
                  <Switch
                    checked={getDeadlineObj().is_rolling}
                    onCheckedChange={(v) => updateDeadline('is_rolling', v)}
                  />
                  <Label className="text-sm">Year-Round Available / سال بھر دستیاب</Label>
                </div>

                {!getDeadlineObj().is_rolling && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs">Opening Date / آغاز</Label>
                      <Input
                        type="date"
                        value={getDeadlineObj().start_date || ''}
                        onChange={(e) => updateDeadline('start_date', e.target.value)}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Closing Date / آخری تاریخ</Label>
                      <Input
                        type="date"
                        value={getDeadlineObj().end_date || ''}
                        onChange={(e) => updateDeadline('end_date', e.target.value)}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Deadline Note</Label>
                  <Input
                    value={getDeadlineObj().note || ''}
                    onChange={(e) => updateDeadline('note', e.target.value)}
                    placeholder="e.g. BISP registration saal bhar khuli rehti hai"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Step 3: Loan Tiers (only for loan category) */}
              {formData.category === 'loan' && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Label className="text-purple-800 font-semibold flex items-center gap-2 mb-2">
                    <Banknote className="w-4 h-4" /> Step 3: Loan Tiers / قرضے کی اقسام
                  </Label>
                  <p className="text-xs text-purple-700 mb-3">Loan ke different tiers add karein (amount ranges, markup rates, duration).</p>

                  <div className="space-y-2 mb-3 p-3 bg-white rounded-lg border border-purple-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px]">Tier Name *</Label>
                        <Input value={newLoanTier.name || ''} onChange={(e) => setNewLoanTier({ ...newLoanTier, name: e.target.value })} placeholder="e.g. Tier 1 - Interest Free" className="h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Markup Rate</Label>
                        <Input value={newLoanTier.markup_rate || '0%'} onChange={(e) => setNewLoanTier({ ...newLoanTier, markup_rate: e.target.value })} placeholder="0%" className="h-7 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[10px]">Min Amount (Rs)</Label>
                        <Input type="number" value={newLoanTier.amount_min || 0} onChange={(e) => setNewLoanTier({ ...newLoanTier, amount_min: parseInt(e.target.value) || 0 })} className="h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Max Amount (Rs)</Label>
                        <Input type="number" value={newLoanTier.amount_max || 0} onChange={(e) => setNewLoanTier({ ...newLoanTier, amount_max: parseInt(e.target.value) || 0 })} className="h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Duration</Label>
                        <Input value={newLoanTier.duration || '3 years'} onChange={(e) => setNewLoanTier({ ...newLoanTier, duration: e.target.value })} className="h-7 text-xs" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch checked={newLoanTier.collateral || false} onCheckedChange={(v) => setNewLoanTier({ ...newLoanTier, collateral: v })} className="scale-75" />
                        <span className="text-[10px]">Collateral Required</span>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addLoanTier} className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" /> Add Tier</Button>
                    </div>
                  </div>

                  {(formData.loan_tiers || []).length > 0 && (
                    <div className="space-y-1.5">
                      {(formData.loan_tiers || []).map((tier, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-purple-100">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">T{tier.tier}</span>
                              <span className="text-xs font-medium">{tier.name}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Rs.{tier.amount_min?.toLocaleString()}-{tier.amount_max?.toLocaleString()} | {tier.markup_rate} | {tier.duration} {tier.collateral ? '| Collateral' : ''}
                            </p>
                          </div>
                          <button onClick={() => removeLoanTier(index)} className="text-red-400 hover:text-red-600 ml-2"><XIcon className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(formData.loan_tiers || []).length === 0 && (
                    <p className="text-xs text-purple-600/70 italic">Abhi koi loan tier add nahi kiya</p>
                  )}
                </div>
              )}

              {/* Step 4: Important Details */}
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <Label className="text-cyan-800 font-semibold flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" /> Step {formData.category === 'loan' ? '5' : '3'}: Important Details / اہم تفصیلات
                </Label>
                <p className="text-xs text-cyan-700 mb-3">Important points jo customer ko apply karne se pehle pata hone chahiye.</p>

                <div className="flex gap-2 mb-3">
                  <Input
                    value={newImportantDetail}
                    onChange={(e) => setNewImportantDetail(e.target.value)}
                    placeholder="e.g. NSER survey is mandatory for new applicants"
                    className="h-8 text-sm flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImportantDetail())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addImportantDetail} className="h-8"><Plus className="w-3 h-3" /></Button>
                </div>

                {(formData.important_details || []).length > 0 && (
                  <div className="space-y-1.5">
                    {(formData.important_details || []).map((detail, index) => (
                      <div key={index} className="flex items-start justify-between p-2 bg-white rounded border border-cyan-100">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{index + 1}</span>
                          <span className="text-xs">{detail}</span>
                        </div>
                        <button onClick={() => removeImportantDetail(index)} className="text-red-400 hover:text-red-600 ml-2 shrink-0"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {(formData.important_details || []).length === 0 && (
                  <p className="text-xs text-cyan-600/70 italic">Abhi koi important detail add nahi kiya</p>
                )}
              </div>

              {/* Processing Time & Special Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-green-800 font-semibold text-xs flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5" /> Processing Time
                  </Label>
                  <Input
                    value={formData.processing_time}
                    onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })}
                    placeholder="e.g. 2-4 weeks"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Label className="text-orange-800 font-semibold text-xs flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Special Notes
                  </Label>
                  <Input
                    value={formData.special_notes}
                    onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                    placeholder="e.g. Biometric verification mandatory"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              {/* Apply Steps Config */}
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <Label className="text-indigo-800 font-semibold flex items-center gap-2 mb-2">
                  <ListChecks className="w-4 h-4" /> Custom Apply Flow Steps
                </Label>
                <p className="text-xs text-indigo-700 mb-3">
                  Default steps automatically set hote hain based on category. Agar aap custom steps chahte hain toh yahan add karein. Khaali chhodne par default steps use hongi.
                </p>
                <p className="text-[10px] text-indigo-600 mb-2 font-medium">Default Steps (Non-Loan): Eligibility → Deadlines → Important Details → Personal Details → Documents → Payment → Review</p>
                <p className="text-[10px] text-indigo-600 mb-3 font-medium">Default Steps (Loan): Eligibility → Deadlines → Loan Tiers → Loan Amount → Important Details → Personal Details → Documents → Payment → Review</p>

                <div className="flex gap-2 mb-3">
                  <Input
                    value={newApplyStep}
                    onChange={(e) => setNewApplyStep(e.target.value)}
                    placeholder="e.g. guarantor_info"
                    className="h-8 text-sm flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addApplyStep())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addApplyStep} className="h-8"><Plus className="w-3 h-3" /></Button>
                </div>

                {(formData.apply_steps || []).length > 0 && (
                  <div className="space-y-1.5">
                    {(formData.apply_steps || []).map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-indigo-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">{index + 1}</span>
                          <span className="text-xs font-medium">{step}</span>
                        </div>
                        <button onClick={() => removeApplyStep(index)} className="text-red-400 hover:text-red-600"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {(formData.apply_steps || []).length === 0 && (
                  <p className="text-xs text-indigo-600/70 italic">Default steps use hongi (khaali chhodne par)</p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
                <Label>Service Active hai</Label>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {formTab !== 'basic' && (
                <Button variant="outline" size="sm" onClick={() => {
                  const tabs = ['basic', 'documents', 'applyflow', 'advanced']
                  const currentIdx = tabs.indexOf(formTab)
                  if (currentIdx > 0) setFormTab(tabs[currentIdx - 1])
                }}>
                  Previous Tab
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingService(null); setFormData(emptyForm); setFormTab('basic') }}>Cancel</Button>
              {formTab !== 'advanced' && (
                <Button variant="outline" onClick={() => {
                  const tabs = ['basic', 'documents', 'applyflow', 'advanced']
                  const currentIdx = tabs.indexOf(formTab)
                  if (currentIdx < tabs.length - 1) setFormTab(tabs[currentIdx + 1])
                }} className="gap-1">
                  Next Tab <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                </Button>
              )}
              <Button onClick={handleSave} disabled={!formData.name} className="bg-gradient-to-r from-[#003366] to-[#2980b9] text-white">
                {saveMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (editingService ? 'Update Service' : 'Create Service')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Service?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Yeh service permanently delete ho jayegi. Yeh action undo nahi ho sakta.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
