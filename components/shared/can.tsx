



"use client"

import { AppPermission } from "@/lib/actions/role"
import { useUser } from "@/lib/context/user-context"
import React from "react"

interface CanProps {
  permission: AppPermission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = useUser()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}




