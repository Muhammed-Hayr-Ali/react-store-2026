"use client"

import React, { createContext, useContext, useMemo } from "react"
import { CurrentUser } from "../actions/users/queries/get-current-user"

export type FormattedUser = {
  id: string
  name: string
  initials: string // أول حرفين من اسم المستخدم
  email: string    // البريد الإلكتروني كاملاً (مثال: m.thelord963@gmail.com)
  username: string // البريد بصيغة @username (مثال: @m.thelord963)
  avatar: string
  role: string
}

interface UserContextType {
  rawUser: CurrentUser | null
  user: FormattedUser | null
  permissions: string[]
  hasPermission: (permission: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  user: rawUser,
  permissions = [],
  children,
}: {
  user: CurrentUser | null
  permissions?: string[]
  children: React.ReactNode
}) {
  const formattedUser = useMemo<FormattedUser | null>(() => {
    if (!rawUser) return null

    const name =
      [rawUser.first_name, rawUser.last_name].filter(Boolean).join(" ") ||
      rawUser.email?.split("@")[0] ||
      "User"

    // استخراج أول حرفين من الاسم
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    // البريد الإلكتروني كاملاً والصيغة المختصرة
    const email = rawUser.email || "you@domain.com"
    const usernamePart = email.split("@")[0]
    const username = `@${usernamePart}`

    return {
      id: rawUser.id,
      name,
      initials,
      email,
      username,
      avatar: rawUser.avatar || "images/user.png",
      role: rawUser.role,
    }
  }, [rawUser])

  const hasPermission = (permission: string) => {
    if (!permissions) return false
    return permissions.includes(permission)
  }

  return (
    <UserContext.Provider
      value={{
        rawUser,
        user: formattedUser,
        permissions,
        hasPermission,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

/**
 * Hook للوصول إلى بيانات المستخدم الحالي وصلاحياته.
 * 
 * @returns {UserContextType} يعيد الكائن التالي:
 * - `rawUser`: بيانات المستخدم الخام القادمة من قاعدة البيانات.
 * - `user`: بيانات المستخدم منسقة (الاسم، أول الحرفين `initials`، البريد الكامل `email`، صيغة `@username` عبر `username`، الصورة، والدور).
 * - `permissions`: قائمة الصلاحيات الخاصة بالمستخدم.
 * - `hasPermission(permission)`: دالة لفحص ما إذا كان المستخدم يملك صلاحية معينة.
 */
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}