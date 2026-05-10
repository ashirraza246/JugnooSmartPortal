'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { GOVT_SERVICES } from '@/lib/govt-services-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  Search, Building2, GraduationCap, Banknote, Printer,
  Scan, Scale, MoreHorizontal, Loader2, CheckCircle2, Sparkles,
  FileText, Send, Star, Upload, Phone, CreditCard, Building,
  ImagePlus, X, AlertCircle, FileCheck,
  ClipboardCheck, UserCircle, Wallet, Eye, Shield, Zap, Heart,
  ShoppingBag, Rocket, RefreshCw, Camera, Image, Copy, Briefcase,
  Layers, Type, Receipt, Stamp
} from 'lucide-react'

// Build a lookup map from GOVT_SERVICES for fast access by service ID
const govtServicesMap = new Map(GOVT_SERVICES.map(s => [s.id, s]))

// Types for dynamic personal info fields
interface PersonalInfoField {
  id: string
  label: string
  label_urdu?: string
  field_type: 'text' | 'cnic' | 'phone' | 'date' | 'select' | 'number' | 'textarea'
  is_required: boolean
  placeholder?: string
  placeholder_urdu?: string
  options?: { value: string; label: string; label_urdu?: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// Types for required documents
interface RequiredDocument {
  id: string
  name: string
  is_mandatory: boolean
  description?: string
}

// Extended service type
interface ServiceData {
  id: string
  name: string
  category: string
  description: string
  icon: string
  base_price: number
  features: string[]
  required_documents?: RequiredDocument[] | string[]
  personal_info_fields?: PersonalInfoField[]
  official_url?: string
  apply_process?: string
}

// Payment settings from API
interface PaymentConfig {
  jazzCash: { accountNumber: string; accountHolderName: string }
  easyPaisa: { accountNumber: string; accountHolderName: string }
  bankTransfer: { bankName: string; accountNumber: string; accountHolderName: string; iban: string }
}

const categoryConfig: Record<string, { label: string; labelUrdu: string; icon: React.ElementType; color: string; gradient: string }> = {
  govt_scheme: { label: 'Govt Schemes', labelUrdu: 'سرکاری اسکیمز', icon: Building2, color: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600' },
  scholarship: { label: 'Scholarships', labelUrdu: 'اسکالرشپس', icon: GraduationCap, color: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600' },
  loan: { label: 'Loans', labelUrdu: 'قرضے', icon: Banknote, color: 'text-purple-600', gradient: 'from-purple-500 to-pink-600' },
  printing: { label: 'Printing', labelUrdu: 'پرنٹنگ', icon: Printer, color: 'text-[#003366]', gradient: 'from-[#003366] to-[#1a5276]' },
  scanning: { label: 'Scanning & Copy', labelUrdu: 'اسکیننگ و کاپی', icon: Scan, color: 'text-cyan-600', gradient: 'from-cyan-500 to-blue-600' },
  notarisation: { label: 'Notarisation', labelUrdu: 'نٹریزیشن', icon: Scale, color: 'text-rose-600', gradient: 'from-rose-500 to-red-600' },
  other: { label: 'Other Services', labelUrdu: 'دیگر سروسز', icon: MoreHorizontal, color: 'text-gray-600', gradient: 'from-gray-500 to-slate-600' },
}

// Default personal info fields when service doesn't define custom ones
const defaultPersonalInfoFields: PersonalInfoField[] = [
  {
    id: 'applicantName',
    label: 'Full Name',
    label_urdu: 'پورا نام',
    field_type: 'text',
    is_required: true,
    placeholder: 'Enter your full name',
    placeholder_urdu: 'اپنا پورا نام لکھیں',
  },
  {
    id: 'applicantCnic',
    label: 'CNIC Number',
    label_urdu: 'شناختی کارڈ نمبر',
    field_type: 'cnic',
    is_required: true,
    placeholder: 'XXXXX-XXXXXXX-X',
    placeholder_urdu: 'XXXXX-XXXXXXX-X',
  },
  {
    id: 'applicantPhone',
    label: 'Phone Number',
    label_urdu: 'فون نمبر',
    field_type: 'phone',
    is_required: true,
    placeholder: '923001234567',
    placeholder_urdu: '923001234567',
  },
  {
    id: 'applicantWhatsapp',
    label: 'WhatsApp Number',
    label_urdu: 'واٹس ایپ نمبر',
    field_type: 'phone',
    is_required: false,
    placeholder: '923001234567',
    placeholder_urdu: '923001234567',
  },
  {
    id: 'description',
    label: 'Details / Requirements',
    label_urdu: 'تفصیلات / ضروریات',
    field_type: 'textarea',
    is_required: false,
    placeholder: 'Any specific requirement or detail...',
    placeholder_urdu: 'کوئی مخصوص ضرورت یا تفصیل...',
  },
]

// CNIC auto-format function: XXXXX-XXXXXXX-X
function formatCnic(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

// Phone auto-format
function formatPhone(value: string): string {
  return value.replace(/[^\d+]/g, '').slice(0, 15)
}

export function ServicesBrowser() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { isUrdu } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)

  // Dynamic form state for personal info fields
  const [personalInfo, setPersonalInfo] = useState<Record<string, string>>({})
  // Document uploads state
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({})
  const [documentChecked, setDocumentChecked] = useState<Record<string, boolean>>({})
  const [documentPreviews, setDocumentPreviews] = useState<Record<string, string>>({})
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const docFileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const totalSteps = 4

  // Fetch payment settings from API (so admin changes reflect for customers)
  const { data: paymentConfig } = useQuery({
    queryKey: ['payment-settings-public'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        return (data.payments || null) as PaymentConfig | null
      } catch {
        return null
      }
    },
    staleTime: 30000,
    retry: false,
  })

  // Build dynamic payment methods from API config
  const getPaymentMethods = () => {
    const pc = paymentConfig
    return [
      {
        id: 'jazzcash',
        name: 'Jazz Cash',
        nameUrdu: 'جیز کیش',
        icon: Phone,
        color: 'from-red-500 to-red-700',
        accountInfo: pc?.jazzCash?.accountNumber ? `Jazz Cash: ${pc.jazzCash.accountNumber}` : 'Jazz Cash: Contact shop for details',
        accountInfoUrdu: pc?.jazzCash?.accountNumber ? `جیز کیش: ${pc.jazzCash.accountNumber}` : 'جیز کیش: دکان سے رابطہ کریں',
        accountName: pc?.jazzCash?.accountHolderName || 'Jugnoo Photostate',
      },
      {
        id: 'easypaisa',
        name: 'Easy Paisa',
        nameUrdu: 'ایزی پیسہ',
        icon: CreditCard,
        color: 'from-green-500 to-green-700',
        accountInfo: pc?.easyPaisa?.accountNumber ? `Easy Paisa: ${pc.easyPaisa.accountNumber}` : 'Easy Paisa: Contact shop for details',
        accountInfoUrdu: pc?.easyPaisa?.accountNumber ? `ایزی پیسہ: ${pc.easyPaisa.accountNumber}` : 'ایزی پیسہ: دکان سے رابطہ کریں',
        accountName: pc?.easyPaisa?.accountHolderName || 'Jugnoo Photostate',
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        nameUrdu: 'بینک ٹرانسفر',
        icon: Building,
        color: 'from-[#003366] to-[#1a5276]',
        accountInfo: pc?.bankTransfer?.accountNumber ? `${pc.bankTransfer.bankName || 'Bank'}: ${pc.bankTransfer.accountNumber}` : 'Bank: Contact shop for details',
        accountInfoUrdu: pc?.bankTransfer?.accountNumber ? `${pc.bankTransfer.bankName || 'بینک'}: ${pc.bankTransfer.accountNumber}` : 'بینک: دکان سے رابطہ کریں',
        accountName: pc?.bankTransfer?.accountHolderName || 'Jugnoo Photostate',
      },
    ]
  }

  const t = isUrdu ? {
    title: 'ہماری سروسز',
    subtitle: 'جگنو فوٹو اسٹیٹ کی تمام سروسز دیکھیں اور درخواست دیں',
    search: 'سروس تلاش کریں...',
    allServices: 'تمام سروسز',
    noService: 'کوئی سروس نہیں ملی',
    tryOther: 'دوسری کیٹگری آزمائیں یا تلاش تبدیل کریں',
    startingFrom: 'شروعات',
    apply: 'درخواست',
    applyFor: 'کے لیے درخواست',
    serviceFee: 'سروس فیس',
    feeNote: 'یہ فیس درخواست جمع کرانے کے بعد ادا کرنی ہوگی',
    step1: 'ذاتی معلومات',
    step2: 'مطلوبہ دستاویزات',
    step3: 'پیمنٹ',
    step4: 'جائزہ اور جمع',
    selectPayment: 'پیمنٹ کا طریقہ منتخب کریں',
    paymentMethod: 'پیمنٹ کا طریقہ',
    uploadScreenshot: 'اسکرین شاٹ اپلوڈ کریں',
    uploadNote: 'پیمنٹ کرنے کے بعد اسکرین شاٹ اپلوڈ کریں',
    accountDetails: 'اکاؤنٹ کی تفصیلات',
    accountName: 'اکاؤنٹ ہولڈر',
    submitApp: 'درخواست جمع کرائیں',
    submitting: 'جمع ہو رہی ہے...',
    successTitle: 'درخواست جمع ہو گئی!',
    successMsg: 'آپ کی درخواست جمع ہو گئی ہے۔ ہم جلد پروسیس کریں گے۔',
    ok: 'ٹھیک ہے',
    requiredDocs: 'مطلوبہ دستاویزات',
    remove: 'ہٹائیں',
    next: 'اگلا',
    previous: 'پچھلا',
    uploadDoc: 'دستاویز اپلوڈ کریں',
    mandatory: 'لازمی',
    optional: 'اختیاری',
    noDocsRequired: 'کوئی دستاویز درکار نہیں',
    reviewTitle: 'اپنی درخواست کا جائزہ لیں',
    personalDetails: 'ذاتی تفصیلات',
    documents: 'دستاویزات',
    payment: 'پیمنٹ',
    notUploaded: 'اپلوڈ نہیں کیا',
    uploaded: 'اپلوڈ ہو گیا',
    selected: 'منتخب',
    notSelected: 'منتخب نہیں',
    fieldRequired: 'یہ فیلڈ لازمی ہے',
    fillAllRequired: 'براہ کرم تمام لازمی فیلڈز پُر کریں',
    uploadMandatory: 'براہ کرم تمام لازمی دستاویزات اپلوڈ کریں',
    selectPayMethod: 'پیمنٹ کا طریقہ منتخب کریں',
    clickToUpload: 'اپلوڈ کرنے کے لیے کلک کریں',
    orSkip: 'یا اسے چھوڑ دیں',
    officialUrl: 'سرکاری ویب سائٹ',
    applyProcess: 'درخواست کا طریقہ',
  } : {
    title: 'Hamari Services',
    subtitle: 'Jugnoo Photostate ki saari services browse karein aur apply karein',
    search: 'Service search karein...',
    allServices: 'Sab Services',
    noService: 'Koi service nahi mili',
    tryOther: 'Doosri category try karein ya search change karein',
    startingFrom: 'Starting from',
    apply: 'Apply',
    applyFor: 'Apply for',
    serviceFee: 'Service Fee',
    feeNote: 'Yeh fee application submit karne ke baad pay karni hogi',
    step1: 'Personal Details',
    step2: 'Required Documents',
    step3: 'Payment',
    step4: 'Review & Submit',
    selectPayment: 'Payment method select karein',
    paymentMethod: 'Payment Method',
    uploadScreenshot: 'Payment Screenshot Upload Karein',
    uploadNote: 'Payment karne ke baad screenshot upload karein',
    accountDetails: 'Account Details',
    accountName: 'Account Holder',
    submitApp: 'Application Submit Karein',
    submitting: 'Submit ho rahi hai...',
    successTitle: 'Application Submit Ho Gayi!',
    successMsg: 'Aapki application submit ho gayi hai. Hum jald hi process karein ge.',
    ok: 'Theek Hai',
    requiredDocs: 'Required Documents',
    remove: 'Remove',
    next: 'Next',
    previous: 'Previous',
    uploadDoc: 'Upload Document',
    mandatory: 'Mandatory',
    optional: 'Optional',
    noDocsRequired: 'No documents required',
    reviewTitle: 'Review Your Application',
    personalDetails: 'Personal Details',
    documents: 'Documents',
    payment: 'Payment',
    notUploaded: 'Not uploaded',
    uploaded: 'Uploaded',
    selected: 'Selected',
    notSelected: 'Not selected',
    fieldRequired: 'This field is required',
    fillAllRequired: 'Please fill all required fields',
    uploadMandatory: 'Please upload all mandatory documents',
    selectPayMethod: 'Please select a payment method',
    clickToUpload: 'Click to upload',
    orSkip: 'or skip it',
    officialUrl: 'Official Website',
    applyProcess: 'Apply Process',
  }

  const { data: services, isLoading } = useQuery({
    queryKey: ['service-listings', selectedCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (selectedCategory) params.set('category', selectedCategory)
        const res = await fetch(`/api/service-listings?${params}`)
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } catch {
        return []
      }
    },
    retry: false,
  })

  const filteredServices = (services || []).filter((s: ServiceData) =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get the personal info fields for the currently selected service
  const getActiveFields = (): PersonalInfoField[] => {
    // 1. First check if the API service already has personal_info_fields
    if (selectedService?.personal_info_fields && selectedService.personal_info_fields.length > 0) {
      return selectedService.personal_info_fields
    }
    // 2. Look up from GOVT_SERVICES static data by service ID
    const govtService = selectedService ? govtServicesMap.get(selectedService.id) : null
    if (govtService?.personal_info_fields && govtService.personal_info_fields.length > 0) {
      // Convert from govt-services-data format to our local format
      return govtService.personal_info_fields.map(f => ({
        id: f.id,
        label: f.label,
        label_urdu: f.label_urdu,
        field_type: f.field_type as PersonalInfoField['field_type'],
        is_required: f.is_required,
        placeholder: f.placeholder,
        placeholder_urdu: f.placeholder_urdu,
        options: f.options ? f.options.map(o => typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label, label_urdu: (o as { label_urdu?: string }).label_urdu }) : undefined,
        validation: f.validation ? { pattern: f.validation } : undefined,
      }))
    }
    // 3. Fallback to default generic fields
    return defaultPersonalInfoFields
  }

  // Normalize required_documents: handle both string[] and object[] formats
  const getRequiredDocs = (): RequiredDocument[] => {
    // 1. Check API service data first
    if (selectedService?.required_documents && selectedService.required_documents.length > 0) {
      return (selectedService.required_documents as RequiredDocument[]).map((doc) => {
        if (typeof doc === 'string') {
          return { id: doc, name: doc, is_mandatory: true, description: '' }
        }
        return doc
      })
    }
    // 2. Look up from GOVT_SERVICES static data by service ID
    const govtService = selectedService ? govtServicesMap.get(selectedService.id) : null
    if (govtService?.required_documents && govtService.required_documents.length > 0) {
      return govtService.required_documents.map(d => ({
        id: d.id,
        name: d.name,
        is_mandatory: d.is_mandatory,
        description: d.description || '',
      }))
    }
    return []
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const fields = getActiveFields()
      for (const field of fields) {
        if (field.is_required && !personalInfo[field.id]?.trim()) {
          return false
        }
      }
      return true
    }
    if (step === 2) {
      const docs = getRequiredDocs()
      for (const doc of docs) {
        if (doc.is_mandatory && !documentFiles[doc.id]) {
          return false
        }
      }
      return true
    }
    if (step === 3) {
      return !!paymentMethod
    }
    return true
  }

  const goNext = () => {
    if (currentStep === 1 && !validateStep(1)) {
      toast({ title: t.fillAllRequired, variant: 'destructive' })
      return
    }
    if (currentStep === 2 && !validateStep(2)) {
      toast({ title: t.uploadMandatory, variant: 'destructive' })
      return
    }
    if (currentStep === 3 && !validateStep(3)) {
      toast({ title: t.selectPayMethod, variant: 'destructive' })
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  }

  const goPrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handlePersonalInfoChange = (fieldId: string, value: string, fieldType: string) => {
    let formattedValue = value
    if (fieldType === 'cnic') {
      formattedValue = formatCnic(value)
    } else if (fieldType === 'phone') {
      formattedValue = formatPhone(value)
    }
    setPersonalInfo(prev => ({ ...prev, [fieldId]: formattedValue }))
  }

  const handleDocFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocumentFiles(prev => ({ ...prev, [docId]: file }))
      setDocumentChecked(prev => ({ ...prev, [docId]: true }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setDocumentPreviews(prev => ({ ...prev, [docId]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeDocFile = (docId: string) => {
    setDocumentFiles(prev => ({ ...prev, [docId]: null }))
    setDocumentChecked(prev => ({ ...prev, [docId]: false }))
    setDocumentPreviews(prev => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
    if (docFileRefs.current[docId]) {
      docFileRefs.current[docId]!.value = ''
    }
  }

  const handlePaymentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => setPaymentPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removePaymentScreenshot = () => {
    setPaymentScreenshot(null)
    setPaymentPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openApplyDialog = (service: ServiceData) => {
    setSelectedService(service)
    setCurrentStep(1)
    setPersonalInfo({})
    setDocumentFiles({})
    setDocumentChecked({})
    setDocumentPreviews({})
    setPaymentMethod('')
    setPaymentScreenshot(null)
    setPaymentPreview(null)
    setApplySuccess(false)

    // Pre-fill default values from user profile
    const initialInfo: Record<string, string> = {}
    // Resolve fields: API data > GOVT_SERVICES lookup > default
    let resolvedFields: PersonalInfoField[]
    if (service.personal_info_fields && service.personal_info_fields.length > 0) {
      resolvedFields = service.personal_info_fields
    } else {
      const govtService = govtServicesMap.get(service.id)
      if (govtService?.personal_info_fields && govtService.personal_info_fields.length > 0) {
        resolvedFields = govtService.personal_info_fields.map(f => ({
          id: f.id,
          label: f.label,
          label_urdu: f.label_urdu,
          field_type: f.field_type as PersonalInfoField['field_type'],
          is_required: f.is_required,
          placeholder: f.placeholder,
          placeholder_urdu: f.placeholder_urdu,
          options: f.options ? f.options.map(o => typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label, label_urdu: (o as { label_urdu?: string }).label_urdu }) : undefined,
          validation: f.validation ? { pattern: f.validation } : undefined,
        }))
      } else {
        resolvedFields = defaultPersonalInfoFields
      }
    }
    for (const field of resolvedFields) {
      if ((field.id === 'applicantName' || field.id === 'bisp-p1' || field.id === 'ek-p1' || field.id === 'pyl-p1' || field.id === 'pkj-p1' || field.id === 'ncn-p1' || field.id === 'ncr-p1' || field.id === 'er-p1') && user?.full_name) {
        initialInfo[field.id] = user.full_name
      } else if ((field.id === 'applicantPhone' || field.id === 'bisp-p9' || field.id === 'ek-p7' || field.id === 'pyl-p11' || field.id === 'pkj-p11' || field.id === 'ncn-p11' || field.id === 'ncr-p5' || field.id === 'er-p5') && user?.phone) {
        initialInfo[field.id] = user.phone
      } else {
        initialInfo[field.id] = ''
      }
    }
    setPersonalInfo(initialInfo)
    setApplyDialogOpen(true)
  }

  const handleApply = async () => {
    if (!selectedService || !user) return
    if (!paymentMethod) {
      toast({ title: t.selectPayMethod, variant: 'destructive' })
      return
    }
    setApplying(true)
    try {
      const fields = getActiveFields()
      const personalInfoPayload: Record<string, string> = {}
      for (const field of fields) {
        personalInfoPayload[field.id] = personalInfo[field.id] || ''
      }

      // Extract common fields from dynamic personal info for backwards compatibility
      const getName = () => {
        for (const key of Object.keys(personalInfo)) {
          if (key.includes('p1') || key === 'applicantName') return personalInfo[key]
        }
        return user.full_name || ''
      }
      const getCnic = () => {
        for (const key of Object.keys(personalInfo)) {
          if (key.includes('p2') || key === 'applicantCnic') return personalInfo[key]
        }
        return ''
      }
      const getPhone = () => {
        for (const key of Object.keys(personalInfo)) {
          if (key.includes('p9') || key.includes('p11') || key === 'applicantPhone') return personalInfo[key]
        }
        return user.phone || ''
      }

      const res = await fetch('/api/service-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          serviceType: selectedService.category,
          serviceName: selectedService.name,
          applicantName: getName(),
          applicantCnic: getCnic(),
          applicantPhone: getPhone(),
          applicantWhatsapp: personalInfo.applicantWhatsapp || '',
          description: personalInfo.description || '',
          feeAmount: selectedService.base_price,
          paymentMethod: paymentMethod,
          paymentScreenshotUploaded: !!paymentScreenshot,
          personalInfo: personalInfoPayload,
          uploadedDocuments: Object.keys(documentFiles).filter(k => documentFiles[k]).map(k => ({
            docId: k,
            fileName: documentFiles[k]!.name,
          })),
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      } else {
        setApplySuccess(true)
        toast({ title: isUrdu ? 'درخواست جمع ہو گئی!' : 'Application Submitted!', description: isUrdu ? 'آپ کی درخواست جمع ہو گئی ہے۔' : 'Aapki application submit ho gayi hai.' })
      }
    } catch {
      toast({ title: 'Error', description: isUrdu ? 'درخواست جمع نہیں ہو سکی' : 'Application submit nahi ho saki.', variant: 'destructive' })
    } finally {
      setApplying(false)
    }
  }

  const dynamicPaymentMethods = getPaymentMethods()
  const selectedPaymentInfo = dynamicPaymentMethods.find(m => m.id === paymentMethod)

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {[
        { num: 1, label: t.step1, icon: UserCircle },
        { num: 2, label: t.step2, icon: FileCheck },
        { num: 3, label: t.step3, icon: Wallet },
        { num: 4, label: t.step4, icon: Eye },
      ].map((step, idx) => {
        const StepIcon = step.icon
        const isActive = currentStep === step.num
        const isCompleted = currentStep > step.num
        return (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-[#003366] text-white shadow-md shadow-blue-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight max-w-[60px] ${isActive ? 'text-[#003366]' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < 3 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-16px] transition-colors ${currentStep > step.num ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  // Render a dynamic form field
  const renderField = (field: PersonalInfoField) => {
    const value = personalInfo[field.id] || ''
    const label = isUrdu && field.label_urdu ? field.label_urdu : field.label
    const placeholder = isUrdu && field.placeholder_urdu ? field.placeholder_urdu : field.placeholder || ''

    return (
      <div key={field.id} className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1">
          {label}
          {field.is_required && <span className="text-red-500">*</span>}
        </Label>
        {field.field_type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => handlePersonalInfoChange(field.id, e.target.value, field.field_type)}
            placeholder={placeholder}
            rows={3}
            className="border-blue-100 focus-visible:ring-blue-200"
          />
        ) : field.field_type === 'select' && field.options ? (
          <Select
            value={value}
            onValueChange={(v) => handlePersonalInfoChange(field.id, v, field.field_type)}
          >
            <SelectTrigger className="border-blue-100 focus:ring-blue-200">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {isUrdu && opt.label_urdu ? opt.label_urdu : opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={field.field_type === 'date' ? 'date' : field.field_type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handlePersonalInfoChange(field.id, e.target.value, field.field_type)}
            placeholder={placeholder}
            maxLength={field.field_type === 'cnic' ? 15 : field.validation?.max || undefined}
            min={field.field_type === 'number' && field.validation?.min ? field.validation.min : undefined}
            className="border-blue-100 focus-visible:ring-blue-200"
          />
        )}
        {field.field_type === 'cnic' && (
          <p className="text-[10px] text-muted-foreground">Format: XXXXX-XXXXXXX-X</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - UBL Premium Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003366] via-[#1a5276] to-[#2980b9] p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-300" />
            <span className="text-sm font-medium text-blue-200">{isUrdu ? 'جگنو فوٹو اسٹیٹ' : 'Jugnoo Photostate'}</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{t.title}</h2>
          <p className="text-white/70 max-w-lg">{t.subtitle}</p>
        </div>
      </div>

      {/* Search - Premium style */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2980b9]" />
        <Input
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-blue-200 focus-visible:ring-blue-300 bg-white shadow-sm"
        />
      </div>

      {/* Categories - Premium card style */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          className={selectedCategory === null ? 'bg-gradient-to-r from-[#003366] to-[#2980b9] text-white shadow-sm' : 'border-blue-200 text-[#003366] hover:bg-blue-50'}
          onClick={() => setSelectedCategory(null)}
        >
          <Sparkles className="w-4 h-4 mr-1" /> {t.allServices}
        </Button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            size="sm"
            className={selectedCategory === key ? `bg-gradient-to-r ${config.gradient} text-white shadow-sm` : 'border-blue-100 text-[#003366] hover:bg-blue-50'}
            onClick={() => setSelectedCategory(key)}
          >
            <config.icon className="w-4 h-4 mr-1" /> {isUrdu ? config.labelUrdu : config.label}
          </Button>
        ))}
      </div>

      {/* Services Grid - Premium UBL Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#2980b9]" /></div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold mb-1">{t.noService}</h3>
          <p className="text-muted-foreground">{t.tryOther}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service: ServiceData) => {
            const config = categoryConfig[service.category] || categoryConfig.other
            const Icon = config.icon
            const docs = service.required_documents as RequiredDocument[] | undefined
            const docCount = docs ? docs.filter(d => typeof d !== 'string' && d.is_mandatory).length : 0
            return (
              <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm overflow-hidden bg-white">
                <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-blue-50 text-[#003366]">{isUrdu ? config.labelUrdu : config.label}</Badge>
                  </div>
                  <CardTitle className="text-base mt-3 text-[#003366]">{service.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {service.features && service.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.features.slice(0, 3).map((f: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-50 rounded-full text-[#003366]">{f}</span>
                      ))}
                      {service.features.length > 3 && <span className="text-[10px] px-2 py-0.5 bg-blue-50 rounded-full text-[#003366]">+{service.features.length - 3}</span>}
                    </div>
                  )}
                  {/* Documents indicator */}
                  {docCount > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <FileText className="w-3 h-3 text-[#2980b9]" />
                      <span className="text-[10px] text-[#2980b9] font-medium">{docCount} {isUrdu ? 'لازمی دستاویزات' : 'mandatory docs'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-xs text-muted-foreground">{t.startingFrom}</span>
                      <p className="text-lg font-bold text-[#003366]">Rs {service.base_price?.toLocaleString()}</p>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-[#003366] to-[#2980b9] hover:from-[#001a33] hover:to-[#1a5276] text-white shadow-sm" onClick={() => openApplyDialog(service)}>
                      <Send className="w-3.5 h-3.5 mr-1" /> {t.apply}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Apply Dialog - Multi-step UBL Premium */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {applySuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#003366]">{t.successTitle}</h3>
              <p className="text-muted-foreground text-sm">{t.successMsg}</p>
              <Button className="w-full bg-gradient-to-r from-[#003366] to-[#2980b9] text-white" onClick={() => setApplyDialogOpen(false)}>
                {t.ok}
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#003366]">
                  <Star className="w-5 h-5 text-[#2980b9]" />
                  {t.applyFor} {selectedService?.name}
                </DialogTitle>
              </DialogHeader>

              <StepIndicator />

              <div className="space-y-4">
                {/* Service Fee Info - always visible */}
                <div className="p-3 bg-gradient-to-r from-[#003366]/5 to-[#2980b9]/5 rounded-lg border border-blue-200">
                  <p className="text-xs text-[#003366] font-semibold">{t.serviceFee}: Rs {selectedService?.base_price?.toLocaleString()}</p>
                  <p className="text-xs text-[#2980b9] mt-1">{t.feeNote}</p>
                </div>

                {/* ==================== STEP 1: Personal Details ==================== */}
                {currentStep === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <UserCircle className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.step1}</h4>
                    </div>
                    <div className="space-y-3 pl-0">
                      {getActiveFields().map((field) => renderField(field))}
                    </div>
                  </div>
                )}

                {/* ==================== STEP 2: Required Documents ==================== */}
                {currentStep === 2 && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.step2}</h4>
                    </div>

                    {getRequiredDocs().length === 0 ? (
                      <div className="text-center py-8">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-muted-foreground">{t.noDocsRequired}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getRequiredDocs().map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              documentFiles[doc.id]
                                ? 'border-emerald-300 bg-emerald-50/50'
                                : doc.is_mandatory
                                ? 'border-amber-200 bg-amber-50/30'
                                : 'border-gray-200 bg-gray-50/30'
                            }`}
                          >
                            {/* Document header */}
                            <div className="flex items-start gap-2 mb-2">
                              <Checkbox
                                checked={documentChecked[doc.id] || false}
                                onCheckedChange={(checked) => {
                                  if (!checked && !documentFiles[doc.id]) {
                                    setDocumentChecked(prev => ({ ...prev, [doc.id]: false }))
                                  }
                                }}
                                disabled={!documentFiles[doc.id]}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  <Badge
                                    variant="secondary"
                                    className={`text-[9px] px-1.5 py-0 ${
                                      doc.is_mandatory
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {doc.is_mandatory ? t.mandatory : t.optional}
                                  </Badge>
                                </div>
                                {doc.description && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{doc.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Upload area */}
                            {!documentFiles[doc.id] ? (
                              <button
                                type="button"
                                onClick={() => docFileRefs.current[doc.id]?.click()}
                                className="w-full border-2 border-dashed border-blue-200 rounded-lg p-3 flex items-center justify-center gap-2 hover:border-[#003366] hover:bg-blue-50/50 transition-all group"
                              >
                                <Upload className="w-4 h-4 text-blue-400 group-hover:text-[#003366] transition-colors" />
                                <span className="text-xs text-[#003366] font-medium">{t.uploadDoc}</span>
                                {!doc.is_mandatory && (
                                  <span className="text-[10px] text-muted-foreground">({t.orSkip})</span>
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 bg-white rounded-lg border border-emerald-200 p-2">
                                {documentPreviews[doc.id] ? (
                                  <img
                                    src={documentPreviews[doc.id]}
                                    alt={doc.name}
                                    className="w-10 h-10 rounded object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{documentFiles[doc.id]!.name}</p>
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] text-emerald-600">{t.uploaded}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeDocFile(doc.id)}
                                  className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <input
                              ref={(el) => { docFileRefs.current[doc.id] = el }}
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleDocFileChange(doc.id, e)}
                              className="hidden"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Official URL & Apply Process Info */}
                    {selectedService && (selectedService.official_url || selectedService.apply_process) && (
                      <div className="mt-4 space-y-2">
                        {selectedService.official_url && (
                          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-[10px] font-semibold text-[#003366] flex items-center gap-1">
                              <Shield className="w-3 h-3" /> {t.officialUrl}
                            </p>
                            <a href={selectedService.official_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#2980b9] underline break-all">
                              {selectedService.official_url}
                            </a>
                          </div>
                        )}
                        {selectedService.apply_process && (
                          <div className="p-2 bg-[#003366]/5 rounded-lg border border-blue-100">
                            <p className="text-[10px] font-semibold text-[#003366] mb-1 flex items-center gap-1">
                              <ClipboardCheck className="w-3 h-3" /> {t.applyProcess}
                            </p>
                            <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-relaxed">{selectedService.apply_process}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ==================== STEP 3: Payment ==================== */}
                {currentStep === 3 && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.step3}</h4>
                    </div>

                    <Label className="text-xs font-medium">{t.paymentMethod}</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {dynamicPaymentMethods.map((method) => {
                        const Icon = method.icon
                        const isSelected = paymentMethod === method.id
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'border-[#003366] bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#003366]">{isUrdu ? method.nameUrdu : method.name}</p>
                              <p className="text-[10px] text-muted-foreground">{isUrdu ? method.accountInfoUrdu : method.accountInfo}</p>
                              <p className="text-[10px] text-muted-foreground">{t.accountName}: {method.accountName}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#003366] shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Payment Screenshot Upload */}
                    {paymentMethod && (
                      <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <Label className="text-xs font-medium mb-2 block">{t.uploadScreenshot}</Label>
                        <p className="text-[10px] text-muted-foreground mb-2">{t.uploadNote}</p>

                        {selectedPaymentInfo && (
                          <div className="p-2 bg-white rounded-lg border border-blue-200 mb-3 text-xs">
                            <p className="font-semibold text-[#003366]">{t.accountDetails}:</p>
                            <p className="text-muted-foreground">{isUrdu ? selectedPaymentInfo.accountInfoUrdu : selectedPaymentInfo.accountInfo}</p>
                            <p className="text-muted-foreground">{t.accountName}: {selectedPaymentInfo.accountName}</p>
                            <p className="font-semibold text-[#003366] mt-1">{t.serviceFee}: Rs {selectedService?.base_price?.toLocaleString()}</p>
                          </div>
                        )}

                        {!paymentPreview ? (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-blue-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-[#003366] hover:bg-blue-50/50 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <ImagePlus className="w-5 h-5 text-[#003366]" />
                            </div>
                            <span className="text-xs text-[#003366] font-medium">{t.clickToUpload}</span>
                          </button>
                        ) : (
                          <div className="relative rounded-lg overflow-hidden border border-blue-200">
                            <img src={paymentPreview} alt="Payment screenshot" className="w-full h-40 object-cover" />
                            <button
                              type="button"
                              onClick={removePaymentScreenshot}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePaymentFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ==================== STEP 4: Review & Submit ==================== */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.reviewTitle}</h4>
                    </div>

                    {/* Personal Details Review */}
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                      <p className="text-xs font-semibold text-[#003366] mb-2 flex items-center gap-1">
                        <UserCircle className="w-3 h-3" /> {t.personalDetails}
                      </p>
                      <div className="space-y-1">
                        {getActiveFields().map((field) => {
                          const value = personalInfo[field.id]
                          if (!value) return null
                          return (
                            <div key={field.id} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{isUrdu && field.label_urdu ? field.label_urdu : field.label}</span>
                              <span className="font-medium text-[#003366]">{value}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Documents Review */}
                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {t.documents}
                      </p>
                      {getRequiredDocs().length === 0 ? (
                        <p className="text-xs text-muted-foreground">{t.noDocsRequired}</p>
                      ) : (
                        <div className="space-y-1">
                          {getRequiredDocs().map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between text-xs">
                              <span>{doc.name}</span>
                              {documentFiles[doc.id] ? (
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <CheckCircle2 className="w-3 h-3" /> {t.uploaded}
                                </span>
                              ) : (
                                <span className="text-amber-600">{t.notUploaded}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Payment Review */}
                    <div className="p-3 rounded-xl bg-[#003366]/5 border border-blue-100">
                      <p className="text-xs font-semibold text-[#003366] mb-2 flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> {t.payment}
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.paymentMethod}</span>
                          <span className="font-medium">{selectedPaymentInfo ? (isUrdu ? selectedPaymentInfo.nameUrdu : selectedPaymentInfo.name) : t.notSelected}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.serviceFee}</span>
                          <span className="font-bold text-[#003366]">Rs {selectedService?.base_price?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Screenshot</span>
                          <span>{paymentScreenshot ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{t.uploaded}</span> : t.notUploaded}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 pt-2">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={goPrev} className="flex-1 border-blue-200 text-[#003366] hover:bg-blue-50">
                      {t.previous}
                    </Button>
                  )}
                  {currentStep < totalSteps ? (
                    <Button onClick={goNext} className="flex-1 bg-gradient-to-r from-[#003366] to-[#2980b9] text-white">
                      {t.next}
                    </Button>
                  ) : (
                    <Button onClick={handleApply} disabled={applying} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                      {applying ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.submitting}</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" />{t.submitApp}</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
