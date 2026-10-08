"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CustomPopover,
  CustomPopoverContent,
  CustomPopoverHeader,
  CustomPopoverTrigger,
} from "@/components/ui/custom-popover"

import { signOut } from "@/lib/actions/authentication/signOut"
import { appRoutes } from "@/lib/config/app-routes"
import { cn } from "@/lib/utils"
import type { NotificationRecord } from "@/lib/actions/notifications/types"
import { useUser } from "@/lib/context/user-context"
import { PreferencesSubNav } from "./preferences-sub-nav"
import { UserProfileHeader } from "./user-profile-header"
import { NavItemsList } from "./nav-items-list"

interface UserMenuProps {
  className?: string
  initialNotifications: NotificationRecord[]
  initialUnreadCount: number
}

export default function UserMenu({
  className,
  initialNotifications,
  initialUnreadCount,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user } = useUser()

  if (!user) return null

  const handleClose = () => setIsOpen(false)

  const handleLogout = async () => {
    handleClose()
    try {
      const result = await signOut()
      if (result.success) {
        router.replace(appRoutes.home)
        router.refresh()
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <CustomPopover open={isOpen} onOpenChange={setIsOpen}>
      <CustomPopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
            className
          )}
          aria-label="User profile menu"
        >
          <Avatar className="size-8 ring-2 ring-transparent transition-all hover:ring-primary/20">
            <AvatarImage src={user.avatar} />
          </Avatar>
        </button>
      </CustomPopoverTrigger>

      <CustomPopoverContent
        align="end"
        className="w-72 gap-0 rounded-xl p-0 shadow-lg"
      >
        <CustomPopoverHeader className="px-3.5 py-3">
          <UserProfileHeader
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
            showNotifications={false}
            showAvatar={false}
          />
        </CustomPopoverHeader>

        <Separator />

        <div className="max-h-[60vh] overflow-y-auto p-1.5">
          <NavItemsList
            onItemClick={handleClose}
            itemClassName="h-8 text-xs px-2 rounded-lg"
            subItemClassName="h-7 text-[11px] px-2 rounded-md"
            iconClassName="size-3.5"
          />

          <div
            role="separator"
            aria-orientation="horizontal"
            className="my-1.5 h-px bg-border"
          />

          <PreferencesSubNav
            itemClassName="h-8 text-xs px-2"
            subItemClassName="h-7 text-[11px] px-2"
          />
        </div>

        <Separator />

        <div className="p-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-full justify-start rounded-lg px-2 text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOutIcon className="me-2 size-3.5" />
            Logout
          </Button>
        </div>
      </CustomPopoverContent>
    </CustomPopover>
  )
}
