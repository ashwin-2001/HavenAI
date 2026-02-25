import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { UserProfileProvider } from "@/contexts/UserProfileContext"
import { Toaster } from "@/components/ui/sonner"
import { PrivacyFooter } from "@/components/PrivacyFooter"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "HavenAI — Know Your Rights. Protect Your Home.",
  description:
    "AI-powered legal protection for immigrant renters in New York City. Analyze your lease, get emergency guidance, and connect with trusted attorneys — in your language.",
  keywords: ["tenant rights", "NYC renters", "immigrant rights", "lease analysis", "lockout help"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <LanguageProvider>
          <UserProfileProvider>
            {children}
            <PrivacyFooter />
            <Toaster richColors position="top-center" />
          </UserProfileProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
