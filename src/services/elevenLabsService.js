// ─────────────────────────────────────────────────────────────────────────────
// elevenLabsService.js — ElevenLabs Bulgarian TTS + Smart Native Voice Fallback
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.elevenlabs.io/v1'

export const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm & natural female voice' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong & energetic female voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft & expressive female voice' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Clear & articulate male voice' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Warm & conversational male voice' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Deep & resonant male voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Crisp & natural male voice' },
]

function getBrowserVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices() ?? []
    if (voices.length > 0) {
      resolve(voices)
      return
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices())
      }
      setTimeout(() => resolve(window.speechSynthesis?.getVoices() ?? []), 1000)
    } else {
      resolve([])
    }
  })
}

function isNaturalVoice(v) {
  const n = v.name.toLowerCase()
  return (
    v.localService === false ||
    n.includes('neural') ||
    n.includes('online') ||
    n.includes('natural') ||
    n.includes('enhanced') ||
    n.includes('google') ||
    n.includes('microsoft')
  )
}

/**
 * Pick the best available Bulgarian (or fallback) browser voice.
 */
async function pickBrowserVoice(langCode = 'bg-BG') {
  const voices = await getBrowserVoices()
  if (voices.length === 0) return null

  const targetLang = langCode.toLowerCase()
  const targetPrefix = targetLang.split('-')[0] // 'bg'

  // 1. Exact locale match with natural tag
  let match = voices.find(v => v.lang.toLowerCase() === targetLang && isNaturalVoice(v))
  // 2. Exact locale match
  if (!match) match = voices.find(v => v.lang.toLowerCase() === targetLang)
  // 3. Language prefix match with natural tag
  if (!match) match = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix) && isNaturalVoice(v))
  // 4. Any language prefix match
  if (!match) match = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix))
  // 5. Fallback to first voice
  if (!match) match = voices[0]

  return match ?? null
}

/**
 * Browser SpeechSynthesis fallback with Bulgarian voice selection.
 */
export function fallbackTTS(text, rate = 0.85, langCode = 'bg-BG') {
  return new Promise(async (resolve) => {
    if (!window.speechSynthesis) {
      resolve('browser-tts')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langCode
    utterance.rate = rate

    const voice = await pickBrowserVoice(langCode)
    if (voice) {
      utterance.voice = voice
    }

    utterance.onend = () => resolve('browser-tts')
    utterance.onerror = (e) => {
      console.warn('[fallbackTTS] Utterance error:', e)
      resolve('browser-tts')
    }

    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Synthesize speech via ElevenLabs with seamless fallback to browser TTS.
 */
export async function synthesizeSpeech({
  text,
  voiceId = '21m00Tcm4TlvDq8ikWAM',
  apiKey,
  stability = 0.55,
  similarityBoost = 0.75,
  speed = 0.85,
  langCode = 'bg-BG',
}) {
  if (!apiKey) {
    return fallbackTTS(text, speed, langCode)
  }

  try {
    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          speed,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`ElevenLabs API error ${response.status}: ${err}`)
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.warn('[ElevenLabs] Falling back to browser TTS:', error.message)
    return fallbackTTS(text, speed, langCode)
  }
}

/**
 * Play audio from a blob URL.
 */
export function playAudioUrl(url, speed = 1) {
  if (!url || url === 'browser-tts') return null
  const audio = new Audio(url)
  audio.playbackRate = speed
  audio.play().catch(console.warn)
  return audio
}
