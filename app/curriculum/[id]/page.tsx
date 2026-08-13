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

const STAT_THEMES = [
  { grad: 'linear-gradient(135deg,#7B5CFF,#5B3CE0)', tint: 'rgba(123,92,255,0.10)', strip: 'linear-gradient(90deg,#7B5CFF,#5B3CE0)' },
  { grad: 'linear-gradient(135deg,#10B981,#0E9F6E)', tint: 'rgba(14,159,110,0.10)', strip: 'linear-gradient(90deg,#10B981,#0E9F6E)' },
  { grad: 'linear-gradient(135deg,#3B82F6,#2563EB)', tint: 'rgba(37,99,235,0.10)', strip: 'linear-gradient(90deg,#3B82F6,#2563EB)' },
]

interface LessonWrap { id?: string; lesson: any }

function AnimatedCount({ value }: { value: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now(); const dur = 900
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{n}</>
}

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
  const titleWords: string[] = String(curriculum.title || '').split(' ')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #FAFAF8; }
        .page { min-height: 100vh; background: #FAFAF8; font-family: 'DM Sans', sans-serif; color: #1A1219; }
        .bg-orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .orb-a { width: min(760px,100vw); height: min(760px,100vw); background: radial-gradient(circle, rgba(123,92,255,0.08) 0%, transparent 65%); top: -24vh; left: -16vw; }
        .orb-b { width: min(560px,80vw); height: min(560px,80vw); background: radial-gradient(circle, rgba(200,255,61,0.12) 0%, transparent 65%); bottom: -16vh; right: -12vw; }
        .bg-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(26,18,25,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(26,18,25,0.018) 1px, transparent 1px); background-size: 40px 40px; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 14px clamp(20px,5vw,64px); border-bottom: 1px solid rgba(91,60,224,0.08); backdrop-filter: blur(12px); background: rgba(250,250,248,0.85); position: sticky; top: 0; z-index: 100; gap: 10px; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; border: 1px solid transparent; white-space: nowrap; }
        .btn-ghost { border-color: rgba(91,60,224,0.18); background: #fff; color: #5B3CE0; }
        .btn-ghost:hover { background: rgba(123,92,255,0.06); border-color: rgba(91,60,224,0.32); }
        .btn-primary { background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); color: #fff; box-shadow: 0 4px 16px rgba(91,60,224,0.28); }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(91,60,224,0.36); }
        .btn-edit { background: #C8FF3D; color: #0D1117; box-shadow: 0 4px 14px rgba(180,220,40,0.35); }
        .btn-edit:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(180,220,40,0.5); }
        .wrap { max-width: 900px; margin: 0 auto; padding: clamp(28px,5vw,56px) clamp(20px,5vw,64px); position: relative; z-index: 1; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { opacity:0; transform: scale(0.4); } 60% { transform: scale(1.14); } 100% { opacity:1; transform: scale(1); } }
        @keyframes drawLine { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes floatBlob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(24px,-22px) scale(1.08); } }
        @keyframes shimmer { to { background-position: 200% center; } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 4px rgba(123,92,255,0.16); } 50% { box-shadow: 0 0 0 8px rgba(123,92,255,0.24); } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) backwards; }

        .hero { position: relative; border-radius: 28px; overflow: hidden; padding: clamp(30px,5vw,54px); background: linear-gradient(130deg, #241653 0%, #5B3CE0 48%, #7B5CFF 100%); box-shadow: 0 24px 64px rgba(91,60,224,0.30); margin-bottom: 28px; }
        .hero-orb1 { position: absolute; top: -70px; right: -50px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(200,255,61,0.28), transparent 70%); animation: floatBlob 9s ease-in-out infinite; pointer-events: none; }
        .hero-orb2 { position: absolute; bottom: -90px; left: -60px; width: 340px; height: 340px; border-radius: 50%; background: radial-gradient(circle, rgba(160,120,255,0.45), transparent 70%); animation: floatBlob 12s ease-in-out infinite reverse; pointer-events: none; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 34px 34px; pointer-events: none; mask-image: radial-gradient(circle at 70% 0%, #000, transparent 70%); }
        .hero-inner { position: relative; z-index: 1; }
        .glass { display: inline-flex; align-items: center; gap: 6px; padding: 5px 13px; border-radius: 100px; background: rgba(255,255,255,0.14); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.22); font-size: 12px; font-weight: 700; color: #fff; }
        .hero-title { font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(36px,6.4vw,62px); line-height: 1.04; letter-spacing: -0.03em; color: #fff; margin: 18px 0 14px; }
        .hero-accent { font-style: italic; background: linear-gradient(100deg, #C8FF3D, #eaff9d, #C8FF3D); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 4.5s linear infinite; }
        .hero-desc { font-size: clamp(14px,2vw,16.5px); color: rgba(255,255,255,0.82); line-height: 1.7; max-width: 640px; }

        .stat { position: relative; background: #fff; border: 1px solid rgba(91,60,224,0.10); border-radius: 18px; padding: 22px 16px 20px; text-align: center; overflow: hidden; transition: transform 0.25s cubic-bezier(.16,1,.3,1), box-shadow 0.25s ease; box-shadow: 0 2px 12px rgba(26,18,25,0.04); }
        .stat:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(91,60,224,0.14); }
        .stat-strip { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
        .stat-icon { width: 52px; height: 52px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 4px auto 12px; box-shadow: 0 6px 16px rgba(26,18,25,0.12); }

        .node { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #7B5CFF, #5B3CE0); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: #fff; flex-shrink: 0; animation: popIn 0.55s cubic-bezier(.16,1,.3,1) backwards, glowPulse 3s ease-in-out infinite 0.6s; }
        .jline { width: 2px; flex: 1; min-height: 24px; background: linear-gradient(to bottom, rgba(123,92,255,0.5), rgba(123,92,255,0.08)); margin: 4px 0; transform-origin: top; animation: drawLine 0.6s ease backwards; }
        .jcard { position: relative; background: #FFFFFF; border: 1px solid rgba(91,60,224,0.10); border-radius: 18px; overflow: hidden; box-shadow: 0 2px 10px rgba(26,18,25,0.03); transition: transform 0.25s cubic-bezier(.16,1,.3,1), box-shadow 0.25s ease, border-color 0.25s ease; }
        .jcard:hover { transform: translateY(-4px); box-shadow: 0 18px 44px rgba(91,60,224,0.13); border-color: rgba(91,60,224,0.22); }
        .jcard-strip { height: 5px; width: 100%; }
        .open-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 11px; background: linear-gradient(135deg, #7B5CFF, #5B3CE0); color: #fff; font-size: 12.5px; font-weight: 700; text-decoration: none; white-space: nowrap; box-shadow: 0 4px 14px rgba(91,60,224,0.26); transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .open-btn:hover { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(91,60,224,0.36); }
        .open-btn .arw { transition: transform 0.2s ease; }
        .open-btn:hover .arw { transform: translateX(4px); }

        .icon-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(91,60,224,0.15); background: #fff; color: #5B3CE0; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .icon-btn:hover { background: rgba(123,92,255,0.08); }
        .icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .icon-btn.rm { border-color: rgba(225,29,72,0.2); color: #E11D48; }
        .icon-btn.rm:hover { background: rgba(225,29,72,0.06); }
        .pick-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 14px; border-radius: 12px; border: 1px solid rgba(91,60,224,0.10); background: #fff; margin-bottom: 8px; }

        @media print {
          .bg-orb, .bg-grid, .nav, .no-print, .hero-orb1, .hero-orb2, .hero-grid { display: none !important; }
          .page { background: #fff !important; }
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .hero { box-shadow: none !important; }
          .jcard, .stat { box-shadow: none !important; break-inside: avoid; }
          .node { animation: none !important; }
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

          {/* Hero banner */}
          <div className="hero fade-up">
            <div className="hero-orb1" />
            <div className="hero-orb2" />
            <div className="hero-grid" />
            <div className="hero-inner">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span className="glass">{SUBJECT_LABELS[curriculum.subject] || curriculum.subject}</span>
                <span className="glass" style={{ background: 'rgba(200,255,61,0.20)', borderColor: 'rgba(200,255,61,0.4)', color: '#EEFFC0' }}>📚 {lessons.length} lessons</span>
                <span className="glass" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>By {teacherName}</span>
              </div>
              <h1 className="hero-title">
                {titleWords.map((w, i) =>
                  i === titleWords.length - 1 ? <span key={i} className="hero-accent">{w}</span> : <span key={i}>{w} </span>
                )}
              </h1>
              {curriculum.description && <p className="hero-desc">{curriculum.description}</p>}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '52px' }}>
            {[
              { icon: '📚', node: <AnimatedCount value={lessons.length} />, label: 'Total lessons' },
              { icon: '🎯', node: levelsCovered, label: 'Levels covered' },
              { icon: '🌐', node: langsCovered, label: 'Language' },
            ].map((s, i) => {
              const th = STAT_THEMES[i]
              return (
                <div key={i} className="stat fade-up" style={{ animationDelay: `${0.12 + i * 0.1}s` }}>
                  <div className="stat-strip" style={{ background: th.strip }} />
                  <div className="stat-icon" style={{ background: th.tint }}>{s.icon}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1219', marginBottom: '3px', lineHeight: 1.1 }}>{s.node}</div>
                  <div style={{ fontSize: '11px', color: '#9090A0', fontWeight: 500 }}>{s.label}</div>
                </div>
              )
            })}
          </div>

          {/* Lesson journey */}
          <div style={{ marginBottom: '48px' }}>
            <div className="fade-up" style={{ animationDelay: '0.3s', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <div>
                <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(22px,3.4vw,30px)', color: '#1A1219', letterSpacing: '-0.02em' }}>Learning journey</h2>
                <p style={{ fontSize: '13px', color: '#9090A0', marginTop: '6px' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '24px' }}>
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
                      <div className="node" style={{ animationDelay: `${0.35 + idx * 0.12}s, ${0.9 + idx * 0.12}s` }}>{idx + 1}</div>
                      {idx < lessons.length - 1 && <div className="jline" style={{ animationDelay: `${0.45 + idx * 0.12}s` }} />}
                    </div>

                    {/* Card */}
                    <div style={{ flex: 1, marginBottom: idx < lessons.length - 1 ? '10px' : '0', paddingBottom: '8px', minWidth: 0 }}>
                      <div className="jcard fade-up" style={{ animationDelay: `${0.4 + idx * 0.12}s` }}>
                        <div className="jcard-strip" style={{ background: `linear-gradient(90deg, ${levelColor}, ${levelColor}00)` }} />
                        <div style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ padding: '2px 9px', borderRadius: '6px', background: `${levelColor}18`, border: `1px solid ${levelColor}45`, fontSize: '11px', fontWeight: 800, color: levelColor }}>{lesson.level}</span>
                                <span style={{ padding: '2px 9px', borderRadius: '6px', background: 'rgba(26,18,25,0.04)', fontSize: '11px', color: '#6B6575' }}>{lesson.language}</span>
                                {lesson.unit && <span style={{ padding: '2px 9px', borderRadius: '6px', background: 'rgba(26,18,25,0.04)', fontSize: '11px', color: '#6B6575' }}>{lesson.unit}</span>}
                              </div>
                              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1A1219', marginBottom: '6px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{lesson.title}</h3>
                              {lesson.goal && <p style={{ fontSize: '13px', color: '#6B6575', lineHeight: 1.6 }}>{lesson.goal}</p>}
                            </div>
                            {editing ? (
                              <div className="no-print" style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button className="icon-btn" title="Move up" onClick={() => moveLesson(idx, -1)} disabled={idx === 0}>↑</button>
                                <button className="icon-btn" title="Move down" onClick={() => moveLesson(idx, 1)} disabled={idx === lessons.length - 1}>↓</button>
                                <button className="icon-btn rm" title="Remove from pathway" onClick={() => removeLesson(lesson.id)}>✕</button>
                              </div>
                            ) : (
                              <a href={`/lesson/${lesson.slug}`} target="_blank" className="open-btn" style={{ flexShrink: 0 }}>
                                Open lesson <span className="arw">→</span>
                              </a>
                            )}
                          </div>

                          {/* Mini stats */}
                          {(lesson.vocab?.length > 0 || lesson.exercise || lesson.story) && (
                            <div style={{ display: 'flex', gap: '14px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(26,18,25,0.05)', flexWrap: 'wrap' }}>
                              {lesson.vocab?.length > 0 && (
                                <span style={{ fontSize: '11.5px', color: '#6B6575', fontWeight: 500 }}>📚 {lesson.vocab.length} vocabulary words</span>
                              )}
                              {lesson.exercise && (
                                <span style={{ fontSize: '11.5px', color: '#6B6575', fontWeight: 500 }}>✍️ {lesson.exercise.type?.replace(/-/g, ' ')}</span>
                              )}
                              {lesson.story && (
                                <span style={{ fontSize: '11.5px', color: '#6B6575', fontWeight: 500 }}>📖 Story included</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Akadian brand block */}
          <div className="fade-up" style={{ animationDelay: '0.2s', background: 'linear-gradient(135deg, #1E1533 0%, #0D1117 100%)', borderRadius: '24px', padding: 'clamp(24px,4vw,40px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,255,0.28) 0%, transparent 70%)', pointerEvents: 'none', animation: 'floatBlob 10s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -30, width: 210, height: 210, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,61,0.12) 0%, transparent 70%)', pointerEvents: 'none', animation: 'floatBlob 13s ease-in-out infinite reverse' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <img src={LOGO} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(123,92,255,0.4)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Akadian Academy</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Orlando, FL 🇺🇸 · EdTech Platform</p>
                </div>
              </div>
              <p style={{ fontSize: 'clamp(17px,2.6vw,22px)', fontWeight: 800, color: '#fff', lineHeight: 1.35, marginBottom: '8px', letterSpacing: '-0.01em' }}>
                Real lessons. Real teachers. <span style={{ color: '#C8FF3D' }}>Real US certificates — coming soon.</span>
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '20px', maxWidth: '520px' }}>
                This pathway was built on Akadian Academy Studio — an AI-powered lesson builder for real teachers, expanding to Math, Technology, Sciences and Business.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#C8FF3D', borderRadius: '12px', color: '#0D1117', fontSize: '14px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 6px 24px rgba(200,255,61,0.3)' }}>
                  ✦ Are you a teacher? Build free
                </a>
                <a href="https://www.akadianacademy.com" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
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
