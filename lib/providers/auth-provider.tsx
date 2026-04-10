"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/database/supabase/client";
import { checkMfaStatusClient } from "@/lib/actions/mfa/check-mfa-status";

// =====================================================
// 📋 Types
// =====================================================

type Role = {
  code: string;
  description: string | null;
  permissions: string[];
};

type UserProfile = {
  id: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  is_phone_verified: boolean;
  is_mfa_enabled: boolean;
  created_at: string | null;
};

type FullProfile = {
  profile: UserProfile;
  roles: Role[];
  permissions: string[];
  user: User | null;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: FullProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (code: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permission: string) => boolean;
};

// =====================================================
// 🔐 Context
// =====================================================

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export { useAuthContext as useAuth };

// =====================================================
// 🏗️ Provider
// =====================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── جلب البروفايل الكامل ──
  const refresh = useCallback(async () => {
    // Use getUser() which makes a network request and reads cookies
    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Get current session
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    setSession(currentSession);
    setUser(currentUser);

    try {
      const { data, error } = await supabase.rpc("get_user_full_profile");
      if (error) {
        console.error("Failed to fetch user profile:", error);
        setProfile(null);
      } else {
        // Check MFA status directly from Supabase Auth API
        const isMfaEnabled = await checkMfaStatusClient();

        // Merge MFA status into profile
        const profileData = normalizeProfile(data);
        profileData.profile.is_mfa_enabled = isMfaEnabled;
        profileData.user = currentUser;

        setProfile(profileData);
      }
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // ── تسجيل الخروج ──
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, [supabase]);

  // ── الاستماع لتغيرات المصادقة ──
  useEffect(() => {
    refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession) {
        refresh();
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh, supabase]);

  // ── دوال المساعدة ──
  const hasRole = useCallback(
    (code: string) => profile?.roles.some((r) => r.code === code) ?? false,
    [profile?.roles],
  );

  const hasPermission = useCallback(
    (permission: string) => profile?.permissions.includes(permission) ?? false,
    [profile?.permissions],
  );

  const hasAnyPermission = useCallback(
    (permission: string) => {
      if (!profile) return false;
      // التحقق من الصلاحية المطلقة
      if (profile.permissions.includes("*:*")) return true;
      return profile.permissions.includes(permission);
    },
    [profile?.permissions],
  );

  const value: AuthContextValue = {
    session,
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    refresh,
    signOut,
    hasRole,
    hasPermission,
    hasAnyPermission,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

// =====================================================
// 🔧 Normalize
// =====================================================

function normalizeProfile(raw: unknown): FullProfile {
  const d = raw as Record<string, unknown>;
  const p = (d.profile ?? {}) as Record<string, unknown>;

  return {
    profile: {
      id: (p.id as string | undefined) ?? null,
      email: (p.email as string | undefined) ?? null,
      first_name: (p.first_name as string | undefined) ?? null,
      last_name: (p.last_name as string | undefined) ?? null,
      full_name: (p.full_name as string | undefined) ?? null,
      avatar_url: (p.avatar_url as string | undefined) ?? null,
      phone_number: (p.phone_number as string | undefined) ?? null,
      is_phone_verified: (p.is_phone_verified as boolean | undefined) ?? false,
      is_mfa_enabled: false, // Will be set by checkMfaStatusClient
      created_at: (p.created_at as string | undefined) ?? null,
    },
    user: null,
    roles: Array.isArray(d.roles)
      ? d.roles.map((r: Record<string, unknown>) => ({
          code: (r.code as string) ?? "",
          description: (r.description as string | undefined) ?? null,
          permissions: Array.isArray(r.permissions)
            ? (r.permissions as string[])
            : [],
        }))
      : [],
    permissions: Array.isArray(d.permissions)
      ? (d.permissions as string[])
      : [],
  };
}
