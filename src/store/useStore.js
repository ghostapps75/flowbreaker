// ─────────────────────────────────────────────────────────────────────────────
// useStore.js — Global Zustand State for FlowBreaker
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DECKS } from '../data/decks'

export const VIEWS = {
  DECK_SELECT: 'deck_select',
  LESSON: 'lesson',
}

export const MODES = {
  BUILD: 'build',
  SPEAK: 'speak',
}

const useStore = create(
  persist(
    (set, get) => ({
      // ── Navigation & View ─────────────────────────────────────────────
      currentView: VIEWS.DECK_SELECT,
      activeDeckId: 'basics',
      currentMode: MODES.BUILD,
      currentIndex: 0,
      isSettingsOpen: false,

      // ── Progress & Gamification ───────────────────────────────────────
      completedPhrases: {}, // { [deckId]: [phraseId, ...] }
      stats: {
        totalConstructed: 0,
        totalSpoken: 0,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },

      // ── Voice / TTS Configuration ─────────────────────────────────────
      selectedVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      ttsSpeed: 0.85,
      ttsStability: 0.55,
      ttsSimilarityBoost: 0.75,
      autoPlayTTS: true,
      showPhonetics: true,

      // ── Audio Playback State ──────────────────────────────────────────
      isPlayingAudio: false,
      playingId: null,

      // ── State Modifiers ───────────────────────────────────────────────
      setView: (view) => set({ currentView: view }),
      
      selectDeck: (deckId) => {
        set({
          activeDeckId: deckId,
          currentIndex: 0,
          currentView: VIEWS.LESSON,
        })
      },

      setMode: (mode) => set({ currentMode: mode }),

      setCurrentIndex: (idx) => set({ currentIndex: idx }),

      nextPhrase: () => {
        const { activeDeckId, currentIndex } = get()
        const deck = DECKS[activeDeckId]
        if (!deck) return
        const nextIdx = (currentIndex + 1) % deck.phrases.length
        set({ currentIndex: nextIdx })
      },

      prevPhrase: () => {
        const { activeDeckId, currentIndex } = get()
        const deck = DECKS[activeDeckId]
        if (!deck) return
        const prevIdx = (currentIndex - 1 + deck.phrases.length) % deck.phrases.length
        set({ currentIndex: prevIdx })
      },

      markPhraseCompleted: (deckId, phraseId, mode) => {
        const state = get()
        const existing = state.completedPhrases[deckId] || []
        const updated = existing.includes(phraseId) ? existing : [...existing, phraseId]

        const stats = { ...state.stats }
        if (mode === MODES.BUILD) {
          stats.totalConstructed = (stats.totalConstructed || 0) + 1
        } else if (mode === MODES.SPEAK) {
          stats.totalSpoken = (stats.totalSpoken || 0) + 1
        }

        set({
          completedPhrases: {
            ...state.completedPhrases,
            [deckId]: updated,
          },
          stats,
        })
      },

      // ── Voice Settings Modifiers ──────────────────────────────────────
      setSelectedVoiceId: (id) => set({ selectedVoiceId: id }),
      setTtsSpeed: (speed) => set({ ttsSpeed: speed }),
      setTtsStability: (v) => set({ ttsStability: v }),
      setTtsSimilarityBoost: (v) => set({ ttsSimilarityBoost: v }),
      toggleAutoPlayTTS: () => set((s) => ({ autoPlayTTS: !s.autoPlayTTS })),
      toggleShowPhonetics: () => set((s) => ({ showPhonetics: !s.showPhonetics })),
      toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
      closeSettings: () => set({ isSettingsOpen: false }),

      // ── Audio Playing Indicator ───────────────────────────────────────
      setAudioPlaying: (id = null) => set({ isPlayingAudio: true, playingId: id }),
      stopAudioPlaying: () => set({ isPlayingAudio: false, playingId: null }),
    }),
    {
      name: 'flowbreaker-storage',
      partialize: (s) => ({
        completedPhrases: s.completedPhrases,
        stats: s.stats,
        selectedVoiceId: s.selectedVoiceId,
        ttsSpeed: s.ttsSpeed,
        ttsStability: s.ttsStability,
        ttsSimilarityBoost: s.ttsSimilarityBoost,
        autoPlayTTS: s.autoPlayTTS,
        showPhonetics: s.showPhonetics,
      }),
    }
  )
)

export default useStore
