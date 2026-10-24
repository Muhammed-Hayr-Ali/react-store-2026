"use client"

import React, { useState } from "react"
import { LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"
import { useUser } from "@/lib/context/user-context"
import { PreferencesSubNav } from "./preferences-sub-nav"
import { UserProfileHeader } from "./user-profile-header"
import { NavItemsList } from "./nav-items-list"
import { LogoutAlertDialog } from "@/components/shared/logout-alert"

interface UserProfilePopoverProps {
  className?: string
}

export default function UserProfilePopover({
  className,
}: UserProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [logoutStatus, setLogoutStatus] = useState<boolean>(false)
  const { user } = useUser()

  if (!user) return null

  const handleClose = () => setIsOpen(false)

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
              className
            )}
            aria-label="User profile menu"
          >
            <Avatar className="size-8 ring-2 ring-transparent transition-all hover:ring-primary/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-[10px]">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-72 gap-0 rounded-xl p-0 shadow-lg"
        >
          <PopoverHeader className="px-3.5 py-3">
            <UserProfileHeader showAvatar={false} />
          </PopoverHeader>

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
              onClick={() => setLogoutStatus(true)}
            >
              <LogOutIcon className="me-2 size-3.5" />
              Logout
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <LogoutAlertDialog
        open={logoutStatus}
        onOpenChange={(open) => setLogoutStatus(open)}
      />
    </>
  )
}
