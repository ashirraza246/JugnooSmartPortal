'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  ScanLine, FileText, Mail, ClipboardList, Scale, Camera, Languages, Copy,
  Sparkles, Upload, Download, Eye, Trash2, Plus, FileCheck2, Clock,
  CheckCircle2, AlertCircle, Loader2, RefreshCw, ChevronRight,
  Image as ImageIcon, FileOutput, Wand2, Send, X, IndianRupee, Zap,
  ShieldCheck, Stamp, BookOpen, MessageSquare
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ─── Theme Colors ────────────────────────────────────────
const UBL = {
  navy: '#003366',
  teal: '#1a5276',
  sky: '#2980b9',
  light: '#3498db',
  accent: '#e67e22',
  gold: '#f39c12',
}

// ─── Types ───────────────────────────────────────────────
interface ServiceItem {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  price: string
  turnaround: string
  color: string
  gradient: string
}

interface UploadedFile {
  id: string
  file: File
  preview: string
  name: string
  size: number
}

interface DocOrder {
  id: string
  orderNumber: string
  service: string
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled'
  createdAt: string
  estimatedDelivery: string
  price: string
  language?: string
}

// ─── Service Data ────────────────────────────────────────
const SERVICES: ServiceItem[] = [
  {
    id: 'scanning',
    name: 'Document Scanning',
    description: 'Upload rough images → Professional PDF output with quality enhancement',
    icon: <ScanLine className="w-7 h-7" />,
    price: '₹20/page',
    turnaround: '15 min',
    color: UBL.navy,
    gradient: 'from-[#003366] to-[#1a5276]',
  },
  {
    id: 'doc-writing-en',
    name: 'Document Writing (English)',
    description: 'Professional English document writing with proper formatting and grammar',
    icon: <FileText className="w-7 h-7" />,
    price: '₹100/page',
    turnaround: '1-2 hrs',
    color: UBL.teal,
    gradient: 'from-[#1a5276] to-[#2980b9]',
  },
  {
    id: 'doc-writing-ur',
    name: 'Document Writing (Urdu)',
    description: 'Professional Urdu document writing with correct script and formatting',
    icon: <BookOpen className="w-7 h-7" />,
    price: '₹120/page',
    turnaround: '1-2 hrs',
    color: '#0d6e3f',
    gradient: 'from-[#0d6e3f] to-[#1a8a52]',
  },
  {
    id: 'letter-en',
    name: 'Letter Writing (English)',
    description: 'Formal & informal letters in English — business, personal, official',
    icon: <Mail className="w-7 h-7" />,
    price: '₹80/letter',
    turnaround: '45 min',
    color: UBL.sky,
    gradient: 'from-[#2980b9] to-[#3498db]',
  },
  {
    id: 'letter-ur',
    name: 'Letter Writing (Urdu)',
    description: 'Formal & informal letters in Urdu — business, personal, official',
    icon: <MessageSquare className="w-7 h-7" />,
    price: '₹100/letter',
    turnaround: '45 min',
    color: '#1a6b3c',
    gradient: 'from-[#1a6b3c] to-[#27ae60]',
  },
  {
    id: 'application',
    name: 'Application Writing',
    description: 'Job applications, leave applications, request applications in English/Urdu',
    icon: <ClipboardList className="w-7 h-7" />,
    price: '₹80-150',
    turnaround: '1 hr',
    color: UBL.accent,
    gradient: 'from-[#e67e22] to-[#f39c12]',
  },
  {
    id: 'affidavit',
    name: 'Affidavit Writing',
    description: 'Legal affidavits drafted as per standard format with proper declarations',
    icon: <Scale className="w-7 h-7" />,
    price: '₹200-500',
    turnaround: '2-3 hrs',
    color: '#8e44ad',
    gradient: 'from-[#8e44ad] to-[#9b59b6]',
  },
  {
    id: 'photo',
    name: 'Photo Services',
    description: 'Passport photos, ID photos, visa photos — printed & digital copies',
    icon: <Camera className="w-7 h-7" />,
    price: '₹50-200',
    turnaround: '20 min',
    color: '#c0392b',
    gradient: 'from-[#c0392b] to-[#e74c3c]',
  },
  {
    id: 'translation',
    name: 'Translation Services',
    description: 'English ↔ Urdu translation for documents, certificates, letters',
    icon: <Languages className="w-7 h-7" />,
    price: '₹150/page',
    turnaround: '2-4 hrs',
    color: '#16a085',
    gradient: 'from-[#16a085] to-[#1abc9c]',
  },
  {
    id: 'certificate-copy',
    name: 'Certificate / Result Copy',
    description: 'Copies of certificates, results, marksheets with attestation support',
    icon: <Copy className="w-7 h-7" />,
    price: '₹30/copy',
    turnaround: '30 min',
    color: '#2c3e50',
    gradient: 'from-[#2c3e50] to-[#34495e]',
  },
]

const DOC_TYPES = [
  'Formal Letter',
  'Job Application',
  'Leave Application',
  'Request Application',
  'Complaint Letter',
  'Recommendation Letter',
  'Affidavit',
  'No Objection Certificate (NOC)',
  'Power of Attorney',
  'Legal Notice',
  'Experience Certificate',
  'Character Certificate',
  'Bonafide Certificate',
  'Internship Letter',
  'Resignation Letter',
  'Business Proposal',
  'Invitation Letter',
  'Permission Letter',
]

const STATUS_CONFIG: Record<DocOrder['status'], { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  ready: { label: 'Ready', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle className="w-3.5 h-3.5" /> },
}

// ─── Simulated Orders ───────────────────────────────────
const INITIAL_ORDERS: DocOrder[] = [
  {
    id: '1',
    orderNumber: 'DOC-2025-1001',
    service: 'Document Scanning',
    status: 'delivered',
    createdAt: '2025-05-08T10:30:00',
    estimatedDelivery: '2025-05-08T10:45:00',
    price: '₹60',
  },
  {
    id: '2',
    orderNumber: 'DOC-2025-1002',
    service: 'Letter Writing (English)',
    status: 'processing',
    createdAt: '2025-05-09T09:00:00',
    estimatedDelivery: '2025-05-09T09:45:00',
    price: '₹80',
    language: 'English',
  },
  {
    id: '3',
    orderNumber: 'DOC-2025-1003',
    service: 'Affidavit Writing',
    status: 'pending',
    createdAt: '2025-05-09T11:15:00',
    estimatedDelivery: '2025-05-09T14:15:00',
    price: '₹350',
  },
]

// ─── Helpers ─────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `DOC-2025-${num}`
}

// ─── Sub-Components ──────────────────────────────────────

function ServiceCard({ service, onSelect }: { service: ServiceItem; onSelect: (s: ServiceItem) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative"
        onClick={() => onSelect(service)}
      >
        {/* Gradient Top Bar */}
        <div className={`h-1.5 bg-gradient-to-r ${service.gradient}`} />

        <CardContent className="p-5 pt-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white shadow-lg`}
              style={{ boxShadow: `0 8px 20px ${service.color}30` }}
            >
              {service.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold text-[15px] text-foreground truncate">
                  {service.name}
                </h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {service.description}
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs font-semibold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-100">
                  {service.price}
                </Badge>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {service.turnaround}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function AISparkleBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md">
      <Sparkles className="w-3 h-3" /> AI
    </span>
  )
}

// ─── Main Component ──────────────────────────────────────
export function DocumentServicesModule() {
  const { toast } = useToast()

  // State
  const [activeTab, setActiveTab] = useState('services')
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [orders, setOrders] = useState<DocOrder[]>(INITIAL_ORDERS)

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI Writer state
  const [aiDocType, setAiDocType] = useState('')
  const [aiLanguage, setAiLanguage] = useState('english')
  const [aiBrief, setAiBrief] = useState('')
  const [aiGenerated, setAiGenerated] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Service request state
  const [reqName, setReqName] = useState('')
  const [reqPhone, setReqPhone] = useState('')
  const [reqDetails, setReqDetails] = useState('')

  // ─── File Upload ────────────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: UploadedFile[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid File', description: `${file.name} is not an image file`, variant: 'destructive' })
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File Too Large', description: `${file.name} exceeds 10MB limit`, variant: 'destructive' })
        continue
      }
      const preview = URL.createObjectURL(file)
      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        preview,
        name: file.name,
        size: file.size,
      })
    }

    setUploadedFiles(prev => [...prev, ...newFiles])
    if (newFiles.length > 0) {
      toast({ title: 'Files Uploaded', description: `${newFiles.length} file(s) added successfully` })
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [toast])

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) URL.revokeObjectURL(file.preview)
      return prev.filter(f => f.id !== id)
    })
  }, [])

  const clearAllFiles = useCallback(() => {
    uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview))
    setUploadedFiles([])
    toast({ title: 'Cleared', description: 'All files removed' })
  }, [uploadedFiles, toast])

  // ─── PDF Generation ────────────────────────────
  const generatePDF = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({ title: 'No Files', description: 'Please upload at least one image', variant: 'destructive' })
      return
    }

    setIsProcessing(true)
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < uploadedFiles.length; i++) {
        if (i > 0) pdf.addPage()

        const file = uploadedFiles[i]
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file.file)
        })

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new window.Image()
          image.onload = () => resolve(image)
          image.onerror = reject
          image.src = dataUrl
        })

        const imgRatio = img.width / img.height
        const pageRatio = pageWidth / pageHeight

        let drawW: number, drawH: number, x: number, y: number

        if (imgRatio > pageRatio) {
          drawW = pageWidth - 10
          drawH = drawW / imgRatio
          x = 5
          y = (pageHeight - drawH) / 2
        } else {
          drawH = pageHeight - 10
          drawW = drawH * imgRatio
          x = (pageWidth - drawW) / 2
          y = 5
        }

        pdf.addImage(dataUrl, 'JPEG', x, y, drawW, drawH, undefined, 'FAST')
      }

      pdf.save('scanned-document.pdf')

      // Create order
      const newOrder: DocOrder = {
        id: String(Date.now()),
        orderNumber: generateOrderId(),
        service: 'Document Scanning',
        status: 'delivered',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date().toISOString(),
        price: `₹${uploadedFiles.length * 20}`,
      }
      setOrders(prev => [newOrder, ...prev])

      toast({ title: 'PDF Generated!', description: 'Your scanned document PDF has been downloaded' })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast({ title: 'Error', description: 'Failed to generate PDF. Please try again.', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }, [uploadedFiles, toast])

  // ─── AI Document Generation ────────────────────
  const generateAIDocument = useCallback(async () => {
    if (!aiDocType) {
      toast({ title: 'Select Type', description: 'Please select a document type', variant: 'destructive' })
      return
    }
    if (!aiBrief.trim()) {
      toast({ title: 'Add Details', description: 'Please provide a brief description', variant: 'destructive' })
      return
    }

    setAiLoading(true)
    setAiGenerated('')

    try {
      const systemPrompt = `You are a professional document writer at Jugnoo Smart Portal, a photostate/document services shop. You write formal documents in ${aiLanguage === 'urdu' ? 'Urdu' : 'English'}. Always write complete, properly formatted documents. Use formal language. Include date, subject, salutation, body, and closing as appropriate for the document type. If Urdu is selected, write in Urdu script (not Roman Urdu). The document should be ready to print and use directly.`

      const userPrompt = `Write a ${aiDocType} in ${aiLanguage === 'urdu' ? 'Urdu' : 'English'}.\n\nBrief details provided by the customer:\n${aiBrief}\n\nPlease write the complete ${aiDocType} based on the above details. Make it professional and properly formatted.`

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          systemPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error('AI service error')
      }

      const data = await response.json()
      const content = data.response || data.content || 'No response generated.'

      setAiGenerated(content)

      // Create order
      const newOrder: DocOrder = {
        id: String(Date.now()),
        orderNumber: generateOrderId(),
        service: `AI ${aiDocType}`,
        status: 'ready',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date().toISOString(),
        price: '₹50',
        language: aiLanguage === 'urdu' ? 'Urdu' : 'English',
      }
      setOrders(prev => [newOrder, ...prev])

      toast({ title: 'Document Generated!', description: 'Your AI-generated document is ready' })
    } catch (error) {
      console.error('AI generation error:', error)
      toast({ title: 'AI Error', description: 'Failed to generate document. Please try again.', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }, [aiDocType, aiLanguage, aiBrief, toast])

  // ─── Service Request ───────────────────────────
  const submitServiceRequest = useCallback(() => {
    if (!selectedService) return
    if (!reqName.trim() || !reqPhone.trim()) {
      toast({ title: 'Missing Info', description: 'Please provide your name and phone number', variant: 'destructive' })
      return
    }

    const newOrder: DocOrder = {
      id: String(Date.now()),
      orderNumber: generateOrderId(),
      service: selectedService.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      price: selectedService.price,
    }
    setOrders(prev => [newOrder, ...prev])

    toast({
      title: 'Request Submitted!',
      description: `Your ${selectedService.name} request has been placed. Order: ${newOrder.orderNumber}`,
    })

    setServiceDialogOpen(false)
    setReqName('')
    setReqPhone('')
    setReqDetails('')
    setSelectedService(null)
  }, [selectedService, reqName, reqPhone, reqDetails, toast])

  // ─── Download AI doc as text ───────────────────
  const downloadAIDocument = useCallback(() => {
    if (!aiGenerated) return
    const blob = new Blob([aiGenerated], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${aiDocType || 'document'}-${aiLanguage}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: 'Downloaded', description: 'Document saved as text file' })
  }, [aiGenerated, aiDocType, aiLanguage, toast])

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview))
    }
  }, [])

  // ─── Render ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#003366] to-[#2980b9] flex items-center justify-center shadow-lg" style={{ boxShadow: '0 8px 24px #00336630' }}>
                <Stamp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Document Services</h1>
                <p className="text-sm text-muted-foreground">Professional document solutions — Scan, Write, Translate & More</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-[#003366] to-[#2980b9] text-white border-0 shadow-md px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Trusted Service
            </Badge>
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
              <Zap className="w-3.5 h-3.5 mr-1" /> Fast Delivery
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white shadow-sm border rounded-xl p-1 h-auto gap-1">
          <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003366] data-[state=active]:to-[#2980b9] data-[state=active]:text-white px-4 py-2 text-sm font-medium">
            <FileText className="w-4 h-4 mr-2" /> Services
          </TabsTrigger>
          <TabsTrigger value="scan" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003366] data-[state=active]:to-[#2980b9] data-[state=active]:text-white px-4 py-2 text-sm font-medium">
            <ScanLine className="w-4 h-4 mr-2" /> Scan & PDF
          </TabsTrigger>
          <TabsTrigger value="ai-writer" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003366] data-[state=active]:to-[#2980b9] data-[state=active]:text-white px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" /> AI Writer
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#003366] data-[state=active]:to-[#2980b9] data-[state=active]:text-white px-4 py-2 text-sm font-medium">
            <ClipboardList className="w-4 h-4 mr-2" /> My Orders
          </TabsTrigger>
        </TabsList>

        {/* ───── SERVICES TAB ───── */}
        <TabsContent value="services" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Services', value: String(SERVICES.length), icon: <FileText className="w-4 h-4" />, gradient: 'from-[#003366] to-[#1a5276]' },
              { label: 'Languages', value: '2', icon: <Languages className="w-4 h-4" />, gradient: 'from-[#16a085] to-[#1abc9c]' },
              { label: 'Avg Turnaround', value: '< 2 hrs', icon: <Clock className="w-4 h-4" />, gradient: 'from-[#e67e22] to-[#f39c12]' },
              { label: 'AI Powered', value: 'Yes', icon: <Sparkles className="w-4 h-4" />, gradient: 'from-[#8e44ad] to-[#9b59b6]' },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Service Grid */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-foreground">All Services</h2>
              <Badge variant="secondary" className="text-xs">{SERVICES.length} available</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={(s) => {
                    setSelectedService(s)
                    setServiceDialogOpen(true)
                  }}
                />
              ))}
            </div>
          </div>

          {/* Pricing Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#2980b9] to-[#3498db]" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IndianRupee className="w-5 h-5 text-[#003366]" /> Price List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Service</th>
                        <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Price</th>
                        <th className="text-left py-3 px-3 font-semibold text-muted-foreground hidden sm:table-cell">Turnaround</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SERVICES.map((s, i) => (
                        <tr key={s.id} className={`${i < SERVICES.length - 1 ? 'border-b' : ''} hover:bg-muted/30 transition-colors`}>
                          <td className="py-2.5 px-3 flex items-center gap-2">
                            <span className="text-[#003366]">{s.icon}</span>
                            <span className="font-medium">{s.name}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold">
                              {s.price}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">{s.turnaround}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ───── SCAN & PDF TAB ───── */}
        <TabsContent value="scan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#003366] to-[#2980b9]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="w-5 h-5 text-[#003366]" /> Upload Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-[#2980b9]/30 rounded-2xl p-10 text-center cursor-pointer hover:border-[#2980b9]/60 hover:bg-blue-50/30 transition-all duration-300 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#003366] to-[#2980b9] flex items-center justify-center shadow-lg"
                      style={{ boxShadow: '0 10px 30px #00336625' }}
                    >
                      <ImageIcon className="w-8 h-8 text-white" />
                    </motion.div>
                    <p className="text-base font-semibold text-foreground mb-1">
                      Click to upload images
                    </p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG, WebP — up to 10MB each
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs border-[#2980b9]/30 text-[#2980b9]">
                        <Plus className="w-3 h-3 mr-1" /> Add Files
                      </Badge>
                    </div>
                  </div>

                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                      <AnimatePresence>
                        {uploadedFiles.map((file, index) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border hover:shadow-sm transition-shadow"
                          >
                            {/* Thumbnail */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                              <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} • Page {index + 1}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-[#003366]"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(file.preview, '_blank')
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFile(file.id)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Actions */}
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                      <Button
                        onClick={generatePDF}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-[#003366] to-[#2980b9] hover:from-[#003366] hover:to-[#1a5276] text-white shadow-lg"
                        style={{ boxShadow: '0 6px 20px #00336630' }}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <FileOutput className="w-4 h-4 mr-2" /> Generate PDF ({uploadedFiles.length} page{uploadedFiles.length > 1 ? 's' : ''})
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={clearAllFiles} className="border-red-200 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" /> Clear All
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview & Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Preview Card */}
              {uploadedFiles.length > 0 && (
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-[#2980b9] to-[#3498db]" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#2980b9]" /> Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl overflow-hidden bg-muted/50 border aspect-[3/4] flex items-center justify-center">
                      <img
                        src={uploadedFiles[0].preview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {uploadedFiles.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#2980b9]' : 'bg-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#e67e22] to-[#f39c12]" />
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#e67e22]" /> How It Works
                  </h3>
                  <div className="space-y-3">
                    {[
                      { step: '1', text: 'Upload your rough images or photos', icon: <Upload className="w-4 h-4" /> },
                      { step: '2', text: 'Preview & arrange pages in order', icon: <Eye className="w-4 h-4" /> },
                      { step: '3', text: 'Click "Generate PDF" to create document', icon: <FileOutput className="w-4 h-4" /> },
                      { step: '4', text: 'Download your professional PDF', icon: <Download className="w-4 h-4" /> },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366]/10 to-[#2980b9]/10 flex items-center justify-center text-[#003366] flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Step {item.step}</p>
                          <p className="text-xs text-muted-foreground">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" /> Only ₹20 per page • No hidden charges
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ───── AI WRITER TAB ───── */}
        <TabsContent value="ai-writer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="space-y-4">
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#8e44ad] via-[#9b59b6] to-[#c39bd3]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wand2 className="w-5 h-5 text-[#8e44ad]" /> AI Document Writer
                    <AISparkleBadge />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Document Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#8e44ad]" /> Document Type
                    </Label>
                    <Select value={aiDocType} onValueChange={setAiDocType}>
                      <SelectTrigger className="rounded-xl border-[#8e44ad]/20 focus:border-[#8e44ad]">
                        <SelectValue placeholder="Select document type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Languages className="w-3.5 h-3.5 text-[#8e44ad]" /> Language
                    </Label>
                    <div className="flex gap-2">
                      {[
                        { value: 'english', label: 'English', flag: '🇬🇧' },
                        { value: 'urdu', label: 'اردو', flag: '🇵🇰' },
                      ].map((lang) => (
                        <Button
                          key={lang.value}
                          variant={aiLanguage === lang.value ? 'default' : 'outline'}
                          onClick={() => setAiLanguage(lang.value)}
                          className={`flex-1 rounded-xl ${
                            aiLanguage === lang.value
                              ? 'bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] text-white shadow-md'
                              : 'border-[#8e44ad]/20 hover:border-[#8e44ad]/50 hover:bg-[#8e44ad]/5'
                          }`}
                        >
                          <span className="mr-2">{lang.flag}</span> {lang.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Brief Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5 text-[#8e44ad]" /> Brief Description
                    </Label>
                    <Textarea
                      value={aiBrief}
                      onChange={(e) => setAiBrief(e.target.value)}
                      placeholder={aiLanguage === 'urdu'
                        ? 'اپنے دستاویز کی تفصیلات یہاں لکھیں...'
                        : 'Describe what you need in the document. Include names, dates, purpose, recipient, and any specific details...'
                      }
                      className="min-h-[140px] rounded-xl border-[#8e44ad]/20 focus:border-[#8e44ad] resize-none"
                      dir={aiLanguage === 'urdu' ? 'rtl' : 'ltr'}
                    />
                    <p className="text-xs text-muted-foreground">
                      The more details you provide, the better the AI-generated document will be.
                    </p>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateAIDocument}
                    disabled={aiLoading}
                    className="w-full bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] hover:from-[#7d3c98] hover:to-[#8e44ad] text-white shadow-lg py-6 text-base font-semibold rounded-xl"
                    style={{ boxShadow: '0 8px 24px #8e44ad30' }}
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> AI is writing your document...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" /> Generate Document
                      </>
                    )}
                  </Button>

                  <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100">
                    <p className="text-xs text-violet-700 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI-powered • Professional quality • ₹50 per document
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Output Panel */}
            <div className="space-y-4">
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#2980b9] to-[#3498db]" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileCheck2 className="w-5 h-5 text-[#2980b9]" /> Generated Document
                    </CardTitle>
                    {aiGenerated && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAIDocument}
                          className="rounded-lg border-[#2980b9]/20 text-[#2980b9] hover:bg-[#2980b9]/5"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(aiGenerated)
                            toast({ title: 'Copied!', description: 'Document copied to clipboard' })
                          }}
                          className="rounded-lg border-[#2980b9]/20 text-[#2980b9] hover:bg-[#2980b9]/5"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {aiGenerated ? (
                    <div className="rounded-xl border bg-white p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                      <div
                        className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed"
                        dir={aiLanguage === 'urdu' ? 'rtl' : 'ltr'}
                        style={{ fontFamily: aiLanguage === 'urdu' ? 'Noto Nastaliq Urdu, serif' : 'inherit' }}
                      >
                        {aiGenerated}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8e44ad]/10 to-[#9b59b6]/10 flex items-center justify-center mb-4"
                      >
                        <Wand2 className="w-10 h-10 text-[#8e44ad]/40" />
                      </motion.div>
                      <p className="text-base font-semibold text-muted-foreground mb-1">No document yet</p>
                      <p className="text-sm text-muted-foreground/70">
                        Fill in the details on the left and click Generate
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#e67e22] to-[#f39c12]" />
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#e67e22]" /> AI Writer Tips
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Include specific names, dates, and addresses for better results',
                      'Mention the purpose and context clearly',
                      'For Urdu documents, write your brief in Urdu for best output',
                      'You can always edit the generated document after downloading',
                      'AI generates professional, ready-to-use documents',
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-[#e67e22]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[8px] font-bold text-[#e67e22]">{i + 1}</span>
                        </span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ───── ORDERS TAB ───── */}
        <TabsContent value="orders" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Orders', value: String(orders.length), color: 'from-[#003366] to-[#1a5276]', icon: <ClipboardList className="w-4 h-4" /> },
              { label: 'Pending', value: String(orders.filter(o => o.status === 'pending').length), color: 'from-amber-500 to-amber-600', icon: <Clock className="w-4 h-4" /> },
              { label: 'Processing', value: String(orders.filter(o => o.status === 'processing').length), color: 'from-[#2980b9] to-[#3498db]', icon: <Loader2 className="w-4 h-4" /> },
              { label: 'Ready/Delivered', value: String(orders.filter(o => o.status === 'ready' || o.status === 'delivered').length), color: 'from-emerald-500 to-green-600', icon: <CheckCircle2 className="w-4 h-4" /> },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Orders List */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#2980b9] to-[#3498db]" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="w-5 h-5 text-[#003366]" /> Document Orders
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-[#003366]/20 text-[#003366] hover:bg-[#003366]/5"
                  onClick={() => {
                    setOrders(INITIAL_ORDERS)
                    toast({ title: 'Refreshed', description: 'Orders list updated' })
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-base font-semibold text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground/70">Place your first order from the Services tab</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence>
                    {orders.map((order) => {
                      const statusConf = STATUS_CONFIG[order.status]
                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 rounded-xl border bg-gradient-to-r from-white to-slate-50/50 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#2980b9] flex items-center justify-center text-white flex-shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-foreground">{order.service}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {order.orderNumber}
                                  {order.language && ` • ${order.language}`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString('en-PK', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                              <Badge className={`${statusConf.color} border font-medium text-xs`}>
                                {statusConf.icon}
                                <span className="ml-1">{statusConf.label}</span>
                              </Badge>
                              <span className="text-sm font-bold text-emerald-700">{order.price}</span>
                            </div>
                          </div>

                          {/* Progress bar for processing orders */}
                          {order.status === 'processing' && (
                            <div className="mt-3">
                              <div className="w-full h-1.5 rounded-full bg-blue-100 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-[#2980b9] to-[#3498db]"
                                  initial={{ width: '0%' }}
                                  animate={{ width: '65%' }}
                                  transition={{ duration: 1.5, ease: 'easeOut' }}
                                />
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1">Processing your document...</p>
                            </div>
                          )}

                          {order.status === 'ready' && (
                            <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Your document is ready for collection!
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ───── SERVICE REQUEST DIALOG ───── */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedService && (
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedService.gradient} flex items-center justify-center text-white`}>
                  {selectedService.icon}
                </div>
              )}
              <div>
                <span>{selectedService?.name}</span>
                {selectedService && (
                  <p className="text-xs text-muted-foreground font-normal mt-0.5">
                    {selectedService.price} • {selectedService.turnaround}
                  </p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Your Name *</Label>
              <Input
                value={reqName}
                onChange={(e) => setReqName(e.target.value)}
                placeholder="Enter your full name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Phone Number *</Label>
              <Input
                value={reqPhone}
                onChange={(e) => setReqPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="rounded-xl"
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Additional Details</Label>
              <Textarea
                value={reqDetails}
                onChange={(e) => setReqDetails(e.target.value)}
                placeholder="Any specific requirements, language preference, number of copies, etc."
                className="rounded-xl min-h-[80px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setServiceDialogOpen(false)
                setSelectedService(null)
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={submitServiceRequest}
              className="bg-gradient-to-r from-[#003366] to-[#2980b9] hover:from-[#003366] hover:to-[#1a5276] text-white rounded-xl shadow-md"
            >
              <Send className="w-4 h-4 mr-2" /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom scrollbar CSS */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default DocumentServicesModule
