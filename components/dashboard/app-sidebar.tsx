"use client"

import * as React from "react"

import { NavMain } from "@/components/dashboard/nav-main"
import { StoreSwitcher } from "@/components/dashboard/store-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { NavUser } from "./nav-user"
import { sidebarConfig } from "./sidebar-config"

interface AppSidebarProps {
  currentUser: CurrentUser | null
  side?: "right" | "left" | undefined
}

export function AppSidebar({
  currentUser,
  side,
  ...props
}: React.ComponentProps<typeof Sidebar> & AppSidebarProps) {
  const user = {
    name:
      [currentUser?.first_name, currentUser?.last_name]
        .filter(Boolean)
        .join(" ") ||
      currentUser?.email?.split("@")[0] ||
      "Guest",
    email: currentUser?.email || "you@domain.com",
    avatar: currentUser?.profile_image || "/images/avatar.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props} side={side}>
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarConfig.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
