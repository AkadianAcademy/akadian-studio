import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const curriculum = await prisma.curriculum.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        lessons: {
          include: {
            lesson: {
              include: {
                vocab: true,
                exercise: true,
                story: true,
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })
    if (!curriculum) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ curriculum })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await prisma.curriculumLesson.deleteMany({ where: { curriculumId: id } })
    await prisma.curriculum.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const existing = await prisma.curriculum.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await req.json()
    if (Array.isArray(body.lessonIds)) {
      const ids: string[] = body.lessonIds.filter((x: any) => typeof x === 'string')
      await prisma.curriculumLesson.deleteMany({ where: { curriculumId: id } })
      if (ids.length) {
        await prisma.curriculumLesson.createMany({
          data: ids.map((lessonId, i) => ({ curriculumId: id, lessonId, order: i }))
        })
      }
    }
    const data: any = {}
    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
    if (typeof body.description === 'string') data.description = body.description
    if (Object.keys(data).length) await prisma.curriculum.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
