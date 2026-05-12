'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Send, MessageCircle, Phone, Bot, User, Sparkles,
  Headphones, ArrowRight, Zap, Mic
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { VoiceInputButton, VoiceLanguageToggle } from '@/components/ui/VoiceInputButton'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isAi?: boolean
}

interface ChatHistoryItem {
  role: 'user' | 'assistant'
  content: string
}

export function SupportChat() {
  const { user } = useAuth()
  const { isUrdu } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Voice input state (managed via callbacks from VoiceInputButton)
  const [voiceLanguage, setVoiceLanguage] = useState(isUrdu ? 'ur-PK' : 'en-PK')
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [interimVoiceText, setInterimVoiceText] = useState('')

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'

  // Voice input callbacks
  const handleVoiceTranscript = useCallback((text: string) => {
    setInput(prev => prev + text)
    setInterimVoiceText('')
  }, [])

  const handleVoiceInterimTranscript = useCallback((text: string) => {
    setInterimVoiceText(text)
  }, [])

  const handleVoiceListeningChange = useCallback((listening: boolean) => {
    setIsVoiceListening(listening)
    if (!listening) {
      setInterimVoiceText('')
    }
  }, [])

  const handleVoiceSupportedChange = useCallback((supported: boolean) => {
    setIsVoiceSupported(supported)
  }, [])

  const handleVoiceLanguageChange = useCallback((lang: string) => {
    setVoiceLanguage(lang)
  }, [])

  const handleVoiceError = useCallback((error: string) => {
    console.warn('Voice input error:', error)
  }, [])

  // Fetch WhatsApp number from settings
  const { data: settingsData } = useQuery({
    queryKey: ['support-settings'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } catch {
        return null
      }
    },
    staleTime: 60000,
    retry: false,
  })

  const whatsappNumber = settingsData?.business?.whatsapp || '923001234567'
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Jugnoo Support, I need help with...')}`

  // Auto greeting
  useEffect(() => {
    const greeting: ChatMessage = {
      id: 'greeting',
      text: isUrdu
        ? `السلام علیکم ${userName}! میں Jugnoo کا AI اسسٹنٹ ہوں۔ آپ مجھ سے کسی بھی سوال کے بارے میں بات کر سکتے ہیں۔ مثال کے طور پر پوچھیں: سروسز کیسے استعمال کریں؟ پیمنٹ کیسے کریں؟ درخواست کا اسٹیٹس کیسے دیکھیں؟`
        : `Hello ${userName}! I'm Jugnoo's AI assistant. You can ask me anything! For example: How to use services? How to make payment? How to track my application? What documents are needed?`,
      sender: 'bot',
      timestamp: new Date(),
      isAi: true,
    }
    setMessages([greeting])
  }, [isUrdu, userName])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // ─── Rule-based responses (FAST, used as first-pass or fallback) ───
  const getRuleBasedResponse = useCallback((userMessage: string): string | null => {
    const lower = userMessage.toLowerCase().trim()

    // Greetings
    if (lower.match(/^(hello|hi|hey|salam|سلام|السلام|ہیلو|ہائے|assalam|اسلام)/)) {
      return isUrdu
        ? `وعلیکم السلام ${userName}! آپ کا شکریہ کہ آپ نے رابطہ کیا۔ بتائیں میں آپ کی کیا مدد کر سکتا ہوں؟ آپ مجھ سے سروسز، پیمنٹ، درخواست کا اسٹیٹس، دستاویزات، یا کسی بھی سوال کے بارے میں بات کر سکتے ہیں۔`
        : `Hello ${userName}! Thank you for reaching out. How can I assist you today? You can ask me about services, payments, application status, documents, or anything else.`
    }

    // Services / How to apply
    if (lower.match(/service|سروس|apply|درخواست|کیسے کریں|how to apply|apply kaise|service kaise/)) {
      return isUrdu
        ? `سروسز استعمال کرنے کے لیے:\n\n1. ہوم اسکرین پر "سروسز" ٹیب دبائیں\n2. جو سروس چاہیں وہ منتخب کریں\n3. اہلیت چیک مکمل کریں\n4. قرضے کی سروس ہو تو ٹیئر منتخب کریں\n5. ذاتی معلومات بھریں\n6. دستاویزات اپلوڈ کریں\n7. پیمنٹ کریں اور اسکرین شاٹ اپلوڈ کریں\n\nکیا آپ کسی خاص سروس کے بارے میں جاننا چاہتے ہیں؟`
        : `To use our services:\n\n1. Tap "Services" on the Home screen\n2. Select the service you want\n3. Complete the eligibility check\n4. If it's a loan service, select a loan tier\n5. Fill in your personal details\n6. Upload required documents\n7. Make payment and upload screenshot\n\nWould you like to know about a specific service?`
    }

    // Payment related
    if (lower.match(/payment|پیمنٹ|ادائیگی|pay|fee|فیس|jazzcash|easypaisa|bank|بینک|جیز|ایزی/)) {
      return isUrdu
        ? `پیمنٹ کے لیے ہم تین طریقے سپورٹ کرتے ہیں:\n\n💰 جیز کیش - دکان والے نمبر پر بھیجیں\n💰 ایزی پیسہ - دکان والے نمبر پر بھیجیں\n💰 بینک ٹرانسفر - اکاؤنٹ نمبر پر ٹرانسفر کریں\n\n⚠️ اہم: پیمنٹ کے بعد اسکرین شاٹ اپلوڈ کرنا لازمی ہے۔ بنا اسکرین شاٹ کے درخواست قبول نہیں ہوگی۔\n\nکیا آپ کو پیمنٹ میں کوئی مسئلہ ہو رہا ہے؟`
        : `We support three payment methods:\n\n💰 JazzCash - Send to our shop number\n💰 EasyPaisa - Send to our shop number\n💰 Bank Transfer - Transfer to our account\n\n⚠️ Important: Uploading payment screenshot is mandatory. Application will not be accepted without it.\n\nAre you facing any payment issue?`
    }

    // Status / Track
    if (lower.match(/status|اسٹیٹس|track|ٹریک|check|چیک|application kahan|درخواست کہاں|meri application/)) {
      return isUrdu
        ? `اپنی درخواست کا اسٹیٹس دیکھنے کے لیے:\n\n📋 نیچے "درخواستیں" آئیکن دبائیں\n📋 آپ کو ہر درخواست کا موجودہ اسٹیٹس نظر آئے گا\n\nاسٹیٹس کے مطلب:\n🟡 زیر عمل - ہم آپ کی درخواست دیکھ رہے ہیں\n🟢 منظور - آپ کی درخواست قبول ہو گئی\n🔴 مسترد - آپ کی درخواست قبول نہیں ہو سکی\n\nحتمی فیصلہ ایڈمن کرے گا۔`
        : `To check your application status:\n\n📋 Tap "Applications" icon at the bottom\n📋 You'll see the current status of each application\n\nStatus meanings:\n🟡 Pending - We are reviewing your application\n🟢 Approved - Your application has been accepted\n🔴 Rejected - Your application could not be accepted\n\nFinal decision is made by the admin.`
    }

    // CNIC / Documents
    if (lower.match(/cnic|شناختی|document|دستاویز|b.form|بی فارم|نادرا|nadra/)) {
      return isUrdu
        ? `دستاویزات کے بارے میں معلومات:\n\n📄 شناختی کارڈ (CNIC) - زیادہ تر سروسز کے لیے لازمی\n📄 CNIC فارمیٹ: XXXXX-XXXXXXX-X (13 ہندسے)\n📄 بی فارم - 18 سال سے کم عمر کے لیے\n📄 پاسپورٹ سائز تصاویر - بعض سروسز کے لیے\n📄 رہائشی ثبوت - یوٹیلیٹی بل\n\nدرخواست دیتے وقت اپنے تمام دستاویزات تیار رکھیں۔`
        : `Document information:\n\n📄 CNIC - Mandatory for most services\n📄 CNIC format: XXXXX-XXXXXXX-X (13 digits)\n📄 B-Form - For applicants under 18\n📄 Passport-size photographs - For some services\n📄 Proof of residence - Utility bill\n\nKeep all your documents ready when applying.`
    }

    // Loan specific
    if (lower.match(/loan|قرض|قرضہ|tier|ٹیئر|interest|مارک اپ|collateral|گروی/)) {
      return isUrdu
        ? `قرضے کی معلومات:\n\n🏦 ٹیئر 1: 500,000 تک - 0% مارک اپ، 3 سال\n🏦 ٹیئر 2: 500K سے 1.5M - 5% مارک اپ، 5 سال\n🏦 ٹیئر 3: 1.5M سے 7.5M - 7% مارک اپ، 8 سال\n\nٹیئر 1 اور 2 کے لیے کوئی گروی نہیں۔ ٹیئر 3 کے لیے گروی درکار ہے۔\n\nعمری حد: 18 سے 45 سال۔\n\nکیا آپ قرضے کے لیے درخواست دینا چاہتے ہیں؟`
        : `Loan information:\n\n🏦 Tier 1: Up to Rs. 500K - 0% markup, 3 years\n🏦 Tier 2: Rs. 500K to 1.5M - 5% markup, 5 years\n🏦 Tier 3: Rs. 1.5M to 7.5M - 7% markup, 8 years\n\nNo collateral needed for Tier 1 and 2. Collateral required for Tier 3.\n\nAge requirement: 18 to 45 years.\n\nWould you like to apply for a loan?`
    }

    // Thank you
    if (lower.match(/thank|شکریہ|thanks|dhanyavaad/)) {
      return isUrdu
        ? `خوش آمدید ${userName}! 🙏 اگر آپ کو کوئی اور سوال ہو تو ضرور پوچھیں۔ ہم ہمیشہ مدد کے لیے موجود ہیں۔\n\nآپ واٹس ایپ پر بھی رابطہ کر سکتے ہیں فوری جواب کے لیے۔`
        : `You're welcome ${userName}! 🙏 If you have any other questions, feel free to ask. We're always here to help.\n\nYou can also reach us on WhatsApp for immediate response.`
    }

    // WhatsApp
    if (lower.match(/whatsapp|واٹس|واٹس ایپ/)) {
      return isUrdu
        ? `واٹس ایپ سپورٹ کے لیے:\n\n📱 نیچے "واٹس ایپ" بٹن دبائیں\n📱 براہ راست ہمارے نمبر پر میسج کریں\n📱 ہم عام طور پر 5 سے 10 منٹ میں جواب دیتے ہیں\n\nواٹس ایپ پر آپ تصاویر بھی بھیج سکتے ہیں اور آسانی سے بات کر سکتے ہیں۔`
        : `For WhatsApp support:\n\n📱 Tap the "WhatsApp" button below\n📱 Message us directly on our number\n📱 We usually respond within 5-10 minutes\n\nOn WhatsApp, you can also send images and chat easily.`
    }

    // No rule matched - return null to trigger LLM call
    return null
  }, [isUrdu, userName])

  // Fallback responses (when LLM also fails)
  const getFallbackResponse = useCallback((userMessage: string): string => {
    const lower = userMessage.toLowerCase().trim()

    // Try rule-based one more time with broader matching
    if (lower.match(/eligib|اہل|اہلیت|eligible|کون سکھتا|who can apply|criteria|معیار/)) {
      return isUrdu
        ? `اہلیت کے عام معیار:\n\n✅ پاکستانی شہری ہونا\n✅ درست شناختی کارڈ\n✅ عمری حد (سروس کے مطابق)\n✅ آمدنی کی حد (کچھ سروسز کے لیے)\n✅ بینک ڈیفالٹر نہ ہونا\n\nہر سروس کی اپنی اہلیت ہے۔ درخواست دیتے وقت آٹو اہلیت چیک ہوتی ہے۔ اگر آپ اہل نہ بھی ہوں تو پھر بھی درخواست دے سکتے ہیں، حتمی فیصلہ ایڈمن کرے گا۔`
        : `General eligibility criteria:\n\n✅ Pakistani citizen\n✅ Valid CNIC\n✅ Age limit (varies by service)\n✅ Income threshold (for some services)\n✅ Not a bank defaulter\n\nEach service has its own eligibility. An auto-check runs when you apply. Even if you're not eligible, you can still apply - final decision is made by admin.`
    }

    if (lower.match(/profile|پروفائل|account|اکاؤنٹ|name|نام|update|اپڈیٹ/)) {
      return isUrdu
        ? `پروفائل اپڈیٹ کرنے کے لیے:\n\n👤 نیچے "پروفائل" آئیکن دبائیں\n👤 اپنا نام، فون نمبر اپڈیٹ کریں\n👤 سیو بٹن دبائیں\n\nآپ کی پروفائل ہر درخواست میں خود بھر جائے گی۔`
        : `To update your profile:\n\n👤 Tap "Profile" icon at the bottom\n👤 Update your name, phone number\n👤 Press Save button\n\nYour profile will auto-fill in every application.`
    }

    if (lower.match(/time|وقت|kitna time|کتنا وقت|processing|پروسیسنگ|how long|کب تک/)) {
      return isUrdu
        ? `پروسیسنگ کا وقت:\n\n⏱️ عام درخواستیں: 2 سے 4 ہفتے\n⏱️ قرضے کی درخواستیں: 2 سے 4 ہفتے\n⏱️ شناختی کارڈ: 5 سے 30 دن (قسم کے مطابق)\n\nدرخواست جمع کرانے کے بعد آپ کو نوٹیفکیشن بھیجی جائے گی۔`
        : `Processing time:\n\n⏱️ General applications: 2-4 weeks\n⏱️ Loan applications: 2-4 weeks\n⏱️ CNIC services: 5-30 days (depending on type)\n\nYou'll receive a notification after your application is processed.`
    }

    if (lower.match(/price|قیمت|cost|لاگت|fee|فیس|kitna|کتنا|rate|ریٹ|charge/)) {
      return isUrdu
        ? `فیس کی معلومات:\n\n💰 سرکاری سروسز: Rs. 300-500\n💰 قرضے کی سروسز: Rs. 1,000-1,500\n💰 شناختی کارڈ: Rs. 300 (عام)، Rs. 1,500 (فوری)\n💰 پرنٹنگ/اسکیننگ: سروس کے مطابق\n\nیہ فیس دستاویزات تیار کرنے اور درخواست جمع کرانے کی ہے۔ سرکاری فیس الگ ہو سکتی ہے۔`
        : `Fee information:\n\n💰 Govt schemes: Rs. 300-500\n💰 Loan services: Rs. 1,000-1,500\n💰 CNIC services: Rs. 300 (normal), Rs. 1,500 (urgent)\n💰 Printing/Scanning: Varies by service\n\nThis fee is for document preparation and application submission. Government fees may be separate.`
    }

    if (lower.match(/help|مدد|support|سپورٹ|problem|مسئلہ|issue|مشکل|مشکل ہو رہی/)) {
      return isUrdu
        ? `میں آپ کی مدد کرنے کے لیے یہاں ہوں! بتائیں آپ کیا مسئلہ درپیش ہے:\n\n🔴 پیمنٹ کا مسئلہ?\n🔴 درخواست جمع نہیں ہو رہی?\n🔴 دستاویزات اپلوڈ نہیں ہو رہی?\n🔴 اسٹیٹس چیک کرنا ہے?\n🔴 کچھ اور?\n\nیا پھر واٹس ایپ پر براہ راست بات کریں۔`
        : `I'm here to help! Tell me what issue you're facing:\n\n🔴 Payment issue?\n🔴 Can't submit application?\n🔴 Document upload problem?\n🔴 Need to check status?\n🔴 Something else?\n\nOr chat directly on WhatsApp for immediate help.`
    }

    // Generic fallback
    const fallbacksUrdu = [
      `شکریہ آپ کے سوال کا! ${userName}، آپ کا سوال سمجھ آ گیا۔ ہماری ٹیم آپ سے جلد رابطہ کرے گی۔ فی الحال آپ یہ کر سکتے ہیں:\n\n• سروسز براؤز کریں\n• اپنی درخواستیں چیک کریں\n• واٹس ایپ پر سپورٹ لیں\n\nکیا اور کوئی سوال ہے?`,
      `${userName}، اچھا سوال ہے! میرے پاس اس کا مکمل جواب نہیں، لیکن میں آپ کی مدد کر سکتا ہوں:\n\n• سروسز سیکشن چیک کریں\n• ہیلپ پیج دیکھیں\n• واٹس ایپ پر بات کریں\n\nمیں ہر ممکن مدد کروں گا!`,
    ]

    const fallbacksEn = [
      `Thank you for your question, ${userName}! Our team will get back to you shortly. In the meantime, you can:\n\n• Browse our services\n• Check your applications\n• Get support on WhatsApp\n\nAnything else I can help with?`,
      `Great question, ${userName}! I don't have the complete answer right now, but I can help:\n\n• Check the Services section\n• Visit the Help page\n• Chat on WhatsApp\n\nI'll do my best to assist you!`,
    ]

    const fallbacks = isUrdu ? fallbacksUrdu : fallbacksEn
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }, [isUrdu, userName])

  // ─── LLM API call ───
  const callLLM = useCallback(async (message: string, history: ChatHistoryItem[]): Promise<string | null> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          language: isUrdu ? 'urdu' : 'english',
        }),
      })

      if (!res.ok) return null

      const data = await res.json()
      return data.reply || null
    } catch {
      return null
    }
  }, [isUrdu])

  // ─── Main send handler ───
  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    const messageText = input.trim()
    setInput('')
    setInterimVoiceText('')
    setIsTyping(true)

    // Step 1: Try rule-based matching first (fast)
    const ruleResponse = getRuleBasedResponse(messageText)

    if (ruleResponse) {
      // Rule matched - use it directly (fast response)
      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          text: ruleResponse,
          sender: 'bot',
          timestamp: new Date(),
          isAi: false,
        }
        setMessages(prev => [...prev, botMsg])
        setIsTyping(false)
      }, 400 + Math.random() * 400)
    } else {
      // Step 2: No rule match - call LLM API
      try {
        const llmResponse = await callLLM(messageText, chatHistory)

        if (llmResponse) {
          // LLM succeeded
          const botMsg: ChatMessage = {
            id: `bot_${Date.now()}`,
            text: llmResponse,
            sender: 'bot',
            timestamp: new Date(),
            isAi: true,
          }
          setMessages(prev => [...prev, botMsg])
          // Update chat history for context
          setChatHistory(prev => [
            ...prev,
            { role: 'user', content: messageText },
            { role: 'assistant', content: llmResponse },
          ])
        } else {
          // Step 3: LLM failed - use fallback
          const fallbackText = getFallbackResponse(messageText)
          const botMsg: ChatMessage = {
            id: `bot_${Date.now()}`,
            text: fallbackText,
            sender: 'bot',
            timestamp: new Date(),
            isAi: false,
          }
          setMessages(prev => [...prev, botMsg])
        }
      } catch {
        // LLM error - use fallback
        const fallbackText = getFallbackResponse(messageText)
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          text: fallbackText,
          sender: 'bot',
          timestamp: new Date(),
          isAi: false,
        }
        setMessages(prev => [...prev, botMsg])
      }

      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1E]">{isUrdu ? 'سپورٹ' : 'Support'}</h2>
            <p className="text-[#6B7280] text-sm">{isUrdu ? 'ہم سے رابطہ کریں' : 'Get help from our team'}</p>
          </div>
          <Badge className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-[10px]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mr-1 animate-pulse" />
            Online
          </Badge>
        </div>

        {/* Quick support options */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-medium transition-colors shrink-0 min-h-[44px]"
          >
            <Phone className="w-4 h-4" />
            {isUrdu ? 'واٹس ایپ' : 'WhatsApp'}
            <ArrowRight className="w-3 h-3" />
          </a>
          <button
            onClick={() => inputRef.current?.focus()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E8F0FE] hover:bg-[#D0E2F7] text-[#1A3C5E] rounded-xl text-xs font-medium transition-colors shrink-0 min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            {isUrdu ? 'چیٹ شروع کریں' : 'Start Chat'}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 border-0 shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-0">
        {/* Chat header bar */}
        <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-[#1A3C5E] to-[#003E6B] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-[#F5A623]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-semibold">{isUrdu ? 'Jugnoo سپورٹ' : 'Jugnoo Support'}</p>
              <Badge className="bg-[#F5A623]/20 text-[#F5A623] border-0 text-[8px] px-1.5 py-0 rounded-md gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                AI Powered
              </Badge>
            </div>
            <p className="text-blue-200 text-[10px]">{isUrdu ? 'عام طور پر فوری جواب' : 'Usually replies instantly'}</p>
          </div>
          {/* Voice Language Toggle */}
          {isVoiceSupported && (
            <VoiceLanguageToggle
              language={voiceLanguage}
              onLanguageChange={handleVoiceLanguageChange}
            />
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F7FA] min-h-0"
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-[#F5A623] text-[#1A3C5E]'
                      : 'bg-[#1A3C5E] text-white'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message bubble */}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#1A3C5E] text-white rounded-br-md'
                      : 'bg-white text-[#1C1C1E] shadow-sm rounded-bl-md'
                  }`}>
                    <p>{msg.text}</p>
                    <div className={`flex items-center gap-1.5 mt-1 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <p className={`text-[10px] ${
                        msg.sender === 'user' ? 'text-blue-200' : 'text-[#6B7280]'
                      }`}>{formatTime(msg.timestamp)}</p>
                      {msg.isAi && msg.sender === 'bot' && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] text-[#F5A623]">
                          <Sparkles className="w-2 h-2" />
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1A3C5E] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Voice listening indicator in chat area */}
        <AnimatePresence>
          {isVoiceListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="shrink-0 bg-red-50 border-t border-red-100 overflow-hidden"
            >
              <div className="px-4 py-2 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <p className="text-xs text-red-600 font-medium">
                  {isUrdu ? 'آواز سن رہا ہے...' : 'Listening...'}
                </p>
                {interimVoiceText && (
                  <p className="text-xs text-red-400 truncate flex-1 ml-1">{interimVoiceText}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="shrink-0 p-3 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isUrdu ? 'اپنا سوال لکھیں...' : 'Type your question...'}
                className="h-11 bg-[#F5F7FA] border-transparent rounded-xl focus:border-[#1A3C5E] focus:bg-white text-sm w-full pr-12"
              />
              {/* Show interim voice text as overlay inside input */}
              {isVoiceListening && interimVoiceText && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400 max-w-[40%] truncate pointer-events-none">
                  {interimVoiceText}
                </div>
              )}
            </div>
            {/* Voice Input Button */}
            <VoiceInputButton
              onTranscript={handleVoiceTranscript}
              onInterimTranscript={handleVoiceInterimTranscript}
              onListeningChange={handleVoiceListeningChange}
              onSupportedChange={handleVoiceSupportedChange}
              language={voiceLanguage}
              onLanguageChange={handleVoiceLanguageChange}
              size="md"
              onError={handleVoiceError}
              className="shrink-0"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-[#1A3C5E] hover:bg-[#0F2A42] text-white rounded-xl h-11 w-11 p-0 shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {isVoiceSupported && (
              <>
                <Mic className="w-3 h-3 text-[#6B7280]" />
                <p className="text-[10px] text-[#6B7280]">
                  {isUrdu ? 'آواز سے لکھیں' : 'Tap mic to dictate'}
                </p>
                <span className="text-[10px] text-[#6B7280] mx-1">•</span>
              </>
            )}
            <p className="text-[10px] text-[#6B7280]">
              {isUrdu ? 'یا واٹس ایپ پر رابطہ کریں فوری جواب کے لیے' : 'Or contact on WhatsApp for immediate response'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
