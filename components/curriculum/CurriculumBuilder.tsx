'use client'
import { useState } from 'react'

const SUBJECTS = [
  { id: 'languages', label: '🌐 Languages', active: true },
  { id: 'math', label: '📐 Math', active: false },
  { id: 'technology', label: '💻 Technology', active: false },
  { id: 'sciences', label: '🔬 Sciences', active: false },
  { id: 'business', label: '📊 Business', active: false },
]

interface Lesson {
  id: string
  title: string
  level: string
  language: string
  goal: string
  slug: string
}

interface Props {
  lessons: Lesson[]
  token: string
  onCreated: (curriculum: any) => void
  onClose: () => void
}

export default function CurriculumBuilder({ lessons, token, onCreated, onClose }: Props) {
  const [step, setStep] = useState<'setup' | 'lessons' | 'preview'>('setup')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('languages')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedLessons = selectedIds.map(id => lessons.find(l => l.id === id)).filter(Boolean) as Lesson[]

  function toggleLesson(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const n = [...selectedIds];
    [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]
    setSelectedIds(n)
  }

  function moveDown(idx: number) {
    if (idx === selectedIds.length - 1) return
    const n = [...selectedIds];
    [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]
    setSelectedIds(n)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, description, subject, lessonIds: selectedIds })
      })
      const data = await res.json()
      if (data.curriculum) { onCreated(data.curriculum); onClose() }
      else setError(data.error || 'Failed to save')
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  return (
    <>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .cb-modal { animation: slideIn 0.3s ease; }
        .lesson-pick:hover { border-color: rgba(255,75,85,0.3) !important; background: rgba(255,75,85,0.05) !important; }
      `}</style>

      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,23,43,0.85)', backdropFilter: 'blur(8px)', zIndex: 999 }} />

      <div className="cb-modal" style={{ position: 'fixed', top: '5%', left: '50%', transform: 'translateX(-50%)', width: 'min(700px, 90vw)', maxHeight: '88vh', background: '#0f1e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>

        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,75,85,0.1)', border: '1px solid rgba(255,75,85,0.2)', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: '#ff4b55', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>✦ Curriculum builder</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              {step === 'setup' ? 'Set up your curriculum' : step === 'lessons' ? 'Add lessons' : 'Preview & save'}
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>×</button>
        </div>

        <div style={{ display: 'flex', padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px', flexShrink: 0 }}>
          {[{ id: 'setup', label: '1. Setup' }, { id: 'lessons', label: '2. Add lessons' }, { id: 'preview', label: '3. Preview' }].map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '4px 12px', borderRadius: '100px', background: step === s.id ? 'rgba(255,75,85,0.15)' : 'transparent', border: `1px solid ${step === s.id ? 'rgba(255,75,85,0.4)' : 'rgba(255,255,255,0.08)'}`, fontSize: '12px', fontWeight: step === s.id ? 600 : 400, color: step === s.id ? '#fff' : 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              {i < 2 && <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {step === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Curriculum title <span style={{ color: '#ff4b55' }}>*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. English for Daily Life — Beginner Track"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${title ? 'rgba(255,75,85,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will students learn? Who is this for?" rows={3}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Subject</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SUBJECTS.map(s => (
                    <button key={s.id} onClick={() => s.active && setSubject(s.id)}
                      style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${subject === s.id ? 'rgba(255,75,85,0.5)' : 'rgba(255,255,255,0.08)'}`, background: subject === s.id ? 'rgba(255,75,85,0.15)' : 'rgba(255,255,255,0.03)', color: subject === s.id ? '#fff' : s.active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', fontSize: '13px', fontWeight: subject === s.id ? 600 : 400, cursor: s.active ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                      {s.label}{!s.active && <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.5 }}>(soon)</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'lessons' && (
            <div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', lineHeight: 1.6 }}>
                Select lessons and arrange them in order. <span style={{ color: '#ff4b55', fontWeight: 600 }}>{selectedIds.length} selected</span>
              </p>
              {selectedIds.length > 0 && (
                <div style={{ marginBottom: '20px', background: 'rgba(255,75,85,0.05)', border: '1px solid rgba(255,75,85,0.15)', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#ff4b55', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Curriculum order</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedIds.map((id, idx) => {
                      const lesson = lessons.find(l => l.id === id)
                      if (!lesson) return null
                      return (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff4b55', minWidth: '20px' }}>{idx + 1}</span>
                          <span style={{ flex: 1, fontSize: '13px', color: '#fff', fontWeight: 500 }}>{lesson.title}</span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>{lesson.level}</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button onClick={() => moveUp(idx)} style={{ width: 24, height: 24, borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px' }}>↑</button>
                            <button onClick={() => moveDown(idx)} style={{ width: 24, height: 24, borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px' }}>↓</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lessons.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', textAlign: 'center', padding: '32px' }}>No lessons yet — build some lessons first!</p>
                ) : lessons.map(lesson => (
                  <div key={lesson.id} className="lesson-pick" onClick={() => toggleLesson(lesson.id)}
                    style={{ padding: '12px 14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${selectedIds.includes(lesson.id) ? 'rgba(255,75,85,0.4)' : 'rgba(255,255,255,0.07)'}`, background: selectedIds.includes(lesson.id) ? 'rgba(255,75,85,0.1)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedIds.includes(lesson.id) ? '#ff4b55' : 'rgba(255,255,255,0.2)'}`, background: selectedIds.includes(lesson.id) ? '#ff4b55' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                      {selectedIds.includes(lesson.id) && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{lesson.title}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{lesson.language} · {lesson.level}</p>
                    </div>
                    {selectedIds.includes(lesson.id) && <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff4b55' }}>#{selectedIds.indexOf(lesson.id) + 1}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,75,85,0.08), rgba(0,188,124,0.05))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(255,75,85,0.15)', border: '1px solid rgba(255,75,85,0.3)', fontSize: '11px', fontWeight: 600, color: '#ff4b55' }}>{SUBJECTS.find(s => s.id === subject)?.label}</span>
                  <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(0,188,124,0.1)', border: '1px solid rgba(0,188,124,0.2)', fontSize: '11px', fontWeight: 600, color: '#00bc7c' }}>{selectedIds.length} lessons</span>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '8px' }}>{title}</h3>
                {description && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '16px' }}>{description}</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedLessons.map((lesson, idx) => (
                    <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ff4b55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>{idx + 1}</div>
                        {idx < selectedLessons.length - 1 && <div style={{ width: 2, height: 16, background: 'rgba(255,75,85,0.2)', margin: '2px 0' }} />}
                      </div>
                      <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{lesson.title}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{lesson.language} · {lesson.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(0,188,124,0.07)', border: '1px solid rgba(0,188,124,0.18)', borderRadius: '12px', padding: '14px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                ✦ This curriculum will appear on your dashboard. You can share it or export it as a PDF.
              </div>
              {error && <p style={{ color: '#ff4b55', fontSize: '13px', marginTop: '12px' }}>⚠ {error}</p>}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => step === 'setup' ? onClose() : step === 'lessons' ? setStep('setup') : setStep('lessons')}
            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {step === 'setup' ? 'Cancel' : '← Back'}
          </button>
          {step !== 'preview' ? (
            <button onClick={() => step === 'setup' ? setStep('lessons') : setStep('preview')} disabled={step === 'setup' && !title.trim()}
              style={{ padding: '10px 24px', background: step === 'setup' && !title.trim() ? 'rgba(255,255,255,0.06)' : '#ff4b55', border: 'none', borderRadius: '10px', color: step === 'setup' && !title.trim() ? 'rgba(255,255,255,0.25)' : '#fff', fontSize: '14px', fontWeight: 600, cursor: step === 'setup' && !title.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {step === 'setup' ? 'Add lessons →' : `Preview (${selectedIds.length} lessons) →`}
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving || selectedIds.length === 0}
              style={{ padding: '10px 24px', background: saving ? '#aaa' : '#00bc7c', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {saving ? 'Saving...' : '✓ Save curriculum'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
