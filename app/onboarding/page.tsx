"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Shield, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useUserProfile } from "@/contexts/UserProfileContext"
import type { Language } from "@/types"

const LANGUAGES: { code: Language; flag: string; nativeLabel: string }[] = [
  { code: "en", flag: "🇺🇸", nativeLabel: "English" },
  { code: "es", flag: "🇪🇸", nativeLabel: "Español" },
  { code: "pt", flag: "🇧🇷", nativeLabel: "Português" },
  { code: "hi", flag: "🇮🇳", nativeLabel: "हिन्दी" },
  { code: "yo", flag: "🇳🇬", nativeLabel: "Yorùbá" },
]

const BOROUGHS = [
  { key: "boroughManhattan", value: "Manhattan" },
  { key: "boroughBrooklyn", value: "Brooklyn" },
  { key: "boroughQueens", value: "Queens" },
  { key: "boroughBronx", value: "The Bronx" },
  { key: "boroughStaten", value: "Staten Island" },
  { key: "boroughOther", value: "" },
] as const

export default function OnboardingPage() {
  const { t, setLang, lang } = useLanguage()
  const { setProfile } = useUserProfile()
  const router = useRouter()

  const [step, setStep] = useState<0 | 1>(0)
  const [selected, setSelected] = useState<Language>(lang)
  const [borough, setBorough] = useState<string>("")
  const [isImmigrant, setIsImmigrant] = useState<boolean | null>(null)

  function handleLanguageContinue() {
    setLang(selected)
    setStep(1)
  }

  function handleProfileContinue() {
    setProfile({ borough, isImmigrant })
    router.push("/")
  }

  function handleSkip() {
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center gap-3 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-pink-600/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
            <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">{t("common.appName")}</h1>
            <p className="text-xs font-medium text-pink-300/80 uppercase tracking-widest mt-1">
              {t("onboarding.step", { current: step + 1, total: 2 })}
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">{t("onboarding.title")}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("onboarding.subtitle")}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {LANGUAGES.map((l) => {
                  const isSelectedLang = selected === l.code
                  return (
                    <motion.button
                      key={l.code}
                      onClick={() => setSelected(l.code)}
                      className={`glass-card flex flex-col items-center justify-center gap-3 p-4 text-center transition-all duration-200 hover:scale-[1.02] ${
                        isSelectedLang
                          ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/50"
                          : "hover:bg-card/80 text-muted-foreground"
                      }`}
                      style={{ minHeight: 110 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="text-4xl filter drop-shadow-md" aria-hidden="true">{l.flag}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{l.nativeLabel}</span>
                        <AnimatePresence>
                          {isSelectedLang && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                            >
                              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <motion.button
                onClick={handleLanguageContinue}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/20"
                whileTap={{ scale: 0.98 }}
              >
                {t("common.continueButton")}
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">{t("onboarding.profileTitle")}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("onboarding.profileSubtitle")}</p>
              </div>

              {/* Borough selection */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground ml-1">{t("onboarding.boroughLabel")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {BOROUGHS.map(({ key, value }) => {
                    const label = t(`onboarding.${key}`)
                    const actualValue = value || label
                    const isSelected = borough === actualValue
                    return (
                      <motion.button
                        key={key}
                        onClick={() => setBorough(isSelected ? "" : actualValue)}
                        className={`glass-card flex items-center justify-center px-3 py-3 text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/50"
                            : "hover:bg-card/80 text-muted-foreground"
                        }`}
                        style={{ minHeight: 52 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Immigrant status */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground ml-1">{t("onboarding.immigrantLabel")}</p>
                <div className="flex gap-3">
                  {[
                    { label: t("common.yesButton"), value: true },
                    { label: t("common.noButton"), value: false },
                  ].map(({ label, value }) => {
                    const isSelected = isImmigrant === value
                    return (
                      <motion.button
                        key={label}
                        onClick={() => setIsImmigrant(isSelected ? null : value)}
                        className={`glass-card flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/50"
                            : "hover:bg-card/80 text-muted-foreground"
                        }`}
                        style={{ minHeight: 56 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <motion.button
                  onClick={handleProfileContinue}
                  className="btn-primary w-full text-lg shadow-xl shadow-primary/20"
                  whileTap={{ scale: 0.98 }}
                >
                  {t("common.continueButton")}
                </motion.button>
                <button
                  onClick={handleSkip}
                  className="btn-secondary w-full"
                >
                  {t("onboarding.skipButton")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
