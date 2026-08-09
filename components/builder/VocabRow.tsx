'use client'

interface Props {
  word: string
  translation: string
  onWordChange: (val: string) => void
  onTranslationChange: (val: string) => void
  onDelete: () => void
  index: number
}

export default function VocabRow({ word, translation, onWordChange, onTranslationChange, onDelete, index }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '4px 0',
      animation: 'rowIn 0.3s ease both',
      animationDelay: `${index * 0.04}s`,
    }}>
      <style>{`@keyframes rowIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <input
        type="text"
        placeholder="Word"
        value={word}
        onChange={e => onWordChange(e.target.value)}
        style={{
          flex: 1, padding: '11px 14px',
          background: '#ffffff',
          border: '1px solid rgba(91,60,224,0.1)',
          borderRadius: '10px', color: '#1A1219',
          fontSize: '14px', outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s',
        }}
      />
      <div style={{ color: '#B0A8C0', fontSize: '16px', flexShrink: 0 }}>→</div>
      <input
        type="text"
        placeholder="Translation"
        value={translation}
        onChange={e => onTranslationChange(e.target.value)}
        style={{
          flex: 1, padding: '11px 14px',
          background: '#ffffff',
          border: '1px solid rgba(91,60,224,0.1)',
          borderRadius: '10px', color: '#1A1219',
          fontSize: '14px', outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s',
        }}
      />
      <button
        onClick={onDelete}
        style={{
          width: 32, height: 32, borderRadius: '8px',
          background: 'rgba(91,60,224,0.06)',
          border: '1px solid rgba(91,60,224,0.1)',
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
