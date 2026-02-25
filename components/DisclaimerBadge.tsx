"use client"

import { ShieldAlert } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function DisclaimerBadge() {
  const { t } = useLanguage()

  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-card/50 px-4 py-3">
      <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-xs leading-5 text-muted-foreground">{t("common.disclaimer")}</p>
    </div>
  )
}
