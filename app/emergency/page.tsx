"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Mic, MicOff, Square, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useUserProfile } from "@/contexts/UserProfileContext"
import type { EmergencyAnswers } from "@/types"
import Image from "next/image"

const TOTAL_STEPS = 5

const ANSWER_KEYS: (keyof EmergencyAnswers)[] = [
  "hadWrittenNotice",
  "locksChanged",
  "belongingsRemoved",
  "outsideRightNow",
  "immigrationConcern",
]

const QUESTION_KEYS = ["emergency.q1", "emergency.q2", "emergency.q3", "emergency.q4", "emergency.q5"]

// ISO language codes for ElevenLabs STT hint
const LANG_TO_ISO: Record<string, string> = {
  en: "en", es: "es", pt: "pt", hi: "hi", yo: "yo",
}

type VoiceState = "idle" | "requesting" | "recording" | "processing" | "transcript" | "error"

export default function EmergencyPage() {
  const { t, lang } = useLanguage()
  const { profile } = useUserProfile()
  const router = useRouter()

  // ── Questions mode ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Partial<EmergencyAnswers>>({})

  // ── Tab mode ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"questions" | "speak">("questions")

  // ── Voice mode state ────────────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [transcript, setTranscript] = useState("")
  const [editedTranscript, setEditedTranscript] = useState("")
  const [voiceError, setVoiceError] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const progress = ((step) / TOTAL_STEPS) * 100

  // ── Questions mode handlers ─────────────────────────────────────────────────
  function handleAnswer(value: boolean | null) {
    const key = ANSWER_KEYS[step]
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)
    setDirection(1)

    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1)
    } else {
      const final: EmergencyAnswers = {
        hadWrittenNotice: (newAnswers.hadWrittenNotice as boolean) ?? false,
        locksChanged: (newAnswers.locksChanged as boolean) ?? false,
        belongingsRemoved: (newAnswers.belongingsRemoved as boolean) ?? false,
        outsideRightNow: (newAnswers.outsideRightNow as boolean) ?? false,
        immigrationConcern: (newAnswers.immigrationConcern as boolean | null) ?? null,
      }
      sessionStorage.setItem("haven_emergency_answers", JSON.stringify(final))
      sessionStorage.setItem("haven_input_mode", "questions")
      sessionStorage.setItem("haven_lang", lang)
      sessionStorage.setItem("haven_borough", profile.borough ?? "")
      router.push("/emergency/plan")
    }
  }

  function handleBack() {
    if (step === 0) {
      router.push("/")
      return
    }
    setDirection(-1)
    setStep((s) => s - 1)
  }

  // ── Voice mode handlers ─────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setVoiceError("")
    setVoiceState("requesting")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Pick the best supported format
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        // Stop all mic tracks
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null

        setVoiceState("processing")

        try {
          const blob = new Blob(chunksRef.current, { type: mimeType })
          const form = new FormData()
          form.append("audio", blob, "recording.webm")
          const isoCode = LANG_TO_ISO[lang] ?? "en"
          form.append("language_code", isoCode)

          const res = await fetch("/api/stt", { method: "POST", body: form })
          const data = await res.json()

          if (!res.ok || data.error) {
            throw new Error(data.error?.message ?? "Transcription failed")
          }

          setTranscript(data.transcript)
          setEditedTranscript(data.transcript)
          setVoiceState("transcript")
        } catch (err) {
          setVoiceError(err instanceof Error ? err.message : t("emergency.voiceMicError"))
          setVoiceState("error")
        }
      }

      recorder.start()
      setVoiceState("recording")
    } catch {
      setVoiceError(t("emergency.voiceMicError"))
      setVoiceState("error")
    }
  }, [lang, t])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const resetVoice = useCallback(() => {
    // Clean up any active stream
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
    chunksRef.current = []
    setVoiceState("idle")
    setTranscript("")
    setEditedTranscript("")
    setVoiceError("")
  }, [])

  function handleVoiceSubmit() {
    const text = editedTranscript.trim()
    if (!text) return
    sessionStorage.setItem("haven_voice_transcript", text)
    sessionStorage.setItem("haven_input_mode", "voice")
    sessionStorage.setItem("haven_lang", lang)
    sessionStorage.setItem("haven_borough", profile.borough ?? "")
    router.push("/emergency/plan")
  }

  const isImmigrationQuestion = step === 4

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar — questions mode only */}
      {activeTab === "questions" && (
        <div className="relative h-1.5 w-full bg-secondary/30">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-pink-500"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 relative z-10">
        <button
          onClick={activeTab === "questions" ? handleBack : () => router.push("/")}
          className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ minHeight: 44, minWidth: 44 }}
          aria-label={t("common.backButton")}
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-md" role="tablist">
          {(["questions", "speak"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => { setActiveTab(tab); resetVoice() }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                activeTab === tab
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {tab === "questions" ? t("emergency.tabQuestions") : t("emergency.tabSpeak")}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait">

            {/* ── Questions tab ─────────────────────────────────────────── */}
            {activeTab === "questions" && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="mb-8 flex justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-600/20 flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-900/20">
                    <Image 
                      src="/images/emergency-hero.png" 
                      alt="Emergency" 
                      width={48} 
                      height={48} 
                      className="object-contain opacity-90"
                    />
                  </div>
                </div>

                <p className="mb-6 text-center text-sm font-medium text-pink-200/70 uppercase tracking-widest">
                  {t("emergency.progressLabel", { current: step + 1, total: TOTAL_STEPS })}
                </p>

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={{ x: direction * 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -40, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-8"
                  >
                    <h2 
                      className="text-center font-bold text-foreground drop-shadow-lg"
                      style={{ fontSize: "1.75rem", lineHeight: 1.3, maxWidth: 340, margin: "0 auto" }}
                    >
                      {t(QUESTION_KEYS[step])}
                    </h2>

                    <div className="flex flex-col gap-4">
                      <motion.button
                        onClick={() => handleAnswer(true)}
                        className="glass-card flex w-full items-center justify-center px-6 font-bold text-white transition-all hover:bg-primary/20 hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                        style={{ minHeight: 80, fontSize: "1.25rem" }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {t("common.yesButton")}
                      </motion.button>

                      <motion.button
                        onClick={() => handleAnswer(false)}
                        className="glass-card flex w-full items-center justify-center px-6 font-bold text-white transition-all hover:bg-secondary/40 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                        style={{ minHeight: 80, fontSize: "1.25rem" }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {t("common.noButton")}
                      </motion.button>

                      {isImmigrationQuestion && (
                        <motion.button
                          onClick={() => handleAnswer(null)}
                          className="mt-2 flex w-full items-center justify-center rounded-xl border border-white/5 px-6 font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                          style={{ minHeight: 56, fontSize: "0.9375rem" }}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {t("emergency.preferNotToSay")}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Speak tab ─────────────────────────────────────────────── */}
            {activeTab === "speak" && (
              <motion.div
                key="speak"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-8 text-center"
              >
                {/* idle / requesting */}
                {(voiceState === "idle" || voiceState === "requesting") && (
                  <>
                    <div className="space-y-4">
                      <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/30 shadow-xl shadow-primary/10">
                        <Mic className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{t("emergency.voiceTitle")}</h2>
                        <p className="mt-2 text-base text-muted-foreground max-w-xs mx-auto">{t("emergency.voiceSubtitle")}</p>
                      </div>
                    </div>

                    <motion.button
                      onClick={startRecording}
                      disabled={voiceState === "requesting"}
                      className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-600 shadow-xl shadow-primary/40 transition-all hover:scale-105 hover:shadow-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:scale-100"
                      whileTap={{ scale: 0.95 }}
                      aria-label={t("emergency.voiceStartButton")}
                    >
                      <Mic className="h-12 w-12 text-white" aria-hidden="true" />
                    </motion.button>
                    <p className="text-sm font-medium text-pink-200/80 uppercase tracking-widest">{t("emergency.voiceStartButton")}</p>
                  </>
                )}

                {/* recording */}
                {voiceState === "recording" && (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{t("emergency.voiceRecording")}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{t("emergency.voiceSubtitle")}</p>
                    </div>

                    {/* Pulsing ring animation */}
                    <div className="mx-auto relative flex h-32 w-32 items-center justify-center">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-red-500/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute inset-4 rounded-full bg-red-500/30"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                      />
                      <button
                        onClick={stopRecording}
                        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/40 hover:scale-105 transition-transform"
                        aria-label="Stop recording"
                      >
                        <Square className="h-10 w-10 text-white fill-white" aria-hidden="true" />
                      </button>
                    </div>

                    <p className="text-lg font-medium text-red-400 animate-pulse">
                      {t("emergency.voiceRecording")}...
                    </p>
                  </>
                )}

                {/* processing */}
                {voiceState === "processing" && (
                  <>
                    <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary/10 bg-primary/5">
                      <motion.div
                        className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                    </div>
                    <p className="text-lg font-medium text-foreground">{t("emergency.voiceProcessing")}</p>
                  </>
                )}

                {/* transcript confirmation */}
                {voiceState === "transcript" && (
                  <div className="space-y-6 text-left w-full">
                    <p className="text-center text-lg font-semibold text-foreground">
                      {t("emergency.voiceTranscriptTitle")}
                    </p>
                    <div className="glass-card p-1">
                      <textarea
                        value={editedTranscript}
                        onChange={(e) => setEditedTranscript(e.target.value)}
                        rows={6}
                        className="w-full rounded-xl bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed"
                        aria-label="Edit transcript if needed"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <motion.button
                        onClick={handleVoiceSubmit}
                        disabled={!editedTranscript.trim()}
                        className="btn-primary w-full text-lg"
                        whileTap={{ scale: 0.98 }}
                      >
                        {t("emergency.voiceContinueButton")}
                      </motion.button>
                      <button
                        onClick={resetVoice}
                        className="btn-secondary w-full"
                      >
                        {t("emergency.voiceRetryButton")}
                      </button>
                    </div>
                  </div>
                )}

                {/* error */}
                {voiceState === "error" && (
                  <div className="space-y-6">
                    <div className="glass-card border-red-500/30 bg-red-500/10 p-6 rounded-2xl">
                      <div className="flex flex-col items-center gap-3 text-red-400">
                        <MicOff className="h-8 w-8" aria-hidden="true" />
                        <p className="text-base font-medium text-center">{voiceError || t("emergency.voiceMicError")}</p>
                      </div>
                    </div>
                    <button
                      onClick={resetVoice}
                      className="btn-secondary w-full"
                    >
                      {t("emergency.voiceRetryButton")}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
