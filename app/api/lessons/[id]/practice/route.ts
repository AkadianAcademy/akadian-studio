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
    const { exerciseType, instructions, content, story, imagePrompt, imageStyle, debateStory, debateMoral, debatePersonal } = await req.json()

    await prisma.exercise.upsert({
      where: { lessonId: id },
      update: { type: exerciseType, instructions, content },
      create: { lessonId: id, type: exerciseType, instructions, content },
    })

    await prisma.story.upsert({
      where: { lessonId: id },
      update: { content: story, imageUrl: imagePrompt, imageStyle, debateStory, debateMoral, debatePersonal },
      create: { lessonId: id, content: story, imageUrl: imagePrompt, imageStyle, debateStory, debateMoral, debatePersonal },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Save practice error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
