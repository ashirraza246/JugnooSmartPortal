'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Printer, Save, Download, UsersRound, ListChecks, Shield, Database, ExternalLink, CreditCard, Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PushNotificationSettings } from '@/components/notifications/PushNotificationSettings'

interface PaymentSettings {
  jazzCash: {
    accountNumber: string
    accountHolderName: string
  }
  easyPaisa: {
    accountNumber: string
    accountHolderName: string
  }
  bankTransfer: {
    bankName: string
    accountNumber: string
    accountHolderName: string
    iban: string
  }
}

interface BusinessInfo {
  name: string
  address: string
  phone: string
  whatsapp: string
  email: string
}

interface AllSettings {
  business: BusinessInfo
  payments: PaymentSettings
}

const defaultBusiness: BusinessInfo = {
  name: 'Jugnoo Photostate',
  address: 'Chowk Azam, Layyah, Punjab, Pakistan',
  phone: '0300-1234567',
  whatsapp: '923001234567',
  email: 'info@jugnoo.pk',
}

const defaultPayments: PaymentSettings = {
  jazzCash: {
    accountNumber: '',
    accountHolderName: '',
  },
  easyPaisa: {
    accountNumber: '',
    accountHolderName: '',
  },
  bankTransfer: {
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    iban: '',
  },
}

export function SettingsModule() {
  const { toast } = useToast()
  const { setActiveModule } = useAppStore()
  const queryClient = useQueryClient()
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusiness)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPayments)

  // Fetch settings from API
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('Failed')
        return res.json() as Promise<AllSettings>
      } catch {
        return null
      }
    },
    retry: false,
  })

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      if (settings.business) setBusinessInfo({ ...defaultBusiness, ...settings.business })
      if (settings.payments) {
        setPaymentSettings({
          jazzCash: { ...defaultPayments.jazzCash, ...settings.payments.jazzCash },
          easyPaisa: { ...defaultPayments.easyPaisa, ...settings.payments.easyPaisa },
          bankTransfer: { ...defaultPayments.bankTransfer, ...settings.payments.bankTransfer },
        })
      }
    }
  }, [settings])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: AllSettings) => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
      queryClient.invalidateQueries({ queryKey: ['payment-settings-public'] })
      toast({ title: 'Settings saved successfully!' })
    },
    onError: () => {
      toast({ title: 'Failed to save settings', variant: 'destructive' })
    },
  })

  const handleSaveBusiness = () => {
    saveMutation.mutate({
      business: businessInfo,
      payments: paymentSettings,
    })
  }

  const handleSavePaymentSettings = () => {
    saveMutation.mutate({
      business: businessInfo,
      payments: paymentSettings,
    })
  }

  const handleExport = async () => {
    try {
      const res = await fetch('/api/seed')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'jugnoo-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Data exported!' })
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' })
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aukoisdzezickvruhfyv.supabase.co'
  const isSaving = saveMutation.isPending

  return (
    <div className="max-w-2xl space-y-6">
      {/* Saving Indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 z-50 bg-[#003366] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Quick Links */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#003366] to-[#1a5276] text-white">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-blue-300" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-blue-200">Admin features tak asaani se pohchein</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start h-auto py-3 px-4 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={() => setActiveModule('team')}>
              <UsersRound className="w-5 h-5 mr-3 text-blue-300" />
              <div className="text-left">
                <p className="text-sm font-medium">Team Management</p>
                <p className="text-xs text-blue-200">Admin access dein team ko</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3 px-4 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={() => setActiveModule('service-mgmt')}>
              <ListChecks className="w-5 h-5 mr-3 text-blue-300" />
              <div className="text-left">
                <p className="text-sm font-medium">Service Manager</p>
                <p className="text-xs text-blue-200">Services aur documents manage</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <PushNotificationSettings />

      {/* Business Info */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#003366] to-[#2980b9]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <Printer className="w-5 h-5 text-[#2980b9]" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Business Name</Label>
            <Input value={businessInfo.name} onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={businessInfo.address} onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Phone</Label>
              <Input value={businessInfo.phone} onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({ ...businessInfo, whatsapp: e.target.value })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input value={businessInfo.email} onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
          </div>
          <Button onClick={handleSaveBusiness} disabled={isSaving} className="gap-2 bg-gradient-to-r from-[#003366] to-[#2980b9] hover:from-[#001a33] hover:to-[#1a5276] text-white">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Business Info
          </Button>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#2980b9] to-[#3498db]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <CreditCard className="w-5 h-5 text-[#2980b9]" />
            Payment Settings
          </CardTitle>
          <CardDescription>Yeh details customers ko dikhein gi jab woh payment karein ge. Changes turant reflect honge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* JazzCash */}
          <div className="space-y-3 p-4 rounded-xl bg-red-50/50 border border-red-100">
            <div className="flex items-center gap-2 pb-1 border-b border-red-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">JC</div>
              <div>
                <p className="text-sm font-bold text-[#003366]">JazzCash</p>
                <p className="text-xs text-muted-foreground">Mobile wallet payments</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0">
              <div>
                <Label>Account Number</Label>
                <Input placeholder="e.g. 03001234567" value={paymentSettings.jazzCash.accountNumber} onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzCash: { ...paymentSettings.jazzCash, accountNumber: e.target.value } })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
              </div>
              <div>
                <Label>Account Holder Name</Label>
                <Input placeholder="e.g. Muhammad Ali" value={paymentSettings.jazzCash.accountHolderName} onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzCash: { ...paymentSettings.jazzCash, accountHolderName: e.target.value } })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
              </div>
            </div>
          </div>

          {/* EasyPaisa */}
          <div className="space-y-3 p-4 rounded-xl bg-green-50/50 border border-green-100">
            <div className="flex items-center gap-2 pb-1 border-b border-green-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">EP</div>
              <div>
                <p className="text-sm font-bold text-[#003366]">EasyPaisa</p>
                <p className="text-xs text-muted-foreground">Mobile wallet payments</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0">
              <div>
                <Label>Account Number</Label>
                <Input placeholder="e.g. 03001234567" value={paymentSettings.easyPaisa.accountNumber} onChange={(e) => setPaymentSettings({ ...paymentSettings, easyPaisa: { ...paymentSettings.easyPaisa, accountNumber: e.target.value } })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
              </div>
              <div>
                <Label>Account Holder Name</Label>
                <Input placeholder="e.g. Muhammad Ali" value={paymentSettings.easyPaisa.accountHolderName} onChange={(e) => setPaymentSettings({ ...paymentSettings, easyPaisa: { ...paymentSettings.easyPaisa, accountHolderName: e.target.value } })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-2 pb-1 border-b border-blue-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#2980b9] flex items-center justify-center text-white font-bold text-sm shadow-sm">BK</div>
              <div>
                <p className="text-sm font-bold text-[#003366]">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">Direct bank account transfer</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0">
              <div>
                <Label>Bank Name</Label>
                <Input placeholder="e.g. HBL, Meezan Bank" value={paymentSettings.bankTransfer.bankName} onChange={(e) => setPaymentSettings({ ...paymentSettings, bankTransfer: { ...paymentSettings.bankTransfer, bankName: e.target.value } })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input placeholder="e.g. 1234567890" value={paymentSettings.bankTransfer.accountNumber} onChange={(e) => setPaymentSettings({ ...paymentSettings, bankTransfer: { ...paymentSettings.bankTransfer, accountNumber: e.target.value } })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
              </div>
              <div>
                <Label>Account Holder Name</Label>
                <Input placeholder="e.g. Muhammad Ali" value={paymentSettings.bankTransfer.accountHolderName} onChange={(e) => setPaymentSettings({ ...paymentSettings, bankTransfer: { ...paymentSettings.bankTransfer, accountHolderName: e.target.value } })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
              </div>
              <div>
                <Label>IBAN</Label>
                <Input placeholder="e.g. PK36SCBL0000001234567890" value={paymentSettings.bankTransfer.iban} onChange={(e) => setPaymentSettings({ ...paymentSettings, bankTransfer: { ...paymentSettings.bankTransfer, iban: e.target.value } })} className="mt-1 border-blue-100 focus-visible:ring-blue-200" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">Yeh payment details customers ko turant dikhengi jab woh payment karein ge. Changes live hote hain.</p>
          </div>

          <Button onClick={handleSavePaymentSettings} disabled={isSaving} className="gap-2 bg-gradient-to-r from-[#003366] to-[#2980b9] hover:from-[#001a33] hover:to-[#1a5276] text-white">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Payment Settings
          </Button>
        </CardContent>
      </Card>

      {/* Database Info */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#003366] to-[#1a5276]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <Database className="w-5 h-5 text-[#2980b9]" />
            Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Supabase</p>
              <p className="text-xs text-muted-foreground truncate max-w-xs">{supabaseUrl}</p>
            </div>
            <a href={`${supabaseUrl}/editor`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1 border-blue-200">
                <ExternalLink className="w-3 h-3" /> Open
              </Button>
            </a>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Supabase SQL Editor mein yeh tables create karein agar nahi hain: <code>service_listings</code>, <code>service_applications</code>, <code>site_settings</code>, <code>user_credentials</code>
          </p>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#003366] to-[#1a5276]" />
        <CardHeader>
          <CardTitle className="text-[#003366]">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Export all your data for backup or migration purposes.</p>
          <Button variant="outline" onClick={handleExport} className="gap-2 border-blue-200">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#003366] to-[#2980b9]" />
        <CardHeader>
          <CardTitle className="text-[#003366]">About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-auto max-w-[140px] h-12 rounded-xl overflow-hidden shadow-md bg-white flex items-center justify-center px-1">
                <img src="/jugnoo-photos-logo.jpg" alt="Jugnoo Photos" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-semibold">Jugnoo Smart Portal</p>
                <p className="text-xs text-muted-foreground">v2.2.0 - Ultra Premium UBL</p>
              </div>
            </div>
            <Separator className="my-3" />
            <p className="text-muted-foreground">AI-powered business management portal for Jugnoo Photostate, Chowk Azam. Complete 2-in-1 solution - Admin Panel + Customer Portal.</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="p-2 bg-[#003366]/5 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Framework</p>
                <p className="text-xs font-semibold text-[#003366]">Next.js 16</p>
              </div>
              <div className="p-2 bg-[#003366]/5 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Database</p>
                <p className="text-xs font-semibold text-[#003366]">Supabase</p>
              </div>
              <div className="p-2 bg-[#003366]/5 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">UI</p>
                <p className="text-xs font-semibold text-[#003366]">shadcn/ui</p>
              </div>
              <div className="p-2 bg-[#003366]/5 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Hosting</p>
                <p className="text-xs font-semibold text-[#003366]">Vercel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
