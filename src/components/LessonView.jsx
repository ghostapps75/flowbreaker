import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import useStore, { MODES } from '../store/useStore'
import { DECKS } from '../data/decks'
import { triggerHaptic } from '../utils/haptics'
import DeconstructMode from './DeconstructMode'
import SpeakMode from './SpeakMode'

export default function LessonView() {
  const {
    activeDeckId,
    currentIndex,
    currentMode,
    setMode,
    nextPhrase,
    prevPhrase,
    markPhraseCompleted,
    completedPhrases,
  } = useStore()

  const [phraseCompleted, setPhraseCompleted] = useState(false)

  const deck = DECKS[activeDeckId] || DECKS.basics
  const phrases = deck.phrases || []
  const phrase = phrases[currentIndex] || phrases[0]

  const isCurrentPhraseDone = (completedPhrases[deck.id] || []).includes(phrase.id)

  const handleModeChange = (mode) => {
    triggerHaptic('light')
    setMode(mode)
  }

  const handleNext = () => {
    triggerHaptic('medium')
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setPhraseCompleted(false)
    nextPhrase()
  }

  const handlePrev = () => {
    triggerHaptic('light')
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setPhraseCompleted(false)
    prevPhrase()
  }

  const handleComplete = () => {
    setPhraseCompleted(true)
    markPhraseCompleted(deck.id, phrase.id, currentMode)
  }

  return (
    <main className="flex-1 px-3.5 flex flex-col w-full max-w-lg mx-auto relative z-10 min-h-0 overflow-hidden pb-2">
      {/* Mode Selector Pill */}
      <div className="py-1.5 flex justify-center flex-shrink-0">
        <div className="glass-pill rounded-full p-1 flex w-full max-w-xs relative shadow-xs border border-white/60">
          <button
            onClick={() => handleModeChange(MODES.BUILD)}
            className={`flex-1 text-xs font-black py-2 rounded-full transition-all no-select button-pop ${
              currentMode === MODES.BUILD
                ? 'bg-white text-purple-700 shadow-sm scale-100'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Deconstruct
          </button>
          <button
            onClick={() => handleModeChange(MODES.SPEAK)}
            className={`flex-1 text-xs font-black py-2 rounded-full transition-all no-select button-pop ${
              currentMode === MODES.SPEAK
                ? 'bg-white text-purple-700 shadow-sm scale-100'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Speak & Validate
          </button>
        </div>
      </div>

      {/* Progress & Category Subhead */}
      <div className="flex items-center justify-between px-2 mb-1.5 flex-shrink-0">
        <button
          onClick={handlePrev}
          aria-label="Previous phrase"
          className="p-1 rounded-full bg-white/40 text-white hover:bg-white/60 button-pop shadow-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="text-center">
          <span className="text-[11px] text-white font-extrabold tracking-wider uppercase drop-shadow-xs">
            Phrase {currentIndex + 1} of {phrases.length} · {deck.title}
          </span>
        </div>

        <button
          onClick={handleNext}
          aria-label="Next phrase"
          className="p-1 rounded-full bg-white/40 text-white hover:bg-white/60 button-pop shadow-xs"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Flashcard Container */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-[1.8rem] soft-shadow p-4 mb-2 flex-1 flex flex-col min-h-0 border border-white/60 overflow-hidden">
        {/* English Prompt Header */}
        <div className="text-center mb-2 flex-shrink-0">
          <span className="text-[9px] uppercase font-black tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mb-1 inline-block">
            Target English
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight px-1">
            {phrase.en}
          </h2>
        </div>

        {/* Dynamic Mode Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentMode === MODES.BUILD ? (
              <motion.div
                key={`build-${phrase.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col min-h-0"
              >
                <DeconstructMode
                  phrase={phrase}
                  onComplete={handleComplete}
                  isCompleted={isCurrentPhraseDone}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`speak-${phrase.id}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col min-h-0"
              >
                <SpeakMode
                  phrase={phrase}
                  onComplete={handleComplete}
                  isCompleted={isCurrentPhraseDone}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Next Button */}
      <div className="w-full flex-shrink-0 pt-0.5">
        <button
          onClick={handleNext}
          className={`w-full py-3 rounded-xl text-sm font-black button-pop no-select soft-shadow flex items-center justify-center gap-1.5 transition-all ${
            phraseCompleted || isCurrentPhraseDone
              ? 'bg-gradient-to-r from-gray-900 to-black text-white hover:brightness-110'
              : 'bg-white/85 hover:bg-white text-gray-800 border border-white/60'
          }`}
        >
          <span>Next Phrase</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  )
}
