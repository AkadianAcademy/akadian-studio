import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { topic, article, level, language } = await req.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Extract 6-8 key terms, phrases or expressions from this debate article that ${level} level students need to understand.

Topic: ${topic}
Article: ${article}

For each term provide:
- The term/phrase in ${language}
- Spanish translation
- Brief meaning in simple ${language}

Respond ONLY in this exact JSON format:
[
  {"term": "example term", "translation": "traducción", "meaning": "brief explanation"},
  {"term": "another term", "translation": "otra traducción", "meaning": "brief explanation"}
]

No other text, just the JSON array.`
      }]
    })

    let content = completion.choices[0]?.message?.content?.trim() || '[]'
    content = content.replace(/```json|```/g, '').trim()
    const terms = JSON.parse(content)
    return NextResponse.json({ terms })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
