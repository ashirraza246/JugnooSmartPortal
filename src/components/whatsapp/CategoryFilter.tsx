'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  counts?: Record<string, number>
}

const categoryLabels: Record<string, string> = {
  all: 'All',
  order: 'Orders',
  payment: 'Payment',
  govt: 'Govt',
  scholarship: 'Scholarship',
  loan: 'Loan',
  bisp: 'BISP',
  followup: 'Follow-up',
  promo: 'Promotions',
  general: 'General',
  notarisation: 'Notarisation',
}

export function CategoryFilter({ categories, activeCategory, onSelect, counts }: CategoryFilterProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2 text-sm font-medium h-9',
              activeCategory === cat
                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/15'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onSelect(cat)}
          >
            <MessageSquare className="w-4 h-4" />
            {categoryLabels[cat] || cat}
            {counts && counts[cat] !== undefined && (
              <span className="ml-auto text-xs bg-muted rounded-full px-2 py-0.5">
                {counts[cat]}
              </span>
            )}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
