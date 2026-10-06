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
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { NavUser } from "./nav-user"


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  side?: "right" | "left" | undefined
}

export async function AppSidebar({ side, ...props }: AppSidebarProps) {

  const currentUser = await getCurrentUser()

  const role = currentUser?.role

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
        <NavMain role={role} permissions={currentUser?.permissions} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
