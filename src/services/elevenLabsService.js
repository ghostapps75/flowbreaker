// ─────────────────────────────────────────────────────────────────────────────
// elevenLabsService.js — ElevenLabs Bulgarian TTS via Netlify Proxy + Fallback
//
// The API key is never in the browser. All ElevenLabs calls go through
// the /.netlify/functions/tts serverless proxy.
// ─────────────────────────────────────────────────────────────────────────────

export const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm & natural female voice' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong & energetic female voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft & expressive female voice' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Clear & articulate male voice' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Warm & conversational male voice' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Deep & resonant male voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Crisp & natural male voice' },
]

// In-memory audio cache to prevent redundant proxy calls
const _audioBlobCache = new Map()

// Pre-warm browser voices on module load
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
  window.speechSynthesis.getVoices()
}

function isNaturalVoice(v) {
  const n = (v.name || '').toLowerCase()
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
 * Pick the best available Bulgarian browser voice.
 * Returns null if no Bulgarian voice is found so the engine uses native lang matching.
 */
function pickBrowserVoice(langCode = 'bg-BG') {
  if (!window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices() || []
  if (voices.length === 0) return null

  const targetLang = langCode.toLowerCase()
  const targetPrefix = targetLang.split('-')[0] // 'bg'

  // 1. Exact locale match with natural tag
  let match = voices.find(v => (v.lang || '').toLowerCase() === targetLang && isNaturalVoice(v))
  // 2. Exact locale match
  if (!match) match = voices.find(v => (v.lang || '').toLowerCase() === targetLang)
  // 3. Language prefix match with natural tag
  if (!match) match = voices.find(v => (v.lang || '').toLowerCase().startsWith(targetPrefix) && isNaturalVoice(v))
  // 4. Any language prefix match
  if (!match) match = voices.find(v => (v.lang || '').toLowerCase().startsWith(targetPrefix))

  // CRITICAL: NEVER return an English voice for Bulgarian Cyrillic text
  return match || null
}

/**
 * Browser SpeechSynthesis fallback with Bulgarian voice selection.
 */
export function fallbackTTS(text, rate = 0.85, langCode = 'bg-BG') {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve('browser-tts')
      return
    }

    try {
      window.speechSynthesis.cancel()
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = langCode
      utterance.rate = rate

      const voice = pickBrowserVoice(langCode)
      if (voice) {
        utterance.voice = voice
      }

      utterance.onend = () => resolve('browser-tts')
      utterance.onerror = (e) => {
        console.warn('[fallbackTTS] Utterance notice:', e)
        resolve('browser-tts')
      }

      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('[fallbackTTS] Exception during speak:', err)
      resolve('browser-tts')
    }
  })
}

/**
 * Synthesize speech via the Netlify TTS proxy with seamless fallback to browser TTS.
 * The ElevenLabs API key is handled server-side — it never reaches the browser.
 */
export async function synthesizeSpeech({
  text,
  voiceId = '21m00Tcm4TlvDq8ikWAM',
  stability = 0.55,
  similarityBoost = 0.75,
  speed = 0.85,
  langCode = 'bg-BG',
}) {
  const cacheKey = `${voiceId}_${speed}_${text}`
  if (_audioBlobCache.has(cacheKey)) {
    return _audioBlobCache.get(cacheKey)
  }

  try {
    const response = await fetch('/.netlify/functions/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId, stability, similarityBoost, speed }),
    })

    if (!response.ok) {
      throw new Error(`Proxy error ${response.status}`)
    }

    const { audio } = await response.json()

    // Decode base64 audio returned by the proxy into a blob URL
    const binary = atob(audio)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'audio/mpeg' })
    const url = URL.createObjectURL(blob)

    _audioBlobCache.set(cacheKey, url)
    return url
  } catch (error) {
    console.warn('[ElevenLabs proxy] Error, falling back to browser TTS:', error.message)
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
