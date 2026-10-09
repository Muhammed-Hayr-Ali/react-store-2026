"use client"

import * as React from "react"
import { AppPermission } from "@/lib/actions/role"
import { useUser } from "@/lib/context/user-context"

interface CanProps {
  permission: AppPermission | AppPermission[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = useUser()

  const isAllowed = Array.isArray(permission)
    ? permission.some((p) => hasPermission(p))
    : hasPermission(permission)

  if (!isAllowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
