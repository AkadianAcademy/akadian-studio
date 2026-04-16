'use client'
import { useCanvasStore } from '@/store/canvasStore'
import { useLessonStore } from '@/store/lessonStore'

const STICKY_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb923c']

interface Props {
  onSave: () => void
  saving: boolean
  lastSaved: string
  onAddSticky: (color: string) => void
  mode: 'teacher' | 'student'
}

export default function CanvasToolbar({ onSave, saving, lastSaved, onAddSticky, mode }: Props) {
  const { tool, setTool, zoom, setZoom } = useCanvasStore()

  if (mode === 'student') return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', marginBottom: '16px',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00bc7c' }} />
      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Student view — read only</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} style={btnStyle}>−</button>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', padding: '0 4px', lineHeight: '28px' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} style={btnStyle}>+</button>
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', marginBottom: '16px',
    }}>
      {/* Tools */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px' }}>
        {[
          { id: 'select', icon: '↖', label: 'Select' },
          { id: 'pointer', icon: '👆', label: 'Pointer' },
        ].map(t => (
          <button key={t.id} onClick={() => setTool(t.id as any)} title={t.label}
            style={{ ...btnStyle, background: tool === t.id ? '#ff4b55' : 'transparent', color: tool === t.id ? '#fff' : 'rgba(255,255,255,0.5)' }}>
            {t.icon}
          </button>
        ))}
      </div>

      {/* Add sticky */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginRight: '4px' }}>Add sticky:</span>
        {STICKY_COLORS.map(color => (
          <button key={color} onClick={() => onAddSticky(color)}
            style={{ width: 20, height: 20, borderRadius: '4px', background: color, border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ))}
      </div>

      {/* Zoom */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: 'auto' }}>
        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} style={btnStyle}>−</button>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', minWidth: '40px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} style={btnStyle}>+</button>
        <button onClick={() => setZoom(1)} style={{ ...btnStyle, fontSize: '10px' }}>Reset</button>
      </div>

      {/* Save status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={onSave} disabled={saving}
          style={{ padding: '6px 14px', background: saving ? 'rgba(255,255,255,0.05)' : 'rgba(0,188,124,0.15)', border: '1px solid rgba(0,188,124,0.3)', borderRadius: '8px', color: '#00bc7c', fontSize: '12px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          {saving ? 'Saving...' : '↑ Save canvas'}
        </button>
        {lastSaved && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Saved {lastSaved}</span>}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: '6px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.6)',
  cursor: 'pointer', fontSize: '14px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'inherit', transition: 'all 0.15s',
}
