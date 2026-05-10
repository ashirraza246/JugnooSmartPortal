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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExternalLink } from 'lucide-react'

interface SendTemplateDialogProps {
  open: boolean
  onClose: () => void
  template: {
    id: string
    name: string
    content: string
    variables: string | null
  } | null
  customers: { id: string; fullName: string; whatsapp: string | null }[]
  onSent: () => void
}

export function SendTemplateDialog({ open, onClose, template, customers, onSent }: SendTemplateDialogProps) {
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [waLink, setWaLink] = useState('')
  const [previewMessage, setPreviewMessage] = useState('')

  const variables = template?.variables ? template.variables.split(',').map((v) => v.trim()) : []

  const handleVariableChange = (key: string, value: string) => {
    const newVars = { ...variableValues, [key]: value }
    setVariableValues(newVars)

    // Update preview
    if (template) {
      let msg = template.content
      for (const [k, v] of Object.entries(newVars)) {
        msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), v || `{${k}}`)
      }
      setPreviewMessage(msg)
    }
  }

  const handleSend = async () => {
    if (!template || !selectedCustomer) return

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          customerId: selectedCustomer,
          variables: variableValues,
        }),
      })

      const data = await res.json()
      if (data.waLink) {
        setWaLink(data.waLink)
        window.open(data.waLink, '_blank')
        onSent()
      }
    } catch (error) {
      console.error('Send error:', error)
    }
  }

  const handleClose = () => {
    setSelectedCustomer('')
    setVariableValues({})
    setWaLink('')
    setPreviewMessage('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send via WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName} {c.whatsapp ? `(${c.whatsapp})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {variables.length > 0 && (
            <div>
              <Label>Fill in Variables</Label>
              <div className="space-y-2 mt-2">
                {variables.map((v) => (
                  <div key={v}>
                    <Label className="text-xs text-muted-foreground">{v}</Label>
                    <Input
                      value={variableValues[v] || ''}
                      onChange={(e) => handleVariableChange(v, e.target.value)}
                      placeholder={`Enter ${v}...`}
                      className="mt-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Message Preview</Label>
            <div className="mt-1 p-3 bg-emerald-50 rounded-lg text-sm whitespace-pre-wrap">
              {previewMessage || template?.content || 'Select a template first'}
            </div>
          </div>

          {waLink && (
            <div className="flex items-center gap-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open WhatsApp
              </a>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!selectedCustomer}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Send via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
