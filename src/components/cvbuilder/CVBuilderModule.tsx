'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  User, Target, GraduationCap, Briefcase, Star, Globe,
  Users, Eye, ChevronLeft, ChevronRight, Wand2, Download,
  FileText, Layout, Sparkles, Languages, Plus, Trash2,
  Loader2, CheckCircle2, Palette, Zap, ClipboardList,
  Phone, CreditCard, Calendar, RefreshCw,
} from 'lucide-react'
import type { CVData, TemplateStyle, WizardStep } from './types'
import { defaultCVData, translations, WIZARD_STEPS } from './types'
import { CVTemplateRenderer } from './CVTemplates'

const stepIcons: Record<WizardStep, React.ElementType> = {
  personal: User,
  objective: Target,
  education: GraduationCap,
  experience: Briefcase,
  skills: Star,
  languages: Globe,
  references: Users,
  preview: Eye,
}

type CVBuilderTab = 'builder' | 'orders'

interface CVOrder {
  id: string
  applicant_name: string
  applicant_cnic: string | null
  applicant_phone: string | null
  service_name: string
  service_type: string
  status: string
  payment_status: string
  fee_amount: number
  personal_info: Record<string, string> | null
  created_at: string
}

export function CVBuilderModule() {
  const { toast } = useToast()
  const [lang, setLang] = useState<Language>('en')
  const [activeTab, setActiveTab] = useState<CVBuilderTab>('builder')
  const [cvOrders, setCvOrders] = useState<CVOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<CVOrder | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [cvData, setCvData] = useState<CVData>(defaultCVData)
  const [template, setTemplate] = useState<TemplateStyle>('professional')
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showPreviewPanel, setShowPreviewPanel] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)

  const t = translations[lang]
  const isUrdu = lang === 'ur'
  const currentStepKey = WIZARD_STEPS[currentStep]
  const isLastStep = currentStep === WIZARD_STEPS.length - 1

  // Fetch CV Orders
  const fetchCVOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/service-applications?serviceType=cv_builder')
      if (res.ok) {
        const data = await res.json()
        setCvOrders(data)
      }
    } catch {
      console.error('Failed to fetch CV orders')
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchCVOrders()
    }
  }, [activeTab, fetchCVOrders])

  // Load customer data from order into CV Builder
  const handleBuildFromOrder = (order: CVOrder) => {
    const info = order.personal_info || {}
    setCvData({
      ...defaultCVData,
      personalInfo: {
        ...defaultCVData.personalInfo,
        fullName: info['cv-fullName'] || order.applicant_name || '',
        email: info['cv-email'] || '',
        phone: info['cv-phone'] || order.applicant_phone || '',
        address: info['cv-address'] || '',
        city: info['cv-city'] || '',
      },
      objective: info['cv-objective'] || '',
      skills: info['cv-skills'] ? info['cv-skills'].split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      languages: info['cv-languages'] ? info['cv-languages'].split(',').map((l: string) => l.trim()).filter(Boolean) : ['Urdu', 'English'],
      education: [{ id: '1', degree: '', institution: '', year: '', grade: '' }],
      experience: [{ id: '1', company: '', position: '', duration: '', description: '' }],
      references: [{ id: '1', name: '', position: '', contact: '' }],
    })
    setSelectedOrder(order)
    setActiveTab('builder')
    setCurrentStep(0)
    toast({ title: isUrdu ? 'کسٹمر ڈیٹا لوڈ ہو گیا!' : 'Customer data loaded into CV Builder!' })
  }

  // Mark order as completed
  const handleMarkComplete = async (orderId: string) => {
    try {
      const res = await fetch('/api/service-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'completed' }),
      })
      if (res.ok) {
        toast({ title: isUrdu ? 'آرڈر مکمل ہو گیا!' : 'Order marked as completed!' })
        fetchCVOrders()
      } else {
        toast({ title: 'Error', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error updating order', variant: 'destructive' })
    }
  }

  // Render CV Orders tab
  const renderCVOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#1a5276] flex items-center justify-center shadow-lg shadow-blue-900/20">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{isUrdu ? 'سی وی آرڈرز' : 'CV Orders'}</h3>
            <p className="text-xs text-slate-400">{isUrdu ? 'کسٹمرز کی سی وی درخواستیں' : 'Customer CV service applications'}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCVOrders} disabled={ordersLoading} className="gap-1.5 border-[#2980b9]/30 text-[#2980b9]">
          <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
          {isUrdu ? 'ریفریش' : 'Refresh'}
        </Button>
      </div>

      {ordersLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#2980b9]" />
        </div>
      ) : cvOrders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-10 text-[#003366]" />
            <h3 className="text-lg font-semibold text-slate-700">{isUrdu ? 'کوئی آرڈر نہیں' : 'No CV Orders Yet'}</h3>
            <p className="text-sm text-slate-400 mt-1">{isUrdu ? 'جب کوئی کسٹمر CV سروس کے لیے اپلائے کرے گا، یہاں دکھائی دے گا' : 'When a customer applies for CV service, orders will appear here'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
          {cvOrders.map((order) => {
            const tone = order.personal_info?.['cv-tone']
            const toneLabel = tone === 'professional' ? 'Professional' : 'Normal'
            const tonePrice = tone === 'professional' ? 'Rs. 1,000' : 'Rs. 500'
            const isCompleted = order.status === 'completed'
            const isPaid = order.payment_status === 'paid'
            return (
              <Card key={order.id} className={`border-0 shadow-sm overflow-hidden ${isCompleted ? 'opacity-70' : ''}`}>
                <div className={`h-1 ${isCompleted ? 'bg-emerald-500' : isPaid ? 'bg-[#2980b9]' : 'bg-amber-400'}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{order.applicant_name || 'Unknown'}</h4>
                        <Badge className={`text-[10px] border-0 ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {isCompleted ? (isUrdu ? 'مکمل' : 'Completed') : (isUrdu ? 'زیر التواء' : 'Pending')}
                        </Badge>
                        <Badge className="text-[10px] border-0 bg-[#2980b9]/10 text-[#2980b9]">
                          {toneLabel} - {tonePrice}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500">
                        {order.applicant_cnic && (
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{order.applicant_cnic}</span>
                          </div>
                        )}
                        {order.applicant_phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{order.applicant_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {isPaid ? '✓ Paid' : '✗ Unpaid'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {!isCompleted && (
                        <Button size="sm" onClick={() => handleBuildFromOrder(order)} className="bg-gradient-to-r from-[#003366] to-[#1a5276] text-white shadow-sm gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {isUrdu ? 'سی وی بنائیں' : 'Build CV'}
                        </Button>
                      )}
                      {!isCompleted && isPaid && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkComplete(order.id)} className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isUrdu ? 'مکمل کریں' : 'Mark Complete'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  // Navigation
  const goNext = () => {
    if (!isLastStep) setCurrentStep((s) => s + 1)
  }
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }
  const goToStep = (step: number) => setCurrentStep(step)

  // AI Integration
  const callAI = async (messages: Array<{ role: string; content: string }>, systemPrompt?: string) => {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    })
    if (!res.ok) throw new Error('AI request failed')
    const data = await res.json()
    return data.content as string
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const systemPrompt = `You are a professional CV writer. Generate a complete CV in JSON format with these fields:
- objective: string (professional summary)
- skills: string[] (8-12 relevant skills)
- education: array of {degree, institution, year, grade} (2-3 entries)
- experience: array of {company, position, duration, description} (2-3 entries)
- languages: string[] (2-3 languages)
- references: array of {name, position, contact} (2 entries)

Return ONLY valid JSON, no markdown formatting, no code blocks.`

      const content = await callAI(
        [{ role: 'user', content: `Create a professional CV for: ${aiPrompt}` }],
        systemPrompt
      )

      // Parse the JSON response
      let jsonStr = content.trim()
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }

      const parsed = JSON.parse(jsonStr)
      setCvData({
        ...cvData,
        objective: parsed.objective || cvData.objective,
        skills: parsed.skills || cvData.skills,
        education: parsed.education?.map((e: Record<string, string>, i: number) => ({
          id: `ai-edu-${i}`,
          degree: e.degree || '',
          institution: e.institution || '',
          year: e.year || '',
          grade: e.grade || '',
        })) || cvData.education,
        experience: parsed.experience?.map((e: Record<string, string>, i: number) => ({
          id: `ai-exp-${i}`,
          company: e.company || '',
          position: e.position || '',
          duration: e.duration || '',
          description: e.description || '',
        })) || cvData.experience,
        languages: parsed.languages || cvData.languages,
        references: parsed.references?.map((r: Record<string, string>, i: number) => ({
          id: `ai-ref-${i}`,
          name: r.name || '',
          position: r.position || '',
          contact: r.contact || '',
        })) || cvData.references,
      })

      toast({ title: t.ai.success, description: '' })
      setAiDialogOpen(false)
      setAiPrompt('')
    } catch (err) {
      console.error('AI generation error:', err)
      toast({ title: t.ai.error, variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  const handleAIImprove = async () => {
    setAiLoading(true)
    try {
      const systemPrompt = `You are a professional CV writer. Improve and enhance the provided CV content. Return the improved content in the same JSON format:
- objective: string (enhanced professional summary)
- skills: string[] (enhanced list)
Return ONLY valid JSON, no markdown formatting, no code blocks. Keep it professional and impactful.`

      const content = await callAI(
        [
          {
            role: 'user',
            content: `Improve this CV content:
Current objective: ${cvData.objective}
Current skills: ${cvData.skills.join(', ')}
Name: ${cvData.personalInfo.fullName}
Target role: ${cvData.experience?.[0]?.position || 'Professional'}`,
          },
        ],
        systemPrompt
      )

      let jsonStr = content.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }

      const parsed = JSON.parse(jsonStr)
      setCvData({
        ...cvData,
        objective: parsed.objective || cvData.objective,
        skills: parsed.skills || cvData.skills,
      })

      toast({ title: t.ai.success, description: '' })
    } catch (err) {
      console.error('AI improve error:', err)
      toast({ title: t.ai.error, variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  // PDF Export
  const handleExportPDF = async () => {
    if (!previewRef.current) return

    try {
      toast({ title: isUrdu ? 'PDF تیار ہو رہا ہے...' : 'Preparing PDF...' })

      const html2canvas = (await import('html2canvas-pro')).default
      const { jsPDF } = await import('jspdf')

      const element = previewRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`${cvData.personalInfo.fullName || 'CV'}_Resume.pdf`)

      toast({ title: isUrdu ? 'PDF ڈاؤن لوڈ ہو گئی!' : 'PDF downloaded!' })
    } catch (err) {
      console.error('PDF export error:', err)
      // Fallback: use browser print
      const printWindow = window.open('', '_blank')
      if (printWindow && previewRef.current) {
        printWindow.document.write(`
          <html><head><title>${cvData.personalInfo.fullName || 'CV'}_Resume</title>
          <style>body{margin:0;padding:0;}@media print{body{margin:0;}}</style>
          </head><body>${previewRef.current.innerHTML}</body></html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  // Form update helpers
  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }))
  }, [])

  const addEducation = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now().toString(), degree: '', institution: '', year: '', grade: '' },
      ],
    }))
  }, [])

  const removeEducation = useCallback((id: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.length > 1 ? prev.education.filter((e) => e.id !== id) : prev.education,
    }))
  }, [])

  const updateEducation = useCallback((id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }))
  }, [])

  const addExperience = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now().toString(), company: '', position: '', duration: '', description: '' },
      ],
    }))
  }, [])

  const removeExperience = useCallback((id: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.length > 1 ? prev.experience.filter((e) => e.id !== id) : prev.experience,
    }))
  }, [])

  const updateExperience = useCallback((id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }))
  }, [])

  const addSkill = useCallback((skill: string) => {
    if (skill.trim()) {
      setCvData((prev) => ({
        ...prev,
        skills: prev.skills.includes(skill.trim()) ? prev.skills : [...prev.skills, skill.trim()],
      }))
    }
  }, [])

  const removeSkill = useCallback((skill: string) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }, [])

  const addLanguage = useCallback((language: string) => {
    if (language.trim()) {
      setCvData((prev) => ({
        ...prev,
        languages: prev.languages.includes(language.trim()) ? prev.languages : [...prev.languages, language.trim()],
      }))
    }
  }, [])

  const removeLanguage = useCallback((language: string) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.length > 1 ? prev.languages.filter((l) => l !== language) : prev.languages,
    }))
  }, [])

  const addReference = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      references: [
        ...prev.references,
        { id: Date.now().toString(), name: '', position: '', contact: '' },
      ],
    }))
  }, [])

  const removeReference = useCallback((id: string) => {
    setCvData((prev) => ({
      ...prev,
      references: prev.references.length > 1 ? prev.references.filter((r) => r.id !== id) : prev.references,
    }))
  }, [])

  const updateReference = useCallback((id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      references: prev.references.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }))
  }, [])

  // Render current step form
  const renderStepForm = () => {
    switch (currentStepKey) {
      case 'personal':
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#1a5276] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.steps.personal}</h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'اپنی ذاتی معلومات درج کریں' : 'Enter your personal information'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700">{t.form.fullName}</Label>
                <Input
                  value={cvData.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder={isUrdu ? 'اپنا پورا نام لکھیں' : 'Enter your full name'}
                  className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{t.form.email}</Label>
                <Input
                  type="email"
                  value={cvData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="example@email.com"
                  className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{t.form.phone}</Label>
                <Input
                  value={cvData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="+92 300 1234567"
                  className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{t.form.address}</Label>
                <Input
                  value={cvData.personalInfo.address}
                  onChange={(e) => updatePersonalInfo('address', e.target.value)}
                  placeholder={isUrdu ? 'اپنا پتہ لکھیں' : 'Enter your address'}
                  className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{t.form.city}</Label>
                <Input
                  value={cvData.personalInfo.city}
                  onChange={(e) => updatePersonalInfo('city', e.target.value)}
                  placeholder={isUrdu ? 'شہر کا نام' : 'City name'}
                  className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
          </div>
        )

      case 'objective':
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a5276] to-[#2980b9] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.steps.objective}</h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'اپنا کیریئر مقصد لکھیں' : 'Write your career objective'}
                </p>
              </div>
            </div>
            <Textarea
              value={cvData.objective}
              onChange={(e) => setCvData({ ...cvData, objective: e.target.value })}
              placeholder={t.form.objectivePlaceholder}
              rows={8}
              className="border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 transition-all resize-none"
              dir={isUrdu ? 'rtl' : 'ltr'}
            />
            <Button
              variant="outline"
              onClick={handleAIImprove}
              disabled={aiLoading || !cvData.objective}
              className="border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 transition-all"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              {t.actions.improveAI}
            </Button>
          </div>
        )

      case 'education':
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2980b9] to-[#3498db] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.steps.education}</h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'اپنی تعلیمی تفصیلات شامل کریں' : 'Add your educational background'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {cvData.education.map((edu, index) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                      {isUrdu ? `تعلیم ${index + 1}` : `Education ${index + 1}`}
                    </span>
                    {cvData.education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.degree}</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder={isUrdu ? 'بی اے، ایم اے وغیرہ' : 'B.A., M.A., etc.'}
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.institution}</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder={isUrdu ? 'یونیورسٹی / کالج کا نام' : 'University / College name'}
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.year}</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                        placeholder="2020"
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.grade}</Label>
                      <Input
                        value={edu.grade}
                        onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                        placeholder="A / 3.5 CGPA"
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={addEducation}
              className="w-full border-dashed border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 hover:border-[#2980b9]/50 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.form.addEducation}
            </Button>
          </div>
        )

      case 'experience':
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a5276] to-[#2980b9] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.steps.experience}</h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'اپنا کام کا تجربہ شامل کریں' : 'Add your work experience'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {cvData.experience.map((exp, index) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                      {isUrdu ? `تجربہ ${index + 1}` : `Experience ${index + 1}`}
                    </span>
                    {cvData.experience.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(exp.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.company}</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder={isUrdu ? 'کمپنی کا نام' : 'Company name'}
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.position}</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        placeholder={isUrdu ? 'عہدہ' : 'Job title'}
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.duration}</Label>
                      <Input
                        value={exp.duration}
                        onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                        placeholder={t.form.durationPlaceholder}
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.description}</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder={t.form.descriptionPlaceholder}
                        rows={3}
                        className="border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 resize-none"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={addExperience}
              className="w-full border-dashed border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 hover:border-[#2980b9]/50 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.form.addExperience}
            </Button>
          </div>
        )

      case 'skills':
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2980b9] to-[#3498db] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.steps.skills}</h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'اپنی مہارتیں شامل کریں' : 'Add your skills'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                {isUrdu ? 'مہارتیں' : 'Skills'}
              </Label>
              <Input
                placeholder={t.form.skillPlaceholder}
                className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = (e.target as HTMLInputElement).value
                    addSkill(val)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
                dir={isUrdu ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="flex flex-wrap gap-2 min-h-[48px]">
              {cvData.skills.length === 0 && (
                <p className="text-sm text-slate-400 italic">
                  {isUrdu ? 'مہارتیں شامل کرنے کے لیے ٹائپ کریں اور انٹر دبائیں' : 'Type a skill and press Enter to add'}
                </p>
              )}
              {cvData.skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => removeSkill(skill)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-[#003366] to-[#1a5276] text-white shadow-sm hover:shadow-md hover:from-[#1a5276] hover:to-[#2980b9] transition-all duration-200 cursor-pointer group"
                >
                  {skill}
                  <span className="text-white/60 group-hover:text-white transition-colors">&times;</span>
                </button>
              ))}
            </div>
            {cvData.skills.length > 0 && (
              <p className="text-xs text-slate-400">
                {isUrdu ? 'ہٹانے کے لیے کلک کریں' : 'Click to remove'}
              </p>
            )}
          </div>
        )

      case 'languages':
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a5276] to-[#2980b9] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.steps.languages}</h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'اپنی زبانیں شامل کریں' : 'Add your languages'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                {isUrdu ? 'زبانیں' : 'Languages'}
              </Label>
              <Input
                placeholder={t.form.languagePlaceholder}
                className="h-11 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = (e.target as HTMLInputElement).value
                    addLanguage(val)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
                dir={isUrdu ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {cvData.languages.map((langItem) => (
                <button
                  key={langItem}
                  onClick={() => removeLanguage(langItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-[#2980b9] to-[#3498db] text-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  {langItem}
                  {cvData.languages.length > 1 && (
                    <span className="text-white/60 group-hover:text-white transition-colors">&times;</span>
                  )}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-500">
                {isUrdu ? 'جلد شامل کریں:' : 'Quick add:'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {(isUrdu
                  ? ['اردو', 'انگریزی', 'عربی', 'پنجابی', 'سندھی', 'پشتو']
                  : ['English', 'Urdu', 'Arabic', 'Punjabi', 'Sindhi', 'Pashto', 'Hindi']
                )
                  .filter((l) => !cvData.languages.includes(l))
                  .map((langItem) => (
                    <button
                      key={langItem}
                      onClick={() => addLanguage(langItem)}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-500 hover:border-[#2980b9] hover:text-[#2980b9] hover:bg-[#2980b9]/5 transition-all duration-200"
                    >
                      + {langItem}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )

      case 'references':
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2980b9] to-[#3498db] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.steps.references}</h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'حوالہ جات شامل کریں' : 'Add your references'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {cvData.references.map((ref, index) => (
                <div
                  key={ref.id}
                  className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                      {isUrdu ? `حوالہ ${index + 1}` : `Reference ${index + 1}`}
                    </span>
                    {cvData.references.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReference(ref.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.refName}</Label>
                      <Input
                        value={ref.name}
                        onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                        placeholder={isUrdu ? 'نام' : 'Name'}
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.refPosition}</Label>
                      <Input
                        value={ref.position}
                        onChange={(e) => updateReference(ref.id, 'position', e.target.value)}
                        placeholder={isUrdu ? 'عہدہ / تعلق' : 'Position / Relation'}
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">{t.form.refContact}</Label>
                      <Input
                        value={ref.contact}
                        onChange={(e) => updateReference(ref.id, 'contact', e.target.value)}
                        placeholder={isUrdu ? 'فون / ای میل' : 'Phone / Email'}
                        className="h-10 border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={addReference}
              className="w-full border-dashed border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 hover:border-[#2980b9]/50 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.form.addReference}
            </Button>
          </div>
        )

      case 'preview':
        return (
          <div className="space-y-6">
            {/* Template Selector */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#1a5276] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.steps.preview}</h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'ٹیمپلیٹ منتخب کریں اور PDF ایکسپورٹ کریں' : 'Choose template & export PDF'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {(['professional', 'modern', 'creative'] as TemplateStyle[]).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => setTemplate(tmpl)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                    template === tmpl
                      ? 'border-[#2980b9] bg-[#2980b9]/10 text-[#003366] shadow-md shadow-blue-200/50'
                      : 'border-slate-200 text-slate-500 hover:border-[#2980b9]/50 hover:bg-[#2980b9]/5'
                  }`}
                >
                  {template === tmpl && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-[#2980b9]" />}
                  {t.templates[tmpl]}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-[#003366] to-[#1a5276] hover:from-[#1a5276] hover:to-[#2980b9] text-white shadow-lg shadow-blue-900/20 transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                {t.actions.exportPDF}
              </Button>
              <Button
                variant="outline"
                onClick={() => setAiDialogOpen(true)}
                className="border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t.actions.generateAI}
              </Button>
              <Button
                variant="outline"
                onClick={handleAIImprove}
                disabled={aiLoading}
                className="border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 transition-all"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {t.actions.improveAI}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#1a5276] flex items-center justify-center shadow-lg shadow-blue-900/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#003366] to-[#2980b9] bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xs text-slate-400">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Tab Switcher */}
              <div className="flex rounded-lg overflow-hidden border border-slate-200">
                <button
                  onClick={() => setActiveTab('builder')}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'builder' ? 'bg-gradient-to-r from-[#003366] to-[#1a5276] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {isUrdu ? 'سی وی بلڈر' : 'CV Builder'}
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'orders' ? 'bg-gradient-to-r from-[#003366] to-[#1a5276] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  {isUrdu ? 'سی وی آرڈرز' : 'CV Orders'}
                </button>
              </div>
              {/* Language Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
                className="border-[#2980b9]/30 text-[#2980b9] hover:bg-[#2980b9]/5 transition-all gap-1.5"
              >
                <Languages className="w-3.5 h-3.5" />
                {t.langSwitch}
              </Button>
              {/* AI Generate Button */}
              {activeTab === 'builder' && (
                <Button
                  onClick={() => setAiDialogOpen(true)}
                  className="bg-gradient-to-r from-[#2980b9] to-[#3498db] hover:from-[#1a5276] hover:to-[#2980b9] text-white shadow-md shadow-blue-200/50 transition-all"
                  size="sm"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  {t.actions.generateAI}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step Progress Bar - only for builder tab */}
        {activeTab === 'builder' && (
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {WIZARD_STEPS.map((step, index) => {
                const Icon = stepIcons[step]
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                return (
                  <button
                    key={step}
                    onClick={() => goToStep(index)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#003366] to-[#1a5276] text-white shadow-md shadow-blue-900/20 scale-105'
                        : isCompleted
                        ? 'bg-[#2980b9]/10 text-[#2980b9]'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{t.steps[step as keyof typeof t.steps]}</span>
                    <span className="sm:hidden">{index + 1}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* CV Orders Tab */}
      {activeTab === 'orders' && (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          {renderCVOrders()}
        </div>
      )}

      {/* Main Content - only for builder tab */}
      {activeTab === 'builder' && (
      <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        {/* Form Panel */}
        <div className="flex-1 min-w-0">
          <Card className="border-0 shadow-xl shadow-blue-900/5 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              {renderStepForm()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 gap-4">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStep === 0}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t.actions.previous}
            </Button>
            <div className="text-xs text-slate-400">
              {currentStep + 1} / {WIZARD_STEPS.length}
            </div>
            <Button
              onClick={goNext}
              disabled={isLastStep}
              className="bg-gradient-to-r from-[#003366] to-[#1a5276] hover:from-[#1a5276] hover:to-[#2980b9] text-white shadow-lg shadow-blue-900/20 transition-all"
            >
              {t.actions.next}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:w-[480px] xl:w-[520px] shrink-0">
          <div className="sticky top-[140px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#2980b9]" />
                {isUrdu ? 'زندہ پیش منظر' : 'Live Preview'}
              </h3>
              <Select value={template} onValueChange={(v) => setTemplate(v as TemplateStyle)}>
                <SelectTrigger className="w-[140px] h-8 text-xs border-slate-200">
                  <Layout className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">{t.templates.professional}</SelectItem>
                  <SelectItem value="modern">{t.templates.modern}</SelectItem>
                  <SelectItem value="creative">{t.templates.creative}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className="rounded-xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200/60 bg-white"
              style={{ height: '730px' }}
            >
              <div
                ref={previewRef}
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  transform: 'scale(0.6)',
                  transformOrigin: 'top left',
                }}
              >
                <CVTemplateRenderer
                  data={cvData}
                  template={template}
                  lang={lang}
                  labels={t.preview}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* AI Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2980b9]" />
              {t.ai.promptTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-500">{t.ai.promptDescription}</p>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={t.ai.promptPlaceholder}
              rows={5}
              className="border-slate-200 focus:border-[#2980b9] focus:ring-[#2980b9]/20 resize-none"
              dir={isUrdu ? 'rtl' : 'ltr'}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setAiDialogOpen(false)}
                className="border-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="bg-gradient-to-r from-[#2980b9] to-[#3498db] hover:from-[#1a5276] hover:to-[#2980b9] text-white shadow-md"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.ai.generating}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    {t.ai.generate}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
