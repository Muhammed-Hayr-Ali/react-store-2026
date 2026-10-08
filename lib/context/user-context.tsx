"use client"

import React, { createContext, useContext, useMemo } from "react"

export type CurrentUser = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  profile_image: string | null
  gender: "male" | "female" | "other" | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  role: string
  permissions: string[]
}

export type FormattedUser = {
  id: string
  name: string
  email: string
  avatar: string | undefined
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

    return {
      id: rawUser.id,
      name,
      email: rawUser.email || "you@domain.com",
      avatar: rawUser.profile_image || "images/user.png",
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

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
