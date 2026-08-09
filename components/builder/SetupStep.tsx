'use client'
import { useState } from 'react'
import { useLessonStore } from '@/store/lessonStore'

const SUBJECTS = [
  { id: 'languages', icon: '🌐', label: 'Languages', desc: 'Real-world lessons for migrants and expats.', active: true },
  { id: 'math', icon: '📐', label: 'Math & Statistics', desc: 'Numbers that make sense in real life.', active: false },
  { id: 'technology', icon: '💻', label: 'Technology', desc: 'Code, data, and digital skills.', active: false },
  { id: 'sciences', icon: '🔬', label: 'Sciences', desc: 'Biology, chemistry, physics and more.', active: false },
  { id: 'business', icon: '📊', label: 'Business & Finance', desc: 'Practical skills for the real economy.', active: false },
]

const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'German', 'Italian', 'Mandarin', 'Arabic', 'Japanese']
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'Conversation']

const LEVEL_COLORS: Record<string, string> = {
  A1: '#00BC7C', A2: '#34D399', B1: '#60A5FA', B2: '#A78BFA', C1: '#FB923C', Conversation: '#F472B6'
}

interface Props {
  onNext: () => void
}

export default function SetupStep({ onNext }: Props) {
  const { setup, setSetup } = useLessonStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canContinue = setup.subject && setup.language && setup.level && setup.title && setup.goal

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        .ss { max-width: 640px; width: 100%; font-family: 'Hanken Grotesk', sans-serif; animation: ssIn 0.4s cubic-bezier(.16,1,.3,1); }
        @keyframes ssIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .ss-hero { margin-bottom: 32px; }
        .ss-tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; background: rgba(91,60,224,0.08); border: 1px solid rgba(91,60,224,0.15); font-size: 11px; font-weight: 700; color: #7B5CFF; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; }
        .ss-title { font-family: 'Newsreader', Georgia, serif; font-size: clamp(26px,4vw,36px); color: #1A1219; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 10px; }
        .ss-title em { color: #7B5CFF; font-style: italic; }
        .ss-desc { font-size: 15px; color: #6B6575; line-height: 1.7; max-width: 520px; }
        .ss-section { margin-bottom: 28px; }
        .ss-label { font-size: 11px; font-weight: 700; color: #9090A0; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .ss-label-req { color: #FF8A3D; }
        .ss-subjects { display: flex; flex-direction: column; gap: 8px; }
        .ss-subject { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px; border: 1.5px solid rgba(0,0,0,0.07); background: #fff; cursor: pointer; transition: all 0.2s cubic-bezier(.16,1,.3,1); position: relative; overflow: hidden; }
        .ss-subject.selected { border-color: rgba(91,60,224,0.4); background: rgba(91,60,224,0.03); box-shadow: 0 0 0 3px rgba(91,60,224,0.08); }
        .ss-subject.inactive { opacity: 0.45; cursor: not-allowed; }
        .ss-subject-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 20px; background: rgba(91,60,224,0.06); flex-shrink: 0; }
        .ss-subject.selected .ss-subject-icon { background: rgba(91,60,224,0.1); }
        .ss-subject-name { font-size: 14px; font-weight: 700; color: #1A1219; margin-bottom: 2px; }
        .ss-subject-desc { font-size: 12px; color: #6B6575; }
        .ss-subject-badge { position: absolute; top: 10px; right: 12px; padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,0.05); font-size: 10px; font-weight: 700; color: #A09AB0; letter-spacing: 0.06em; }
        .ss-subject-radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid rgba(0,0,0,0.15); background: #fff; flex-shrink: 0; margin-left: auto; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .ss-subject.selected .ss-subject-radio { border-color: #7B5CFF; background: #7B5CFF; }
        .ss-subject-radio-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; opacity: 0; transition: opacity 0.2s; }
        .ss-subject.selected .ss-subject-radio-dot { opacity: 1; }
        .ss-langs { display: flex; flex-wrap: wrap; gap: 6px; }
        .ss-lang { padding: 8px 16px; border-radius: 999px; border: 1.5px solid rgba(0,0,0,0.08); background: #fff; font-size: 13px; font-weight: 500; color: #4A4460; cursor: pointer; transition: all 0.18s; min-height: 36px; }
        .ss-lang:hover { border-color: rgba(91,60,224,0.25); color: #5B3CE0; }
        .ss-lang.selected { background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); border-color: transparent; color: #fff; box-shadow: 0 4px 12px rgba(91,60,224,0.3); font-weight: 600; }
        .ss-levels { display: flex; flex-wrap: wrap; gap: 6px; }
        .ss-level { padding: 8px 16px; border-radius: 999px; border: 1.5px solid rgba(0,0,0,0.08); background: #fff; font-size: 13px; font-weight: 600; color: #4A4460; cursor: pointer; transition: all 0.18s; min-height: 36px; }
        .ss-level:hover { transform: translateY(-1px); }
        .ss-level.selected { border-color: transparent; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
        .ss-input { width: 100%; padding: 13px 16px; border-radius: 12px; border: 1.5px solid rgba(0,0,0,0.08); background: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; color: #1A1219; outline: none; transition: border-color 0.2s, box-shadow 0.2s; min-height: 44px; }
        .ss-input:focus { border-color: rgba(91,60,224,0.4); box-shadow: 0 0 0 3px rgba(91,60,224,0.08); }
        .ss-input::placeholder { color: #B0A8C0; }
        .ss-textarea { resize: vertical; line-height: 1.6; min-height: 88px; }
        .ss-note { font-size: 12px; color: #A09AB0; margin-top: 8px; line-height: 1.5; }
        .ss-error { font-size: 13px; color: #E85555; margin-top: 8px; }
        .ss-cta { width: 100%; padding: 16px; border-radius: 999px; background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); border: none; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 24px rgba(91,60,224,0.35); margin-top: 8px; min-height: 52px; letter-spacing: 0.01em; }
        .ss-cta:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 10px 32px rgba(91,60,224,0.42); }
        .ss-cta:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }
        .ss-cta-hint { text-align: center; font-size: 12px; color: #B0A8C0; margin-top: 10px; }
      `}</style>

      <div className="ss">
        {/* Hero */}
        <div className="ss-hero">
          <div className="ss-tag">✦ New lesson</div>
          <h1 className="ss-title">What are you <em>teaching today?</em></h1>
          <p className="ss-desc">This lesson will not stay in one classroom. It joins a growing global library built to help people navigate real life with confidence.</p>
        </div>

        {/* Subject */}
        <div className="ss-section">
          <div className="ss-label">Subject type</div>
          <div className="ss-subjects">
            {SUBJECTS.map(s => (
              <div key={s.id}
                className={`ss-subject ${setup.subject === s.id ? 'selected' : ''} ${!s.active ? 'inactive' : ''}`}
                onClick={() => s.active && setSetup({ subject: s.id as any })}
              >
                <div className="ss-subject-icon">{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="ss-subject-name">{s.label}</div>
                  <div className="ss-subject-desc">{s.desc}</div>
                </div>
                {!s.active && <div className="ss-subject-badge">COMING SOON</div>}
                {s.active && (
                  <div className="ss-subject-radio">
                    <div className="ss-subject-radio-dot" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="ss-note">We are only focusing on languages for the moment.</p>
        </div>

        {/* Language */}
        <div className="ss-section">
          <div className="ss-label">Language</div>
          <div className="ss-langs">
            {LANGUAGES.map(l => (
              <button key={l} className={`ss-lang ${setup.language === l ? 'selected' : ''}`}
                onClick={() => setSetup({ language: l })}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="ss-section">
          <div className="ss-label">Level</div>
          <div className="ss-levels">
            {LEVELS.map(lv => (
              <button key={lv} className={`ss-level ${setup.level === lv ? 'selected' : ''}`}
                onClick={() => setSetup({ level: lv })}
                style={setup.level === lv ? { background: LEVEL_COLORS[lv] || '#7B5CFF' } : {}}>
                {lv}
              </button>
            ))}
          </div>
        </div>

        {/* Unit */}
        <div className="ss-section">
          <div className="ss-label">Lesson unit</div>
          <input className="ss-input" type="text" placeholder="e.g. Unit 3, Chapter 2, Week 4..."
            value={setup.unit} onChange={e => setSetup({ unit: e.target.value })} />
        </div>

        {/* Title */}
        <div className="ss-section">
          <div className="ss-label">Lesson title <span className="ss-label-req">*</span></div>
          <input className="ss-input" type="text" placeholder="e.g. Ordering food at a restaurant"
            value={setup.title} onChange={e => setSetup({ title: e.target.value })} />
        </div>

        {/* Goal */}
        <div className="ss-section">
          <div className="ss-label">Goal description <span className="ss-label-req">*</span></div>
          <textarea className="ss-input ss-textarea" placeholder="What will students be able to do after this lesson? Be specific about real-life outcomes."
            value={setup.goal} onChange={e => setSetup({ goal: e.target.value })} />
        </div>

        {error && <p className="ss-error">{error}</p>}

        <button className="ss-cta" onClick={onNext} disabled={!canContinue || saving}>
          {saving ? 'Setting up...' : 'Start creating →'}
        </button>
        {!canContinue && <p className="ss-cta-hint">Fill in the title and goal to continue</p>}
      </div>
    </>
  )
}
