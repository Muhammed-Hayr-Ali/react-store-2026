"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LogoutAlertDialog } from "../shared/logout-alert"
import { useUser } from "@/lib/context/user-context"
import React from "react"

export function NavUser() {
  // Use responsive menu placement and read the current dashboard user.
  const { user } = useUser()
  const { isMobile } = useSidebar()
  const [isOpen, setIsOpen] = React.useState(false)

  if (!user) return null

  const userHandle = user.email ? user.email.split("@")[0] : "user"
  const userTag = user.role
    ? `@${userHandle}/${user.role.toUpperCase()}`
    : `@${userHandle}`

  // Render the user menu with the sign-out dialog's own trigger.
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                </Avatar>

                <div className="flex min-w-0 flex-col justify-center">
                  <p
                    className="w-full truncate text-xs leading-tight font-semibold text-foreground"
                    title={user.name}
                  >
                    {user.name}
                  </p>

                  <p
                    className="mt-0.5 w-full truncate font-mono text-[11px] leading-tight text-muted-foreground"
                    title={userTag}
                  >
                    {userTag}
                  </p>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsOpen(true)}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <LogoutAlertDialog
        open={isOpen}
        onOpenChange={(open) => open === false && setIsOpen(false)}
      />
    </>
  )
}
