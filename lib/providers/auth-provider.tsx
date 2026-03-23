"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react"
import type { User, Session } from "@supabase/supabase-js"
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
// AuthProvider - Optimized Production Version
// ─────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [error, setError] = useState<string | null>(null)

  // Use a ref to track the latest profile fetch to avoid race conditions
  const lastFetchId = useRef<string | null>(null)
  const supabase = useMemo(() => createBrowserClient(), [])

  /**
   * Fetch Profile with Optimized Error Handling and Race Condition Protection
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const currentFetchId = Math.random().toString(36).substring(7)
      lastFetchId.current = currentFetchId

      try {
        // Parallelize or optimize: Try RPC first as it's usually faster and returns all data in one go
        const { data, error: rpcError } = await supabase.rpc(
          "get_current_user_data"
        )

        // If this isn't the latest fetch, ignore it
        if (lastFetchId.current !== currentFetchId) return null

        if (!rpcError && data?.[0]) {
          return data[0] as Profile
        }

        // Fallback: direct table query (only if RPC fails)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (lastFetchId.current !== currentFetchId) return null

        if (profileError) {
          setError(profileError.message)
          return null
        }

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
      } catch (e: unknown) {
        setError("An unknown error occurred during profile fetch.")
        return null
      }
    },
    [supabase]
  )

  /**
   * Unified Auth State Handler
   */
  const handleAuthStateChange = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        setUser(null)
        setProfile(null)
        setStatus("unauthenticated")
        return
      }

      const currentUser = session.user
      setUser(currentUser)
      setStatus("authenticated")

      // Fetch profile in background without blocking UI
      const p = await fetchProfile(currentUser.id)
      if (p) {
        setProfile(p)
        setError(null)
      } else {
        setError("لم يتم تحميل بيانات البروفايل")
      }
    },
    [fetchProfile]
  )

  /**
   * Initialization and Subscription
   */
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      // 1. Check initial session (fastest way)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (session) {
        // 2. If session exists, handle it and verify user in background
        await handleAuthStateChange(session)

        // Optional: verify with server in background to ensure session is still valid
        supabase.auth.getUser().then(({ data: { user: verifiedUser } }) => {
          if (mounted && !verifiedUser) {
            handleAuthStateChange(null)
          }
        })
      } else {
        setStatus("unauthenticated")
      }
    }

    initialize()

    // 3. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        handleAuthStateChange(session)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, handleAuthStateChange])

  /**
   * Actions
   */
  const signOut = useCallback(async () => {
    // Optimistic UI update
    setUser(null)
    setProfile(null)
    setStatus("unauthenticated")
    setError(null)

    await supabase.auth.signOut()
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id)
      if (p) {
        setProfile(p)
        setError(null)
      }
    }
  }, [user, fetchProfile])

  /**
   * Permission Helpers (Memoized for performance)
   */
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

  const value = useMemo(
    () => ({
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
    }),
    [
      user,
      profile,
      status,
      error,
      signOut,
      refreshProfile,
      hasPermission,
      hasRole,
      hasActivePlan,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
