// ─────────────────────────────────────────────────────────────────────────────
// useAudio.js — Single-Stream Hook for Bulgarian Speech Synthesis
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useCallback } from 'react'
import useStore from '../store/useStore'
import { synthesizeSpeech, playAudioUrl } from '../services/elevenLabsService'

export default function useAudio() {
  const audioRef = useRef(null)
  const requestIdRef = useRef(0)

  const {
    elevenLabsKey,
    selectedVoiceId,
    ttsSpeed,
    ttsStability,
    ttsSimilarityBoost,
    setAudioPlaying,
    stopAudioPlaying,
  } = useStore()

  const speak = useCallback(
    (text, id = null, langCode = 'bg-BG') => {
      // Increment request ID so any older pending async calls are discarded
      const currentReqId = ++requestIdRef.current

      // Stop any existing playing audio immediately
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }

      setAudioPlaying(id)

      return new Promise(async (resolve) => {
        try {
          const activeKey =
            elevenLabsKey ||
            import.meta.env.VITE_ELEVENLABS_API_KEY

          const url = await synthesizeSpeech({
            text,
            voiceId: selectedVoiceId,
            apiKey: activeKey,
            stability: ttsStability,
            similarityBoost: ttsSimilarityBoost,
            speed: ttsSpeed,
            langCode,
          })

          // If another speak request started while we were synthesizing, discard this one
          if (currentReqId !== requestIdRef.current) {
            resolve()
            return
          }

          if (url && url !== 'browser-tts') {
            const audio = playAudioUrl(url, 1)
            audioRef.current = audio
            if (audio) {
              audio.onended = () => {
                if (currentReqId === requestIdRef.current) {
                  stopAudioPlaying()
                }
                resolve()
              }
              audio.onerror = () => {
                if (currentReqId === requestIdRef.current) {
                  stopAudioPlaying()
                }
                resolve()
              }
            } else {
              stopAudioPlaying()
              resolve()
            }
          } else {
            // Browser TTS fallback finished
            stopAudioPlaying()
            resolve()
          }
        } catch (err) {
          console.warn('[useAudio] Error in speech synthesis:', err)
          if (currentReqId === requestIdRef.current) {
            stopAudioPlaying()
          }
          resolve()
        }
      })
    },
    [
      elevenLabsKey,
      selectedVoiceId,
      ttsSpeed,
      ttsStability,
      ttsSimilarityBoost,
      setAudioPlaying,
      stopAudioPlaying,
    ]
  )

  const stop = useCallback(() => {
    requestIdRef.current++
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    stopAudioPlaying()
  }, [stopAudioPlaying])

  return { speak, stop }
}
