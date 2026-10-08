"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import MenuButton from "@/components/ui/menu_button"
import {
  MobileMenu,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuHeader,
} from "@/components/ui/mobile-menu"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

import { signOut } from "@/lib/actions/authentication/signOut"
import { appRoutes } from "@/lib/config/app-routes"
import type { NotificationRecord } from "@/lib/actions/notifications/types"
import { UserProfileHeader } from "./user-profile-header"
import { PreferencesSubNav } from "./preferences-sub-nav"
import { NavItemsList } from "./nav-items-list"
import { useUser } from "@/lib/context/user-context"

interface MobileNavProps {
  initialNotifications: NotificationRecord[]
  initialUnreadCount: number
}

export function MobileNav({
  initialNotifications,
  initialUnreadCount,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <MenuButton
        className="flex md:hidden"
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <MobileRightMenu
        initialNotifications={initialNotifications}
        initialUnreadCount={initialUnreadCount}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  )
}

function MobileRightMenu({
  initialNotifications,
  initialUnreadCount,
  isOpen,
  setIsOpen,
}: {
  initialNotifications: NotificationRecord[]
  initialUnreadCount: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const { user } = useUser()
  const router = useRouter()

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
    <MobileMenu isOpen={isOpen} onOpenChange={setIsOpen}>
      {user && (
        <MobileMenuHeader>
          <UserProfileHeader
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
            showNotifications={true}
          />
        </MobileMenuHeader>
      )}

      <MobileMenuBody className="px-2">
        <NavItemsList onItemClick={handleClose} />

        <Separator className="my-2" />

        <PreferencesSubNav />
      </MobileMenuBody>

      <MobileMenuFooter>
        <div className="flex flex-col">
          {user ? (
            <Button
              variant="default"
              className="px-4 uppercase"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <div className="flex flex-col space-y-2">
              <Button variant="default" className="px-4 uppercase" asChild>
                <Link href={appRoutes.auth.signup} onClick={handleClose}>
                  Get Started
                </Link>
              </Button>

              <Button variant="secondary" className="px-4 uppercase" asChild>
                <Link href={appRoutes.auth.login} onClick={handleClose}>
                  Login
                </Link>
              </Button>
            </div>
          )}
        </div>
      </MobileMenuFooter>
    </MobileMenu>
  )
}
