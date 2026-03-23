'use client'


import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
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
// AuthProvider - Secure Production Version
// ✅ Always uses getUser() - never trusts session.user directly
// ─────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  // ───────────────────────────────────────────────────
  // 🔐 SECURE: Always verify user with server via getUser()
  // Never use session.user directly - it comes from local storage
  // ───────────────────────────────────────────────────
  const getVerifiedUser = useCallback(async (): Promise<User | null> => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError) {
        // console.error("Supabase Auth Error (getUser):", authError.message)
        setError(authError.message)
        return null
      }
      setError(null)
      return user
    } catch (e: unknown) {
      if (e instanceof Error) {
        // console.error("Unexpected error during getUser:", e.message)
        setError(e.message)
      } else {
        // console.error("Unexpected error during getUser:", e)
        setError("An unknown error occurred during user verification.")
      }
      return null
    }
  }, [supabase])

  // ───────────────────────────────────────────────────
  // Fetch Profile - Simple & Direct
  // ───────────────────────────────────────────────────
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        // Try secure RPC function first
        const { data, error: rpcError } = await supabase.rpc(
          "get_current_user_data"
        )
        if (!rpcError && data?.[0]) {
          setError(null)
          return data[0] as Profile
        }
        if (rpcError) {
          // console.warn(
          //   "RPC \'get_current_user_data\' failed, falling back to direct query:",
          //   rpcError.message
          // )
        }

        // Fallback: direct table query
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (profileError) {
          // console.error("Supabase Profile Fetch Error:", profileError.message)
          setError(profileError.message)
          return null
        }

        if (profileData) {
          setError(null)
          return {
            ...profileData,
            roles: [],
            role_names: [],
            role_permissions: [],
            plans: [],
            active_plan_name: null,
            active_plan_status: null,
            plan_permissions: {},
            all_permissions: [],
            has_active_role: false,
            has_active_plan: false,
            is_fully_setup: false,
          } as Profile
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          // console.error("Unexpected error during fetchProfile:", e.message)
          setError(e.message)
        } else {
          // console.error("Unexpected error during fetchProfile:", e)
          setError("An unknown error occurred during profile fetch.")
        }
      }
      return null
    },
    [supabase]
  )

  // ───────────────────────────────────────────────────
  // Initialize Auth - Run Once on Mount
  // ───────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      // ✅ SECURE: Verify user with server on initial load
      const verifiedUser = await getVerifiedUser()

      if (!mounted) return

      if (!verifiedUser) {
        setStatus("unauthenticated")
        setUser(null)
        setProfile(null)
        return
      }

      setUser(verifiedUser)
      setStatus("authenticated")

      // Fetch profile in background
      fetchProfile(verifiedUser.id).then((p) => {
        if (mounted) {
          setProfile(p)
          if (!p) setError("لم يتم تحميل البروفايل")
        }
      })
    }

    initializeAuth() // Call the async function

    // ─────────────────────────────────────────────────
    // Subscribe to auth state changes
    // ✅ SECURE: Always re-verify with getUser(), never use session.user
    // ─────────────────────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      if (!mounted) return

      // 🔐 CRITICAL FIX:
      // Never use _session?.user here - it\'s from local storage!
      // Always call getUser() to verify with Supabase Auth server
      const verifiedUser = await getVerifiedUser()

      setUser(verifiedUser)
      setProfile(null) // Clear profile, will refetch below
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
  }, [supabase, getVerifiedUser, fetchProfile]) // Added dependencies

  // ───────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    // Update UI state optimistically, then confirm with backend
    setUser(null)
    setProfile(null)
    setError(null)
    setStatus("unauthenticated")
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      // console.error("Supabase SignOut Error:", signOutError.message)
      setError(signOutError.message)
      // Optionally, revert UI state if signOut fails critically
      // For simplicity, we assume signOut is generally reliable
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id)
      setProfile(p)
      if (!p) setError("فشل تحديث البروفايل")
      else setError(null)
    }
  }, [user, fetchProfile])

  // ───────────────────────────────────────────────────
  // Permission Helpers - Simple & Fast
  // ───────────────────────────────────────────────────

  const hasPermission = useCallback(
    (permission: string) =>
      !!profile?.all_permissions?.includes(permission) ||
      !!profile?.all_permissions?.includes("*:*"),
    [profile]
  )

  const hasRole = useCallback(
    (roleName: string) => !!profile?.role_names?.includes(roleName),
    [profile]
  )

  const hasActivePlan = useCallback(
    (planName?: string) =>
      !!profile?.has_active_plan &&
      (!planName || profile.active_plan_name === planName),
    [profile]
  )

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
