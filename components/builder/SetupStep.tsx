'use client'
import { useState } from 'react'
import { useLessonStore, Level, Subject } from '@/store/lessonStore'
import SubjectCard from './SubjectCard'

const SUBJECTS = [
  { id: 'languages', icon: '🌐', label: 'Languages', description: 'Real-world lessons for migrants and expats.', active: true },
  { id: 'math', icon: '📐', label: 'Math & Statistics', description: 'Numbers that make sense in real life.', comingSoon: true },
  { id: 'technology', icon: '💻', label: 'Technology', description: 'Code, data, and digital skills.', comingSoon: true },
  { id: 'sciences', icon: '🔬', label: 'Sciences', description: 'Biology, chemistry, physics and more.', comingSoon: true },
  { id: 'business', icon: '📊', label: 'Business & Finance', description: 'Practical skills for the real economy.', comingSoon: true },
]

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'Conversation']
const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'German', 'Italian', 'Mandarin', 'Arabic', 'Japanese']

type BtnState = 'idle' | 'loading' | 'success' | 'error'

interface Props { onNext: () => Promise<void> }

export default function SetupStep({ onNext }: Props) {
  const { setup, setSetup } = useLessonStore()
  const [btnState, setBtnState] = useState<BtnState>('idle')
  const [shake, setShake] = useState(false)

  const canProceed = setup.title.trim().length > 0 && setup.goal.trim().length > 0

  async function handleClick() {
    if (!canProceed) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }
    setBtnState('loading')
    try {
      await onNext()
      setBtnState('success')
    } catch (e) {
      setBtnState('error')
      setTimeout(() => setBtnState('idle'), 2500)
    }
  }

  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-6px)}
          30%{transform:translateX(6px)}
          45%{transform:translateX(-4px)}
          60%{transform:translateX(4px)}
          75%{transform:translateX(-2px)}
          90%{transform:translateX(2px)}
        }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes checkPop {
          0%{transform:scale(0);opacity:0}
          60%{transform:scale(1.3);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes successPulse {
          0%,100%{box-shadow:0 4px 20px rgba(0,188,124,0.4)}
          50%{box-shadow:0 4px 36px rgba(0,188,124,0.7)}
        }
        @keyframes errorFlash {
          0%,100%{background:#b33039}
          50%{background:#ff4b55}
        }
        @keyframes loadingBreath {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.85;transform:scale(0.98)}
        }
        .btn-shake{animation:shake 0.55s ease}
        .btn-loading{animation:loadingBreath 1.2s ease-in-out infinite}
        .btn-success{animation:successPulse 1.2s ease-in-out infinite}
        .btn-error{animation:errorFlash 0.35s ease 3}
        .spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;animation:spin 0.65s linear infinite;flex-shrink:0}
        .check-icon{animation:checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both}
        .hint-text{font-size:12px;margin-top:8px;transition:all 0.3s}
      `}</style>

      <div style={{ maxWidth: '680px', width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,75,85,0.1)', border: '1px solid rgba(255,75,85,0.25)', borderRadius: '100px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#ff4b55', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            ✦ New lesson
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '12px' }}>
            What are you <span style={{ color: '#ff4b55', fontStyle: 'italic' }}>teaching</span> today?
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', maxWidth: '520px' }}>
            This lesson will not stay in one classroom. It joins a growing global library built to help people navigate real life with confidence.
          </p>
        </div>

        {/* Subject picker */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Subject type</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {SUBJECTS.map(s => (
              <SubjectCard key={s.id} icon={s.icon} label={s.label} description={s.description}
                active={setup.subject === s.id} comingSoon={s.comingSoon}
                onClick={() => setSetup({ subject: s.id as Subject })} />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '10px' }}>We are only focusing on languages for the moment</p>
        </div>

        {/* Language + Level */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Language</label>
            <select value={setup.language} onChange={e => setSetup({ language: e.target.value })}
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
              {LANGUAGES.map(l => <option key={l} value={l} style={{ background: '#0b172b' }}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Level</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setSetup({ level: l })} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${setup.level === l ? 'rgba(255,75,85,0.5)' : 'rgba(255,255,255,0.08)'}`, background: setup.level === l ? 'rgba(255,75,85,0.15)' : 'rgba(255,255,255,0.03)', color: setup.level === l ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: setup.level === l ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unit + Title */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Lesson Unit</label>
            <input type="text" placeholder="e.g. Daily Survival" value={setup.unit} onChange={e => setSetup({ unit: e.target.value })}
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Lesson Title <span style={{ color: '#ff4b55' }}>*</span>
            </label>
            <input type="text" placeholder="e.g. Talking to customer service" value={setup.title} onChange={e => setSetup({ title: e.target.value })}
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${setup.title ? 'rgba(255,75,85,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>

        {/* Goal */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Goal Description <span style={{ color: '#ff4b55' }}>*</span>
          </label>
          <textarea placeholder="e.g. Help students explain a billing problem, ask for clarification, and stay polite under pressure."
            value={setup.goal} onChange={e => setSetup({ goal: e.target.value })} rows={3}
            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${setup.goal ? 'rgba(255,75,85,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit' }} />
        </div>

        {/* THE BUTTON */}
        <div>
          <button
            onClick={handleClick}
            disabled={btnState === 'loading' || btnState === 'success'}
            className={
              btnState === 'loading' ? 'btn-loading' :
              btnState === 'success' ? 'btn-success' :
              btnState === 'error' ? 'btn-error' :
              shake ? 'btn-shake' : ''
            }
            style={{
              padding: '15px 36px',
              background:
                !canProceed ? 'rgba(255,255,255,0.06)' :
                btnState === 'success' ? '#00bc7c' :
                btnState === 'error' ? '#b33039' :
                '#ff4b55',
              border: 'none',
              borderRadius: '12px',
              color: canProceed ? '#fff' : 'rgba(255,255,255,0.25)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: btnState === 'loading' || btnState === 'success' ? 'not-allowed' : canProceed ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '220px',
              justifyContent: 'center',
              boxShadow:
                !canProceed ? 'none' :
                btnState === 'success' ? '0 4px 24px rgba(0,188,124,0.4)' :
                btnState === 'error' ? '0 4px 20px rgba(255,75,85,0.2)' :
                btnState === 'loading' ? '0 4px 20px rgba(255,75,85,0.2)' :
                '0 4px 24px rgba(255,75,85,0.35)',
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {/* Spinner */}
            {btnState === 'loading' && <div className="spinner" />}

            {/* Check */}
            {btnState === 'success' && (
              <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}

            {/* X */}
            {btnState === 'error' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}

            {/* Label */}
            {btnState === 'idle' && 'Start creating →'}
            {btnState === 'loading' && 'Saving your lesson...'}
            {btnState === 'success' && 'Saved! Loading vocab step...'}
            {btnState === 'error' && 'Something went wrong'}
          </button>

          {/* Hint below button */}
          <div className="hint-text" style={{
            color:
              btnState === 'error' ? '#ff4b55' :
              shake ? '#ff4b55' :
              'rgba(255,255,255,0.22)'
          }}>
            {btnState === 'error' && '⚠ Connection issue — check your internet and try again'}
            {btnState === 'loading' && '⏳ Connecting to database...'}
            {btnState === 'success' && '✓ Lesson saved to your studio'}
            {btnState === 'idle' && !canProceed && shake && '↑ Title and goal are required'}
            {btnState === 'idle' && !canProceed && !shake && 'Fill in the title and goal to continue'}
          </div>
        </div>

      </div>
    </>
  )
}
