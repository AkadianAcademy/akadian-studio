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

    const { story, title, level, goal, complexity } = await req.json()

    const prompt = `You are an expert language teacher creating discussion questions.

Lesson: "${title}"
Level: ${level}
Goal: ${goal}
Complexity: ${complexity}
Story: "${story}"

Create 3 sets of 2 debate/discussion questions each, perfectly calibrated to ${level} level:

1. About the story — factual questions about what happened (simple recall for low levels, inference for high levels)
2. About the moral — questions about meaning and values (simple for low levels, philosophical for high levels)
3. Personal opinions — questions connecting to their own life (guided for low levels, open-ended for high levels)

Return JSON:
{
  "debateStory": "1. Question?\n2. Question?",
  "debateMoral": "1. Question?\n2. Question?",
  "debatePersonal": "1. Question?\n2. Question?"
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const parsed = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json({
      debateStory: parsed.debateStory,
      debateMoral: parsed.debateMoral,
      debatePersonal: parsed.debatePersonal,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
