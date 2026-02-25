"use client"

import { useLanguage } from "@/contexts/LanguageContext"

export function PrivacyFooter() {
  const { t } = useLanguage()

  return (
    <footer className="privacy-footer" role="contentinfo">
      {t("common.privacyPromise")}
    </footer>
  )
}
