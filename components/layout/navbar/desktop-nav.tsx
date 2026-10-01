"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { appRoutes } from "@/lib/config/app-routes"
import {
  LogOutIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { CustomButton } from "@/components/ui/custom-button"
import { cn } from "@/lib/utils"
import { appConfig } from "@/lib/config/app_config"
import { signOut } from "@/lib/actions/authentication/signOut"
import UserProfile from "./user-profile"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import {
  CustomPopover,
  CustomPopoverContent,
  CustomPopoverHeader,
  CustomPopoverTrigger,
} from "@/components/ui/custom-popover"
import { CurrencySelector } from "@/components/store/currency/CurrencySelector"

interface DesktopNavProps {
  className?: string
  user: CurrentUser | null
}

export default function DesktopNav({ user, className }: DesktopNavProps) {
  return (
    <div className={cn("hidden md:flex md:items-center md:gap-5", className)}>
      {/* 1. مبدل العملة متاح دائماً للجميع */}
      <CurrencySelector />

      {/* 2. قسم الإجراءات والمستخدم */}
      {user ? (
        <div className="flex items-center gap-6">
          {/* Search */}
          <button
            type="button"
            className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Search"
          >
            <SearchIcon className="size-4" />
          </button>

          {/* Shopping Cart */}
          <Link
            href="/cart"
            className="relative cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingCartIcon className="size-4" />
          </Link>

          {/* User Menu */}
          <UserMenu user={user} />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <CustomButton
            size="sm"
            variant="outline"
            className="text-[11px] font-medium"
            asChild
          >
            <Link href={appRoutes.auth.login}>Login</Link>
          </CustomButton>
          <CustomButton size="sm" className="text-[11px] font-medium" asChild>
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
      <CustomPopoverTrigger>
        <Avatar className="size-8 cursor-pointer ring-1 ring-border transition-opacity hover:opacity-90">
          <AvatarImage src={user.profile_image} />
          <AvatarFallback className="p-1.5">
            <UserIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
      </CustomPopoverTrigger>
      <CustomPopoverContent align="end" className="gap-0 rounded-sm">
        <CustomPopoverHeader>
          <UserProfile user={user} />
        </CustomPopoverHeader>
        <Separator />
        {appConfig.menu.userMenu.items.map((item) => (
          <CustomButton
            key={item.href}
            size="lg"
            variant="ghost"
            className="flex items-center justify-start text-xs font-normal"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="size-3" />
              {item.label}
            </Link>
          </CustomButton>
        ))}
        <Separator />
        {appConfig.menu.supportLinks.items.map((item) => (
          <CustomButton
            key={item.href}
            size="lg"
            variant="ghost"
            className="flex items-center justify-start text-xs font-normal"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="size-3" />
              {item.label}
            </Link>
          </CustomButton>
        ))}
        <Separator />
        <CustomButton
          size="lg"
          variant="ghost"
          className="flex items-center justify-start text-xs font-normal text-destructive hover:text-destructive/90"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-3" />
          Logout
        </CustomButton>
      </CustomPopoverContent>
    </CustomPopover>
  )
}
