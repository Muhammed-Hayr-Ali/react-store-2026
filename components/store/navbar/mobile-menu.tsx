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
import { useUser } from "@/lib/context/user-context"

import { UserProfileHeader } from "./user-profile-header"
import { PreferencesSubNav } from "./preferences-sub-nav"
import { NavItemsList } from "./nav-items-list"
import { LogoutAlertDialog } from "@/components/shared/logout-alert"
import MobileCardDrawer from "../../cart/mobile-cart"
import CartButton from "@/components/cart/cart-button"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCardOpen, setIsCardOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-4 md:hidden">
        <CartButton
          iconClassName="size-4.5"
          variant="ghost"
          onClick={() => {
            setIsOpen(false)
            setIsCardOpen(!isCardOpen)
          }}
        />
        <MenuButton
          className="flex md:hidden"
          isOpen={isOpen}
          onClick={() => {
            setIsCardOpen(false)
            setIsOpen(!isOpen)
          }}
        />
      </div>
      <MobileMenuDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <MobileCardDrawer
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
      />
    </>
  )
}

function MobileMenuDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { user } = useUser()
  const [logoutStatus, setLogoutStatus] = useState<boolean>(false)

  const handleOpenLogout = () => {
    onClose()
    setLogoutStatus(false)
  }

  return (
    <>
      <MenuDrawer isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        {user && (
          <MobileMenuHeader showCloseButton={false}>
            <UserProfileHeader showAvatar={true} />
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
                className="h-9 w-full text-xs font-medium uppercase shadow-xs"
                onClick={handleOpenLogout}
              >
                Logout
              </Button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button
                  variant="default"
                  className="h-9 w-full text-xs font-medium uppercase shadow-xs"
                  asChild
                >
                  <Link href={appRoutes.auth.signup} onClick={onClose}>
                    Get Started
                  </Link>
                </Button>

                <Button
                  variant="secondary"
                  className="h-9 w-full text-xs font-medium uppercase shadow-xs"
                  asChild
                >
                  <Link href={appRoutes.auth.login} onClick={onClose}>
                    Login
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </MobileMenuFooter>
      </MenuDrawer>

      <LogoutAlertDialog
        open={logoutStatus}
        onOpenChange={(open) => setLogoutStatus(open)}
      />
    </>
  )
}
