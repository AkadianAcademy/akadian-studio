'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLessonStore } from '@/store/lessonStore'
import BuilderStepper from '@/components/builder/BuilderStepper'
import BuilderSidebar from '@/components/builder/BuilderSidebar'
import BuilderLivePreview from '@/components/builder/BuilderLivePreview'
import SetupStep from '@/components/builder/SetupStep'
import VocabStep from '@/components/builder/VocabStep'
import PracticeStep from '@/components/builder/PracticeStep'
import Practice2Step from '@/components/builder/Practice2Step'
import PreviewStep from '@/components/builder/PreviewStep'

export default function BuilderPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  const [authChecked, setAuthChecked] = useState(false)
  const tokenRef = useRef<string | null>(null)
  const supabase = createClient()

  const {
    currentStep, setCurrentStep, setup, setLessonId, setSaving,
    setSlug, vocab, reset, setSetup, setVocab, setSentences,
    lessonId: storeLessonId
  } = useLessonStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      tokenRef.current = session.access_token
      if (lessonId === 'new') {
        reset()
        localStorage.removeItem('akadian-lesson-store')
      } else {
        fetch('/api/lessons/' + lessonId, {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        }).then(r => r.json()).then(d => {
          if (d.lesson) {
            const l = d.lesson
            setLessonId(l.id)
            setSlug(l.slug)
            setSetup({ subject: l.subject, language: l.language, level: l.level, unit: l.unit, title: l.title, goal: l.goal })
            if (l.vocab?.length) setVocab(l.vocab.map((v: any) => ({ id: v.id, word: v.word, translation: v.translation, examples: [] })))
            if (l.sentences?.length) setSentences(l.sentences.map((s: any) => ({ id: s.id, source: s.source, translation: s.translation })))
          }
        }).catch(() => {})
      }
      setAuthChecked(true)
    })
  }, [lessonId])

  async function handleSetupNext() {
    setSaving(true)
    try {
      const existingId = storeLessonId && storeLessonId !== 'new' ? storeLessonId : null
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ ...setup, lessonId: existingId })
      })
      const data = await res.json()
      if (data.lesson) {
        setLessonId(data.lesson.id)
        setSlug(data.lesson.slug)
        if (lessonId === 'new') router.replace(`/builder/${data.lesson.id}`)
        setCurrentStep(2)
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(91,60,224,0.2)', borderTopColor: '#7B5CFF', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#9090A0', fontSize: '13px' }}>Loading your studio...</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #FAFAF8; }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Hanken Grotesk', sans-serif", display: 'flex', flexDirection: 'column' }}>
        <BuilderStepper />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <BuilderSidebar />
          <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(32px,5vw,64px) clamp(24px,4vw,48px)', display: 'flex', justifyContent: 'center', background: '#FAFAF8' }}>
            {currentStep === 1 && <SetupStep onNext={handleSetupNext} />}
            {currentStep === 2 && storeLessonId && (
              <VocabStep
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && storeLessonId && (
              <PracticeStep
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && storeLessonId && (
              <Practice2Step
                onNext={() => setCurrentStep(5)}
                onBack={() => setCurrentStep(3)}
              />
            )}
            {currentStep === 5 && <PreviewStep />}
          </main>
          <BuilderLivePreview />
        </div>
      </div>
    </>
  )
}
