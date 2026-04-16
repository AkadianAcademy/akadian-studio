'use client'
import { useLessonStore } from '@/store/lessonStore'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const MISSION_SIGNALS: Record<string, string> = {
  languages: "One lesson here could help someone order food, find a job, or call for help in a new country.",
  math: "Numbers done right give people power over their finances and future.",
  technology: "Digital skills are the new literacy. You're helping close the gap.",
  sciences: "Science taught well changes how people see the world around them.",
  business: "Business literacy changes lives — you're teaching people to negotiate their future.",
}

const TEACHER_PHRASES = (name: string) => [
  `Hey ${name}, ready to change a life today?`,
  `${name}, you're building something real here.`,
  `Let's go ${name} — someone needs this lesson.`,
  `${name}, teachers like you are why this exists.`,
  `Good to have you back, ${name}. Let's create.`,
  `${name}, every field you fill in matters.`,
  `This one's going to be special, ${name}.`,
]

export default function BuilderSidebar() {
  const { setup } = useLessonStore()
  const [userName, setUserName] = useState('Teacher')
  const [phrase, setPhrase] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const name = user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0] || 'Teacher'
      setUserName(name)
      const phrases = TEACHER_PHRASES(name)
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)])
    })
  }, [])

  const previewSlug = setup.title
    ? setup.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)
    : ''

  const previewUrl = `akadianacademy.com/library/${previewSlug || '...'}`

  const fields = [
    { label: 'Subject', done: !!setup.subject },
    { label: 'Language', done: !!setup.language },
    { label: 'Level', done: !!setup.level },
    { label: 'Unit', done: !!setup.unit },
    { label: 'Title', done: !!setup.title },
    { label: 'Goal', done: !!setup.goal },
  ]
  const score = fields.filter(f => f.done).length
  const scorePercent = Math.round((score / fields.length) * 100)

  function copyLink() {
    navigator.clipboard.writeText(`https://${previewUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        .sidebar {
          width: 260px; min-width: 260px;
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 20px 16px;
          display: flex; flex-direction: column; gap: 12px;
          overflow-y: auto; height: 100%;
          background: rgba(255,255,255,0.01);
        }

        .sb-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 14px;
          transition: border-color 0.3s;
        }
        .sb-card:hover { border-color: rgba(255,255,255,0.12); }

        .sb-label {
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 8px;
        }

        .phrase-card {
          background: linear-gradient(135deg, rgba(255,75,85,0.12), rgba(255,75,85,0.04));
          border: 1px solid rgba(255,75,85,0.2);
          border-radius: 12px; padding: 14px;
        }

        .score-bar-track {
          height: 5px; background: rgba(255,255,255,0.06);
          border-radius: 100px; overflow: hidden; margin-bottom: 10px;
        }
        .score-bar-fill {
          height: 100%; border-radius: 100px;
          transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        .score-fields { display: flex; flex-wrap: wrap; gap: 5px; }
        .score-field {
          display: flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 100px;
          font-size: 10px; font-weight: 500; transition: all 0.3s;
        }
        .field-done { background: rgba(0,188,124,0.1); border: 1px solid rgba(0,188,124,0.2); color: #00bc7c; }
        .field-pending { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.25); }

        .path-pill {
          display: inline-flex; padding: 3px 10px; border-radius: 100px;
          background: rgba(255,255,255,0.06); font-size: 12px;
          font-weight: 500; color: rgba(255,255,255,0.5);
          transition: all 0.3s; margin: 2px;
        }
        .path-pill-active { background: rgba(255,75,85,0.15); color: #fff; border: 1px solid rgba(255,75,85,0.25); }

        .preview-link-wrap {
          background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 8px 10px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 6px; cursor: pointer; transition: border-color 0.2s;
        }
        .preview-link-wrap:hover { border-color: rgba(255,75,85,0.3); }
        .copy-btn {
          padding: 3px 8px; border-radius: 5px;
          background: rgba(255,75,85,0.15); border: 1px solid rgba(255,75,85,0.2);
          color: #ff4b55; font-size: 10px; font-weight: 600;
          cursor: pointer; white-space: nowrap; font-family: inherit; transition: all 0.2s;
        }
        .copy-btn.copied { background: rgba(0,188,124,0.15); border-color: rgba(0,188,124,0.2); color: #00bc7c; }

        .link-fade { animation: linkIn 0.4s ease both; }
        @keyframes linkIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }

        @media (max-width: 900px) { .sidebar { display: none; } }
      `}</style>

      <div className="sidebar">

        {/* Greeting */}
        <div className="phrase-card">
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,75,85,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>✦ Studio</div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', lineHeight: 1.5 }}>
            {phrase || `Hey ${userName}, let's build.`}
          </div>
        </div>

        {/* Completeness */}
        <div className="sb-card">
          <div className="sb-label">
            Completeness —{' '}
            <span style={{ color: scorePercent === 100 ? '#00bc7c' : scorePercent > 50 ? '#ff4b55' : 'rgba(255,255,255,0.3)' }}>
              {scorePercent}%
            </span>
          </div>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{
              width: `${scorePercent}%`,
              background: scorePercent === 100
                ? 'linear-gradient(90deg,#00bc7c,#00e898)'
                : 'linear-gradient(90deg,#ff4b55,#ff8a6b)',
            }} />
          </div>
          <div className="score-fields">
            {fields.map(f => (
              <div key={f.label} className={`score-field ${f.done ? 'field-done' : 'field-pending'}`}>
                {f.done ? '✓' : '○'} {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Lesson path */}
        <div className="sb-card">
          <div className="sb-label">Lesson path</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
            <span className={`path-pill ${setup.language ? 'path-pill-active' : ''}`}>{setup.language || 'Language'}</span>
            <span className={`path-pill ${setup.level ? 'path-pill-active' : ''}`}>{setup.level || 'Level'}</span>
            {setup.unit && <span className="path-pill path-pill-active">{setup.unit}</span>}
          </div>
          {setup.title && (
            <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
              {setup.title}
            </div>
          )}
        </div>

        {/* Preview link */}
        {setup.title && (
          <div className="sb-card link-fade">
            <div className="sb-label" style={{ color: '#ff4b55' }}>Preview link</div>
            <div className="preview-link-wrap" onClick={copyLink}>
              <span style={{ fontSize: '10px', color: '#ff4b55', wordBreak: 'break-all', flex: 1, lineHeight: 1.5 }}>{previewUrl}</span>
              <button className={`copy-btn ${copied ? 'copied' : ''}`}>{copied ? '✓' : 'Copy'}</button>
            </div>
          </div>
        )}

        {/* Mission signal */}
        <div className="sb-card">
          <div className="sb-label" style={{ color: '#00bc7c' }}>Mission signal</div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7', fontStyle: 'italic' }}>
            "{MISSION_SIGNALS[setup.subject] || MISSION_SIGNALS.languages}"
          </p>
        </div>

        {/* Impact */}
        <div className="sb-card">
          <div className="sb-label">Library impact</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>12,480+</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>future learners benefit from strong lesson structures</div>
        </div>

      </div>
    </>
  )
}
