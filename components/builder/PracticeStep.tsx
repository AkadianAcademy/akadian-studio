'use client'
import { useRef, useState, useEffect } from 'react'
import { useLessonStore } from '@/store/lessonStore'
import { createClient } from '@/lib/supabase'
import AiButton from './AiButton'

const LEVEL_COMPLEXITY: Record<string, string> = {
  'A1': 'Very simple. Short sentences only. Basic present tense. Max 3-4 words per blank. 3 exercises.',
  'A2': 'Simple. Short paragraphs. Present and past tense. 4-5 exercises.',
  'B1': 'Intermediate. Multi-sentence items. Mixed tenses. 5-6 exercises with some nuance.',
  'B2': 'Upper-intermediate. Complex sentences. Idioms and collocations welcome. 6 exercises.',
  'C1': 'Advanced. Sophisticated vocabulary. Nuanced meaning. 6 complex exercises with discussion elements.',
  'Conversation': 'Focus on natural spoken language. Open-ended. 6 fluid conversation-based exercises.',
}

const EXERCISE_TYPES = [
  { id: 'fill-in-blank', label: 'Fill in blank' },
  { id: 'roleplay', label: 'Roleplay' },
  { id: 'translation', label: 'Translation' },
  { id: 'multiple-choice', label: 'Multiple choice' },
  { id: 'open-conversation', label: 'Open conversation' },
  { id: 'listening', label: 'Listening' },
]

const IMAGE_STYLES = ['photorealistic', 'illustration', 'comic', 'watercolor', 'cinematic']

interface Props { onNext: () => void; onBack: () => void }

export default function PracticeStep({ onNext, onBack }: Props) {
  const { setup, lessonId, vocab } = useLessonStore()
  const [exerciseType, setExerciseType] = useState('roleplay')
  const [instructions, setInstructions] = useState('')
  const [content, setContent] = useState('')
  const [story, setStory] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageStyle, setImageStyle] = useState('photorealistic')
  const [debateStory, setDebateStory] = useState('')
  const [debateMoral, setDebateMoral] = useState('')
  const [debatePersonal, setDebatePersonal] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingEx, setLoadingEx] = useState(false)
  const [loadingStory, setLoadingStory] = useState(false)
  const [loadingDebate, setLoadingDebate] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!lessonId || lessonId === 'new') return
    fetch(`/api/lessons/${lessonId}`)
      .then(r => r.json())
      .then(d => {
        const l = d.lesson
        if (!l) return
        if (l.exercise) { setExerciseType(l.exercise.type || 'roleplay'); setInstructions(l.exercise.instructions || ''); setContent(l.exercise.content || '') }
        if (l.story) { setStory(l.story.content || ''); setImagePrompt(l.story.imageUrl || ''); setImageStyle(l.story.imageStyle || 'photorealistic'); setDebateStory(l.story.debateStory || ''); setDebateMoral(l.story.debateMoral || ''); setDebatePersonal(l.story.debatePersonal || '') }
      }).catch(console.error)
  }, [lessonId])

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  async function generateExercise() {
    setLoadingEx(true)
    try {
      const res = await fetch('/api/ai/generate-exercise', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exerciseType, level: setup.level, language: setup.language, vocab, goal: setup.goal, complexity: LEVEL_COMPLEXITY[setup.level || 'A2'] }) })
      const data = await res.json()
      if (data.instructions) setInstructions(data.instructions)
      if (data.content) setContent(data.content)
    } catch (e) { console.error(e) }
    setLoadingEx(false)
  }

  async function generateStory() {
    setLoadingStory(true)
    try {
      const res = await fetch('/api/ai/generate-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: setup.level, language: setup.language, vocab, goal: setup.goal, imageStyle }) })
      const data = await res.json()
      if (data.story) setStory(data.story)
      if (data.imagePrompt) setImagePrompt(data.imagePrompt)
    } catch (e) { console.error(e) }
    setLoadingStory(false)
  }

  async function generateDebate() {
    if (!story) return
    setLoadingDebate(true)
    try {
      const res = await fetch('/api/ai/generate-debate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ story, level: setup.level, language: setup.language }) })
      const data = await res.json()
      if (data.debateStory) setDebateStory(data.debateStory)
      if (data.debateMoral) setDebateMoral(data.debateMoral)
      if (data.debatePersonal) setDebatePersonal(data.debatePersonal)
    } catch (e) { console.error(e) }
    setLoadingDebate(false)
  }

  async function handleSave() {
    if (!lessonId) return
    setSaving(true)
    try {
      const token = await getToken()
      await fetch(`/api/lessons/${lessonId}/practice`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ exerciseType, instructions, content, story, imagePrompt, imageStyle, debateStory, debateMoral, debatePersonal }) })
      setSaved(true)
      setTimeout(() => { setSaved(false); onNext() }, 600)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const C = {
    label: { fontSize: '11px', fontWeight: 700, color: '#9090A0', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' },
    card: { background: '#fff', border: '1px solid rgba(91,60,224,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(91,60,224,0.05)' },
    textarea: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid rgba(91,60,224,0.12)', background: '#FAFAF8', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', color: '#1A1219', outline: 'none', resize: 'vertical' as const, lineHeight: '1.6', minHeight: '100px' },
    heading: { fontFamily: "'Newsreader', Georgia, serif", fontSize: 'clamp(24px,4vw,32px)', color: '#1A1219', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '8px' },
    sub: { fontSize: '15px', color: '#6B6575', lineHeight: 1.7, marginBottom: '6px' },
    level: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(91,60,224,0.08)', border: '1px solid rgba(91,60,224,0.15)', fontSize: '12px', fontWeight: 700, color: '#7B5CFF' },
    sectionTitle: { fontSize: '16px', fontWeight: 700, color: '#1A1219', marginBottom: '14px' },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        @keyframes ps-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ps-wrap { max-width: 680px; width: 100%; font-family: 'Hanken Grotesk', sans-serif; animation: ps-in 0.4s cubic-bezier(.16,1,.3,1); }
        .ex-type-btn { padding: 8px 16px; border-radius: 999px; border: 1.5px solid rgba(91,60,224,0.12); background: #fff; font-size: 13px; font-weight: 500; color: #4A4460; cursor: pointer; transition: all 0.18s; font-family: 'Hanken Grotesk', sans-serif; min-height: 36px; }
        .ex-type-btn:hover { border-color: rgba(91,60,224,0.3); color: #5B3CE0; }
        .ex-type-btn.selected { background: linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%); border-color: transparent; color: #fff; font-weight: 600; box-shadow: 0 4px 12px rgba(91,60,224,0.25); }
        .img-style-btn { padding: 7px 14px; border-radius: 999px; border: 1.5px solid rgba(91,60,224,0.12); background: #fff; font-size: 12px; font-weight: 500; color: #4A4460; cursor: pointer; transition: all 0.18s; font-family: 'Hanken Grotesk', sans-serif; }
        .img-style-btn.selected { background: rgba(91,60,224,0.08); border-color: rgba(91,60,224,0.25); color: #7B5CFF; font-weight: 600; }
        .ps-wrap textarea:focus { border-color: rgba(91,60,224,0.35); box-shadow: 0 0 0 3px rgba(91,60,224,0.08); outline: none; }
        .ps-wrap textarea::placeholder { color: #C0B8CC; }
      `}</style>

      <div className="ps-wrap">
        {/* Hero */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(91,60,224,0.07)', border: '1px solid rgba(91,60,224,0.14)', fontSize: '11px', fontWeight: 700, color: '#7B5CFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Make them practice</div>
          <h1 style={C.heading}>Learning that <em style={{ color: '#7B5CFF', fontStyle: 'italic' }}>actually sticks</em></h1>
          <p style={C.sub}>Everything below is calibrated to</p>
          <div style={C.level}>{setup.level || 'A2'} level</div>
        </div>

        {/* Exercise type */}
        <div style={C.card}>
          <div style={C.sectionTitle}>Exercise type</div>
          <p style={{ fontSize: '13px', color: '#9090A0', marginBottom: '12px' }}>Choose one main activity</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {EXERCISE_TYPES.map(t => (
              <button key={t.id} className={`ex-type-btn ${exerciseType === t.id ? 'selected' : ''}`} onClick={() => setExerciseType(t.id)}>{t.label}</button>
            ))}
          </div>
          <AiButton label="AI generate exercise" loadingLabel="Generating..." loading={loadingEx} onClick={generateExercise} variant="primary" />
        </div>

        {/* Exercise instructions */}
        <div style={C.card}>
          <div style={C.label}>Exercise instructions</div>
          <textarea style={C.textarea} rows={3} placeholder="Instructions for students..." value={instructions} onChange={e => setInstructions(e.target.value)} />
        </div>

        {/* Exercise content */}
        <div style={C.card}>
          <div style={C.label}>Exercise content</div>
          <textarea style={C.textarea} rows={8} placeholder="The actual exercise content..." value={content} onChange={e => setContent(e.target.value)} />
        </div>

        {/* Story */}
        <div style={C.card}>
          <div style={C.sectionTitle}>Context story</div>
          <p style={{ fontSize: '13px', color: '#9090A0', marginBottom: '12px' }}>A short story using the vocabulary in a real-life situation at {setup.level} level.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {IMAGE_STYLES.map(s => (
              <button key={s} className={`img-style-btn ${imageStyle === s ? 'selected' : ''}`} onClick={() => setImageStyle(s)}>{s}</button>
            ))}
          </div>
          <AiButton label="AI generate story" loadingLabel="Generating..." loading={loadingStory} onClick={generateStory} variant="secondary" />
          {story && (
            <textarea style={{ ...C.textarea, marginTop: '12px', minHeight: '160px' }} rows={7} value={story} onChange={e => setStory(e.target.value)} />
          )}
          {imagePrompt && (
            <div style={{ marginTop: '10px', padding: '12px 14px', background: 'rgba(91,60,224,0.04)', border: '1px solid rgba(91,60,224,0.1)', borderRadius: '10px', fontSize: '12px', color: '#6B6575' }}>
              🖼 {imagePrompt}
            </div>
          )}
        </div>

        {/* Story questions */}
        <div style={C.card}>
          <div style={C.sectionTitle}>Story questions for students</div>
          {!story && <p style={{ fontSize: '13px', color: '#B0A8C0', marginBottom: '12px', fontStyle: 'italic' }}>⚠ Generate or write a story first.</p>}
          <AiButton label="AI generate story questions" loadingLabel="Generating..." loading={loadingDebate} onClick={generateDebate} variant="secondary" disabled={!story} />
          {(debateStory || debateMoral || debatePersonal) && (
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'What happened in the story', value: debateStory, setter: setDebateStory },
                { label: 'What we can learn from it', value: debateMoral, setter: setDebateMoral },
                { label: 'Personal connection', value: debatePersonal, setter: setDebatePersonal },
              ].map(q => (
                <div key={q.label}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{q.label}</div>
                  <textarea style={{ ...C.textarea, minHeight: '70px' }} rows={3} value={q.value} onChange={e => q.setter(e.target.value)} />
                </div>
              ))}
            </div>
          )}
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
