'use client'

import { useQuery } from '@tanstack/react-query'
import { use } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, XCircle, MapPin, Building2, Calendar, FileText, Hash, User, QrCode } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          {/* Invalid badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-12 h-12 text-red-500" />
          </motion.div>

          <h1 className="text-2xl font-bold text-[#1C1C1E]">Document Not Verified</h1>
          <p className="text-[#6B7280] mt-2 text-sm">
            This document could not be verified. The verification hash may be invalid or the document may not exist.
          </p>

          <div className="mt-6 bg-red-50 rounded-2xl p-4">
            <p className="text-red-600 text-xs font-medium flex items-center gap-2 justify-center">
              <QrCode className="w-4 h-4" />
              Invalid QR Code / Document
            </p>
          </div>

          <div className="mt-6 text-xs text-[#6B7280]">
            <p>If you believe this is an error, please contact:</p>
            <p className="font-semibold text-[#1A3C5E] mt-1">Jugnoo Photostate</p>
            <p>Chowk Azam, Layyah, Punjab</p>
          </div>
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
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full"
      >
        {/* Gold top bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#1A3C5E] via-[#F5A623] to-[#1A3C5E] rounded-full mb-6" />

        {/* Verified badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
          className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4"
        >
          <div className="relative">
            <Shield className="w-12 h-12 text-emerald-600" />
            <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Document Verified</h1>
          <p className="text-emerald-600 text-sm font-semibold mt-1 flex items-center gap-1 justify-center">
            <QrCode className="w-4 h-4" />
            QR Verification Successful
          </p>
        </motion.div>

        {/* Document details */}
        <Card className="border-0 shadow-none bg-[#F5F7FA] rounded-2xl">
          <CardContent className="p-4 space-y-3">
            {doc.serviceName && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Service</p>
                  <p className="text-sm font-semibold text-[#1C1C1E]">{doc.serviceName}</p>
                </div>
              </div>
            )}

            {doc.orderNumber && (
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Order Number</p>
                  <p className="text-sm font-semibold text-[#1C1C1E]">{doc.orderNumber}</p>
                </div>
              </div>
            )}

            {(doc.applicantName || doc.customerName) && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Applicant</p>
                  <p className="text-sm font-semibold text-[#1C1C1E]">{doc.applicantName || doc.customerName}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#1A3C5E] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Issue Date</p>
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
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Issued By</p>
                <p className="text-sm font-semibold text-[#1A3C5E]">{doc.issuedBy}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#F5A623] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium text-[#1C1C1E]">{doc.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status badge */}
        <div className="mt-4 flex items-center justify-center">
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
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-[#6B7280]">
            Verified on {new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[9px] text-[#9CA3AF] mt-1">
            Jugnoo Smart Portal · AI-Powered Business Management
          </p>
        </div>

        {/* Gold bottom bar */}
        <div className="h-1 bg-gradient-to-r from-[#1A3C5E] via-[#F5A623] to-[#1A3C5E] rounded-full mt-6" />
      </motion.div>
    </div>
  )
}
