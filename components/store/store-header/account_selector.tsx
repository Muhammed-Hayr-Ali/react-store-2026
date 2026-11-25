"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  ChevronDown,
  LogIn,
  LogOutIcon,
  Package,
  UserIcon,
  UserPlus,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import { APP_ROUTES } from "@/lib/config/app-routes"
import { useUser } from "@/lib/context/user-context"
import { signInWithGoogle, signOut } from "@/lib/actions/authentication"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LogoutAlertDialog } from "@/components/shared/logout-alert"

const getMenuItemClass = (isSelected = false) =>
  cn(
    "group flex min-h-8 w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-normal transition-colors hover:bg-muted",
    isSelected ? "bg-muted/70 text-primary" : "text-foreground/85"
  )

export function AccountSelector() {
  const { user } = useUser()
  const locale = useLocale()
  const t = useTranslations("StoreHeader")
  const [open, setOpen] = React.useState(false)
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false)

  const isRtl = ["ar", "fa", "ur", "he"].includes(locale)
  const dir = isRtl ? "rtl" : "ltr"

  const handleGoogleSignIn = async () => {
    if (user) return
    setOpen(false)
    const result = await signInWithGoogle()

    if (!result.success) {
      const errorMessage = result.error
        ? getActionErrorKey(result.error)
        : t("SIGN_IN_FAILED_FALLBACK")
      toast.error(t(errorMessage))
      return
    }

    window.location.href = result.data.url
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("accountMenu")}
            className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-normal text-foreground/85 transition-colors hover:bg-muted/60 hover:text-primary"
          >
            <UserIcon className="size-5 lg:size-4" />
            <span className="hidden lg:inline">{t("account")}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-52 p-1.5 font-normal">
          {user ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-2 py-1.5">
                <Avatar className="size-9 shrink-0 border-0 shadow-none ring-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-[10px] font-normal">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p
                    className="truncate text-xs leading-tight font-normal text-foreground"
                    title={user.name}
                  >
                    {user.name}
                  </p>

                  <p
                    dir={dir}
                    className="mt-0.5 truncate font-mono text-[11px] leading-tight text-muted-foreground"
                    title={`${user.role}/${user.username}`}
                  >
                    <bdi>{user.role}</bdi>/<bdi>{user.username}</bdi>
                  </p>
                </div>
              </div>

              <div className="my-1 border-t border-border/60" />

              <Link
                href={APP_ROUTES.ACCOUNT}
                onClick={() => setOpen(false)}
                className={getMenuItemClass(false)}
              >
                <span className="flex items-center gap-2.5 group-hover:text-primary">
                  <UserIcon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  <span>{t("profile")}</span>
                </span>
              </Link>

              <Link
                href={`${APP_ROUTES.ACCOUNT}/orders`}
                onClick={() => setOpen(false)}
                className={getMenuItemClass(false)}
              >
                <span className="flex items-center gap-2.5 group-hover:text-primary">
                  <Package className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  <span>{t("my_orders")}</span>
                </span>
              </Link>

              <div className="my-1 border-t border-border/60" />

              <button
                type="button"
                onClick={() => setOpenAlertDialog(true)}
                className={getMenuItemClass(false)}
              >
                <span className="flex items-center gap-2.5 group-hover:text-destructive">
                  <LogOutIcon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-destructive" />
                  <span>{t("log_out")}</span>
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href={APP_ROUTES.AUTH.SIGNUP}
                onClick={() => setOpen(false)}
                className={getMenuItemClass(false)}
              >
                <span className="flex items-center gap-2.5 group-hover:text-primary">
                  <UserPlus className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  <span>{t("signUp")}</span>
                </span>
              </Link>

              <Link
                href={APP_ROUTES.AUTH.LOGIN}
                onClick={() => setOpen(false)}
                className={getMenuItemClass(false)}
              >
                <span className="flex items-center gap-2.5 group-hover:text-primary">
                  <LogIn className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  <span>{t("signIn")}</span>
                </span>
              </Link>

              <div className="my-1 border-t border-border/60" />

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className={getMenuItemClass(false)}
              >
                <span className="flex items-center gap-2.5 group-hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>{t("CONTINUE_WITH_GOOGLE")}</span>
                </span>
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <LogoutAlertDialog
        open={openAlertDialog}
        onOpenChange={setOpenAlertDialog}
      />
    </>
  )
}
