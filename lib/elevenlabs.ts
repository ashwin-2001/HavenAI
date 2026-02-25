// ElevenLabs TTS helper — server-side only.
// The API key is accessed only through env (imported from lib/env.ts).
// This file is the single source of ElevenLabs integration.
// The /api/voice route is the ONLY caller of this module.
import { env, VOICE_IDS } from "./env"

const ELEVENLABS_TTS_BASE = "https://api.elevenlabs.io/v1/text-to-speech"
const MODEL_ID = "eleven_multilingual_v2"
// ElevenLabs free tier is 10k chars/month. Cap each request at 4500 chars
// to leave buffer for retries and keep sentence boundaries intact.
const MAX_CHARS = 4500

export async function ttsStream(
  text: string,
  language: string
): Promise<ReadableStream<Uint8Array>> {
  const voiceId = VOICE_IDS[language] ?? VOICE_IDS["en"]

  const trimmedText =
    text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + "..." : text

  const response = await fetch(`${ELEVENLABS_TTS_BASE}/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: trimmedText,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `ElevenLabs API error ${response.status}: ${errorText}`
    )
  }

  if (!response.body) {
    throw new Error("ElevenLabs returned empty response body")
  }

  return response.body
}
