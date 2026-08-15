// ─────────────────────────────────────────────────────────────────────────────
// useAudio.js — Hook for Bulgarian Speech Synthesis
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useCallback } from 'react'
import useStore from '../store/useStore'
import { synthesizeSpeech, playAudioUrl } from '../services/elevenLabsService'

export default function useAudio() {
  const audioRef = useRef(null)
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
      // Cancel previous playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }

      setAudioPlaying(id)

      return new Promise(async (resolve) => {
        try {
          const activeKey = elevenLabsKey || import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_1db8ed20ca30891dd6834e909d48b788653af351d13f9594'
          const url = await synthesizeSpeech({
            text,
            voiceId: selectedVoiceId,
            apiKey: activeKey,
            stability: ttsStability,
            similarityBoost: ttsSimilarityBoost,
            speed: ttsSpeed,
            langCode,
          })

          if (url && url !== 'browser-tts') {
            const audio = playAudioUrl(url, 1)
            audioRef.current = audio
            if (audio) {
              audio.onended = () => {
                stopAudioPlaying()
                resolve()
              }
              audio.onerror = () => {
                stopAudioPlaying()
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
          stopAudioPlaying()
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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    stopAudioPlaying()
  }, [stopAudioPlaying])

  return { speak, stop }
}
