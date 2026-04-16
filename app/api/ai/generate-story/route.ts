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

const STORY_SPECS: Record<string, { paragraphs: number, style: string }> = {
  'A1': {
    paragraphs: 2,
    style: `Very simple sentences only. Subject-verb-object structure. Present tense. 
    Maximum 8 words per sentence. Common everyday vocabulary only. 
    No idioms, no complex grammar. Like reading to a child learning to read.
    Each paragraph is 2-3 short sentences.`
  },
  'A2': {
    paragraphs: 4,
    style: `Simple but slightly more developed. Mix of present and simple past tense.
    Short paragraphs of 3-4 sentences each. Basic connectors like "and", "but", "then", "because".
    Vocabulary stays everyday and practical. Some basic descriptions allowed.
    The story has a clear beginning, middle, and end.`
  },
  'B1': {
    paragraphs: 6,
    style: `Intermediate complexity. Mixed tenses including present perfect and past continuous.
    Connectors like "however", "although", "meanwhile", "as a result".
    Richer descriptions of settings, emotions, and characters.
    Each paragraph 4-5 sentences. Some idiomatic expressions that are widely understood.
    The story has depth — show character motivations and reactions.`
  },
  'B2': {
    paragraphs: 6,
    style: `Upper-intermediate. Rich, expressive language. Full range of tenses.
    Sophisticated connectors and discourse markers.
    Vivid sensory details — what the character sees, hears, feels, smells.
    Idiomatic expressions, collocations, nuanced vocabulary.
    Each paragraph 5-6 sentences. Complex sentence structures.
    Show internal conflict, subtext, and emotional complexity.
    The story feels like something from a quality short story collection.`
  },
  'C1': {
    paragraphs: 6,
    style: `Advanced. Sophisticated literary quality. Varied sentence length for rhythm and effect.
    Rich figurative language — metaphors, imagery, symbolism where natural.
    Complex emotions, moral ambiguity, layered meaning.
    Advanced vocabulary, precise word choice, register awareness.
    Each paragraph 5-7 sentences. The story lingers with the reader.
    Think of the style of literary journalism — true to life but beautifully written.`
  },
  'Conversation': {
    paragraphs: 4,
    style: `Natural spoken feel. Some informal language and everyday expressions.
    Dialogue-heavy — show how people actually speak to each other.
    Contractions, informal phrasing, conversational flow.
    The story feels like something that happened to a friend.
    Each paragraph 3-5 sentences mixing narration and reported speech.`
  },
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, level, language, goal, vocab, imageStyle } = await req.json()
    const wordList = vocab?.map((v: any) => v.word).join(', ') || ''
    const spec = STORY_SPECS[level] || STORY_SPECS['A2']

    const prompt = `You are a master storyteller creating educational content for language learners.

Lesson: "${title}"
Level: ${level}
Goal: ${goal}
Vocabulary to weave in naturally: ${wordList}
Image style: ${imageStyle || 'photorealistic'}

STORY REQUIREMENTS:
- Write exactly ${spec.paragraphs} paragraphs
- Style guide: ${spec.style}
- Use at least 6 of the vocabulary words naturally woven into the story
- The main character must be a real, named person facing a relatable real-life situation
- The story must directly connect to the lesson goal: "${goal}"
- Every paragraph should move the story forward
- The ending should feel emotionally satisfying or thought-provoking
- DO NOT use the vocabulary words as if highlighting them — they should feel completely natural

IMAGE PROMPT REQUIREMENTS:
- Describe the most visually striking moment from the story
- Style: ${imageStyle || 'photorealistic'}
- Include: setting details, lighting, mood, character description
- Format: "[scene], ${imageStyle || 'photorealistic'}, [lighting details], [mood/atmosphere], highly detailed"

Return ONLY this JSON (no extra text):
{
  "story": "Full ${spec.paragraphs}-paragraph story here...",
  "imagePrompt": "Detailed image generation prompt here..."
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.85,
      max_tokens: 2000,
    })

    const parsed = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json({ story: parsed.story, imagePrompt: parsed.imagePrompt })
  } catch (e: any) {
    console.error('generate-story error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
