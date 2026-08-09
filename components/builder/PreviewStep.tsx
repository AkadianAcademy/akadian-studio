'use client'
import { useLessonStore } from '@/store/lessonStore'
import { useRouter } from 'next/navigation'

export default function PreviewStep() {
  const { setup, vocab, sentences, lessonId, slug, reset } = useLessonStore()
  const router = useRouter()

  const previewUrl = slug
    ? 'akadianacademy.com/library/' + slug
    : 'akadianacademy.com/library/...'

  function handleGoToDashboard() {
    router.push('/dashboard')
  }

  function handleNewLesson() {
    reset()
    router.push('/builder/new')
  }

  return (
    <div style={{ maxWidth: '680px', width: '100%' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .preview-section { opacity:0; animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '36px' }} className="preview-section" >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(91,60,224,0.1)', border: '1px solid rgba(91,60,224,0.25)', borderRadius: '100px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#A98BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          ✓ Lesson complete
        </div>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '12px' }}>
          Your lesson is <span style={{ color: '#A98BFF', fontStyle: 'italic' }}>ready.</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
          Here's everything you've built. The public lesson page is coming in Part 6.
        </p>
      </div>

      {/* Lesson summary card */}
      <div className="preview-section" style={{ animationDelay: '0.1s', background: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(91,60,224,0.1)', border: '1px solid rgba(91,60,224,0.2)', fontSize: '11px', color: '#A98BFF', fontWeight: 600 }}>{setup.language}</span>
            <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(91,60,224,0.1)', border: '1px solid rgba(91,60,224,0.2)', fontSize: '11px', color: '#A98BFF', fontWeight: 600 }}>{setup.level}</span>
            {setup.unit && <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{setup.unit}</span>}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '6px' }}>{setup.title}</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{setup.goal}</p>
        </div>

        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            { label: 'Vocabulary words', value: vocab.length, color: '#A98BFF' },
            { label: 'Example sentences', value: sentences.length, color: '#A98BFF' },
            { label: 'Sections built', value: 4, color: '#A98BFF' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vocab preview */}
      {vocab.length > 0 && (
        <div className="preview-section" style={{ animationDelay: '0.2s', background: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 20px', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Vocabulary</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {vocab.map(v => (
              <span key={v.id} style={{ padding: '4px 12px', borderRadius: '8px', background: '#fff', fontSize: '13px', color: '#fff' }}>
                <span style={{ fontWeight: 600 }}>{v.word}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}> — {v.translation}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preview link */}
      <div className="preview-section" style={{ animationDelay: '0.3s', background: 'rgba(91,60,224,0.07)', border: '1px solid rgba(91,60,224,0.2)', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#A98BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Future public link</p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: '4px' }}>Once Part 6 is built, your lesson will be live at:</p>
        <p style={{ fontSize: '13px', color: '#A98BFF', fontWeight: 500 }}>{previewUrl}</p>
        {slug && (
          <a href={'/lesson/' + slug} target="_blank"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', padding: '8px 16px', background: 'rgba(91,60,224,0.1)', border: '1px solid rgba(91,60,224,0.25)', borderRadius: '10px', color: '#A98BFF', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            👁 Open public page ↗
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="preview-section" style={{ animationDelay: '0.4s', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={handleGoToDashboard}
          style={{ padding: '13px 28px', background: '#7B5CFF', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(91,60,224,0.3)', transition: 'all 0.2s' }}>
          Go to dashboard →
        </button>
        <button onClick={handleNewLesson}
          style={{ padding: '13px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          + Build another lesson
        </button>
      </div>
    </div>
  )
}
