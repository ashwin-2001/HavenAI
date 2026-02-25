"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { AlertTriangle } from "lucide-react"

interface EmergencyButtonProps {
  onClick: () => void
}

export function EmergencyButton({ onClick }: EmergencyButtonProps) {
  const { t } = useLanguage()

  return (
    <motion.button
      onClick={onClick}
      className="btn-emergency group relative overflow-hidden flex flex-col items-center justify-center gap-1 px-6 py-4"
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 animate-pulse" />
      <div className="relative z-10 flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 animate-bounce" aria-hidden="true" />
        <span className="text-xl font-bold">{t("home.emergencyButtonTitle")}</span>
      </div>
      <span className="relative z-10 text-sm font-medium opacity-90">{t("home.emergencyButtonSubtitle")}</span>
    </motion.button>
  )
}
