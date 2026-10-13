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
import { useUser } from "@/lib/context/user-context"
import { NavUser } from "./nav-user"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  side?: "right" | "left" | undefined
}

export function AppSidebar({ side, ...props }: AppSidebarProps) {
  // Read the signed-in user and permissions for the dashboard navigation.
  const { user, permissions } = useUser()

  if (!user) return null

  // Compose the sidebar header, navigation, user menu, and collapse rail.
  return (
    <Sidebar collapsible="icon" {...props} side={side}>
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain permissions={permissions} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
