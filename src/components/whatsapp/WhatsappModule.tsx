'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryFilter } from './CategoryFilter'
import { TemplateCard } from './TemplateCard'
import { TemplateForm } from './TemplateForm'
import { SendTemplateDialog } from './SendTemplateDialog'
import { Plus, Search, LayoutGrid, List, Star } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

const ALL_CATEGORIES = ['all', 'order', 'payment', 'govt', 'scholarship', 'loan', 'bisp', 'followup', 'promo', 'general', 'notarisation']

export function WhatsappModule() {
  const { searchQuery } = useAppStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string; name: string; category: string; content: string; variables: string | null
  } | null>(null)
  const [sendTemplate, setSendTemplate] = useState<{
    id: string; name: string; content: string; variables: string | null
  } | null>(null)

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['whatsapp-templates', activeCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activeCategory !== 'all') params.set('category', activeCategory)
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch(`/api/whatsapp/templates?${params}`)
      if (!res.ok) throw new Error('Failed to fetch templates')
      return res.json()
    },
  })

  // API returns { templates: [...], total: N } - extract the array
  const templates = Array.isArray(templatesData) ? templatesData : (templatesData?.templates || [])

  const { data: customersData } = useQuery({
    queryKey: ['customers-brief'],
    queryFn: async () => {
      const res = await fetch('/api/customers')
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json()
    },
  })

  // API may return object with customers array or direct array
  const customers = Array.isArray(customersData) ? customersData : (customersData?.customers || [])

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; category: string; content: string; variables: string }) => {
      const res = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast({ title: 'Template created!' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; category: string; content: string; variables: string }) => {
      const { id, ...rest } = data
      const res = await fetch('/api/whatsapp/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...rest }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast({ title: 'Template updated!' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/whatsapp/templates?id=${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast({ title: 'Template deleted!' })
    },
  })

  const favoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const res = await fetch('/api/whatsapp/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isFavorite }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
    },
  })

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length }
    templates.forEach((t: { category: string }) => {
      counts[t.category] = (counts[t.category] || 0) + 1
    })
    return counts
  }, [templates])

  return (
    <div className="flex gap-4 h-full">
      {/* Category sidebar */}
      <div className="hidden md:block w-48 shrink-0">
        <Card className="h-full">
          <CardHeader className="pb-2 pt-4 px-3">
            <CardTitle className="text-sm font-semibold">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CategoryFilter
              categories={ALL_CATEGORIES}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
              counts={categoryCounts}
            />
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {activeCategory === 'all' ? 'All Templates' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Templates`}
            </h3>
            <span className="text-sm text-muted-foreground">({templates.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === 'grid' ? 'bg-muted' : ''}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === 'list' ? 'bg-muted' : ''}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {
                setEditingTemplate(null)
                setShowForm(true)
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No templates found.</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setShowForm(true)}
            >
              Create your first template
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'space-y-2'
          }>
            {templates.map((template: {
              id: string; name: string; category: string; content: string; variables: string | null; isFavorite: boolean; usageCount: number; createdAt: string
            }) => (
              <TemplateCard
                key={template.id}
                template={template}
                onFavorite={(id, fav) => favoriteMutation.mutate({ id, isFavorite: fav })}
                onSend={(tpl) => setSendTemplate(tpl)}
                onEdit={(tpl) => {
                  setEditingTemplate(tpl as typeof editingTemplate)
                  setShowForm(true)
                }}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Template Dialog */}
      <TemplateForm
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingTemplate(null)
        }}
        onSubmit={(data) => {
          if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, ...data })
          } else {
            createMutation.mutate(data)
          }
        }}
        initialData={editingTemplate || undefined}
      />

      {/* Send Template Dialog */}
      <SendTemplateDialog
        open={!!sendTemplate}
        onClose={() => setSendTemplate(null)}
        template={sendTemplate}
        customers={customers.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          fullName: (c.fullName as string) || (c.full_name as string) || '',
          whatsapp: (c.whatsapp as string) || null,
        }))}
        onSent={() => {
          queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
          toast({ title: 'Message sent via WhatsApp!' })
        }}
      />
    </div>
  )
}
