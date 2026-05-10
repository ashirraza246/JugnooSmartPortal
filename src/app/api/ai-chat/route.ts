import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, systemPrompt } = body

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    // Use z-ai-web-dev-sdk (backend only)
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const messages = [
      {
        role: 'assistant' as const,
        content: systemPrompt || 'You are a professional document writer. Write formal, well-structured documents ready for printing and official use.',
      },
      {
        role: 'user' as const,
        content: message,
      },
    ]

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    })

    const response = completion.choices?.[0]?.message?.content || 'Unable to generate document. Please try again.'

    return Response.json({ response })
  } catch (error) {
    console.error('AI Chat error:', error)
    return Response.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}
