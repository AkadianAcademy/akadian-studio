'use client'
import { useLessonStore } from '@/store/lessonStore'
import { useEffect, useState } from 'react'

const STEPS = [
  { num: 1, label: 'Setup', desc: 'Lesson details' },
  { num: 2, label: 'Vocabulary', desc: 'Words & sentences' },
  { num: 3, label: 'Practice', desc: 'Exercises & story' },
  { num: 4, label: 'Debate', desc: 'Debate & discussion' },
  { num: 5, label: 'Preview', desc: 'Review & publish' },
]

export default function BuilderLivePreview() {
  const { setup, vocab, sentences, currentStep, slug } = useLessonStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const LEVEL_COLORS: Record<string, string> = {
    A1: '#00BC7C', A2: '#60A5FA', B1: '#7B5CFF', B2: '#A78BFA', C1: '#FB923C', Conversation: '#F472B6'
  }
  const levelColor = LEVEL_COLORS[setup.level || ''] || '#7B5CFF'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        @keyframes lp-in { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes lp-float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-4px)} }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes lp-shimmer { 0%{opacity:0.3} 50%{opacity:0.7} 100%{opacity:0.3} }
        .lp-wrap { 
          width: 220px; 
          flex-shrink: 0; 
          padding: 16px 14px; 
          background: #0D1117;
          border-left: 1px solid rgba(123,92,255,0.12);
          height: 100vh; 
          overflow-y: auto; 
          scrollbar-width: none;
          font-family: 'Hanken Grotesk', sans-serif;
          opacity: 0;
          animation: lp-in 0.5s cubic-bezier(.16,1,.3,1) 0.2s forwards;
        }
        .lp-wrap::-webkit-scrollbar { display: none; }
        .lp-header { margin-bottom: 14px; }
        .lp-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px; background: rgba(200,255,61,0.08); border: 1px solid rgba(200,255,61,0.18); font-size: 9px; font-weight: 700; color: #C8FF3D; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .lp-dot { width: 4px; height: 4px; border-radius: 50%; background: #C8FF3D; animation: lp-pulse 2s ease-in-out infinite; }
        .lp-title { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; text-transform: uppercase; }

        /* Lesson card mockup */
        .lp-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; margin-bottom: 12px; animation: lp-float 4s ease-in-out infinite; }
        .lp-card-header { padding: 12px; background: linear-gradient(135deg, rgba(123,92,255,0.15) 0%, rgba(91,60,224,0.08) 100%); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .lp-card-tags { display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
        .lp-card-tag { padding: 2px 7px; border-radius: 999px; font-size: 9px; font-weight: 700; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }
        .lp-card-tag-level { background: rgba(123,92,255,0.2); color: #A98BFF; }
        .lp-card-title { font-family: 'Newsreader', Georgia, serif; font-size: 13px; color: #fff; font-weight: 500; line-height: 1.3; margin-bottom: 3px; }
        .lp-card-goal { font-size: 10px; color: rgba(255,255,255,0.35); line-height: 1.4; }
        .lp-card-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 7px; }
        .lp-section { display: flex; align-items: center; gap: 7px; }
        .lp-section-icon { font-size: 12px; }
        .lp-section-name { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.45); }
        .lp-section-count { margin-left: auto; font-size: 10px; font-weight: 700; color: #A98BFF; }
        .lp-divider { height: 1px; background: rgba(255,255,255,0.05); }

        /* Vocab preview chips */
        .lp-vocab { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px; }
        .lp-vocab-chip { padding: 2px 7px; border-radius: 999px; background: rgba(123,92,255,0.1); border: 1px solid rgba(123,92,255,0.15); font-size: 9px; color: #A98BFF; font-weight: 500; animation: lp-shimmer 3s ease-in-out infinite; }

        /* Skeleton shimmer for empty state */
        .lp-skeleton { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.06); animation: lp-shimmer 2s ease-in-out infinite; }
        .lp-skeleton-sm { height: 6px; }

        /* Steps */
        .lp-steps { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 12px; }
        .lp-steps-label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .lp-step { display: flex; align-items: center; gap: 7px; padding: 4px 0; }
        .lp-step-num { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; flex-shrink: 0; transition: all 0.3s; }
        .lp-step-done .lp-step-num { background: rgba(200,255,61,0.12); color: #C8FF3D; border: 1px solid rgba(200,255,61,0.25); }
        .lp-step-active .lp-step-num { background: linear-gradient(135deg, #7B5CFF, #5B3CE0); color: #fff; box-shadow: 0 0 8px rgba(123,92,255,0.4); }
        .lp-step-upcoming .lp-step-num { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.07); }
        .lp-step-label { font-size: 10px; font-weight: 600; }
        .lp-step-done .lp-step-label { color: rgba(255,255,255,0.6); }
        .lp-step-active .lp-step-label { color: #fff; }
        .lp-step-upcoming .lp-step-label { color: rgba(255,255,255,0.22); }
        .lp-step-desc { font-size: 9px; margin-left: auto; }
        .lp-step-done .lp-step-desc { color: rgba(255,255,255,0.2); }
        .lp-step-active .lp-step-desc { color: rgba(123,92,255,0.8); }
        .lp-step-upcoming .lp-step-desc { color: rgba(255,255,255,0.12); }
        .lp-connector { width: 1px; height: 6px; background: rgba(255,255,255,0.06); margin: 0 0 0 8px; }
        .lp-connector-done { background: rgba(200,255,61,0.2); }

        /* Public link preview */
        .lp-link-card { background: rgba(91,60,224,0.07); border: 1px solid rgba(91,60,224,0.14); border-radius: 10px; padding: 8px 10px; margin-top: 10px; }
        .lp-link-label { font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 3px; }
        .lp-link-url { font-size: 9px; color: #A98BFF; font-family: 'Courier New', monospace; line-height: 1.4; word-break: break-all; }
      `}</style>

      <div className="lp-wrap">
        {/* Header */}
        <div className="lp-header">
          <div className="lp-badge"><span className="lp-dot" />Live preview</div>
          <div className="lp-title">Public lesson page</div>
        </div>

        {/* Lesson card mockup */}
        <div className="lp-card">
          <div className="lp-card-header">
            <div className="lp-card-tags">
              {setup.language && <span className="lp-card-tag">{setup.language}</span>}
              {setup.level && <span className="lp-card-tag lp-card-tag-level" style={{ background: `${levelColor}22`, color: levelColor }}>{setup.level}</span>}
              {setup.unit && <span className="lp-card-tag">{setup.unit}</span>}
            </div>
            {setup.title ? (
              <div className="lp-card-title">{setup.title}</div>
            ) : (
              <div className="lp-skeleton" style={{ width: '80%', marginBottom: '4px' }} />
            )}
            {setup.goal ? (
              <div className="lp-card-goal">{setup.goal.slice(0, 60)}{setup.goal.length > 60 ? '...' : ''}</div>
            ) : (
              <div className="lp-skeleton lp-skeleton-sm" style={{ width: '60%' }} />
            )}
          </div>

          <div className="lp-card-body">
            {/* Vocab section */}
            <div className="lp-section">
              <span className="lp-section-icon">📚</span>
              <span className="lp-section-name">Vocabulary</span>
              <span className="lp-section-count">{vocab.length > 0 ? `${vocab.length} words` : '—'}</span>
            </div>
            {vocab.length > 0 && (
              <div className="lp-vocab">
                {vocab.slice(0, 4).map((v, i) => (
                  <span key={i} className="lp-vocab-chip" style={{ animationDelay: `${i * 0.3}s` }}>{v.word}</span>
                ))}
                {vocab.length > 4 && <span className="lp-vocab-chip">+{vocab.length - 4}</span>}
              </div>
            )}

            <div className="lp-divider" />

            {/* Example sentences */}
            <div className="lp-section">
              <span className="lp-section-icon">💬</span>
              <span className="lp-section-name">Example sentences</span>
              <span className="lp-section-count">{sentences.length > 0 ? sentences.length : '—'}</span>
            </div>

            <div className="lp-divider" />

            {/* Story & exercise */}
            <div className="lp-section">
              <span className="lp-section-icon">📖</span>
              <span className="lp-section-name">Story & exercise</span>
              <span className="lp-section-count" style={{ color: 'rgba(255,255,255,0.2)' }}>Step 3</span>
            </div>

            <div className="lp-divider" />

            {/* Debate */}
            <div className="lp-section">
              <span className="lp-section-icon">🗣</span>
              <span className="lp-section-name">Debate</span>
              <span className="lp-section-count" style={{ color: 'rgba(255,255,255,0.2)' }}>Step 4</span>
            </div>
          </div>
        </div>

        {/* Lesson flow steps */}
        <div className="lp-steps">
          <div className="lp-steps-label">Lesson flow</div>
          {STEPS.map((step, i) => {
            const isDone = currentStep > step.num
            const isActive = currentStep === step.num
            const cls = isDone ? 'lp-step-done' : isActive ? 'lp-step-active' : 'lp-step-upcoming'
            return (
              <div key={step.num}>
                <div className={`lp-step ${cls}`}>
                  <div className="lp-step-num">{isDone ? '✓' : step.num}</div>
                  <span className="lp-step-label">{step.label}</span>
                  <span className="lp-step-desc">{step.desc}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`lp-connector ${isDone ? 'lp-connector-done' : ''}`} />}
              </div>
            )
          })}
        </div>

        {/* Public link */}
        {slug && (
          <div className="lp-link-card">
            <div className="lp-link-label">Public link</div>
            <div className="lp-link-url">akadianacademy.com/library/{slug}</div>
          </div>
        )}
      </div>
    </>
  )
}
