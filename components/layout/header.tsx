"use client"

import * as React from "react"
import { AppLogo } from "@/components/shared/app-logo"
import { UserIcon } from "@/components/shared/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "../ui/button"
import MenuButton from "../shared/menu_button"
import {
  MobileMenu,
  MobileMenuHeader,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuItem,
} from "../ui/mobile-menu"
import { useAuth } from "@/hooks/useAuth"
import { siteConfig } from "@/lib/config/site_config"
import Link from "next/link"
import { appRouter } from "@/lib/config/app_router"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { profile, user, signOut } = useAuth()
  const menuItems = user ? siteConfig.userMenuItems : siteConfig.guestMenuItems

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-0">
          <div className="grow-3">
            <AppLogo size="sm" />
          </div>
          <Button
            variant={"secondary"}
            className="grow-7 text-sm text-muted-foreground"
          >
            Search
          </Button>
          <nav className="flex grow-3 items-center justify-end">
            <div className="hidden lg:block">
              {user ? (
                <Avatar>
                  <AvatarImage
                    src={profile?.avatar_url || ""}
                    alt={profile?.full_name || ""}
                    className="grayscale"
                  />
                  <AvatarFallback>
                    <UserIcon className="size-5" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Link href={appRouter.signIn}>
                  <Avatar size="default">
                    <AvatarFallback>
                      <UserIcon className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}
            </div>
            <MenuButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="block lg:hidden"
            />
          </nav>
        </div>
      </header>

      <MobileMenu isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <MobileMenuHeader className="flex items-center gap-3">
          {user ? (
            <Avatar>
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.full_name || ""}
                className="grayscale"
              />
              <AvatarFallback>
                <UserIcon className="size-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar size="default">
              <AvatarFallback>
                <UserIcon className="size-5" />
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col">
            <span className="text-base leading-none font-semibold">
              {profile?.full_name || "Guest"}
            </span>
            <span className="text-sm text-muted-foreground">
              {profile?.email || ""}
            </span>
          </div>
        </MobileMenuHeader>

        <MobileMenuBody>
          {menuItems.map((item) => (
            <MobileMenuItem
              key={`/${item.label}`}
              href={item.href}
              icon={item.icon}
            >
              {item.label}
            </MobileMenuItem>
          ))}
        </MobileMenuBody>

        <MobileMenuFooter>
          {user ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" asChild>
                <Link href={appRouter.signIn}>Sign In</Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href={appRouter.signUp}>Create Account</Link>
              </Button>
            </div>
          )}
        </MobileMenuFooter>
      </MobileMenu>
    </>
  )
}
