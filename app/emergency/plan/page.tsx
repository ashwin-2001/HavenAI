"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Phone, Loader2, Camera, CheckCircle, Trash2, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { EmergencyAnswers, EmergencyPlanResult } from "@/types"
import { ActionStepCard } from "@/components/ActionStepCard"
import { RightsCard } from "@/components/RightsCard"
import { ListenButton } from "@/components/ListenButton"
import { DisclaimerBadge } from "@/components/DisclaimerBadge"

interface EvidencePhoto {
  dataUrl: string
  timestamp: string
  label: string
}

const PHOTO_LABELS: Record<string, string[]> = {
  en: ["Scene – locked door", "Landlord notice (if any)", "Belongings (if removed)", "Additional evidence"],
  es: ["Escena – puerta bloqueada", "Aviso del arrendador (si hay)", "Pertenencias (si fueron removidas)", "Evidencia adicional"],
  pt: ["Cena – porta bloqueada", "Aviso do proprietário (se houver)", "Pertences (se removidos)", "Evidência adicional"],
  hi: ["दृश्य – बंद दरवाजा", "मकान मालिक का नोटिस (यदि हो)", "सामान (यदि हटाया गया)", "अतिरिक्त साक्ष्य"],
  yo: ["Ibi – ilẹkun tí a tiì", "Ifitonileti onile (bí ó bá wà)", "Ohun-ini (tí a bá yọ)", "Ẹri afikun"],
}

export default function EmergencyPlanPage() {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [plan, setPlan] = useState<EmergencyPlanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [photos, setPhotos] = useState<EvidencePhoto[]>([])
  const cameraRef = useRef<HTMLInputElement>(null)
  const photoLabels = PHOTO_LABELS[lang] ?? PHOTO_LABELS.en

  const handlePhotoCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const now = new Date()
      const timestamp = now.toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true,
      })
      const label = photoLabels[photos.length] ?? `Photo ${photos.length + 1}`
      setPhotos((prev) => [
        ...prev,
        { dataUrl: reader.result as string, timestamp, label },
      ])
    }
    reader.readAsDataURL(file)
    // Reset input so the same file can be re-captured if needed
    e.target.value = ""
  }, [photos.length, photoLabels])

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }, [])

  useEffect(() => {
    async function fetchPlan() {
      try {
        const inputMode = sessionStorage.getItem("haven_input_mode") ?? "questions"
        const savedLang = sessionStorage.getItem("haven_lang") ?? lang
        const borough = sessionStorage.getItem("haven_borough") || "New York City"

        let body: Record<string, unknown>

        if (inputMode === "voice") {
          const transcript = sessionStorage.getItem("haven_voice_transcript")
          if (!transcript) {
            router.push("/emergency")
            return
          }
          body = { transcript, language: savedLang, borough }
        } else {
          const raw = sessionStorage.getItem("haven_emergency_answers")
          if (!raw) {
            router.push("/emergency")
            return
          }
          const answers: EmergencyAnswers = JSON.parse(raw)
          body = { answers, language: savedLang, borough }
        }

        const res = await fetch("/api/emergency-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error("API error")
        const data: EmergencyPlanResult = await res.json()
        setPlan(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPlan()
  }, [lang, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">{t("plan.subtitle")}</p>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <p className="text-lg text-muted-foreground">{t("common.errorText")}</p>
        <button
          onClick={() => router.push("/emergency")}
          className="btn-primary"
        >
          {t("common.retryButton")}
        </button>
      </div>
    )
  }

  const sortedSteps = [...plan.steps].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 relative z-20">
        <button
          onClick={() => router.push("/emergency")}
          className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={t("common.backButton")}
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">{t("common.appName")}</span>
        </div>
      </header>

      <div className="flex-1 px-4 pb-12 sm:px-6 relative">
        <div className="mx-auto max-w-2xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-foreground">{t("plan.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("plan.subtitle")}</p>
          </motion.div>

          {/* Action Steps */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.07 }}
          >
            {sortedSteps.map((step) => (
              <ActionStepCard key={step.order} step={step} />
            ))}
          </motion.div>

          {/* Rights Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.14 }}
          >
            <RightsCard text={plan.rightsCard} language={lang} />
          </motion.div>

          {/* Police Script */}
          <motion.div
            className="glass-card p-6 space-y-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.18 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground">{t("plan.policeScriptTitle")}</h2>
                <p className="text-xs text-muted-foreground mt-1">{t("plan.policeScriptSubtitle")}</p>
              </div>
              <ListenButton text={plan.policeScript} language={lang} />
            </div>
            <div className="rounded-xl bg-black/20 p-4 border border-white/5">
              <p className="text-sm leading-relaxed text-foreground font-medium">{plan.policeScript}</p>
            </div>
          </motion.div>

          {/* Hotlines */}
          {plan.hotlines && plan.hotlines.length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.22 }}
            >
              <h2 className="font-bold text-foreground px-2">{t("plan.hotlinesTitle")}</h2>
              <div className="grid gap-3">
                {plan.hotlines.map((hotline, i) => (
                  <div key={i} className="glass-card flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{hotline.name}</p>
                      <p className="text-xs text-muted-foreground">{hotline.hours}</p>
                    </div>
                    <a
                      href={`tel:${hotline.number}`}
                      className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/30 transition-colors"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {hotline.number}
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call Police */}
          <motion.a
            href={`tel:${t("plan.callPoliceNumber")}`}
            className="btn-emergency"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.26 }}
            whileTap={{ scale: 0.97 }}
          >
            <Phone className="h-6 w-6" aria-hidden="true" />
            {t("plan.callPoliceButton")}
          </motion.a>

          {/* Photo Documentation Tool */}
          <motion.div
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.3 }}
          >
            <div className="px-6 pt-5 pb-4 space-y-1">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="font-bold text-foreground">
                  {lang === "es" ? "Documenta la escena" :
                   lang === "pt" ? "Documente a cena" :
                   lang === "hi" ? "दृश्य का दस्तावेज़ीकरण करें" :
                   lang === "yo" ? "Ṣe igbasilẹ ibi náà" :
                   "Document the Scene"}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === "es" ? "Las fotos con marca de tiempo pueden usarse como evidencia en el Tribunal de Vivienda." :
                 lang === "pt" ? "Fotos com carimbo de data/hora podem ser usadas como evidência no Tribunal de Habitação." :
                 lang === "hi" ? "टाइमस्टैम्प वाली तस्वीरें हाउसिंग कोर्ट में सबूत के रूप में इस्तेमाल की जा सकती हैं।" :
                 lang === "yo" ? "Àwọn fọ́tò tí a samisi pẹ̀lú àkókò lè ṣe ẹ̀rí ní Ilé-ẹjọ́ Ibùgbé." :
                 "Timestamped photos can be used as evidence in Housing Court."}
              </p>
            </div>

            {/* Captured photos */}
            {photos.length > 0 && (
              <div className="px-6 pb-4 space-y-3">
                {photos.map((photo, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.dataUrl}
                      alt={photo.label}
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-green-400" aria-hidden="true" />
                        <p className="text-sm font-semibold text-foreground truncate">{photo.label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{photo.timestamp}</p>
                    </div>
                    <button
                      onClick={() => removePhoto(i)}
                      className="flex-shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-red-400 transition-colors"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Camera button */}
            <div className="px-6 pb-6">
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handlePhotoCapture}
                aria-label="Take evidence photo"
              />
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-sm font-bold text-primary transition-all hover:border-primary/70 hover:bg-primary/10 hover:scale-[1.01]"
              >
                <Camera className="h-5 w-5" aria-hidden="true" />
                {lang === "es" ? `Tomar foto ${photos.length + 1}` :
                 lang === "pt" ? `Tirar foto ${photos.length + 1}` :
                 lang === "hi" ? `फ़ोटो ${photos.length + 1} लें` :
                 lang === "yo" ? `Ya fọ́tò ${photos.length + 1}` :
                 `Take Photo ${photos.length + 1}`}
              </button>
              {photos.length > 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {lang === "es" ? `${photos.length} foto${photos.length !== 1 ? "s" : ""} capturada${photos.length !== 1 ? "s" : ""}` :
                   lang === "pt" ? `${photos.length} foto${photos.length !== 1 ? "s" : ""} capturada${photos.length !== 1 ? "s" : ""}` :
                   lang === "hi" ? `${photos.length} तस्वीर${photos.length !== 1 ? "ें" : ""} ली गई` :
                   lang === "yo" ? `${photos.length} fọ́tò tí a ya` :
                   `${photos.length} photo${photos.length !== 1 ? "s" : ""} captured`}
                </p>
              )}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <DisclaimerBadge />

          {/* Lawyer CTA */}
          <button
            onClick={() => router.push("/lawyer")}
            className="btn-secondary w-full border-primary/30 text-primary hover:bg-primary/10"
          >
            {t("plan.lawyerCTA")}
          </button>

          <div className="pb-6" />
        </div>
      </div>
    </div>
  )
}
