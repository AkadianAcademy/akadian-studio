'use client'
import { useLessonStore } from '@/store/lessonStore'
import { useRouter } from 'next/navigation'

export default function PreviewStep() {
  const { setup, vocab, sentences, slug, lessonId } = useLessonStore()
  const router = useRouter()

  const sections = [
    { num: '1', label: 'Vocabulary', desc: 'Words & sentences', done: vocab.length > 0 },
    { num: '2', label: 'Story', desc: 'Context reading', done: false },
    { num: '3', label: 'Exercise', desc: 'Practice activity', done: false },
    { num: '4', label: 'Debate', desc: 'Discussion topic', done: false },
    { num: '5', label: 'Canvas', desc: 'Teacher notes', done: false },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');
        @keyframes previewIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .preview-wrap { max-width: 640px; width: 100%; font-family: 'Hanken Grotesk', sans-serif; animation: previewIn 0.4s cubic-bezier(.16,1,.3,1); }
      `}</style>

      <div className="preview-wrap">
        {/* Hero */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(200,255,61,0.1)', border: '1px solid rgba(200,255,61,0.25)', fontSize: '11px', fontWeight: 700, color: '#3A7D00', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
            ✓ Lesson complete
          </div>
          <h1 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 'clamp(26px,4vw,36px)', color: '#1A1219', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Your lesson is <em style={{ color: '#7B5CFF', fontStyle: 'italic' }}>ready.</em>
          </h1>
          <p style={{ fontSize: '15px', color: '#6B6575', lineHeight: 1.7 }}>Here's everything you've built. Share the public link with your students.</p>
        </div>

        {/* Lesson summary card */}
        <div style={{ background: '#fff', border: '1px solid rgba(91,60,224,0.1)', borderRadius: '20px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 24px rgba(91,60,224,0.08)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {[setup.language, setup.level, setup.unit].filter(Boolean).map(tag => (
              <span key={tag} style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(91,60,224,0.06)', border: '1px solid rgba(91,60,224,0.12)', fontSize: '11px', fontWeight: 600, color: '#7B5CFF' }}>{tag}</span>
            ))}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1219', marginBottom: '6px', lineHeight: 1.3 }}>{setup.title || 'Untitled Lesson'}</h2>
          <p style={{ fontSize: '14px', color: '#6B6575', lineHeight: 1.6, marginBottom: '18px' }}>{setup.goal}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '18px' }}>
            {[
              { num: vocab.length.toString(), label: 'Vocabulary words' },
              { num: sentences.length.toString(), label: 'Example sentences' },
              { num: '5', label: 'Sections built' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(91,60,224,0.04)', border: '1px solid rgba(91,60,224,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#7B5CFF', marginBottom: '3px' }}>{s.num}</div>
                <div style={{ fontSize: '11px', color: '#9090A0' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {vocab.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9090A0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Vocabulary</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {vocab.slice(0, 8).map((v, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(91,60,224,0.06)', fontSize: '12px', color: '#4A4460', border: '1px solid rgba(91,60,224,0.1)' }}>
                    {v.word} <span style={{ color: '#A98BFF' }}>—</span> {v.translation}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Public link */}
        {slug && (
          <div style={{ background: 'linear-gradient(135deg, #0D1117 0%, #1A1233 100%)', border: '1px solid rgba(123,92,255,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Future public link</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontFamily: 'Courier New, monospace' }}>
              <span style={{ color: '#A98BFF' }}>akadianacademy.com</span>/library/{slug}
            </div>
            <a href={`/lesson/${slug}`} target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'rgba(123,92,255,0.15)', border: '1px solid rgba(123,92,255,0.3)', borderRadius: '999px', color: '#A98BFF', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              👁 Open public page ↗
            </a>
          </div>
        )}

        {/* Lesson flow */}
        <div style={{ background: '#fff', border: '1px solid rgba(91,60,224,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(91,60,224,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9090A0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>Lesson flow</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { num: '1', label: 'Setup', desc: 'Lesson details', done: true },
              { num: '2', label: 'Vocabulary', desc: 'Words & sentences', done: vocab.length > 0 },
              { num: '3', label: 'Practice', desc: 'Exercises & story', done: false },
              { num: '4', label: 'Debate', desc: 'Debate & discussion', done: false },
              { num: '5', label: 'Preview', desc: 'Review & publish', done: true },
            ].map((s, i, arr) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: i < arr.length - 1 ? '10px' : '0', marginBottom: i < arr.length - 1 ? '10px' : '0', borderBottom: i < arr.length - 1 ? '1px solid rgba(91,60,224,0.06)' : 'none' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0, background: s.done ? 'rgba(91,60,224,0.1)' : 'rgba(0,0,0,0.04)', color: s.done ? '#7B5CFF' : '#B0A8C0', border: s.done ? '1px solid rgba(91,60,224,0.2)' : '1px solid rgba(0,0,0,0.07)' }}>
                  {s.done ? '✓' : s.num}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1219' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: '#9090A0' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%)', border: 'none', borderRadius: '999px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 24px rgba(91,60,224,0.35)', minHeight: '52px' }}>
            Go to dashboard →
          </button>
          <button onClick={() => window.location.reload()}
            style={{ padding: '14px 24px', background: 'rgba(91,60,224,0.06)', border: '1.5px solid rgba(91,60,224,0.15)', borderRadius: '999px', color: '#7B5CFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', minHeight: '52px' }}>
            + Build another
          </button>
        </div>
      </div>
    </>
  )
}
