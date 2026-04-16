'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface TextBlock {
  id: string
  text: string
  x: number
  y: number
  bold: boolean
  underline: boolean
  color: string
  highlight: string
  fontSize: number
}

interface Props {
  lessonId: string
  mode: 'teacher' | 'student'
  vocab?: { word: string; translation: string }[]
}

const COLORS = ['#1a1a2e', '#ff4b55', '#00bc7c', '#3b82f6', '#f59e0b', '#8b5cf6']
const HIGHLIGHTS = ['transparent', '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff']
const FONT_SIZES = [14, 16, 18, 22, 28, 36]
const PEN_COLORS = ['#1a1a2e', '#ff4b55', '#00bc7c', '#3b82f6', '#f59e0b', '#8b5cf6']

export default function TeachingCanvas({ lessonId, mode, vocab = [] }: Props) {
  const [blocks, setBlocks] = useState<TextBlock[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [penMode, setPenMode] = useState(false)
  const [penColor, setPenColor] = useState('#ff4b55')
  const [penSize, setPenSize] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [bold, setBold] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [color, setColor] = useState('#1a1a2e')
  const [highlight, setHighlight] = useState('transparent')
  const [fontSize, setFontSize] = useState(16)

  const canvasRef = useRef<HTMLDivElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const autoSaveRef = useRef<NodeJS.Timeout>()
  const tokenRef = useRef<string | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const supabase = createClient()

  async function getToken() {
    if (tokenRef.current) return tokenRef.current
    const { data: { session } } = await supabase.auth.getSession()
    tokenRef.current = session?.access_token || null
    return tokenRef.current
  }

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/canvas`)
      .then(r => r.json())
      .then(d => {
        const data = d.canvas
        if (data?.blocks) setBlocks(data.blocks)
        else if (Array.isArray(data)) setBlocks(data)
        if (data?.drawing) restoreDrawing(data.drawing)
      })
      .catch(console.error)
      .finally(() => setLoaded(true))
  }, [lessonId])

  useEffect(() => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) { ctx.lineCap = 'round'; ctx.lineJoin = 'round' }
  }, [loaded])

  function restoreDrawing(dataUrl: string) {
    if (!dataUrl || !drawCanvasRef.current) return
    const canvas = drawCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0)
    img.src = dataUrl
  }

  useEffect(() => {
    if (!loaded || mode === 'student') return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      if (Date.now() - lastActivityRef.current >= 7000) saveCanvasSilent()
    }, 8000)
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [blocks, loaded])

  async function saveCanvasSilent() {
    if (mode === 'student') return
    try {
      const token = await getToken()
      const drawing = drawCanvasRef.current?.toDataURL() || ''
      await fetch(`/api/lessons/${lessonId}/canvas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` },
        body: JSON.stringify({ data: { blocks, drawing } })
      })
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    } catch (e) { console.error(e) }
  }

  async function saveCanvas() {
    setSaving(true)
    await saveCanvasSilent()
    setSaving(false)
  }

  function recordActivity() { lastActivityRef.current = Date.now() }

  function addBlock() {
    const nb: TextBlock = {
      id: Math.random().toString(36).slice(2),
      text: '', x: 40 + Math.random() * 200, y: 40 + Math.random() * 150,
      bold, underline, color, highlight, fontSize,
    }
    setBlocks(b => [...b, nb])
    setSelectedId(nb.id)
    setTimeout(() => setEditingId(nb.id), 50)
    recordActivity()
  }

  function updateBlock(id: string, updates: Partial<TextBlock>) {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, ...updates } : bl))
    recordActivity()
  }

  function deleteBlock(id: string) {
    setBlocks(b => b.filter(bl => bl.id !== id))
    setSelectedId(null); setEditingId(null); recordActivity()
  }

  function applyToSelected(updates: Partial<TextBlock>) {
    if (selectedId) updateBlock(selectedId, updates)
  }

  useEffect(() => {
    const block = blocks.find(b => b.id === selectedId)
    if (block) {
      setBold(block.bold); setUnderline(block.underline)
      setColor(block.color); setHighlight(block.highlight); setFontSize(block.fontSize)
    }
  }, [selectedId])

  useEffect(() => {
    if (!dragging) return
    function onMove(e: MouseEvent) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      updateBlock(dragging!.id, {
        x: Math.max(0, e.clientX - rect.left - dragging!.ox),
        y: Math.max(0, e.clientY - rect.top - dragging!.oy)
      })
    }
    function onUp() { setDragging(null) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = drawCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const src = 'touches' in e ? e.touches[0] : e
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!penMode || mode === 'student') return
    e.preventDefault(); setIsDrawing(true)
    const pos = getPos(e); lastPointRef.current = pos
    const ctx = drawCanvasRef.current?.getContext('2d')
    if (ctx) { ctx.beginPath(); ctx.arc(pos.x, pos.y, penSize / 2, 0, Math.PI * 2); ctx.fillStyle = penColor; ctx.fill() }
    recordActivity()
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || !penMode || mode === 'student') return
    e.preventDefault()
    const ctx = drawCanvasRef.current?.getContext('2d')
    if (!ctx || !lastPointRef.current) return
    const pos = getPos(e)
    ctx.beginPath(); ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = penColor; ctx.lineWidth = penSize; ctx.stroke()
    lastPointRef.current = pos
  }

  function endDraw() { setIsDrawing(false); lastPointRef.current = null }

  function clearDrawing() {
    const ctx = drawCanvasRef.current?.getContext('2d')
    const canvas = drawCanvasRef.current
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
    recordActivity()
  }

  function tBtn(active: boolean, activeBg = '#1a1a2e', activeColor = '#fff'): React.CSSProperties {
    return {
      padding: '5px 10px', borderRadius: '6px',
      background: active ? activeBg : '#fff',
      color: active ? activeColor : '#444',
      border: `1px solid ${active ? activeBg : '#ccc'}`,
      fontSize: '13px', fontWeight: active ? 600 : 400,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
    }
  }

  if (!loaded) return (
    <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,75,85,0.2)', borderTopColor: '#ff4b55', animation: 'spin 0.8s linear infinite' }} />
        Loading canvas...
      </div>
    </div>
  )

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '10px 14px', background: '#f8f7f4', border: '1px solid #e5e2db', borderRadius: '12px 12px 0 0', borderBottom: 'none' }}>
      {mode === 'teacher' ? (
        <>
          <div style={{ display: 'flex', gap: '3px', background: '#ece9e3', borderRadius: '8px', padding: '3px' }}>
            <button onClick={() => setPenMode(false)} style={{ ...tBtn(!penMode), minWidth: 70 }}>✏️ Text</button>
            <button onClick={() => setPenMode(true)} style={{ ...tBtn(penMode), minWidth: 70 }}>🖊 Draw</button>
          </div>
          <div style={{ width: 1, height: 24, background: '#ddd' }} />
          {!penMode ? (
            <>
              <button onClick={addBlock} style={tBtn(false, '#ff4b55', '#fff')}>+ Add text</button>
              <div style={{ width: 1, height: 24, background: '#ddd' }} />
              <button onClick={() => { const n = !bold; setBold(n); applyToSelected({ bold: n }) }} style={{ ...tBtn(bold), fontWeight: 700 }}>B</button>
              <button onClick={() => { const n = !underline; setUnderline(n); applyToSelected({ underline: n }) }} style={{ ...tBtn(underline), textDecoration: 'underline' }}>U</button>
              <div style={{ width: 1, height: 24, background: '#ddd' }} />
              <select value={fontSize} onChange={e => { const s = Number(e.target.value); setFontSize(s); applyToSelected({ fontSize: s }) }}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#333' }}>
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
              <div style={{ width: 1, height: 24, background: '#ddd' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '11px', color: '#888', marginRight: 2 }}>A:</span>
                {COLORS.map(c => (
                  <button key={c} onClick={() => { setColor(c); applyToSelected({ color: c }) }}
                    style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: color === c ? '2px solid #333' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '11px', color: '#888', marginRight: 2 }}>H:</span>
                {HIGHLIGHTS.map(h => (
                  <button key={h} onClick={() => { setHighlight(h); applyToSelected({ highlight: h }) }}
                    style={{ width: 18, height: 18, borderRadius: '3px', background: h === 'transparent' ? '#fff' : h, border: highlight === h ? '2px solid #333' : '1px solid #ccc', cursor: 'pointer', padding: 0, backgroundImage: h === 'transparent' ? 'linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)' : 'none', backgroundSize: h === 'transparent' ? '6px 6px' : 'auto', backgroundPosition: h === 'transparent' ? '0 0,3px 3px' : 'auto' }} />
                ))}
              </div>
              {selectedId && (
                <button onClick={() => deleteBlock(selectedId)}
                  style={{ padding: '4px 10px', borderRadius: '6px', background: '#fff0f0', border: '1px solid #ffcdd2', color: '#ff4b55', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🗑
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#888' }}>Color:</span>
                {PEN_COLORS.map(c => (
                  <button key={c} onClick={() => setPenColor(c)}
                    style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: penColor === c ? '2px solid #333' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#888' }}>Size:</span>
                {[2, 4, 7, 12].map(s => (
                  <button key={s} onClick={() => setPenSize(s)}
                    style={{ width: 28, height: 28, borderRadius: '6px', border: penSize === s ? '2px solid #333' : '1px solid #ccc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: s + 2, height: s + 2, borderRadius: '50%', background: penColor }} />
                  </button>
                ))}
              </div>
              <button onClick={clearDrawing}
                style={{ padding: '4px 10px', borderRadius: '6px', background: '#fff0f0', border: '1px solid #ffcdd2', color: '#ff4b55', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear drawing
              </button>
            </>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={saveCanvas} disabled={saving}
              style={{ padding: '6px 14px', borderRadius: '8px', background: saving ? '#e0e0e0' : '#00bc7c', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Saving...' : '↑ Save'}
            </button>
            {lastSaved && <span style={{ fontSize: '11px', color: '#aaa' }}>✓ {lastSaved}</span>}

          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00bc7c' }} />
            <span style={{ fontSize: '12px', color: '#888' }}>Student view — read only</span>
          </div>

        </div>
      )}
    </div>
  )

  const canvasArea = (
    <div
      ref={canvasRef}
      onClick={e => { if (e.target === canvasRef.current) { setSelectedId(null); setEditingId(null) } }}
      style={{
        position: 'relative',
        width: '100%',
        height: '520px',
        background: '#f9f8f5',
        border: '1px solid #e5e2db',
        borderRadius: '0 0 16px 16px',
        overflow: 'hidden',
        cursor: penMode && mode === 'teacher' ? 'crosshair' : 'default',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)',
        backgroundSize: '32px 32px',

      }}
    >
      <canvas
        ref={drawCanvasRef}
        width={1400} height={900}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
      />

      {blocks.length === 0 && mode === 'teacher' && !penMode && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', pointerEvents: 'none' }}>
          <div style={{ fontSize: '36px', opacity: 0.2 }}>✏️</div>
          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
            Click <strong>+ Add text</strong> to start writing<br />or switch to Draw mode
          </p>
        </div>
      )}
      {blocks.length === 0 && mode === 'student' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', pointerEvents: 'none' }}>
          <div style={{ fontSize: '36px', opacity: 0.2 }}>🎓</div>
          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
            Your teacher hasn't added notes yet.<br />Check back during class.
          </p>
        </div>
      )}

      {blocks.map(block => (
        <div
          key={block.id}
          onMouseDown={e => {
            if (mode === 'student' || penMode) return
            if (editingId === block.id) return
            e.stopPropagation()
            setSelectedId(block.id)
            const rect = canvasRef.current?.getBoundingClientRect()
            if (rect) setDragging({ id: block.id, ox: e.clientX - rect.left - block.x, oy: e.clientY - rect.top - block.y })
          }}
          onDoubleClick={e => {
            if (mode === 'student' || penMode) return
            e.stopPropagation(); setEditingId(block.id); setSelectedId(block.id)
          }}
          style={{
            position: 'absolute', left: block.x, top: block.y,
            minWidth: 80, maxWidth: 400, padding: '5px 7px', borderRadius: '4px',
            cursor: mode === 'teacher' && !penMode ? (editingId === block.id ? 'text' : 'grab') : 'default',
            outline: selectedId === block.id && !penMode ? '2px solid #ff4b55' : '2px solid transparent',
            outlineOffset: '2px',
            background: block.highlight !== 'transparent' ? block.highlight : 'transparent',
            zIndex: selectedId === block.id ? 10 : 2,
            pointerEvents: penMode ? 'none' : 'auto',
          }}
        >
          {editingId === block.id ? (
            <div
              contentEditable suppressContentEditableWarning autoFocus
              onInput={recordActivity}
              onBlur={e => { updateBlock(block.id, { text: e.currentTarget.innerText || '' }); setEditingId(null) }}
              onKeyDown={e => { if (e.key === 'Escape') { updateBlock(block.id, { text: (e.currentTarget as HTMLElement).innerText || '' }); setEditingId(null) } }}
              style={{ outline: 'none', minWidth: 80, fontSize: block.fontSize, fontWeight: block.bold ? 700 : 400, textDecoration: block.underline ? 'underline' : 'none', color: block.color, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: block.text || '' }}
            />
          ) : (
            <div style={{ position: 'relative' }}>
              {!block.text && mode === 'teacher' && (
                <span style={{ position: 'absolute', top: 0, left: 0, fontSize: block.fontSize, color: 'rgba(0,0,0,0.25)', pointerEvents: 'none', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                  Type here...
                </span>
              )}
              <p style={{ fontSize: block.fontSize, fontWeight: block.bold ? 700 : 400, textDecoration: block.underline ? 'underline' : 'none', color: block.text ? block.color : 'transparent', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, minWidth: 80, minHeight: block.fontSize * 1.5 }}>
                {block.text || '.'}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {toolbar}
        {canvasArea}
        {mode === 'teacher' && (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', marginTop: '8px', lineHeight: 1.5 }}>
            💡 <strong style={{ color: 'rgba(255,255,255,0.35)' }}>Text:</strong> + Add text → drag → double-click to edit
            {' | '}
            <strong style={{ color: 'rgba(255,255,255,0.35)' }}>Draw:</strong> freehand pen
            {' | '}
            Auto-saves silently while you work
          </p>
        )}
      </div>
    </>
  )
}