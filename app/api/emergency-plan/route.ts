import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  openai,
  emergencyPlanSystemPrompt,
  EMERGENCY_PLAN_JSON_SCHEMA,
  extractResponseText,
} from "@/lib/openai"
import type { EmergencyPlanResult } from "@/types"

const MODEL = "gpt-4o-mini"

const answersSchema = z.object({
  hadWrittenNotice: z.boolean(),
  locksChanged: z.boolean(),
  belongingsRemoved: z.boolean(),
  outsideRightNow: z.boolean(),
  immigrationConcern: z.boolean().nullable(),
})

const inputSchema = z.object({
  // Structured answers (Q&A mode) OR free-text transcript (voice mode) — one must be present
  answers: answersSchema.optional(),
  transcript: z.string().min(1).max(2000).optional(),
  language: z.enum(["en", "pt", "hi", "yo", "es"]).default("en"),
  borough: z.string().default("New York City"),
}).refine((d) => d.answers !== undefined || d.transcript !== undefined, {
  message: "Either 'answers' or 'transcript' is required.",
})

// Runtime validation — matches EMERGENCY_PLAN_JSON_SCHEMA
// phoneNumber is a string (empty string "" when no number) so strict mode is satisfied
const emergencyPlanSchema = z.object({
  situationType: z.enum(["illegal_lockout", "eviction_notice", "harassment", "belongings_removed"]),
  urgency: z.enum(["immediate", "urgent", "standard"]),
  steps: z.array(
    z.object({
      order: z.number(),
      title: z.string(),
      detail: z.string(),
      phoneNumber: z.string(),
      isUrgent: z.boolean(),
    })
  ),
  rightsCard: z.string(),
  policeScript: z.string(),
  hotlines: z.array(
    z.object({
      name: z.string(),
      number: z.string(),
      hours: z.string(),
    })
  ),
})

const DISCLAIMER =
  "This is legal information, not legal advice. Consult a licensed attorney for advice specific to your situation."

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const inputResult = inputSchema.safeParse(body)
    if (!inputResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Invalid request body. Check that all answer fields are booleans.",
            retryable: false,
          },
        },
        { status: 400 }
      )
    }

    const { answers, transcript, language, borough } = inputResult.data

    // Build user message from either structured answers or free-text voice transcript
    const userMessage = transcript
      ? `
Tenant emergency situation — generate action plan:

Borough/Location: ${borough}
Tenant's own description (voice input): "${transcript}"

Based on what the tenant said, assess the situation and generate a complete emergency action plan.
If the tenant mentions being locked out or locked outside, treat that as locksChanged=true and outsideRightNow=true.
If they mention their belongings being removed, treat that as belongingsRemoved=true.
If they mention immigration concerns, visa worries, or fear of deportation, treat immigrationConcern=true.
If they do not mention a written notice, assume hadWrittenNotice=false.
`.trim()
      : `
Tenant emergency situation — generate action plan:

Borough/Location: ${borough}
Received written eviction notice before this happened: ${answers!.hadWrittenNotice}
Landlord changed locks or blocked entry: ${answers!.locksChanged}
Landlord removed belongings from unit: ${answers!.belongingsRemoved}
Currently locked outside right now: ${answers!.outsideRightNow}
Worried about immigration status: ${answers!.immigrationConcern ?? false}

Generate a complete emergency action plan based on these answers.
`.trim()

    // Call OpenAI Responses API with gpt-5-mini
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openai.responses as any).create({
      model: MODEL,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: userMessage,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "emergency_plan",
          strict: true,
          schema: EMERGENCY_PLAN_JSON_SCHEMA,
        },
      },
      store: false,
      instructions: emergencyPlanSystemPrompt(language),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawContent = extractResponseText((response as any).output ?? [])
    const parsedPlan = emergencyPlanSchema.parse(JSON.parse(rawContent))

    // Map empty-string phoneNumber to undefined for the EmergencyPlanResult type
    const result: EmergencyPlanResult = {
      ...parsedPlan,
      steps: parsedPlan.steps.map((step) => ({
        ...step,
        phoneNumber: step.phoneNumber || undefined,
      })),
      disclaimer: DISCLAIMER,
    }

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[emergency-plan] Error:", message)
    return NextResponse.json(
      {
        error: {
          code: "EMERGENCY_PLAN_FAILED",
          message: "Could not generate emergency plan. Please try again or call 311 for immediate assistance.",
          retryable: true,
        },
      },
      { status: 500 }
    )
  }
}
