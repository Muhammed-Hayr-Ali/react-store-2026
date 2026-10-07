"use client"

import React, { createContext, useContext } from "react"

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

interface UserContextType {
  user: CurrentUser | null
  permissions: string[]
  hasPermission: (permission: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  user,
  permissions = [],
  children,
}: {
  user: CurrentUser | null
  permissions?: string[]
  children: React.ReactNode
}) {
  const hasPermission = (permission: string) => {
    if (!permissions) return false
    return permissions.includes(permission)
  }

  return (
    <UserContext.Provider value={{ user, permissions, hasPermission }}>
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
