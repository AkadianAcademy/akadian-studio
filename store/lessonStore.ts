import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'Conversation'
export type Subject = 'languages' | 'math' | 'technology' | 'sciences' | 'business'

export interface LessonSetup {
  subject: Subject
  language: string
  level: Level
  unit: string
  title: string
  goal: string
}

export interface VocabItem {
  id: string
  word: string
  translation: string
}

export interface SentenceItem {
  id: string
  source: string
  translation: string
}

export interface LessonStore {
  lessonId: string | null
  slug: string | null
  setup: LessonSetup
  vocab: VocabItem[]
  sentences: SentenceItem[]
  currentStep: number
  saving: boolean
  setSlug: (slug: string) => void
  setLessonId: (id: string) => void
  setSetup: (setup: Partial<LessonSetup>) => void
  setVocab: (vocab: VocabItem[]) => void
  setSentences: (sentences: SentenceItem[]) => void
  setCurrentStep: (step: number) => void
  setSaving: (saving: boolean) => void
  reset: () => void
}

const defaultSetup: LessonSetup = {
  subject: 'languages',
  language: 'English',
  level: 'A2',
  unit: '',
  title: '',
  goal: '',
}

export const useLessonStore = create<LessonStore>()(
  persist(
    (set) => ({
      lessonId: null,
      slug: null,
      setup: defaultSetup,
      vocab: [],
      sentences: [],
      currentStep: 1,
      saving: false,
      setSlug: (slug) => set({ slug }),
      setLessonId: (id) => set({ lessonId: id }),
      setSetup: (partial) => set((s) => ({ setup: { ...s.setup, ...partial } })),
      setVocab: (vocab) => set({ vocab }),
      setSentences: (sentences) => set({ sentences }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setSaving: (saving) => set({ saving }),
      reset: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('akadian-lesson-store')
        }
        set({ lessonId: null, slug: null, setup: defaultSetup, vocab: [], sentences: [], currentStep: 1, saving: false })
      },
    }),
    {
      name: 'akadian-lesson-store',
    }
  )
)
