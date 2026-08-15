import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import useStore from '../store/useStore'
import { DECKS } from '../data/decks'
import { triggerHaptic } from '../utils/haptics'
import DeconstructMode from './DeconstructMode'

export default function LessonView() {
  const {
    activeDeckId,
    currentIndex,
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
    markPhraseCompleted(deck.id, phrase.id)
  }

  return (
    <main className="flex-1 px-3.5 pt-2 flex flex-col w-full max-w-lg mx-auto relative z-10 min-h-0 overflow-hidden pb-2">
      {/* Progress & Category Top Bar */}
      <div className="flex items-center justify-between px-2 mb-2 flex-shrink-0">
        <button
          onClick={handlePrev}
          aria-label="Previous phrase"
          className="p-1.5 rounded-full bg-white/40 text-white hover:bg-white/60 button-pop shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-xs text-white font-extrabold tracking-wider uppercase drop-shadow-xs">
            Phrase {currentIndex + 1} of {phrases.length} · {deck.title}
          </span>
        </div>

        <button
          onClick={handleNext}
          aria-label="Next phrase"
          className="p-1.5 rounded-full bg-white/40 text-white hover:bg-white/60 button-pop shadow-xs"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Flashcard Container */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-[1.8rem] soft-shadow p-4 mb-2 flex-1 flex flex-col min-h-0 border border-white/60 overflow-hidden">
        {/* English Prompt Header */}
        <div className="text-center mb-2.5 flex-shrink-0">
          <span className="text-[10px] uppercase font-black tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-1.5 inline-block">
            Arrange the Words
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight px-1">
            {phrase.en}
          </h2>
        </div>

        {/* Sentence Builder Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`arrange-${phrase.id}`}
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
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Next Button */}
      <div className="w-full flex-shrink-0 pt-0.5">
        <button
          onClick={handleNext}
          className={`w-full py-3.5 rounded-xl text-sm font-black button-pop no-select soft-shadow flex items-center justify-center gap-1.5 transition-all ${
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
