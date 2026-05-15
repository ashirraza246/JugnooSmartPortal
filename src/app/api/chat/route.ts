import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history, language } = await req.json()

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const systemPrompt = `You are Jugnoo Smart Portal's AI assistant for Jugnoo Photostate, located at Chowk Azam, Layyah, Punjab, Pakistan.

CRITICAL RULES:
1. ALWAYS answer the SPECIFIC question asked - never give a generic answer
2. If the user asks about a specific service, give details about THAT service only
3. If you don't know the exact answer, say so honestly and suggest contacting WhatsApp support
4. Respond in ${language === 'urdu' ? 'Roman Urdu' : 'English'}
5. Keep responses concise but complete - don't skip important details
6. Never repeat the same generic answer for different questions

OUR SERVICES:
- BISP Registration: Rs. 300 service fee, requires CNIC, B-Form for children
- Ehsaas Program: Rs. 300 service fee, requires CNIC and income proof
- CNIC New/Renewal: Rs. 300 (normal), Rs. 1,500 (urgent), requires old CNIC + documents
- CNIC B-Form: Rs. 300, requires parent's CNIC + birth certificate
- Bank Loans (PM Youth Loan): Tier 1 up to 500K (0% markup), Tier 2 up to 1.5M (5%), Tier 3 up to 7.5M (7%)
- Dastak Services: Death certificate, Birth certificate, etc. Rs. 300-500
- Notarisation: Rs. 200-500 per document
- Document Scanning: Rs. 20-50 per page
- Printing: Rs. 10-20 per page (B&W), Rs. 30-50 (Color)
- Lamination: Rs. 50-100
- Photography: Passport size Rs. 200, Visa photos Rs. 300

PAYMENT METHODS:
- JazzCash: 0300-1234567 (Jugnoo Photostate)
- EasyPaisa: 0300-7654321 (Jugnoo Photostate)
- Bank Transfer: UBL Account 1234-5678-9012 (Jugnoo Photostate)
- Cash: Pay at shop

WORKING HOURS: 9 AM - 9 PM, Monday to Sunday
PHONE: 0300-1234567
WHATSAPP: 923001234567

IMPORTANT: After payment, screenshot upload is MANDATORY for application processing.

ELIGIBILITY:
- Pakistani citizen with valid CNIC
- Age 18-45 for loan services
- Not a bank defaulter
- Even if not fully eligible, customers can still apply - admin makes the final decision

LOAN DETAILS:
- Tier 1: Up to Rs. 500,000 - 0% markup, 3 years repayment, no collateral
- Tier 2: Rs. 500K to Rs. 1.5M - 5% markup, 5 years repayment, no collateral
- Tier 3: Rs. 1.5M to Rs. 7.5M - 7% markup, 8 years repayment, collateral required

PROCESSING TIMES:
- Government scheme applications: 2-4 weeks
- Loan applications: 2-4 weeks
- CNIC normal: 15-30 days, CNIC urgent: 5-7 days
- Dastak certificates: 1-2 weeks

DOCUMENT REQUIREMENTS:
- Most services require: CNIC copy, passport-size photos
- BISP: CNIC + children's B-Form
- Loans: CNIC + income proof + bank statement (for Tier 2/3)
- CNIC renewal: Old CNIC + documents
- Birth certificate: Parent's CNIC + hospital certificate`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Try to use ZAI with timeout wrapper
    let ZAI: any = null
    try {
      ZAI = (await import('z-ai-web-dev-sdk')).default
    } catch (importError) {
      console.error('Failed to import z-ai-web-dev-sdk:', importError)
      return Response.json(
        { error: 'Chat service unavailable', fallback: true },
        { status: 503 }
      )
    }

    let zai: any
    try {
      zai = await ZAI.create()
    } catch (createError) {
      console.error('Failed to create ZAI instance:', createError)
      return Response.json(
        { error: 'Chat service unavailable', fallback: true },
        { status: 503 }
      )
    }

    // 5-second timeout wrapper around the LLM call
    const completionPromise = zai.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 800,
    })

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('LLM call timed out after 5 seconds')), 5000)
    })

    const completion = await Promise.race([completionPromise, timeoutPromise])

    const reply = completion.choices?.[0]?.message?.content || 'Sorry, I could not process your request. Please try again or contact us on WhatsApp at 923001234567.'

    return Response.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error instanceof Error ? error.message : error)
    return Response.json(
      { error: 'Chat service unavailable', fallback: true },
      { status: 500 }
    )
  }
}
