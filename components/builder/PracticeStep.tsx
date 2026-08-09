'use client'
import { useRef, useState, useEffect } from 'react'
import { useLessonStore } from '@/store/lessonStore'
import { createClient } from '@/lib/supabase'
import { useAI } from '@/hooks/useAI'
import AiButton from './AiButton'

const EXERCISE_TYPES = [
  { id: 'fill-in-blank', label: 'Fill in blank' },
  { id: 'roleplay', label: 'Roleplay' },
  { id: 'translation', label: 'Translation' },
  { id: 'multiple-choice', label: 'Multiple choice' },
  { id: 'open-conversation', label: 'Open conversation' },
  { id: 'listening', label: 'Listening' },
]

const LEVEL_COMPLEXITY: Record<string, string> = {
  'A1': 'Very simple. Short sentences only. Basic present tense. Max 3-4 words per blank. 3 exercises.',
  'A2': 'Simple. Short paragraphs. Present and past tense. 4-5 exercises.',
  'B1': 'Intermediate. Multi-sentence items. Mixed tenses. 5-6 exercises with some nuance.',
  'B2': 'Upper-intermediate. Complex sentences. Idioms and collocations welcome. 6 exercises.',
  'C1': 'Advanced. Sophisticated vocabulary. Nuanced meaning. 6 complex exercises with discussion elements.',
  'Conversation': 'Focus on natural spoken language. Open-ended. 6 fluid conversation-based exercises.',
}

interface Props {
  onNext: () => void
  onBack: () => void
}

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

  // Load existing data when editing
  useEffect(() => {
    if (!lessonId || lessonId === 'new') return
    fetch(`/api/lessons/${lessonId}`)
      .then(r => r.json())
      .then(d => {
        const l = d.lesson
        if (!l) return
        if (l.exercise) {
          setExerciseType(l.exercise.type || 'roleplay')
          setInstructions(l.exercise.instructions || '')
          setContent(l.exercise.content || '')
        }
        if (l.story) {
          setStory(l.story.content || '')
          setImagePrompt(l.story.imageUrl || '')
          setImageStyle(l.story.imageStyle || 'photorealistic')
          setDebateStory(l.story.debateStory || '')
          setDebateMoral(l.story.debateMoral || '')
          setDebatePersonal(l.story.debatePersonal || '')
        }
      })
      .catch(console.error)
  }, [lessonId])
  const [copied, setCopied] = useState(false)
  const tokenRef = useRef<string | null>(null)
  const supabase = createClient()

  async function getToken() {
    if (tokenRef.current) return tokenRef.current
    const { data: { session } } = await supabase.auth.getSession()
    tokenRef.current = session?.access_token || null
    return tokenRef.current
  }

  const generateExerciseAI = useAI('/api/ai/generate-exercise', {
    onSuccess: (data) => {
      if (data.instructions) setInstructions(data.instructions)
      if (data.content) setContent(data.content)
    }
  })

  const generateStoryAI = useAI('/api/ai/generate-story', {
    onSuccess: (data) => {
      if (data.story) setStory(data.story)
      if (data.imagePrompt) setImagePrompt(data.imagePrompt)
    }
  })

  const generateDebateAI = useAI('/api/ai/generate-debate', {
    onSuccess: (data) => {
      if (data.debateStory) setDebateStory(data.debateStory)
      if (data.debateMoral) setDebateMoral(data.debateMoral)
      if (data.debatePersonal) setDebatePersonal(data.debatePersonal)
    }
  })

  async function handleGenerateExercise() {
    const token = await getToken()
    if (!token) return
    await generateExerciseAI.call({
      exerciseType, vocab,
      level: setup.level,
      language: setup.language,
      title: setup.title,
      goal: setup.goal,
      complexity: LEVEL_COMPLEXITY[setup.level] || LEVEL_COMPLEXITY['A2']
    }, token)
  }

  async function handleGenerateStory() {
    const token = await getToken()
    if (!token) return
    await generateStoryAI.call({
      title: setup.title,
      level: setup.level,
      language: setup.language,
      goal: setup.goal,
      vocab,
      complexity: LEVEL_COMPLEXITY[setup.level] || LEVEL_COMPLEXITY['A2'],
      imageStyle,
    }, token)
  }

  async function handleGenerateDebate() {
    const token = await getToken()
    if (!token) return
    if (!story) return
    await generateDebateAI.call({
      story, title: setup.title,
      level: setup.level, goal: setup.goal,
      complexity: LEVEL_COMPLEXITY[setup.level] || LEVEL_COMPLEXITY['A2']
    }, token)
  }

  function copyImagePrompt() {
    navigator.clipboard.writeText(imagePrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSaveAndNext() {
    if (!lessonId) return
    setSaving(true)
    try {
      const token = await getToken()
      await fetch(`/api/lessons/${lessonId}/practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ exerciseType, instructions, content, story, imagePrompt, imageStyle, debateStory, debateMoral, debatePersonal })
      })
      setSaved(true)
      setTimeout(() => onNext(), 800)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const sLabel = (text: string, color = 'rgba(255,255,255,0.3)') => (
    <p style={{ fontSize: '12px', fontWeight: 600, color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>{text}</p>
  )

  const tArea = (value: string, onChange: (v: string) => void, placeholder: string, rows = 4) => (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: '100%', padding: '12px 14px', background: '#fff', border: '1px solid rgba(91,60,224,0.1)', borderRadius: '12px', color: '#1A1219', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit' }} />
  )

  const levelBadge = (
    <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(91,60,224,0.1)', border: '1px solid rgba(91,60,224,0.2)', fontSize: '11px', color: '#7B5CFF', fontWeight: 600 }}>
      {setup.level} level
    </span>
  )

  return (
    <div style={{ maxWidth: '680px', width: '100%' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(91,60,224,0.1)', border: '1px solid rgba(91,60,224,0.25)', borderRadius: '100px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#7B5CFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          ✦ Make them practice
        </div>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: '#1A1219', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '12px' }}>
          Learning that <span style={{ color: '#7B5CFF', fontStyle: 'italic' }}>actually sticks</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '15px', color: '#6B6575', lineHeight: '1.6' }}>
            Everything below is calibrated to
          </p>
          {levelBadge}
        </div>
      </div>

      {/* Exercise type */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          {sLabel('Exercise type')}
          <span style={{ fontSize: '11px', color: '#B0A8C0' }}>Choose one main activity</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {EXERCISE_TYPES.map(t => (
            <button key={t.id} onClick={() => setExerciseType(t.id)} style={{ padding: '11px 14px', borderRadius: '10px', border: `1px solid ${exerciseType === t.id ? 'rgba(91,60,224,0.5)' : 'rgba(255,255,255,0.08)'}`, background: exerciseType === t.id ? 'rgba(91,60,224,0.15)' : 'rgba(255,255,255,0.03)', color: exerciseType === t.id ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: exerciseType === t.id ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', textAlign: 'center' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <AiButton label="AI generate exercise" loadingLabel="Generating..." loading={generateExerciseAI.loading} onClick={handleGenerateExercise} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>{sLabel('Exercise instructions')}{tArea(instructions, setInstructions, 'Describe what students should do...', 3)}</div>
          <div>{sLabel('Exercise content')}{tArea(content, setContent, 'The exercise content, questions, or scenario...', 6)}</div>
        </div>
        {generateExerciseAI.error && <p style={{ fontSize: '12px', color: '#7B5CFF', marginTop: '8px' }}>⚠ {generateExerciseAI.error}</p>}
      </div>

      <div style={{ height: 1, background: '#ffffff', margin: '32px 0' }} />

      {/* Story section */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          {sLabel('Context story')}
          <AiButton label="AI generate story" loadingLabel="Writing story..." loading={generateStoryAI.loading} onClick={handleGenerateStory} variant="secondary" />
        </div>
        <p style={{ fontSize: '12px', color: '#9090A0', marginBottom: '12px', lineHeight: 1.6 }}>
          A short story using the vocabulary in a real-life situation at {setup.level} level.
        </p>

        {/* Image style picker */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', color: '#B0A8C0', marginBottom: '8px' }}>Story image style</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['photorealistic', 'illustration', 'comic', 'watercolor', 'cinematic'].map(style => (
              <button key={style} onClick={() => setImageStyle(style)} style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${imageStyle === style ? 'rgba(91,60,224,0.4)' : 'rgba(255,255,255,0.08)'}`, background: imageStyle === style ? 'rgba(91,60,224,0.1)' : 'transparent', color: imageStyle === style ? '#7B5CFF' : 'rgba(255,255,255,0.35)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {style}
              </button>
            ))}
          </div>
        </div>

        {tArea(story, setStory, 'The AI will write a story using your vocabulary and lesson goal...', 5)}

        {/* Image prompt */}
        {imagePrompt && (
          <div style={{ marginTop: '12px', background: 'rgba(91,60,224,0.07)', border: '1px solid rgba(91,60,224,0.2)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#7B5CFF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>✦ Story image prompt</p>
              <button onClick={copyImagePrompt} style={{ padding: '4px 12px', borderRadius: '6px', background: copied ? 'rgba(91,60,224,0.2)' : 'rgba(91,60,224,0.1)', border: '1px solid rgba(91,60,224,0.25)', color: '#7B5CFF', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {copied ? '✓ Copied!' : 'Copy prompt'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#6B6575', lineHeight: 1.6, marginBottom: '8px' }}>{imagePrompt}</p>
            <p style={{ fontSize: '11px', color: '#B0A8C0', lineHeight: 1.5 }}>
              Use this prompt in Midjourney, DALL-E, or any image generator to create a visual for your lesson.
            </p>
          </div>
        )}
        {generateStoryAI.error && <p style={{ fontSize: '12px', color: '#7B5CFF', marginTop: '8px' }}>⚠ {generateStoryAI.error}</p>}
      </div>

      <div style={{ height: 1, background: '#ffffff', margin: '32px 0' }} />

      {/* Debate section */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          {sLabel('Story questions for students', '#7B5CFF')}
          <AiButton label="AI generate story questions" loadingLabel="Generating..." loading={generateDebateAI.loading} onClick={handleGenerateDebate} variant="secondary" disabled={!story} />
        </div>
        <p style={{ fontSize: '12px', color: '#9090A0', marginBottom: '16px', lineHeight: 1.6 }}>
          {!story ? '⚠ Generate or write a story first — questions will be based on it.' : `Questions calibrated to ${setup.level} level — 2 per category.`}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(91,60,224,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>About the story</p>
            {tArea(debateStory, setDebateStory, 'What happened in the story? (comprehension questions)', 3)}
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,188,0,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>About the moral</p>
            {tArea(debateMoral, setDebateMoral, 'What can we learn from this story? (reflection questions)', 3)}
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(91,60,224,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Personal opinions</p>
            {tArea(debatePersonal, setDebatePersonal, 'Has something like this happened to you? (personal connection)', 3)}
          </div>
        </div>
        {generateDebateAI.error && <p style={{ fontSize: '12px', color: '#7B5CFF', marginTop: '8px' }}>⚠ {generateDebateAI.error}</p>}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ padding: '13px 24px', background: 'transparent', border: '1px solid rgba(91,60,224,0.12)', borderRadius: '12px', color: '#6B6575', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Back
        </button>
        <button onClick={handleSaveAndNext} disabled={saving || saved}
          style={{ padding: '13px 32px', background: saved ? '#7B5CFF' : '#7B5CFF', border: 'none', borderRadius: '12px', color: '#1A1219', fontSize: '15px', fontWeight: 600, cursor: saving || saved ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.3s', boxShadow: saved ? '0 4px 20px rgba(91,60,224,0.4)' : '0 4px 20px rgba(91,60,224,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {saving && <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />}
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save & continue →'}
        </button>
      </div>
    </div>
  )
}
