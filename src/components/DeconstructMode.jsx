import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, CheckCircle2, RotateCcw, Move, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import useStore from '../store/useStore'
import useAudio from '../hooks/useAudio'
import { getWords, normalizeBulgarian } from '../utils/textComparison'
import { triggerHaptic } from '../utils/haptics'

function shuffleArray(arr) {
  const array = [...arr]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export default function DeconstructMode({ phrase, onComplete, isCompleted }) {
  const { autoPlayTTS, showPhonetics } = useStore()
  const { speak, isPlayingAudio, playingId } = useAudio()

  const [wordObjects, setWordObjects] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [hasError, setHasError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isOverDropzone, setIsOverDropzone] = useState(false)
  const [activeSpeakingWordId, setActiveSpeakingWordId] = useState(null)

  const dropzoneRef = useRef(null)

  // Initialize and reset word bank when phrase changes
  useEffect(() => {
    if (!phrase) return
    const rawWords = getWords(phrase.bg)
    const wordsWithIds = rawWords.map((word, idx) => ({
      id: `${idx}-${word}`,
      text: word,
    }))

    setWordObjects(shuffleArray(wordsWithIds))
    setSelectedIds([])
    setHasError(false)
    setIsSuccess(false)
    setIsOverDropzone(false)
  }, [phrase])

  const lastTapTimeRef = useRef(0)

  // Tap a word in bank -> Speak word out loud
  const handleWordClick = (id, text) => {
    const now = Date.now()
    if (now - lastTapTimeRef.current < 250) return
    lastTapTimeRef.current = now

    triggerHaptic('light')
    setActiveSpeakingWordId(id)
    speak(text, `word-${id}`).finally(() => {
      setActiveSpeakingWordId(null)
    })
  }

  // Drag over dropzone detection
  const handleDrag = (event, info) => {
    if (!dropzoneRef.current) return
    const rect = dropzoneRef.current.getBoundingClientRect()
    const isInside =
      info.point.x >= rect.left &&
      info.point.x <= rect.right &&
      info.point.y >= rect.top &&
      info.point.y <= rect.bottom
    setIsOverDropzone(isInside)
  }

  // Drop word into dropzone
  const handleDragEnd = (event, info, wordObj) => {
    setIsOverDropzone(false)
    if (!dropzoneRef.current) return
    const rect = dropzoneRef.current.getBoundingClientRect()
    const isInside =
      info.point.x >= rect.left &&
      info.point.x <= rect.right &&
      info.point.y >= rect.top &&
      info.point.y <= rect.bottom

    if (isInside) {
      triggerHaptic('medium')
      setHasError(false)
      const nextSelected = [...selectedIds, wordObj.id]
      setSelectedIds(nextSelected)

      if (nextSelected.length === wordObjects.length) {
        checkSentence(nextSelected)
      }
    }
  }

  // Remove word from dropzone on click
  const handleDeselectWord = (id) => {
    triggerHaptic('light')
    setHasError(false)
    setSelectedIds((prev) => prev.filter((item) => item !== id))
  }

  const handleReset = () => {
    triggerHaptic('medium')
    setSelectedIds([])
    setHasError(false)
    setIsSuccess(false)
  }

  const checkSentence = (currentSelection) => {
    const constructed = currentSelection
      .map((id) => wordObjects.find((w) => w.id === id)?.text)
      .join(' ')

    const target = getWords(phrase.bg).join(' ')

    if (constructed === target) {
      setIsSuccess(true)
      triggerHaptic('success')

      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e73c7e', '#23a6d5', '#34C759', '#f59e0b', '#8b5cf6'],
        disableForReducedMotion: true,
        zIndex: 100,
      })

      if (autoPlayTTS) {
        speak(phrase.bg, 'full-success')
      }

      onComplete?.()
    } else {
      setHasError(true)
      triggerHaptic('error')
    }
  }

  const handleReplayFullAudio = () => {
    triggerHaptic('light')
    speak(phrase.bg, 'manual-replay')
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Dropzone Container */}
      <div
        ref={dropzoneRef}
        className={`min-h-[75px] p-3 rounded-xl flex flex-wrap gap-1.5 items-center justify-center transition-all duration-300 flex-shrink-0 relative ${
          isSuccess
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white soft-shadow'
            : hasError
            ? 'bg-rose-50 border-2 border-rose-400 shake-error'
            : isOverDropzone
            ? 'bg-purple-100/90 border-2 border-dashed border-purple-500 scale-[1.01] shadow-xs'
            : 'bg-gray-50/80 border-2 border-dashed border-purple-200'
        }`}
      >
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center w-full gap-1.5 py-0.5"
          >
            <div className="flex items-center gap-2">
              <div className="p-0.5 rounded-full bg-white/20">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-white tracking-wide">{phrase.bg}</span>
              <button
                onClick={handleReplayFullAudio}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full button-pop transition-colors shadow-xs ml-0.5"
                aria-label="Replay audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            {showPhonetics && phrase.phonetic && (
              <span className="text-[11px] font-mono font-medium text-emerald-100 italic">
                {phrase.phonetic}
              </span>
            )}
          </motion.div>
        ) : selectedIds.length === 0 ? (
          <div className="flex flex-col items-center gap-0.5 select-none pointer-events-none text-center">
            <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
              isOverDropzone ? 'text-purple-700 font-extrabold' : 'text-purple-400'
            }`}>
              {isOverDropzone ? '✨ Drop Here ✨' : 'Drag words here in order'}
            </span>
            <span className="text-[9px] text-gray-400 font-medium">
              (Tap words below to hear audio · Tap placed words to remove)
            </span>
          </div>
        ) : (
          selectedIds.map((id) => {
            const wordObj = wordObjects.find((w) => w.id === id)
            if (!wordObj) return null
            return (
              <motion.button
                key={id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => handleDeselectWord(id)}
                title="Tap to remove"
                className="px-3 py-1.5 rounded-lg font-extrabold text-sm button-pop bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xs flex items-center gap-1 group"
              >
                <span>{wordObj.text}</span>
                <span className="text-[9px] opacity-60 group-hover:opacity-100">✕</span>
              </motion.button>
            )
          })
        )}
      </div>

      {/* Action Row when in progress */}
      {!isSuccess && (
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
            <Move className="w-2.5 h-2.5 text-purple-500" />
            <span>Drag up to build · Tap to hear</span>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleReset}
              className="text-[10px] font-bold text-gray-400 hover:text-gray-600 flex items-center gap-0.5 button-pop px-1.5 py-0.5"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Word Bank Container with Draggable Word Chips */}
      {!isSuccess && (
        <div className="flex flex-wrap gap-2 justify-center mt-auto pt-2 pb-1 flex-shrink-0 relative max-h-[160px] overflow-y-auto">
          {wordObjects.map((wordObj) => {
            const isUsed = selectedIds.includes(wordObj.id)
            const isSpeaking = activeSpeakingWordId === wordObj.id

            if (isUsed) {
              return (
                <div
                  key={wordObj.id}
                  className="px-3 py-2 rounded-xl font-bold text-sm opacity-0 pointer-events-none select-none invisible"
                >
                  {wordObj.text}
                </div>
              )
            }

            return (
              <motion.div
                key={wordObj.id}
                drag
                dragSnapToOrigin
                dragElastic={0.15}
                whileDrag={{
                  scale: 1.1,
                  zIndex: 60,
                  boxShadow: '0 12px 20px -5px rgba(124, 58, 237, 0.35)',
                  cursor: 'grabbing',
                }}
                onDrag={handleDrag}
                onDragEnd={(e, info) => handleDragEnd(e, info, wordObj)}
                onTap={() => handleWordClick(wordObj.id, wordObj.text)}
                className={`px-3 py-2 rounded-xl font-bold text-sm cursor-grab select-none button-pop transition-colors flex items-center gap-1.5 touch-none ${
                  isSpeaking
                    ? 'bg-purple-100 text-purple-900 border-2 border-purple-400 shadow-xs ring-1 ring-purple-300'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-xs hover:border-purple-300 active:scale-95'
                }`}
              >
                <span>{wordObj.text}</span>
                <Volume2
                  className={`w-3.5 h-3.5 transition-colors pointer-events-none ${
                    isSpeaking ? 'text-purple-600 animate-pulse' : 'text-gray-400 hover:text-purple-500'
                  }`}
                />
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
