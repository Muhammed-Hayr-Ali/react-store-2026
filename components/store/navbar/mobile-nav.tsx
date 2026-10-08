"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"

import MenuButton from "@/components/ui/menu_button"
import {
  MobileMenu,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuHeader,
} from "@/components/ui/mobile-menu"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { signOut } from "@/lib/actions/authentication/signOut"
import { appRoutes } from "@/lib/config/app-routes"
import { sidebarConfig } from "./nav-config"
import type { NotificationRecord } from "@/lib/actions/notifications/types"

import { UserProfileHeader } from "./user-menu"
import { PreferencesSubNav } from "./preferences-sub-nav"
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
  const { user, hasPermission } = useUser()
  const router = useRouter()

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    setIsOpen(false)
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

  const visibleNavItems = sidebarConfig.navBarItems
    .filter((item) => {
      if (!item.requiredPermission) return true
      if (!user) return false
      return hasPermission(item.requiredPermission)
    })
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: item.items.filter((sub) => {
            if (!sub.requiredPermission) return true
            if (!user) return false
            return hasPermission(sub.requiredPermission)
          }),
        }
      }
      return item
    })
    .filter((item) => !item.items || item.items.length > 0)

  return (
    <MobileMenu isOpen={isOpen} onOpenChange={setIsOpen}>
      {user && (
        <MobileMenuHeader>
          <UserProfileHeader
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
          />
        </MobileMenuHeader>
      )}

      <MobileMenuBody className="px-2">
        <div className="flex flex-col">
          {visibleNavItems.map((item) => {
            const hasChildren = Boolean(item.items && item.items.length > 0)

            return (
              <React.Fragment key={item.key}>
                {hasChildren ? (
                  <Collapsible className="group/collapsible">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-10 w-full items-center justify-between font-normal"
                      >
                        <div className="flex items-center">
                          <item.icon className="me-2 size-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ps-6 pt-1">
                      {item.items?.map((subItem) => (
                        <Button
                          key={subItem.title}
                          variant="ghost"
                          size="sm"
                          className="flex h-9 w-full items-center justify-start text-xs font-normal text-muted-foreground hover:text-foreground"
                          asChild
                        >
                          <Link href={subItem.url} onClick={handleClose}>
                            {subItem.title}
                          </Link>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Button
                    variant="ghost"
                    className="flex h-10 items-center justify-start font-normal"
                    asChild
                  >
                    <Link href={item.url} onClick={handleClose}>
                      <item.icon className="me-2 size-4" />
                      {item.title}
                    </Link>
                  </Button>
                )}

                {item.hasSeparator && (
                  <div
                    role="separator"
                    aria-orientation="horizontal"
                    className="my-2 h-px bg-border"
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        <Separator className="my-2" />

        {/* عرض التفضيلات بنفس أسلوب القوائم المنسدلة */}
        <PreferencesSubNav onSelect={handleClose} />
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
