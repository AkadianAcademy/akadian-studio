'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Props {
  lesson: any
  onSaved: (updated: any) => void
}

export default function EditPanel({ lesson, onSaved }: Props) {
  const [section, setSection] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  // Setup fields
  const [title, setTitle] = useState(lesson.title || '')
  const [goal, setGoal] = useState(lesson.goal || '')
  const [level, setLevel] = useState(lesson.level || 'A2')
  const [unit, setUnit] = useState(lesson.unit || '')

  // Vocab
  const [vocab, setVocab] = useState<any[]>(lesson.vocab || [])
  const [newWord, setNewWord] = useState('')
  const [newTranslation, setNewTranslation] = useState('')

  // Story
  const [story, setStory] = useState(lesson.story?.content || '')
  const [imagePrompt, setImagePrompt] = useState(lesson.story?.imageUrl || '')

  // Exercise
  const [exerciseType, setExerciseType] = useState(lesson.exercise?.type || '')
  const [exerciseInstructions, setExerciseInstructions] = useState(lesson.exercise?.instructions || '')
  const [exerciseContent, setExerciseContent] = useState(lesson.exercise?.content || '')

  // Story questions
  const [debateStory, setDebateStory] = useState(lesson.story?.debateStory || '')
  const [debateMoral, setDebateMoral] = useState(lesson.story?.debateMoral || '')
  const [debatePersonal, setDebatePersonal] = useState(lesson.story?.debatePersonal || '')

  // Debate
  const [debateTopic, setDebateTopic] = useState(lesson.debate?.topic || '')
  const [debateArticle, setDebateArticle] = useState(lesson.debate?.article || '')
  const [debateQuestions, setDebateQuestions] = useState(lesson.debate?.questions || '')

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  async function save(sectionName: string, body: any, apiPath: string, method = 'POST') {
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/lessons/${lesson.id}/${apiPath}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setSaved(true)
      setTimeout(() => { setSaved(false); setSection(null) }, 1000)
      // Refresh lesson data
      const lessonRes = await fetch(`/api/lessons/${lesson.slug}`)
      const lessonData = await lessonRes.json()
      if (lessonData.lesson) onSaved(lessonData.lesson)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function saveSetup() {
    const token = await getToken()
    setSaving(true)
    try {
      await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ lessonId: lesson.id, title, goal, level, unit, subject: lesson.subject, language: lesson.language })
      })
      setSaved(true)
      setTimeout(() => { setSaved(false); setSection(null) }, 1000)
      const lessonRes = await fetch(`/api/lessons/${lesson.slug}`)
      const lessonData = await lessonRes.json()
      if (lessonData.lesson) onSaved(lessonData.lesson)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function saveVocab() {
    await save('vocab', { vocab, sentences: lesson.sentences || [] }, 'vocab')
  }

  async function addVocabWord() {
    if (!newWord.trim()) return
    setVocab(v => [...v, { id: Date.now().toString(), word: newWord, translation: newTranslation }])
    setNewWord(''); setNewTranslation('')
  }

  async function saveStory() {
    await save('story', {
      exerciseType: lesson.exercise?.type || 'roleplay',
      instructions: lesson.exercise?.instructions || '',
      content: lesson.exercise?.content || '',
      story: story,
      imagePrompt: imagePrompt,
      imageStyle: lesson.story?.imageStyle || 'photorealistic',
      debateStory: debateStory,
      debateMoral: debateMoral,
      debatePersonal: debatePersonal,
    }, 'practice')
  }

  async function saveExercise() {
    await save('exercise', {
      exerciseType,
      instructions: exerciseInstructions,
      content: exerciseContent,
      story: lesson.story?.content || '',
      imagePrompt: lesson.story?.imageUrl || '',
      imageStyle: lesson.story?.imageStyle || 'photorealistic',
      debateStory: debateStory,
      debateMoral: debateMoral,
      debatePersonal: debatePersonal,
    }, 'practice')
  }

  async function saveDebate() {
    await save('debate', {
      topic: debateTopic, article: debateArticle,
      keyTerms: lesson.debate?.keyTerms || [],
      questions: debateQuestions
    }, 'debate')
  }

  const btnStyle = (color = '#7B5CFF'): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    background: color, color: '#FFFFFF', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: '#FFFFFF',
    border: '1px solid rgba(91,60,224,0.20)',
    borderRadius: '8px', color: '#1A1219', fontSize: '14px',
    outline: 'none', fontFamily: 'inherit'
  }

  const taStyle: React.CSSProperties = {
    ...inputStyle, resize: 'vertical', lineHeight: 1.6
  }

  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'Conversation']

  const panels: Record<string, React.ReactNode> = {
    setup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Goal</label>
          <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={3} style={taStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Unit</label>
          <input value={unit} onChange={e => setUnit(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Level</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${level === l ? '#7B5CFF' : 'rgba(26,18,25,0.12)'}`, background: level === l ? 'rgba(123,92,255,0.15)' : 'transparent', color: level === l ? '#1A1219' : '#9090A0', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <button onClick={saveSetup} disabled={saving} style={btnStyle(saving ? '#555' : '#7B5CFF')}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    ),

    vocab: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {vocab.map((v, i) => (
          <div key={v.id || i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input value={v.word} onChange={e => setVocab(vv => vv.map((x, j) => j === i ? { ...x, word: e.target.value } : x))}
              placeholder="Word" style={{ ...inputStyle, flex: 1 }} />
            <input value={v.translation} onChange={e => setVocab(vv => vv.map((x, j) => j === i ? { ...x, translation: e.target.value } : x))}
              placeholder="Translation" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => setVocab(vv => vv.filter((_, j) => j !== i))}
              style={{ padding: '8px 10px', background: 'rgba(225,29,72,0.10)', border: '1px solid rgba(225,29,72,0.22)', borderRadius: '8px', color: '#E11D48', cursor: 'pointer', fontFamily: 'inherit' }}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(26,18,25,0.07)' }}>
          <input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="New word" style={{ ...inputStyle, flex: 1 }} />
          <input value={newTranslation} onChange={e => setNewTranslation(e.target.value)} placeholder="Translation" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={addVocabWord} style={{ padding: '8px 14px', background: 'rgba(14,159,110,0.10)', border: '1px solid rgba(14,159,110,0.22)', borderRadius: '8px', color: '#0E9F6E', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>+ Add</button>
        </div>
        <button onClick={saveVocab} disabled={saving} style={btnStyle(saving ? '#555' : '#7B5CFF')}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save vocabulary'}
        </button>
      </div>
    ),

    storyquestions: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>What happened in the story</label>
          <textarea value={debateStory} onChange={e => setDebateStory(e.target.value)} rows={4} style={taStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>What we can learn from it</label>
          <textarea value={debateMoral} onChange={e => setDebateMoral(e.target.value)} rows={4} style={taStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Personal connection</label>
          <textarea value={debatePersonal} onChange={e => setDebatePersonal(e.target.value)} rows={4} style={taStyle} />
        </div>
        <button onClick={saveStory} disabled={saving} style={btnStyle(saving ? '#555' : '#7B5CFF')}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save story questions'}
        </button>
      </div>
    ),

    story: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Story content</label>
          <textarea value={story} onChange={e => setStory(e.target.value)} rows={8} style={taStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Image prompt</label>
          <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} rows={2} style={taStyle} />
        </div>
        <button onClick={saveStory} disabled={saving} style={btnStyle(saving ? '#555' : '#7B5CFF')}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save story'}
        </button>
      </div>
    ),

    exercise: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Exercise type</label>
          <input value={exerciseType} onChange={e => setExerciseType(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Instructions</label>
          <textarea value={exerciseInstructions} onChange={e => setExerciseInstructions(e.target.value)} rows={2} style={taStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Content</label>
          <textarea value={exerciseContent} onChange={e => setExerciseContent(e.target.value)} rows={8} style={taStyle} />
        </div>
        <button onClick={saveExercise} disabled={saving} style={btnStyle(saving ? '#555' : '#7B5CFF')}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save exercise'}
        </button>
      </div>
    ),

    debate: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Debate topic</label>
          <textarea value={debateTopic} onChange={e => setDebateTopic(e.target.value)} rows={2} style={taStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Article</label>
          <textarea value={debateArticle} onChange={e => setDebateArticle(e.target.value)} rows={10} style={taStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#9090A0', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Questions</label>
          <textarea value={debateQuestions} onChange={e => setDebateQuestions(e.target.value)} rows={6} style={taStyle} />
        </div>
        <button onClick={saveDebate} disabled={saving} style={btnStyle(saving ? '#555' : '#7B5CFF')}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save debate'}
        </button>
      </div>
    ),
  }

  const editBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '5px 12px', borderRadius: '8px',
    background: 'rgba(123,92,255,0.1)', border: '1px solid rgba(123,92,255,0.25)',
    color: '#7B5CFF', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Edit buttons bar */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>

        {/* Floating edit menu */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(91,60,224,0.14)', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 8px 32px rgba(26,18,25,0.16)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#9090A0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px', paddingLeft: '4px' }}>Edit section</p>
          {[
            { id: 'setup', label: '⚙ Setup' },
            { id: 'vocab', label: '📚 Vocabulary' },
            { id: 'story', label: '📖 Story' },
            { id: 'storyquestions', label: '💬 Story Questions' },
            { id: 'exercise', label: '✍️ Exercise' },
            { id: 'debate', label: '🗣 Debate' },
          ].map(s => (
            <button key={s.id} onClick={() => setSection(section === s.id ? null : s.id)}
              style={{ ...editBtnStyle, background: section === s.id ? 'rgba(123,92,255,0.25)' : 'rgba(123,92,255,0.08)', justifyContent: 'flex-start', width: '160px' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Edit panel slide-in */}
      {section && (
        <>
          <div onClick={() => setSection(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,25,0.45)', zIndex: 300, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(500px, 95vw)', background: '#FAFAF8', borderLeft: '1px solid rgba(26,18,25,0.12)', zIndex: 400, overflowY: 'auto', padding: '28px', boxShadow: '-8px 0 40px rgba(26,18,25,0.16)', animation: 'slideDown 0.25s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1219' }}>
                Edit {section.charAt(0).toUpperCase() + section.slice(1)}
              </h3>
              <button onClick={() => setSection(null)} style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(26,18,25,0.07)', border: '1px solid rgba(26,18,25,0.12)', color: '#6B6575', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>×</button>
            </div>
            {panels[section]}
          </div>
        </>
      )}
    </div>
  )
}
