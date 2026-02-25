"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, Camera, FileText, X, Shield, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useUserProfile } from "@/contexts/UserProfileContext"
import { LanguageToggle } from "@/components/LanguageToggle"
import Image from "next/image"

export default function LeasePage() {
  const { t, lang } = useLanguage()
  const { profile } = useUserProfile()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [address, setAddress] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((f: File) => {
    setFile(f)
  }, [])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  async function handleSubmit() {
    if (!file) return
    // Store file as base64 in sessionStorage for results page
    const reader = new FileReader()
    reader.onload = () => {
      sessionStorage.setItem("haven_lease_file_name", file.name)
      sessionStorage.setItem("haven_lease_file_type", file.type)
      sessionStorage.setItem("haven_lease_file_b64", reader.result as string)
      sessionStorage.setItem("haven_lease_address", address)
      sessionStorage.setItem("haven_lang", lang)
      sessionStorage.setItem("haven_is_immigrant", String(profile.isImmigrant ?? false))
      sessionStorage.setItem("haven_borough", profile.borough ?? "")
      router.push("/lease/results")
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 relative z-20">
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={t("common.backButton")}
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="text-base font-bold text-foreground">{t("common.appName")}</span>
        </div>
        <LanguageToggle />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-40 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="w-full max-w-xl space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center"
          >
            <div className="mx-auto mb-6 h-24 w-24 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center border border-pink-500/30 shadow-lg shadow-pink-900/20">
              <Image 
                src="/images/lease-hero.png" 
                alt="Lease Analysis" 
                width={56} 
                height={56} 
                className="object-contain opacity-90"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground drop-shadow-lg mb-2">{t("lease.uploadTitle")}</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">{t("lease.uploadSubtitle")}</p>
          </motion.div>

          {/* Drop zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            {file ? (
              <div className="glass-card p-6 flex items-center gap-4 border-primary/30 bg-primary/5">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <FileText className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`glass-card group cursor-pointer flex flex-col items-center justify-center gap-4 p-10 text-center transition-all duration-300 border-2 border-dashed ${
                  dragOver
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-white/10 hover:border-primary/50 hover:bg-card/80"
                }`}
                role="button"
                tabIndex={0}
                aria-label="Upload lease file"
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                <div className="h-16 w-16 rounded-full bg-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5">
                  <Upload className="h-8 w-8 text-pink-300" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{t("lease.dropZoneText")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("lease.dropZoneOr")} <span className="text-primary font-medium hover:underline">{t("lease.uploadFileButton")}</span></p>
                </div>
                <p className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  PDF, DOC, DOCX, JPG, PNG
                </p>
              </div>
            )}

            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={onFileChange}
              className="sr-only"
              aria-hidden="true"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFileChange}
              className="sr-only"
              aria-hidden="true"
            />
          </motion.div>

          {/* Camera button */}
          {!file && (
            <motion.button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-base font-medium text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground hover:border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
              whileTap={{ scale: 0.98 }}
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
              {t("lease.photoButton")}
            </motion.button>
          )}

          {/* Address field */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
          >
            <label htmlFor="address" className="text-sm font-medium text-foreground ml-1">
              {t("lease.addressLabel")}
            </label>
            <div className="glass-card p-1">
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("lease.addressPlaceholder")}
                className="w-full rounded-xl bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </motion.div>

          {/* Analyze button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!file}
            className="btn-primary w-full text-lg shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.25 }}
            whileTap={file ? { scale: 0.98 } : {}}
          >
            {t("lease.analyzeButton")}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
