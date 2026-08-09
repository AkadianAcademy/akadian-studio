'use client'
import { useLessonStore } from '@/store/lessonStore'
import { useState } from 'react'

export default function BuilderSidebar() {
  const { setup, vocab, sentences, currentStep, slug, lessonId } = useLessonStore()
  const [copied, setCopied] = useState(false)

  const checks = [
    { label: 'Subject', done: !!setup.subject },
    { label: 'Language', done: !!setup.language },
    { label: 'Level', done: !!setup.level },
    { label: 'Unit', done: !!setup.unit },
    { label: 'Title', done: !!setup.title },
    { label: 'Goal', done: !!setup.goal },
  ]
  const completeness = Math.round((checks.filter(c => c.done).length / checks.length) * 100)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  function copyLink() {
    if (!slug) return
    navigator.clipboard.writeText(`${window.location.origin}/lesson/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const circumference = 2 * Math.PI * 20
  const dashOffset = circumference - (completeness / 100) * circumference

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        .sb { background: #F5F4F0; height: 100vh; overflow-y: auto; padding: 24px 20px; font-family: 'Hanken Grotesk', sans-serif; display: flex; flex-direction: column; gap: 16px; scrollbar-width: none; }
        .sb::-webkit-scrollbar { display: none; }
        .sb-header { padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sb-tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; background: rgba(123,92,255,0.12); border: 1px solid rgba(123,92,255,0.2); font-size: 10px; font-weight: 700; color: #A98BFF; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
        .sb-lime-dot { width: 5px; height: 5px; border-radius: 50%; background: #C8FF3D; animation: sbBlink 2s ease-in-out infinite; }
        @keyframes sbBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .sb-greeting { font-family: 'Newsreader', Georgia, serif; font-size: 16px; color: rgba(255,255,255,0.85); line-height: 1.4; font-style: italic; }
        .sb-greeting em { color: #A98BFF; font-style: normal; font-weight: 600; }
        .sb-progress-card { background: rgba(123,92,255,0.06); border: 1px solid rgba(123,92,255,0.12); border-radius: 14px; padding: 16px; }
        .sb-progress-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .sb-progress-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; text-transform: uppercase; }
        .sb-progress-ring { position: relative; width: 48px; height: 48px; flex-shrink: 0; }
        .sb-progress-pct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #A98BFF; }
        .sb-checks { display: flex; flex-direction: column; gap: 5px; }
        .sb-check { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .sb-check-icon { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; flex-shrink: 0; transition: all 0.3s; }
        .sb-check-done .sb-check-icon { background: rgba(200,255,61,0.15); color: #C8FF3D; border: 1px solid rgba(200,255,61,0.3); }
        .sb-check-pending .sb-check-icon { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.08); }
        .sb-check-done .sb-check-text { color: rgba(255,255,255,0.7); }
        .sb-check-pending .sb-check-text { color: rgba(255,255,255,0.25); }
        .sb-section { }
        .sb-section-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.2); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .sb-path-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 14px; }
        .sb-path-lang { font-size: 13px; font-weight: 700; color: #fff; }
        .sb-path-title { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; font-family: 'Newsreader', Georgia, serif; font-style: italic; }
        .sb-preview-card { background: rgba(91,60,224,0.08); border: 1px solid rgba(91,60,224,0.15); border-radius: 12px; padding: 12px 14px; }
        .sb-preview-url { font-size: 11px; color: rgba(255,255,255,0.25); margin-bottom: 8px; word-break: break-all; line-height: 1.5; font-family: 'Courier New', monospace; }
        .sb-preview-url em { color: #A98BFF; font-style: normal; }
        .sb-copy-btn { width: 100%; padding: 8px; border-radius: 999px; border: 1.5px solid rgba(123,92,255,0.25); background: rgba(123,92,255,0.08); color: #A98BFF; font-family: 'Hanken Grotesk', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; min-height: 34px; }
        .sb-copy-btn:hover { background: rgba(123,92,255,0.15); border-color: rgba(123,92,255,0.4); }
        .sb-mission { background: rgba(255,138,61,0.06); border: 1px solid rgba(255,138,61,0.12); border-radius: 12px; padding: 14px; }
        .sb-mission-text { font-family: 'Newsreader', Georgia, serif; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.65; font-style: italic; }
        .sb-mission-text em { color: #FF8A3D; font-style: normal; }
        .sb-impact-card { background: rgba(200,255,61,0.04); border: 1px solid rgba(200,255,61,0.1); border-radius: 12px; padding: 14px; text-align: center; }
        .sb-impact-num { font-size: 24px; font-weight: 800; color: #C8FF3D; letter-spacing: -0.03em; margin-bottom: 4px; }
        .sb-impact-label { font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.5; }
        @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        .sb { animation: slideIn 0.4s cubic-bezier(.16,1,.3,1); }
      `}</style>

      <div className="sb">
        {/* Header */}
        <div className="sb-header">
          <div className="sb-tag"><span className="sb-lime-dot" />Studio</div>
          <p className="sb-greeting">
            {greeting}, <em>{setup.title ? setup.title.split(' ')[0] : 'Akadian'}.</em><br />
            Let's create.
          </p>
        </div>

        {/* Completeness */}
        <div className="sb-progress-card">
          <div className="sb-progress-header">
            <div>
              <div className="sb-progress-label">Completeness — {completeness}%</div>
            </div>
            <div className="sb-progress-ring">
              <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(123,92,255,0.1)" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#7B5CFF" strokeWidth="3"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(.16,1,.3,1)' }} />
              </svg>
              <div className="sb-progress-pct">{completeness}%</div>
            </div>
          </div>
          <div className="sb-checks">
            {checks.map(c => (
              <div key={c.label} className={`sb-check ${c.done ? 'sb-check-done' : 'sb-check-pending'}`}>
                <div className="sb-check-icon">{c.done ? '✓' : '○'}</div>
                <span className="sb-check-text">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson path */}
        {(setup.language || setup.title) && (
          <div className="sb-section">
            <div className="sb-section-label">Lesson path</div>
            <div className="sb-path-card">
              <div className="sb-path-lang">{[setup.language, setup.level, setup.unit].filter(Boolean).join(' · ')}</div>
              {setup.title && <div className="sb-path-title">{setup.title}</div>}
            </div>
          </div>
        )}

        {/* Preview link */}
        <div className="sb-section">
          <div className="sb-section-label">Preview link</div>
          <div className="sb-preview-card">
            <div className="sb-preview-url">
              {slug
                ? <><em>akadianacademy.com</em>/library/{slug}</>
                : <span style={{ color: 'rgba(255,255,255,0.15)' }}>Available after setup</span>
              }
            </div>
            <button className="sb-copy-btn" onClick={copyLink} disabled={!slug}>
              {copied ? '✓ Copied!' : '🔗 Copy link'}
            </button>
          </div>
        </div>

        {/* Mission */}
        <div className="sb-section">
          <div className="sb-section-label">Mission signal</div>
          <div className="sb-mission">
            <p className="sb-mission-text">
              "One lesson here could help someone <em>order food, find a job,</em> or call for help in a new country."
            </p>
          </div>
        </div>

        {/* Impact */}
        <div className="sb-section">
          <div className="sb-section-label">Library impact</div>
          <div className="sb-impact-card">
            <div className="sb-impact-num">12,480+</div>
            <div className="sb-impact-label">future learners benefit from strong lesson structures</div>
          </div>
        </div>
      </div>
    </>
  )
}
