"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Scale, Shield, MapPin, Gavel, BookOpen, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageToggle } from "@/components/LanguageToggle"
import { CitySkyline } from "@/components/CitySkyline"
import Image from "next/image"

export default function HomePage() {
  const { t } = useLanguage()
  const router = useRouter()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 relative z-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl border border-primary/30 backdrop-blur-sm">
            <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
            {t("common.appName")}
          </span>
        </div>
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-12 sm:px-6 z-10">
        <motion.div
          className="max-w-md mx-auto space-y-8"
          variants={container}
          initial="hidden"
          animate="show"
        >

          {/* Hero Section */}
          <motion.div variants={item} className="relative group cursor-pointer" onClick={() => router.push('/onboarding')}>
            <div className="hero-card transition-transform duration-500 group-hover:scale-[1.02]">
              <CitySkyline />
              <div className="hero-overlay" />
              <div className="hero-content">
                <div className="hero-badge backdrop-blur-md shadow-lg">
                  <MapPin size={12} />
                  New York City
                </div>
                <h1 className="hero-title drop-shadow-2xl">{t("common.appName")}</h1>
                <p className="hero-subtitle font-medium text-pink-100/90 text-lg max-w-[280px] mx-auto leading-relaxed">
                  {t("common.tagline")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Emergency Action */}
          <motion.div variants={item}>
            <button
              onClick={() => router.push("/emergency")}
              className="btn-emergency group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 animate-pulse" />
              <div className="relative flex items-center gap-3 z-10">
                <AlertTriangle className="h-6 w-6 animate-bounce" />
                <span>Emergency Help</span>
              </div>
            </button>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Lease Analysis Card */}
            <motion.div 
              variants={item}
              className="glass-card p-1 relative overflow-hidden group cursor-pointer"
              onClick={() => router.push("/lease")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-4 p-5 relative z-10">
                <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0">
                  <Image 
                    src="/images/lease-hero.png" 
                    alt="Lease Analysis" 
                    width={64} 
                    height={64} 
                    className="object-cover h-full w-full transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {t("home.leaseButtonTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("home.leaseButtonSubtitle")}
                  </p>
                </div>
                <div className="bg-white/5 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
            </motion.div>

            {/* Rights & Lawyer Row */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                variants={item}
                className="glass-card p-4 flex flex-col items-center text-center gap-3 group cursor-pointer hover:bg-card/80"
                onClick={() => router.push("/rights")}
              >
                <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5">
                  <BookOpen className="h-6 w-6 text-pink-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t("home.rightsLink")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Know your laws</p>
                </div>
              </motion.div>

              <motion.div 
                variants={item}
                className="glass-card p-4 flex flex-col items-center text-center gap-3 group cursor-pointer hover:bg-card/80"
                onClick={() => router.push("/lawyer")}
              >
                <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5">
                  <Gavel className="h-6 w-6 text-pink-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t("home.lawyerLink")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Find help</p>
                </div>
              </motion.div>
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  )
}
