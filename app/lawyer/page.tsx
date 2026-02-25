"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, CheckCircle, User, Gavel, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Language } from "@/types"
import { DisclaimerBadge } from "@/components/DisclaimerBadge"
import { LanguageToggle } from "@/components/LanguageToggle"
import Image from "next/image"

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "hi", label: "हिन्दी" },
  { value: "yo", label: "Yorùbá" },
]

const LAWYERS = [
  {
    name: "Maria Santos",
    specialty: "Housing & Immigration Law",
    languages: "Español, Português",
    borough: "Manhattan / Bronx",
    email: "mariasantos@example.com",
  },
  {
    name: "James Chen",
    specialty: "Tenant Rights",
    languages: "English, 普通话",
    borough: "Brooklyn / Queens",
    email: "jameschen@example.com",
  },
  {
    name: "Aisha Williams",
    specialty: "Housing Discrimination",
    languages: "English",
    borough: "All Boroughs",
    email: "aishawilliams@example.com",
  },
]

export default function LawyerPage() {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [preferredLang, setPreferredLang] = useState<Language>(lang)
  const [situation, setSituation] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Pre-fill from session
    const emergencyRaw = sessionStorage.getItem("haven_emergency_answers")
    const leaseSummary = sessionStorage.getItem("haven_lease_summary")
    if (leaseSummary) {
      setSituation(leaseSummary)
    } else if (emergencyRaw) {
      try {
        const a = JSON.parse(emergencyRaw)
        const parts: string[] = []
        if (a.locksChanged) parts.push("Locks were changed")
        if (a.outsideRightNow) parts.push("Currently locked out")
        if (a.belongingsRemoved) parts.push("Belongings removed")
        if (!a.hadWrittenNotice) parts.push("No written notice given")
        if (parts.length > 0) {
          setSituation(parts.join(". ") + ".")
        }
      } catch {
        // ignore
      }
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

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
          <Gavel className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="text-base font-bold text-foreground">{t("common.appName")}</span>
        </div>
        <LanguageToggle />
      </header>

      <div className="flex-1 px-4 pb-12 sm:px-6 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="mx-auto max-w-xl space-y-8 relative z-10">
          <motion.div
            className="text-center space-y-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30 shadow-lg shadow-pink-900/20">
              <Image 
                src="/images/lawyer-hero.png" 
                alt="Lawyer" 
                width={48} 
                height={48} 
                className="object-contain opacity-90"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground drop-shadow-lg">{t("lawyer.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">{t("lawyer.subtitle")}</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="glass-card flex flex-col items-center gap-6 p-10 text-center border-green-500/30 bg-green-500/5"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-900/20">
                  <CheckCircle className="h-10 w-10 text-green-400" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t("lawyer.submittedTitle")}</h2>
                  <p className="text-base text-muted-foreground max-w-sm mx-auto">{t("lawyer.submittedText")}</p>
                </div>
                <button
                  onClick={() => router.push("/")}
                  className="btn-primary mt-4"
                >
                  Return Home
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: 0.1 }}
              >
                {/* Situation */}
                <div className="space-y-2">
                  <label htmlFor="situation" className="text-sm font-medium text-foreground ml-1">
                    {t("lawyer.situationLabel")}
                  </label>
                  <div className="glass-card p-1">
                    <textarea
                      id="situation"
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                      rows={5}
                      className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Describe what happened..."
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground ml-1">
                    {t("lawyer.nameLabel")}
                  </label>
                  <div className="glass-card p-1">
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground ml-1">
                    {t("lawyer.emailLabel")}
                  </label>
                  <div className="glass-card p-1">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preferred language */}
                <div className="space-y-2">
                  <label htmlFor="lang-select" className="text-sm font-medium text-foreground ml-1">
                    {t("lawyer.languageLabel")}
                  </label>
                  <div className="glass-card p-1">
                    <select
                      id="lang-select"
                      value={preferredLang}
                      onChange={(e) => setPreferredLang(e.target.value as Language)}
                      className="w-full rounded-xl bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none [&>option]:bg-black [&>option]:text-white"
                    >
                      {LANGUAGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]"
                >
                  {t("lawyer.submitButton")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <div className="pt-4">
            <DisclaimerBadge />
          </div>

          {/* Lawyer profiles */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-foreground px-2">Trusted Attorneys</h3>
            <div className="grid gap-3">
              {LAWYERS.map((lawyer) => (
                <motion.div
                  key={lawyer.email}
                  className="glass-card flex items-start gap-4 p-5 hover:bg-card/80 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/20">
                    <User className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-base">{lawyer.name}</p>
                    <p className="text-sm text-pink-300/90 mt-0.5 font-medium">{lawyer.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-1">{lawyer.languages} · {lawyer.borough}</p>
                    <a
                      href={`mailto:${lawyer.email}`}
                      className="mt-2 inline-flex items-center text-xs font-bold text-primary hover:text-pink-300 hover:underline uppercase tracking-wider"
                    >
                      Contact Now
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
