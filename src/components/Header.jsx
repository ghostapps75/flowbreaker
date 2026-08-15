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
    <header className="pt-12 pb-3.5 px-6 glass text-center flex-shrink-0 z-20 relative border-b border-white/30">
      {isLesson && (
        <button
          onClick={handleBack}
          aria-label="Back to Decks"
          className="absolute left-4 bottom-3 text-gray-700 hover:text-gray-900 p-2 button-pop rounded-full bg-white/60 shadow-sm border border-white/60"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500">
          FlowBreaker
        </h1>
        <p className="text-[10px] text-gray-600 font-extrabold tracking-widest uppercase mt-0.5">
          Bulgarian Edition · by ghostapps 👻
        </p>
      </div>

      <button
        onClick={handleSettings}
        aria-label="Settings"
        className="absolute right-4 bottom-3 text-gray-700 hover:text-gray-900 p-2 button-pop rounded-full bg-white/60 shadow-sm border border-white/60"
      >
        <Settings className="w-5 h-5 stroke-[2.2]" />
      </button>
    </header>
  )
}
