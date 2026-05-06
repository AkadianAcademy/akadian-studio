import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const LEVEL_CONFIG: Record<string, { words: string; complexity: string; sentences: string }> = {
  A1: { words: '80-120', complexity: 'very simple sentences, basic vocabulary, present tense only', sentences: '2-3 sentences per section' },
  A2: { words: '120-180', complexity: 'simple sentences, common vocabulary, present and past tense', sentences: '3-4 sentences per section' },
  B1: { words: '200-280', complexity: 'compound sentences, varied vocabulary, multiple tenses', sentences: '4-5 sentences per section' },
  B2: { words: '300-400', complexity: 'complex sentences, academic vocabulary, passive voice, conditionals', sentences: '5-6 sentences per section' },
  C1: { words: '450-600', complexity: 'sophisticated structures, advanced vocabulary, nuanced arguments, hedging language', sentences: '6-8 sentences per section' },
  Conversation: { words: '200-300', complexity: 'natural conversational language, engaging and accessible', sentences: '4-5 sentences per section' },
}

export async function POST(req: Request) {
  try {
    const { topic, level, language } = await req.json()
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG['B1']

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a debate preparation article for ${level} level ${language} students about this topic:
"${topic}"

Structure (use these EXACT section headers):
INTRODUCTION:
[brief context paragraph]

IN FAVOUR:
[arguments supporting the topic]

AGAINST:
[arguments opposing the topic]

CONCLUSION:
[balanced closing thoughts]

Requirements:
- Total length: ${config.words} words
- Language complexity: ${config.complexity}
- Each section: ${config.sentences}
- Written IN ${language}
- Engaging and educational
- Balanced — present both sides fairly

Respond with ONLY the article using the exact section headers above.`
      }]
    })

    const article = completion.choices[0]?.message?.content?.trim() || ''
    return NextResponse.json({ article })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
