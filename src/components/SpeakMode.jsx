import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Eye, RefreshCw, Sparkles, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import useStore from '../store/useStore'
import useAudio from '../hooks/useAudio'
import useSpeechRecognition from '../hooks/useSpeechRecognition'
import {
  calculateSimilarity,
  evaluateWordMatch,
  normalizeBulgarian,
  getWords,
} from '../utils/textComparison'
import { triggerHaptic } from '../utils/haptics'
import AudioWaveform from './AudioWaveform'
import AccuracyBadge from './AccuracyBadge'

export default function SpeakMode({ phrase, onComplete, isCompleted }) {
  const { autoPlayTTS, showPhonetics } = useStore()
  const { speak, isPlayingAudio } = useAudio()

  const [isRevealed, setIsRevealed] = useState(false)
  const [similarityScore, setSimilarityScore] = useState(null)
  const [wordEvaluations, setWordEvaluations] = useState([])
  const [hasSpokenSuccess, setHasSpokenSuccess] = useState(false)

  // Speech Recognition hook
  const handleFinalSpeech = (finalText) => {
    if (!phrase || !finalText) return

    const score = calculateSimilarity(finalText, phrase.bg)
    const evals = evaluateWordMatch(finalText, phrase.bg)

    setSimilarityScore(score)
    setWordEvaluations(evals)

    if (score >= 70) {
      setHasSpokenSuccess(true)
      setIsRevealed(true)
      triggerHaptic('success')

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
        disableForReducedMotion: true,
        zIndex: 100,
      })

      if (autoPlayTTS) {
        speak(phrase.bg, 'speak-success')
      }

      onComplete?.()
    } else {
      triggerHaptic('error')
    }
  }

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onFinalTranscript: handleFinalSpeech,
    lang: 'bg-BG',
  })

  // Reset state when phrase changes
  useEffect(() => {
    setIsRevealed(false)
    setSimilarityScore(null)
    setWordEvaluations([])
    setHasSpokenSuccess(false)
    resetTranscript()
    stopListening()
  }, [phrase])

  const handleMicToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      setSimilarityScore(null)
      setWordEvaluations([])
      startListening()
    }
  }

  const handleReveal = () => {
    triggerHaptic('medium')
    setIsRevealed(true)
    speak(phrase.bg, 'reveal-audio')
    onComplete?.()
  }

  const handleReplayAudio = () => {
    triggerHaptic('light')
    speak(phrase.bg, 'manual-replay')
  }

  const currentDisplaySpeech = transcript || interimTranscript

  return (
    <div className="flex flex-col flex-1 min-h-0 items-center justify-between py-2">
      {/* Speech Feedback & Evaluated Target Area */}
      <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[160px]">
        {/* If user hasn't revealed and hasn't spoken yet */}
        {!isRevealed && !similarityScore && !currentDisplaySpeech && (
          <div className="text-center px-4">
            <p className="text-sm font-bold text-gray-500 mb-1">
              Speak the Bulgarian translation aloud
            </p>
            <p className="text-xs text-purple-600 font-medium">
              Tap the microphone to practice your pronunciation
            </p>
          </div>
        )}

        {/* Live Listening Transcript */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-4 px-4 text-center w-full"
          >
            <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Listening to Bulgarian...
            </div>
            <div className="text-lg font-bold text-gray-800 italic min-h-[1.75rem]">
              "{currentDisplaySpeech || 'Speak now...'}"
            </div>
            <AudioWaveform active={true} color="bg-rose-500" barCount={7} />
          </motion.div>
        )}

        {/* Accuracy Score & Word Match Display */}
        {similarityScore !== null && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full flex flex-col items-center gap-3 mb-3 px-2"
          >
            <AccuracyBadge score={similarityScore} />

            {/* Word-by-word Breakdown */}
            <div className="flex flex-wrap gap-2 justify-center items-center p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80 max-w-sm">
              {wordEvaluations.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-xl text-sm font-black transition-colors ${
                    item.matched
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  {item.word}
                </span>
              ))}
            </div>

            {transcript && (
              <p className="text-xs text-gray-400 font-medium italic">
                Heard: "{transcript}"
              </p>
            )}
          </motion.div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="text-xs text-rose-500 font-medium px-4 py-2 bg-rose-50 rounded-xl mb-3 text-center border border-rose-100">
            {error}
          </div>
        )}

        {/* Revealed Phrase Container */}
        {isRevealed && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center px-4 w-full"
          >
            <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2 leading-tight">
              {phrase.bg}
            </h3>
            {showPhonetics && phrase.phonetic && (
              <p className="text-sm font-mono text-gray-500 font-bold mb-4">
                {phrase.phonetic}
              </p>
            )}

            {/* Audio Replay Button */}
            <button
              onClick={handleReplayAudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 button-pop font-black text-sm shadow-xs"
            >
              <Volume2 className="w-5 h-5" />
              <span>Listen to Native Voice</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Control Buttons Footer */}
      <div className="w-full flex flex-col gap-3 mt-auto pt-4 flex-shrink-0">
        {/* Microphone / Pronounce Validator Button */}
        {isSupported && (
          <button
            onClick={handleMicToggle}
            className={`w-full py-4.5 px-6 rounded-2xl font-black text-lg button-pop soft-shadow flex items-center justify-center gap-3 transition-all ${
              isListening
                ? 'bg-rose-500 text-white mic-pulse'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white hover:brightness-105'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6 animate-pulse" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                <span>{hasSpokenSuccess ? 'Practice Again' : 'Speak to Validate'}</span>
              </>
            )}
          </button>
        )}

        {/* Reveal Answer Button (fallback or instant check) */}
        {!isRevealed && (
          <button
            onClick={handleReveal}
            className="w-full py-3.5 bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 font-bold rounded-2xl text-sm button-pop shadow-xs flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>Reveal Answer</span>
          </button>
        )}
      </div>
    </div>
  )
}
