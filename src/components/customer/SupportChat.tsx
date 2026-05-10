'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Send, MessageCircle, Phone, Bot, User, Sparkles,
  Clock, CheckCircle2, Headphones, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export function SupportChat() {
  const { user } = useAuth()
  const { isUrdu } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'

  // Auto greeting
  useEffect(() => {
    const greeting: ChatMessage = {
      id: 'greeting',
      text: isUrdu
        ? `السلام علیکم ${userName}! میں Jugnoo کا سپورٹ اسسٹنٹ ہوں۔ میں آپ کی کیا مدد کر سکتا ہوں؟`
        : `Hello ${userName}! I'm Jugnoo's support assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
    }
    setMessages([greeting])
  }, [isUrdu, userName])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Bot responses based on keywords
  const getBotResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase()

    if (lower.includes('service') || lower.includes('سروس') || lower.includes('apply') || lower.includes('درخواست')) {
      return isUrdu
        ? 'سروسز کے لیے ہوم اسکرین پر جائیں اور "سروسز" ٹیب پر کلک کریں۔ وہاں سے آپ کسی بھی سروس پر درخواست دے سکتے ہیں۔ کیا آپ کسی خاص سروس کے بارے میں پوچھنا چاہتے ہیں؟'
        : 'To browse services, go to the Home screen and tap on "Services" tab. From there you can apply for any service. Would you like to know about a specific service?'
    }

    if (lower.includes('payment') || lower.includes('پیمنٹ') || lower.includes('pay') || lower.includes('ادائیگی')) {
      return isUrdu
        ? 'پیمنٹ کے لیے ہم JazzCash، EasyPaisa اور بینک ٹرانسفر سپورٹ کرتے ہیں۔ پیمنٹ کے بعد اسکرین شاٹ اپلوڈ کریں۔ کیا آپ کو پیمنٹ میں کوئی مسئلہ ہو رہا ہے؟'
        : 'We support JazzCash, EasyPaisa, and Bank Transfer for payments. After payment, please upload the screenshot. Are you facing any payment issue?'
    }

    if (lower.includes('status') || lower.includes('اسٹیٹس') || lower.includes('track') || lower.includes('ٹریک')) {
      return isUrdu
        ? 'اپنی درخواست کا اسٹیٹس دیکھنے کے لیے "میری درخواستیں" ٹیب پر جائیں۔ وہاں آپ کو ہر درخواست کا موجودہ اسٹیٹس نظر آئے گا۔'
        : 'To check your application status, go to "My Applications" tab. You\'ll see the current status of each application there.'
    }

    if (lower.includes('cnic') || lower.includes('شناختی') || lower.includes('document') || lower.includes('دستاویز')) {
      return isUrdu
        ? 'CNIC اور دستاویزات درکار ہیں۔ براہ کرم درخواست دیتے وقت اپنی CNIC نمبر اور متعلقہ دستاویزات اپلوڈ کریں۔'
        : 'CNIC and documents are required. Please make sure to have your CNIC number and relevant documents ready when applying.'
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('السلام') || lower.includes('ہیلو')) {
      return isUrdu
        ? `السلام علیکم ${userName}! آپ کا شکریہ کہ آپ نے رابطہ کیا۔ بتائیں میں آپ کی کیا مدد کر سکتا ہوں؟`
        : `Hello ${userName}! Thank you for reaching out. How can I assist you today?`
    }

    if (lower.includes('whatsapp') || lower.includes('واٹس')) {
      return isUrdu
        ? 'واٹس ایپ سپورٹ کے لیے نیچے دیے گئے واٹس ایپ بٹن پر کلک کریں یا براہ راست ہماری واٹس ایپ نمبر پر میسج کریں۔ ہم عام طور پر چند منٹوں میں جواب دیتے ہیں۔'
        : 'For WhatsApp support, click the WhatsApp button below or message us directly on our WhatsApp number. We usually respond within a few minutes.'
    }

    return isUrdu
      ? 'شکریہ آپ کے میسج کا۔ ہماری ٹیم آپ سے جلد رابطہ کرے گی۔ اگر آپ فوری مدد چاہتے ہیں تو واٹس ایپ پر بھی رابطہ کر سکتے ہیں۔ کیا اور کوئی سوال ہے؟'
      : 'Thank you for your message. Our team will get back to you shortly. For immediate help, you can also reach us on WhatsApp. Is there anything else I can help with?'
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate bot response with delay
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        text: getBotResponse(userMsg.text),
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 800 + Math.random() * 1000)
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
          <div className="flex items-center gap-2">
            <Badge className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mr-1 animate-pulse" />
              Online
            </Badge>
          </div>
        </div>

        {/* Quick support options */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <a
            href="https://wa.me/923001234567?text=Hi%20Jugnoo%20Support%2C%20I%20need%20help%20with..."
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
          <div>
            <p className="text-white text-sm font-semibold">{isUrdu ? 'Jugnoo سپورٹ' : 'Jugnoo Support'}</p>
            <p className="text-blue-200 text-[10px]">{isUrdu ? 'عام طور پر فوری جواب' : 'Usually replies instantly'}</p>
          </div>
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
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1A3C5E] text-white rounded-br-md'
                      : 'bg-white text-[#1C1C1E] shadow-sm rounded-bl-md'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-[#6B7280]'
                    }`}>{formatTime(msg.timestamp)}</p>
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

        {/* Input */}
        <div className="shrink-0 p-3 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isUrdu ? 'اپنا سوال لکھیں...' : 'Type your question...'}
              className="flex-1 h-11 bg-[#F5F7FA] border-transparent rounded-xl focus:border-[#1A3C5E] focus:bg-white text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-[#1A3C5E] hover:bg-[#0F2A42] text-white rounded-xl h-11 w-11 p-0 shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-[#6B7280] text-center mt-2">
            {isUrdu ? 'یا واٹس ایپ پر رابطہ کریں فوری جواب کے لیے' : 'Or contact on WhatsApp for immediate response'}
          </p>
        </div>
      </Card>
    </div>
  )
}
