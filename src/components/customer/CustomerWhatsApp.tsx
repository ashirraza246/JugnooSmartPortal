'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, Send, Star, Loader2, Phone } from 'lucide-react'

const templateCategories = [
  { id: 'all', label: 'Sab' },
  { id: 'greeting', label: 'Greetings' },
  { id: 'business', label: 'Business' },
  { id: 'service', label: 'Service' },
  { id: 'payment', label: 'Payment' },
  { id: 'follow_up', label: 'Follow Up' },
]

const quickTemplates = [
  { name: 'Service Inquiry', category: 'service', content: 'Assalam-o-Alaikum! Mujhe {service_name} ke liye apply karna hai. Kya details bata sakte hain?', variables: ['service_name'] },
  { name: 'Payment Query', category: 'payment', content: 'Assalam-o-Alaikum! Mera payment {amount} Rs hai. Kya confirm kar sakte hain?', variables: ['amount'] },
  { name: 'Status Check', category: 'follow_up', content: 'Assalam-o-Alaikum! Meri application {application_id} ka status kya hai?', variables: ['application_id'] },
  { name: 'Document Submission', category: 'service', content: 'Assalam-o-Alaikum! Main apne documents {service_name} ke liye submit karna chahta hoon.', variables: ['service_name'] },
  { name: 'Thank You', category: 'greeting', content: 'Shukriya Jugnoo Photostate! Aapki service bohat achi hai.', variables: [] },
  { name: 'Appointment Request', category: 'service', content: 'Assalam-o-Alaikum! Kya {date} ko {time} par appointment mil sakti hai {service_name} ke liye?', variables: ['date', 'time', 'service_name'] },
  { name: 'Scholarship Inquiry', category: 'service', content: 'Mujhe {scholarship_name} scholarship ke liye apply karna hai. Kya help mil sakti hai?', variables: ['scholarship_name'] },
  { name: 'Loan Application', category: 'service', content: 'Main {loan_type} loan apply karna chahta hoon. Kya process bata sakte hain?', variables: ['loan_type'] },
  { name: 'BISP Payment', category: 'payment', content: 'Mera BISP payment {quarter} ka pending hai. Kya check kar sakte hain?', variables: ['quarter'] },
  { name: 'Order Status', category: 'follow_up', content: 'Mera order {order_number} ka status kya hai? Kya ready hai?', variables: ['order_number'] },
  { name: 'Printing Order', category: 'service', content: 'Mujhe {document_type} print karwana hai {quantity} copies. Kya rate bata sakte hain?', variables: ['document_type', 'quantity'] },
  { name: 'Notarisation Query', category: 'service', content: 'Mujhe {document_type} ke liye notarisation chahiye. Kya documents laane honge?', variables: ['document_type'] },
  { name: 'Ramadan Greeting', category: 'greeting', content: 'Ramadan Mubarak! Jugnoo Photostate ki taraf se mubarakbad.', variables: [] },
  { name: 'Eid Greeting', category: 'greeting', content: 'Eid Mubarak! Jugnoo Photostate poori team ki taraf se!', variables: [] },
  { name: 'New Service', category: 'business', content: 'Assalam-o-Alaikum! Kya Jugnoo Photostate {service_name} service provide karta hai?', variables: ['service_name'] },
]

export function CustomerWhatsApp() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof quickTemplates[0] | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [whatsappNumber, setWhatsappNumber] = useState('')

  const { data: dbTemplates, isLoading } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/whatsapp/templates')
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } catch {
        return []
      }
    },
    retry: false,
  })

  const allTemplates = [
    ...quickTemplates,
    ...(Array.isArray(dbTemplates) ? dbTemplates.map((t: { id: string; name: string; category: string; content: string; variables: string }) => ({
      id: t.id,
      name: t.name,
      category: t.category || 'business',
      content: t.content,
      variables: t.variables ? t.variables.split(',').map((v: string) => v.trim()) : [],
    })) : []),
  ]

  const filteredTemplates = allTemplates.filter(t => {
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const getPreviewMessage = () => {
    if (!selectedTemplate) return ''
    let msg = selectedTemplate.content
    for (const [key, val] of Object.entries(variableValues)) {
      msg = msg.replace(`{${key}}`, val || `[${key}]`)
    }
    return msg
  }

  const handleSend = () => {
    if (!whatsappNumber) return
    const message = encodeURIComponent(getPreviewMessage())
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">WhatsApp Messages</h2>
        <p className="text-muted-foreground">Templates use karke asaani se message bhejein</p>
      </div>

      {/* Search + Categories */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Template search karein..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {templateCategories.map(cat => (
            <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm"
              className={selectedCategory === cat.id ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : ''}
              onClick={() => setSelectedCategory(cat.id)}>
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTemplates.map((template, idx) => (
                <Card key={template.id || idx} className={`cursor-pointer hover:shadow-md transition-all border-0 shadow-sm ${selectedTemplate === template ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => { setSelectedTemplate(template); setVariableValues({}) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold">{template.name}</h4>
                      <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{template.content}</p>
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.variables.map(v => (
                          <span key={v} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">{`{${v}}`}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Send Panel */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm sticky top-4">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-semibold">Message Bhejein</h3>
              </div>

              {selectedTemplate ? (
                <>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium mb-1">Selected: {selectedTemplate.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTemplate.content}</p>
                  </div>

                  {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Variables fill karein:</p>
                      {selectedTemplate.variables.map(v => (
                        <div key={v}>
                          <label className="text-xs text-muted-foreground">{v}</label>
                          <Input value={variableValues[v] || ''} onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })} placeholder={`${v} likhein...`} className="h-8 text-sm" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium">WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="923001234567" className="pl-9 h-9" />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs font-medium text-emerald-700 mb-1">Preview:</p>
                    <p className="text-xs text-emerald-900">{getPreviewMessage()}</p>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white" onClick={handleSend} disabled={!whatsappNumber}>
                    <Send className="w-4 h-4 mr-2" /> WhatsApp par Bhejein
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-muted-foreground">Pehle koi template select karein</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
