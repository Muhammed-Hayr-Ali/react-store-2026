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
import { CurrentUser } from "@/lib/actions/utils/profile"
import { CurrencyCode } from "@/lib/actions/currency/types"
import { appRoutes } from "@/lib/config/app-routes"
import { storeNavConfig } from "./nav-config"

import { UserProfileHeader } from "./user-menu"
import { LanguageAccordion } from "./preferences/language-accordion"
import { ThemeAccordion } from "./preferences/theme-accordion"
import { CurrencyAccordion } from "./preferences/currency-accordion"

interface MobileNavProps {
  user: CurrentUser | null
  currentCurrency: CurrencyCode
}

export function MobileNav({ user, currentCurrency }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <MenuButton
        className="flex md:hidden"
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <MobileRightMenu
        user={user}
        currentCurrency={currentCurrency}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  )
}

function MobileRightMenu({
  user,
  currentCurrency,
  isOpen,
  setIsOpen,
}: {
  user: CurrentUser | null
  currentCurrency: CurrencyCode
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const router = useRouter()

  const navLinks = user
    ? storeNavConfig.userMenu.items
    : storeNavConfig.guestMenu.items

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    setIsOpen(false)
    try {
      await signOut()
      router.replace(appRoutes.home)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <MobileMenu isOpen={isOpen} onOpenChange={setIsOpen}>
      {user && (
        <MobileMenuHeader>
          <UserProfileHeader user={user} />
        </MobileMenuHeader>
      )}

      <MobileMenuBody className="px-2">
        <div className="flex flex-col">
          {navLinks.map((link) => (
            <Button
              key={link.key}
              variant="ghost"
              className="flex h-10 items-center justify-start font-normal"
              asChild
            >
              <Link href={link.href} onClick={handleClose}>
                <link.icon className="me-2 size-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        <Separator />

        {user && (
          <div className="flex flex-col">
            {storeNavConfig.shoppingMenu.items.map((link) => (
              <Button
                key={link.key}
                variant="ghost"
                className="flex h-10 items-center justify-start font-normal"
                asChild
              >
                <Link href={link.href} onClick={handleClose}>
                  <link.icon className="me-2 size-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
            <Separator />
          </div>
        )}

        <div className="flex flex-col">
          {storeNavConfig.supportLinks.items.map((link) => (
            <Button
              key={link.key}
              variant="ghost"
              className="flex h-10 items-center justify-start font-normal"
              asChild
            >
              <Link href={link.href} onClick={handleClose}>
                <link.icon className="me-2 size-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        <Separator />

        <LanguageAccordion onSelect={handleClose} />
        <Separator className="my-px" />
        <CurrencyAccordion
          currentCurrency={currentCurrency}
          onSelect={handleClose}
        />
        <Separator className="my-px" />
        <ThemeAccordion onSelect={handleClose} />
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
