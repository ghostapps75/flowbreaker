// ─────────────────────────────────────────────────────────────────────────────
// useSpeechRecognition.js — Hook for Bulgarian Speech Recognition
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from '../services/speechRecognitionService'
import { triggerHaptic } from '../utils/haptics'

export default function useSpeechRecognition({ onFinalTranscript, lang = 'bg-BG' } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const isSupported = isSpeechRecognitionSupported()

  const recognizerRef = useRef(null)

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop()
      } catch (err) {
        // Ignore if already stopped
      }
    }
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    setError(null)
    setTranscript('')
    setInterimTranscript('')
    triggerHaptic('medium')

    try {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort()
        } catch (e) {}
      }

      recognizerRef.current = createSpeechRecognizer({
        lang,
        interimResults: true,
        onStart: () => {
          setIsListening(true)
        },
        onResult: ({ final, interim, isFinal }) => {
          if (final) {
            setTranscript(final)
            setInterimTranscript('')
            if (onFinalTranscript) onFinalTranscript(final)
          } else {
            setInterimTranscript(interim)
          }
        },
        onError: (err) => {
          console.warn('[useSpeechRecognition] Error received:', err)
          if (err === 'not-allowed') {
            setError('Microphone access was denied. Please allow microphone permissions in your browser.')
          } else if (err === 'no-speech') {
            setError('No speech detected. Please tap and try speaking again.')
          } else {
            setError(`Speech recognition notice: ${err}`)
          }
          setIsListening(false)
          triggerHaptic('error')
        },
        onEnd: () => {
          setIsListening(false)
        },
      })

      if (recognizerRef.current) {
        recognizerRef.current.start()
      }
    } catch (err) {
      console.warn('[useSpeechRecognition] start error:', err)
      setError('Could not start microphone.')
      setIsListening(false)
    }
  }, [isSupported, lang, onFinalTranscript])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort()
        } catch (e) {}
      }
    }
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
