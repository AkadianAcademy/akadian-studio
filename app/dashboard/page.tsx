'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useLessonStore } from '@/store/lessonStore'
import CurriculumBuilder from '@/components/curriculum/CurriculumBuilder'

const LOGO = "https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/6a4ee16b45f610e39d0ba946_Frame%2032.png"
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
  const [showReferral, setShowReferral] = useState(true)
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
      const res = await fetch(`/api/lessons/${lessonId}/delete`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) { setLessons(prev => prev.filter((l: any) => l.id !== lessonId)) }
      else { alert('Delete failed: ' + data.error) }
    } catch (e) { console.error(e) }
    setDeletingId(null); setConfirmId(null)
  }

  async function handleDeleteCurriculum(id: string) {
    if (!token) return
    await fetch(`/api/curriculum/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    setCurricula(prev => prev.filter((c: any) => c.id !== id))
  }

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Teacher'

  if (!mounted || loading) return (
    <div style={{ minHeight: '100vh', background: '#0B0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(123,92,255,0.2)', borderTopColor: '#7B5CFF', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Loading your studio...</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500;1,6..72,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #FAFAF8; overflow-x: hidden; }
        .dash { min-height: 100vh; background: #FAFAF8; font-family: 'Hanken Grotesk', sans-serif; color: #1A1219; position: relative; overflow: hidden; }
        .orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .orb-a { width: min(600px,100vw); height: min(600px,100vw); background: radial-gradient(circle, rgba(123,92,255,0.06) 0%, transparent 65%); top: -15vh; left: -10vw; }
        .orb-b { width: min(400px,80vw); height: min(400px,80vw); background: radial-gradient(circle, rgba(200,255,61,0.08) 0%, transparent 65%); bottom: -10vh; right: -8vw; }
        .bg-dots { position: fixed; inset: 0; pointer-events: none; background-image: radial-gradient(circle, rgba(91,60,224,0.08) 1px, transparent 1px); background-size: 28px 28px; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 32px; border-bottom: 1px solid rgba(91,60,224,0.08); position: relative; z-index: 10; background: rgba(250,250,248,0.92); backdrop-filter: blur(16px); box-shadow: 0 1px 16px rgba(91,60,224,0.06); }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo img { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(91,60,224,0.2); }
        .nav-logo-text { font-size: 14px; font-weight: 700; color: #1A1219; }
        .nav-logo-sub { font-size: 11px; color: #9090A0; margin-top: 1px; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-badge { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 999px; background: rgba(91,60,224,0.08); border: 1px solid rgba(91,60,224,0.15); font-size: 11px; font-weight: 700; color: #7B5CFF; letter-spacing: 0.08em; text-transform: uppercase; }
        .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: #C8FF3D; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .signout-btn { padding: 7px 16px; border-radius: 999px; border: 1.5px solid rgba(91,60,224,0.15); background: transparent; color: #6B6575; font-family: 'Hanken Grotesk', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .signout-btn:hover { border-color: rgba(91,60,224,0.35); color: #5B3CE0; background: rgba(91,60,224,0.04); }
        .main { max-width: 1100px; margin: 0 auto; padding: clamp(32px,5vw,64px) clamp(20px,4vw,48px); position: relative; z-index: 1; }
        .hero { margin-bottom: clamp(36px,5vw,48px); opacity: 0; transform: translateY(20px); animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) 0.1s forwards; }
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        .hero-tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; background: rgba(91,60,224,0.07); border: 1px solid rgba(91,60,224,0.14); font-size: 11px; font-weight: 700; color: #7B5CFF; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; }
        .hero-title { font-family: 'Newsreader', Georgia, serif; font-size: clamp(30px,5vw,48px); line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 10px; color: #1A1219; }
        .hero-title em { color: #7B5CFF; font-style: italic; }
        .hero-sub { font-size: clamp(14px,2vw,16px); color: #6B6575; line-height: 1.7; max-width: 500px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: clamp(36px,5vw,44px); opacity: 0; animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) 0.2s forwards; }
        .stat-card { background: #fff; border: 1px solid rgba(91,60,224,0.08); border-radius: 16px; padding: 20px; transition: all 0.2s; box-shadow: 0 2px 12px rgba(91,60,224,0.06); }
        .stat-card:hover { border-color: rgba(91,60,224,0.2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(91,60,224,0.1); }
        .stat-value { font-size: clamp(24px,3vw,32px); font-weight: 800; color: #1A1219; letter-spacing: -0.03em; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #9090A0; font-weight: 500; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; opacity: 0; animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) 0.3s forwards; }
        .section-title { font-size: 18px; font-weight: 700; color: #1A1219; }
        .section-sub { font-size: 13px; color: #9090A0; margin-top: 2px; }
        .new-btn { display: flex; align-items: center; gap: 8px; padding: 11px 22px; background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); border: none; border-radius: 999px; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 20px rgba(91,60,224,0.3); min-height: 44px; }
        .new-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(91,60,224,0.4); }
        .empty-state { opacity: 0; animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) 0.4s forwards; }
        .empty-card { background: #fff; border: 1px dashed rgba(91,60,224,0.18); border-radius: 20px; padding: clamp(48px,8vw,80px) 40px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 4px 24px rgba(91,60,224,0.06); }
        .empty-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(123,92,255,0.04) 0%, transparent 60%); pointer-events: none; }
        .empty-icon-wrap { width: 72px; height: 72px; border-radius: 20px; background: rgba(91,60,224,0.08); border: 1px solid rgba(91,60,224,0.14); display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px; animation: pulse 3s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(91,60,224,0.12)} 50%{box-shadow:0 0 0 12px rgba(91,60,224,0)} }
        .empty-title { font-size: clamp(20px,3vw,26px); font-weight: 700; margin-bottom: 10px; letter-spacing: -0.02em; color: #1A1219; }
        .empty-desc { font-size: 15px; color: #6B6575; line-height: 1.7; max-width: 420px; margin: 0 auto 28px; }
        .empty-cta { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); border: none; border-radius: 999px; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 24px rgba(91,60,224,0.3); min-height: 44px; }
        .empty-cta:hover { opacity: 0.9; transform: translateY(-1px); }
        .empty-features { display: flex; justify-content: center; gap: clamp(16px,3vw,32px); margin-top: 32px; flex-wrap: wrap; }
        .empty-feature { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #9090A0; }
        .empty-feature-dot { width: 4px; height: 4px; border-radius: 50%; background: #7B5CFF; }
        .lessons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; opacity: 0; animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) 0.4s forwards; }
        .lesson-card { background: #fff; border: 1px solid rgba(91,60,224,0.08); border-radius: 16px; padding: 20px; transition: all 0.2s; box-shadow: 0 2px 12px rgba(91,60,224,0.05); }
        .lesson-card:hover { border-color: rgba(91,60,224,0.22); box-shadow: 0 8px 28px rgba(91,60,224,0.1); transform: translateY(-2px); }
        .lesson-tags { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .lesson-tag { padding: 3px 10px; border-radius: 999px; background: rgba(91,60,224,0.06); font-size: 11px; color: #7B5CFF; font-weight: 600; }
        .lesson-tag-live { background: rgba(0,188,124,0.08); color: #00A067; border: 1px solid rgba(0,188,124,0.2); }
        .lesson-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; line-height: 1.4; cursor: pointer; transition: color 0.2s; color: #1A1219; }
        .lesson-title:hover { color: #7B5CFF; }
        .lesson-goal { font-size: 13px; color: #9090A0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .preview-btn { flex: 1; padding: 8px 7px; background: rgba(91,60,224,0.06); border: 1.5px solid rgba(91,60,224,0.14); border-radius: 999px; color: #7B5CFF; font-size: 12px; cursor: pointer; font-family: 'Hanken Grotesk', sans-serif; transition: all 0.2s; font-weight: 600; min-height: 36px; }
        .preview-btn:hover { background: rgba(91,60,224,0.12); border-color: rgba(91,60,224,0.28); }
        .delete-btn { padding: 8px 10px; background: rgba(0,0,0,0.02); border: 1.5px solid rgba(0,0,0,0.07); border-radius: 999px; color: #C0B8CC; font-size: 12px; cursor: pointer; font-family: 'Hanken Grotesk', sans-serif; transition: all 0.2s; min-height: 36px; }
        .delete-btn:hover { border-color: rgba(220,60,60,0.25); color: rgba(220,60,60,0.7); background: rgba(220,60,60,0.04); }
        .pw-card { background: #fff; border: 1px solid rgba(91,60,224,0.10); border-radius: 18px; overflow: hidden; transition: transform 0.22s cubic-bezier(.16,1,.3,1), box-shadow 0.22s ease, border-color 0.22s ease; box-shadow: 0 2px 12px rgba(91,60,224,0.05); display: flex; flex-direction: column; }
        .pw-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(91,60,224,0.14); border-color: rgba(91,60,224,0.22); }
        .pw-cover { position: relative; padding: 16px 18px; background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); overflow: hidden; }
        .pw-cover::after { content: ''; position: absolute; top: -40px; right: -30px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%); pointer-events: none; }
        .pw-cover-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; position: relative; z-index: 1; }
        .pw-subject { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.92); }
        .pw-count { flex-shrink: 0; font-size: 11px; font-weight: 800; color: #0D1117; background: #C8FF3D; padding: 3px 10px; border-radius: 999px; }
        .pw-title { font-size: 16px; font-weight: 800; color: #fff; line-height: 1.3; margin-top: 10px; position: relative; z-index: 1; cursor: pointer; letter-spacing: -0.01em; }
        .pw-body { padding: 16px 18px 18px; display: flex; flex-direction: column; flex: 1; }
        .pw-desc { font-size: 13px; color: #6B6575; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 14px; }
        .pw-lessons { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .pw-lesson { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .pw-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 7px; background: rgba(123,92,255,0.10); color: #5B3CE0; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .pw-lname { font-size: 12.5px; color: #4A4460; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pw-more { font-size: 11.5px; color: #9090A0; padding-left: 32px; font-weight: 600; }
        .pw-actions { display: flex; gap: 8px; margin-top: auto; }
        .pw-view { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px; background: linear-gradient(135deg, #7B5CFF, #5B3CE0); border: none; border-radius: 10px; color: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.18s; box-shadow: 0 4px 14px rgba(91,60,224,0.22); }
        .pw-view:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91,60,224,0.32); }
        .pw-pdf { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 14px; background: rgba(200,255,61,0.16); border: 1px solid rgba(150,190,30,0.4); border-radius: 10px; color: #4d7c0f; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.18s; }
        .pw-pdf:hover { background: rgba(200,255,61,0.28); }
        .pw-del { flex-shrink: 0; width: 40px; padding: 9px 0; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.07); border-radius: 10px; color: #C0B8CC; font-size: 13px; cursor: pointer; font-family: inherit; transition: all 0.18s; }
        .pw-del:hover { border-color: rgba(225,29,72,0.3); color: #E11D48; background: rgba(225,29,72,0.05); }
        @media (max-width: 640px) { .stats { grid-template-columns: 1fr; } .nav { padding: 12px 20px; } .nav-badge { display: none; } }
      `}</style>

      <div className="dash">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="bg-dots" />

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

          {/* Referral Card */}
          {showReferral && (
            <div style={{ marginBottom: '28px', background: 'linear-gradient(135deg, #0D1117 0%, #1A1233 100%)', border: '1px solid rgba(123,92,255,0.2)', borderRadius: '20px', padding: 'clamp(20px,3vw,28px)', position: 'relative', overflow: 'hidden', opacity: 0, animation: 'fadeUp 0.6s cubic-bezier(.16,1,.3,1) 0.25s forwards', boxShadow: '0 8px 32px rgba(91,60,224,0.15)' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,61,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, left: 60, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
              {/* X button */}
              <button onClick={() => setShowReferral(false)}
                style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'all 0.2s', zIndex: 2 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}>
                ×
              </button>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(200,255,61,0.1)', border: '1px solid rgba(200,255,61,0.25)', borderRadius: '999px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: '#C8FF3D', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8FF3D', display: 'inline-block', animation: 'blink 2s ease-in-out infinite' }} />
                    Referral Program
                  </div>
                  <h3 style={{ fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px', lineHeight: 1.3 }}>
                    Bring someone on board.<br />
                    <span style={{ color: '#C8FF3D' }}>Earn 10–20% monthly.</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '420px', marginBottom: '14px' }}>
                    Invite a teacher or student to a live demo class. Every time they subscribe, you earn a recurring commission.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <a href="https://www.akadianacademy.com/sesiones-en-vivo" target="_blank"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: '#C8FF3D', borderRadius: '999px', color: '#0B0F1E', fontSize: '13px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 20px rgba(200,255,61,0.25)', transition: 'all 0.2s', whiteSpace: 'nowrap', minHeight: '40px' }}>
                      🎓 Invite to a demo →
                    </a>
                    <a href="https://www.akadianacademy.com/unete-gratis#top" target="_blank"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap', minHeight: '40px' }}>
                      ✦ Join free
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section toggle */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: '#fff', border: '1px solid rgba(91,60,224,0.1)', boxShadow: '0 2px 8px rgba(91,60,224,0.06)', borderRadius: '999px', padding: '4px', width: 'fit-content', opacity: 0, animation: 'fadeUp 0.6s cubic-bezier(.16,1,.3,1) 0.25s forwards' }}>
            <button onClick={() => setActiveSection('lessons')} style={{ padding: '8px 20px', borderRadius: '999px', border: 'none', background: activeSection === 'lessons' ? 'linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%)' : 'transparent', color: activeSection === 'lessons' ? '#fff' : '#6B6575', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: activeSection === 'lessons' ? '0 4px 16px rgba(91,60,224,0.3)' : 'none', minHeight: '36px' }}>
              📚 My Lessons {lessons.length > 0 && `(${lessons.length})`}
            </button>
            <button onClick={() => setActiveSection('curricula')} style={{ padding: '8px 20px', borderRadius: '999px', border: 'none', background: activeSection === 'curricula' ? 'linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%)' : 'transparent', color: activeSection === 'curricula' ? '#fff' : '#6B6575', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: activeSection === 'curricula' ? '0 4px 16px rgba(91,60,224,0.3)' : 'none', minHeight: '36px' }}>
              🗺 My Pathways {curricula.length > 0 && `(${curricula.length})`}
            </button>
          </div>

          {/* LESSONS */}
          {activeSection === 'lessons' && (
            <>
              <div className="section-header">
                <div>
                  <div className="section-title">Your lessons</div>
                  <div className="section-sub">{lessons.length === 0 ? 'Nothing here yet — your first lesson awaits' : `${lessons.length} lesson${lessons.length > 1 ? 's' : ''} built`}</div>
                </div>
                <button className="new-btn" onClick={() => { reset(); setTimeout(() => router.push('/builder/new'), 50) }}>+ New lesson</button>
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
                    <div key={lesson.id} className="lesson-card" style={{
                        background: ['A1'].includes(lesson.level) ? 'linear-gradient(135deg, #F0FFFE 0%, #E8F5FF 100%)' :
                                    ['A2'].includes(lesson.level) ? 'linear-gradient(135deg, #F0FFF8 0%, #E8FFEF 100%)' :
                                    ['B1'].includes(lesson.level) ? 'linear-gradient(135deg, #EEF2FF 0%, #F0EEFF 100%)' :
                                    ['B2'].includes(lesson.level) ? 'linear-gradient(135deg, #F5F0FF 0%, #EDE8FF 100%)' :
                                    ['C1'].includes(lesson.level) ? 'linear-gradient(135deg, #FFFBEE 0%, #FFF3E0 100%)' :
                                    'linear-gradient(135deg, #FFF0F8 0%, #FFE8F5 100%)'
                      }}>
                      <div className="lesson-tags">
                        <span className="lesson-tag">{lesson.language}</span>
                        <span className="lesson-tag">{lesson.level}</span>
                        {lesson.published && <span className="lesson-tag lesson-tag-live">Live</span>}
                      </div>
                      <div className="lesson-title" onClick={() => router.push(`/lesson/${lesson.slug}`)}>{lesson.title}</div>
                      <div className="lesson-goal">{lesson.goal}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button className="preview-btn" onClick={() => router.push(`/lesson/${lesson.slug}`)}>👁 Preview</button>
                        {confirmId === lesson.id ? (
                          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                            <button onClick={() => handleDelete(lesson.id)} disabled={deletingId === lesson.id}
                              style={{ flex: 1, padding: '8px 7px', background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '999px', color: '#ff6b6b', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minHeight: '36px' }}>
                              {deletingId === lesson.id ? '...' : 'Confirm'}
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              style={{ flex: 1, padding: '8px 7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', minHeight: '36px' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button className="delete-btn" onClick={() => setConfirmId(lesson.id)}>🗑</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* CURRICULA */}
          {activeSection === 'curricula' && (
            <>
              <div className="section-header">
                <div>
                  <div className="section-title">Your pathways</div>
                  <div className="section-sub">{curricula.length === 0 ? 'No pathways yet — build your first teaching roadmap' : `${curricula.length} pathway${curricula.length > 1 ? 's' : ''} created`}</div>
                </div>
                <button className="new-btn" onClick={() => setShowCurriculumBuilder(true)}>+ Build pathway</button>
              </div>
              {curricula.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-card">
                    <div className="empty-icon-wrap">🗺</div>
                    <h2 className="empty-title">Build your first pathway</h2>
                    <p className="empty-desc">Group your lessons into a structured learning path. Share it, export it as PDF, or show the world what you teach.</p>
                    <button className="empty-cta" onClick={() => setShowCurriculumBuilder(true)}>✦ Create first pathway</button>
                    <div className="empty-features">
                      {['Languages', 'Math (soon)', 'Technology (soon)', 'Sciences (soon)', 'Business (soon)'].map(f => (
                        <div key={f} className="empty-feature"><span className="empty-feature-dot" />{f}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lessons-grid">
                  {curricula.map((c: any) => {
                    const count = c.lessons?.length || 0
                    return (
                    <div key={c.id} className="pw-card">
                      <div className="pw-cover">
                        <div className="pw-cover-top">
                          <span className="pw-subject">{c.subject || 'Pathway'}</span>
                          <span className="pw-count">{count} {count === 1 ? 'lesson' : 'lessons'}</span>
                        </div>
                        <div className="pw-title" onClick={() => router.push(`/curriculum/${c.id}`)}>{c.title}</div>
                      </div>
                      <div className="pw-body">
                        {c.description && <div className="pw-desc">{c.description}</div>}
                        {count > 0 && (
                          <div className="pw-lessons">
                            {c.lessons.slice(0, 3).map((cl: any, i: number) => (
                              <div key={cl.id} className="pw-lesson">
                                <span className="pw-num">{i + 1}</span>
                                <span className="pw-lname">{cl.lesson?.title || 'Untitled lesson'}</span>
                              </div>
                            ))}
                            {count > 3 && <div className="pw-more">+{count - 3} more lesson{count - 3 > 1 ? 's' : ''}</div>}
                          </div>
                        )}
                        <div className="pw-actions">
                          <button className="pw-view" onClick={() => router.push(`/curriculum/${c.id}`)}>👁 View</button>
                          <button className="pw-pdf" onClick={() => { router.push(`/curriculum/${c.id}`); setTimeout(() => window.print(), 1000) }}>↓ PDF</button>
                          <button className="pw-del" onClick={() => handleDeleteCurriculum(c.id)}>🗑</button>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

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
