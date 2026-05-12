'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle, ArrowRight, FileText, Loader2 } from 'lucide-react'

export interface TimelineEntry {
  status: string
  label: string
  timestamp: string
  description?: string
}

interface StatusTimelineProps {
  entries: TimelineEntry[]
  currentStatus: string
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  submitted: { color: '#1A3C5E', bgColor: '#E8F0FE', icon: FileText },
  pending: { color: '#F5A623', bgColor: '#FFF3D6', icon: Clock },
  in_progress: { color: '#2563EB', bgColor: '#DBEAFE', icon: Loader2 },
  ready: { color: '#7C3AED', bgColor: '#EDE9FE', icon: CheckCircle2 },
  completed: { color: '#2E7D32', bgColor: '#E8F5E9', icon: CheckCircle2 },
  approved: { color: '#2E7D32', bgColor: '#E8F5E9', icon: CheckCircle2 },
  delivered: { color: '#2E7D32', bgColor: '#E8F5E9', icon: CheckCircle2 },
  rejected: { color: '#E53935', bgColor: '#FFEBEE', icon: XCircle },
  cancelled: { color: '#E53935', bgColor: '#FFEBEE', icon: XCircle },
  under_review: { color: '#7C3AED', bgColor: '#EDE9FE', icon: Clock },
  in_process: { color: '#2563EB', bgColor: '#DBEAFE', icon: Loader2 },
  applied: { color: '#1A3C5E', bgColor: '#E8F0FE', icon: FileText },
}

export function StatusTimeline({ entries, currentStatus }: StatusTimelineProps) {
  if (!entries || entries.length === 0) return null

  return (
    <div className="relative">
      {/* Timeline entries */}
      <div className="space-y-0">
        {entries.map((entry, index) => {
          const config = statusConfig[entry.status] || statusConfig.pending
          const Icon = config.icon
          const isCurrent = entry.status === currentStatus
          const isLast = index === entries.length - 1
          const isCompleted = index < entries.findIndex(e => e.status === currentStatus)

          return (
            <motion.div
              key={`${entry.status}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="relative flex gap-4"
            >
              {/* Vertical line + Node */}
              <div className="flex flex-col items-center">
                {/* Node */}
                <motion.div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isCurrent ? 'border-current shadow-lg' : 'border-transparent'
                  }`}
                  style={{
                    backgroundColor: isCompleted ? config.bgColor : isCurrent ? config.bgColor : '#F3F4F6',
                    borderColor: isCurrent ? config.color : 'transparent',
                  }}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{
                      color: isCompleted || isCurrent ? config.color : '#9CA3AF',
                      animation: entry.status === 'in_progress' || entry.status === 'in_process' ? 'spin 1s linear infinite' : 'none',
                    }}
                  />
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: config.color, opacity: 0.15 }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>

                {/* Connecting line */}
                {!isLast && (
                  <div className="relative w-0.5 flex-1 min-h-[32px]">
                    <div className="absolute inset-0 bg-gray-200" />
                    {isCompleted && (
                      <motion.div
                        className="absolute top-0 left-0 w-full bg-gradient-to-b"
                        style={{ background: `linear-gradient(to bottom, ${config.color}, ${statusConfig[entries[index + 1]?.status]?.color || '#9CA3AF'})` }}
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: isCompleted || isCurrent ? config.color : '#9CA3AF' }}
                  >
                    {entry.label}
                  </p>
                  {isCurrent && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {new Date(entry.timestamp).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {entry.description && (
                  <p className="text-xs text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded-lg inline-block">
                    {entry.description}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Helper function to generate timeline entries from status history
export function generateTimelineFromStatus(
  status: string,
  createdAt: string,
  updatedAt: string,
  serviceType?: string
): TimelineEntry[] {
  const statusOrder = ['submitted', 'pending', 'in_progress', 'completed']
  const currentIdx = statusOrder.indexOf(status)
  const entries: TimelineEntry[] = []

  // Add initial submission
  entries.push({
    status: 'submitted',
    label: 'Application Submitted',
    timestamp: createdAt,
    description: serviceType ? `${serviceType} application submitted` : 'Application submitted',
  })

  if (status === 'rejected') {
    entries.push({
      status: 'rejected',
      label: 'Application Rejected',
      timestamp: updatedAt,
      description: 'Application was rejected',
    })
    return entries
  }

  // Add intermediate statuses
  for (let i = 1; i <= Math.min(currentIdx, statusOrder.length - 1); i++) {
    const s = statusOrder[i]
    const label = s === 'pending' ? 'Under Review' :
                  s === 'in_progress' ? 'Processing' :
                  s === 'completed' ? 'Completed' : s

    const desc = s === 'pending' ? 'Application is being reviewed' :
                 s === 'in_progress' ? 'Work in progress' :
                 s === 'completed' ? 'Service completed successfully' : ''

    entries.push({
      status: s,
      label,
      timestamp: i === currentIdx ? updatedAt : createdAt,
      description: desc,
    })
  }

  return entries
}
