import React from 'react'
import { ArrowLeft, Settings } from 'lucide-react'
import useStore, { VIEWS } from '../store/useStore'
import { triggerHaptic } from '../utils/haptics'

export default function Header() {
  const { currentView, setView, toggleSettings } = useStore()
  const isLesson = currentView === VIEWS.LESSON

  const handleBack = () => {
    triggerHaptic('light')
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setView(VIEWS.DECK_SELECT)
  }

  const handleSettings = () => {
    triggerHaptic('light')
    toggleSettings()
  }

  return (
    <header className="pt-2.5 pb-2 px-4 glass text-center flex-shrink-0 z-20 relative border-b border-white/30">
      {isLesson && (
        <button
          onClick={handleBack}
          aria-label="Back to Decks"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 p-1.5 button-pop rounded-full bg-white/70 shadow-xs border border-white/70"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      <div className="flex flex-col items-center justify-center">
        <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 leading-none">
          FlowBreaker
        </h1>
        <p className="text-[9px] text-gray-600 font-extrabold tracking-widest uppercase mt-0.5">
          Bulgarian Edition 👻
        </p>
      </div>

      <button
        onClick={handleSettings}
        aria-label="Settings"
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 p-1.5 button-pop rounded-full bg-white/70 shadow-xs border border-white/70"
      >
        <Settings className="w-4 h-4 stroke-[2.2]" />
      </button>
    </header>
  )
}
