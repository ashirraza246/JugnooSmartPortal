'use client'

import { useQuery } from '@tanstack/react-query'
import { use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle2, XCircle, MapPin, Building2, Calendar, FileText, Hash, User, QrCode, Lock, Info, Phone, MessageSquare, Sparkles, Eye, Clock, Fingerprint, Award, AlertTriangle, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// Animated Checkmark SVG Component
function AnimatedCheckmark() {
  return (
    <motion.svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      initial="hidden"
      animate="visible"
    >
      {/* Outer glow */}
      <motion.circle
        cx="36"
        cy="36"
        r="34"
        stroke="#10B981"
        strokeWidth="1"
        fill="none"
        opacity="0.2"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 0.2 }
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      {/* Main circle */}
      <motion.circle
        cx="36"
        cy="36"
        r="30"
        stroke="#10B981"
        strokeWidth="4"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 }
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      {/* Checkmark */}
      <motion.path
        d="M22 36 L30 44 L50 24"
        stroke="#10B981"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 }
        }}
        transition={{ duration: 0.4, ease: "easeInOut", delay: 0.5 }}
      />
    </motion.svg>
  )
}

// Animated X Mark SVG Component
function AnimatedXMark() {
  return (
    <motion.svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="36"
        cy="36"
        r="30"
        stroke="#EF4444"
        strokeWidth="4"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 }
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <motion.path
        d="M26 26 L46 46"
        stroke="#EF4444"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 }
        }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.path
        d="M46 26 L26 46"
        stroke="#EF4444"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 }
        }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: 0.6 }}
      />
    </motion.svg>
  )
}

// Pulse ring effect
function PulseRing() {
  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        style={{ border: '2px solid #10B981' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ scale: 1, opacity: 0.3 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
        style={{ border: '1.5px solid #10B981' }}
      />
    </>
  )
}

// Security features list
function SecurityFeatures() {
  const features = [
    { icon: <Lock className="w-4 h-4" />, title: 'Hash-Based Security', titleUrdu: 'ہش پر مبنی سیکیورٹی', desc: 'Each document has a unique cryptographic hash that cannot be forged', descUrdu: 'ہر دستاویز کا ایک منفرد کرپٹوگرافک ہش ہوتا ہے جو جعلسازی نہیں ہو سکتا' },
    { icon: <Fingerprint className="w-4 h-4" />, title: 'Unique Verification', titleUrdu: 'منفرد تصدیق', desc: 'Every QR code is linked to a specific document in our secure database', descUrdu: 'ہر QR کوڈ ہمارے محفوظ ڈیٹابیس میں ایک مخصوص دستاویز سے جڑا ہوتا ہے' },
    { icon: <Eye className="w-4 h-4" />, title: 'Instant Verification', titleUrdu: 'فوری تصدیق', desc: 'Scan QR code to instantly verify document authenticity online', descUrdu: 'QR کوڈ اسکین کریں اور آن لائن فوری تصدیق کریں' },
    { icon: <Shield className="w-4 h-4" />, title: 'Tamper-Proof', titleUrdu: 'بدلاؤ سے محفوظ', desc: 'Any modification to the document invalidates the verification', descUrdu: 'دستاویز میں کوئی بھی تبدیلی تصدیق کو ناکارہ کر دیتی ہے' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      className="mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-4 h-4 text-[#1A3C5E]" />
        <p className="text-xs font-semibold text-[#1A3C5E]">How QR Verification Works / QR تصدیق کیسے کام کرتی ہے</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1 + i * 0.1 }}
            className="bg-[#F5F7FA] rounded-xl p-2.5"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[#1A3C5E]">{f.icon}</span>
              <p className="text-[9px] font-semibold text-[#1C1C1E] leading-tight">{f.title}</p>
            </div>
            <p className="text-[8px] text-[#6B7280] leading-relaxed">{f.desc}</p>
            <p className="text-[8px] text-[#6B7280] leading-relaxed mt-0.5" dir="rtl">{f.descUrdu}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Benefits section
function BenefitsSection() {
  const benefits = [
    { icon: <Globe className="w-3.5 h-3.5" />, text: 'Verify from anywhere in the world', textUrdu: 'دنیا کے کسی بھی کونے سے تصدیق کریں' },
    { icon: <Clock className="w-3.5 h-3.5" />, text: '24/7 instant verification available', textUrdu: '24 گھنٹے فوری تصدیق دستیاب' },
    { icon: <Shield className="w-3.5 h-3.5" />, text: 'Government & bank recognized', textUrdu: 'سرکاری اور بینکی سطح پر تسلیم شدہ' },
    { icon: <QrCode className="w-3.5 h-3.5" />, text: 'One scan = complete verification', textUrdu: 'ایک اسکین = مکمل تصدیق' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.3 }}
      className="mt-4 bg-gradient-to-br from-[#1A3C5E]/5 to-[#F5A623]/5 rounded-2xl p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#F5A623]" />
        <p className="text-xs font-semibold text-[#1A3C5E]">Benefits / فوائد</p>
      </div>
      <div className="space-y-1.5">
        {benefits.map((b, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[#1A3C5E] mt-0.5 shrink-0">{b.icon}</span>
            <div>
              <p className="text-[9px] text-[#1C1C1E] leading-relaxed">{b.text}</p>
              <p className="text-[9px] text-[#6B7280] leading-relaxed" dir="rtl">{b.textUrdu}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data, isLoading, error } = useQuery({
    queryKey: ['verify', id],
    queryFn: async () => {
      const res = await fetch(`/api/verify/${id}`)
      if (!res.ok) throw new Error('Verification failed')
      return res.json()
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 border-4 border-[#1A3C5E] border-t-[#F5A623] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[#6B7280] text-sm">Verifying document...</p>
          <p className="mt-1 text-[#6B7280] text-xs" dir="rtl">دستاویز کی تصدیق ہو رہی ہے...</p>
          <p className="mt-3 text-[10px] text-[#9CA3AF]">Please wait while we verify the QR code authenticity</p>
          <p className="mt-1 text-[10px] text-[#9CA3AF]" dir="rtl">براہ کرم انتظار کریں جب تک ہم QR کوڈ کی اصلیت کی تصدیق کر رہے ہیں</p>
        </motion.div>
      </div>
    )
  }

  if (error || !data?.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center"
        >
          {/* Invalid animated badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            className="w-28 h-28 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 relative"
          >
            <AnimatedXMark />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h1 className="text-2xl font-bold text-[#1C1C1E]">Document Not Verified</h1>
            <p className="text-[#6B7280] mt-1 text-sm font-medium" dir="rtl">دستاویز کی تصدیق نہیں ہو سکی</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4"
          >
            <p className="text-[#6B7280] mt-2 text-sm">
              This document could not be verified. The verification hash may be invalid or the document may not exist in our system.
            </p>
            <p className="text-[#6B7280] mt-1 text-sm" dir="rtl">
              یہ دستاویز کی تصدیق نہیں ہو سکی۔ ہش غلط ہو سکتا ہے یا دستاویز سسٹم میں موجود نہیں۔
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-6 bg-red-50 rounded-2xl p-4"
          >
            <p className="text-red-600 text-xs font-medium flex items-center gap-2 justify-center">
              <XCircle className="w-4 h-4" />
              Invalid QR Code / Document
            </p>
            <p className="text-red-500 text-xs mt-1" dir="rtl">
              غلط QR کوڈ / دستاویز
            </p>
          </motion.div>

          {/* Warning section - what could cause this */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-4 bg-amber-50 rounded-2xl p-4 text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-semibold text-amber-800">Possible Causes / ممکنہ وجوہات</p>
            </div>
            <ul className="space-y-1.5">
              <li className="text-[10px] text-amber-700 leading-relaxed flex items-start gap-1.5">
                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>The QR code may have been tampered with or copied</span>
              </li>
              <li className="text-[10px] text-amber-700 leading-relaxed flex items-start gap-1.5" dir="rtl">
                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>QR کوڈ میں تبدیلی کی گئی ہو گی یا کاپی کیا گیا ہو گا</span>
              </li>
              <li className="text-[10px] text-amber-700 leading-relaxed flex items-start gap-1.5">
                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>The document is not authentic or not issued by Jugnoo</span>
              </li>
              <li className="text-[10px] text-amber-700 leading-relaxed flex items-start gap-1.5" dir="rtl">
                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>دستاویز اصلی نہیں ہے یا جگنو کی جانب سے جاری نہیں</span>
              </li>
              <li className="text-[10px] text-amber-700 leading-relaxed flex items-start gap-1.5">
                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>The verification link may be corrupted</span>
              </li>
              <li className="text-[10px] text-amber-700 leading-relaxed flex items-start gap-1.5" dir="rtl">
                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>تصدیق کا لنک خراب ہو سکتا ہے</span>
              </li>
            </ul>
          </motion.div>

          {/* What does this mean? section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="mt-4 bg-gray-50 rounded-2xl p-4 text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-[#6B7280]" />
              <p className="text-xs font-semibold text-[#1C1C1E]">What should you do? / آپ کو کیا کرنا چاہیے؟</p>
            </div>
            <ul className="space-y-1.5">
              <li className="text-[10px] text-[#6B7280] leading-relaxed flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                <span>Contact Jugnoo Photostate to verify the document manually</span>
              </li>
              <li className="text-[10px] text-[#6B7280] leading-relaxed flex items-start gap-1.5" dir="rtl">
                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                <span>دستاویز کی تصدیق کے لیے جگنو فوٹو اسٹیٹ سے رابطہ کریں</span>
              </li>
              <li className="text-[10px] text-[#6B7280] leading-relaxed flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                <span>Request a new QR code or document from the shop</span>
              </li>
              <li className="text-[10px] text-[#6B7280] leading-relaxed flex items-start gap-1.5" dir="rtl">
                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                <span>دکان سے نیا QR کوڈ یا دستاویز کی درخواست کریں</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-6 text-xs text-[#6B7280]"
          >
            <p>If you believe this is an error, please contact:</p>
            <p className="text-[#6B7280] text-xs" dir="rtl">اگر آپ کو لگتا ہے کہ یہ غلطی ہے تو رابطہ کریں:</p>
            <p className="font-semibold text-[#1A3C5E] mt-1">Jugnoo Photostate</p>
            <p>Chowk Azam, Layyah, Punjab</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <a href="tel:03001234567" className="flex items-center gap-1 text-[#1A3C5E] hover:underline">
                <Phone className="w-3 h-3" />
                0300-1234567
              </a>
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                <MessageSquare className="w-3 h-3" />
                WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Powered by badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-6 pt-4 border-t border-gray-100"
          >
            <p className="text-[9px] text-[#9CA3AF] flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by Jugnoo Smart Portal
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const doc = data.document

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full"
      >
        {/* Gold top bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#1A3C5E] via-[#F5A623] to-[#1A3C5E] rounded-full mb-6" />

        {/* Verified animated badge with pulse effect */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
          className="w-32 h-32 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 relative"
        >
          <PulseRing />
          <AnimatedCheckmark />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Document Verified</h1>
          <p className="text-emerald-600 text-sm font-semibold mt-1" dir="rtl">دستاویز کی تصدیق ہو گئی</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full text-xs font-semibold text-emerald-700">
              <QrCode className="w-3.5 h-3.5" />
              QR Verification Successful
            </span>
          </div>
          <p className="text-emerald-500 text-xs mt-1" dir="rtl">QR تصدیق کامیاب</p>
        </motion.div>

        {/* Secured by badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-1.5 mb-4"
        >
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1A3C5E]/5 rounded-full text-[10px] font-semibold text-[#1A3C5E]">
            <Lock className="w-3 h-3" />
            Secured by QR Verification
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5A623]/10 rounded-full text-[10px] font-semibold text-[#F5A623]">
            <Shield className="w-3 h-3" />
            Authentic
          </span>
        </motion.div>

        {/* Document details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card className="border-0 shadow-none bg-[#F5F7FA] rounded-2xl">
            <CardContent className="p-4 space-y-3">
              {doc.serviceName && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Service / سروس</p>
                    <p className="text-sm font-semibold text-[#1C1C1E]">{doc.serviceName}</p>
                  </div>
                </div>
              )}

              {doc.orderNumber && (
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Order Number / آرڈر نمبر</p>
                    <p className="text-sm font-semibold text-[#1C1C1E]">{doc.orderNumber}</p>
                  </div>
                </div>
              )}

              {(doc.applicantName || doc.customerName) && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Applicant / درخواست دہندہ</p>
                    <p className="text-sm font-semibold text-[#1C1C1E]">{doc.applicantName || doc.customerName}</p>
                  </div>
                </div>
              )}

              {doc.customerPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Phone / فون</p>
                    <p className="text-sm font-semibold text-[#1C1C1E]">{doc.customerPhone}</p>
                  </div>
                </div>
              )}

              {doc.customerCnic && (
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">CNIC / شناختی کارڈ</p>
                    <p className="text-sm font-semibold text-[#1C1C1E]">{doc.customerCnic}</p>
                  </div>
                </div>
              )}

              {doc.feeAmount && (
                <div className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-[#F5A623] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Fee Amount / فیس</p>
                    <p className="text-sm font-semibold text-[#1A3C5E]">Rs. {doc.feeAmount.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Issue Date / تاریخ اجرا</p>
                  <p className="text-sm font-semibold text-[#1C1C1E]">
                    {new Date(doc.issuedAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Issued By / جاری کنندہ</p>
                  <p className="text-sm font-semibold text-[#1A3C5E]">{doc.issuedBy}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#F5A623] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Location / مقام</p>
                  <p className="text-sm font-medium text-[#1C1C1E]">{doc.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-4 flex items-center justify-center"
        >
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            doc.status === 'completed' || doc.status === 'delivered' || doc.status === 'approved'
              ? 'bg-emerald-100 text-emerald-700'
              : doc.status === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {(doc.status === 'completed' || doc.status === 'delivered') && <CheckCircle2 className="w-3.5 h-3.5" />}
            {doc.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
            Status: {String(doc.status).replace(/_/g, ' ').toUpperCase()}
          </span>
        </motion.div>

        {/* What does this mean? section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-4 bg-emerald-50 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-800">What does this mean? / اس کا کیا مطلب ہے؟</p>
          </div>
          <ul className="space-y-1.5">
            <li className="text-[10px] text-emerald-700 leading-relaxed flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
              <span>This document has been verified by Jugnoo Smart Portal&apos;s QR verification system.</span>
            </li>
            <li className="text-[10px] text-emerald-700 leading-relaxed flex items-start gap-1.5" dir="rtl">
              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
              <span>یہ دستاویز جگنو سمارٹ پورٹل کے QR تصدیق سسٹم سے تصدیق شدہ ہے۔</span>
            </li>
            <li className="text-[10px] text-emerald-700 leading-relaxed flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
              <span>The document is authentic and has not been tampered with.</span>
            </li>
            <li className="text-[10px] text-emerald-700 leading-relaxed flex items-start gap-1.5" dir="rtl">
              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
              <span>دستاویز اصلی ہے اور اس میں کوئی تبدیلی نہیں کی گئی۔</span>
            </li>
            <li className="text-[10px] text-emerald-700 leading-relaxed flex items-start gap-1.5">
              <QrCode className="w-3 h-3 mt-0.5 shrink-0" />
              <span>Scan the QR code on any Jugnoo document to instantly verify its authenticity.</span>
            </li>
            <li className="text-[10px] text-emerald-700 leading-relaxed flex items-start gap-1.5" dir="rtl">
              <QrCode className="w-3 h-3 mt-0.5 shrink-0" />
              <span>کسی بھی جگنو دستاویز پر QR کوڈ اسکین کریں فوری تصدیق کے لیے۔</span>
            </li>
            <li className="text-[10px] text-emerald-700 leading-relaxed flex items-start gap-1.5">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
              <span>For questions, contact Jugnoo Photostate at Chowk Azam, Layyah.</span>
            </li>
            <li className="text-[10px] text-emerald-700 leading-relaxed flex items-start gap-1.5" dir="rtl">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
              <span>سوالات کے لیے چوک اعظم لیہ پر جگنو فوٹو اسٹیٹ سے رابطہ کریں۔</span>
            </li>
          </ul>
        </motion.div>

        {/* How QR Verification Works */}
        <SecurityFeatures />

        {/* Benefits */}
        <BenefitsSection />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="mt-6 pt-4 border-t border-gray-100 text-center"
        >
          <p className="text-[10px] text-[#6B7280]">
            Verified on {new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[10px] text-[#6B7280]" dir="rtl">
            تصدیق کی تاریخ: {new Date().toLocaleDateString('ur-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {/* Powered by Jugnoo Smart Portal badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#1A3C5E]/5 to-[#F5A623]/5 rounded-full">
            <Sparkles className="w-3 h-3 text-[#F5A623]" />
            <p className="text-[9px] font-semibold text-[#1A3C5E]">
              Powered by Jugnoo Smart Portal
            </p>
          </div>

          <p className="text-[9px] text-[#9CA3AF] mt-1">
            Jugnoo Smart Portal · AI-Powered Business Management
          </p>
          <p className="text-[9px] text-[#9CA3AF]" dir="rtl">
            جگنو سمارٹ پورٹل · AI پر مبنی کاروباری انتظام
          </p>
        </motion.div>

        {/* Gold bottom bar */}
        <div className="h-1 bg-gradient-to-r from-[#1A3C5E] via-[#F5A623] to-[#1A3C5E] rounded-full mt-6" />
      </motion.div>
    </div>
  )
}
