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

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ curricula: [] })
    const curricula = await prisma.curriculum.findMany({
      where: { userId: user.id },
      include: {
        lessons: {
          include: { lesson: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ curricula })
  } catch (e: any) {
    return NextResponse.json({ curricula: [] })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { title, description, subject, lessonIds } = await req.json()

    const curriculum = await prisma.curriculum.create({
      data: {
        userId: user.id,
        title,
        description: description || '',
        subject: subject || 'languages',
        lessons: {
          create: (lessonIds || []).map((id: string, i: number) => ({
            lessonId: id,
            order: i
          }))
        }
      },
      include: {
        lessons: { include: { lesson: true }, orderBy: { order: 'asc' } }
      }
    })
    return NextResponse.json({ curriculum })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
