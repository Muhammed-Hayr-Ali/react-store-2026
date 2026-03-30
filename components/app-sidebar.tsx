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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavSecondary } from "./ui/nav-secondary"
import { siteConfig } from "./shared/site"
import { Badge } from "./ui/badge"
import Link from "next/link"
import { appRouter } from "@/lib/app-routes"

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
        avatar: profile.avatar_url || undefined,
      }
    }

    if (user) {
      return {
        name: user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url || undefined,
      }
    }

    return {
      name: "User",
      email: "user@example.com",
      avatar: undefined,
    }
  }, [profile, user])

  return (
    <Sidebar collapsible="icon" {...props} side={side}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="xl" asChild>
              <Link href={appRouter.home}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <AppLogo className="size-4" />
                </div>
                <div className="flex w-full items-center justify-between text-start leading-none">
                  <span className="truncate text-base font-bold">
                    {siteConfig.name}
                  </span>
                  <Badge
                    variant="destructive"
                    className="bg-blue-50 text-[10px] text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    v{siteConfig.virsion}
                  </Badge>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
