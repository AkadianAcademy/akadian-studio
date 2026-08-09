'use client'
import { useState, useEffect } from 'react'
import { useLessonStore } from '@/store/lessonStore'
import { createClient } from '@/lib/supabase'

interface KeyTerm { term: string; translation: string; meaning: string }
interface Props { onNext: () => void; onBack: () => void }

export default function Practice2Step({ onNext, onBack }: Props) {
  const { setup, lessonId } = useLessonStore()
  const [topic, setTopic] = useState('')
  const [article, setArticle] = useState('')
  const [keyTerms, setKeyTerms] = useState<KeyTerm[]>([])
  const [questions, setQuestions] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingTopic, setLoadingTopic] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [loadingTerms, setLoadingTerms] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!lessonId || lessonId === 'new') return
    fetch(`/api/lessons/${lessonId}/debate`)
      .then(r => r.json())
      .then(d => {
        if (d.debate) { setTopic(d.debate.topic || ''); setArticle(d.debate.article || ''); setKeyTerms(d.debate.keyTerms || []); setQuestions(d.debate.questions || '') }
      }).catch(console.error)
  }, [lessonId])

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  async function generateTopic() {
    setLoadingTopic(true)
    try {
      const res = await fetch('/api/ai/generate-debate-topic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: setup.level, language: setup.language, goal: setup.goal }) })
      const data = await res.json()
      if (data.topic) setTopic(data.topic)
    } catch (e) { console.error(e) }
    setLoadingTopic(false)
  }

  async function generateArticle() {
    if (!topic) return
    setLoadingArticle(true)
    try {
      const res = await fetch('/api/ai/generate-debate-article', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, level: setup.level, language: setup.language }) })
      const data = await res.json()
      if (data.article) setArticle(data.article)
    } catch (e) { console.error(e) }
    setLoadingArticle(false)
  }

  async function generateTerms() {
    if (!article) return
    setLoadingTerms(true)
    try {
      const res = await fetch('/api/ai/generate-debate-terms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, article, level: setup.level, language: setup.language }) })
      const data = await res.json()
      if (data.terms) setKeyTerms(data.terms)
    } catch (e) { console.error(e) }
    setLoadingTerms(false)
  }

  async function generateQuestions() {
    if (!article) return
    setLoadingQuestions(true)
    try {
      const res = await fetch('/api/ai/generate-debate-questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, article, level: setup.level, language: setup.language }) })
      const data = await res.json()
      if (data.questions) setQuestions(data.questions)
    } catch (e) { console.error(e) }
    setLoadingQuestions(false)
  }

  async function handleSave() {
    if (!lessonId) return
    setSaving(true)
    try {
      const token = await getToken()
      await fetch(`/api/lessons/${lessonId}/debate`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ topic, article, keyTerms, questions }) })
      setSaved(true)
      setTimeout(() => { setSaved(false); onNext() }, 600)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  function AiBtn({ label, loading, onClick, disabled = false }: { label: string; loading: boolean; onClick: () => void; disabled?: boolean }) {
    return (
      <button onClick={onClick} disabled={loading || disabled}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: loading || disabled ? 'rgba(91,60,224,0.05)' : 'linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%)', border: 'none', borderRadius: '999px', color: loading || disabled ? '#B0A8C0' : '#fff', fontSize: '13px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: loading || disabled ? 'none' : '0 4px 14px rgba(91,60,224,0.25)', minHeight: '36px' }}>
        {loading ? <><span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin2 0.8s linear infinite', display: 'inline-block' }} /> Generating...</> : `✦ ${label}`}
      </button>
    )
  }

  const C = {
    card: { background: '#fff', border: '1px solid rgba(91,60,224,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(91,60,224,0.05)' },
    label: { fontSize: '11px', fontWeight: 700, color: '#9090A0', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '10px' },
    title: { fontSize: '16px', fontWeight: 700, color: '#1A1219', marginBottom: '6px' },
    sub: { fontSize: '13px', color: '#9090A0', marginBottom: '12px' },
    textarea: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid rgba(91,60,224,0.12)', background: '#FAFAF8', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: '#1A1219', outline: 'none', resize: 'vertical' as const, lineHeight: '1.6' },
    warn: { fontSize: '13px', color: '#B0A8C0', fontStyle: 'italic' as const, marginBottom: '10px' },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        @keyframes spin2 { to { transform: rotate(360deg) } }
        @keyframes p2-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .p2-wrap { max-width: 680px; width: 100%; font-family: 'Hanken Grotesk', sans-serif; animation: p2-in 0.4s cubic-bezier(.16,1,.3,1); }
        .p2-wrap textarea:focus { border-color: rgba(91,60,224,0.35) !important; box-shadow: 0 0 0 3px rgba(91,60,224,0.08); outline: none; }
        .p2-wrap textarea::placeholder { color: #C0B8CC; }
        .p2-wrap input:focus { border-color: rgba(91,60,224,0.35) !important; box-shadow: 0 0 0 3px rgba(91,60,224,0.08); outline: none; }
      `}</style>

      <div className="p2-wrap">
        {/* Hero */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(91,60,224,0.07)', border: '1px solid rgba(91,60,224,0.14)', fontSize: '11px', fontWeight: 700, color: '#7B5CFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Practice 2 — Debate</div>
          <h1 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 'clamp(24px,4vw,32px)', color: '#1A1219', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Build a <em style={{ color: '#7B5CFF', fontStyle: 'italic' }}>real debate</em>
          </h1>
          <p style={{ fontSize: '15px', color: '#6B6575', lineHeight: 1.7 }}>
            Generate a debate topic, article, key terms and questions — calibrated to <span style={{ color: '#7B5CFF', fontWeight: 700 }}>{setup.level} level</span>.
          </p>
        </div>

        {/* Topic */}
        <div style={C.card}>
          <div style={C.title}>What are we debating today?</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <p style={C.sub}>Type your own topic or generate one</p>
            <AiBtn label="Generate topic" loading={loadingTopic} onClick={generateTopic} />
          </div>
          <textarea style={{ ...C.textarea, minHeight: '60px' }} rows={2} placeholder={`Type your own debate topic or generate one for ${setup.level} level...`} value={topic} onChange={e => setTopic(e.target.value)} />
        </div>

        {/* Article */}
        <div style={C.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={C.title}>Debate article</div>
            <AiBtn label="Generate article" loading={loadingArticle} onClick={generateArticle} disabled={!topic} />
          </div>
          {!topic && <p style={C.warn}>⚠ Enter a debate topic first.</p>}
          <textarea style={{ ...C.textarea, minHeight: '200px' }} rows={10} placeholder={'The article will be generated here with:\n- Introduction\n- In favour\n- Against\n- Conclusion'} value={article} onChange={e => setArticle(e.target.value)} />
        </div>

        {/* Key terms */}
        <div style={C.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={C.title}>Key terms & phrases</div>
            <AiBtn label="Generate key terms" loading={loadingTerms} onClick={generateTerms} disabled={!article} />
          </div>
          {!article && <p style={C.warn}>⚠ Generate an article first.</p>}
          {keyTerms.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {keyTerms.map((term, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px', padding: '10px 14px', background: 'rgba(91,60,224,0.04)', border: '1px solid rgba(91,60,224,0.09)', borderRadius: '10px', alignItems: 'start' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1219', marginBottom: '2px' }}>{term.term}</p>
                    <p style={{ fontSize: '10px', color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Term</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#7B5CFF', marginBottom: '2px' }}>{term.translation}</p>
                    <p style={{ fontSize: '10px', color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Español</p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B6575', lineHeight: 1.5 }}>{term.meaning}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', background: 'rgba(91,60,224,0.03)', border: '1px dashed rgba(91,60,224,0.12)', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#B0A8C0' }}>Key terms will appear here with Spanish translations</p>
            </div>
          )}
        </div>

        {/* Debate questions */}
        <div style={{ ...C.card, marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={C.title}>Debate questions</div>
            <AiBtn label="Generate questions" loading={loadingQuestions} onClick={generateQuestions} disabled={!article} />
          </div>
          {!article && <p style={C.warn}>⚠ Generate an article first.</p>}
          <textarea style={{ ...C.textarea, minHeight: '160px' }} rows={8} placeholder={'Questions will be generated here:\n- Comprehension questions\n- Position questions (For / Against)\n- Opinions & viewpoints'} value={questions} onChange={e => setQuestions(e.target.value)} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onBack} style={{ padding: '13px 24px', background: 'transparent', border: '1.5px solid rgba(91,60,224,0.15)', borderRadius: '999px', color: '#6B6575', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', minHeight: '48px' }}>← Back</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '13px 32px', background: saved ? '#3A7D00' : 'linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%)', border: 'none', borderRadius: '999px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 24px rgba(91,60,224,0.3)', transition: 'all 0.3s', minHeight: '48px' }}>
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save & continue →'}
          </button>
        </div>
      </div>
    </>
  )
}
