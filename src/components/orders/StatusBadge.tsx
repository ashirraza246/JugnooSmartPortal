'use client'

import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
  type?: 'order' | 'govt' | 'notarisation' | 'payment'
}

const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  delivered: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const govtStatusColors: Record<string, string> = {
  applied: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
}

const notarisationStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_process: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

export function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const safeStatus = status || 'pending'
  const colorMap = type === 'govt' ? govtStatusColors : type === 'notarisation' ? notarisationStatusColors : orderStatusColors

  return (
    <Badge variant="outline" className={`${colorMap[safeStatus] || 'bg-gray-100 text-gray-600'} text-xs`}>
      {safeStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </Badge>
  )
}

const priorityColors: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-600',
  urgent: 'bg-orange-100 text-orange-800',
  vip: 'bg-amber-100 text-amber-800',
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (!priority) return null

  return (
    <Badge variant="outline" className={`${priorityColors[priority] || 'bg-gray-100 text-gray-600'} text-xs`}>
      {priority.toUpperCase()}
    </Badge>
  )
}
