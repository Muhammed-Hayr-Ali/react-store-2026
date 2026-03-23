"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { AppLogo } from "@/components/shared/app-logo"
import { useAuth } from "@/lib/providers/auth-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavSecondary } from "./ui/nav-secondary"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: "admin" | "vendor" | "customer" | "delivery"
  side?: "left" | "right" | undefined
  navItems?: {
    title: string
    url: string
    icon?: string | React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}

export function AppSidebar({
  role,
  side,
  navItems,
  ...props
}: AppSidebarProps) {
  const { user, profile } = useAuth()

  // تحسين بيانات المستخدم للعرض
  const displayUser = React.useMemo(() => {
    if (profile) {
      return {
        name:
          profile.full_name || profile.first_name || profile.email || "User",
        email: profile.email,
        avatar: profile.avatar_url || "/avatars/default.jpg",
      }
    }

    if (user) {
      return {
        name: user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url || "/avatars/default.jpg",
      }
    }

    return {
      name: "User",
      email: "user@example.com",
      avatar: "/avatars/default.jpg",
    }
  }, [profile, user])

  return (
    <Sidebar collapsible="icon" {...props} side={side}>
      <SidebarHeader className="flex h-16 items-center gap-2 px-4">
        <AppLogo size="xs" />
        <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
          Marketna
        </span>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems || []} role={role} />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
