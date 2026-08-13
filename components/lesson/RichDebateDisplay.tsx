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

  // Detect a section header, tolerating **HEADER:** markdown + casing
  function sectionType(line: string): string | null {
    const clean = line.trim().replace(/[*_#]/g, '').replace(/:\s*$/, '').trim().toUpperCase()
    if (clean === 'INTRODUCTION' || clean === 'INTRO') return 'intro'
    if (clean === 'IN FAVOUR' || clean === 'IN FAVOR' || clean === 'FOR' || clean === 'PROS') return 'favour'
    if (clean === 'AGAINST' || clean === 'CONS') return 'against'
    if (clean === 'CONCLUSION') return 'conclusion'
    return null
  }

  function parseArticle(text: string) {
    const sections: { type: string; content: string }[] = []
    const lines = text.split('\n')
    let current = { type: 'intro', content: '' }
    let started = false

    for (const line of lines) {
      const t = sectionType(line)
      if (t) {
        if (started && current.content.trim()) sections.push(current)
        current = { type: t, content: '' }
        started = true
      } else {
        current.content += (current.content ? '\n' : '') + line
      }
    }
    if (current.content.trim()) sections.push(current)
    return sections
  }

  // Render inline **bold** and strip stray markdown
  function renderInline(text: string, keyBase: string) {
    return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${keyBase}-${i}`} style={{ fontWeight: 700, color: '#1A1219' }}>{part.slice(2, -2)}</strong>
      }
      return <span key={`${keyBase}-${i}`}>{part.replace(/\*\*/g, '')}</span>
    })
  }

  const sections = parseArticle(article)

  const SECTION_CONFIG = {
    intro: { label: 'Introduction', icon: '📋', color: '#2563EB', bg: 'rgba(37,99,235,0.07)', border: 'rgba(37,99,235,0.22)' },
    favour: { label: 'In Favour', icon: '✅', color: '#0E9F6E', bg: 'rgba(14,159,110,0.08)', border: 'rgba(14,159,110,0.25)' },
    against: { label: 'Against', icon: '⚠️', color: '#E11D48', bg: 'rgba(225,29,72,0.07)', border: 'rgba(225,29,72,0.22)' },
    conclusion: { label: 'Conclusion', icon: '💡', color: '#B45309', bg: 'rgba(180,83,9,0.08)', border: 'rgba(180,83,9,0.22)' },
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes debIn { from { opacity:0; transform: translateY(26px) scale(0.985); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes debAccent { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes debParaIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes debIconPop { 0%{transform:scale(0) rotate(-25deg);} 55%{transform:scale(1.25) rotate(10deg);} 100%{transform:scale(1) rotate(0);} }
        .debate-section-card { animation: fadeSlideUp 0.5s ease forwards; }
        .deb-card { animation: debIn 0.6s cubic-bezier(0.22,1,0.36,1) backwards; transition: box-shadow 0.25s ease, border-color 0.25s ease; }
        .deb-card:hover { box-shadow: 0 12px 34px rgba(26,18,25,0.10); }
        .deb-accent { animation: debAccent 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .deb-icon { display: inline-block; animation: debIconPop 0.5s ease both; }
        .deb-para { animation: debParaIn 0.5s ease both; }
        .deb-badge { animation: pulse 2.4s ease-in-out infinite; }
        .deb-pill { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .deb-pill:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,18,25,0.08); }
      `}</style>

      {/* Topic hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.10), rgba(200,255,61,0.08))', border: '1px solid rgba(123,92,255,0.20)', borderRadius: '20px', padding: 'clamp(20px,4vw,36px)', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(91,60,224,0.06)' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,255,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B5CFF', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7B5CFF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's debate</span>
        </div>
        <p style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 700, color: '#1A1219', lineHeight: 1.2, letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          {topic}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(14,159,110,0.10)', border: '1px solid rgba(14,159,110,0.22)' }}>
            <span style={{ fontSize: '12px' }}>✅</span>
            <span style={{ fontSize: '12px', color: '#0E9F6E', fontWeight: 600 }}>In Favour</span>
          </div>
          <span style={{ fontSize: '12px', color: '#9090A0', alignSelf: 'center' }}>vs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(225,29,72,0.10)', border: '1px solid rgba(225,29,72,0.22)' }}>
            <span style={{ fontSize: '12px' }}>⚠️</span>
            <span style={{ fontSize: '12px', color: '#E11D48', fontWeight: 600 }}>Against</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: '#FFFFFF', border: '1px solid rgba(91,60,224,0.10)' }}>
            <span style={{ fontSize: '12px' }}>⏱</span>
            <span style={{ fontSize: '12px', color: '#9090A0' }}>{readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Section nav pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {sections.map((s, i) => {
          const cfg = SECTION_CONFIG[s.type as keyof typeof SECTION_CONFIG] || SECTION_CONFIG.intro
          return (
            <button key={i} className="deb-pill"
              onClick={() => { document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
              style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}>
              {cfg.icon} {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Article sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
        {sections.map((s, i) => {
          const cfg = SECTION_CONFIG[s.type as keyof typeof SECTION_CONFIG] || SECTION_CONFIG.intro
          const paragraphs = s.content.split('\n').filter(p => p.trim())
          return (
            <div key={i} id={`section-${i}`} className="deb-card"
              style={{ animationDelay: `${i * 0.12}s`, background: '#FFFFFF', border: `1px solid ${cfg.border}`, borderRadius: '18px', overflow: 'hidden', position: 'relative', boxShadow: '0 2px 10px rgba(26,18,25,0.03)' }}>
              <div className="deb-accent" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: cfg.color, transformOrigin: 'top', animationDelay: `${i * 0.12 + 0.15}s` }} />
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px 14px 24px', background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
                <span className="deb-icon" style={{ fontSize: '18px', animationDelay: `${i * 0.12 + 0.25}s` }}>{cfg.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: cfg.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{cfg.label}</span>
                {s.type === 'favour' && <span className="deb-badge" style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(14,159,110,0.15)', color: '#0E9F6E', fontWeight: 700, letterSpacing: '0.05em' }}>PRO</span>}
                {s.type === 'against' && <span className="deb-badge" style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(225,29,72,0.15)', color: '#E11D48', fontWeight: 700, letterSpacing: '0.05em' }}>CON</span>}
              </div>
              {/* Section content */}
              <div style={{ padding: '20px 24px' }}>
                {paragraphs.map((para, j) => (
                  <p key={j} className="deb-para" style={{ animationDelay: `${i * 0.12 + 0.28 + j * 0.09}s`, fontSize: 'clamp(14px,2vw,16px)', color: '#1A1219', lineHeight: 1.85, marginBottom: j < paragraphs.length - 1 ? '14px' : 0 }}>
                    {s.type === 'favour' && j === 0 && <span style={{ color: '#0E9F6E', fontWeight: 700, marginRight: '6px' }}>↑</span>}
                    {s.type === 'against' && j === 0 && <span style={{ color: '#E11D48', fontWeight: 700, marginRight: '6px' }}>↓</span>}
                    {renderInline(para, `p${i}-${j}`)}
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Key terms */}
      {keyTerms && keyTerms.length > 0 && (
        <div style={{ background: '#F5F4F0', border: '1px solid rgba(91,60,224,0.10)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px' }}>🔑</span>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#6B6575', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Key terms to know</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '10px' }}>
            {keyTerms.map((term: any, i: number) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(91,60,224,0.10)', borderRadius: '12px', padding: '14px 16px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1219' }}>{term.term}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#7B5CFF', marginLeft: '8px', flexShrink: 0 }}>{term.translation}</p>
                </div>
                <p style={{ fontSize: '12px', color: '#9090A0', lineHeight: 1.5 }}>{term.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {questions && (
        <div style={{ background: '#F5F4F0', border: '1px solid rgba(91,60,224,0.10)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '16px' }}>💬</span>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#6B6575', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Debate questions</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {questions.split('\n').map((line: string, i: number) => {
              const isHeader = ['COMPREHENSION:', 'POSITION:', 'OPINIONS & VIEWPOINTS:'].some(h => line.trim().startsWith(h))
              const isQuestion = line.trim().match(/^\d+\./)
              if (isHeader) return (
                <p key={i} style={{ fontSize: '11px', fontWeight: 700, color: '#5B3CE0', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '20px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(123,92,255,0.4)' }} />
                  {line}
                  <span style={{ display: 'inline-block', flex: 1, height: 1, background: 'rgba(123,92,255,0.15)' }} />
                </p>
              )
              if (isQuestion) return (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: '#F5F4F0', border: '1px solid #FFFFFF', marginBottom: '4px' }}>
                  <span style={{ color: '#7B5CFF', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>{line.match(/^\d+/)?.[0]}.</span>
                  <p style={{ fontSize: '14px', color: '#4A4460', lineHeight: 1.6 }}>{line.replace(/^\d+\./, '').trim()}</p>
                </div>
              )
              return line.trim() ? <p key={i} style={{ fontSize: '14px', color: '#55505F', lineHeight: 2 }}>{line}</p> : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
