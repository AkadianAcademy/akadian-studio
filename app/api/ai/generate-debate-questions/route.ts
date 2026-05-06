import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { topic, article, level, language } = await req.json()

    const completion = await openai.chat.completions.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Generate debate questions for ${level} level ${language} students based on this article about: "${topic}"

Article: ${article}

Generate exactly 3 sections with 2-3 questions each:

COMPREHENSION:
[Questions testing if students understood the article]

POSITION:
[Questions asking students to choose a side: are you FOR or AGAINST? Why?]

OPINIONS & VIEWPOINTS:
[Open opinion questions connecting to their personal experience and world view]

Requirements:
- Questions appropriate for ${level} level
- Written in ${language}
- Engaging and thought-provoking
- Encourage speaking and discussion
- Use these EXACT section headers

Respond with ONLY the questions using the exact headers above.`
      }]
    })

    const questions = completion.choices[0]?.message?.content?.trim() || ''
    return NextResponse.json({ questions })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
