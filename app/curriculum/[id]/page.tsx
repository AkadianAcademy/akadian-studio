'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const LOGO = "https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/69cbd2f11214dfc14b33eadb_logo%20akadian.png"

const LEVEL_COLORS: Record<string, string> = {
  A1: '#0E9F6E', A2: '#10B981', B1: '#2563EB',
  B2: '#7B5CFF', C1: '#B45309', Conversation: '#E11D48'
}

const SUBJECT_LABELS: Record<string, string> = {
  languages: '🌐 Languages', math: '📐 Math',
  technology: '💻 Technology', sciences: '🔬 Sciences', business: '📊 Business'
}

interface LessonWrap { id?: string; lesson: any }

export default function CurriculumPage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [curriculum, setCurriculum] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // ownership + editing
  const [myId, setMyId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editLessons, setEditLessons] = useState<LessonWrap[]>([])
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetch(`/api/curriculum/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.curriculum) setCurriculum(d.curriculum)
        else setError('Pathway not found')
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setMyId(session?.user?.id || null)
      setToken(session?.access_token || null)
    })
  }, [id])

  const isOwner = !!myId && !!curriculum && myId === curriculum.userId

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function startEdit() {
    setSaveError('')
    setEditLessons((curriculum.lessons || []).map((cl: any) => ({ id: cl.id, lesson: cl.lesson })))
    setEditing(true)
    if (allLessons.length === 0 && token) {
      try {
        const res = await fetch('/api/lessons', { headers: { 'Authorization': `Bearer ${token}` } })
        const d = await res.json()
        setAllLessons(d.lessons || [])
      } catch { /* picker just stays empty */ }
    }
  }

  function cancelEdit() { setEditing(false); setShowPicker(false); setSaveError('') }

  function removeLesson(lessonId: string) {
    setEditLessons(prev => prev.filter(cl => cl.lesson?.id !== lessonId))
  }
  function moveLesson(from: number, dir: -1 | 1) {
    const to = from + dir
    if (to < 0 || to >= editLessons.length) return
    setEditLessons(prev => {
      const next = [...prev]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })
  }
  function addLesson(lesson: any) {
    setEditLessons(prev => [...prev, { lesson }])
  }

  async function saveEdit() {
    setSaving(true); setSaveError('')
    try {
      if (!token) { setSaveError('You appear signed out — refresh and sign in again.'); setSaving(false); return }
      const lessonIds = editLessons.map(cl => cl.lesson?.id).filter(Boolean)
      const res = await fetch(`/api/curriculum/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ lessonIds })
      })
      if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(`Save failed (${res.status}). ${t}`.trim()) }
      setCurriculum({ ...curriculum, lessons: editLessons.map((cl, i) => ({ id: cl.id || `new-${i}`, lesson: cl.lesson, order: i })) })
      setEditing(false); setShowPicker(false)
    } catch (e: any) { setSaveError(e?.message || 'Save failed — not saved.') }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(123,92,255,0.2)', borderTopColor: '#7B5CFF', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#9090A0', fontSize: '13px' }}>Loading pathway...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <p style={{ color: '#1A1219', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Pathway not found</p>
      </div>
    </div>
  )

  const lessons: LessonWrap[] = editing ? editLessons : (curriculum.lessons || [])
  const teacherName = curriculum.user?.name || curriculum.user?.email?.split('@')[0] || 'Teacher'
  const availableToAdd = allLessons.filter(l => !editLessons.some(cl => cl.lesson?.id === l.id))
  const levelsCovered = [...new Set(lessons.map(cl => cl.lesson?.level).filter(Boolean))].join(', ') || '—'
  const langsCovered = [...new Set(lessons.map(cl => cl.lesson?.language).filter(Boolean))].join(', ') || '—'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #FAFAF8; }
        .page { min-height: 100vh; background: #FAFAF8; font-family: 'DM Sans', sans-serif; color: #1A1219; }
        .bg-orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .orb-a { width: min(720px,100vw); height: min(720px,100vw); background: radial-gradient(circle, rgba(123,92,255,0.07) 0%, transparent 65%); top: -22vh; left: -15vw; }
        .orb-b { width: min(520px,80vw); height: min(520px,80vw); background: radial-gradient(circle, rgba(200,255,61,0.10) 0%, transparent 65%); bottom: -15vh; right: -10vw; }
        .bg-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(26,18,25,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(26,18,25,0.018) 1px, transparent 1px); background-size: 40px 40px; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 14px clamp(20px,5vw,64px); border-bottom: 1px solid rgba(91,60,224,0.08); backdrop-filter: blur(12px); background: rgba(250,250,248,0.85); position: sticky; top: 0; z-index: 100; gap: 10px; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; border: 1px solid transparent; white-space: nowrap; }
        .btn-ghost { border-color: rgba(91,60,224,0.18); background: #fff; color: #5B3CE0; }
        .btn-ghost:hover { background: rgba(123,92,255,0.06); border-color: rgba(91,60,224,0.32); }
        .btn-primary { background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); color: #fff; box-shadow: 0 4px 16px rgba(91,60,224,0.28); }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(91,60,224,0.36); }
        .btn-edit { background: #C8FF3D; color: #0D1117; }
        .btn-edit:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(180,220,40,0.4); }
        .btn-danger { border-color: rgba(225,29,72,0.25); background: #fff; color: #E11D48; }
        .btn-danger:hover { background: rgba(225,29,72,0.06); }
        .wrap { max-width: 880px; margin: 0 auto; padding: clamp(36px,6vw,68px) clamp(20px,5vw,64px); position: relative; z-index: 1; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { opacity:0; animation: fadeUp 0.5s ease forwards; }
        .lcard { background: #FFFFFF; border: 1px solid rgba(91,60,224,0.10); border-radius: 16px; padding: 18px 20px; transition: box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease; box-shadow: 0 1px 3px rgba(26,18,25,0.03); }
        .lcard:hover { box-shadow: 0 12px 32px rgba(91,60,224,0.10); border-color: rgba(91,60,224,0.20); }
        .icon-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(91,60,224,0.15); background: #fff; color: #5B3CE0; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .icon-btn:hover { background: rgba(123,92,255,0.08); }
        .icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .icon-btn.rm { border-color: rgba(225,29,72,0.2); color: #E11D48; }
        .icon-btn.rm:hover { background: rgba(225,29,72,0.06); }
        .open-btn { padding: 8px 16px; border-radius: 10px; background: rgba(123,92,255,0.08); border: 1px solid rgba(91,60,224,0.2); color: #5B3CE0; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; transition: all 0.18s; }
        .open-btn:hover { background: rgba(123,92,255,0.16); }
        .pick-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 14px; border-radius: 12px; border: 1px solid rgba(91,60,224,0.10); background: #fff; margin-bottom: 8px; }
        @media print {
          .bg-orb, .bg-grid, .nav, .no-print { display: none !important; }
          .page { background: #fff !important; }
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .lcard { box-shadow: none !important; break-inside: avoid; }
        }
      `}</style>

      <div className="page">
        <div className="bg-orb orb-a" />
        <div className="bg-orb orb-b" />
        <div className="bg-grid" />

        {/* Nav */}
        <nav className="nav">
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src={LOGO} style={{ width: 30, height: 30, borderRadius: '50%' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1219' }}>Akadian Academy</span>
          </a>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isOwner && !editing && <button className="btn btn-edit" onClick={startEdit}>✏️ Edit pathway</button>}
            {isOwner && editing && (
              <>
                <button className="btn btn-ghost" onClick={cancelEdit} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : '✓ Save changes'}</button>
              </>
            )}
            {!editing && <button className="btn btn-ghost" onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>}
            {!editing && <button className="btn btn-primary" onClick={() => window.print()}>↓ Export PDF</button>}
          </div>
        </nav>

        <div className="wrap">

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(123,92,255,0.08)', border: '1px solid rgba(91,60,224,0.18)', fontSize: '12px', fontWeight: 700, color: '#5B3CE0' }}>
                {SUBJECT_LABELS[curriculum.subject] || curriculum.subject}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(14,159,110,0.1)', border: '1px solid rgba(14,159,110,0.22)', fontSize: '12px', fontWeight: 700, color: '#0E9F6E' }}>
                {lessons.length} lessons
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '100px', background: '#fff', border: '1px solid rgba(26,18,25,0.08)', fontSize: '12px', color: '#9090A0' }}>
                By {teacherName}
              </span>
            </div>

            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: '14px', color: '#1A1219' }}>
              {curriculum.title.split(' ').map((w: string, i: number, arr: string[]) =>
                i === arr.length - 1 ? <em key={i} style={{ color: '#7B5CFF', fontStyle: 'italic' }}>{w}</em> : <span key={i}>{w} </span>
              )}
            </h1>

            {curriculum.description && (
              <p style={{ fontSize: 'clamp(15px,2vw,17px)', color: '#6B6575', lineHeight: 1.7, maxWidth: '640px' }}>
                {curriculum.description}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="fade-up" style={{ animationDelay: '0.1s', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '48px' }}>
            {[
              { icon: '📚', value: lessons.length, label: 'Total lessons' },
              { icon: '🎯', value: levelsCovered, label: 'Levels covered' },
              { icon: '🌐', value: langsCovered, label: 'Language' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(91,60,224,0.10)', borderRadius: '14px', padding: '18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(26,18,25,0.03)' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1A1219', marginBottom: '3px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#9090A0' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Lesson journey */}
          <div className="fade-up" style={{ animationDelay: '0.2s', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1219' }}>Learning journey</h2>
                <p style={{ fontSize: '13px', color: '#9090A0', marginTop: '4px' }}>
                  {editing ? 'Reorder, remove, or add lessons — then save your changes' : 'Follow this path in order for the best learning experience'}
                </p>
              </div>
              {editing && <button className="btn btn-edit no-print" onClick={() => setShowPicker(v => !v)}>+ Add lesson</button>}
            </div>

            {editing && saveError && (
              <div style={{ background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.2)', color: '#E11D48', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', margin: '14px 0' }}>⚠ {saveError}</div>
            )}

            {/* Add-lesson picker */}
            {editing && showPicker && (
              <div className="no-print" style={{ margin: '16px 0 20px', background: '#F6F5FF', border: '1px solid rgba(91,60,224,0.16)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#5B3CE0', marginBottom: '12px' }}>Add a lesson to this pathway</div>
                {availableToAdd.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#9090A0' }}>All your lessons are already in this pathway.</p>
                ) : (
                  availableToAdd.map(l => (
                    <div key={l.id} className="pick-row">
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1A1219', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                        <div style={{ fontSize: '11.5px', color: '#9090A0', marginTop: '2px' }}>{[l.level, l.language, l.unit].filter(Boolean).join(' · ')}</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => addLesson(l)} style={{ flexShrink: 0 }}>+ Add</button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '20px' }}>
              {lessons.length === 0 && (
                <p style={{ fontSize: '14px', color: '#9090A0', textAlign: 'center', padding: '32px 0' }}>No lessons in this pathway yet.{editing ? ' Use “+ Add lesson” above.' : ''}</p>
              )}
              {lessons.map((cl, idx) => {
                const lesson = cl.lesson
                if (!lesson) return null
                const levelColor = LEVEL_COLORS[lesson.level] || '#7B5CFF'
                return (
                  <div key={cl.lesson?.id || cl.id || idx} style={{ display: 'flex', gap: '0', position: 'relative' }}>
                    {/* Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px', flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7B5CFF, #5B3CE0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 0 0 4px rgba(123,92,255,0.14)' }}>
                        {idx + 1}
                      </div>
                      {idx < lessons.length - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: '24px', background: 'linear-gradient(to bottom, rgba(123,92,255,0.4), rgba(123,92,255,0.08))', margin: '4px 0' }} />
                      )}
                    </div>

                    {/* Card */}
                    <div style={{ flex: 1, marginBottom: idx < lessons.length - 1 ? '8px' : '0', paddingBottom: '8px', minWidth: 0 }}>
                      <div className="lcard">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '6px', background: `${levelColor}18`, border: `1px solid ${levelColor}40`, fontSize: '11px', fontWeight: 700, color: levelColor }}>{lesson.level}</span>
                              <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(26,18,25,0.04)', fontSize: '11px', color: '#6B6575' }}>{lesson.language}</span>
                              {lesson.unit && <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(26,18,25,0.04)', fontSize: '11px', color: '#6B6575' }}>{lesson.unit}</span>}
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1219', marginBottom: '6px', lineHeight: 1.3 }}>{lesson.title}</h3>
                            {lesson.goal && <p style={{ fontSize: '13px', color: '#6B6575', lineHeight: 1.55 }}>{lesson.goal}</p>}
                          </div>
                          {editing ? (
                            <div className="no-print" style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button className="icon-btn" title="Move up" onClick={() => moveLesson(idx, -1)} disabled={idx === 0}>↑</button>
                              <button className="icon-btn" title="Move down" onClick={() => moveLesson(idx, 1)} disabled={idx === lessons.length - 1}>↓</button>
                              <button className="icon-btn rm" title="Remove from pathway" onClick={() => removeLesson(lesson.id)}>✕</button>
                            </div>
                          ) : (
                            <a href={`/lesson/${lesson.slug}`} target="_blank" className="open-btn" style={{ flexShrink: 0 }}>
                              Open lesson →
                            </a>
                          )}
                        </div>

                        {/* Mini stats */}
                        {(lesson.vocab?.length > 0 || lesson.exercise || lesson.story) && (
                          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(26,18,25,0.05)', flexWrap: 'wrap' }}>
                            {lesson.vocab?.length > 0 && (
                              <span style={{ fontSize: '11px', color: '#9090A0' }}>📚 {lesson.vocab.length} vocabulary words</span>
                            )}
                            {lesson.exercise && (
                              <span style={{ fontSize: '11px', color: '#9090A0' }}>✍️ {lesson.exercise.type?.replace(/-/g, ' ')}</span>
                            )}
                            {lesson.story && (
                              <span style={{ fontSize: '11px', color: '#9090A0' }}>📖 Story included</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Akadian brand block */}
          <div className="fade-up" style={{ animationDelay: '0.3s', background: 'linear-gradient(135deg, #1E1533 0%, #0D1117 100%)', borderRadius: '22px', padding: 'clamp(24px,4vw,38px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,255,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,61,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <img src={LOGO} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(123,92,255,0.4)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Akadian Academy</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Orlando, FL 🇺🇸 · EdTech Platform</p>
                </div>
              </div>
              <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 800, color: '#fff', lineHeight: 1.35, marginBottom: '8px' }}>
                Real lessons. Real teachers. <span style={{ color: '#C8FF3D' }}>Real US certificates — coming soon.</span>
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '20px', maxWidth: '520px' }}>
                This pathway was built on Akadian Academy Studio — an AI-powered lesson builder for real teachers, expanding to Math, Technology, Sciences and Business.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: '#C8FF3D', borderRadius: '12px', color: '#0D1117', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(200,255,61,0.25)' }}>
                  ✦ Are you a teacher? Build free
                </a>
                <a href="https://www.akadianacademy.com" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                  🌐 www.akadianacademy.com
                </a>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '16px' }}>
                Akadian Academy LLC · Orlando, Florida · United States of America
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="no-print" style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(91,60,224,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9090A0', textDecoration: 'none', fontSize: '13px' }}>
              ← Back to Akadian
            </a>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>
              <button className="btn btn-primary" onClick={() => window.print()}>↓ Export PDF</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
