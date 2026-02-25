"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Volume2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Language } from "@/types"

interface ListenButtonProps {
  text: string
  language?: Language
  className?: string
}

export function ListenButton({ text, language, className = "" }: ListenButtonProps) {
  const { t, lang } = useLanguage()
  const [loading, setLoading] = useState(false)

  async function handleListen() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: language ?? lang }),
      })
      if (!res.ok) throw new Error("Voice request failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => URL.revokeObjectURL(url)
      await audio.play()
    } catch {
      toast.error(t("common.errorText"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      onClick={handleListen}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{ minHeight: 44 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{t("common.listenButton")}</span>
    </motion.button>
  )
}
