import { createClient } from '@supabase/supabase-js'
import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'

async function getUserFromRequest(req: Request) {
  try {
    const auth = req.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) return null
    const token = auth.replace('Bearer ', '').trim()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    return user
  } catch { return null }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, level, language, goal } = await req.json()

    const prompt = `You are an expert language teacher selecting vocabulary for a lesson.

PRIMARY GOAL (most important — base your vocabulary on this):
"${goal}"

Supporting context:
- Lesson title: "${title}"
- Target language: ${language}
- Student level: ${level}

Your job: Select exactly 8 vocabulary words that a student NEEDS to accomplish the goal above.
Ask yourself: "What words will this student actually use when doing what the goal describes?"

Rules:
- Words must be directly useful for the goal scenario
- Perfectly matched to ${level} level — not too easy, not too hard
- Real-world practical words, not textbook generic ones
- Each word should feel essential, not just related

Respond ONLY with this exact JSON:
{
  "vocab": [
    { "word": "English word", "translation": "${language} translation" },
    { "word": "English word", "translation": "${language} translation" },
    { "word": "English word", "translation": "${language} translation" },
    { "word": "English word", "translation": "${language} translation" },
    { "word": "English word", "translation": "${language} translation" },
    { "word": "English word", "translation": "${language} translation" },
    { "word": "English word", "translation": "${language} translation" },
    { "word": "English word", "translation": "${language} translation" }
  ]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content || '{}'
    const parsed = JSON.parse(content)

    let vocab = []
    if (Array.isArray(parsed.vocab)) vocab = parsed.vocab
    else if (Array.isArray(parsed.vocabulary)) vocab = parsed.vocabulary
    else if (Array.isArray(parsed.words)) vocab = parsed.words
    else {
      const firstArray = Object.values(parsed).find(v => Array.isArray(v))
      if (firstArray) vocab = firstArray as any[]
    }

    return NextResponse.json({ vocab })
  } catch (e: any) {
    console.error('suggest-vocab error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
