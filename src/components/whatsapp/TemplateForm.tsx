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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TemplateFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; category: string; content: string; variables: string }) => void
  initialData?: {
    id: string
    name: string
    category: string
    content: string
    variables: string | null
  }
}

const categories = ['order', 'payment', 'govt', 'scholarship', 'loan', 'bisp', 'followup', 'promo', 'general', 'notarisation']

export function TemplateForm({ open, onClose, onSubmit, initialData }: TemplateFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [category, setCategory] = useState(initialData?.category || 'general')
  const [content, setContent] = useState(initialData?.content || '')

  const handleSubmit = () => {
    if (!name.trim() || !content.trim()) return

    // Extract variables from content
    const varMatches = content.match(/\{([^}]+)\}/g) || []
    const variables = varMatches.map((v) => v.replace(/[{}]/g, '')).join(',')

    onSubmit({ name, category, content, variables })
    onClose()
    setName('')
    setCategory('general')
    setContent('')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tpl-name">Template Name</Label>
            <Input
              id="tpl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Order Confirmation"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tpl-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tpl-content">Content</Label>
            <Textarea
              id="tpl-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Template content with {variables} in curly braces..."
              rows={6}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{variable_name}'} for dynamic content. E.g. {'{customer_name}'}, {'{amount}'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !content.trim()}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
