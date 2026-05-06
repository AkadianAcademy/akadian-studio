'use client'
import { useState, useEffect } from 'react'
import { useLessonStore } from '@/store/lessonStore'
import { createClient } from '@/lib/supabase'

interface KeyTerm {
  term: string
  translation: string
  meaning: string
}

interface Props {
  onNext: () => void
  onBack: () => void
}

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

  // Load existing debate data when editing
  useEffect(() => {
    if (!lessonId || lessonId === 'new') return
    fetch(`/api/lessons/${lessonId}/debate`)
      .then(r => r.json())
      .then(d => {
        if (d.debate) {
          setTopic(d.debate.topic || '')
          setArticle(d.debate.article || '')
          setKeyTerms(d.debate.keyTerms || [])
          setQuestions(d.debate.questions || '')
        }
      })
      .catch(console.error)
  }, [lessonId])

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  async function generateTopic() {
    setLoadingTopic(true)
    try {
      const res = await fetch('/api/ai/generate-debate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: setup.level, language: setup.language, goal: setup.goal })
      })
      const data = await res.json()
      if (data.topic) setTopic(data.topic)
    } catch (e) { console.error(e) }
    setLoadingTopic(false)
  }

  async function generateArticle() {
    if (!topic) return
    setLoadingArticle(true)
    try {
      const res = await fetch('/api/ai/generate-debate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level: setup.level, language: setup.language })
      })
      const data = await res.json()
      if (data.article) setArticle(data.article)
    } catch (e) { console.error(e) }
    setLoadingArticle(false)
  }

  async function generateTerms() {
    if (!article) return
    setLoadingTerms(true)
    try {
      const res = await fetch('/api/ai/generate-debate-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, article, level: setup.level, language: setup.language })
      })
      const data = await res.json()
      if (data.terms) setKeyTerms(data.terms)
    } catch (e) { console.error(e) }
    setLoadingTerms(false)
  }

  async function generateQuestions() {
    if (!article) return
    setLoadingQuestions(true)
    try {
      const res = await fetch('/api/ai/generate-debate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, article, level: setup.level, language: setup.language })
      })
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
      await fetch(`/api/lessons/${lessonId}/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ topic, article, keyTerms, questions })
      })
      setSaved(true)
      setTimeout(() => { setSaved(false); onNext() }, 600)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const level = setup.level || 'B1'

  const levelColors: Record<string, string> = {
    A1: '#00bc7c', A2: '#34d399', B1: '#3b82f6', B2: '#8b5cf6', C1: '#f59e0b'
  }
  const levelColor = levelColors[level] || '#ff4b55'

  function sLabel(text: string) {
    return (
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
        {text}
      </p>
    )
  }

  function aiBtn(label: string, loading: boolean, onClick: () => void, disabled = false) {
    return (
      <button onClick={onClick} disabled={loading || disabled}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: loading ? 'rgba(255,255,255,0.05)' : disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,75,85,0.1)', border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,75,85,0.25)'}`, borderRadius: '10px', color: disabled ? 'rgba(255,255,255,0.2)' : '#ff4b55', fontSize: '13px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
        {loading ? (
          <>
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,75,85,0.2)', borderTopColor: '#ff4b55', animation: 'spin 0.8s linear infinite' }} />
            Generating...
          </>
        ) : `✦ ${label}`}
      </button>
    )
  }

  return (
    <div style={{ maxWidth: '720px', width: '100%', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,75,85,0.1)', border: '1px solid rgba(255,75,85,0.25)', borderRadius: '100px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#ff4b55', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          ✦ Practice 2 — Debate
        </div>
        <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '10px' }}>
          Build a <span style={{ color: '#ff4b55', fontStyle: 'italic' }}>real debate</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
          Generate a debate topic, article, key terms and questions — all calibrated to{' '}
          <span style={{ color: levelColor, fontWeight: 600 }}>{level} level</span>.
        </p>
      </div>

      {/* SECTION 1 — Topic */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          {sLabel('What are we debating today?')}
          {aiBtn('Generate topic', loadingTopic, generateTopic)}
        </div>
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={`Type your own debate topic or generate one for ${level} level...`}
          rows={2}
          style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${topic ? 'rgba(255,75,85,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 500, outline: 'none', resize: 'vertical', lineHeight: '1.5', fontFamily: 'inherit' }}
        />
        {topic && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '3px 10px', borderRadius: '100px', background: `${levelColor}20`, border: `1px solid ${levelColor}40`, fontSize: '11px', fontWeight: 600, color: levelColor }}>{level}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Topic ready</span>
          </div>
        )}
      </div>

      {/* SECTION 2 — Article */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          {sLabel('Debate article')}
          {aiBtn('Generate article', loadingArticle, generateArticle, !topic)}
        </div>
        {!topic && (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', marginBottom: '10px' }}>⚠ Enter a debate topic first.</p>
        )}
        <textarea
          value={article}
          onChange={e => setArticle(e.target.value)}
          placeholder={`The article will be generated here with:\n- Introduction\n- In favour\n- Against\n- Conclusion`}
          rows={10}
          style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${article ? 'rgba(255,75,85,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: '1.8', fontFamily: 'inherit' }}
        />
      </div>

      {/* SECTION 3 — Key Terms */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          {sLabel('Key terms & phrases')}
          {aiBtn('Generate key terms', loadingTerms, generateTerms, !article)}
        </div>
        {!article && (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', marginBottom: '10px' }}>⚠ Generate an article first.</p>
        )}
        {keyTerms.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.4s ease' }}>
            {keyTerms.map((term, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{term.term}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>English</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#ff4b55', marginBottom: '2px' }}>{term.translation}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Español</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{term.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>Key terms will appear here with Spanish translations</p>
          </div>
        )}
      </div>

      {/* SECTION 4 — Questions */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          {sLabel('Debate questions')}
          {aiBtn('Generate questions', loadingQuestions, generateQuestions, !article)}
        </div>
        {!article && (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', marginBottom: '10px' }}>⚠ Generate an article first.</p>
        )}
        <textarea
          value={questions}
          onChange={e => setQuestions(e.target.value)}
          placeholder={`Questions will be generated here:\n- Comprehension questions\n- Position questions (For / Against)\n- Opinions & viewpoints`}
          rows={8}
          style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${questions ? 'rgba(255,75,85,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: '1.8', fontFamily: 'inherit' }}
        />
      </div>

      {/* Footer buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onBack}
          style={{ padding: '13px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Back
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex: 1, padding: '13px 32px', background: saved ? '#00bc7c' : saving ? 'rgba(255,255,255,0.1)' : '#ff4b55', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: saved || saving ? 'none' : '0 4px 20px rgba(255,75,85,0.3)', transition: 'all 0.3s' }}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save & continue →'}
        </button>
      </div>
    </div>
  )
}
