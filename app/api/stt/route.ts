// Speech-to-text proxy using ElevenLabs Scribe API.
// Accepts an audio blob (multipart form), returns the transcript.
// The ElevenLabs API key never leaves the server.
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"

const ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"
// Maximum audio size: 10 MB (ElevenLabs free-tier limit)
const MAX_AUDIO_BYTES = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get("audio")
    const languageCode = (formData.get("language_code") as string | null) ?? undefined

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { error: { code: "MISSING_AUDIO", message: "audio field is required.", retryable: false } },
        { status: 400 }
      )
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: { code: "AUDIO_TOO_LARGE", message: "Audio file exceeds 10 MB limit.", retryable: false } },
        { status: 413 }
      )
    }

    // Build multipart request to ElevenLabs STT
    const elevenlabsForm = new FormData()
    elevenlabsForm.append("file", audio, "recording.webm")
    elevenlabsForm.append("model_id", "scribe_v1")
    if (languageCode) {
      elevenlabsForm.append("language_code", languageCode)
    }

    const response = await fetch(ELEVENLABS_STT_URL, {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
      },
      body: elevenlabsForm,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[stt] ElevenLabs error:", response.status, errorText)
      return NextResponse.json(
        {
          error: {
            code: "STT_FAILED",
            message: "Speech transcription failed. Please try speaking again.",
            retryable: true,
          },
        },
        { status: 502 }
      )
    }

    const data = await response.json() as { text?: string; language_code?: string }
    const transcript = data.text?.trim() ?? ""

    if (!transcript) {
      return NextResponse.json(
        {
          error: {
            code: "NO_SPEECH",
            message: "No speech detected. Please try speaking again.",
            retryable: true,
          },
        },
        { status: 422 }
      )
    }

    return NextResponse.json({ transcript, detectedLanguage: data.language_code ?? null })
  } catch (error) {
    console.error("[stt] Error:", error)
    return NextResponse.json(
      {
        error: {
          code: "STT_ERROR",
          message: "Transcription unavailable. Please try the questions instead.",
          retryable: true,
        },
      },
      { status: 500 }
    )
  }
}
