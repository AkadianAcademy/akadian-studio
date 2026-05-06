'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'

const EditPanel = dynamic(() => import('@/components/lesson/EditPanel'), { ssr: false })
const RichStoryDisplay = dynamic(() => import('@/components/lesson/RichStoryDisplay'), { ssr: false, loading: () => <div style={{padding:'40px',textAlign:'center',color:'rgba(255,255,255,0.3)'}}>Loading story...</div> })
const RichDebateDisplay = dynamic(() => import('@/components/lesson/RichDebateDisplay'), { ssr: false, loading: () => <div style={{padding:'40px',textAlign:'center',color:'rgba(255,255,255,0.3)'}}>Loading debate...</div> })
const TeachingCanvas = dynamic(() => import('@/components/canvas/TeachingCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
      Loading canvas...
    </div>
  )
})

const LOGO = "https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/69cbd2f11214dfc14b33eadb_logo%20akadian.png"
type Tab = 'vocab' | 'story' | 'exercise' | 'debate' | 'debate2' | 'canvas'

export default function PublicLessonPage() {
  const params = useParams()
  const slug = params.slug as string
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('vocab')
  const [canvasMode, setCanvasMode] = useState<'student' | 'teacher'>('student')
  const [editableLesson, setEditableLesson] = useState<any>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [mobileSection, setMobileSection] = useState('vocab')
  const [mobileView, setMobileView] = useState<'home' | string>('home')
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/lessons/${slug}`)
      const d = await res.json()
      if (d.lesson) {
        setLesson(d.lesson)
        setEditableLesson(d.lesson)
        const { data: { user } } = await supabase.auth.getUser()
        if (user && d.lesson.userId === user.id) setCanvasMode('teacher')
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

  const TABS = [
    { id: 'vocab' as Tab, icon: '📚', label: 'Vocab', short: 'Vocab' },
    { id: 'story' as Tab, icon: '📖', label: 'Story', short: 'Story' },
    { id: 'exercise' as Tab, icon: '✍️', label: 'Exercise', short: 'Exercise' },
    { id: 'debate' as Tab, icon: '💬', label: 'Questions', short: 'Questions' },
    { id: 'debate2' as Tab, icon: '🗣', label: 'Debate', short: 'Debate' },
    { id: 'canvas' as Tab, icon: '📌', label: 'Canvas', short: 'Canvas' },
  ]

  const LEVEL_COLORS: Record<string, string> = {
    A1: '#00bc7c', A2: '#34d399', B1: '#3b82f6', B2: '#8b5cf6', C1: '#f59e0b', Conversation: '#ff4b55'
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
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <p style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}>Lesson not found</p>
      </div>
    </div>
  )

  const exercise = lesson.exercise
  const story = lesson.story
  const levelColor = LEVEL_COLORS[lesson.level] || '#ff4b55'

  const tabContent: Record<Tab, React.ReactNode> = {
    vocab: (
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
    ),
    story: story ? (
      <div>
        <div className="section-header">
          <div className="section-title">Context story</div>
          <div className="section-sub">Read carefully — the vocabulary words are woven naturally into this story</div>
        </div>
        <RichStoryDisplay content={story.content} vocab={lesson.vocab || []} imagePrompt={story.imageUrl} />
      </div>
    ) : <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>No story yet.</div>,
    exercise: exercise ? (
      <div>
        <div className="section-header">
          <div className="section-title">{exercise.type?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
          <div className="section-sub">Complete this activity to practice the vocabulary in context</div>
        </div>
        {exercise.instructions && <div className="exercise-instructions">📋 {exercise.instructions}</div>}
        <div className="exercise-content">{exercise.content}</div>
      </div>
    ) : <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>No exercise yet.</div>,
    debate: story ? (
      <div>
        <div className="section-header">
          <div className="section-title">Story questions for students</div>
          <div className="section-sub">Read the story carefully — then explore it together</div>
        </div>
        {story.debateStory && (
          <div className="debate-section">
            <span className="debate-label" style={{ background: 'rgba(255,75,85,0.1)', color: '#ff4b55' }}>What happened in the story</span>
            <p className="debate-content">{story.debateStory}</p>
          </div>
        )}
        {story.debateMoral && (
          <div className="debate-section">
            <span className="debate-label" style={{ background: 'rgba(255,188,0,0.1)', color: 'rgba(255,188,0,0.9)' }}>What we can learn from it</span>
            <p className="debate-content">{story.debateMoral}</p>
          </div>
        )}
        {story.debatePersonal && (
          <div className="debate-section">
            <span className="debate-label" style={{ background: 'rgba(0,188,124,0.1)', color: '#00bc7c' }}>Personal connection</span>
            <p className="debate-content">{story.debatePersonal}</p>
          </div>
        )}
      </div>
    ) : <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>No story questions yet.</div>,
    debate2: (
      <div>
        {!lesson.debate ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.3 }}>🗣</div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No debate content yet.</p>
          </div>
        ) : (
          <RichDebateDisplay
            topic={lesson.debate.topic}
            article={lesson.debate.article}
            keyTerms={lesson.debate.keyTerms || []}
            questions={lesson.debate.questions || ''}
          />
        )}
      </div>
    ),
    canvas: (
      <div>
        <div className="section-header">
          <div className="section-title">{canvasMode === 'teacher' ? '📌 Teaching canvas — edit mode' : '📌 Teaching canvas'}</div>
          <div className="section-sub">{canvasMode === 'teacher' ? 'Add sticky notes, drag them around, and save.' : 'Vocabulary notes and annotations placed by your teacher during class'}</div>
        </div>
        {canvasMode === 'teacher' && (
          <div style={{ background: 'rgba(0,188,124,0.08)', border: '1px solid rgba(0,188,124,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00bc7c' }}>✦</span>
            You are in <strong style={{ color: '#00bc7c' }}>teacher edit mode</strong>.
          </div>
        )}
        <TeachingCanvas lessonId={lesson.id} mode={canvasMode} vocab={lesson.vocab || []} />
      </div>
    ),
  }

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
        .teacher-badge { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 100px; background: rgba(0,188,124,0.1); border: 1px solid rgba(0,188,124,0.25); font-size: 11px; font-weight: 600; color: #00bc7c; letter-spacing: 0.06em; }
        .hero { max-width: 900px; margin: 0 auto; padding: clamp(40px,6vw,80px) clamp(20px,5vw,64px) 0; position: relative; z-index: 1; }
        .hero-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 12px; color: rgba(255,255,255,0.3); }
        .hero-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .hero-tag { padding: 4px 12px; border-radius: 100px; background: rgba(255,75,85,0.1); border: 1px solid rgba(255,75,85,0.2); font-size: 12px; font-weight: 600; }
        .hero-title { font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(32px,5vw,56px); line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 16px; }
        .hero-title em { color: #ff4b55; font-style: italic; }
        .hero-goal { font-size: clamp(15px,2vw,17px); color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 600px; margin-bottom: 32px; }
        .impact-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 40px; }
        .impact-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px; }
        .two-col { max-width: 900px; margin: 0 auto; padding: 0 clamp(20px,5vw,64px); display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; position: relative; z-index: 1; }
        .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 22px; }
        .flow-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .flow-item:last-child { border-bottom: none; }
        .flow-num { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .content { max-width: 900px; margin: 0 auto; padding: 0 clamp(20px,5vw,64px); position: relative; z-index: 1; }
        /* Desktop tabs */
        .tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 4px; margin-bottom: 28px; overflow-x: auto; scrollbar-width: none; }
        .tabs::-webkit-scrollbar { display: none; }
        .tab { flex: 1; padding: 10px 12px; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; min-width: 80px; text-align: center; }
        .tab-on { background: #ff4b55; color: #fff; }
        .tab-off { background: transparent; color: rgba(255,255,255,0.4); }
        .tab-off:hover { color: rgba(255,255,255,0.7); }
        .vocab-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 10px; }
        .vocab-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 16px; transition: all 0.2s; }
        .vocab-card:hover { border-color: rgba(255,75,85,0.3); transform: translateY(-1px); }
        .vocab-word { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px; }
        .vocab-translation { font-size: 13px; color: #ff4b55; }
        .sentence-list { display: flex; flex-direction: column; gap: 12px; }
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
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .fade-up { opacity:0; animation: fadeUp 0.5s ease forwards; }

        /* Mobile view — hidden on desktop */
        .mobile-view { display: none; }

        @media print {
          .bg-orb, .bg-grid { display: none !important; }
          .nav { position: relative !important; background: #0b172b !important; }
          .share-btn { display: none !important; }
          .tabs { display: none !important; }
          body { background: #0b172b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        /* ==================== MOBILE ONLY ==================== */
        @media (max-width: 768px) {
          /* Hide desktop layout */
          .hero { display: none !important; }
          .two-col { display: none !important; }
          .tabs { display: none !important; }
          .content { display: none !important; }
          .lesson-footer { display: none !important; }
          .nav { padding: 10px 16px !important; }
          .nav-logo-text { display: none !important; }
          .bg-orb { display: none !important; }
          .bg-grid { display: none !important; }

          /* Show mobile view */
          .mobile-view { display: block !important; }

          /* Mobile base */
          .mv-wrap { padding: 0 16px; font-family: 'DM Sans', sans-serif; }

          /* Compact hero */
          .mv-hero {
            padding: 20px 16px 0;
          }
          .mv-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
          .mv-tag { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
          .mv-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; line-height: 1.15; letter-spacing: -0.02em; color: #fff; margin-bottom: 8px; }
          .mv-title em { color: #ff4b55; font-style: italic; }
          .mv-goal { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 14px; }
          .mv-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
          .mv-pill { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 100px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5); }
          .mv-more-btn { background: none; border: none; color: rgba(255,255,255,0.3); font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 4px 0; text-decoration: underline; margin-bottom: 8px; }
          .mv-more-info { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; margin-bottom: 12px; }
          .mv-flow-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
          .mv-flow-item:last-child { border: none; }
          .mv-flow-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,75,85,0.15); color: #ff4b55; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .mv-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }

          /* Section cards */
          .mv-cards { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
          .mv-card {
            display: flex; align-items: center; gap: 14px;
            padding: 16px 18px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
            width: 100%;
            font-family: 'DM Sans', sans-serif;
          }
          .mv-card:active { transform: scale(0.98); }
          .mv-card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
          .mv-card-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 2px; }
          .mv-card-sub { font-size: 12px; color: rgba(255,255,255,0.4); }
          .mv-card-arrow { margin-left: auto; font-size: 16px; color: rgba(255,255,255,0.25); flex-shrink: 0; }

          /* Section view */
          .mv-section-view { min-height: 100vh; }
          .mv-section-header {
            position: sticky; top: 52px; z-index: 80;
            display: flex; align-items: center; gap: 10px;
            padding: 12px 16px;
            background: rgba(11,23,43,0.97);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(255,255,255,0.07);
          }
          .mv-back-btn {
            display: flex; align-items: center; gap: 5px;
            padding: 6px 12px; border-radius: 8px;
            background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500;
            cursor: pointer; font-family: 'DM Sans', sans-serif;
          }
          .mv-section-name { font-size: 14px; font-weight: 600; color: #fff; }
          .mv-section-content { padding: 20px 16px 60px; }
          .mv-next-card {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 18px; margin-top: 28px;
            background: rgba(255,75,85,0.08); border: 1px solid rgba(255,75,85,0.2);
            border-radius: 14px; cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            width: 100%;
          }
          .mv-next-label { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 2px; text-align: left; }
          .mv-next-name { font-size: 15px; font-weight: 600; color: #fff; text-align: left; }

          /* Content fixes for mobile */
          .vocab-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .vocab-card { padding: 12px !important; }
          .vocab-word { font-size: 14px !important; }
          .vocab-translation { font-size: 12px !important; }
          .story-body { font-size: 15px !important; line-height: 1.85 !important; }
          .section-title { font-size: 17px !important; }
          .exercise-content { font-size: 14px !important; }
          .debate-content { font-size: 14px !important; }

          /* Mobile footer */
          .mv-footer {
            padding: 24px 16px 40px; text-align: center;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
        }
      `}</style>

      <div className="page">
        <div className="bg-orb orb-a" />
        <div className="bg-orb orb-b" />
        <div className="bg-grid" />

        {/* Nav */}
        <nav className="nav">
          <a href="/" className="nav-logo">
            <img src={LOGO} alt="Akadian" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span className="nav-logo-text">Akadian Academy</span>
          </a>
          <div className="nav-right">
            {canvasMode === 'teacher' && (
              <div className="teacher-badge">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7c', display: 'inline-block', animation: 'blink 2s ease-in-out infinite' }} />
                <span>Teacher view</span>
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
            <span className="hero-tag" style={{ color: levelColor, borderColor: `${levelColor}40`, background: `${levelColor}15` }}>{lesson.level}</span>
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
              { icon: '📚', label: `${lesson.vocab?.length || 0} words`, desc: 'Vocabulary' },
              { icon: '✍️', label: 'Exercise', desc: exercise?.type?.replace(/-/g, ' ') || 'Practice' },
              { icon: '💬', label: 'Discussion', desc: '3 categories' },
            ].map((c, i) => (
              <div key={i} className="impact-card">
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{c.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{c.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Why + Flow */}
        <div className="two-col fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="info-card">
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#00bc7c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Why this lesson matters</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}>
              Language is access. This lesson gives students the exact words they need to handle real situations with confidence — not in a classroom, but in real life.
            </p>
          </div>
          <div className="info-card">
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Lesson flow</p>
            {[
              { num: '1', label: 'Vocabulary', desc: 'Learn the key words' },
              { num: '2', label: 'Story', desc: 'See them in context' },
              { num: '3', label: 'Exercise', desc: 'Practice under pressure' },
              { num: '4', label: 'Questions', desc: 'Think and discuss' },
              { num: '5', label: 'Debate', desc: 'Go deeper' },
              { num: '6', label: 'Canvas', desc: 'Teacher annotations' },
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

        {/* Content area */}
        <div className="content fade-up" style={{ animationDelay: '0.25s' }}>

          {/* Desktop tabs */}
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab ${activeTab === t.id ? 'tab-on' : 'tab-off'}`}
                onClick={() => setActiveTab(t.id)}>
                {t.icon} {t.label} {t.id === 'vocab' ? `(${lesson.vocab?.length || 0})` : ''}
              </button>
            ))}
          </div>

          {/* Mobile section header */}
          <div className="mobile-section-header" style={{ display: 'none' }} id="mobile-section-header">
            <div className="mobile-section-icon">
              {TABS.find(t => t.id === activeTab)?.icon}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                {TABS.find(t => t.id === activeTab)?.label}
                {activeTab === 'vocab' && ` (${lesson.vocab?.length || 0})`}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                {activeTab === 'vocab' && 'Learn these words'}
                {activeTab === 'story' && 'Read the context'}
                {activeTab === 'exercise' && 'Practice time'}
                {activeTab === 'debate' && 'Discuss together'}
                {activeTab === 'debate2' && 'Full debate prep'}
                {activeTab === 'canvas' && 'Teacher notes'}
              </div>
            </div>
          </div>
          <style>{`
            @media (max-width: 768px) {
              #mobile-section-header { display: flex !important; }
            }
          `}</style>

          {/* Tab content */}
          <div key={activeTab} style={{ animation: 'fadeUp 0.3s ease' }}>
            {tabContent[activeTab]}
          </div>
        </div>

        {/* Referral ad — desktop + mobile */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 clamp(20px,5vw,64px) 0', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(0,188,124,0.08), rgba(255,75,85,0.05))', border: '1px solid rgba(0,188,124,0.2)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>🎁</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>¿Conoces a alguien que quiera aprender?</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                  Refiere a una persona y obtén <strong style={{ color: '#00bc7c' }}>hasta 30% de descuento</strong> en tu siguiente mensualidad.
                </p>
              </div>
            </div>
            <a href="https://www.akadianacademy.com/sesiones-en-vivo" target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#00bc7c', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,188,124,0.3)' }}>
              Referir ahora →
            </a>
          </div>
        </div>

        {/* Desktop footer */}
        <div className="lesson-footer fade-up" style={{ animationDelay: '0.35s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={LOGO} style={{ width: 28, height: 28, borderRadius: '50%' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
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

        {/* Akadian brand block */}
        {canvasMode === 'student' && (
          <div style={{ maxWidth: '900px', margin: '0 auto 48px', padding: '0 clamp(20px,5vw,64px)', position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(11,23,43,0.9), rgba(11,23,43,0.95))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: 'clamp(24px,4vw,40px)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,75,85,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <img src={LOGO} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,75,85,0.3)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Akadian Academy</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Orlando, FL 🇺🇸 · EdTech Platform</p>
                  </div>
                </div>
                <p style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '8px' }}>
                  Real lessons. Real teachers.<br />
                  <span style={{ color: '#ff4b55' }}>Real US certificates — coming soon.</span>
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '500px', marginBottom: '20px' }}>
                  Akadian Academy is building the EdTech platform that actually certifies what you know — starting with language, expanding to math, technology, sciences, and business.
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
                  Akadian Academy LLC · Orlando, Florida · United States of America · <a href="https://www.akadianacademy.com" target="_blank" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>www.akadianacademy.com</a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== MOBILE VIEW ===== */}
        <div className="mobile-view">

          {mobileView === 'home' ? (
            <>
              {/* Compact Hero */}
              <div className="mv-hero">
                <div className="mv-tags">
                  <span className="mv-tag" style={{ background: 'rgba(255,75,85,0.12)', color: '#ff4b55', border: '1px solid rgba(255,75,85,0.2)' }}>{lesson.language}</span>
                  <span className="mv-tag" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>{lesson.level}</span>
                  {lesson.unit && <span className="mv-tag" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>{lesson.unit}</span>}
                  <span className="mv-tag" style={{ background: 'rgba(0,188,124,0.1)', color: '#00bc7c', border: '1px solid rgba(0,188,124,0.2)' }}>Free lesson</span>
                </div>
                <h1 className="mv-title">
                  {lesson.title.split(' ').map((word: string, i: number, arr: string[]) =>
                    i === arr.length - 1 ? <em key={i}>{word}</em> : <span key={i}>{word} </span>
                  )}
                </h1>
                <p className="mv-goal">{lesson.goal}</p>
                <div className="mv-pills">
                  <div className="mv-pill">📚 {lesson.vocab?.length || 0} words</div>
                  <div className="mv-pill">✍️ {exercise?.type?.replace(/-/g,' ') || 'Exercise'}</div>
                  <div className="mv-pill">💬 Discussion</div>
                </div>
                <button className="mv-more-btn" onClick={() => setShowMoreInfo(v => !v)}>
                  {showMoreInfo ? '▲ Show less' : '▼ View lesson flow'}
                </button>
                {showMoreInfo && (
                  <div className="mv-more-info">
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Lesson flow</p>
                    {[
                      { num: '1', label: 'Vocabulary', desc: 'Learn the key words' },
                      { num: '2', label: 'Story', desc: 'See them in context' },
                      { num: '3', label: 'Exercise', desc: 'Practice under pressure' },
                      { num: '4', label: 'Questions', desc: 'Think and discuss' },
                      { num: '5', label: 'Debate', desc: 'Go deeper' },
                      { num: '6', label: 'Canvas', desc: 'Teacher annotations' },
                    ].map(s => (
                      <div key={s.num} className="mv-flow-item">
                        <div className="mv-flow-num">{s.num}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{s.label}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mv-divider" />
              </div>

              {/* Section cards */}
              <div className="mv-cards">
                {[
                  { id: 'vocab', icon: '📚', bg: 'rgba(255,75,85,0.12)', title: 'Vocabulary', sub: `${lesson.vocab?.length || 0} words to learn` },
                  { id: 'story', icon: '📖', bg: 'rgba(59,130,246,0.12)', title: 'Story', sub: 'Read and find the words' },
                  { id: 'exercise', icon: '✍️', bg: 'rgba(0,188,124,0.12)', title: 'Exercise', sub: exercise?.type?.replace(/-/g,' ') || 'Practice activity' },
                  { id: 'questions', icon: '💬', bg: 'rgba(245,158,11,0.12)', title: 'Story Questions', sub: 'Discuss with your class' },
                  { id: 'debate', icon: '🗣', bg: 'rgba(139,92,246,0.12)', title: 'Debate', sub: lesson.debate?.topic ? lesson.debate.topic.slice(0,50) + '...' : 'Deep discussion topic' },
                  { id: 'canvas', icon: '📌', bg: 'rgba(0,188,124,0.12)', title: canvasMode === 'teacher' ? 'Canvas (edit)' : "Teacher's Canvas", sub: canvasMode === 'teacher' ? 'Add notes for students' : 'Notes from your teacher' },
                ].map((card, i) => (
                  <button key={card.id} className="mv-card"
                    onClick={() => setMobileView(card.id)}
                    style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="mv-card-icon" style={{ background: card.bg }}>{card.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="mv-card-title">{card.title}</div>
                      <div className="mv-card-sub">{card.sub}</div>
                    </div>
                    <div className="mv-card-arrow">›</div>
                  </button>
                ))}
              </div>

              {/* Mobile footer */}
              <div className="mv-footer">
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
                  <button className="share-btn" onClick={copyLink} style={{ fontSize: '12px', padding: '7px 14px' }}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>
                  <button className="share-btn share-btn-primary" onClick={() => window.print()} style={{ fontSize: '12px', padding: '7px 14px' }}>↓ Save PDF</button>
                </div>
                {canvasMode === 'student' && (
                  <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#ff4b55', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(255,75,85,0.3)' }}>
                    ✦ Are you a teacher? Build free
                  </a>
                )}
              </div>
            </>
          ) : (
            /* Section detail view */
            <div className="mv-section-view">

              {/* Sticky back header */}
              <div className="mv-section-header">
                <button className="mv-back-btn" onClick={() => setMobileView('home')}>
                  ← Back
                </button>
                <span className="mv-section-name">
                  {mobileView === 'vocab' && '📚 Vocabulary'}
                  {mobileView === 'story' && '📖 Story'}
                  {mobileView === 'exercise' && '✍️ Exercise'}
                  {mobileView === 'questions' && '💬 Story Questions'}
                  {mobileView === 'debate' && '🗣 Debate'}
                  {mobileView === 'canvas' && '📌 Canvas'}
                </span>
                <button className="share-btn" onClick={copyLink} style={{ marginLeft: 'auto', fontSize: '11px', padding: '5px 10px' }}>
                  {copied ? '✓' : '🔗'}
                </button>
              </div>

              {/* Section content */}
              <div className="mv-section-content">

                {mobileView === 'vocab' && (
                  <div>
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
                        <div style={{ margin: '24px 0 12px', fontSize: '15px', fontWeight: 600 }}>Example sentences</div>
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
                    <button className="mv-next-card" onClick={() => setMobileView('story')}>
                      <div><div className="mv-next-label">Next up</div><div className="mv-next-name">📖 Read the story</div></div>
                      <span style={{ color: '#ff4b55', fontSize: '20px' }}>→</span>
                    </button>
                  </div>
                )}

                {mobileView === 'story' && (
                  <div>
                    {story ? (
                      <RichStoryDisplay content={story.content} vocab={lesson.vocab || []} imagePrompt={story.imageUrl} />
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>No story yet.</p>
                    )}
                    <button className="mv-next-card" onClick={() => setMobileView('exercise')}>
                      <div><div className="mv-next-label">Next up</div><div className="mv-next-name">✍️ Do the exercise</div></div>
                      <span style={{ color: '#ff4b55', fontSize: '20px' }}>→</span>
                    </button>
                  </div>
                )}

                {mobileView === 'exercise' && (
                  <div>
                    {exercise ? (
                      <>
                        {exercise.instructions && <div className="exercise-instructions">📋 {exercise.instructions}</div>}
                        <div className="exercise-content">{exercise.content}</div>
                      </>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>No exercise yet.</p>
                    )}
                    <button className="mv-next-card" onClick={() => setMobileView('questions')}>
                      <div><div className="mv-next-label">Next up</div><div className="mv-next-name">💬 Story questions</div></div>
                      <span style={{ color: '#ff4b55', fontSize: '20px' }}>→</span>
                    </button>
                  </div>
                )}

                {mobileView === 'questions' && (
                  <div>
                    {story ? (
                      <>
                        {story.debateStory && <div className="debate-section"><span className="debate-label" style={{ background: 'rgba(255,75,85,0.1)', color: '#ff4b55' }}>What happened</span><p className="debate-content">{story.debateStory}</p></div>}
                        {story.debateMoral && <div className="debate-section"><span className="debate-label" style={{ background: 'rgba(255,188,0,0.1)', color: 'rgba(255,188,0,0.9)' }}>What we learn</span><p className="debate-content">{story.debateMoral}</p></div>}
                        {story.debatePersonal && <div className="debate-section"><span className="debate-label" style={{ background: 'rgba(0,188,124,0.1)', color: '#00bc7c' }}>Personal connection</span><p className="debate-content">{story.debatePersonal}</p></div>}
                      </>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>No questions yet.</p>
                    )}
                    <button className="mv-next-card" onClick={() => setMobileView('debate')}>
                      <div><div className="mv-next-label">Next up</div><div className="mv-next-name">🗣 Full debate</div></div>
                      <span style={{ color: '#ff4b55', fontSize: '20px' }}>→</span>
                    </button>
                  </div>
                )}

                {mobileView === 'debate' && (
                  <div>
                    {lesson.debate ? (
                      <RichDebateDisplay topic={lesson.debate.topic} article={lesson.debate.article} keyTerms={lesson.debate.keyTerms || []} questions={lesson.debate.questions || ''} />
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>No debate content yet.</p>
                    )}
                    <button className="mv-next-card" onClick={() => setMobileView('canvas')}>
                      <div><div className="mv-next-label">Next up</div><div className="mv-next-name">📌 Teacher's canvas</div></div>
                      <span style={{ color: '#ff4b55', fontSize: '20px' }}>→</span>
                    </button>
                  </div>
                )}

                {mobileView === 'canvas' && (
                  <div>
                    {canvasMode === 'teacher' && (
                      <div style={{ background: 'rgba(0,188,124,0.08)', border: '1px solid rgba(0,188,124,0.2)', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                        ✦ You are in <strong style={{ color: '#00bc7c' }}>teacher edit mode</strong>
                      </div>
                    )}
                    <TeachingCanvas lessonId={lesson.id} mode={canvasMode} vocab={lesson.vocab || []} />
                    <button className="mv-next-card" onClick={() => setMobileView('home')} style={{ marginTop: '24px' }}>
                      <div><div className="mv-next-label">All done!</div><div className="mv-next-name">← Back to lesson menu</div></div>
                      <span style={{ color: '#ff4b55', fontSize: '20px' }}>🏠</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Inline editor — teacher only */}
        {canvasMode === 'teacher' && editableLesson && (
          <EditPanel
            lesson={editableLesson}
            onSaved={(updated) => { setLesson(updated); setEditableLesson(updated) }}
          />
        )}
      </div>
    </>
  )
}
