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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const lesson = await prisma.lesson.findUnique({ where: { id }, select: { userId: true } })
    if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (lesson.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.curriculumLesson.deleteMany({ where: { lessonId: id } })
    await prisma.debate.deleteMany({ where: { lessonId: id } })
    await prisma.vocab.deleteMany({ where: { lessonId: id } })
    await prisma.exampleSentence.deleteMany({ where: { lessonId: id } })
    await prisma.exercise.deleteMany({ where: { lessonId: id } })
    await prisma.story.deleteMany({ where: { lessonId: id } })
    await prisma.canvas.deleteMany({ where: { lessonId: id } })
    await prisma.lesson.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Delete lesson error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
