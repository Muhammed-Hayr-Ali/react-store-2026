"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type RoleInfo = {
  role_id: string
  role_name: string
  description: string | null
  permissions: string[]
  is_active: boolean
  granted_at: string
}

export type PlanInfo = {
  plan_id: string
  plan_name: string
  category: "seller" | "delivery" | "customer"
  price: number
  billing_period: string
  permissions: Record<string, boolean>
  status: "active" | "expired" | "cancelled" | "pending" | "trial"
  start_date: string
  end_date: string | null
  trial_end_date: string | null
}

export type Profile = {
  user_id: string
  email: string
  provider: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  phone: string | null
  phone_verified: boolean
  avatar_url: string | null
  bio: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
  last_sign_in_at: string
  roles: RoleInfo[]
  role_names: string[]
  role_permissions: string[]
  plans: PlanInfo[]
  active_plan_name: string | null
  active_plan_status: string | null
  plan_permissions: Record<string, boolean>
  all_permissions: string[]
  has_active_role: boolean
  has_active_plan: boolean
  is_fully_setup: boolean
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  status: AuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (roleName: string) => boolean
  hasActivePlan: (planName?: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─────────────────────────────────────────────────────
// AuthProvider - Secure, Minimal & Fast
// ─────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  // ───────────────────────────────────────────────────
  // Fetch Profile - Simple & Direct
  // ───────────────────────────────────────────────────
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // Try secure RPC function first
      const { data, error } = await supabase.rpc("get_current_user_data")
      
      if (!error && data?.[0]) {
        return data[0] as Profile
      }
      
      // Fallback: direct table query (minimal profile)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
      
      if (profileData) {
        return {
          ...profileData,
          roles: [], role_names: [], role_permissions: [],
          plans: [], active_plan_name: null, active_plan_status: null,
          plan_permissions: {}, all_permissions: [],
          has_active_role: false, has_active_plan: false, is_fully_setup: false,
        } as Profile
      }
    } catch {
      // Silent fail
    }
    return null
  }

  // ───────────────────────────────────────────────────
  // Verify & Load User - Always uses getUser() for security
  // ───────────────────────────────────────────────────
  const verifyAndLoadUser = async (): Promise<User | null> => {
    try {
      // ✅ SECURE: Always verify with server via getUser()
      const { data:  { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }
      
      return user
    } catch {
      return null
    }
  }

  // ───────────────────────────────────────────────────
  // Initialize Auth - Run Once on Mount
  // ───────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const init = async () => {
      // ✅ Always verify user with server (not from local storage)
      const verifiedUser = await verifyAndLoadUser()
      
      if (!mounted) return
      
      if (!verifiedUser) {
        setStatus("unauthenticated")
        return
      }

      setUser(verifiedUser)
      setStatus("authenticated")
      
      // Fetch profile in background (non-blocking)
      fetchProfile(verifiedUser.id).then((p) => {
        if (mounted) {
          setProfile(p)
          if (!p) setError("لم يتم تحميل البروفايل")
        }
      })
    }

    init()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (!mounted) return

      // ✅ On auth change, ALWAYS re-verify with getUser()
      // Never trust session.user directly from the event
      const verifiedUser = await verifyAndLoadUser()

      setUser(verifiedUser)
      setProfile(null)
      setError(null)
      setStatus(verifiedUser ? "authenticated" : "unauthenticated")

      if (verifiedUser) {
        fetchProfile(verifiedUser.id).then(setProfile)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // ───────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setError(null)
    setStatus("unauthenticated")
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id)
      setProfile(p)
      if (!p) setError("فشل تحديث البروفايل")
      else setError(null)
    }
  }

  // ───────────────────────────────────────────────────
  // Permission Helpers - Simple & Fast
  // ───────────────────────────────────────────────────

  const hasPermission = (permission: string) =>
    !!profile?.all_permissions?.includes(permission) ||
    !!profile?.all_permissions?.includes("*:*")

  const hasRole = (roleName: string) =>
    !!profile?.role_names?.includes(roleName)

  const hasActivePlan = (planName?: string) =>
    !!profile?.has_active_plan &&
    (!planName || profile.active_plan_name === planName)

  // ───────────────────────────────────────────────────
  // Context Value
  // ───────────────────────────────────────────────────

  const value = {
    user,
    profile,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    error,
    signOut,
    refreshProfile,
    hasPermission,
    hasRole,
    hasActivePlan,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}