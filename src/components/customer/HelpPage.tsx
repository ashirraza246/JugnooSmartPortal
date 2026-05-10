'use client'

import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle, Home, Sparkles, FileText, CreditCard,
  UserCircle, Bell, MessageCircle, Phone, ChevronRight,
  Shield, Clock, Wallet, CheckCircle2, Search
} from 'lucide-react'
import { motion } from 'framer-motion'

export function HelpPage() {
  const { isAdmin } = useAuth()
  const { isUrdu, setActiveModule } = useAppStore()

  const t = isUrdu ? {
    title: 'مدد اور رہنمائی',
    subtitle: 'ایپ کیسے استعمال کریں - مرحلہ وار رہنمائی',
    gettingStarted: 'شروعات',
    howToApply: 'درخواست کیسے دیں',
    howToTrack: 'درخواست کا اسٹیٹس کیسے دیکھیں',
    howToPay: 'پیمنٹ کیسے کریں',
    howToProfile: 'پروفائل کیسے اپڈیٹ کریں',
    howToNotif: 'نوٹیفکیشنز کیسے دیکھیں',
    howToSupport: 'سپورٹ کیسے حاصل کریں',
    quickTips: 'فوری ٹپس',
    tip1: 'ہوم اسکرین پر جلدی جانے کے لیے نیچے ہوم آئیکن دبائیں',
    tip2: 'سروسز میں درخواست دینے کے لیے پہلے اہلیت چیک ہوتی ہے',
    tip3: 'پیمنٹ کرنے کے بعد اسکرین شاٹ اپلوڈ کرنا لازمی ہے',
    tip4: 'نوٹیفکیشن بیل آئیکن پر کلک کریں تمام اطلاعات دیکھنے کے لیے',
    tip5: 'واٹس ایپ سپورٹ بھی دستیاب ہے فوری مدد کے لیے',
    faq: 'اکثر پوچھے گئے سوالات',
    faq1q: 'درخواست دینے کے بعد کتنا وقت لگتا ہے?',
    faq1a: 'عام طور پر 2 سے 4 ہفتے۔ ایڈمن آپ کی درخواست ریویو کرے گا اور اسٹیٹس اپڈیٹ کرے گا۔',
    faq2q: 'پیمنٹ کون سے طریقے دستیاب ہیں?',
    faq2a: 'جیز کیش، ایزی پیسہ، اور بینک ٹرانسفر۔ پیمنٹ کے بعد اسکرین شاٹ اپلوڈ کریں۔',
    faq3q: 'کیا میں اپنی درخواست منسوخ کر سکتا ہوں?',
    faq3a: 'جی ہاں، میری درخواستیں سیکشن میں جا کر درخواست کو منسوخ کر سکتے ہیں۔',
    faq4q: 'اگر میں اہل نہیں ہوں تو?',
    faq4a: 'اہلیت چیک ایک آٹو سسٹم ہے۔ آپ اب بھی درخواست دے سکتے ہیں، حتمی فیصلہ ایڈمن کرے گا۔',
    needMore: ' مزید مدد چاہیے?',
    liveChat: 'لائیو چیٹ',
    whatsapp: 'واٹس ایپ',
    goHome: 'ہوم پر جائیں',
  } : {
    title: 'Help & Guide',
    subtitle: 'How to use the app - step by step guide',
    gettingStarted: 'Getting Started',
    howToApply: 'How to Apply for a Service',
    howToTrack: 'How to Track Your Application',
    howToPay: 'How to Make Payment',
    howToProfile: 'How to Update Profile',
    howToNotif: 'How to View Notifications',
    howToSupport: 'How to Get Support',
    quickTips: 'Quick Tips',
    tip1: 'Tap the Home icon at the bottom to quickly go to Home screen',
    tip2: 'Services have an auto eligibility check before you apply',
    tip3: 'Uploading payment screenshot is mandatory after payment',
    tip4: 'Click the bell icon to see all your notifications',
    tip5: 'WhatsApp support is also available for immediate help',
    faq: 'Frequently Asked Questions',
    faq1q: 'How long does the application process take?',
    faq1a: 'Usually 2-4 weeks. The admin will review your application and update the status.',
    faq2q: 'What payment methods are available?',
    faq2a: 'JazzCash, EasyPaisa, and Bank Transfer. Upload screenshot after payment.',
    faq3q: 'Can I cancel my application?',
    faq3a: 'Yes, go to My Applications section to cancel an application.',
    faq4q: 'What if I am not eligible?',
    faq4a: 'The eligibility check is an auto-system. You can still apply, final decision is made by admin.',
    needMore: 'Need more help?',
    liveChat: 'Live Chat',
    whatsapp: 'WhatsApp',
    goHome: 'Go to Home',
  }

  const guides = [
    { icon: Sparkles, label: t.howToApply, color: '#1A3C5E', bgColor: '#E8F0FE', module: 'services' as const,
      steps: isUrdu ? ['ہوم سکرین پر "سروسز" ٹیب دبائیں', 'سروس منتخب کریں', 'اہلیت چیک مکمل کریں', 'فارم بھریں اور پیمنٹ کریں'] : ['Tap "Services" on Home screen', 'Select the service you want', 'Complete the eligibility check', 'Fill the form and make payment'] },
    { icon: FileText, label: t.howToTrack, color: '#F5A623', bgColor: '#FFF3D6', module: 'my-applications' as const,
      steps: isUrdu ? ['نیچے "درخواستیں" آئیکن دبائیں', 'اپنی تمام درخواستیں دیکھیں', 'اسٹیٹس چیک کریں - زیر عمل / منظور / مسترد'] : ['Tap "Applications" icon at bottom', 'See all your applications', 'Check status - Pending / Approved / Rejected'] },
    { icon: CreditCard, label: t.howToPay, color: '#2E7D32', bgColor: '#E8F5E9', module: 'services' as const,
      steps: isUrdu ? ['درخواست کے آخری مرحلے پر جائیں', 'پیمنٹ کا طریقہ منتخب کریں', 'پیمنٹ کریں اور اسکرین شاٹ اپلوڈ کریں'] : ['Go to the final step of application', 'Select payment method', 'Make payment and upload screenshot'] },
    { icon: UserCircle, label: t.howToProfile, color: '#7B1FA2', bgColor: '#F3E5F5', module: 'profile' as const,
      steps: isUrdu ? ['پروفائل آئیکن دبائیں', 'اپنی تفصیلات اپڈیٹ کریں', 'سیو بٹن دبائیں'] : ['Tap the Profile icon', 'Update your details', 'Press Save button'] },
    { icon: Bell, label: t.howToNotif, color: '#E53935', bgColor: '#FFEBEE', module: 'notifications' as const,
      steps: isUrdu ? ['ہیڈر پر بیل آئیکن دبائیں', 'تمام اطلاعات پڑھیں', 'ضروری نہیں تو ہٹا دیں'] : ['Tap the bell icon on header', 'Read all notifications', 'Dismiss if not needed'] },
    { icon: MessageCircle, label: t.howToSupport, color: '#2E7D32', bgColor: '#E8F5E9', module: 'support-chat' as const,
      steps: isUrdu ? ['یوزر آئیکن پر کلک کریں', 'سپورٹ میں لائیو چیٹ یا واٹس ایپ منتخب کریں', 'اپنا سوال پوچھیں'] : ['Click on your avatar icon', 'Select Live Chat or WhatsApp in Support', 'Ask your question'] },
  ]

  const tips = [
    { icon: Home, text: t.tip1 },
    { icon: Shield, text: t.tip2 },
    { icon: Wallet, text: t.tip3 },
    { icon: Bell, text: t.tip4 },
    { icon: Phone, text: t.tip5 },
  ]

  const faqs = [
    { q: t.faq1q, a: t.faq1a },
    { q: t.faq2q, a: t.faq2a },
    { q: t.faq3q, a: t.faq3a },
    { q: t.faq4q, a: t.faq4a },
  ]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623] flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-[#1A3C5E]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.title}</h2>
              <p className="text-white/70 text-sm">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-step Guides */}
      <div>
        <h3 className="text-base font-semibold text-[#1C1C1E] mb-3">{t.gettingStarted}</h3>
        <div className="space-y-3">
          {guides.map((guide, index) => {
            const Icon = guide.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-4">
                    <button
                      onClick={() => setActiveModule(guide.module)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: guide.bgColor }}>
                          <Icon className="w-5 h-5" style={{ color: guide.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1C1C1E]">{guide.label}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="space-y-1.5 pl-1">
                        {guide.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#1A3C5E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-xs text-[#6B7280]">{step}</p>
                          </div>
                        ))}
                      </div>
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1C1C1E] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5A623]" />
            {t.quickTips}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tips.map((tip, i) => {
            const Icon = tip.icon
            return (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F7FA] transition-colors">
                <Icon className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                <p className="text-xs text-[#6B7280]">{tip.text}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1C1C1E] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#1A3C5E]" />
            {t.faq}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-3 bg-[#F5F7FA] rounded-xl">
              <p className="text-sm font-semibold text-[#1C1C1E] flex items-start gap-2">
                <Search className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                {faq.q}
              </p>
              <p className="text-xs text-[#6B7280] mt-1.5 ml-6">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Need More Help */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-5 text-center">
          <p className="text-sm font-medium text-[#1C1C1E] mb-3">{t.needMore}</p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => setActiveModule('support-chat')}
              className="bg-[#1A3C5E] hover:bg-[#0F2A42] text-white rounded-xl gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t.liveChat}
            </Button>
            <a
              href="https://wa.me/923001234567?text=Hi%20Jugnoo%20Support%2C%20I%20need%20help%20with..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t.whatsapp}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
