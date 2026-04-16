import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const lesson = await prisma.lesson.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id }
        ]
      },
      include: {
        vocab: true,
        sentences: true,
        exercise: true,
        story: true,
      }
    })

    if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    console.log('Lesson found:', lesson.title, 'vocab count:', lesson.vocab?.length, 'sentences:', lesson.sentences?.length)
    return NextResponse.json({ lesson })
  } catch (e: any) {
    console.error('Lesson fetch error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
