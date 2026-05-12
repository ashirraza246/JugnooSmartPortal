import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history, language } = await req.json()

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    // Use z-ai-web-dev-sdk (backend only)
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const systemPrompt = `You are Jugnoo Smart Portal's AI assistant. You help customers with:
- Government services (BISP, Ehsaas, CNIC, etc.)
- Bank services (loan applications, account opening)
- Document services (notarisation, attestation)
- Payment inquiries
- Application status tracking

Always respond in ${language === 'urdu' ? 'Roman Urdu / Urdu' : 'English'}.
Be helpful, concise, and professional. If you don't know something specific about Jugnoo's services, suggest the customer contact support via WhatsApp.

Business info:
- Name: Jugnoo Photostate
- Location: Chowk Azam, Layyah, Punjab, Pakistan
- Services: Govt schemes, Bank loans, CNIC services, Document preparation, Notarisation, Printing/Scanning
- Payment methods: JazzCash, EasyPaisa, Bank Transfer
- Working hours: 9 AM - 9 PM

Loan tiers:
- Tier 1: Up to Rs. 500K - 0% markup, 3 years
- Tier 2: Rs. 500K to 1.5M - 5% markup, 5 years
- Tier 3: Rs. 1.5M to 7.5M - 7% markup, 8 years

Fee information:
- Govt schemes: Rs. 300-500
- Loan services: Rs. 1,000-1,500
- CNIC services: Rs. 300 (normal), Rs. 1,500 (urgent)
- Printing/Scanning: Varies by service

Eligibility criteria:
- Pakistani citizen with valid CNIC
- Age requirement varies (typically 18-45 for loans)
- Not a bank defaulter
- Even if not eligible, customers can still apply - final decision is by admin

Keep responses concise and actionable. Use bullet points when helpful.`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const reply = completion.choices?.[0]?.message?.content || 'Sorry, I could not process your request. Please try again or contact us on WhatsApp.'

    return Response.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      { error: 'Chat service unavailable', fallback: true },
      { status: 500 }
    )
  }
}
