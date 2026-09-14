"use client"

import React, { useState } from "react"
import MenuButton from "../../ui/menu_button"
import {
  MobileMenu,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuHeader,
} from "@/components/ui/mobile-menu"
import { Separator } from "@/components/ui/separator"
import { signOut } from "@/lib/actions/authentication/signOut"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { appRoutes } from "@/lib/config/app-routes"
import { appConfig } from "@/lib/config/app_config"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeAccordion } from "./theme-accordion"
import { LanguageAccordion } from "./language-accordion"
import UserProfile from "./user-profile"
import { CustomButton } from "@/components/ui/custom-button"

interface MobileRightMenuProps {
  user: CurrentUser | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function MobileNav({ user }: { user: CurrentUser | null }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
    
      <MenuButton
        className="flex md:hidden"
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <MobileRightMenu user={user} isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}

export default function MobileRightMenu({
  user,
  isOpen,
  setIsOpen,
}: MobileRightMenuProps) {
  const router = useRouter()
  // handle Locale Change nurmale function

  // Menu Items
  const navLinks = user
    ? appConfig.menu.userMenu.items
    : appConfig.menu.gestMenu.items

  const handleOnClick = () => {
    setIsOpen(false) // إغلاق القائمة عند النقر على رابط
  }

  const handleLogout = async () => {
    setIsOpen(false)
    try {
      await signOut()

      router.replace(appRoutes.home)
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
    }
  }

  return (
    <MobileMenu isOpen={isOpen} onOpenChange={setIsOpen}>
      {/* Mobile Menu Header */}

      {user && (
        <MobileMenuHeader>
          <UserProfile user={user} />
        </MobileMenuHeader>
      )}

      {/* Mobile Menu Body */}
      <MobileMenuBody className="px-2">
        {/* User Or Guest Menu */}
        <div className="flex flex-col">
          {navLinks.map((link) => (
            <CustomButton
              key={link.key}
              variant="ghost"
              className="flex h-10 items-center justify-start font-normal"
              asChild
            >
              <Link href={link.href} onClick={handleOnClick}>
                <link.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
                {link.label}
              </Link>
            </CustomButton>
          ))}
        </div>
        <Separator />
        {user && (
          <div className="flex flex-col">
            {appConfig.menu.shoppingMenu.items.map((link) => (
              <CustomButton
                key={link.key}
                variant="ghost"
                className="flex h-10 items-center justify-start font-normal"
                asChild
              >
                <Link href={link.href} onClick={handleOnClick}>
                  <link.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
                  {link.label}
                </Link>
              </CustomButton>
            ))}
            <Separator />
          </div>
        )}
        {/* Support Links Menu */}
        <div className="flex flex-col">
          {appConfig.menu.supportLinksMenu.items.map((link) => (
            <CustomButton
              key={link.key}
              variant="ghost"
              className="flex h-10 items-center justify-start font-normal"
              asChild
            >
              <Link href={link.href} onClick={handleOnClick}>
                <link.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
                {link.label}
              </Link>
            </CustomButton>
            // <Button key={item.key} variant="ghost" className="p-0" asChild>
            //   <Link href={item.href} onClick={handleOnClick}>
            //     <div className="flex w-full items-center space-x-1 text-start font-normal">
            //       <item.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
            //       {item.label}
            //     </div>
            //   </Link>
            // </Button>
          ))}
        </div>
        <Separator />
        {/* preferences Menu */}
        <LanguageAccordion />
        <Separator className="my-px"/>
        <ThemeAccordion />
      </MobileMenuBody>
      <MobileMenuFooter>
        <div className="flex flex-col">
          {user ? (
            <CustomButton
              variant="default"
              className="px-4 uppercase"
              onClick={handleLogout}
            >
              Logout
            </CustomButton>
          ) : (
            <div className="flex flex-col space-y-2">
              <CustomButton
                variant="default"
                className="px-4 uppercase"
                asChild
              >
                <Link href={appRoutes.auth.signup} onClick={handleOnClick}>
                  Get Started
                </Link>
              </CustomButton>

              <CustomButton
                variant="secondary"
                className="px-4 uppercase"
                asChild
              >
                <Link href={appRoutes.auth.login} onClick={handleOnClick}>
                  Login
                </Link>
              </CustomButton>
            </div>
          )}
        </div>
      </MobileMenuFooter>
    </MobileMenu>
  )
}
