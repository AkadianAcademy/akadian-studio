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
    const { word, translation } = await req.json()
    const w = (word || '').trim()
    if (!w) return NextResponse.json({ error: 'No word' }, { status: 400 })
    const existing = await prisma.vocab.findFirst({ where: { lessonId: id, word: w } })
    if (existing) return NextResponse.json({ success: true, duplicate: true })
    await prisma.vocab.create({ data: { lessonId: id, word: w, translation: (translation || '').trim() } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
