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
  UserCircle,
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
    })
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

  const serviceList = (services || []) as ServiceItem[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[#003366]"><ListChecks className="w-6 h-6 text-[#2980b9]" /> Service Manager</h2>
          <p className="text-muted-foreground">Services manage karein, required documents set karein, aur official URLs add karein</p>
        </div>
        <Button onClick={() => { setEditingService(null); setFormData(emptyForm); setShowForm(true) }} className="gap-2 bg-gradient-to-r from-[#003366] to-[#2980b9] text-white">
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

                    {/* Official URL & Apply Process */}
                    {(officialUrl || applyProcess) && (
                      <div className="mt-2 text-[10px] text-muted-foreground">
                        {officialUrl && <p className="truncate">URL: {officialUrl}</p>}
                        {applyProcess && <p className="line-clamp-1">Process: {applyProcess}</p>
                        }</div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Service Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditingService(null); setFormData(emptyForm) } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-[#2980b9]" />
              {editingService ? 'Edit Service' : 'New Service'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Info */}
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
                <Label>Base Price (Rs.)</Label>
                <Input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Official Website URL</Label>
              <Input value={formData.official_url} onChange={(e) => setFormData({ ...formData, official_url: e.target.value })} placeholder="https://example.gov.pk" className="mt-1" />
              <p className="text-[10px] text-muted-foreground mt-1">Is scheme ki official website jahan par apply karna hota hai</p>
            </div>

            <div>
              <Label>Apply Process / Steps</Label>
              <Textarea value={formData.apply_process} onChange={(e) => setFormData({ ...formData, apply_process: e.target.value })} placeholder="1. Website par jayein&#10;2. Registration karein&#10;3. Documents upload karein&#10;4. Submit karein" rows={3} className="mt-1" />
              <p className="text-[10px] text-muted-foreground mt-1">Step by step process jaisy apply karna hai official website par</p>
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

            {/* Required Documents - THE KEY FEATURE */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-[#003366] font-semibold flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" /> Required Documents for Apply
              </Label>
              <p className="text-xs text-blue-700 mb-3">Yeh woh documents hain jo customer sy leny honge application ke liye. Jab customer apply karega, yeh checklist dikhega.</p>

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
                <Input value={newDoc.description} onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })} placeholder="Description (optional), e.g. Both sides photocopy" className="h-8 text-xs" />
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

            {/* Personal Info Fields - For customer application form */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <Label className="text-emerald-800 font-semibold flex items-center gap-2 mb-2">
                <UserCircle className="w-4 h-4" /> Personal Info Fields (Customer Form)
              </Label>
              <p className="text-xs text-emerald-700 mb-3">Yeh woh fields hain jo customer ko fill karni hongi jab woh apply karega. Agar koi fields add nahi ki toh default fields aayengi (Name, CNIC, Phone, WhatsApp).</p>

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

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
              <Label>Service Active hai</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingService(null); setFormData(emptyForm) }}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name} className="bg-gradient-to-r from-[#003366] to-[#2980b9] text-white">
              {saveMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (editingService ? 'Update Service' : 'Create Service')}
            </Button>
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
