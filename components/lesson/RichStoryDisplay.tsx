'use client'
import { useState, useEffect, useRef } from 'react'

interface VocabItem {
  word: string
  translation: string
}

interface Props {
  content: string
  vocab: VocabItem[]
  imagePrompt?: string
}

export default function RichStoryDisplay({ content, vocab, imagePrompt }: Props) {
  const [activeWord, setActiveWord] = useState<{ word: string; translation: string; x: number; y: number } | null>(null)
  const [readProgress, setReadProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleParas, setVisibleParas] = useState<Set<number>>(new Set([0]))

  const wordList = vocab.map(v => v.word.toLowerCase())
  const paragraphs = content.split('\n').filter(p => p.trim())

  // Reading time
  const wordCount = content.split(' ').length
  const readingTime = Math.max(1, Math.ceil(wordCount / 180))

  // Scroll progress
  useEffect(() => {
    function onScroll() {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight
      const scrolled = Math.max(0, -rect.top)
      setReadProgress(Math.min(100, (scrolled / (total - window.innerHeight)) * 100))
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Paragraph reveal on scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    paragraphs.forEach((_, i) => {
      const el = document.getElementById(`para-${i}`)
      if (!el) return
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisibleParas(prev => new Set([...prev, i]))
        }
      }, { threshold: 0.1 })
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [content])

  // Highlight vocab words in text
  function highlightText(text: string, paraIndex: number) {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      let matchStart = -1
      let matchWord = ''
      let matchVocab: VocabItem | null = null

      for (const v of vocab) {
        const idx = remaining.toLowerCase().indexOf(v.word.toLowerCase())
        if (idx !== -1 && (matchStart === -1 || idx < matchStart)) {
          matchStart = idx
          matchWord = remaining.slice(idx, idx + v.word.length)
          matchVocab = v
        }
      }

      if (matchStart === -1 || !matchVocab) {
        parts.push(<span key={key++}>{remaining}</span>)
        break
      }

      if (matchStart > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, matchStart)}</span>)
      }

      const v = matchVocab
      parts.push(
        <mark
          key={key++}
          onClick={(e) => {
            e.stopPropagation()
            const rect = (e.target as HTMLElement).getBoundingClientRect()
            setActiveWord({ word: v.word, translation: v.translation, x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY + 8 })
          }}
          style={{
            background: 'linear-gradient(120deg, rgba(255,75,85,0.25) 0%, rgba(255,75,85,0.15) 100%)',
            color: '#fff',
            borderRadius: '4px',
            padding: '1px 3px',
            cursor: 'pointer',
            fontWeight: 600,
            borderBottom: '2px solid rgba(255,75,85,0.5)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'linear-gradient(120deg, rgba(255,75,85,0.4) 0%, rgba(255,75,85,0.3) 100%)' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'linear-gradient(120deg, rgba(255,75,85,0.25) 0%, rgba(255,75,85,0.15) 100%)' }}
        >
          {matchWord}
        </mark>
      )

      remaining = remaining.slice(matchStart + matchWord.length)
    }

    return parts
  }

  // Detect if a paragraph should be a pull quote (longer sentences with emotional weight)
  function isPullQuote(text: string, index: number): boolean {
    return index > 0 && index % 3 === 2 && text.length > 80 && text.length < 200
  }

  return (
    <div ref={containerRef} style={{ fontFamily: "'DM Sans', sans-serif" }} onClick={() => setActiveWord(null)}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .para-hidden { opacity: 0; transform: translateY(20px); }
        .para-visible { animation: fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .vocab-tooltip { animation: popIn 0.2s ease forwards; }
      `}</style>

      {/* Reading progress bar */}
      <div style={{ position: 'sticky', top: 60, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.06)', zIndex: 50, borderRadius: '2px', marginBottom: '24px' }}>
        <div style={{ height: '100%', width: `${readProgress}%`, background: 'linear-gradient(90deg, #ff4b55, #00bc7c)', borderRadius: '2px', transition: 'width 0.1s' }} />
      </div>

      {/* Reading meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '12px' }}>⏱</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{readingTime} min read</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(255,75,85,0.08)', border: '1px solid rgba(255,75,85,0.2)' }}>
          <span style={{ fontSize: '12px' }}>📍</span>
          <span style={{ fontSize: '12px', color: '#ff4b55' }}>{vocab.length} vocabulary words hidden inside</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '12px' }}>👆</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Tap highlighted words</span>
        </div>
      </div>

      {/* Story */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: 'clamp(24px,5vw,48px)', position: 'relative', overflow: 'hidden' }}>

        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,75,85,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,188,124,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {paragraphs.map((para, i) => {
          const isFirst = i === 0
          const isPull = isPullQuote(para, i)

          if (isPull) return (
            <div
              key={i}
              id={`para-${i}`}
              className={visibleParas.has(i) ? 'para-visible' : 'para-hidden'}
              style={{ animationDelay: `${i * 0.08}s`, margin: '32px 0', padding: '20px 28px', borderLeft: '3px solid #ff4b55', background: 'rgba(255,75,85,0.05)', borderRadius: '0 12px 12px 0' }}
            >
              <p style={{ fontSize: 'clamp(16px,2.5vw,19px)', fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontStyle: 'italic' }}>
                "{highlightText(para, i)}"
              </p>
            </div>
          )

          return (
            <div
              key={i}
              id={`para-${i}`}
              className={visibleParas.has(i) ? 'para-visible' : 'para-hidden'}
              style={{ animationDelay: `${i * 0.08}s`, marginBottom: i < paragraphs.length - 1 ? '20px' : 0, position: 'relative' }}
            >
              {isFirst ? (
                <p style={{ fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.95, position: 'relative' }}>
                  <span style={{
                    float: 'left', fontSize: '4.5em', lineHeight: '0.75', fontFamily: "'DM Serif Display', Georgia, serif", color: '#ff4b55', marginRight: '8px', marginTop: '6px', fontWeight: 700, textShadow: '0 0 30px rgba(255,75,85,0.3)'
                  }}>
                    {para[0]}
                  </span>
                  {highlightText(para.slice(1), i)}
                </p>
              ) : (
                <p style={{ fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.95 }}>
                  {highlightText(para, i)}
                </p>
              )}

              {/* Paragraph divider */}
              {i < paragraphs.length - 1 && i % 2 === 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 4px' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,75,85,0.4)' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,75,85,0.2)' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,75,85,0.4)' }} />
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                </div>
              )}
            </div>
          )
        })}

        {/* End of story marker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '20px' }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>
      </div>

      {/* Vocab tooltip */}
      {activeWord && (
        <div
          className="vocab-tooltip"
          style={{
            position: 'absolute',
            top: activeWord.y,
            left: Math.max(16, Math.min(activeWord.x - 80, window.innerWidth - 180)),
            background: '#0f1e35',
            border: '1px solid rgba(255,75,85,0.3)',
            borderRadius: '12px',
            padding: '10px 16px',
            zIndex: 999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: '160px',
            pointerEvents: 'none',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{activeWord.word}</p>
          <p style={{ fontSize: '13px', color: '#ff4b55', fontWeight: 500 }}>{activeWord.translation}</p>
        </div>
      )}

      {/* Image prompt */}
      {imagePrompt && (
        <div style={{ marginTop: '24px', background: 'rgba(0,188,124,0.07)', border: '1px solid rgba(0,188,124,0.2)', borderRadius: '14px', padding: '18px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#00bc7c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>✦ Story illustration prompt</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '8px' }}>{imagePrompt}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Use this in Midjourney, DALL-E, or any image generator</p>
        </div>
      )}
    </div>
  )
}
