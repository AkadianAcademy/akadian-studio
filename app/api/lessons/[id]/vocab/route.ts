import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { vocab, sentences } = await req.json()

    console.log('Saving vocab for lesson:', id, 'vocab count:', vocab?.length, 'sentences:', sentences?.length)

    await prisma.vocab.deleteMany({ where: { lessonId: id } })
    await prisma.exampleSentence.deleteMany({ where: { lessonId: id } })

    if (vocab?.length) {
      await prisma.vocab.createMany({
        data: vocab.map((v: any) => ({
          lessonId: id,
          word: v.word,
          translation: v.translation,
        }))
      })
    }

    if (sentences?.length) {
      await prisma.exampleSentence.createMany({
        data: sentences.map((s: any) => ({
          lessonId: id,
          source: s.source,
          translation: s.translation,
        }))
      })
    }

    console.log('Vocab saved successfully!')
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Save vocab error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
