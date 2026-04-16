'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLessonStore } from '@/store/lessonStore'
import BuilderStepper from '@/components/builder/BuilderStepper'
import BuilderSidebar from '@/components/builder/BuilderSidebar'
import SetupStep from '@/components/builder/SetupStep'
import VocabStep from '@/components/builder/VocabStep'
import PracticeStep from '@/components/builder/PracticeStep'
import PreviewStep from '@/components/builder/PreviewStep'

function LivePreviewCard() {
  const { setup, vocab, sentences, currentStep } = useLessonStore()
  return (
    <>
      <style>{`
        .preview-panel { width: 280px; min-width: 280px; border-left: 1px solid rgba(255,255,255,0.06); padding: 24px 20px; overflow-y: auto; height: 100%; display: flex; flex-direction: column; gap: 16px; }
        .preview-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.2); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .preview-dot { width: 5px; height: 5px; border-radius: 50%; background: #ff4b55; animation: previewBlink 2s ease-in-out infinite; }
        @keyframes previewBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .preview-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
        .preview-card-header { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
        .preview-card-body { padding: 16px; }
        .preview-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; background: rgba(255,75,85,0.1); border: 1px solid rgba(255,75,85,0.2); font-size: 10px; font-weight: 600; color: #ff4b55; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; }
        .preview-title { font-size: 16px; font-weight: 700; color: #fff; line-height: 1.3; letter-spacing: -0.02em; margin-bottom: 6px; }
        .preview-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .preview-meta-pill { padding: 3px 10px; border-radius: 100px; background: rgba(255,255,255,0.06); font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 500; }
        .preview-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
        .preview-section-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.2); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
        .preview-placeholder { height: 7px; border-radius: 4px; background: rgba(255,255,255,0.05); margin-bottom: 6px; }
        .vocab-pill { display: inline-flex; gap: 6px; padding: 4px 10px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: rgba(255,255,255,0.5); margin: 2px; }
        .vocab-pill-word { color: #fff; font-weight: 500; }
        .flow-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px; }
        .flow-step { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .flow-step:last-child { border-bottom: none; padding-bottom: 0; }
        .flow-num { width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.3); flex-shrink: 0; }
        .flow-num-active { background: rgba(255,75,85,0.15); color: #ff4b55; }
        .flow-num-done { background: rgba(0,188,124,0.15); color: #00bc7c; }
        @media (max-width: 1100px) { .preview-panel { display: none; } }
      `}</style>
      <div className="preview-panel">
        <div className="preview-label"><span className="preview-dot" />Live preview</div>
        <div className="preview-card">
          <div className="preview-card-header">
            <div className="preview-badge">✦ Public lesson page</div>
            <div className="preview-title">{setup.title || <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontWeight: 400 }}>Lesson title...</span>}</div>
            {setup.goal && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{setup.goal}</div>}
            <div className="preview-meta">
              {setup.language && <span className="preview-meta-pill">{setup.language}</span>}
              {setup.level && <span className="preview-meta-pill">{setup.level}</span>}
            </div>
          </div>
          <div className="preview-card-body">
            <div className="preview-section">
              <div className="preview-section-label">Vocabulary {vocab.length > 0 && `(${vocab.length})`}</div>
              {vocab.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {vocab.slice(0, 6).map(v => (
                    <div key={v.id} className="vocab-pill">
                      <span className="vocab-pill-word">{v.word}</span>
                      <span>—</span>
                      <span>{v.translation}</span>
                    </div>
                  ))}
                  {vocab.length > 6 && <div className="vocab-pill">+{vocab.length - 6} more</div>}
                </div>
              ) : (
                <><div className="preview-placeholder" style={{ width: '80%' }} /><div className="preview-placeholder" style={{ width: '60%' }} /></>
              )}
            </div>
            <div className="preview-section">
              <div className="preview-section-label">Example sentences {sentences.length > 0 && `(${sentences.length})`}</div>
              {sentences.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {sentences.slice(0, 2).map(s => (
                    <div key={s.id} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{s.source}</div>
                      <div>{s.translation}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <><div className="preview-placeholder" style={{ width: '100%' }} /><div className="preview-placeholder" style={{ width: '85%' }} /></>
              )}
            </div>
            <div className="preview-section">
              <div className="preview-section-label">Story & exercise</div>
              <div className="preview-placeholder" style={{ width: '100%' }} />
              <div className="preview-placeholder" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        <div className="flow-card">
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Lesson flow</div>
          {[
            { num: '1', label: 'Setup', desc: 'Lesson details', done: currentStep > 1 },
            { num: '2', label: 'Vocabulary', desc: 'Words & sentences', done: currentStep > 2, active: currentStep === 2 },
            { num: '3', label: 'Practice', desc: 'Exercises & story', done: currentStep > 3, active: currentStep === 3 },
            { num: '4', label: 'Preview', desc: 'Review & publish', active: currentStep === 4 },
          ].map(s => (
            <div key={s.num} className="flow-step">
              <div className={`flow-num ${s.done ? 'flow-num-done' : s.active ? 'flow-num-active' : ''}`}>
                {s.done ? '✓' : s.num}
              </div>
              <div>
                <div style={{ fontSize: '12px', color: s.done ? '#00bc7c' : s.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: s.active || s.done ? 600 : 400 }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '1px' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function BuilderPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  const { currentStep, setCurrentStep, setup, setLessonId, setSaving, setSlug, vocab, reset } = useLessonStore()
  const [authChecked, setAuthChecked] = useState(false)
  const tokenRef = useRef<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        tokenRef.current = session.access_token
        if (lessonId === 'new') {
          // Always reset when starting a new lesson
          reset()
        } else {
          setLessonId(lessonId)
          fetch('/api/lessons/' + lessonId + '/by-id', {
            headers: { 'Authorization': 'Bearer ' + session.access_token }
          }).then(r => r.json()).then(d => {
            if (d.lesson?.slug) setSlug(d.lesson.slug)
          }).catch(() => {})
        }
        setAuthChecked(true)
        return
      }
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.access_token) {
          tokenRef.current = session.access_token
          if (lessonId !== 'new') setLessonId(lessonId)
          setAuthChecked(true)
          subscription.unsubscribe()
        } else if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      })
      setTimeout(() => { if (!tokenRef.current) router.push('/login') }, 3000)
    }
    init()
  }, [])

  async function handleSetupNext() {
    let token = tokenRef.current
    if (!token) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      token = session.access_token
      tokenRef.current = token
    }
    setSaving(true)
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(setup)
    })
    const data = await res.json()
    if (!data.lesson) { setSaving(false); throw new Error(data.error || 'Failed to save') }
    setLessonId(data.lesson.id)
    setSlug(data.lesson.slug)
    router.replace(`/builder/${data.lesson.id}`)
    setCurrentStep(2)
    setSaving(false)
  }

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', background: '#0b172b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,75,85,0.2)', borderTopColor: '#ff4b55', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Loading builder...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0b172b', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input, textarea, select { color-scheme: dark; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:focus, textarea:focus, select:focus { border-color: rgba(255,75,85,0.45) !important; box-shadow: 0 0 0 3px rgba(255,75,85,0.08) !important; outline: none !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        select option { background: #0b172b; color: #fff; }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <BuilderStepper />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <BuilderSidebar />
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(24px,4vw,48px) clamp(20px,4vw,56px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          {currentStep === 1 && <SetupStep onNext={handleSetupNext} />}
          {currentStep === 2 && (
            <VocabStep
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <PracticeStep
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && <PreviewStep />}
        </div>
        <LivePreviewCard />
      </div>
    </div>
  )
}
