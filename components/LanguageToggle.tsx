"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Language } from "@/types"
import { Check, Globe } from "lucide-react"

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
  { code: "yo", flag: "🇳🇬", label: "Yorùbá" },
]

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass-card flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl"
            role="listbox"
          >
            <div className="p-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  role="option"
                  aria-selected={l.code === lang}
                  onClick={() => {
                    setLang(l.code)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    l.code === lang
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  <span className="text-lg leading-none">{l.flag}</span>
                  <span className="flex-1 text-left">{l.label}</span>
                  {l.code === lang && (
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
