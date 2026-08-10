'use client'
import { useMemo, useState } from 'react'

interface Props {
  type?: string
  content?: string
}

interface Option { text: string; correct: boolean }
interface Question { stem: string; options: Option[] }

const CORRECT_MARK = /[✓✔✅☑]|\(correct\)/i

// Parse a plain-text multiple-choice exercise into structured questions.
// Expected shape per question (blocks separated by a blank line):
//   1. Question stem?
//   a) option one
//   b) option two ✓
//   c) option three
function parseMCQ(content: string): Question[] | null {
  if (!content) return null
  const blocks = content.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)
  const optRe = /^\(?([A-Za-z])[).]\s*(.+)$/
  const questions: Question[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    const stemLines: string[] = []
    const options: Option[] = []
    for (const line of lines) {
      const m = line.match(optRe)
      if (m && m[2]) {
        const correct = CORRECT_MARK.test(line)
        const text = m[2].replace(CORRECT_MARK, '').trim()
        options.push({ text, correct })
      } else if (options.length === 0) {
        stemLines.push(line)
      }
    }
    if (options.length >= 2) {
      const stem = stemLines.join(' ').replace(/^\s*\d+[).]\s*/, '').trim()
      questions.push({ stem, options })
    }
  }

  if (questions.length < 1) return null
  const gradable = questions.some(q => q.options.some(o => o.correct))
  return gradable ? questions : null
}

export default function ExerciseRunner({ type, content }: Props) {
  const questions = useMemo(
    () => (type === 'multiple-choice' ? parseMCQ(content || '') : null),
    [type, content]
  )

  const [picked, setPicked] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)

  // Plain-text fallback (roleplay, translation, conversation, listening, or unparseable MCQ)
  if (!questions) {
    return (
      <div style={{ fontSize: '14px', color: '#4A4460', lineHeight: 2, whiteSpace: 'pre-line' }}>
        {content}
      </div>
    )
  }

  const answeredCount = Object.keys(picked).length
  const allAnswered = answeredCount === questions.length
  const show = checked || revealed
  const score = questions.reduce((acc, q, qi) => {
    const p = picked[qi]
    return acc + (p != null && q.options[p]?.correct ? 1 : 0)
  }, 0)

  function reset() { setPicked({}); setChecked(false); setRevealed(false) }

  return (
    <div>
      {show && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
          background: 'linear-gradient(135deg, #1E1533 0%, #0D1117 100%)', color: '#FFFFFF',
          borderRadius: '14px', padding: '14px 18px', marginBottom: '18px',
          boxShadow: '0 6px 20px rgba(91,60,224,0.18)',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>
            {checked
              ? <>You got <span style={{ color: '#C8FF3D' }}>{score} / {questions.length}</span></>
              : <>Answers revealed</>}
          </div>
          <button onClick={reset} style={{
            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: '#C8FF3D', color: '#0B0F1E', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
          }}>↻ Try again</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {questions.map((q, qi) => (
          <div key={qi} style={{
            background: '#FFFFFF', border: '1px solid rgba(91,60,224,0.1)', borderRadius: '14px',
            padding: '16px 18px', boxShadow: '0 1px 2px rgba(26,18,25,0.04), 0 6px 20px rgba(91,60,224,0.05)',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1219', lineHeight: 1.55, marginBottom: '12px' }}>
              <span style={{ color: '#7B5CFF', fontWeight: 700, marginRight: '6px' }}>{qi + 1}.</span>
              {q.stem}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {q.options.map((o, oi) => {
                const isPicked = picked[qi] === oi
                const isCorrect = o.correct
                let bg = '#FAFAF8', border = 'rgba(91,60,224,0.12)', col = '#4A4460', weight = 400
                if (!show && isPicked) { bg = 'rgba(123,92,255,0.1)'; border = '#7B5CFF'; col = '#1A1219'; weight = 600 }
                if (show && isCorrect) { bg = 'rgba(14,159,110,0.1)'; border = '#0E9F6E'; col = '#0E9F6E'; weight = 600 }
                if (show && isPicked && !isCorrect) { bg = 'rgba(225,29,72,0.08)'; border = '#E11D48'; col = '#E11D48'; weight = 600 }
                return (
                  <button
                    key={oi}
                    onClick={() => { if (!checked) setPicked(p => ({ ...p, [qi]: oi })) }}
                    disabled={checked}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', width: '100%',
                      padding: '10px 14px', borderRadius: '10px', cursor: checked ? 'default' : 'pointer',
                      background: bg, border: `1.5px solid ${border}`, color: col, fontWeight: weight,
                      fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                      border: `1.5px solid ${border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700,
                      background: (show && isCorrect) ? '#0E9F6E' : (show && isPicked && !isCorrect) ? '#E11D48' : (!show && isPicked) ? '#7B5CFF' : 'transparent',
                      color: ((show && (isCorrect || isPicked)) || (!show && isPicked)) ? '#fff' : '#9090A0',
                    }}>
                      {show && isCorrect ? '✓' : show && isPicked && !isCorrect ? '✕' : String.fromCharCode(97 + oi)}
                    </span>
                    <span>{o.text}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!checked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
          <button
            onClick={() => { setChecked(true); setRevealed(false) }}
            disabled={answeredCount === 0}
            style={{
              padding: '12px 28px', borderRadius: '12px', border: 'none',
              cursor: answeredCount === 0 ? 'not-allowed' : 'pointer',
              background: answeredCount === 0 ? 'rgba(123,92,255,0.35)' : 'linear-gradient(135deg, #7B5CFF 0%, #5B3CE0 100%)',
              color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
              boxShadow: answeredCount === 0 ? 'none' : '0 4px 16px rgba(91,60,224,0.3)',
            }}
          >
            Check answers
          </button>
          <span style={{ fontSize: '13px', color: '#9090A0' }}>{answeredCount} / {questions.length} answered</span>
          {!revealed && (
            <button onClick={() => setRevealed(true)} style={{
              marginLeft: 'auto', padding: '10px 18px', borderRadius: '12px',
              background: 'rgba(123,92,255,0.08)', border: '1px solid rgba(91,60,224,0.2)',
              color: '#5B3CE0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Show answers
            </button>
          )}
        </div>
      )}
    </div>
  )
}
