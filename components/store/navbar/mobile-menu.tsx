"use client"

import React, { useState } from "react"
import Link from "next/link"

import MenuButton from "@/components/ui/menu_button"
import {
  MobileMenu as MenuDrawer,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuHeader,
} from "@/components/ui/mobile-menu"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

import { appRoutes } from "@/lib/config/app-routes"
import type { NotificationRecord } from "@/lib/actions/notifications/types"
import { UserProfileHeader } from "./user-profile-header"
import { PreferencesSubNav } from "./preferences-sub-nav"
import { NavItemsList } from "./nav-items-list"
import { useUser } from "@/lib/context/user-context"
import { LogoutDialog } from "./logout-dialog"

interface MobileMenuProps {
  initialNotifications: NotificationRecord[]
  initialUnreadCount: number
}

export function MobileMenu({
  initialNotifications,
  initialUnreadCount,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <MenuButton
        className="flex md:hidden"
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <MobileMenuDrawer
        initialNotifications={initialNotifications}
        initialUnreadCount={initialUnreadCount}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

function MobileMenuDrawer({
  initialNotifications,
  initialUnreadCount,
  isOpen,
  onClose,
}: {
  initialNotifications: NotificationRecord[]
  initialUnreadCount: number
  isOpen: boolean
  onClose: () => void
}) {
  const { user } = useUser()
  const [logoutStatus, setLogoutStatus] = useState<string | null>(null)

  const handleOpenLogout = () => {
    onClose()
    setLogoutStatus("logout")
  }

  return (
    <>
      <MenuDrawer isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        {user && (
          <MobileMenuHeader>
            <UserProfileHeader
              initialNotifications={initialNotifications}
              initialUnreadCount={initialUnreadCount}
              showNotifications={true}
              showAvatar={true}
            />
          </MobileMenuHeader>
        )}

        <MobileMenuBody className="px-2">
          <NavItemsList onItemClick={onClose} />

          <Separator className="my-2" />

          <PreferencesSubNav />
        </MobileMenuBody>

        <MobileMenuFooter>
          <div className="flex flex-col">
            {user ? (
              <Button
                variant="default"
                className="px-4 uppercase"
                onClick={handleOpenLogout}
              >
                Logout
              </Button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button variant="default" className="px-4 uppercase" asChild>
                  <Link href={appRoutes.auth.signup} onClick={onClose}>
                    Get Started
                  </Link>
                </Button>

                <Button variant="secondary" className="px-4 uppercase" asChild>
                  <Link href={appRoutes.auth.login} onClick={onClose}>
                    Login
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </MobileMenuFooter>
      </MenuDrawer>

      <LogoutDialog
        status={logoutStatus}
        onOpenChange={(open) => setLogoutStatus(open ? "logout" : null)}
      />
    </>
  )
}
