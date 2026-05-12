'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download, Share2, FileText, Phone, CheckCircle2, Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  type InvoiceData,
  downloadInvoicePDF,
  generateWhatsAppInvoiceLink,
} from '@/lib/invoice-pdf'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceData: InvoiceData | null
  whatsappNumber?: string
}

export function InvoiceDialog({ open, onOpenChange, invoiceData, whatsappNumber }: InvoiceDialogProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  if (!invoiceData) return null

  const methodLabel = invoiceData.paymentMethod === 'jazzcash' ? 'JazzCash'
    : invoiceData.paymentMethod === 'easypaisa' ? 'EasyPaisa'
    : invoiceData.paymentMethod === 'bank_transfer' ? 'Bank Transfer'
    : invoiceData.paymentMethod === 'online' ? 'Online Payment'
    : invoiceData.paymentMethod === 'cash' ? 'Cash'
    : invoiceData.paymentMethod || 'N/A'

  const handleDownload = () => {
    setIsGenerating(true)
    try {
      downloadInvoicePDF(invoiceData)
      toast({
        title: 'Invoice Downloaded!',
        description: `Invoice #${invoiceData.invoiceNumber} has been saved.`,
      })
    } catch {
      toast({
        title: 'Download Failed',
        description: 'Could not generate the PDF. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleWhatsAppShare = () => {
    const link = generateWhatsAppInvoiceLink(invoiceData, whatsappNumber)
    window.open(link, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#1A3C5E] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F5A623]" />
            Invoice Preview
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Preview Card */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          {/* Mini header */}
          <div className="bg-[#1A3C5E] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">JUGNOO PHOTOSTATE</p>
              <p className="text-[#F5A623] text-[10px]">AI-Powered Business Management</p>
            </div>
            <div className="text-right">
              <p className="text-white text-xs font-semibold">INVOICE</p>
              <p className="text-blue-200 text-[10px]">#{invoiceData.invoiceNumber}</p>
            </div>
          </div>

          {/* Invoice details */}
          <div className="p-4 space-y-3">
            {/* Date & Customer row */}
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-[#6B7280]">Date: <span className="text-[#1C1C1E] font-medium">{invoiceData.date}</span></p>
                {invoiceData.orderNumber && (
                  <p className="text-[#6B7280] mt-0.5">Order: <span className="text-[#1C1C1E] font-medium">{invoiceData.orderNumber}</span></p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[#F5A623] text-[10px] font-semibold mb-0.5">BILL TO</p>
                <p className="text-[#1C1C1E] font-semibold">{invoiceData.customerName}</p>
                {invoiceData.customerPhone && (
                  <p className="text-[#6B7280] text-[10px]">{invoiceData.customerPhone}</p>
                )}
              </div>
            </div>

            {/* Items table */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-[#F5F7FA] text-[#6B7280]">
                    <th className="text-left px-3 py-1.5 font-medium">Description</th>
                    <th className="text-center px-2 py-1.5 font-medium">Qty</th>
                    <th className="text-right px-2 py-1.5 font-medium">Price</th>
                    <th className="text-right px-3 py-1.5 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-3 py-1.5 text-[#1C1C1E]">{item.description}</td>
                      <td className="text-center px-2 py-1.5 text-[#6B7280]">{item.quantity}</td>
                      <td className="text-right px-2 py-1.5 text-[#6B7280]">Rs. {item.unitPrice.toLocaleString()}</td>
                      <td className="text-right px-3 py-1.5 text-[#1C1C1E] font-medium">Rs. {item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-52 space-y-1 text-xs">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Subtotal</span>
                  <span className="text-[#1C1C1E]">Rs. {invoiceData.subtotal.toLocaleString()}</span>
                </div>
                {invoiceData.serviceFee && invoiceData.serviceFee > 0 && (
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Service Fee</span>
                    <span className="text-[#1C1C1E]">Rs. {invoiceData.serviceFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between bg-[#F5F7FA] rounded-lg px-3 py-1.5">
                  <span className="font-bold text-[#1A3C5E]">TOTAL</span>
                  <span className="font-bold text-[#1C1C1E]">Rs. {invoiceData.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment & verification info */}
            <div className="flex items-center gap-2 flex-wrap">
              {invoiceData.paymentMethod && (
                <Badge className="bg-[#FFF3D6] text-[#F5A623] border-0 text-[10px] rounded-lg">
                  Paid via {methodLabel}
                </Badge>
              )}
              {invoiceData.transactionId && (
                <Badge variant="outline" className="text-[10px] rounded-lg text-[#6B7280]">
                  TXN: {invoiceData.transactionId}
                </Badge>
              )}
              {invoiceData.verificationHash && (
                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] rounded-lg gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  QR Verifiable
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleWhatsAppShare}
            className="gap-2 border-green-200 text-green-700 hover:bg-green-50 rounded-xl"
          >
            <Phone className="w-4 h-4" />
            Share on WhatsApp
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="gap-2 bg-[#1A3C5E] hover:bg-[#15304D] rounded-xl"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
