'use client'
import { useRef, useState } from 'react'
import { useLessonStore, VocabItem, SentenceItem } from '@/store/lessonStore'
import { createClient } from '@/lib/supabase'
import { useAI } from '@/hooks/useAI'
import AiButton from './AiButton'
import VocabRow from './VocabRow'
import ExampleSentenceRow from './ExampleSentenceRow'

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function VocabStep({ onNext, onBack }: Props) {
  const { setup, lessonId, vocab, setVocab, sentences, setSentences } = useLessonStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const tokenRef = useRef<string | null>(null)
  const supabase = createClient()

  async function getToken() {
    if (tokenRef.current) return tokenRef.current
    const { data: { session } } = await supabase.auth.getSession()
    tokenRef.current = session?.access_token || null
    return tokenRef.current
  }

  const suggestVocabAI = useAI('/api/ai/suggest-vocab', {
    onSuccess: (data) => {
      if (data.vocab) {
        const newVocab = data.vocab.map((v: any) => ({
          id: Math.random().toString(36).slice(2),
          word: v.word,
          translation: v.translation,
        }))
        setVocab(newVocab)
      }
    }
  })

  const addExamplesAI = useAI('/api/ai/add-examples', {
    onSuccess: (data) => {
      if (data.sentences) {
        const newSentences = data.sentences.map((s: any) => ({
          id: Math.random().toString(36).slice(2),
          source: s.source,
          translation: s.translation,
        }))
        setSentences(newSentences)
      }
    }
  })

  async function handleSuggestVocab() {
    const token = await getToken()
    if (!token) return
    await suggestVocabAI.call({
      title: setup.title,
      level: setup.level,
      language: setup.language,
      goal: setup.goal,
    }, token)
  }

  async function handleAddExamples() {
    const token = await getToken()
    if (!token) return
    if (vocab.length === 0) return
    await addExamplesAI.call({
      vocab,
      level: setup.level,
      language: setup.language,
      title: setup.title,
    }, token)
  }

  function addVocabRow() {
    setVocab([...vocab, { id: Math.random().toString(36).slice(2), word: '', translation: '' }])
  }

  function updateVocab(id: string, field: 'word' | 'translation', value: string) {
    setVocab(vocab.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  function deleteVocab(id: string) {
    setVocab(vocab.filter(v => v.id !== id))
  }

  function addSentenceRow() {
    setSentences([...sentences, { id: Math.random().toString(36).slice(2), source: '', translation: '' }])
  }

  function updateSentence(id: string, field: 'source' | 'translation', value: string) {
    setSentences(sentences.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function deleteSentence(id: string) {
    setSentences(sentences.filter(s => s.id !== id))
  }

  async function handleSaveAndNext() {
    if (!lessonId) return
    setSaving(true)
    try {
      const token = await getToken()
      await fetch(`/api/lessons/${lessonId}/vocab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vocab, sentences })
      })
      setSaved(true)
      setTimeout(() => onNext(), 800)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: '680px', width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,75,85,0.1)', border: '1px solid rgba(255,75,85,0.25)', borderRadius: '100px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#ff4b55', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          ✦ Build meaning
        </div>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '12px' }}>
          Words that <span style={{ color: '#ff4b55', fontStyle: 'italic' }}>open doors</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', maxWidth: '520px' }}>
          Give your students the language they will actually use — at the doctor, at work, on the phone, and in moments that matter.
        </p>
      </div>

      {/* Vocabulary section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>Vocabulary</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Core words for the lesson</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <AiButton
              label="AI suggest vocabulary"
              loadingLabel="Generating..."
              loading={suggestVocabAI.loading}
              onClick={handleSuggestVocab}
              variant="primary"
            />
            <AiButton
              label="AI add examples"
              loadingLabel="Generating..."
              loading={addExamplesAI.loading}
              onClick={handleAddExamples}
              variant="secondary"
              disabled={vocab.length === 0}
            />
          </div>
        </div>

        {/* Vocab rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {vocab.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
                No vocabulary yet — click <span style={{ color: '#ff4b55' }}>AI suggest vocabulary</span> or add words manually
              </p>
            </div>
          ) : (
            vocab.map((v, i) => (
              <VocabRow
                key={v.id}
                index={i}
                word={v.word}
                translation={v.translation}
                onWordChange={val => updateVocab(v.id, 'word', val)}
                onTranslationChange={val => updateVocab(v.id, 'translation', val)}
                onDelete={() => deleteVocab(v.id)}
              />
            ))
          )}
        </div>

        <button onClick={addVocabRow} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          + Add word
        </button>

        {suggestVocabAI.error && (
          <p style={{ fontSize: '12px', color: '#ff4b55', marginTop: '8px' }}>⚠ {suggestVocabAI.error}</p>
        )}
      </div>

      {/* Example sentences section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>Example sentences</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Show how the language works in context</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
          {sentences.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
                No sentences yet — click <span style={{ color: '#00bc7c' }}>AI add examples</span> above or add manually
              </p>
            </div>
          ) : (
            sentences.map((s, i) => (
              <ExampleSentenceRow
                key={s.id}
                index={i}
                source={s.source}
                translation={s.translation}
                onSourceChange={val => updateSentence(s.id, 'source', val)}
                onTranslationChange={val => updateSentence(s.id, 'translation', val)}
                onDelete={() => deleteSentence(s.id)}
              />
            ))
          )}
        </div>

        <button onClick={addSentenceRow} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          + Add sentence
        </button>

        {addExamplesAI.error && (
          <p style={{ fontSize: '12px', color: '#ff4b55', marginTop: '8px' }}>⚠ {addExamplesAI.error}</p>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ padding: '13px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          ← Back
        </button>
        <button
          onClick={handleSaveAndNext}
          disabled={saving || saved}
          style={{ padding: '13px 32px', background: saved ? '#00bc7c' : '#ff4b55', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: saving || saved ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.3s', boxShadow: saved ? '0 4px 20px rgba(0,188,124,0.4)' : '0 4px 20px rgba(255,75,85,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {saving && <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />}
          {saved ? '✓ Saved! Moving on...' : saving ? 'Saving...' : 'Save & continue →'}
        </button>
      </div>
    </div>
  )
}
