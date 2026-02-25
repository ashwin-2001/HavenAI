"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Search, Home, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, Loader2, Download, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { LeaseAnalysisResult } from "@/types"
import { RedFlagCard } from "@/components/RedFlagCard"
import { ListenButton } from "@/components/ListenButton"
import { DisclaimerBadge } from "@/components/DisclaimerBadge"
import { LanguageToggle } from "@/components/LanguageToggle"

const STAGES = [
  { icon: FileText, key: "progress.stage1" },
  { icon: Search, key: "progress.stage2" },
  { icon: Home, key: "progress.stage3" },
  { icon: CheckCircle, key: "progress.stage4" },
] as const

function AnalysisProgress({ stage }: { stage: number }) {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-30 animate-pulse" />
      </div>

      <motion.div
        className="space-y-2 text-center relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-foreground">{t(STAGES[Math.min(stage, 3)].key)}</h1>
        <p className="text-sm text-muted-foreground">{t("progress.subtext")}</p>
      </motion.div>
      <div className="w-full max-w-xs space-y-4 relative z-10">
        {STAGES.map((s, i) => {
          const Icon = s.icon
          const isActive = i === stage
          const isDone = i < stage
          return (
            <motion.div
              key={i}
              className={`glass-card flex items-center gap-4 px-5 py-4 transition-all duration-300 ${
                isActive
                  ? "border-primary bg-primary/10 scale-105 shadow-lg shadow-primary/10"
                  : isDone
                  ? "border-green-500/30 bg-green-500/5 opacity-80"
                  : "border-white/5 bg-white/5 opacity-40"
              }`}
              animate={{ opacity: i <= stage ? (isActive ? 1 : 0.8) : 0.4 }}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isActive ? "bg-primary/20 text-primary" : isDone ? "bg-green-500/20 text-green-400" : "bg-white/10 text-muted-foreground"}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {t(s.key)}
              </span>
              {isActive && <Loader2 className="ml-auto h-4 w-4 animate-spin text-primary" aria-hidden="true" />}
              {isDone && <CheckCircle className="ml-auto h-4 w-4 text-green-400" aria-hidden="true" />}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function LeaseResultsPage() {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [result, setResult] = useState<LeaseAnalysisResult | null>(null)
  const [stage, setStage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [landlordExpanded, setLandlordExpanded] = useState(false)
  const stageRef = useRef(0)

  const downloadReport = () => {
    if (!result) return
    const ratingLabel = (r: string) =>
      r === "red" ? "⚠ LIKELY ILLEGAL" : r === "yellow" ? "⚡ REVIEW CAREFULLY" : "✓ STANDARD"

    const lines = [
      "HavenAI — Lease Analysis Report",
      `Generated: ${new Date().toLocaleString()}`,
      "─".repeat(60),
      "",
      "LEASE SUMMARY",
      result.summary,
      "",
      "WHAT THIS MEANS FOR YOU (IMMIGRANT RENTER NOTE)",
      result.immigrantNote,
      "",
      "─".repeat(60),
      "FLAGGED CLAUSES",
      "",
      ...result.clauses.map((c, i) =>
        [
          `${i + 1}. ${c.title}  [${ratingLabel(c.rating)}]`,
          `   Original: "${c.originalText}"`,
          `   Explanation: ${c.explanation}`,
          `   Legal basis: ${c.legalBasis}`,
          `   What to do: ${c.recommendedAction}`,
          "",
        ].join("\n")
      ),
      "─".repeat(60),
      "LANDLORD & PROPERTY REPORT",
      result.landlordReport.acrisOwner
        ? `Registered Owner (ACRIS): ${result.landlordReport.acrisOwner}`
        : "ACRIS ownership data: not available",
      result.landlordReport.acrisMismatch
        ? "⚠ SIGNATORY MISMATCH — person who signed may not be the registered owner"
        : "",
      `HPD Open Violations: ${result.landlordReport.hpdViolations}`,
      "",
      "─".repeat(60),
      "DISCLAIMER",
      result.disclaimer,
      "",
      "HavenAI — havenai.app",
    ]

    const text = lines.filter((l) => l !== undefined).join("\n")
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `HavenAI-Lease-Report-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    // Advance stage every 20s while loading
    const interval = setInterval(() => {
      if (stageRef.current < 3) {
        stageRef.current += 1
        setStage(stageRef.current)
      }
    }, 20000)

    async function fetchResults() {
      try {
        const b64 = sessionStorage.getItem("haven_lease_file_b64")
        const name = sessionStorage.getItem("haven_lease_file_name") ?? "lease.pdf"
        const type = sessionStorage.getItem("haven_lease_file_type") ?? "application/pdf"
        const address = sessionStorage.getItem("haven_lease_address") ?? ""
        const isImmigrant = sessionStorage.getItem("haven_is_immigrant") ?? "false"
        const borough = sessionStorage.getItem("haven_borough") ?? ""

        if (!b64) {
          router.push("/lease")
          return
        }

        // Convert base64 back to Blob
        const response = await fetch(b64)
        const blob = await response.blob()
        const file = new File([blob], name, { type })

        const formData = new FormData()
        formData.append("file", file)
        formData.append("address", address || borough)
        formData.append("language", lang)
        formData.append("isImmigrant", isImmigrant)

        stageRef.current = 1
        setStage(1)

        const res = await fetch("/api/analyze-lease", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) throw new Error("API error")
        const data: LeaseAnalysisResult = await res.json()

        stageRef.current = 3
        setStage(3)
        // Brief pause to show "Almost done..."
        await new Promise((r) => setTimeout(r, 800))
        setResult(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
    return () => clearInterval(interval)
  }, [lang, router])

  if (loading) return <AnalysisProgress stage={stage} />

  if (error || !result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Analysis Failed</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{t("common.errorText")}</p>
        </div>
        <button
          onClick={() => router.push("/lease")}
          className="btn-primary"
        >
          {t("common.retryButton")}
        </button>
      </div>
    )
  }

  // Sort: red → yellow → green
  const sortedClauses = [...result.clauses].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 }
    return order[a.rating] - order[b.rating]
  })

  const redCount = result.clauses.filter((c) => c.rating === "red").length
  const yellowCount = result.clauses.filter((c) => c.rating === "yellow").length
  const greenCount = result.clauses.filter((c) => c.rating === "green").length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 relative z-20">
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={t("common.backButton")}
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">{t("common.appName")}</span>
        </div>
        <LanguageToggle />
      </header>

      <div className="flex-1 px-4 pb-12 sm:px-6 relative">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Summary card */}
          <motion.div
            className="glass-card p-6 space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">{t("results.summaryTitle")}</h1>
              <ListenButton text={result.summary} language={lang} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
          </motion.div>

          {/* Immigrant note */}
          <motion.div
            className="rounded-xl border border-primary/30 bg-primary/5 p-6 backdrop-blur-sm"
            style={{ borderLeftWidth: 4, borderLeftColor: "var(--primary)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.07 }}
          >
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">{t("results.immigrantNoteTitle")}</h2>
            <p className="text-sm leading-relaxed text-foreground/90">{result.immigrantNote}</p>
          </motion.div>

          {/* Red flags section */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.14 }}
          >
            <div className="flex items-center gap-3 px-2">
              <h2 className="text-xl font-bold text-foreground">{t("results.redFlagsTitle")}</h2>
              <div className="flex items-center gap-2">
                {redCount > 0 && (
                  <span className="badge-danger inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm">{redCount}</span>
                )}
                {yellowCount > 0 && (
                  <span className="badge-warning inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm">{yellowCount}</span>
                )}
                {greenCount > 0 && (
                  <span className="badge-safe inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm">{greenCount}</span>
                )}
              </div>
            </div>

            {sortedClauses.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-base font-medium text-foreground">{t("results.noFlagsText")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedClauses.map((clause) => (
                  <RedFlagCard key={clause.id} clause={clause} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Landlord report (collapsible) */}
          <motion.div
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.21 }}
          >
            <button
              className="flex w-full items-center justify-between px-6 py-5 text-left focus-visible:outline-2 hover:bg-white/5 transition-colors"
              onClick={() => setLandlordExpanded((v) => !v)}
              aria-expanded={landlordExpanded}
            >
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">{t("results.landlordReportTitle")}</h2>
              </div>
              {landlordExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {landlordExpanded && (
                <motion.div
                  key="landlord"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/10 px-6 pb-6 pt-4 space-y-4 bg-black/20">
                    {result.landlordReport.source === "unavailable" && (
                      <p className="text-xs text-muted-foreground italic">{t("results.hpdUnavailable")}</p>
                    )}
                    {result.landlordReport.acrisMismatch && (
                      <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" aria-hidden="true" />
                        <p className="text-sm font-medium text-yellow-100">{t("results.acrisMismatchWarning")}</p>
                      </div>
                    )}
                    {result.landlordReport.acrisOwner && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Registered Owner</p>
                        <p className="text-base font-medium text-foreground">{result.landlordReport.acrisOwner}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">HPD Violations</p>
                      {result.landlordReport.hpdViolations === 0 ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <p className="text-sm font-medium">{t("results.hpdNoViolations")}</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-red-400 mb-3">
                            {t("results.hpdViolationsLabel", { count: result.landlordReport.hpdViolations })}
                          </p>
                          <div className="space-y-2">
                            {result.landlordReport.hpdOpenViolations.slice(0, 5).map((v) => (
                              <div key={v.violationid} className="rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                                <p className="text-sm font-medium text-foreground">{v.novdescription}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${v.class === 'I' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>Class {v.class}</span>
                                  <span className="text-xs text-muted-foreground">{v.inspectiondate}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Disclaimer */}
          <DisclaimerBadge />

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={downloadReport}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" aria-hidden="true" />
              {t("results.downloadReport")}
            </button>

            <button
              onClick={() => router.push("/lawyer")}
              className="btn-primary w-full shadow-xl shadow-primary/20"
            >
              {t("results.talkToLawyerButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
