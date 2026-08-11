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
  const [define, setDefine] = useState<{ word: string; x: number; y: number } | null>(null)
  const [defineData, setDefineData] = useState<{ definition: string; example: string } | null>(null)
  const [defineLoading, setDefineLoading] = useState(false)
  const defineRef = useRef<HTMLDivElement>(null)
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

  async function handleDoubleClick() {
    const sel = window.getSelection()
    const raw = (sel?.toString() || '').trim()
    const word = raw.replace(/[^\p{L}\p{M}'-]/gu, '')
    if (!word || word.length < 2 || word.length > 40 || /\s/.test(raw)) return
    let x = window.innerWidth / 2, y = window.scrollY + 120
    try {
      const rect = sel!.getRangeAt(0).getBoundingClientRect()
      x = rect.left + rect.width / 2; y = rect.bottom + window.scrollY + 10
    } catch {}
    setActiveWord(null)
    setDefine({ word, x, y }); setDefineData(null); setDefineLoading(true)
    try {
      const res = await fetch('/api/ai/define-word', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word }) })
      const d = await res.json()
      setDefineData({ definition: d.definition || 'No definition found.', example: d.example || '' })
    } catch { setDefineData({ definition: 'Could not load definition.', example: '' }) }
    setDefineLoading(false)
  }

  useEffect(() => {
    if (!define) return
    function onDown(e: MouseEvent) { if (defineRef.current && !defineRef.current.contains(e.target as Node)) setDefine(null) }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setDefine(null) }
    const t = setTimeout(() => { document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey) }, 0)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [define])

  // Wrap each non-vocab word so it gently zooms on hover (reading tracker)
  function wordSpans(text: string, base: number): React.ReactNode[] {
    return text.split(/(\s+)/).map((tok, i) =>
      /\S/.test(tok)
        ? <span key={`w${base}-${i}`} className="rw">{tok}</span>
        : <span key={`w${base}-${i}`}>{tok}</span>
    )
  }

  // Highlight vocab words in text
  function highlightText(text: string, paraIndex: number) {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    // Guard: ignore blank/whitespace-only vocab words — an empty word
    // matches at index 0 of any string and previously caused an infinite loop.
    const safeVocab = vocab.filter(v => v.word && v.word.trim().length > 0)

    let safety = 0
    while (remaining.length > 0) {
      safety++
      if (safety > 5000) {
        // Extra safety net — never let this hang the browser again
        parts.push(<span key={key++}>{wordSpans(remaining, key)}</span>)
        break
      }

      let matchStart = -1
      let matchWord = ''
      let matchVocab: VocabItem | null = null

      for (const v of safeVocab) {
        const idx = remaining.toLowerCase().indexOf(v.word.toLowerCase())
        if (idx !== -1 && (matchStart === -1 || idx < matchStart)) {
          matchStart = idx
          matchWord = remaining.slice(idx, idx + v.word.length)
          matchVocab = v
        }
      }

      if (matchStart === -1 || !matchVocab || matchWord.length === 0) {
        parts.push(<span key={key++}>{wordSpans(remaining, key)}</span>)
        break
      }

      if (matchStart > 0) {
        parts.push(<span key={key++}>{wordSpans(remaining.slice(0, matchStart), key)}</span>)
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
            background: 'linear-gradient(120deg, rgba(123,92,255,0.25) 0%, rgba(123,92,255,0.15) 100%)',
            color: '#1A1219',
            borderRadius: '4px',
            padding: '1px 3px',
            cursor: 'pointer',
            fontWeight: 600,
            borderBottom: '2px solid rgba(123,92,255,0.5)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'linear-gradient(120deg, rgba(123,92,255,0.4) 0%, rgba(123,92,255,0.3) 100%)' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'linear-gradient(120deg, rgba(123,92,255,0.25) 0%, rgba(123,92,255,0.15) 100%)' }}
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
        .rw { display: inline-block; border-radius: 4px; transition: transform 0.13s ease, color 0.13s ease, background 0.13s ease; }
        .rw:hover { transform: scale(1.05); color: #0A0A0A; background: rgba(123,92,255,0.12); }
        .def-bubble { animation: popIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards; }
        .def-inner { background: rgba(255,255,255,0.82); -webkit-backdrop-filter: blur(24px) saturate(180%); backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 14px 16px; box-shadow: 0 12px 40px rgba(26,18,25,0.16), 0 2px 8px rgba(26,18,25,0.08); }
        .def-caret { position: absolute; top: -5px; width: 12px; height: 12px; background: rgba(255,255,255,0.82); -webkit-backdrop-filter: blur(24px) saturate(180%); backdrop-filter: blur(24px) saturate(180%); border-left: 1px solid rgba(0,0,0,0.06); border-top: 1px solid rgba(0,0,0,0.06); transform: rotate(45deg); border-radius: 3px 0 0 0; }
        .def-spin { width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(123,92,255,0.25); border-top-color: #7B5CFF; display: inline-block; animation: defspin 0.7s linear infinite; }
        @keyframes defspin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Reading progress bar */}
      <div style={{ position: 'sticky', top: 60, left: 0, right: 0, height: '3px', background: 'rgba(26,18,25,0.07)', zIndex: 50, borderRadius: '2px', marginBottom: '24px' }}>
        <div style={{ height: '100%', width: `${readProgress}%`, background: 'linear-gradient(90deg, #7B5CFF, #C8FF3D)', borderRadius: '2px', transition: 'width 0.1s' }} />
      </div>

      {/* Reading meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: '#FFFFFF', border: '1px solid rgba(91,60,224,0.10)' }}>
          <span style={{ fontSize: '12px' }}>⏱</span>
          <span style={{ fontSize: '12px', color: '#6B6575' }}>{readingTime} min read</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(123,92,255,0.08)', border: '1px solid rgba(123,92,255,0.2)' }}>
          <span style={{ fontSize: '12px' }}>📍</span>
          <span style={{ fontSize: '12px', color: '#7B5CFF' }}>{vocab.length} vocabulary words hidden inside</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: '#FFFFFF', border: '1px solid rgba(91,60,224,0.10)' }}>
          <span style={{ fontSize: '12px' }}>👆</span>
          <span style={{ fontSize: '12px', color: '#9090A0' }}>Tap highlighted words</span>
        </div>
      </div>

      {/* Story */}
      <div onDoubleClick={handleDoubleClick} style={{ background: '#FFFFFF', border: '1px solid rgba(91,60,224,0.10)', borderRadius: '20px', padding: 'clamp(24px,5vw,48px)', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(26,18,25,0.04), 0 12px 40px rgba(91,60,224,0.06)' }}>

        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,61,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {paragraphs.map((para, i) => {
          const isFirst = i === 0
          const isPull = isPullQuote(para, i)

          if (isPull) return (
            <div
              key={i}
              id={`para-${i}`}
              className={visibleParas.has(i) ? 'para-visible' : 'para-hidden'}
              style={{ animationDelay: `${i * 0.08}s`, margin: '32px 0', padding: '20px 28px', borderLeft: '3px solid #7B5CFF', background: 'rgba(123,92,255,0.05)', borderRadius: '0 12px 12px 0' }}
            >
              <p style={{ fontSize: 'clamp(16px,2.5vw,19px)', fontWeight: 500, color: '#1A1219', lineHeight: 1.7, fontStyle: 'italic' }}>
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
                <p style={{ fontSize: 'clamp(15px,2vw,17px)', color: '#1A1219', lineHeight: 1.95, position: 'relative' }}>
                  <span style={{
                    float: 'left', fontSize: '4.5em', lineHeight: '0.75', fontFamily: "'DM Serif Display', Georgia, serif", color: '#7B5CFF', marginRight: '8px', marginTop: '6px', fontWeight: 700, textShadow: '0 0 30px rgba(123,92,255,0.3)'
                  }}>
                    {para[0]}
                  </span>
                  {highlightText(para.slice(1), i)}
                </p>
              ) : (
                <p style={{ fontSize: 'clamp(15px,2vw,17px)', color: '#4A4460', lineHeight: 1.95 }}>
                  {highlightText(para, i)}
                </p>
              )}

              {/* Paragraph divider */}
              {i < paragraphs.length - 1 && i % 2 === 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 4px' }}>
                  <div style={{ flex: 1, height: 1, background: '#FFFFFF' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(123,92,255,0.4)' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(123,92,255,0.2)' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(123,92,255,0.4)' }} />
                  <div style={{ flex: 1, height: 1, background: '#FFFFFF' }} />
                </div>
              )}
            </div>
          )
        })}

        {/* End of story marker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(91,60,224,0.10)' }} />
          <span style={{ fontSize: '20px' }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(91,60,224,0.10)' }} />
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
            background: '#FFFFFF',
            border: '1px solid rgba(123,92,255,0.3)',
            borderRadius: '12px',
            padding: '10px 16px',
            zIndex: 999,
            boxShadow: '0 8px 28px rgba(26,18,25,0.14)',
            minWidth: '160px',
            pointerEvents: 'none',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1219', marginBottom: '4px' }}>{activeWord.word}</p>
          <p style={{ fontSize: '13px', color: '#7B5CFF', fontWeight: 500 }}>{activeWord.translation}</p>
        </div>
      )}

      {/* Double-click definition bubble (Apple-style) */}
      {define && (() => {
        const vw = typeof window !== 'undefined' ? window.innerWidth : 360
        const bubbleLeft = Math.max(16, Math.min(define.x - 150, vw - 316))
        const caretLeft = Math.max(14, Math.min(define.x - bubbleLeft - 6, 280))
        return (
          <div ref={defineRef} className="def-bubble" style={{ position: 'absolute', top: define.y, left: bubbleLeft, width: 300, maxWidth: 'calc(100vw - 32px)', zIndex: 1000 }}>
            <div className="def-caret" style={{ left: caretLeft }} />
            <div className="def-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: defineLoading ? '2px' : '8px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7B5CFF', flexShrink: 0 }} />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1219', letterSpacing: '-0.01em' }}>{define.word}</span>
              </div>
              {defineLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9090A0', fontSize: '12.5px' }}>
                  <span className="def-spin" /> Defining…
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '13.5px', color: '#3A3550', lineHeight: 1.55 }}>{defineData?.definition}</p>
                  {defineData?.example && (
                    <p style={{ fontSize: '12.5px', color: '#6B6575', fontStyle: 'italic', lineHeight: 1.5, marginTop: '8px', paddingLeft: '10px', borderLeft: '2px solid rgba(123,92,255,0.35)' }}>{defineData.example}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })()}

      {/* Image prompt */}
      {imagePrompt && (
        <div style={{ marginTop: '24px', background: 'rgba(123,92,255,0.07)', border: '1px solid rgba(123,92,255,0.2)', borderRadius: '14px', padding: '18px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#5B3CE0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>✦ Story illustration prompt</p>
          <p style={{ fontSize: '13px', color: '#6B6575', lineHeight: 1.6, marginBottom: '8px' }}>{imagePrompt}</p>
          <p style={{ fontSize: '11px', color: '#B0A8C0' }}>Use this in Midjourney, DALL-E, or any image generator</p>
        </div>
      )}
    </div>
  )
}
