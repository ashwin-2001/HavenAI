"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Shield, ExternalLink, ChevronLeft, Building2, GraduationCap, BookOpen } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { ListenButton } from "@/components/ListenButton"
import { LanguageToggle } from "@/components/LanguageToggle"
import Image from "next/image"

const RIGHTS_KEYS = [
  "rights.right1",
  "rights.right2",
  "rights.right3",
  "rights.right4",
  "rights.right5",
  "rights.right6",
  "rights.right7",
  "rights.right8",
  "rights.right9",
] as const

const INSTITUTIONAL_GUARANTORS = [
  { name: "Insurent", url: "https://www.insurent.com", note: "Accepts international students & immigrants" },
  { name: "TheGuarantors", url: "https://www.theguarantors.com", note: "No US credit history required" },
  { name: "Rhino", url: "https://www.sayrhino.com", note: "Alternative to cash security deposits" },
  { name: "Leap", url: "https://www.leapease.com", note: "For those without US income history" },
] as const

const RESOURCES = [
  { name: "Legal Aid NYC", url: "https://www.legalaidnyc.org", desc: "Free legal services" },
  { name: "NYC 311", url: "https://portal.311.nyc.gov", desc: "Report housing complaints" },
  { name: "HPD Online", url: "https://www1.nyc.gov/site/hpd/index.page", desc: "NYC Housing Preservation" },
  { name: "NYC Commission on Human Rights", url: "https://www.nyc.gov/site/cchr/index.page", desc: "Report discrimination" },
  { name: "HUD", url: "https://www.hud.gov", desc: "Federal housing assistance" },
] as const

export default function RightsPage() {
  const { t, lang } = useLanguage()
  const router = useRouter()

  const allRightsText = RIGHTS_KEYS.map((k) => t(k)).join(". ")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 relative z-20">
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={t("common.backButton")}
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="text-base font-bold text-foreground">{t("common.appName")}</span>
        </div>
        <LanguageToggle />
      </header>

      <div className="flex-1 px-4 pb-12 sm:px-6 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-40 right-10 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="mx-auto max-w-2xl space-y-8 relative z-10">
          {/* Hero Section */}
          <motion.div
            className="text-center space-y-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-500/30 shadow-lg shadow-pink-900/20">
              <Image 
                src="/images/rights-hero.png" 
                alt="Rights" 
                width={48} 
                height={48} 
                className="object-contain opacity-90"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground drop-shadow-lg">{t("rights.title")}</h1>
            <div className="glass-card p-4 max-w-lg mx-auto bg-card/40">
              <h2 className="text-xs font-bold text-pink-300 uppercase tracking-widest mb-2">{t("rights.missionTitle")}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("rights.missionText")}</p>
            </div>
          </motion.div>

          {/* Rights list */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            <div className="flex items-center justify-between gap-4 px-2">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {t("rights.rightsTitle")}
              </h2>
              <ListenButton text={allRightsText} language={lang} />
            </div>
            <div className="grid gap-3">
              {RIGHTS_KEYS.map((key, i) => (
                <motion.div
                  key={key}
                  className="glass-card flex items-start gap-4 p-5 hover:bg-card/80 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 + i * 0.05 }}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/20">
                    <Shield className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{t(key)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Institutional Guarantors box */}
          <motion.div
            className="space-y-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
          >
            <div className="flex items-center gap-2 px-2">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-bold text-foreground">Institutional Guarantors</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              If a landlord requires a US guarantor but you don&apos;t have one, these licensed companies will co-sign your lease for a fee. NYC landlords cannot legally refuse them once approved.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INSTITUTIONAL_GUARANTORS.map((g) => (
                <a
                  key={g.name}
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card flex flex-col p-4 transition-all hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02]"
                >
                  <span className="text-base font-bold text-primary">{g.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">{g.note}</span>
                </a>
              ))}
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-amber-100/90">
                  <strong className="text-amber-300 block mb-1">Scholarship, fellowship, or foreign income counts.</strong>
                  Under NYC law, landlords cannot reject you for having non-US income. Bring your award letter, foreign bank statement, or employer letter — these are legally valid proof of financial ability.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Privacy Promise box */}
          <motion.div
            className="rounded-xl border border-primary/30 bg-primary/5 p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
          >
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-foreground/90">{t("common.privacyPromise")}</p>
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div
            className="space-y-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-foreground px-2">{t("rights.resourcesTitle")}</h2>
            <div className="grid gap-3">
              {RESOURCES.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card flex items-center justify-between p-4 transition-all hover:bg-card/80 hover:scale-[1.01]"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
