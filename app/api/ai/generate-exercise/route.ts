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

    const { exerciseType, vocab, level, language, title, goal, complexity } = await req.json()
    const wordList = vocab?.map((v: any) => v.word).join(', ') || ''

    const prompts: Record<string, string> = {
      'fill-in-blank': `Create a fill-in-the-blank exercise for a ${level} ${language} lesson titled "${title}".
Goal: ${goal}
Vocabulary: ${wordList}
Complexity: ${complexity}

Create sentences with blanks. Include word choices in parentheses.
Return JSON: { "instructions": "Choose the correct word to fill in each blank.", "content": "1. She needs to ___ her phone bill. (pay / refund / charge)\n2. ..." }`,

      'roleplay': `Create a roleplay exercise for a ${level} ${language} lesson titled "${title}".
Goal: ${goal}
Vocabulary: ${wordList}
Complexity: ${complexity}

Create a realistic scenario for 2 students with clear roles and objectives.
Return JSON: { "instructions": "Work in pairs. Student A plays [Role]. Student B plays [Role]. Use today's vocabulary.", "content": "Scenario: [detailed description]\n\nStudent A goal: ...\nStudent B goal: ..." }`,

      'translation': `Create a translation exercise for a ${level} ${language} lesson titled "${title}".
Goal: ${goal}
Vocabulary: ${wordList}
Complexity: ${complexity}

Create sentences in English to translate into ${language}.
Return JSON: { "instructions": "Translate these sentences into ${language}. Use the vocabulary from today's lesson.", "content": "1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n6. ..." }`,

      'multiple-choice': `Create a multiple choice exercise for a ${level} ${language} lesson titled "${title}".
Goal: ${goal}
Vocabulary: ${wordList}
Complexity: ${complexity}

Create 6 questions with 3 options each. Mark the correct answer with ✓.
Return JSON: { "instructions": "Choose the best answer for each question.", "content": "1. Question?\na) option\nb) correct option ✓\nc) option\n\n2. ..." }`,

      'open-conversation': `Create an open conversation exercise for a ${level} ${language} lesson titled "${title}".
Goal: ${goal}
Vocabulary: ${wordList}
Complexity: ${complexity}

Create 6 discussion questions that encourage natural use of vocabulary.
Return JSON: { "instructions": "Discuss these questions with a partner. Try to use today's vocabulary naturally.", "content": "1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n6. ..." }`,

      'listening': `Create a listening exercise for a ${level} ${language} lesson titled "${title}".
Goal: ${goal}
Vocabulary: ${wordList}
Complexity: ${complexity}

Create a detailed audio scenario with 6 comprehension questions.
Return JSON: { "instructions": "Listen carefully to the scenario. Then answer the questions.", "content": "Audio scenario:\n[detailed scene description that teacher reads aloud]\n\nComprehension questions:\n1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n6. ..." }`,
    }

    const prompt = prompts[exerciseType] || prompts['roleplay']

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const parsed = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json({ instructions: parsed.instructions, content: parsed.content })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
