'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useLessonStore } from '@/store/lessonStore'
import CurriculumBuilder from '@/components/curriculum/CurriculumBuilder'

const LOGO = "https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/69cbd2f11214dfc14b33eadb_logo%20akadian.png"
const STATS = [
  { value: '12,480+', label: 'Future learners reached' },
  { value: '3 min', label: 'Avg lesson build time' },
  { value: '6', label: 'Exercise types' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [curricula, setCurricula] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'lessons' | 'curricula'>('lessons')
  const [showCurriculumBuilder, setShowCurriculumBuilder] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { reset } = useLessonStore()

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setToken(session.access_token)
      Promise.all([
        fetch('/api/lessons', { headers: { 'Authorization': `Bearer ${session.access_token}` } }).then(r => r.json()),
        fetch('/api/curriculum', { headers: { 'Authorization': `Bearer ${session.access_token}` } }).then(r => r.json()),
      ]).then(([lessonsData, curriculaData]) => {
        setLessons(lessonsData.lessons || [])
        setCurricula(curriculaData.curricula || [])
        setLoading(false)
      }).catch(() => setLoading(false))
    })
  }, [])

  async function handleDelete(lessonId: string) {
    if (!token) return
    setDeletingId(lessonId)
    try {
      await fetch(`/api/lessons/${lessonId}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setLessons(prev => prev.filter((l: any) => l.id !== lessonId))
    } catch (e) { console.error(e) }
    setDeletingId(null)
    setConfirmId(null)
  }

  async function handleDeleteCurriculum(id: string) {
    if (!token) return
    await fetch(`/api/curriculum/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    setCurricula(prev => prev.filter((c: any) => c.id !== id))
  }

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Teacher'

  if (!mounted || loading) return (
    <div style={{ minHeight: '100vh', background: '#0b172b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,75,85,0.3)', borderTopColor: '#ff4b55', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Loading your studio...</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0b172b; overflow-x: hidden; }
        .dash { min-height: 100vh; background: #0b172b; font-family: 'DM Sans', sans-serif; color: #fff; position: relative; overflow: hidden; }
        .bg-orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .orb-a { width: min(700px,100vw); height: min(700px,100vw); background: radial-gradient(circle, rgba(255,75,85,0.1) 0%, transparent 65%); top: -20vh; left: -15vw; }
        .orb-b { width: min(500px,80vw); height: min(500px,80vw); background: radial-gradient(circle, rgba(0,188,124,0.07) 0%, transparent 65%); bottom: -15vh; right: -10vw; }
        .bg-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px); background-size: 40px 40px; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; z-index: 10; backdrop-filter: blur(12px); background: rgba(11,23,43,0.8); }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo img { width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(255,75,85,0.3); }
        .nav-logo-text { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .nav-logo-sub { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 1px; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-badge { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 100px; background: rgba(0,188,124,0.1); border: 1px solid rgba(0,188,124,0.2); font-size: 11px; font-weight: 600; color: #00bc7c; letter-spacing: 0.06em; text-transform: uppercase; }
        .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: #00bc7c; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .signout-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .signout-btn:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); }
        .main { max-width: 1100px; margin: 0 auto; padding: clamp(32px,5vw,64px) clamp(20px,4vw,48px); position: relative; z-index: 1; }
        .hero { margin-bottom: clamp(40px,6vw,64px); opacity: 0; transform: translateY(20px); animation: fadeUp 0.6s ease 0.1s forwards; }
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        .hero-tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 100px; background: rgba(255,75,85,0.1); border: 1px solid rgba(255,75,85,0.2); font-size: 11px; font-weight: 600; color: #ff4b55; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
        .hero-title { font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(32px,5vw,52px); line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 12px; }
        .hero-title em { color: #ff4b55; font-style: italic; }
        .hero-sub { font-size: clamp(14px,2vw,16px); color: rgba(255,255,255,0.4); line-height: 1.7; max-width: 500px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: clamp(40px,6vw,56px); opacity: 0; animation: fadeUp 0.6s ease 0.2s forwards; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; transition: border-color 0.2s, transform 0.2s; }
        .stat-card:hover { border-color: rgba(255,75,85,0.2); transform: translateY(-2px); }
        .stat-value { font-size: clamp(24px,3vw,32px); font-weight: 700; color: #fff; letter-spacing: -0.03em; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.35); }
        .section-toggle { display: flex; gap: '6px'; margin-bottom: 28px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 4px; width: fit-content; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; opacity: 0; animation: fadeUp 0.6s ease 0.3s forwards; }
        .section-title { font-size: 18px; font-weight: 600; }
        .section-sub { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .new-btn { display: flex; align-items: center; gap: 8px; padding: 11px 22px; background: #ff4b55; border: none; border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(255,75,85,0.3); }
        .new-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .empty-state { opacity: 0; animation: fadeUp 0.6s ease 0.4s forwards; }
        .empty-card { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 20px; padding: clamp(48px,8vw,80px) 40px; text-align: center; position: relative; overflow: hidden; }
        .empty-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(255,75,85,0.05) 0%, transparent 60%); pointer-events: none; }
        .empty-icon-wrap { width: 72px; height: 72px; border-radius: 20px; background: rgba(255,75,85,0.1); border: 1px solid rgba(255,75,85,0.2); display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px; animation: pulse 3s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,75,85,0.15)} 50%{box-shadow:0 0 0 12px rgba(255,75,85,0)} }
        .empty-title { font-size: clamp(20px,3vw,26px); font-weight: 700; margin-bottom: 10px; letter-spacing: -0.02em; }
        .empty-desc { font-size: 15px; color: rgba(255,255,255,0.4); line-height: 1.7; max-width: 420px; margin: 0 auto 28px; }
        .empty-cta { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: #ff4b55; border: none; border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 24px rgba(255,75,85,0.3); }
        .empty-cta:hover { opacity: 0.9; transform: translateY(-1px); }
        .empty-features { display: flex; justify-content: center; gap: clamp(16px,3vw,32px); margin-top: 32px; flex-wrap: wrap; }
        .empty-feature { display: flex; align-items: center; gap: 7px; font-size: 12px; color: rgba(255,255,255,0.3); }
        .empty-feature-dot { width: 4px; height: 4px; border-radius: 50%; background: #00bc7c; }
        .lessons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; opacity: 0; animation: fadeUp 0.6s ease 0.4s forwards; }
        .lesson-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; transition: all 0.2s; }
        .lesson-card:hover { border-color: rgba(255,75,85,0.2); }
        .lesson-tags { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .lesson-tag { padding: 3px 10px; border-radius: 100px; background: rgba(255,255,255,0.06); font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 500; }
        .lesson-tag-live { background: rgba(255,75,85,0.15); color: #ff4b55; border: 1px solid rgba(255,75,85,0.2); }
        .lesson-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; line-height: 1.4; cursor: pointer; }
        .lesson-title:hover { color: #ff4b55; }
        .lesson-goal { font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @media (max-width: 640px) { .stats { grid-template-columns: 1fr; } .nav { padding: 14px 20px; } .nav-badge { display: none; } }
      `}</style>

      <div className="dash">
        <div className="bg-orb orb-a" />
        <div className="bg-orb orb-b" />
        <div className="bg-grid" />

        <nav className="nav">
          <div className="nav-logo">
            <img src={LOGO} alt="Akadian" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
            <div>
              <div className="nav-logo-text">Akadian Academy Studio</div>
              <div className="nav-logo-sub">Built for real teachers shaping real futures</div>
            </div>
          </div>
          <div className="nav-right">
            <div className="nav-badge"><span className="nav-dot" />AI Active</div>
            <button className="signout-btn" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>Sign out</button>
          </div>
        </nav>

        <main className="main">
          {/* Hero */}
          <div className="hero">
            <div className="hero-tag">✦ Your Studio</div>
            <h1 className="hero-title">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
              <em>{firstName}.</em>
            </h1>
            <p className="hero-sub">Every lesson you build here has the potential to change someone's real life. Let's make something worth teaching.</p>
          </div>

          {/* Stats */}
          <div className="stats">
            {STATS.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section toggle */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '4px', width: 'fit-content', opacity: 0, animation: 'fadeUp 0.6s ease 0.25s forwards' }}>
            <button onClick={() => setActiveSection('lessons')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: activeSection === 'lessons' ? '#ff4b55' : 'transparent', color: activeSection === 'lessons' ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              📚 My Lessons {lessons.length > 0 && `(${lessons.length})`}
            </button>
            <button onClick={() => setActiveSection('curricula')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: activeSection === 'curricula' ? '#ff4b55' : 'transparent', color: activeSection === 'curricula' ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              🗺 My Curricula {curricula.length > 0 && `(${curricula.length})`}
            </button>
          </div>

          {/* LESSONS section */}
          {activeSection === 'lessons' && (
            <>
              <div className="section-header">
                <div>
                  <div className="section-title">Your lessons</div>
                  <div className="section-sub">{lessons.length === 0 ? 'Nothing here yet — your first lesson awaits' : `${lessons.length} lesson${lessons.length > 1 ? 's' : ''} built`}</div>
                </div>
                <button className="new-btn" onClick={() => { reset(); setTimeout(() => router.push('/builder/new'), 50) }}>
                  + New lesson
                </button>
              </div>

              {lessons.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-card">
                    <div className="empty-icon-wrap">📚</div>
                    <h2 className="empty-title">Your first lesson is waiting</h2>
                    <p className="empty-desc">Use AI to build a complete lesson — vocabulary, story, exercises, and a live canvas — in under 3 minutes.</p>
                    <button className="empty-cta" onClick={() => { reset(); setTimeout(() => router.push('/builder/new'), 50) }}>✦ Create your first lesson</button>
                    <div className="empty-features">
                      {['AI vocabulary', 'Story generation', 'Exercise builder', 'Shareable link', 'Live canvas'].map(f => (
                        <div key={f} className="empty-feature"><span className="empty-feature-dot" />{f}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lessons-grid">
                  {lessons.map((lesson: any) => (
                    <div key={lesson.id} className="lesson-card">
                      <div className="lesson-tags">
                        <span className="lesson-tag">{lesson.language}</span>
                        <span className="lesson-tag">{lesson.level}</span>
                        {lesson.published && <span className="lesson-tag lesson-tag-live">Live</span>}
                      </div>
                      <div className="lesson-title" onClick={() => { reset(); router.push(`/builder/${lesson.id}`) }}>{lesson.title}</div>
                      <div className="lesson-goal">{lesson.goal}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button onClick={() => { reset(); router.push(`/builder/${lesson.id}`) }} style={{ flex: 1, padding: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => router.push(`/lesson/${lesson.slug}`)} style={{ flex: 1, padding: '7px', background: 'rgba(255,75,85,0.08)', border: '1px solid rgba(255,75,85,0.15)', borderRadius: '8px', color: '#ff4b55', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                          👁 Preview
                        </button>
                        {confirmId === lesson.id ? (
                          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                            <button onClick={() => handleDelete(lesson.id)} disabled={deletingId === lesson.id}
                              style={{ flex: 1, padding: '7px', background: '#ff4b55', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              {deletingId === lesson.id ? '...' : 'Confirm'}
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              style={{ flex: 1, padding: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(lesson.id)}
                            style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'rgba(255,255,255,0.25)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* CURRICULA section */}
          {activeSection === 'curricula' && (
            <>
              <div className="section-header">
                <div>
                  <div className="section-title">Your curricula</div>
                  <div className="section-sub">{curricula.length === 0 ? 'No curricula yet — build your first teaching roadmap' : `${curricula.length} curriculum${curricula.length > 1 ? 's' : ''} created`}</div>
                </div>
                <button className="new-btn" onClick={() => setShowCurriculumBuilder(true)}>+ Build curriculum</button>
              </div>

              {curricula.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-card">
                    <div className="empty-icon-wrap">🗺</div>
                    <h2 className="empty-title">Build your first curriculum</h2>
                    <p className="empty-desc">Group your lessons into a structured learning path. Share it, export it as PDF, or show the world what you teach.</p>
                    <button className="empty-cta" onClick={() => setShowCurriculumBuilder(true)}>✦ Create first curriculum</button>
                    <div className="empty-features">
                      {['Languages', 'Math (soon)', 'Technology (soon)', 'Sciences (soon)', 'Business (soon)'].map(f => (
                        <div key={f} className="empty-feature"><span className="empty-feature-dot" />{f}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lessons-grid">
                  {curricula.map((c: any) => (
                    <div key={c.id} className="lesson-card">
                      <div className="lesson-tags">
                        <span className="lesson-tag">{c.subject}</span>
                        <span className="lesson-tag">{c.lessons?.length || 0} lessons</span>
                      </div>
                      <div className="lesson-title">{c.title}</div>
                      {c.description && <div className="lesson-goal">{c.description}</div>}
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {c.lessons?.slice(0, 3).map((cl: any, i: number) => (
                          <div key={cl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                            <span style={{ color: '#ff4b55', fontWeight: 700, minWidth: '14px' }}>{i + 1}</span>
                            <span>{cl.lesson?.title}</span>
                          </div>
                        ))}
                        {(c.lessons?.length || 0) > 3 && (
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', paddingLeft: '22px' }}>+{c.lessons.length - 3} more lessons</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button onClick={() => router.push(`/curriculum/${c.id}`)}
                          style={{ flex: 1, padding: '7px', background: 'rgba(255,75,85,0.08)', border: '1px solid rgba(255,75,85,0.15)', borderRadius: '8px', color: '#ff4b55', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                          👁 View
                        </button>
                        <button onClick={() => { router.push(`/curriculum/${c.id}`); setTimeout(() => window.print(), 1000) }}
                          style={{ flex: 1, padding: '7px', background: 'rgba(0,188,124,0.08)', border: '1px solid rgba(0,188,124,0.15)', borderRadius: '8px', color: '#00bc7c', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                          ↓ PDF
                        </button>
                        <button onClick={() => handleDeleteCurriculum(c.id)}
                          style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'rgba(255,255,255,0.25)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Curriculum builder modal */}
          {showCurriculumBuilder && (
            <CurriculumBuilder
              lessons={lessons}
              token={token || ''}
              onCreated={(c) => setCurricula(prev => [c, ...prev])}
              onClose={() => setShowCurriculumBuilder(false)}
            />
          )}
        </main>
      </div>
    </>
  )
}
