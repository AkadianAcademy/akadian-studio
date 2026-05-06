'use client'
import { useState, useEffect } from 'react'

interface Props {
  topic: string
  article: string
  keyTerms: any[]
  questions: string
}

export default function RichDebateDisplay({ topic, article, keyTerms, questions }: Props) {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0]))
  const [activeSection, setActiveSection] = useState<'intro' | 'favour' | 'against' | 'conclusion'>('intro')
  const [readTime] = useState(Math.max(2, Math.ceil(article.split(' ').length / 180)))

  // Parse article into sections
  function parseArticle(text: string) {
    const sections: { type: string; content: string }[] = []
    const lines = text.split('\n')
    let current = { type: 'intro', content: '' }

    for (const line of lines) {
      if (line.trim().startsWith('INTRODUCTION:')) {
        if (current.content.trim()) sections.push(current)
        current = { type: 'intro', content: '' }
      } else if (line.trim().startsWith('IN FAVOUR:')) {
        if (current.content.trim()) sections.push(current)
        current = { type: 'favour', content: '' }
      } else if (line.trim().startsWith('AGAINST:')) {
        if (current.content.trim()) sections.push(current)
        current = { type: 'against', content: '' }
      } else if (line.trim().startsWith('CONCLUSION:')) {
        if (current.content.trim()) sections.push(current)
        current = { type: 'conclusion', content: '' }
      } else {
        current.content += (current.content ? '\n' : '') + line
      }
    }
    if (current.content.trim()) sections.push(current)
    return sections
  }

  const sections = parseArticle(article)

  const SECTION_CONFIG = {
    intro: { label: 'Introduction', icon: '📋', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    favour: { label: 'In Favour', icon: '✅', color: '#00bc7c', bg: 'rgba(0,188,124,0.08)', border: 'rgba(0,188,124,0.25)' },
    against: { label: 'Against', icon: '⚠️', color: '#ff4b55', bg: 'rgba(255,75,85,0.08)', border: 'rgba(255,75,85,0.25)' },
    conclusion: { label: 'Conclusion', icon: '💡', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .debate-section-card { animation: fadeSlideUp 0.5s ease forwards; }
      `}</style>

      {/* Topic hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(255,75,85,0.1), rgba(0,188,124,0.06))', border: '1px solid rgba(255,75,85,0.2)', borderRadius: '20px', padding: 'clamp(20px,4vw,36px)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,75,85,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4b55', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff4b55', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's debate</span>
        </div>
        <p style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          {topic}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(0,188,124,0.1)', border: '1px solid rgba(0,188,124,0.2)' }}>
            <span style={{ fontSize: '12px' }}>✅</span>
            <span style={{ fontSize: '12px', color: '#00bc7c', fontWeight: 600 }}>In Favour</span>
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>vs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,75,85,0.1)', border: '1px solid rgba(255,75,85,0.2)' }}>
            <span style={{ fontSize: '12px' }}>⚠️</span>
            <span style={{ fontSize: '12px', color: '#ff4b55', fontWeight: 600 }}>Against</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '12px' }}>⏱</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Section nav pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {sections.map((s, i) => {
          const cfg = SECTION_CONFIG[s.type as keyof typeof SECTION_CONFIG] || SECTION_CONFIG.intro
          return (
            <button key={i}
              onClick={() => { document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
              style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}>
              {cfg.icon} {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Article sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {sections.map((s, i) => {
          const cfg = SECTION_CONFIG[s.type as keyof typeof SECTION_CONFIG] || SECTION_CONFIG.intro
          const paragraphs = s.content.split('\n').filter(p => p.trim())
          return (
            <div key={i} id={`section-${i}`} className="debate-section-card"
              style={{ animationDelay: `${i * 0.1}s`, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '16px', overflow: 'hidden' }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${cfg.border}` }}>
                <span style={{ fontSize: '18px' }}>{cfg.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: cfg.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{cfg.label}</span>
                {s.type === 'favour' && <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0,188,124,0.15)', color: '#00bc7c', fontWeight: 600 }}>PRO</span>}
                {s.type === 'against' && <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,75,85,0.15)', color: '#ff4b55', fontWeight: 600 }}>CON</span>}
              </div>
              {/* Section content */}
              <div style={{ padding: '20px' }}>
                {paragraphs.map((para, j) => (
                  <p key={j} style={{ fontSize: 'clamp(14px,2vw,16px)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.85, marginBottom: j < paragraphs.length - 1 ? '14px' : 0 }}>
                    {s.type === 'favour' && j === 0 && <span style={{ color: '#00bc7c', fontWeight: 700, marginRight: '6px' }}>↑</span>}
                    {s.type === 'against' && j === 0 && <span style={{ color: '#ff4b55', fontWeight: 700, marginRight: '6px' }}>↓</span>}
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Key terms */}
      {keyTerms && keyTerms.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px' }}>🔑</span>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Key terms to know</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '10px' }}>
            {keyTerms.map((term: any, i: number) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{term.term}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#ff4b55', marginLeft: '8px', flexShrink: 0 }}>{term.translation}</p>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{term.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {questions && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '16px' }}>💬</span>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Debate questions</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {questions.split('\n').map((line: string, i: number) => {
              const isHeader = ['COMPREHENSION:', 'POSITION:', 'OPINIONS & VIEWPOINTS:'].some(h => line.trim().startsWith(h))
              const isQuestion = line.trim().match(/^\d+\./)
              if (isHeader) return (
                <p key={i} style={{ fontSize: '11px', fontWeight: 700, color: '#00bc7c', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '20px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(0,188,124,0.4)' }} />
                  {line}
                  <span style={{ display: 'inline-block', flex: 1, height: 1, background: 'rgba(0,188,124,0.15)' }} />
                </p>
              )
              if (isQuestion) return (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                  <span style={{ color: '#ff4b55', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>{line.match(/^\d+/)?.[0]}.</span>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{line.replace(/^\d+\./, '').trim()}</p>
                </div>
              )
              return line.trim() ? <p key={i} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 2 }}>{line}</p> : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
