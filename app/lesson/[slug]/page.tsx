'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'

const TeachingCanvas = dynamic(
  () => import('@/components/canvas/TeachingCanvas'),
  { ssr: false, loading: () => (
    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
      Loading canvas...
    </div>
  )}
)

const LOGO = "https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/69cbd2f11214dfc14b33eadb_logo%20akadian.png"

export default function PublicLessonPage() {
  const params = useParams()
  const slug = params.slug as string
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'vocab'|'exercise'|'story'|'debate'|'canvas'>('vocab')
  const [canvasMode, setCanvasMode] = useState<'student'|'teacher'>('student')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Load lesson
      const res = await fetch(`/api/lessons/${slug}`)
      const d = await res.json()
      if (d.lesson) {
        setLesson(d.lesson)
        // Check if current user owns this lesson
        const { data: { user } } = await supabase.auth.getUser()
        if (user && d.lesson.userId === user.id) {
          setCanvasMode('teacher')
        }
      } else {
        setError('Lesson not found')
      }
      setLoading(false)
    }
    load()
  }, [slug])

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
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Loading lesson...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0b172b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <p style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Lesson not found</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>This lesson may have been removed or the link is incorrect.</p>
      </div>
    </div>
  )

  const exercise = lesson.exercise
  const story = lesson.story

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0b172b; overflow-x: hidden; }
        .page { min-height: 100vh; background: #0b172b; font-family: 'DM Sans', sans-serif; color: #fff; }
        .bg-orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .orb-a { width: min(700px,100vw); height: min(700px,100vw); background: radial-gradient(circle, rgba(255,75,85,0.08) 0%, transparent 65%); top: -20vh; left: -15vw; }
        .orb-b { width: min(500px,80vw); height: min(500px,80vw); background: radial-gradient(circle, rgba(0,188,124,0.06) 0%, transparent 65%); bottom: -15vh; right: -10vw; }
        .bg-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px); background-size: 40px 40px; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 16px clamp(20px,5vw,64px); border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(12px); background: rgba(11,23,43,0.85); position: sticky; top: 0; z-index: 100; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo img { width: 30px; height: 30px; border-radius: 50%; }
        .nav-logo-text { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); }
        .nav-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .share-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.6); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .share-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .share-btn-primary { background: #ff4b55; border-color: #ff4b55; color: #fff; }
        .share-btn-primary:hover { opacity: 0.9; }
        .teacher-badge { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 100px; background: rgba(0,188,124,0.1); border: 1px solid rgba(0,188,124,0.25); font-size: 11px; font-weight: 600; color: #00bc7c; letter-spacing: 0.06em; }
        .hero { max-width: 900px; margin: 0 auto; padding: clamp(40px,6vw,80px) clamp(20px,5vw,64px) 0; position: relative; z-index: 1; }
        .hero-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 12px; color: rgba(255,255,255,0.3); }
        .hero-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .hero-tag { padding: 4px 12px; border-radius: 100px; background: rgba(255,75,85,0.1); border: 1px solid rgba(255,75,85,0.2); font-size: 12px; font-weight: 600; }
        .hero-title { font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(32px,5vw,56px); line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 16px; }
        .hero-title em { color: #ff4b55; font-style: italic; }
        .hero-goal { font-size: clamp(15px,2vw,17px); color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 600px; margin-bottom: 32px; }
        .impact-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 40px; }
        .impact-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px; transition: border-color 0.2s; }
        .impact-card:hover { border-color: rgba(255,75,85,0.2); }
        .impact-icon { font-size: 22px; margin-bottom: 8px; }
        .two-col { max-width: 900px; margin: 0 auto; padding: 0 clamp(20px,5vw,64px); display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; position: relative; z-index: 1; }
        .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 22px; }
        .info-card-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
        .flow-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .flow-item:last-child { border-bottom: none; }
        .flow-num { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .content { max-width: 900px; margin: 0 auto; padding: 0 clamp(20px,5vw,64px); position: relative; z-index: 1; }
        .tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 4px; margin-bottom: 28px; overflow-x: auto; }
        .tab { flex: 1; padding: 10px 12px; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; min-width: 80px; text-align: center; }
        .tab-on { background: #ff4b55; color: #fff; }
        .tab-off { background: transparent; color: rgba(255,255,255,0.4); }
        .tab-off:hover { color: rgba(255,255,255,0.7); }
        .vocab-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 10px; }
        .vocab-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 16px; transition: all 0.2s; }
        .vocab-card:hover { border-color: rgba(255,75,85,0.3); transform: translateY(-1px); }
        .vocab-word { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px; }
        .vocab-translation { font-size: 13px; color: #ff4b55; }
        .sentence-list { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        .sentence-card { background: rgba(255,255,255,0.02); border-left: 2px solid rgba(255,75,85,0.3); padding: 12px 16px; border-radius: 0 10px 10px 0; }
        .sentence-en { font-size: 14px; font-weight: 500; color: #fff; margin-bottom: 4px; }
        .sentence-tr { font-size: 13px; color: rgba(255,255,255,0.4); }
        .story-body { font-size: clamp(14px,2vw,16px); color: rgba(255,255,255,0.75); line-height: 1.9; white-space: pre-line; }
        .exercise-instructions { background: rgba(255,75,85,0.07); border: 1px solid rgba(255,75,85,0.15); border-radius: 12px; padding: 14px 18px; margin-bottom: 18px; font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; }
        .exercise-content { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 2; white-space: pre-line; }
        .debate-section { margin-bottom: 24px; }
        .debate-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; padding: 4px 10px; border-radius: 6px; display: inline-block; }
        .debate-content { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 2; white-space: pre-line; }
        .lesson-footer { max-width: 900px; margin: 48px auto 0; padding: 24px clamp(20px,5vw,64px) 48px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; position: relative; z-index: 1; }
        .section-header { margin-bottom: 20px; }
        .section-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .section-sub { font-size: 13px; color: rgba(255,255,255,0.35); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { opacity:0; animation: fadeUp 0.5s ease forwards; }
        @media print {
          .bg-orb, .bg-grid { display: none !important; }
          .nav { position: relative !important; background: #0b172b !important; }
          .share-btn { display: none !important; }
          .tabs { display: none !important; }
          .fade-up { opacity: 1 !important; animation: none !important; }
          body { background: #0b172b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media (max-width: 640px) {
          .two-col { grid-template-columns: 1fr; }
          .impact-cards { grid-template-columns: 1fr; }
          .vocab-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="page">
        <div className="bg-orb orb-a" />
        <div className="bg-orb orb-b" />
        <div className="bg-grid" />

        {/* Nav */}
        <nav className="nav">
          <a href="/" className="nav-logo">
            <img src={LOGO} alt="Akadian" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
            <span className="nav-logo-text">Akadian Academy</span>
          </a>
          <div className="nav-right">
            {canvasMode === 'teacher' && (
              <div className="teacher-badge">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7c', display: 'inline-block' }} />
                Teacher view
              </div>
            )}
            <button className="share-btn" onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>
            <button className="share-btn share-btn-primary" onClick={() => window.print()}>↓ Save PDF</button>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero fade-up">
          <div className="hero-breadcrumb">
            <span>Akadian Library</span><span>→</span>
            <span>{lesson.language}</span><span>→</span>
            <span style={{ color: '#ff4b55' }}>{lesson.level}</span>
          </div>
          <div className="hero-tags">
            <span className="hero-tag" style={{ color: '#ff4b55' }}>{lesson.language}</span>
            <span className="hero-tag" style={{ color: '#ff4b55' }}>{lesson.level}</span>
            {lesson.unit && <span className="hero-tag" style={{ color: '#ff4b55' }}>{lesson.unit}</span>}
            <span className="hero-tag" style={{ background: 'rgba(0,188,124,0.1)', borderColor: 'rgba(0,188,124,0.2)', color: '#00bc7c' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00bc7c', marginRight: 5 }} />
              Free lesson
            </span>
          </div>
          <h1 className="hero-title">
            {lesson.title.split(' ').map((word: string, i: number, arr: string[]) =>
              i === arr.length - 1 ? <em key={i}>{word}</em> : <span key={i}>{word} </span>
            )}
          </h1>
          <p className="hero-goal">{lesson.goal}</p>
          <div className="impact-cards">
            {[
              { icon: '📚', label: `${lesson.vocab?.length || 0} vocabulary words`, desc: 'Core words for real situations' },
              { icon: '✍️', label: 'Full exercise included', desc: exercise?.type?.replace(/-/g,' ') || 'Practice activity' },
              { icon: '💬', label: 'Discussion questions', desc: '3 debate categories included' },
            ].map((c, i) => (
              <div key={i} className="impact-card">
                <div className="impact-icon">{c.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{c.label}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why + Flow */}
        <div className="two-col fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="info-card">
            <p className="info-card-label" style={{ color: '#00bc7c' }}>Why this lesson matters</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}>
              Language is access. This lesson gives students the exact words they need to handle real situations with confidence — not in a classroom, but in real life.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-label" style={{ color: 'rgba(255,255,255,0.3)' }}>Lesson flow</p>
            {[
              { num: '1', label: 'Vocabulary', desc: 'Learn the key words' },
              { num: '2', label: 'Story', desc: 'See them in context' },
              { num: '3', label: 'Exercise', desc: 'Practice under pressure' },
              { num: '4', label: 'Debate', desc: 'Think and discuss' },
              { num: '5', label: 'Canvas', desc: 'Teacher notes & annotations' },
            ].map(s => (
              <div key={s.num} className="flow-item">
                <div className="flow-num" style={{ background: 'rgba(255,75,85,0.15)', color: '#ff4b55' }}>{s.num}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{s.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="content fade-up" style={{ animationDelay: '0.25s' }}>
          <div className="tabs">
            {[
              { id: 'vocab', label: `📚 Vocabulary (${lesson.vocab?.length || 0})` },
              { id: 'story', label: '📖 Story' },
              { id: 'exercise', label: '✍️ Exercise' },
              { id: 'debate', label: '💬 Debate' },
              { id: 'canvas', label: canvasMode === 'teacher' ? '📌 Canvas (edit)' : '📌 Canvas' },
            ].map(t => (
              <button key={t.id} className={`tab ${activeTab === t.id ? 'tab-on' : 'tab-off'}`}
                onClick={() => setActiveTab(t.id as any)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Vocab */}
          {activeTab === 'vocab' && (
            <div>
              <div className="section-header">
                <div className="section-title">Core vocabulary</div>
                <div className="section-sub">Words you will actually use — learn them, then find them in the story</div>
              </div>
              <div className="vocab-grid">
                {lesson.vocab?.map((v: any) => (
                  <div key={v.id} className="vocab-card">
                    <div className="vocab-word">{v.word}</div>
                    <div className="vocab-translation">{v.translation}</div>
                  </div>
                ))}
              </div>
              {lesson.sentences?.length > 0 && (
                <>
                  <div style={{ margin: '32px 0 16px', fontSize: '16px', fontWeight: 600 }}>Example sentences</div>
                  <div className="sentence-list">
                    {lesson.sentences.map((s: any) => (
                      <div key={s.id} className="sentence-card">
                        <div className="sentence-en">{s.source}</div>
                        <div className="sentence-tr">{s.translation}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Story */}
          {activeTab === 'story' && story && (
            <div>
              <div className="section-header">
                <div className="section-title">Context story</div>
                <div className="section-sub">Read carefully — the vocabulary words are woven naturally into this story</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: 'clamp(20px,4vw,36px)', marginBottom: '24px' }}>
                <p className="story-body">{story.content}</p>
              </div>
              {story.imageUrl && (
                <div style={{ background: 'rgba(0,188,124,0.07)', border: '1px solid rgba(0,188,124,0.2)', borderRadius: '14px', padding: '18px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#00bc7c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>✦ Story illustration prompt</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '8px' }}>{story.imageUrl}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Use this in Midjourney, DALL-E, or any image generator</p>
                </div>
              )}
            </div>
          )}

          {/* Exercise */}
          {activeTab === 'exercise' && exercise && (
            <div>
              <div className="section-header">
                <div className="section-title">{exercise.type?.replace(/-/g,' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                <div className="section-sub">Complete this activity to practice the vocabulary in context</div>
              </div>
              {exercise.instructions && <div className="exercise-instructions">📋 {exercise.instructions}</div>}
              <div className="exercise-content">{exercise.content}</div>
            </div>
          )}

          {/* Debate */}
          {activeTab === 'debate' && story && (
            <div>
              <div className="section-header">
                <div className="section-title">Discussion & debate</div>
                <div className="section-sub">Three rounds — facts, meaning, and your own opinion</div>
              </div>
              {story.debateStory && (
                <div className="debate-section">
                  <span className="debate-label" style={{ background: 'rgba(255,75,85,0.1)', color: '#ff4b55' }}>About the story</span>
                  <p className="debate-content">{story.debateStory}</p>
                </div>
              )}
              {story.debateMoral && (
                <div className="debate-section">
                  <span className="debate-label" style={{ background: 'rgba(255,188,0,0.1)', color: 'rgba(255,188,0,0.9)' }}>About the moral</span>
                  <p className="debate-content">{story.debateMoral}</p>
                </div>
              )}
              {story.debatePersonal && (
                <div className="debate-section">
                  <span className="debate-label" style={{ background: 'rgba(0,188,124,0.1)', color: '#00bc7c' }}>Personal opinions</span>
                  <p className="debate-content">{story.debatePersonal}</p>
                </div>
              )}
            </div>
          )}

          {/* Canvas */}
          {activeTab === 'canvas' && (
            <div>
              <div className="section-header">
                <div className="section-title">
                  {canvasMode === 'teacher' ? '📌 Teaching canvas — edit mode' : '📌 Teaching canvas'}
                </div>
                <div className="section-sub">
                  {canvasMode === 'teacher'
                    ? 'Add sticky notes, drag them around, and save. Students see everything you place here.'
                    : 'Vocabulary notes and annotations placed by your teacher during class'}
                </div>
              </div>
              {canvasMode === 'teacher' && (
                <div style={{ background: 'rgba(0,188,124,0.08)', border: '1px solid rgba(0,188,124,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#00bc7c' }}>✦</span>
                  You are in <strong style={{ color: '#00bc7c' }}>teacher edit mode</strong>. Students see this canvas in read-only. Add stickies, drag them, and save — changes are visible to everyone with the link.
                </div>
              )}
              <TeachingCanvas
                lessonId={lesson.id}
                mode={canvasMode}
                vocab={lesson.vocab || []}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="lesson-footer fade-up" style={{ animationDelay: '0.35s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={LOGO} style={{ width: 28, height: 28, borderRadius: '50%' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Akadian Academy Studio</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Built by a real teacher for real students</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              ← Back to Akadian
            </a>
            <button className="share-btn" onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>
            <button className="share-btn share-btn-primary" onClick={() => window.print()}>↓ Save PDF</button>
          </div>
        </div>

        {/* Akadian Academy Brand Block */}
        <div style={{ maxWidth: '900px', margin: '0 auto 48px', padding: '0 clamp(20px,5vw,64px)', position: 'relative', zIndex: 1 }}>

          {/* Main brand card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(11,23,43,0.9), rgba(11,23,43,0.95))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: 'clamp(24px,4vw,40px)', overflow: 'hidden', position: 'relative' }}>

            {/* Background glow */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,75,85,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,188,124,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <img src="https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/69cbd2f11214dfc14b33eadb_logo%20akadian.png"
                  style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,75,85,0.3)' }}
                  onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Akadian Academy</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Orlando, FL 🇺🇸 · EdTech Platform</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(0,188,124,0.1)', border: '1px solid rgba(0,188,124,0.25)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7c', animation: 'blink 2s ease-in-out infinite' }} />
                  <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#00bc7c', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Now live</span>
                </div>
              </div>

              {/* Mission */}
              <p style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: '10px' }}>
                Real lessons. Real teachers.<br />
                <span style={{ color: '#ff4b55' }}>Real US certificates — coming soon.</span>
              </p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '560px', marginBottom: '24px' }}>
                Akadian Academy is building the EdTech platform that actually certifies what you know.
                We started with language — and we're expanding to math, technology, sciences, and business.
                Every lesson on this platform is a step toward something that matters.
              </p>

              {/* Feature pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {['🌐 Languages', '📐 Math (soon)', '💻 Technology (soon)', '🔬 Sciences (soon)', '📊 Business (soon)'].map(f => (
                  <span key={f} style={{ padding: '5px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {canvasMode === 'student' ? (
                  <>
                    <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#ff4b55', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,75,85,0.3)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                      ✦ Are you a teacher? Build free
                    </a>
                    <a href="https://www.akadianacademy.com" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                      🌐 Visit akadianacademy.com
                    </a>
                  </>
                ) : (
                  <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#ff4b55', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,75,85,0.3)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                    ← Back to your studio
                  </a>
                )}
              </div>

              {/* Fine print */}
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '20px', lineHeight: 1.6 }}>
                Akadian Academy LLC · Orlando, Florida · United States of America · <a href='https://www.akadianacademy.com' target='_blank' style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>www.akadianacademy.com</a><br />
                This lesson was created using Akadian Academy Studio — an AI-powered lesson builder for real teachers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
