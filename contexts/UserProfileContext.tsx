"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface UserProfile {
  borough: string
  isImmigrant: boolean | null
}

const DEFAULT_PROFILE: UserProfile = { borough: "", isImmigrant: null }
const STORAGE_KEY = "haven_profile"

interface UserProfileContextValue {
  profile: UserProfile
  setProfile: (p: Partial<UserProfile>) => void
  clearProfile: () => void
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null)

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserProfile>
        setProfileState({ ...DEFAULT_PROFILE, ...parsed })
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  const setProfile = (updates: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  const clearProfile = () => {
    setProfileState(DEFAULT_PROFILE)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <UserProfileContext.Provider value={{ profile, setProfile, clearProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext)
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider")
  return ctx
}
