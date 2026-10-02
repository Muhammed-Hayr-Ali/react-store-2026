"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LogOutIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"
import { Separator } from "@/components/ui/separator"
import {
  CustomPopover,
  CustomPopoverContent,
  CustomPopoverHeader,
  CustomPopoverTrigger,
} from "@/components/ui/custom-popover"
import { CurrencySwitcher } from "@/components/store/currency/CurrencySwitcher"

import { CurrentUser } from "@/lib/actions/utils/profile"
import { signOut } from "@/lib/actions/authentication/signOut"
import { appRoutes } from "@/lib/config/app-routes"
import { appConfig } from "@/lib/config/app_config"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { cn } from "@/lib/utils"

import UserProfile from "./user-profile"

interface DesktopNavProps {
  className?: string
  user: CurrentUser | null
  currentCurrency: CurrencyCode
}

export default function DesktopNav({
  user,
  className,
  currentCurrency,
}: DesktopNavProps) {
  return (
    <div className={cn("hidden items-center gap-3 md:flex", className)}>
      {/* زر البحث */}
      <CustomButton
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
        aria-label="Search"
      >
        <SearchIcon className="size-4" />
      </CustomButton>

      {/* زر سلة التسوق */}
      <CustomButton
        variant="ghost"
        size="icon"
        className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground"
        aria-label="Shopping Cart"
      >
        <ShoppingCartIcon className="size-4" />
      </CustomButton>

      {/* مبدل العملة */}
      <CurrencySwitcher currentCurrency={currentCurrency} />

      {/* قائمة المستخدم أو أزرار تسجيل الدخول */}
      {user ? (
        <>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <UserMenu user={user} />
        </>
      ) : (
        <div className="ms-1 flex items-center gap-2 border-s border-border/50 ps-3">
          <CustomButton
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs font-normal"
            asChild
          >
            <Link href={appRoutes.auth.login}>Login</Link>
          </CustomButton>
          <CustomButton
            size="sm"
            className="h-8 rounded-lg text-xs font-normal"
            asChild
          >
            <Link href={appRoutes.auth.signup}>Get Started</Link>
          </CustomButton>
        </div>
      )}
    </div>
  )
}

function UserMenu({ user }: { user: CurrentUser }) {
  const router = useRouter()

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      router.refresh()
    }
  }

  return (
    <CustomPopover>
      <CustomPopoverTrigger asChild>
        <button
          type="button"
          className="rounded-full focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          aria-label="User profile menu"
        >
          <Avatar className="size-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/20">
            <AvatarImage src={user.profile_image || undefined} />
            <AvatarFallback className="p-1.5">
              <UserIcon className="size-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </button>
      </CustomPopoverTrigger>

      <CustomPopoverContent
        align="end"
        className="w-max max-w-[300px] min-w-[260px] gap-0 rounded-xl p-0 shadow-lg"
      >
        <CustomPopoverHeader className="px-3.5 py-3">
          <UserProfile user={user} />
        </CustomPopoverHeader>

        <Separator />
        <div className="p-1.5">
          {appConfig.menu.userMenu.items.map((item) => (
            <CustomButton
              key={item.href}
              size="sm"
              variant="ghost"
              className="h-8.5 w-full justify-start rounded-lg text-xs font-normal"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="me-2 size-3.5 text-muted-foreground" />
                {item.label}
              </Link>
            </CustomButton>
          ))}
        </div>

        <Separator />
        <div className="p-1.5">
          {appConfig.menu.supportLinks.items.map((item) => (
            <CustomButton
              key={item.href}
              size="sm"
              variant="ghost"
              className="h-8.5 w-full justify-start rounded-lg text-xs font-normal"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="me-2 size-3.5 text-muted-foreground" />
                {item.label}
              </Link>
            </CustomButton>
          ))}
        </div>

        <Separator />
        <div className="p-1.5">
          <CustomButton
            size="sm"
            variant="ghost"
            className="h-8.5 w-full justify-start rounded-lg text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOutIcon className="me-2 size-3.5" />
            Logout
          </CustomButton>
        </div>
      </CustomPopoverContent>
    </CustomPopover>
  )
}
