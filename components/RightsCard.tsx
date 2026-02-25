"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"
import { ListenButton } from "@/components/ListenButton"
import type { Language } from "@/types"

interface RightsCardProps {
  text: string
  language: Language
}

export function RightsCard({ text, language }: RightsCardProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("common.errorText"))
    }
  }

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-card p-5 space-y-4">
      <h3 className="text-base font-semibold text-foreground">{t("plan.rightsCardTitle")}</h3>
      <p
        className="leading-relaxed text-foreground"
        style={{ fontSize: "1.25rem", minHeight: 0 }}
      >
        {text}
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <ListenButton text={text} language={language} />
        <motion.button
          onClick={handleShare}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ minHeight: 44 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--haven-safe)]" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {t("plan.shareRightsCard")}
        </motion.button>
      </div>
    </div>
  )
}
