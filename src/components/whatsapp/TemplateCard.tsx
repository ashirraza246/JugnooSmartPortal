'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Send, Pencil, Trash2, Copy } from 'lucide-react'
import { useState } from 'react'

interface TemplateCardProps {
  template: {
    id: string
    name: string
    category: string
    content: string
    variables: string | null
    isFavorite: boolean
    usageCount: number
    createdAt: string
  }
  onFavorite: (id: string, fav: boolean) => void
  onSend: (template: { id: string; name: string; content: string; variables: string | null }) => void
  onEdit: (template: { id: string; name: string; category: string; content: string; variables: string | null }) => void
  onDelete: (id: string) => void
}

const categoryColors: Record<string, string> = {
  order: 'bg-amber-100 text-amber-800',
  payment: 'bg-emerald-100 text-emerald-800',
  govt: 'bg-purple-100 text-purple-800',
  scholarship: 'bg-sky-100 text-sky-800',
  loan: 'bg-teal-100 text-teal-800',
  bisp: 'bg-rose-100 text-rose-800',
  followup: 'bg-orange-100 text-orange-800',
  promo: 'bg-pink-100 text-pink-800',
  general: 'bg-gray-100 text-gray-800',
  notarisation: 'bg-indigo-100 text-indigo-800',
}

export function TemplateCard({ template, onFavorite, onSend, onEdit, onDelete }: TemplateCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{template.name}</h3>
              <Badge className={`${categoryColors[template.category] || 'bg-gray-100 text-gray-800'} text-[10px] px-1.5 py-0`}>
                {template.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {template.content}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavorite(template.id, !template.isFavorite)
            }}
            className="shrink-0"
          >
            <Star
              className={`w-4 h-4 ${template.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-400'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">
            Used {template.usageCount} times
          </span>
          <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onSend(template)
              }}
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(template)
              }}
            >
              <Pencil className="w-3.5 h-3.5 text-amber-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(template.id)
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
