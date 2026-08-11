import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { word } = await req.json()
    if (!word || typeof word !== 'string') return NextResponse.json({ error: 'No word' }, { status: 400 })
    const prompt = `A language learner double-clicked the word or short phrase "${word}" while reading a story.
Detect the language of the word. Provide:
- a very simple, short definition (one sentence, easy words a beginner understands),
- one short, natural example sentence that uses the word.
Write BOTH the definition and the example in the SAME language as the word. Keep it concise.
Return ONLY JSON: { "definition": "...", "example": "..." }`
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })
    const parsed = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json({ definition: parsed.definition || '', example: parsed.example || '' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
