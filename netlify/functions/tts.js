// ─────────────────────────────────────────────────────────────────────────────
// tts.js — Netlify Function: Secure ElevenLabs TTS Proxy
//
// The ElevenLabs API key lives only in process.env on the server.
// The browser never sees it — it only calls /.netlify/functions/tts.
// ─────────────────────────────────────────────────────────────────────────────

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1'

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    console.error('[tts] ELEVENLABS_API_KEY is not set in environment variables.')
    return { statusCode: 500, body: JSON.stringify({ error: 'TTS service is not configured.' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body.' }) }
  }

  const {
    text,
    voiceId = '21m00Tcm4TlvDq8ikWAM',
    stability = 0.55,
    similarityBoost = 0.75,
    speed = 0.85,
  } = body

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required field: text.' }) }
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
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
      const errText = await response.text()
      console.error(`[tts] ElevenLabs error ${response.status}:`, errText)
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `ElevenLabs error: ${response.status}` }),
      }
    }

    // Convert audio buffer to base64 so we can return it as JSON
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ audio: base64Audio }),
    }
  } catch (err) {
    console.error('[tts] Unexpected error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error.' }) }
  }
}
