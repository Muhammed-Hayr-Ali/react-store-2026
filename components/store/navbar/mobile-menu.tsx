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
import { ShoppingCartIcon } from "lucide-react"
import { useCart } from "@/lib/context/cart-context"
import MobileCardDrawer from "../../cart/mobile-cart"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCardOpen, setIsCardOpen] = useState(false)
  const { totalItemsCount, isPending } = useCart()

  return (
    <>
      <div className="flex items-center gap-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cart"
          onClick={() => {
            setIsOpen(false)
            setIsCardOpen(!isCardOpen)
          }}
          className={cn("relative")}
        >
          {/* يمكنك جعل الأيقونة تنبض أو تدور ببطء أثناء التحديث */}
          <ShoppingCartIcon className={cn("size-4.5")} />

          {totalItemsCount > 0 &&
            (isPending ? (
              <Spinner className="absolute -top-1 -right-1 size-3.5" />
            ) : (
              <span
                className={cn(
                  "absolute -top-1 -right-1 flex size-3.5 h-3.5 items-center justify-center rounded-full bg-foreground p-1.5 text-[9px] font-normal text-background transition-transform"
                )}
              >
                {totalItemsCount > 99 ? "99+" : totalItemsCount}
              </span>
            ))}
        </Button>

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
