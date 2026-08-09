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
  const circumference = 2 * Math.PI * 20
  const dashOffset = circumference - (completeness / 100) * circumference

  function copyLink() {
    if (!slug) return
    navigator.clipboard.writeText(`${window.location.origin}/lesson/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const s = {
    wrap: { background: '#0D1117', width: '300px', flexShrink: 0, height: '100vh', overflowY: 'auto' as const, padding: '24px 20px', fontFamily: "'Hanken Grotesk', sans-serif", display: 'flex', flexDirection: 'column' as const, gap: '16px', scrollbarWidth: 'none' as const },
    tag: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', background: 'rgba(123,92,255,0.15)', border: '1px solid rgba(123,92,255,0.25)', fontSize: '10px', fontWeight: 700, color: '#A98BFF', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px' },
    dot: { width: '5px', height: '5px', borderRadius: '50%', background: '#C8FF3D', display: 'inline-block', animation: 'blink 2s ease-in-out infinite' },
    greeting: { fontFamily: "'Newsreader', Georgia, serif", fontSize: '16px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, fontStyle: 'italic' as const },
    greetingEm: { color: '#A98BFF', fontStyle: 'normal' as const, fontWeight: 600 },
    header: { paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    progressCard: { background: 'rgba(123,92,255,0.08)', border: '1px solid rgba(123,92,255,0.15)', borderRadius: '14px', padding: '16px' },
    progressLabel: { fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' as const },
    progressPct: { position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#A98BFF' },
    sectionLabel: { fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '8px' },
    pathCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px' },
    pathLang: { fontSize: '13px', fontWeight: 700, color: '#fff' },
    pathTitle: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', fontFamily: "'Newsreader', Georgia, serif", fontStyle: 'italic' as const },
    previewCard: { background: 'rgba(91,60,224,0.08)', border: '1px solid rgba(91,60,224,0.15)', borderRadius: '12px', padding: '12px 14px' },
    previewUrl: { fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '8px', wordBreak: 'break-all' as const, lineHeight: 1.5, fontFamily: "'Courier New', monospace" },
    copyBtn: { width: '100%', padding: '8px', borderRadius: '999px', border: '1.5px solid rgba(123,92,255,0.25)', background: 'rgba(123,92,255,0.1)', color: '#A98BFF', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '12px', fontWeight: 600, cursor: 'pointer', minHeight: '34px' },
    missionCard: { background: 'rgba(255,138,61,0.06)', border: '1px solid rgba(255,138,61,0.12)', borderRadius: '12px', padding: '14px' },
    missionText: { fontFamily: "'Newsreader', Georgia, serif", fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, fontStyle: 'italic' as const },
    impactCard: { background: 'rgba(200,255,61,0.05)', border: '1px solid rgba(200,255,61,0.12)', borderRadius: '12px', padding: '14px', textAlign: 'center' as const },
    impactNum: { fontSize: '24px', fontWeight: 800, color: '#C8FF3D', letterSpacing: '-0.03em', marginBottom: '4px' },
    impactLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes sbIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
      <div style={s.wrap}>
        <div style={s.header}>
          <div style={s.tag}><span style={s.dot} />Studio</div>
          <p style={s.greeting}>
            {greeting}, <em style={s.greetingEm}>{setup.title ? setup.title.split(' ')[0] : 'Akadian'}.</em><br />
            Let's create.
          </p>
        </div>

        <div style={s.progressCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={s.progressLabel}>Completeness — {completeness}%</div>
            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(123,92,255,0.12)" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#7B5CFF" strokeWidth="3"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(.16,1,.3,1)' }} />
              </svg>
              <div style={s.progressPct}>{completeness}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {checks.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, flexShrink: 0, background: c.done ? 'rgba(200,255,61,0.12)' : 'rgba(255,255,255,0.04)', border: c.done ? '1px solid rgba(200,255,61,0.3)' : '1px solid rgba(255,255,255,0.08)', color: c.done ? '#C8FF3D' : 'rgba(255,255,255,0.2)' }}>
                  {c.done ? '✓' : '○'}
                </div>
                <span style={{ color: c.done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {(setup.language || setup.title) && (
          <div>
            <div style={s.sectionLabel}>Lesson path</div>
            <div style={s.pathCard}>
              <div style={s.pathLang}>{[setup.language, setup.level, setup.unit].filter(Boolean).join(' · ')}</div>
              {setup.title && <div style={s.pathTitle}>{setup.title}</div>}
            </div>
          </div>
        )}

        <div>
          <div style={s.sectionLabel}>Preview link</div>
          <div style={s.previewCard}>
            <div style={s.previewUrl}>
              {slug
                ? <><span style={{ color: '#A98BFF' }}>akadianacademy.com</span>/library/{slug}</>
                : <span style={{ color: 'rgba(255,255,255,0.15)' }}>Available after setup</span>
              }
            </div>
            <button style={s.copyBtn} onClick={copyLink} disabled={!slug}>
              {copied ? '✓ Copied!' : '🔗 Copy link'}
            </button>
          </div>
        </div>

        <div>
          <div style={s.sectionLabel}>Mission signal</div>
          <div style={s.missionCard}>
            <p style={s.missionText}>
              "One lesson here could help someone <span style={{ color: '#FF8A3D', fontStyle: 'normal' }}>order food, find a job,</span> or call for help in a new country."
            </p>
          </div>
        </div>

        <div>
          <div style={s.sectionLabel}>Library impact</div>
          <div style={s.impactCard}>
            <div style={s.impactNum}>12,480+</div>
            <div style={s.impactLabel}>future learners benefit from strong lesson structures</div>
          </div>
        </div>
      </div>
    </>
  )
}
