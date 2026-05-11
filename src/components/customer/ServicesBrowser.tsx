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
  Layers, Type, Receipt, Stamp, Clock, Info
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

// Extended service type - includes admin-managed apply flow fields
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
  // Admin-managed apply flow fields
  eligibility?: string
  deadlines?: { start_date?: string; end_date?: string; is_rolling?: boolean; note?: string } | Record<string, never>
  loan_tiers?: { tier: number; name: string; amount_min: number; amount_max: number; markup_rate: string; duration: string; collateral: boolean }[]
  important_details?: string[]
  processing_time?: string
  special_notes?: string
  fee_info?: string
  apply_steps?: string[]
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
  cv_builder: { label: 'CV Builder', labelUrdu: 'سی وی بلڈر', icon: Briefcase, color: 'text-orange-600', gradient: 'from-orange-500 to-amber-600' },
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

  // New state for loan & eligibility
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [loanAmount, setLoanAmount] = useState<string>('')
  const [eligibilityResult, setEligibilityResult] = useState<'eligible' | 'possibly-ineligible' | null>(null)
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false)
  const [eligibilityReason, setEligibilityReason] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const docFileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Dynamic total steps based on service category
  const isLoanService = selectedService?.category === 'loan'
  const totalSteps = isLoanService ? 9 : 7

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
    stepEligibility: 'اہلیت',
    stepDeadlines: 'آخری تاریخ',
    stepLoanTiers: 'قرضے کی اقسام',
    stepLoanAmount: 'قرض کی رقم',
    stepImportant: 'اہم تفصیلات',
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
    noEligibility: 'کوئی خاص اہلیت نہیں / No special eligibility requirements',
    noDeadlines: 'سال بھر دستیاب / Available year-round',
    openYearRound: 'سال بھر کھلا / Open Year-Round',
    selectTier: 'براہ کرم ایک ٹیئر منتخب کریں / Please select a loan tier',
    enterLoanAmount: 'براہ کرم قرض کی رقم درج کریں / Please enter loan amount',
    loanAmountRange: 'قرض کی حد / Loan amount range',
    screenshotRequired: 'پیمنٹ اسکرین شاٹ لازمی ہے / Payment screenshot is mandatory',
    eligibleGreen: 'بدھائی! آپ اہل ہیں / Congratulations! You appear eligible',
    ineligibleRed: 'آپ اہل نہیں ہیں / You may not be eligible',
    autoCheckNote: 'یہ آٹو چیک ہے۔ حتمی فیصلہ ایڈمن کرے گا۔ / This is an auto-check. Final decision by admin.',
    goBack: 'واپس جائیں / Go Back',
    proceedAnyway: 'پھر بھی آگے بڑھیں / Proceed Anyway',
    processingTime: 'پروسیسنگ ٹائم / Processing Time',
    feeInfo: 'فیس کی معلومات / Fee Info',
    specialNotes: 'خصوصی نوٹ / Special Notes',
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
    stepEligibility: 'Eligibility',
    stepDeadlines: 'Deadlines',
    stepLoanTiers: 'Loan Tiers',
    stepLoanAmount: 'Loan Amount',
    stepImportant: 'Important Details',
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
    noEligibility: 'Koi khaas eligibility nahi / No special eligibility requirements',
    noDeadlines: 'Saal bhar available / Available year-round',
    openYearRound: 'Open Year-Round',
    selectTier: 'Please select a loan tier / Tier select karein',
    enterLoanAmount: 'Please enter loan amount / Loan amount enter karein',
    loanAmountRange: 'Loan amount range',
    screenshotRequired: 'Payment screenshot is mandatory / Screenshot lazmi hai',
    eligibleGreen: 'Badhai! Aap eligible hain / Congratulations! You appear eligible',
    ineligibleRed: 'Aap eligible nahi hain / You may not be eligible',
    autoCheckNote: 'Yeh auto-check hai. Final decision admin karega. / This is an auto-check. Final decision by admin.',
    goBack: 'Wapis jayein / Go Back',
    proceedAnyway: 'Phir bhi aage barhein / Proceed Anyway',
    processingTime: 'Processing Time',
    feeInfo: 'Fee Info',
    specialNotes: 'Special Notes',
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

  // Get govt service data for the currently selected service (fallback)
  const getGovtService = () => {
    return selectedService ? govtServicesMap.get(selectedService.id) : null
  }

  // Get eligibility text: API data first, then fallback to static govt-services-data
  const getEligibility = (): string => {
    // 1. Check API service data first (admin-managed)
    if (selectedService?.eligibility && selectedService.eligibility.trim()) {
      return selectedService.eligibility
    }
    // 2. Fallback to GOVT_SERVICES static data
    const govtService = getGovtService()
    if (govtService?.eligibility && govtService.eligibility.trim()) {
      return govtService.eligibility
    }
    return ''
  }

  // Get deadlines: API data first, then fallback to static
  const getDeadlines = (): { start_date: string; end_date: string; is_rolling: boolean; note: string } | null => {
    // 1. Check API service data first (admin-managed)
    if (selectedService?.deadlines && Object.keys(selectedService.deadlines).length > 0) {
      const d = selectedService.deadlines as { start_date?: string; end_date?: string; is_rolling?: boolean; note?: string }
      if (d.start_date || d.end_date || d.is_rolling !== undefined || d.note) {
        return {
          start_date: d.start_date || '',
          end_date: d.end_date || '',
          is_rolling: d.is_rolling !== undefined ? d.is_rolling : true,
          note: d.note || '',
        }
      }
    }
    // 2. Fallback to GOVT_SERVICES static data
    const govtService = getGovtService()
    if (govtService?.deadlines) {
      return {
        start_date: govtService.deadlines.start_date || '',
        end_date: govtService.deadlines.end_date || '',
        is_rolling: govtService.deadlines.is_rolling,
        note: govtService.deadlines.note || '',
      }
    }
    return null
  }

  // Get loan tiers: API data first, then fallback to static
  const getLoanTiers = () => {
    // 1. Check API service data first (admin-managed)
    if (selectedService?.loan_tiers && selectedService.loan_tiers.length > 0) {
      return selectedService.loan_tiers
    }
    // 2. Fallback to GOVT_SERVICES static data
    const govtService = getGovtService()
    if (govtService?.loan_tiers && govtService.loan_tiers.length > 0) {
      return govtService.loan_tiers
    }
    return null
  }

  // Get important details: API data first, then fallback to static
  const getImportantDetails = (): string[] => {
    // 1. Check API service data first (admin-managed)
    if (selectedService?.important_details && selectedService.important_details.length > 0) {
      return selectedService.important_details
    }
    // 2. Build from GOVT_SERVICES static data fields
    const govtService = getGovtService()
    if (govtService) {
      const details: string[] = []
      if (govtService.processing_time) details.push(`Processing Time: ${govtService.processing_time}`)
      if (govtService.fee_info) details.push(`Fee: ${govtService.fee_info}`)
      if (govtService.special_notes) details.push(govtService.special_notes)
      if (govtService.cnic_format_note) details.push(`CNIC: ${govtService.cnic_format_note}`)
      return details
    }
    return []
  }

  // Get processing time: API data first, then fallback
  const getProcessingTime = (): string => {
    if (selectedService?.processing_time && selectedService.processing_time.trim()) return selectedService.processing_time
    const govtService = getGovtService()
    return govtService?.processing_time || ''
  }

  // Get fee info: API data first, then fallback
  const getFeeInfo = (): string => {
    if (selectedService?.fee_info && selectedService.fee_info.trim()) return selectedService.fee_info
    const govtService = getGovtService()
    return govtService?.fee_info || ''
  }

  // Get special notes: API data first, then fallback
  const getSpecialNotes = (): string => {
    if (selectedService?.special_notes && selectedService.special_notes.trim()) return selectedService.special_notes
    const govtService = getGovtService()
    return govtService?.special_notes || ''
  }

  // Auto-eligibility check
  const runEligibilityCheck = () => {
    // Use the merged eligibility (API data > static data)
    const eligibility = getEligibility().toLowerCase()
    if (!eligibility) { setEligibilityResult(null); return }

    const govtService = getGovtService()
    let isEligible = true
    let reason = ''

    // Check income thresholds
    const incomeFields = Object.keys(personalInfo).filter(k =>
      k.includes('income') || k.includes('pyl-p10') || k.includes('ek-p9') ||
      k.includes('bisp-p11') || k.includes('er-p7')
    )
    for (const key of incomeFields) {
      const income = parseInt(personalInfo[key])
      if (!isNaN(income)) {
        if ((eligibility.includes('25,000') || eligibility.includes('25000')) && income > 25000) {
          isEligible = false
          reason = 'Monthly income Rs 25,000 se zyada hai / Monthly income exceeds Rs 25,000 limit'
        }
        if ((eligibility.includes('50,000') || eligibility.includes('50000')) && income > 50000) {
          isEligible = false
          reason = 'Monthly income Rs 50,000 se zyada hai / Monthly income exceeds Rs 50,000 limit'
        }
      }
    }

    // Check age for loans
    if (isLoanService) {
      const dobField = personalInfo['pkj-p4'] || personalInfo['pyl-p4'] || personalInfo['bisp-p5'] || personalInfo['ek-p3'] || personalInfo['er-p3']
      if (dobField) {
        const age = Math.floor((Date.now() - new Date(dobField).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        if (age < 18 || age > 45) {
          isEligible = false
          reason = `Umar ${age} saal hai. Loan ke liye 18-45 saal chahiye / Age ${age} years. Loan requires 18-45 years`
        }
      }
    }

    // Check government employee restriction
    const govtEmpFields = Object.keys(personalInfo).filter(k =>
      personalInfo[k]?.toLowerCase().includes('government') ||
      personalInfo[k]?.toLowerCase().includes('govt')
    )
    if (govtEmpFields.length > 0 && eligibility.includes('government employee')) {
      isEligible = false
      reason = 'Government employees eligible nahi hain / Government employees are not eligible'
    }

    setEligibilityResult(isEligible ? 'eligible' : 'possibly-ineligible')
    if (!isEligible) {
      setEligibilityReason(reason)
      setShowEligibilityDialog(true)
    }
  }

  // Validate current step (step numbers: 1=Eligibility, 2=Deadlines, 3=LoanTiers, 4=LoanAmount, 5=Important, 6=Personal, 7=Documents, 8=Payment, 9=Review)
  const validateStep = (step: number): boolean => {
    if (step === 3) {
      // Loan Tiers: must have selectedTier
      return selectedTier !== null
    }
    if (step === 4) {
      // Loan Amount: must have valid amount within range
      if (!loanAmount || parseInt(loanAmount) <= 0) return false
      const loanTiers = getLoanTiers()
      if (loanTiers && selectedTier !== null) {
        const tier = loanTiers[selectedTier]
        if (tier) {
          const amount = parseInt(loanAmount)
          if (amount < tier.amount_min || amount > tier.amount_max) return false
        }
      }
      return true
    }
    if (step === 6) {
      const fields = getActiveFields()
      for (const field of fields) {
        if (field.is_required && !personalInfo[field.id]?.trim()) {
          return false
        }
      }
      return true
    }
    if (step === 7) {
      const docs = getRequiredDocs()
      for (const doc of docs) {
        if (doc.is_mandatory && !documentFiles[doc.id]) {
          return false
        }
      }
      return true
    }
    if (step === 8) {
      // Payment: must have payment method AND screenshot
      if (!paymentMethod) return false
      if (!paymentScreenshot) return false
      return true
    }
    return true
  }

  const goNext = () => {
    // Validation for each step
    if (currentStep === 3 && !validateStep(3)) {
      toast({ title: t.selectTier, variant: 'destructive' })
      return
    }
    if (currentStep === 4 && !validateStep(4)) {
      toast({ title: t.enterLoanAmount, variant: 'destructive' })
      return
    }
    if (currentStep === 6 && !validateStep(6)) {
      toast({ title: t.fillAllRequired, variant: 'destructive' })
      return
    }
    if (currentStep === 7 && !validateStep(7)) {
      toast({ title: t.uploadMandatory, variant: 'destructive' })
      return
    }
    if (currentStep === 8 && !validateStep(8)) {
      if (!paymentMethod) {
        toast({ title: t.selectPayMethod, variant: 'destructive' })
      } else if (!paymentScreenshot) {
        toast({ title: t.screenshotRequired, variant: 'destructive' })
      }
      return
    }

    // After personal details (step 6), run auto-eligibility check
    if (currentStep === 6) {
      runEligibilityCheck()
    }

    // Compute next step, skipping loan steps for non-loan services
    let nextStep = currentStep + 1
    if (!isLoanService && (nextStep === 3 || nextStep === 4)) {
      nextStep = 5
    }

    setCurrentStep(nextStep)
  }

  const goPrev = () => {
    let prevStep = currentStep - 1
    if (!isLoanService && (prevStep === 4 || prevStep === 3)) {
      prevStep = 2
    }
    setCurrentStep(prevStep)
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
    setSelectedTier(null)
    setLoanAmount('')
    setEligibilityResult(null)
    setShowEligibilityDialog(false)
    setEligibilityReason('')

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
    if (!paymentScreenshot) {
      toast({ title: t.screenshotRequired, variant: 'destructive' })
      return
    }
    setApplying(true)
    try {
      const fields = getActiveFields()
      const personalInfoPayload: Record<string, string> = {}
      for (const field of fields) {
        personalInfoPayload[field.id] = personalInfo[field.id] || ''
      }

      // Include loan amount in personalInfo if loan service
      if (isLoanService && loanAmount) {
        personalInfoPayload['loanAmount'] = loanAmount
      }
      if (isLoanService && selectedTier !== null) {
        personalInfoPayload['loanTier'] = String(selectedTier + 1)
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
          feeAmount: selectedService.category === 'cv_builder' && personalInfo['cv-tone']?.includes('Professional') ? 1000 : selectedService.base_price,
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

  // Build dynamic steps for the step indicator
  const getStepList = () => {
    const steps = [
      { num: 1, label: t.stepEligibility, icon: Shield },
      { num: 2, label: t.stepDeadlines, icon: Clock },
    ]
    if (isLoanService) {
      steps.push({ num: 3, label: t.stepLoanTiers, icon: Banknote })
      steps.push({ num: 4, label: t.stepLoanAmount, icon: Wallet })
    }
    steps.push({ num: 5, label: t.stepImportant, icon: Info })
    steps.push({ num: 6, label: t.step1, icon: UserCircle })
    steps.push({ num: 7, label: t.step2, icon: FileCheck })
    steps.push({ num: 8, label: t.step3, icon: Wallet })
    steps.push({ num: 9, label: t.step4, icon: Eye })
    return steps
  }

  // Step indicator component
  const StepIndicator = () => {
    const steps = getStepList()
    return (
      <div className="flex items-center justify-between mb-6 overflow-x-auto">
        {steps.map((step, idx) => {
          const StepIcon = step.icon
          const isActive = currentStep === step.num
          const isCompleted = currentStep > step.num
          return (
            <div key={step.num} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-[#003366] text-white shadow-md shadow-blue-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <StepIcon className="w-3 h-3" />}
                </div>
                <span className={`text-[8px] font-medium text-center leading-tight max-w-[48px] ${isActive ? 'text-[#003366]' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5 mt-[-12px] transition-colors ${currentStep > step.num ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

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

  // Get the govt service data for rendering new steps
  const govtServiceData = getGovtService()

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
                  <p className="text-xs text-[#003366] font-semibold">{t.serviceFee}: Rs {selectedService?.category === 'cv_builder' && personalInfo['cv-tone']?.includes('Professional') ? 1000 : selectedService?.base_price?.toLocaleString()}</p>
                  {selectedService?.category === 'cv_builder' && (
                    <p className="text-xs text-[#F5A623] mt-1 font-medium">Normal: Rs 500 | Professional: Rs 1,000</p>
                  )}
                  <p className="text-xs text-[#2980b9] mt-1">{t.feeNote}</p>
                </div>

                {/* ==================== STEP 1: Eligibility Criteria ==================== */}
                {currentStep === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.stepEligibility}</h4>
                    </div>

                    {(() => {
                      const eligibility = getEligibility()
                      return eligibility ? (
                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                          <div className="space-y-2">
                            {eligibility.split('.').filter(s => s.trim()).map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-[#003366] leading-relaxed">{item.trim()}.</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Shield className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm text-muted-foreground">{t.noEligibility}</p>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* ==================== STEP 2: Deadlines ==================== */}
                {currentStep === 2 && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.stepDeadlines}</h4>
                    </div>

                    {(() => {
                      const deadlines = getDeadlines()
                      return deadlines ? (
                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
                          {deadlines.is_rolling ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs px-3 py-1">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> {t.openYearRound}
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs px-3 py-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {deadlines.start_date} — {deadlines.end_date}
                              </Badge>
                            </div>
                          )}
                          {deadlines.note && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{deadlines.note}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm text-muted-foreground">{t.noDeadlines}</p>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* ==================== STEP 3: Loan Tiers (Loan services only) ==================== */}
                {currentStep === 3 && isLoanService && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.stepLoanTiers}</h4>
                    </div>

                    {(() => {
                      const loanTiers = getLoanTiers()
                      return loanTiers && loanTiers.length > 0 ? (
                      <div className="space-y-3">
                        {loanTiers.map((tier, idx) => {
                          const isSelected = selectedTier === idx
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedTier(idx)
                                setLoanAmount('')
                              }}
                              className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-[#003366] bg-blue-50 shadow-sm'
                                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-[#003366]">{tier.name}</p>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#003366]" />}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Amount:</span>
                                  <p className="font-medium text-[#003366]">Rs {tier.amount_min.toLocaleString()} - {tier.amount_max.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Markup:</span>
                                  <p className="font-medium text-emerald-600">{tier.markup_rate}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Duration:</span>
                                  <p className="font-medium text-[#003366]">{tier.duration}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Collateral:</span>
                                  <p className="font-medium text-[#003366]">{tier.collateral ? 'Required' : 'Not Required'}</p>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Banknote className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-muted-foreground">No loan tiers available</p>
                      </div>
                    )
                    })()}
                  </div>
                )}

                {/* ==================== STEP 4: Loan Amount (Loan services only) ==================== */}
                {currentStep === 4 && isLoanService && (() => {
                  const loanTiers = getLoanTiers()
                  const currentTier = selectedTier !== null ? loanTiers?.[selectedTier] : null
                  return (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.stepLoanAmount}</h4>
                    </div>

                    {currentTier ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                          <p className="text-xs text-muted-foreground">{t.loanAmountRange}:</p>
                          <p className="text-sm font-bold text-[#003366]">Rs {currentTier.amount_min.toLocaleString()} — Rs {currentTier.amount_max.toLocaleString()}</p>
                          <p className="text-xs text-emerald-600 mt-1">Markup: {currentTier.markup_rate} | Duration: {currentTier.duration}</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            {t.stepLoanAmount} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            min={currentTier.amount_min}
                            max={currentTier.amount_max}
                            placeholder={`Rs ${currentTier.amount_min.toLocaleString()} - ${currentTier.amount_max.toLocaleString()}`}
                            className="border-blue-100 focus-visible:ring-blue-200"
                          />
                          {loanAmount && (parseInt(loanAmount) < currentTier.amount_min || parseInt(loanAmount) > currentTier.amount_max) && (
                            <p className="text-[10px] text-red-500">
                              Amount must be between Rs {currentTier.amount_min.toLocaleString()} and Rs {currentTier.amount_max.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-xs text-amber-700">Please go back and select a loan tier first.</p>
                      </div>
                    )}
                  </div>
                  )
                })()}

                {/* ==================== STEP 5: Important Details ==================== */}
                {currentStep === 5 && (() => {
                  const processingTime = getProcessingTime()
                  const feeInfo = getFeeInfo()
                  const specialNotes = getSpecialNotes()
                  const importantDetails = getImportantDetails()
                  const officialUrl = selectedService?.official_url || govtServiceData?.official_url || ''
                  const applyProcess = selectedService?.apply_process || govtServiceData?.apply_process || ''
                  const hasAnyData = processingTime || feeInfo || specialNotes || importantDetails.length > 0 || officialUrl || applyProcess

                  return (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-semibold text-[#003366]">{t.stepImportant}</h4>
                      </div>

                      <div className="space-y-3">
                        {/* Admin-managed Important Details */}
                        {importantDetails.length > 0 && importantDetails.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-cyan-50/50 border border-cyan-100">
                            <div className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{idx + 1}</div>
                            <p className="text-xs text-[#003366] leading-relaxed">{detail}</p>
                          </div>
                        ))}

                        {/* Processing Time */}
                        {processingTime && (
                          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                            <p className="text-xs font-semibold text-[#003366] mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {t.processingTime}
                            </p>
                            <p className="text-xs text-muted-foreground">{processingTime}</p>
                          </div>
                        )}

                        {/* Fee Info */}
                        {feeInfo && (
                          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                            <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                              <Wallet className="w-3 h-3" /> {t.feeInfo}
                            </p>
                            <p className="text-xs text-muted-foreground">{feeInfo}</p>
                          </div>
                        )}

                        {/* Special Notes */}
                        {specialNotes && (
                          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                            <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {t.specialNotes}
                            </p>
                            <p className="text-xs text-muted-foreground">{specialNotes}</p>
                          </div>
                        )}

                        {/* Official URL */}
                        {officialUrl && (
                          <div className="p-3 rounded-xl bg-[#003366]/5 border border-blue-100">
                            <p className="text-xs font-semibold text-[#003366] mb-1 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> {t.officialUrl}
                            </p>
                            <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2980b9] underline break-all">
                              {officialUrl}
                            </a>
                          </div>
                        )}

                        {/* Apply Process */}
                        {applyProcess && (
                          <div className="p-3 rounded-xl bg-[#003366]/5 border border-blue-100">
                            <p className="text-xs font-semibold text-[#003366] mb-1 flex items-center gap-1">
                              <ClipboardCheck className="w-3 h-3" /> {t.applyProcess}
                            </p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{applyProcess}</p>
                          </div>
                        )}

                        {/* Fallback if no data at all */}
                        {!hasAnyData && (
                          <div className="text-center py-6">
                            <Info className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm text-muted-foreground">Koi khaas details nahi / No special details available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* ==================== STEP 6: Personal Details ==================== */}
                {currentStep === 6 && (
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

                {/* ==================== STEP 7: Required Documents ==================== */}
                {currentStep === 7 && (
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

                    {/* Official URL & Apply Process Info for documents step */}
                    {selectedService && !govtServiceData && (selectedService.official_url || selectedService.apply_process) && (
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

                {/* ==================== STEP 8: Payment ==================== */}
                {currentStep === 8 && (
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

                    {/* Payment Screenshot Upload - MANDATORY */}
                    {paymentMethod && (
                      <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <Label className="text-xs font-medium mb-2 block">
                          {t.uploadScreenshot} <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-[10px] text-muted-foreground mb-2">{t.uploadNote}</p>

                        {selectedPaymentInfo && (
                          <div className="p-2 bg-white rounded-lg border border-blue-200 mb-3 text-xs">
                            <p className="font-semibold text-[#003366]">{t.accountDetails}:</p>
                            <p className="text-muted-foreground">{isUrdu ? selectedPaymentInfo.accountInfoUrdu : selectedPaymentInfo.accountInfo}</p>
                            <p className="text-muted-foreground">{t.accountName}: {selectedPaymentInfo.accountName}</p>
                            <p className="font-semibold text-[#003366] mt-1">{t.serviceFee}: Rs {selectedService?.category === 'cv_builder' && personalInfo['cv-tone']?.includes('Professional') ? 1000 : selectedService?.base_price?.toLocaleString()}</p>
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
                            <span className="text-[10px] text-red-500 font-medium">* {t.screenshotRequired}</span>
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

                {/* ==================== STEP 9: Review & Submit ==================== */}
                {currentStep === 9 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#003366]">{t.reviewTitle}</h4>
                    </div>

                    {/* Eligibility Check Result */}
                    {eligibilityResult && (
                      <div className={`p-3 rounded-xl border-2 ${
                        eligibilityResult === 'eligible'
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-red-300 bg-red-50/50'
                      }`}>
                        <div className="flex items-center gap-2">
                          {eligibilityResult === 'eligible' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <p className={`text-xs font-semibold ${
                            eligibilityResult === 'eligible' ? 'text-emerald-700' : 'text-red-700'
                          }`}>
                            {eligibilityResult === 'eligible' ? t.eligibleGreen : t.ineligibleRed}
                          </p>
                        </div>
                        {eligibilityResult === 'possibly-ineligible' && eligibilityReason && (
                          <p className="text-[10px] text-red-600 mt-1">{eligibilityReason}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">{t.autoCheckNote}</p>
                      </div>
                    )}

                    {/* Loan Tier & Amount (if loan service) */}
                    {isLoanService && selectedTier !== null && govtServiceData?.loan_tiers?.[selectedTier] && (
                      <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                          <Banknote className="w-3 h-3" /> {t.stepLoanTiers}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tier</span>
                            <span className="font-medium text-purple-700">{govtServiceData.loan_tiers[selectedTier].name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t.stepLoanAmount}</span>
                            <span className="font-bold text-purple-700">Rs {parseInt(loanAmount || '0').toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Markup</span>
                            <span className="font-medium text-emerald-600">{govtServiceData.loan_tiers[selectedTier].markup_rate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">{govtServiceData.loan_tiers[selectedTier].duration}</span>
                          </div>
                        </div>
                      </div>
                    )}

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

                {/* Eligibility Dialog Banner */}
                {showEligibilityDialog && (
                  <div className="p-4 rounded-xl border-2 border-red-300 bg-red-50 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <h4 className="font-bold text-red-700 text-sm">{t.ineligibleRed}</h4>
                    </div>
                    <p className="text-xs text-red-600">{eligibilityReason}</p>
                    <p className="text-[10px] text-muted-foreground">{t.autoCheckNote}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowEligibilityDialog(false)} className="text-red-600 border-red-300">
                        {t.goBack}
                      </Button>
                      <Button size="sm" onClick={() => setShowEligibilityDialog(false)} className="bg-red-600 text-white hover:bg-red-700">
                        {t.proceedAnyway}
                      </Button>
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
                  {currentStep < 9 ? (
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
