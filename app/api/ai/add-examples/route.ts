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

    const { vocab, level, language, title } = await req.json()

    const wordList = vocab.map((v: any) => `${v.word} / ${v.translation}`).join(', ')

    const prompt = `You are an expert language teacher creating example sentences.

Lesson: "${title}"
Level: ${level}
Vocabulary words: ${wordList}

Create 4 natural, practical bilingual example sentences using these vocabulary words.
Each sentence should be appropriate for ${level} level and feel like real-life conversation.

Respond ONLY with this JSON:
{
  "sentences": [
    { "source": "English sentence", "translation": "${language} translation" },
    { "source": "English sentence", "translation": "${language} translation" },
    { "source": "English sentence", "translation": "${language} translation" },
    { "source": "English sentence", "translation": "${language} translation" }
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

    return NextResponse.json({ sentences: parsed.sentences })
  } catch (e: any) {
    console.error('add-examples error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
