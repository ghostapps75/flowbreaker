// ─────────────────────────────────────────────────────────────────────────────
// speechRecognitionService.js — Bulgarian Speech-to-Text (STT) Recognition
// ─────────────────────────────────────────────────────────────────────────────

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window ||
    'mozSpeechRecognition' in window ||
    'msSpeechRecognition' in window
  )
}

export function createSpeechRecognizer({
  lang = 'bg-BG',
  interimResults = true,
  maxAlternatives = 1,
  onResult,
  onError,
  onEnd,
  onStart
}) {
  if (!isSpeechRecognitionSupported()) {
    console.warn('[speechRecognition] Web Speech API not supported in this browser.')
    return null
  }

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition

  const recognition = new SpeechRecognition()
  recognition.lang = lang
  recognition.interimResults = interimResults
  recognition.maxAlternatives = maxAlternatives
  recognition.continuous = false

  recognition.onstart = () => {
    if (onStart) onStart()
  }

  recognition.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const item = event.results[i]
      const transcript = item[0].transcript
      if (item.isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    if (onResult) {
      onResult({
        final: finalTranscript.trim(),
        interim: interimTranscript.trim(),
        isFinal: !!finalTranscript
      })
    }
  }

  recognition.onerror = (event) => {
    console.warn('[speechRecognition] Error:', event.error)
    if (onError) onError(event.error)
  }

  recognition.onend = () => {
    if (onEnd) onEnd()
  }

  return recognition
}
