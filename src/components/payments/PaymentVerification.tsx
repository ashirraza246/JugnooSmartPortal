'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle2, XCircle, Clock, Upload, Eye, ImageIcon, DollarSign, User, FileText, Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { DocumentPreview } from '@/components/shared/DocumentPreview'

interface PendingPayment {
  id: string
  amount: number
  paymentMethod: string
  screenshotUrl: string | null
  verificationStatus: string
  notes: string | null
  createdAt: string
  customerName?: string
  orderNumber?: string
  receiptNumber: string
}

export function PaymentVerification() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: pendingPayments = [], isLoading } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: async () => {
      const res = await fetch('/api/payments?verification=pending')
      if (!res.ok) return []
      const data = await res.json()
      return (data.payments || []).filter(
        (p: Record<string, unknown>) => p.verificationStatus === 'screenshot_uploaded' || p.screenshotUrl
      )
    },
    refetchInterval: 30000,
  })

  const verifyMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: 'verify' | 'reject'; reason?: string }) => {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verificationAction: action, rejectReason: reason }),
      })
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast({
        title: variables.action === 'verify' ? 'Payment verified!' : 'Payment rejected',
        description: variables.action === 'verify'
          ? 'Payment has been confirmed successfully'
          : 'Customer will be notified of the rejection',
      })
    },
  })

  const handleVerify = (payment: PendingPayment) => {
    verifyMutation.mutate({ id: payment.id, action: 'verify' })
  }

  const handleReject = () => {
    if (selectedPayment) {
      verifyMutation.mutate({
        id: selectedPayment.id,
        action: 'reject',
        reason: rejectReason,
      })
      setRejectDialogOpen(false)
      setSelectedPayment(null)
      setRejectReason('')
    }
  }

  const openPreview = (url: string) => {
    setPreviewUrl(url)
    setPreviewOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1A3C5E]" />
          <h3 className="text-base font-bold text-[#1C1C1E]">Pending Verifications</h3>
          <Badge className="bg-[#FFF3D6] text-[#F5A623] border-0 text-[10px] rounded-lg">
            {pendingPayments.length} pending
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#1A3C5E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pendingPayments.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-emerald-500" />
            <p className="text-[#6B7280] text-sm">No pending payment verifications</p>
            <p className="text-[#9CA3AF] text-xs mt-1">All payments are up to date</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {pendingPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Screenshot thumbnail */}
                      <div className="shrink-0">
                        {payment.screenshotUrl ? (
                          <button
                            onClick={() => openPreview(payment.screenshotUrl!)}
                            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-[#F5A623] transition-colors"
                          >
                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(payment.screenshotUrl) ? (
                              <img
                                src={payment.screenshotUrl}
                                alt="Payment screenshot"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#E8F0FE] flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-[#1A3C5E]" />
                              </div>
                            )}
                          </button>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Payment info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#2E7D32]" />
                          <span className="text-lg font-bold text-[#1C1C1E]">
                            Rs. {payment.amount?.toLocaleString()}
                          </span>
                          <Badge className="bg-[#FFF3D6] text-[#F5A623] border-0 text-[9px] rounded-lg">
                            {payment.paymentMethod}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7280]">
                          {payment.customerName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {payment.customerName}
                            </span>
                          )}
                          {payment.orderNumber && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {payment.orderNumber}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                          Receipt: {payment.receiptNumber} · {new Date(payment.createdAt).toLocaleDateString()}
                        </p>

                        {payment.notes && (
                          <p className="text-xs text-[#6B7280] mt-1 bg-[#F5F7FA] px-2 py-1 rounded-lg">
                            {payment.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {payment.screenshotUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-[10px] border-[#1A3C5E]/20 text-[#1A3C5E] gap-1 rounded-lg"
                            onClick={() => openPreview(payment.screenshotUrl!)}
                          >
                            <Eye className="w-3 h-3" /> View
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="h-8 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-lg"
                          onClick={() => handleVerify(payment)}
                          disabled={verifyMutation.isPending}
                        >
                          <CheckCircle2 className="w-3 h-3" /> Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-[10px] border-red-200 text-red-600 hover:bg-red-50 gap-1 rounded-lg"
                          onClick={() => {
                            setSelectedPayment(payment)
                            setRejectDialogOpen(true)
                          }}
                          disabled={verifyMutation.isPending}
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Document Preview Dialog */}
      <DocumentPreview
        url={previewUrl}
        filename="payment-screenshot"
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#E53935] flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Reject Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-[#6B7280]">
              Are you sure you want to reject this payment of Rs. {selectedPayment?.amount?.toLocaleString()}? The customer will be notified.
            </p>
            <div>
              <Label className="text-sm font-medium">Reason for rejection</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Screenshot not clear, wrong amount, etc."
                className="mt-1 border-gray-200 focus:border-[#E53935]"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="border-gray-200">
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason || verifyMutation.isPending}
            >
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
