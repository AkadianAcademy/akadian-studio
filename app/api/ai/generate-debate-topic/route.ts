import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const LEVEL_GUIDANCE: Record<string, string> = {
  A1: 'extremely simple, everyday topics a child could understand. Examples: Is coffee with sugar good? Do you prefer cats or dogs? Is it better to sleep early?',
  A2: 'simple real-life topics with clear opinions. Examples: Why is fast food popular? Is social media good for teenagers? Should students wear uniforms?',
  B1: 'everyday social topics with some complexity. Examples: Should public transport be free? Is working from home better than going to the office? Should animals be kept in zoos?',
  B2: 'complex social and environmental topics. Examples: Consequences of pollution on public health. Should universities be free? Is technology making us less social?',
  C1: 'sophisticated academic and philosophical topics. Examples: The ethical implications of artificial intelligence in healthcare. Should nations prioritize economic growth over environmental sustainability?',
  Conversation: 'engaging real-world conversation topics suitable for adult learners at various levels',
}

export async function POST(req: Request) {
  try {
    const { level, language, goal } = await req.json()
    const guidance = LEVEL_GUIDANCE[level] || LEVEL_GUIDANCE['B1']

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Generate ONE debate topic for a ${level} level ${language} class.
The lesson goal is: ${goal}

The topic must be: ${guidance}

Rules:
- One clear, debatable statement or question
- Appropriate complexity for ${level} level
- Can be debated with FOR and AGAINST positions
- Interesting and engaging for language learners
- 1-2 sentences maximum

Respond with ONLY the topic — no explanation, no quotes, no extra text.`
      }]
    })

    const topic = completion.choices[0]?.message?.content?.trim() || ''
    return NextResponse.json({ topic })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
