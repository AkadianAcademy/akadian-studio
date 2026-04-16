'use client'
import { useRef, useState, useEffect } from 'react'
import { useCanvasStore, StickyNote as StickyNoteType } from '@/store/canvasStore'

interface Props {
  sticky: StickyNoteType
  zoom: number
  mode: 'teacher' | 'student'
}

export default function StickyNote({ sticky, zoom, mode }: Props) {
  const { updateSticky, deleteSticky, selectedId, setSelectedId } = useCanvasStore()
  const [dragging, setDragging] = useState(false)
  const [editing, setEditing] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, sx: 0, sy: 0 })
  const isSelected = selectedId === sticky.id

  function onMouseDown(e: React.MouseEvent) {
    if (mode === 'student') return
    if (editing) return
    e.stopPropagation()
    setSelectedId(sticky.id)
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, sx: sticky.x, sy: sticky.y }
  }

  useEffect(() => {
    if (!dragging) return
    function onMove(e: MouseEvent) {
      const dx = (e.clientX - dragStart.current.mx) / zoom
      const dy = (e.clientY - dragStart.current.my) / zoom
      updateSticky(sticky.id, {
        x: Math.max(0, dragStart.current.sx + dx),
        y: Math.max(0, dragStart.current.sy + dy),
      })
    }
    function onUp() { setDragging(false) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, zoom])

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={() => { if (mode === 'teacher') setEditing(true) }}
      style={{
        position: 'absolute',
        left: sticky.x * zoom,
        top: sticky.y * zoom,
        width: 140,
        background: sticky.color,
        borderRadius: '8px',
        padding: '10px 12px',
        cursor: mode === 'teacher' ? (dragging ? 'grabbing' : 'grab') : 'default',
        boxShadow: isSelected
          ? '0 0 0 2px #fff, 0 8px 24px rgba(0,0,0,0.4)'
          : '0 4px 16px rgba(0,0,0,0.3)',
        userSelect: 'none',
        transition: dragging ? 'none' : 'box-shadow 0.2s',
        zIndex: isSelected ? 100 : 1,
        animation: 'stickyIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      <style>{`@keyframes stickyIn { from { opacity:0; transform:scale(0.8) rotate(-2deg); } to { opacity:1; transform:scale(1) rotate(0); } }`}</style>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            autoFocus
            value={sticky.word}
            onChange={e => updateSticky(sticky.id, { word: e.target.value })}
            onBlur={() => setEditing(false)}
            style={{ background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '13px', fontWeight: 700, color: '#1a1a1a', outline: 'none', width: '100%', fontFamily: 'inherit' }}
          />
          <input
            value={sticky.translation}
            onChange={e => updateSticky(sticky.id, { translation: e.target.value })}
            style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#1a1a1a', outline: 'none', width: '100%', fontFamily: 'inherit' }}
          />
        </div>
      ) : (
        <>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginBottom: '3px', lineHeight: 1.3 }}>
            {sticky.word || 'Word'}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', lineHeight: 1.4 }}>
            {sticky.translation || 'Translation'}
          </p>
        </>
      )}

      {/* Delete button — teacher only */}
      {mode === 'teacher' && isSelected && !editing && (
        <button
          onClick={e => { e.stopPropagation(); deleteSticky(sticky.id) }}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 20, height: 20, borderRadius: '50%',
            background: '#ff4b55', border: '2px solid #fff',
            color: '#fff', fontSize: '10px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, fontFamily: 'inherit',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
