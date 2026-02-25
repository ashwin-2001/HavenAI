// Voice TTS proxy — the ONLY place ElevenLabs is called.
// The ElevenLabs API key never leaves the server.
// Client receives audio/mpeg stream directly.
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ttsStream } from "@/lib/elevenlabs"

const inputSchema = z.object({
  text: z.string().min(1).max(5000),
  language: z.enum(["en", "pt", "hi", "yo", "es"]).default("en"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const inputResult = inputSchema.safeParse(body)
    if (!inputResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "text is required (max 5000 chars) and language must be en/pt/hi/yo.",
            retryable: false,
          },
        },
        { status: 400 }
      )
    }

    const { text, language } = inputResult.data

    const audioStream = await ttsStream(text, language)

    return new NextResponse(audioStream, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[voice] Error:", error)
    return NextResponse.json(
      {
        error: {
          code: "TTS_FAILED",
          message: "Voice synthesis unavailable. Please try again later.",
          retryable: true,
        },
      },
      { status: 503 }
    )
  }
}
