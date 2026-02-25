"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Clause } from "@/types"

interface RedFlagCardProps {
  clause: Clause
}

function RatingBadge({ rating }: { rating: Clause["rating"] }) {
  const { t } = useLanguage()
  const labels = {
    green: t("results.clauseGreen"),
    yellow: t("results.clauseYellow"),
    red: t("results.clauseRed"),
  }
  const classes = {
    green: "badge-safe",
    yellow: "badge-warning",
    red: "badge-danger",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes[rating]}`}>
      {labels[rating]}
    </span>
  )
}

export function RedFlagCard({ clause }: RedFlagCardProps) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)

  const leftBorderClass =
    clause.rating === "red"
      ? "card-red-flag"
      : clause.rating === "yellow"
      ? "card-warning-flag"
      : ""

  return (
    <div className={`rounded-xl border border-border bg-card ${leftBorderClass} overflow-hidden`}>
      <button
        className="flex w-full items-start gap-3 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ minHeight: 44 }}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <RatingBadge rating={clause.rating} />
            <span className="text-sm font-semibold text-foreground">{clause.title}</span>
          </div>
          <p className="text-sm text-muted-foreground">{clause.explanation}</p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-0.5 flex-shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 pb-5 pt-4 space-y-3">
              <blockquote className="rounded-lg bg-secondary/50 border-l-2 border-border px-4 py-3">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  &ldquo;{clause.originalText}&rdquo;
                </p>
              </blockquote>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  {t("results.legalBasisLabel")}
                </p>
                <p className="text-sm text-foreground">{clause.legalBasis}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  {t("results.actionLabel")}
                </p>
                <p className="text-sm text-foreground">{clause.recommendedAction}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
