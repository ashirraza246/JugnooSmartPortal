'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle2, XCircle, QrCode } from 'lucide-react'
import { motion } from 'framer-motion'

interface QrVerificationBadgeProps {
  isVerified: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function QrVerificationBadge({ isVerified, size = 'md', showLabel = true }: QrVerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-0.5',
    md: 'text-[10px] px-2 py-1 gap-1',
    lg: 'text-xs px-3 py-1.5 gap-1.5',
  }

  const iconSize = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Badge
        className={`inline-flex items-center border-0 rounded-lg font-semibold ${
          isVerified
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-700'
        } ${sizeClasses[size]}`}
      >
        {isVerified ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          >
            <Shield className={`${iconSize[size]} text-emerald-600`} />
          </motion.div>
        ) : (
          <XCircle className={iconSize[size]} />
        )}
        {showLabel && (
          <span className="flex items-center gap-0.5">
            <QrCode className={iconSize[size]} />
            {isVerified ? 'QR Verified' : 'Invalid'}
          </span>
        )}
      </Badge>
    </motion.div>
  )
}

// A compact version for embedding in cards
export function QrVerifiedMark() {
  return (
    <motion.div
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      whileHover={{ scale: 1.05 }}
    >
      <CheckCircle2 className="w-3 h-3" />
      <span className="text-[9px] font-bold">VERIFIED</span>
    </motion.div>
  )
}
