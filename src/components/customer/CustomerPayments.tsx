'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, Receipt, Wallet, TrendingUp } from 'lucide-react'

export function CustomerPayments() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['customer-payments', user?.id],
    queryFn: async () => {
      try {
        // Fetch only the current user's payments from service_applications
        const params = new URLSearchParams()
        if (user?.id) params.set('userId', user.id)
        const res = await fetch(`/api/service-applications?${params}`)
        if (!res.ok) throw new Error('Failed')
        const applications = await res.json()

        // Filter only paid/completed applications as payment records
        const paidApps = Array.isArray(applications)
          ? applications.filter((app: { payment_status: string }) => app.payment_status === 'paid' || app.payment_status === 'partial')
          : []

        const totalPaid = paidApps.reduce((sum: number, app: { fee_amount: number }) => sum + (app.fee_amount || 0), 0)

        // Also try the payments endpoint for this specific customer
        let customerPayments: { id: string; amount: number; payment_method: string; receipt_number: string; notes: string; created_at: string }[] = []
        try {
          const payRes = await fetch(`/api/payments?customerId=${user?.id}&limit=50`)
          if (payRes.ok) {
            const payData = await payRes.json()
            customerPayments = Array.isArray(payData?.payments) ? payData.payments : []
          }
        } catch {
          // Ignore payments endpoint errors
        }

        return {
          paidApplications: paidApps,
          totalPaid: totalPaid + customerPayments.reduce((s: number, p: { amount: number }) => s + (p.amount || 0), 0),
          customerPayments,
          pendingAmount: Array.isArray(applications)
            ? applications
                .filter((app: { payment_status: string }) => app.payment_status === 'unpaid')
                .reduce((sum: number, app: { fee_amount: number }) => sum + (app.fee_amount || 0), 0)
            : 0,
        }
      } catch {
        return { paidApplications: [], totalPaid: 0, customerPayments: [], pendingAmount: 0 }
      }
    },
    retry: false,
  })

  const totalPaid = data?.totalPaid || 0
  const pendingAmount = data?.pendingAmount || 0
  const allPayments = [
    ...(data?.paidApplications || []).map((app: { id: string; service_name: string; fee_amount: number; payment_status: string; created_at: string }) => ({
      id: app.id,
      description: app.service_name,
      amount: app.fee_amount || 0,
      payment_method: 'Service Fee',
      status: app.payment_status,
      created_at: app.created_at,
    })),
    ...(data?.customerPayments || []).map((p: { id: string; amount: number; payment_method: string; receipt_number: string; notes: string; created_at: string }) => ({
      id: p.id,
      description: p.notes || 'Payment',
      amount: p.amount,
      payment_method: p.payment_method || 'Cash',
      status: 'paid',
      created_at: p.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Meri Payments</h2>
        <p className="text-muted-foreground">Apni payment history aur status dekhein</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Wallet className="w-5 h-5" /></div>
              <div>
                <p className="text-sm text-white/80">Total Paid</p>
                <p className="text-2xl font-bold">Rs {totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
              <div>
                <p className="text-sm text-white/80">Pending Amount</p>
                <p className="text-2xl font-bold">Rs {pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><Receipt className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{allPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          ) : allPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Abhi tak koi payment nahi hai</p>
              <p className="text-sm mt-1">Jab aap koi service ke liye apply karogein aur payment karogein, yahan dikhega</p>
            </div>
          ) : (
            <div className="divide-y">
              {allPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${payment.status === 'paid' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                      <CreditCard className={`w-4 h-4 ${payment.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{payment.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.payment_method} - {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">Rs {payment.amount?.toLocaleString()}</p>
                    <Badge className={`${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} text-[10px]`}>
                      {payment.status === 'paid' ? 'Paid' : payment.status === 'partial' ? 'Partial' : 'Unpaid'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
