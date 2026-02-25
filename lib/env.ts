import { z } from "zod"

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  ELEVENLABS_API_KEY: z.string().min(1, "ELEVENLABS_API_KEY is required"),
  ELEVENLABS_VOICE_ID_EN: z.string().min(1, "ELEVENLABS_VOICE_ID_EN is required"),
  ELEVENLABS_VOICE_ID_PT: z.string().min(1, "ELEVENLABS_VOICE_ID_PT is required"),
  ELEVENLABS_VOICE_ID_HI: z.string().min(1, "ELEVENLABS_VOICE_ID_HI is required"),
  ELEVENLABS_VOICE_ID_YO: z.string().min(1, "ELEVENLABS_VOICE_ID_YO is required"),
})

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.message).join("\n  ")
    throw new Error(
      `\n\n[HavenAI] Missing required environment variables:\n  ${missing}\n\nCopy .env.local.example to .env.local and fill in the values.\n`
    )
  }
  return result.data
}

export const env = validateEnv()

export const VOICE_IDS: Record<string, string> = {
  en: env.ELEVENLABS_VOICE_ID_EN,
  pt: env.ELEVENLABS_VOICE_ID_PT,
  hi: env.ELEVENLABS_VOICE_ID_HI,
  yo: env.ELEVENLABS_VOICE_ID_YO,
}
