"use client"

import * as React from "react"

import { NavMain } from "@/components/dashboard/nav-main"
import { NavUser } from "@/components/dashboard/nav-user"
import { TeamSwitcher } from "@/components/dashboard/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { sidebarConfig } from "./sidebar-config"


interface AppSidebarProps {
  currentUser: CurrentUser | null
  role: string
  side?: "right" | "left" | undefined
}

export function AppSidebar({
  currentUser,
  side,
  ...props
}: React.ComponentProps<typeof Sidebar> & AppSidebarProps) {
  
  const user = {
    name: currentUser?.first_name || currentUser?.last_name || "Guest",
    email: currentUser?.email || "you@domain.com",
    avatar: currentUser?.profile_image || "/images/avatar.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props} side={side}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarConfig.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarConfig.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}




