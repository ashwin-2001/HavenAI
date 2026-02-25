import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PDFParse } from "pdf-parse"
import mammoth from "mammoth"
import {
  openai,
  leaseAnalysisSystemPrompt,
  LEASE_ANALYSIS_JSON_SCHEMA,
  extractResponseText,
} from "@/lib/openai"
import { lookupHpdViolations } from "@/lib/hpd"
import { checkAcris } from "@/lib/acris-mock"
import type { LeaseAnalysisResult, HpdViolation } from "@/types"

const MODEL = "gpt-4o-mini"

// Runtime validation schema — used to validate the model's JSON output
const clauseSchema = z.object({
  id: z.string(),
  title: z.string(),
  originalText: z.string(),
  rating: z.enum(["green", "yellow", "red"]),
  explanation: z.string(),
  legalBasis: z.string(),
  recommendedAction: z.string(),
})

const leaseAnalysisSchema = z.object({
  summary: z.string(),
  immigrantNote: z.string(),
  clauses: z.array(clauseSchema),
})

const inputSchema = z.object({
  language: z.enum(["en", "pt", "hi", "yo", "es"]).default("en"),
  isImmigrant: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  address: z.string().optional(),
})

const DISCLAIMER =
  "This is legal information, not legal advice. Consult a licensed attorney for advice specific to your situation."

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: { code: "MISSING_FILE", message: "A lease file (PDF or image) is required.", retryable: false } },
        { status: 400 }
      )
    }

    // Validate other fields — language defaults to "en" on invalid input
    const rawInput = {
      language: formData.get("language") ?? "en",
      isImmigrant: formData.get("isImmigrant") ?? "false",
      address: formData.get("address") ?? undefined,
    }
    const inputResult = inputSchema.safeParse(rawInput)
    if (!inputResult.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Invalid request parameters.", retryable: false } },
        { status: 400 }
      )
    }

    const { language, address } = inputResult.data

    // Extract text from lease — entirely in memory, never written to disk
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type || ""
    const fileName = (file as File).name ?? ""

    let leaseText: string | null = null
    let base64DataUrl: string | null = null

    const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")
    const isDocx =
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.toLowerCase().endsWith(".docx")
    const isDoc = mimeType === "application/msword" || fileName.toLowerCase().endsWith(".doc")
    const isImage = mimeType.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)

    if (isPdf) {
      // pdf-parse v2: new PDFParse({ data: buffer }) then getText()
      const parser = new PDFParse({ data: fileBuffer })
      const parsed = await parser.getText()
      leaseText = parsed.text?.trim() ?? ""
      if (!leaseText) {
        throw new Error("PDF appears to be empty or image-only. Try uploading a photo of each page instead.")
      }
    } else if (isDocx) {
      // mammoth extracts clean text from .docx files
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      leaseText = result.value?.trim() ?? ""
      if (!leaseText) {
        throw new Error("DOCX file appears to be empty. Try saving as PDF and uploading again.")
      }
    } else if (isDoc) {
      // Old .doc format — mammoth handles it but with lower fidelity
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      leaseText = result.value?.trim() ?? ""
      if (!leaseText) {
        throw new Error("Could not read .doc file. Try saving as PDF or DOCX and uploading again.")
      }
    } else if (isImage) {
      // Image — send to model as base64 vision input
      const b64 = fileBuffer.toString("base64")
      base64DataUrl = `data:${mimeType || "image/jpeg"};base64,${b64}`
    } else {
      // Unknown format — attempt mammoth as fallback, then error
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer })
        leaseText = result.value?.trim() ?? ""
      } catch {
        // ignore
      }
      if (!leaseText) {
        throw new Error(`Unsupported file type: ${mimeType || fileName}. Please upload a PDF, DOCX, or image.`)
      }
    }

    // Build the Responses API input — text path or vision path
    // Using the exact structure from the OpenAI Responses API spec
    type ContentPart =
      | { type: "input_text"; text: string }
      | { type: "input_image"; image_url: string; detail?: string }

    const userContent: ContentPart[] =
      leaseText !== null
        ? [
            { type: "input_text", text: leaseText },
          ]
        : [
            {
              type: "input_image",
              image_url: base64DataUrl!,
              detail: "high",
            },
            {
              type: "input_text",
              text: "Please analyze this lease document image and extract all significant clauses.",
            },
          ]

    // Call OpenAI Responses API with gpt-5-mini and structured JSON output
    // Schema defined as plain object (not Zod-converted) for maximum compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openai.responses as any).create({
      model: MODEL,
      input: [
        {
          role: "user",
          content: userContent,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "lease_analysis",
          strict: true,
          schema: LEASE_ANALYSIS_JSON_SCHEMA,
        },
      },
      store: false,
      instructions: leaseAnalysisSystemPrompt(language),
    })

    // Extract text from Responses API output array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawContent = extractResponseText((response as any).output ?? [])

    // Runtime-validate the model's output with Zod
    const parsedResult = leaseAnalysisSchema.parse(JSON.parse(rawContent))

    // Run HPD + ACRIS lookups in parallel — both gracefully degrade on failure
    const lookupAddress = address ?? ""
    const [hpdResult, acrisResult] = await Promise.all([
      lookupHpdViolations(lookupAddress),
      Promise.resolve(checkAcris(lookupAddress)),
    ])

    const hpdOpenViolations: HpdViolation[] = hpdResult.violations.filter(
      (v) => v.currentstatus?.toLowerCase() === "open"
    )

    const reportSource: "live" | "mock" | "unavailable" =
      hpdResult.source === "live" ? "live" : acrisResult.source

    const result: LeaseAnalysisResult = {
      ...parsedResult,
      landlordReport: {
        acrisOwner: acrisResult.acrisOwner,
        acrisMismatch: acrisResult.acrisMismatch,
        acrisMismatchDetail: acrisResult.acrisMismatchDetail,
        hpdViolations: hpdResult.openCount,
        hpdOpenViolations,
        source: reportSource,
        warning: hpdResult.warning,
      },
      disclaimer: DISCLAIMER,
    }

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[analyze-lease] Error:", message)
    return NextResponse.json(
      {
        error: {
          code: "ANALYSIS_FAILED",
          message: message.includes("PDF") ? message : "Lease analysis failed. Please try again or upload a different file.",
          retryable: true,
        },
      },
      { status: 500 }
    )
  }
}
