"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import MenuButton from "../../ui/menu_button"
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
import { appConfig } from "@/lib/config/app_config"

import UserProfile from "./user-profile"
import { LanguageAccordion } from "./language-accordion"
import { ThemeAccordion } from "./theme-accordion"
import { CurrencyAccordion } from "@/components/store/home/currency-accordion"

interface MobileNavProps {
  user: CurrentUser | null
  currentCurrency: CurrencyCode
}

interface MobileRightMenuProps {
  user: CurrentUser | null
  currentCurrency: CurrencyCode
  isOpen: boolean
  setIsOpen: (open: boolean) => void
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

export default function MobileRightMenu({
  user,
  currentCurrency,
  isOpen,
  setIsOpen,
}: MobileRightMenuProps) {
  const router = useRouter()

  // تحديد الروابط بناءً على حالة تسجيل الدخول
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
    }
  }

  return (
    <MobileMenu isOpen={isOpen} onOpenChange={setIsOpen}>
      {/* رأس القائمة الجانبية (بيانات المستخدم إن وجد) */}
      {user && (
        <MobileMenuHeader>
          <UserProfile user={user} />
        </MobileMenuHeader>
      )}

      {/* محتوى القائمة الجانبية */}
      <MobileMenuBody className="px-2">
        {/* قائمة المستخدم أو الزائر */}
        <div className="flex flex-col">
          {navLinks.map((link) => (
            <Button
              key={link.key}
              variant="ghost"
              className="flex h-10 items-center justify-start font-normal"
              asChild
            >
              <Link href={link.href} onClick={handleOnClick}>
                <link.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        <Separator />

        {/* قائمة التسوق للمستخدم المسجل */}
        {user && (
          <div className="flex flex-col">
            {appConfig.menu.shoppingMenu.items.map((link) => (
              <Button
                key={link.key}
                variant="ghost"
                className="flex h-10 items-center justify-start font-normal"
                asChild
              >
                <Link href={link.href} onClick={handleOnClick}>
                  <link.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
                  {link.label}
                </Link>
              </Button>
            ))}
            <Separator />
          </div>
        )}

        {/* روابط الدعم والمساعدة */}
        <div className="flex flex-col">
          {appConfig.menu.supportLinksMenu.items.map((link) => (
            <Button
              key={link.key}
              variant="ghost"
              className="flex h-10 items-center justify-start font-normal"
              asChild
            >
              <Link href={link.href} onClick={handleOnClick}>
                <link.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        <Separator />

        {/* قائمة التفضيلات (اللغة، العملة، المظهر) */}
        <LanguageAccordion />
        <Separator className="my-px" />
        <CurrencyAccordion
          currentCurrency={currentCurrency}
          onSelect={() => setIsOpen(false)}
        />
        <Separator className="my-px" />
        <ThemeAccordion />
      </MobileMenuBody>

      {/* أسفل القائمة الجانبية (تسجيل الخروج أو أزرار الدخول) */}
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
              <Button
                variant="default"
                className="px-4 uppercase"
                asChild
              >
                <Link href={appRoutes.auth.signup} onClick={handleOnClick}>
                  Get Started
                </Link>
              </Button>

              <Button
                variant="secondary"
                className="px-4 uppercase"
                asChild
              >
                <Link href={appRoutes.auth.login} onClick={handleOnClick}>
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
