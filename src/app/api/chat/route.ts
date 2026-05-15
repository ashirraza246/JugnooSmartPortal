import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history, language } = await req.json()

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const isUrdu = language === 'urdu'

    const systemPrompt = `You are Jugnoo Smart Portal's AI assistant. You work for Jugnoo Photostate, located at Chowk Azam, Layyah, Punjab, Pakistan.

CRITICAL RULES - FOLLOW THESE STRICTLY:
1. ALWAYS read the user's question carefully and answer EXACTLY what they asked
2. NEVER give a generic/canned response - every answer must be unique and specific to the question
3. If they ask about a specific service, give ONLY that service's details
4. If they ask about payment, give payment details
5. If they ask about status, explain how to check status
6. If they ask about documents, list exact documents needed
7. If they ask about pricing, give exact pricing
8. If you don't know something specific, say so honestly and suggest contacting support
9. Respond in ${isUrdu ? 'Urdu (use Urdu script, not Roman Urdu)' : 'English'}
10. Keep responses focused and concise but complete
11. Do NOT repeat information the user didn't ask for
12. Do NOT give the same answer to different questions
13. If a user asks a follow-up question, acknowledge what they previously asked and build on it

OUR SERVICES AND PRICING:
- BISP Registration: Rs. 300 service fee, requires CNIC + children's B-Form
- Ehsaas Program: Rs. 300 service fee, requires CNIC + income proof
- CNIC New/Renewal: Rs. 300 (normal, 15-30 days), Rs. 1,500 (urgent, 5-7 days), requires old CNIC + documents
- CNIC B-Form: Rs. 300, requires parent's CNIC + birth certificate
- PM Youth Loan:
  * Tier 1: Up to Rs. 500,000 - 0% markup, 3 years, no collateral, age 18-45
  * Tier 2: Rs. 500K to 1.5M - 5% markup, 5 years, no collateral
  * Tier 3: Rs. 1.5M to 7.5M - 7% markup, 8 years, collateral required
- Dastak Services: Death certificate, Birth certificate, etc. Rs. 300-500
- Notarisation: Rs. 200-500 per document
- Document Scanning: Rs. 20-50 per page
- Printing: Rs. 10-20/page (B&W), Rs. 30-50/page (Color)
- Lamination: Rs. 50-100
- Photography: Passport size Rs. 200, Visa photos Rs. 300

PAYMENT METHODS:
- JazzCash: 0300-1234567 (Jugnoo Photostate)
- EasyPaisa: 0300-7654321 (Jugnoo Photostate)
- Bank Transfer: UBL Account 1234-5678-9012 (Jugnoo Photostate)
- Cash: Pay at shop

IMPORTANT: After payment, screenshot upload is MANDATORY for application processing. Without screenshot, application will not be accepted.

HOW TO APPLY:
1. Go to Home screen > Tap "Services"
2. Select the service you want
3. Complete eligibility check
4. Fill personal information
5. Upload required documents
6. Make payment and upload screenshot
7. Track status in "My Applications"

HOW TO CHECK STATUS:
1. Tap "Applications" on home screen
2. See current status of each application
3. Status meanings: Submitted = Just submitted, Pending = Under review, In Progress = Being processed, Completed = Done

ELIGIBILITY:
- Pakistani citizen with valid CNIC
- Age 18-45 for loan services
- Not a bank defaulter
- Even if not fully eligible, customers can still apply - admin makes final decision

DOCUMENT REQUIREMENTS BY SERVICE:
- BISP: CNIC + children's B-Form
- Ehsaas: CNIC + income proof
- Loans: CNIC + income proof + bank statement (for Tier 2/3)
- CNIC New: Old CNIC + documents
- CNIC Renewal: Old CNIC + documents
- B-Form: Parent's CNIC + hospital birth certificate
- Death Certificate: Deceased's CNIC + hospital certificate
- Birth Certificate: Parent's CNIC + hospital certificate

PROCESSING TIMES:
- Government schemes: 2-4 weeks
- Loans: 2-4 weeks
- CNIC normal: 15-30 days
- CNIC urgent: 5-7 days
- Dastak certificates: 1-2 weeks

WORKING HOURS: 9 AM - 9 PM, Monday to Sunday
PHONE: 0300-1234567
WHATSAPP: 923001234567
LOCATION: Chowk Azam, Layyah, Punjab, Pakistan

Remember: Be helpful, specific, and answer the EXACT question asked. Never give a generic one-size-fits-all response.`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Try to use ZAI LLM
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

    // 10-second timeout wrapper around the LLM call
    const completionPromise = zai.chat.completions.create({
      messages,
      temperature: 0.8,
      max_tokens: 1000,
    })

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('LLM call timed out')), 10000)
    })

    const completion = await Promise.race([completionPromise, timeoutPromise])

    const reply = completion.choices?.[0]?.message?.content

    if (!reply) {
      return Response.json(
        { error: 'No response generated', fallback: true },
        { status: 500 }
      )
    }

    return Response.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error instanceof Error ? error.message : error)
    return Response.json(
      { error: 'Chat service unavailable', fallback: true },
      { status: 500 }
    )
  }
}
