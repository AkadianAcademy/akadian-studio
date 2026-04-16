'use client'

interface Props {
  source: string
  translation: string
  onSourceChange: (val: string) => void
  onTranslationChange: (val: string) => void
  onDelete: () => void
  index: number
}

export default function ExampleSentenceRow({ source, translation, onSourceChange, onTranslationChange, onDelete, index }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '4px 0',
      animation: 'rowIn 0.3s ease both',
      animationDelay: `${index * 0.05}s`,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input
          type="text"
          placeholder="English sentence"
          value={source}
          onChange={e => onSourceChange(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', color: '#fff',
            fontSize: '13px', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <input
          type="text"
          placeholder="Translation"
          value={translation}
          onChange={e => onTranslationChange(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(0,188,124,0.15)',
            borderRadius: '10px', color: 'rgba(255,255,255,0.7)',
            fontSize: '13px', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <button
        onClick={onDelete}
        style={{
          width: 32, height: 32, borderRadius: '8px', marginTop: '4px',
          background: 'rgba(255,75,85,0.08)',
          border: '1px solid rgba(255,75,85,0.15)',
          color: 'rgba(255,75,85,0.6)',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.2s',
          fontSize: '16px', fontFamily: 'inherit',
        }}
      >
        ×
      </button>
    </div>
  )
}
