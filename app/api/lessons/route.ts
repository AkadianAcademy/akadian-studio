import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function generateSlug(title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50)
  const rand = Math.random().toString(36).substring(2, 8)
  return `${base}-${rand}`
}

async function getUserFromRequest(req: Request) {
  try {
    const auth = req.headers.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) return null
    const token = auth.replace('Bearer ', '').trim()
    if (!token || token === 'null' || token === 'undefined') return null
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) { console.error('Auth error:', error.message); return null }
    return user
  } catch (e) {
    console.error('getUserFromRequest error:', e)
    return null
  }
}

async function ensureUserExists(userId: string, email: string, name?: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email, name: name || email.split('@')[0] }
  })
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Make sure user exists in our DB
    await ensureUserExists(user.id, user.email!, user.user_metadata?.name)

    const body = await req.json()
    const { subject, language, level, unit, title, goal } = body
    const slug = generateSlug(title || 'untitled-lesson')

    const lesson = await prisma.lesson.create({
      data: {
        userId: user.id,
        subject: subject || 'languages',
        language: language || 'English',
        level: level || 'A2',
        unit: unit || '',
        title: title || 'Untitled Lesson',
        goal: goal || '',
        slug,
        published: false,
      }
    })

    return NextResponse.json({ lesson })
  } catch (e: any) {
    console.error('POST /api/lessons error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ lessons: [] })

    await ensureUserExists(user.id, user.email!, user.user_metadata?.name)

    const lessons = await prisma.lesson.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ lessons })
  } catch (e: any) {
    console.error('GET /api/lessons error:', e.message)
    return NextResponse.json({ lessons: [] })
  }
}
