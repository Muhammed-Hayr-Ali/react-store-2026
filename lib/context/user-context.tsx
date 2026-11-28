"use client"

/**
 * @file lib/context/user-context.tsx
 * @description Current user, permissions, and auth-state synchronization.
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/database/supabase/client"
import type { CurrentUser } from "../actions/users/queries/get-current-user"

/** بيانات المستخدم الجاهزة للعرض. */
export type FormattedUser = {
  /** معرف المستخدم. */
  id: string
  /** الاسم الكامل، أو الجزء الأول من البريد، أو `User`. */
  name: string
  /** حرفان للصورة الرمزية: أول حرف من أول كلمتين، أو أول حرفين من الاسم المفرد. */
  initials: string
  /** البريد الكامل، مثل `name@example.com`. نص فارغ إذا لم يوجد. */
  email: string
  /** البريد بصيغة `@name`. نص فارغ إذا لم يوجد بريد. */
  username: string
  /** مسار الصورة الشخصية أو الصورة الافتراضية. */
  avatar: string
  /** دور المستخدم. */
  role: string
}

interface UserContextType {
  /** بيانات المستخدم كما وردت من الخادم، أو `null` للزائر. */
  rawUser: CurrentUser | null
  /** بيانات المستخدم منسقة للعرض، أو `null` للزائر. */
  user: FormattedUser | null
  /** صلاحيات المستخدم الحالي. */
  permissions: string[]
  /**
   * هل يملك المستخدم الصلاحية؟
   * **لإظهار عناصر الواجهة وإخفائها فقط**؛ يجب التحقق من الصلاحية في الخادم أيضاً.
   *
   * @param permission - اسم الصلاحية، مثل `PERMISSIONS.UPDATE_PRODUCT`.
   */
  hasPermission: (permission: string) => boolean
}

const UserContext = React.createContext<UserContextType | undefined>(undefined)

// مرجع ثابت: القيمة الافتراضية [] تنشئ مصفوفة جديدة في كل رندر
const NO_PERMISSIONS: string[] = []

const DEFAULT_AVATAR = "/images/user.png"

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  // Array.from حتى لا تنقسم الرموز المكونة من وحدتين مثل الإيموجي
  const letters =
    words.length > 1
      ? words.slice(0, 2).map((word) => Array.from(word)[0])
      : Array.from(words[0] ?? "").slice(0, 2)
  return letters.join("").toUpperCase()
}

/**
 * يوفر المستخدم الحالي وصلاحياته، ويحدث الصفحة عند تغير حالة تسجيل الدخول.
 */
export function UserProvider({
  user: rawUser,
  permissions = NO_PERMISSIONS,
  children,
}: {
  user: CurrentUser | null
  permissions?: string[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = React.useMemo(() => createBrowserClient(), [])
  const serverUserId = rawUser?.id ?? null

  React.useEffect(() => {
    let knownUserId = serverUserId

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUserId = session?.user?.id ?? null
      // SIGNED_IN يتكرر عند العودة إلى التبويب، لذلك نقارن هوية المستخدم
      if (nextUserId !== knownUserId || event === "USER_UPDATED") {
        knownUserId = nextUserId
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, serverUserId])

  const user = React.useMemo<FormattedUser | null>(() => {
    if (!rawUser) return null

    const email = rawUser.email ?? ""
    const emailName = email.split("@")[0] ?? ""
    const name =
      [rawUser.first_name, rawUser.last_name]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ") ||
      emailName ||
      "User"

    return {
      id: rawUser.id,
      name,
      initials: getInitials(name),
      email,
      username: emailName ? `@${emailName}` : "",
      avatar: rawUser.avatar || DEFAULT_AVATAR,
      role: rawUser.role,
    }
  }, [rawUser])

  const hasPermission = React.useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions]
  )

  const value = React.useMemo<UserContextType>(
    () => ({ rawUser, user, permissions, hasPermission }),
    [rawUser, user, permissions, hasPermission]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/**
 * المستخدم الحالي وصلاحياته.
 *
 * - `user`: بيانات العرض (`name`, `initials`, `email`, `username`, `avatar`, `role`).
 * - `rawUser`: البيانات الخام من قاعدة البيانات.
 * - `permissions`: قائمة الصلاحيات.
 * - `hasPermission`: فحص صلاحية (للواجهة فقط).
 *
 * @example
 * const { user, hasPermission } = useUser()
 *
 * @throws {Error} إذا استخدم خارج `UserProvider`.
 */
export function useUser() {
  const context = React.useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
