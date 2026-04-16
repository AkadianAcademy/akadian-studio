'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const LOGO = "https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/69cbd2f11214dfc14b33eadb_logo%20akadian.png"

const LEVEL_COLORS: Record<string, string> = {
  A1: '#00bc7c', A2: '#34d399', B1: '#3b82f6',
  B2: '#8b5cf6', C1: '#f59e0b', Conversation: '#ff4b55'
}

const SUBJECT_LABELS: Record<string, string> = {
  languages: '🌐 Languages', math: '📐 Math',
  technology: '💻 Technology', sciences: '🔬 Sciences', business: '📊 Business'
}

export default function CurriculumPage() {
  const params = useParams()
  const id = params.id as string
  const [curriculum, setCurriculum] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/curriculum/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.curriculum) setCurriculum(d.curriculum)
        else setError('Curriculum not found')
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [id])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0b172b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,75,85,0.2)', borderTopColor: '#ff4b55', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Loading curriculum...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0b172b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <p style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Curriculum not found</p>
      </div>
    </div>
  )

  const lessons = curriculum.lessons || []
  const teacherName = curriculum.user?.name || curriculum.user?.email?.split('@')[0] || 'Teacher'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0b172b; }
        .page { min-height: 100vh; background: #0b172b; font-family: 'DM Sans', sans-serif; color: #fff; }
        .bg-orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .orb-a { width: min(700px,100vw); height: min(700px,100vw); background: radial-gradient(circle, rgba(255,75,85,0.08) 0%, transparent 65%); top: -20vh; left: -15vw; }
        .orb-b { width: min(500px,80vw); height: min(500px,80vw); background: radial-gradient(circle, rgba(0,188,124,0.06) 0%, transparent 65%); bottom: -15vh; right: -10vw; }
        .bg-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px); background-size: 40px 40px; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 16px clamp(20px,5vw,64px); border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(12px); background: rgba(11,23,43,0.85); position: sticky; top: 0; z-index: 100; }
        .share-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.6); font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .share-btn-primary { background: #ff4b55; border-color: #ff4b55; color: #fff; }
        .wrap { max-width: 860px; margin: 0 auto; padding: clamp(40px,6vw,72px) clamp(20px,5vw,64px); position: relative; z-index: 1; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { opacity:0; animation: fadeUp 0.5s ease forwards; }
        @media print {
          .bg-orb, .bg-grid, .nav { display: none !important; }
          .page { background: #0b172b !important; }
          body { background: #0b172b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .share-btn { display: none !important; }
        }
      `}</style>

      <div className="page">
        <div className="bg-orb orb-a" />
        <div className="bg-orb orb-b" />
        <div className="bg-grid" />

        {/* Nav */}
        <nav className="nav">
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src={LOGO} style={{ width: 30, height: 30, borderRadius: '50%' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Akadian Academy</span>
          </a>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="share-btn" onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>
            <button className="share-btn share-btn-primary" onClick={() => window.print()}>↓ Export PDF</button>
          </div>
        </nav>

        <div className="wrap">

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,75,85,0.1)', border: '1px solid rgba(255,75,85,0.2)', fontSize: '12px', fontWeight: 600, color: '#ff4b55' }}>
                {SUBJECT_LABELS[curriculum.subject] || curriculum.subject}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(0,188,124,0.1)', border: '1px solid rgba(0,188,124,0.2)', fontSize: '12px', fontWeight: 600, color: '#00bc7c' }}>
                {lessons.length} lessons
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                By {teacherName}
              </span>
            </div>

            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: '14px' }}>
              {curriculum.title.split(' ').map((w: string, i: number, arr: string[]) =>
                i === arr.length - 1 ? <em key={i} style={{ color: '#ff4b55', fontStyle: 'italic' }}>{w}</em> : <span key={i}>{w} </span>
              )}
            </h1>

            {curriculum.description && (
              <p style={{ fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '600px' }}>
                {curriculum.description}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="fade-up" style={{ animationDelay: '0.1s', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '48px' }}>
            {[
              { icon: '📚', value: lessons.length, label: 'Total lessons' },
              { icon: '🎯', value: [...new Set(lessons.map((cl: any) => cl.lesson?.level))].join(', ') || '—', label: 'Levels covered' },
              { icon: '🌐', value: [...new Set(lessons.map((cl: any) => cl.lesson?.language))].join(', ') || '—', label: 'Language' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Lesson journey */}
          <div className="fade-up" style={{ animationDelay: '0.2s', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Learning journey</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>
              Follow this path in order for the best learning experience
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {lessons.map((cl: any, idx: number) => {
                const lesson = cl.lesson
                if (!lesson) return null
                const levelColor = LEVEL_COLORS[lesson.level] || '#ff4b55'
                return (
                  <div key={cl.id} style={{ display: 'flex', gap: '0', position: 'relative' }}>
                    {/* Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px', flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ff4b55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 0 0 4px rgba(255,75,85,0.15)' }}>
                        {idx + 1}
                      </div>
                      {idx < lessons.length - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: '24px', background: 'linear-gradient(to bottom, rgba(255,75,85,0.4), rgba(255,75,85,0.1))', margin: '4px 0' }} />
                      )}
                    </div>

                    {/* Card */}
                    <div style={{ flex: 1, marginBottom: idx < lessons.length - 1 ? '8px' : '0', paddingBottom: '8px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px 20px', transition: 'border-color 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '6px', background: `${levelColor}20`, border: `1px solid ${levelColor}40`, fontSize: '11px', fontWeight: 600, color: levelColor }}>{lesson.level}</span>
                              <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{lesson.language}</span>
                              {lesson.unit && <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{lesson.unit}</span>}
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '6px', lineHeight: 1.3 }}>{lesson.title}</h3>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{lesson.goal}</p>
                          </div>
                          <a href={`/lesson/${lesson.slug}`} target="_blank"
                            style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,75,85,0.1)', border: '1px solid rgba(255,75,85,0.25)', color: '#ff4b55', fontSize: '12px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}>
                            Open lesson →
                          </a>
                        </div>

                        {/* Mini stats */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                          {lesson.vocab?.length > 0 && (
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>📚 {lesson.vocab.length} vocabulary words</span>
                          )}
                          {lesson.exercise && (
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>✍️ {lesson.exercise.type?.replace(/-/g, ' ')}</span>
                          )}
                          {lesson.story && (
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>📖 Story included</span>
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
          <div className="fade-up" style={{ animationDelay: '0.3s', background: 'linear-gradient(135deg, rgba(255,75,85,0.08), rgba(0,188,124,0.05))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: 'clamp(24px,4vw,36px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,75,85,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <img src={LOGO} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,75,85,0.3)' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Akadian Academy</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Orlando, FL 🇺🇸 · EdTech Platform</p>
                </div>
              </div>
              <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '8px' }}>
                Real lessons. Real teachers. <span style={{ color: '#ff4b55' }}>Real US certificates — coming soon.</span>
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '20px', maxWidth: '500px' }}>
                This curriculum was built on Akadian Academy Studio — an AI-powered lesson builder for real teachers, expanding to Math, Technology, Sciences and Business.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: '#ff4b55', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,75,85,0.3)' }}>
                  ✦ Are you a teacher? Build free
                </a>
                <a href="https://www.akadianacademy.com" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
                  🌐 www.akadianacademy.com
                </a>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '16px' }}>
                Akadian Academy LLC · Orlando, Florida · United States of America
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>
              ← Back to Akadian
            </a>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="share-btn" onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>
              <button className="share-btn share-btn-primary" onClick={() => window.print()}>↓ Export PDF</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
