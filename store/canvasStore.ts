import { create } from 'zustand'

export interface StickyNote {
  id: string
  word: string
  translation: string
  x: number
  y: number
  color: string
}

interface CanvasStore {
  stickies: StickyNote[]
  selectedId: string | null
  tool: 'select' | 'sticky' | 'pointer'
  zoom: number
  setStickies: (stickies: StickyNote[]) => void
  addSticky: (sticky: StickyNote) => void
  updateSticky: (id: string, updates: Partial<StickyNote>) => void
  deleteSticky: (id: string) => void
  setSelectedId: (id: string | null) => void
  setTool: (tool: 'select' | 'sticky' | 'pointer') => void
  setZoom: (zoom: number) => void
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  stickies: [],
  selectedId: null,
  tool: 'select',
  zoom: 1,
  setStickies: (stickies) => set({ stickies }),
  addSticky: (sticky) => set((s) => ({ stickies: [...s.stickies, sticky] })),
  updateSticky: (id, updates) => set((s) => ({
    stickies: s.stickies.map(st => st.id === id ? { ...st, ...updates } : st)
  })),
  deleteSticky: (id) => set((s) => ({ stickies: s.stickies.filter(st => st.id !== id) })),
  setSelectedId: (id) => set({ selectedId: id }),
  setTool: (tool) => set({ tool }),
  setZoom: (zoom) => set({ zoom }),
}))
