"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Phone } from "lucide-react"
import type { ActionStep } from "@/types"

interface ActionStepCardProps {
  step: ActionStep
}

export function ActionStepCard({ step }: ActionStepCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border bg-card overflow-hidden ${step.isUrgent ? "border-[var(--haven-danger)]/40" : "border-border"}`}>
      <button
        className="flex w-full items-start gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ minHeight: 44 }}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            step.isUrgent
              ? "bg-[var(--haven-danger)] text-white"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {step.order}
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{step.title}</span>
          {step.isUrgent && (
            <span className="text-xs font-medium text-[var(--haven-danger)]">Urgent</span>
          )}
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
            <div className="border-t border-border px-5 pb-5 pt-3 space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
              {step.phoneNumber && (
                <a
                  href={`tel:${step.phoneNumber}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ minHeight: 44 }}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {step.phoneNumber}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
