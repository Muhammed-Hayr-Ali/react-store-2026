"use client"

import * as React from "react"
import { AppLogo } from "@/components/shared/app-logo"
import { UserBoldIcon } from "@/components/shared/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import MenuButton from "@/components/shared/menu_button"
import {
  MobileMenu,
  MobileMenuHeader,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuItem,
} from "@/components/ui/mobile-menu"
import { useAuth } from "@/hooks/useAuth"
import { siteConfig } from "@/lib/config/site_config"
import Link from "next/link"
import { appRouter } from "@/lib/config/app_router"
import { Profile } from "@/lib/types/profile"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { profile: initialProfile, user, signOut } = useAuth()
  const [profile, setProfile] = React.useState<Profile | null>(initialProfile)
  const menuItems = user ? siteConfig.userMenuItems : siteConfig.guestMenuItems

  const handleLogout = async () => {
    await signOut()
    setProfile(null)
  }

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-12 items-center gap-4 px-4">
          {/* Logo - Left */}
          <div className="flex grow-3 items-center justify-start">
            <AppLogo />
          </div>

          {/* Search - Center (macOS Spotlight style) */}
          <div className="flex grow-7 items-center justify-center">
            <Button
              variant="secondary"
              className="h-8 w-full max-w-md gap-2 rounded-full bg-background px-3 text-sm text-muted-foreground shadow-none hover:bg-background/80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span>Search</span>
            </Button>
          </div>

          {/* User Avatar / Menu - Right */}
          <nav className="flex grow-3 items-center justify-end gap-2">
            <div className="hidden items-center lg:flex">
              <Avatar className="size-10">
                {user && profile?.avatar_url ? (
                  <>
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile.full_name || ""}
                    />
                    <AvatarFallback className="p-1.5">
                      <UserBoldIcon className="size-max text-foreground" />
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="p-1.5">
                    <UserBoldIcon className="size-max text-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
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
          <Avatar className="size-10">
            {user && profile?.avatar_url ? (
              <>
                <AvatarImage
                  src={profile.avatar_url}
                  alt={profile.full_name || ""}
                />
                <AvatarFallback className="p-1.5">
                  <UserBoldIcon className="size-max text-foreground" />
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback className="p-1.5">
                <UserBoldIcon className="size-max text-foreground" />
              </AvatarFallback>
            )}
          </Avatar>

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
