"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react"
import { createClient } from "@/lib/supabase/createClient"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types/profile"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  status: AuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PROFILE_FETCH_RETRIES = 3
const PROFILE_FETCH_RETRY_DELAY = 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const supabase = createClient()
  const isProfileFetchingRef = useRef(false)

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const fetchProfileWithRetry = useCallback(
    async (userId: string): Promise<Profile | null> => {
      for (let attempt = 1; attempt <= PROFILE_FETCH_RETRIES; attempt++) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single()

          if (error || !data) {
            if (attempt === PROFILE_FETCH_RETRIES) {
              console.error("Error fetching profile after retries:", error)
              return null
            }
            await delay(PROFILE_FETCH_RETRY_DELAY * attempt)
            continue
          }

          return data as Profile
        } catch (error) {
          if (attempt === PROFILE_FETCH_RETRIES) {
            console.error("Fetch profile error after retries:", error)
            return null
          }
          await delay(PROFILE_FETCH_RETRY_DELAY * attempt)
        }
      }
      return null
    },
    [supabase]
  )

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. التحقق من صحة المستخدم مباشرة مع Supabase Auth Server
        const {
          data: { user: authenticatedUser },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !authenticatedUser) {
          // لا يوجد مستخدم مصادق عليه
          setStatus("unauthenticated")
          return
        }

        setUser(authenticatedUser)

        if (!isProfileFetchingRef.current) {
          isProfileFetchingRef.current = true
          try {
            const profileData = await fetchProfileWithRetry(
              authenticatedUser.id
            )
            setProfile(profileData)
          } finally {
            isProfileFetchingRef.current = false
          }
        }

        setStatus("authenticated")
      } catch (error) {
        console.error("Error initializing auth:", error)
        setStatus("unauthenticated")
      } finally {
        setStatus((prev) => (prev === "loading" ? "unauthenticated" : prev))
      }
    }

    void initializeAuth()
  }, [supabase, fetchProfileWithRetry])
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setStatus("unauthenticated")
  }

  const refreshProfile = async () => {
    if (user && !isProfileFetchingRef.current) {
      isProfileFetchingRef.current = true
      try {
        const profileData = await fetchProfileWithRetry(user.id)
        setProfile(profileData)
      } finally {
        isProfileFetchingRef.current = false
      }
    }
  }

  const value = {
    user,
    profile,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
