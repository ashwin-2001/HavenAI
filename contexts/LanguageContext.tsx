"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { Language } from "@/types"

import en from "@/messages/en.json"
import pt from "@/messages/pt.json"
import hi from "@/messages/hi.json"
import yo from "@/messages/yo.json"
import es from "@/messages/es.json"

const MESSAGES: Record<Language, typeof en> = { en, pt, hi, yo, es }
const STORAGE_KEY = "haven_lang"

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (path: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === "string" ? current : path
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null
    if (stored && ["en", "pt", "hi", "yo", "es"].includes(stored)) {
      setLangState(stored)
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
  }

  const t = (path: string, vars?: Record<string, string | number>): string => {
    const messages = MESSAGES[lang] as Record<string, unknown>
    let value = getNestedValue(messages, path)
    // fall back to English if key missing in current language
    if (value === path) {
      value = getNestedValue(MESSAGES.en as Record<string, unknown>, path)
    }
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v))
      })
    }
    return value
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
