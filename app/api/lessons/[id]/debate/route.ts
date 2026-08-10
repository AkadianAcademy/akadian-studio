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

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const { topic, article, keyTerms, questions } = await req.json()

    const debate = await prisma.debate.upsert({
      where: { lessonId: id },
      update: { topic, article, keyTerms, questions },
      create: { lessonId: id, topic, article, keyTerms, questions },
    })
    return NextResponse.json({ debate })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const debate = await prisma.debate.findUnique({ where: { lessonId: id } })
    return NextResponse.json({ debate })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
