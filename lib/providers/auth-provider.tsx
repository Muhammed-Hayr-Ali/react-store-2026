"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"

// ─────────────────────────────────────────────────────
// Types - Match the RPC function return type
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
  // Basic Profile Fields
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

  // Roles Data
  roles: RoleInfo[]
  role_names: string[]
  role_permissions: string[]

  // Plans Data
  plans: PlanInfo[]
  active_plan_name: string | null
  active_plan_status: string | null
  plan_permissions: Record<string, boolean>

  // Combined Permissions
  all_permissions: string[]

  // Setup Status
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
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  // Permission helpers
  hasPermission: (permission: string) => boolean
  hasRole: (roleName: string) => boolean
  hasActivePlan: (planName?: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────

const PROFILE_FETCH_RETRIES = 3
const PROFILE_FETCH_RETRY_DELAY = 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const supabase = createBrowserClient()
  const isProfileFetchingRef = useRef(false)

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  // ───────────────────────────────────────────────────
  // Fetch Profile Using Secure RPC Function
  // ───────────────────────────────────────────────────
  const fetchProfileWithRetry =
    useCallback(async (): Promise<Profile | null> => {
      for (let attempt = 1; attempt <= PROFILE_FETCH_RETRIES; attempt++) {
        try {
          // ✅ SECURE: Uses get_my_complete_data() - no user_id parameter
          // This function internally uses auth.uid() for security
          console.log(
            `[AuthProvider] Calling get_my_complete_data() - attempt ${attempt}`
          )
          const { data, error } = await supabase.rpc("get_my_complete_data")

          if (error) {
            console.error(
              `[AuthProvider] RPC Error (attempt ${attempt}):`,
              JSON.stringify(error, null, 2)
            )
          }

          if (error || !data || (Array.isArray(data) && data.length === 0)) {
            console.warn(`[AuthProvider] Fetch attempt ${attempt} failed:`, {
              error: error ?? "No error object",
              hasData: !!data,
              dataLength: Array.isArray(data) ? data.length : "N/A",
            })

            if (attempt === PROFILE_FETCH_RETRIES) {
              console.error(
                "[AuthProvider] Error fetching profile after retries:",
                {
                  error,
                  message:
                    "RPC function may not exist or RLS policy blocks access",
                  hint: "Run the SQL file in Supabase SQL Editor: supabase/02_profiles/user_data_functions_secure/user_data_functions_secure.sql",
                }
              )
              return null
            }
            await delay(PROFILE_FETCH_RETRY_DELAY * attempt)
            continue
          }

          // ⚠️ RPC returns TABLE (array), get first row
          const rpcResult = Array.isArray(data) ? data[0] : data

          if (!rpcResult) {
            console.warn(`[AuthProvider] No data in RPC response`)
            if (attempt === PROFILE_FETCH_RETRIES) {
              return null
            }
            await delay(PROFILE_FETCH_RETRY_DELAY * attempt)
            continue
          }

          console.log(
            `[AuthProvider] RPC response received for user:`,
            rpcResult.user_id
          )

          // Transform RPC response to Profile type
          const profileData: Profile = {
            // Basic fields
            user_id: rpcResult.user_id,
            email: rpcResult.email,
            provider: rpcResult.provider,
            first_name: rpcResult.first_name,
            last_name: rpcResult.last_name,
            full_name: rpcResult.full_name,
            phone: rpcResult.phone,
            phone_verified: rpcResult.phone_verified,
            avatar_url: rpcResult.avatar_url,
            bio: rpcResult.bio,
            email_verified: rpcResult.email_verified,
            created_at: rpcResult.created_at,
            updated_at: rpcResult.updated_at,
            last_sign_in_at: rpcResult.last_sign_in_at,

            // Roles - parse JSONB
            roles: (rpcResult.roles as RoleInfo[]) || [],
            role_names: rpcResult.role_names || [],
            role_permissions: (rpcResult.role_permissions as string[]) || [],

            // Plans - parse JSONB
            plans: (rpcResult.plans as PlanInfo[]) || [],
            active_plan_name: rpcResult.active_plan_name,
            active_plan_status: rpcResult.active_plan_status,
            plan_permissions:
              (rpcResult.plan_permissions as Record<string, boolean>) || {},

            // Combined permissions
            all_permissions: (rpcResult.all_permissions as string[]) || [],

            // Setup status
            has_active_role: rpcResult.has_active_role,
            has_active_plan: rpcResult.has_active_plan,
            is_fully_setup: rpcResult.is_fully_setup,
          }

          return profileData
        } catch (error) {
          console.warn(`[AuthProvider] Fetch attempt ${attempt} error:`, error)

          if (attempt === PROFILE_FETCH_RETRIES) {
            console.error(
              "[AuthProvider] Fetch profile error after retries:",
              error
            )
            return null
          }
          await delay(PROFILE_FETCH_RETRY_DELAY * attempt)
        }
      }
      return null
    }, [supabase])

  // ───────────────────────────────────────────────────
  // Initialize Auth & Fetch Profile
  // ───────────────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[useAuth] Initializing auth...")

        // 1. Check authenticated user with Supabase Auth
        const {
          data: { user: authenticatedUser },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !authenticatedUser) {
          console.log("[useAuth] No authenticated user")
          setStatus("unauthenticated")
          return
        }

        setUser(authenticatedUser)
        console.log("[useAuth] User set:", authenticatedUser.id)

        // 2. Fetch profile using secure RPC function
        if (!isProfileFetchingRef.current) {
          isProfileFetchingRef.current = true
          try {
            console.log("[useAuth] Fetching profile via RPC...")
            const profileData = await fetchProfileWithRetry()
            console.log("[useAuth] Profile fetched:", profileData?.email)
            setProfile(profileData)
          } finally {
            isProfileFetchingRef.current = false
          }
        }

        setStatus("authenticated")
        console.log("[useAuth] Auth initialized successfully")
      } catch (error) {
        console.error("[useAuth] Error initializing auth:", error)
        setStatus("unauthenticated")
      } finally {
        setStatus((prev) => (prev === "loading" ? "unauthenticated" : prev))
      }
    }

    void initializeAuth()

    // 3. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state changed:", event, session?.user?.id)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setStatus("authenticated")

        if (!isProfileFetchingRef.current) {
          isProfileFetchingRef.current = true
          try {
            const profileData = await fetchProfileWithRetry()
            setProfile(profileData)
          } finally {
            isProfileFetchingRef.current = false
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setStatus("unauthenticated")
      } else if (session?.user) {
        setUser(session.user)
        setStatus("authenticated")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfileWithRetry])

  // ───────────────────────────────────────────────────
  // Sign Out
  // ───────────────────────────────────────────────────
  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setStatus("unauthenticated")
    await supabase.auth.signOut()
  }

  // ───────────────────────────────────────────────────
  // Refresh Profile
  // ───────────────────────────────────────────────────
  const refreshProfile = async () => {
    if (!isProfileFetchingRef.current) {
      isProfileFetchingRef.current = true
      try {
        const profileData = await fetchProfileWithRetry()
        setProfile(profileData)
      } finally {
        isProfileFetchingRef.current = false
      }
    }
  }

  // ───────────────────────────────────────────────────
  // Permission Helper Functions
  // ───────────────────────────────────────────────────

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!profile?.all_permissions) return false
      // Check exact match or wildcard
      return (
        profile.all_permissions.includes(permission) ||
        profile.all_permissions.includes("*:*")
      )
    },
    [profile]
  )

  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!profile?.role_names) return false
      return profile.role_names.includes(roleName)
    },
    [profile]
  )

  const hasActivePlan = useCallback(
    (planName?: string): boolean => {
      if (!profile?.has_active_plan) return false
      if (!planName) return true
      return profile.active_plan_name === planName
    },
    [profile]
  )

  // ───────────────────────────────────────────────────
  // Context Value
  // ───────────────────────────────────────────────────
  const value = {
    user,
    profile,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signOut,
    refreshProfile,
    // Permission helpers
    hasPermission,
    hasRole,
    hasActivePlan,
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
