"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  ChevronDown,
  LayoutDashboard,
  Loader2Icon,
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
import { useIsMobile } from "@/hooks/use-mobile"
import { signInWithGoogle } from "@/lib/actions/authentication"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTrigger,
} from "@/components/shared/bottom-sheet"
import { LogoutAlertDialog } from "@/components/shared/logout-alert"
import {
  headerActionClass,
  isRtlLocale,
  menuItemClass,
} from "./store-header-shared"

const iconClass =
  "size-3.5 shrink-0 text-muted-foreground group-hover:text-primary"
const labelClass = "flex items-center gap-2.5 group-hover:text-primary"

interface AccountMenuContentProps {
  user: ReturnType<typeof useUser>["user"]
  dir: "rtl" | "ltr"
  isGoogleLoading: boolean
  onClose: () => void
  onGoogleSignIn: () => Promise<void>
  onOpenLogout: () => void
  t: ReturnType<typeof useTranslations>
}

function AccountMenuContent({
  user,
  dir,
  isGoogleLoading,
  onClose,
  onGoogleSignIn,
  onOpenLogout,
  t,
}: AccountMenuContentProps) {
  if (user) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar className="size-9 shrink-0 border-0 shadow-none ring-0">
            <AvatarImage src={user.avatar} alt="" />
            <AvatarFallback className="text-[10px] font-normal">
              {user.initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p
              className="truncate text-[13px] leading-tight font-normal text-foreground"
              title={user.name}
            >
              {user.name}
            </p>

            <p
              dir={dir}
              className="mt-0.5 truncate text-start font-mono text-[11px] leading-tight text-muted-foreground"
              title={`${user.role}/${user.username}`}
            >
              <bdi>{user.role}</bdi>/<bdi>{user.username}</bdi>
            </p>
          </div>
        </div>

        <div className="my-1 border-t border-border/60" />

        <Link
          href={APP_ROUTES.ACCOUNT}
          onClick={onClose}
          className={menuItemClass()}
        >
          <span className={labelClass}>
            <UserIcon aria-hidden="true" className={iconClass} />
            <span>{t("profile")}</span>
          </span>
        </Link>

        <Link
          href={`${APP_ROUTES.ACCOUNT}/orders`}
          onClick={onClose}
          className={menuItemClass()}
        >
          <span className={labelClass}>
            <Package aria-hidden="true" className={iconClass} />
            <span>{t("my_orders")}</span>
          </span>
        </Link>

        {user.role === "admin" && (
          <Link
            href={APP_ROUTES.DASHBOARD.OVERVIEW}
            onClick={onClose}
            className={menuItemClass()}
          >
            <span className={labelClass}>
              <LayoutDashboard aria-hidden="true" className={iconClass} />
              <span>{t("dashboard")}</span>
            </span>
          </Link>
        )}

        <div className="my-1 border-t border-border/60" />

        <button
          type="button"
          onClick={() => {
            onClose()
            onOpenLogout()
          }}
          className={menuItemClass()}
        >
          <span className="flex items-center gap-2.5 group-hover:text-destructive">
            <LogOutIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground group-hover:text-destructive"
            />
            <span>{t("log_out")}</span>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Link
        href={APP_ROUTES.AUTH.SIGNUP}
        onClick={onClose}
        className={menuItemClass()}
      >
        <span className={labelClass}>
          <UserPlus aria-hidden="true" className={iconClass} />
          <span>{t("signUp")}</span>
        </span>
      </Link>

      <Link
        href={APP_ROUTES.AUTH.LOGIN}
        onClick={onClose}
        className={menuItemClass()}
      >
        <span className={labelClass}>
          <LogIn aria-hidden="true" className={iconClass} />
          <span>{t("signIn")}</span>
        </span>
      </Link>

      <div className="my-1 border-t border-border/60" />

      <button
        type="button"
        disabled={isGoogleLoading}
        onClick={onGoogleSignIn}
        className={menuItemClass()}
      >
        <span className={labelClass}>
          {isGoogleLoading ? (
            <Loader2Icon
              aria-hidden="true"
              className="size-3.5 shrink-0 animate-spin text-primary"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={iconClass}
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
          )}
          <span>{t("CONTINUE_WITH_GOOGLE")}</span>
        </span>
      </button>
    </div>
  )
}

export function AccountSelector() {
  const { user } = useUser()
  const locale = useLocale()
  const isMobile = useIsMobile()
  const t = useTranslations("StoreHeader")
  const [open, setOpen] = React.useState(false)
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

  const dir = isRtlLocale(locale) ? "rtl" : "ltr"

  // الرجوع من صفحة Google قد يستعيد الصفحة من bfcache وزر التحميل عالق
  React.useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsGoogleLoading(false)
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  const handleGoogleSignIn = async () => {
    if (user || isGoogleLoading) return
    setIsGoogleLoading(true)

    try {
      const result = await signInWithGoogle()

      if (!result.success) {
        // نختار المفتاح أولاً ثم نترجمه مرة واحدة فقط
        const errorKey = result.error
          ? getActionErrorKey(result.error)
          : "SIGN_IN_FAILED_FALLBACK"
        toast.error(t(errorKey))
        setIsGoogleLoading(false)
        return
      }

      setOpen(false)
      window.location.href = result.data.url
    } catch {
      toast.error(t("SIGN_IN_FAILED_FALLBACK"))
      setIsGoogleLoading(false)
    }
  }

  const triggerButton = (
    <button
      type="button"
      aria-label={t("accountMenu")}
      className={headerActionClass}
    >
      <UserIcon aria-hidden="true" className="size-5 lg:size-4" />
      <span className="hidden lg:inline">{t("account")}</span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "hidden size-3 text-muted-foreground transition-transform duration-200 lg:block",
          open && "rotate-180"
        )}
      />
    </button>
  )

  const sharedContentProps: AccountMenuContentProps = {
    user,
    dir,
    isGoogleLoading,
    onClose: () => setOpen(false),
    onGoogleSignIn: handleGoogleSignIn,
    onOpenLogout: () => setOpenAlertDialog(true),
    t,
  }

  return (
    <>
      {isMobile ? (
        <BottomSheet open={open} onOpenChange={setOpen}>
          <BottomSheetTrigger asChild>{triggerButton}</BottomSheetTrigger>
          <BottomSheetContent ariaLabel={t("accountMenu")}>
            <BottomSheetHeader>
              <span className="text-sm font-normal text-foreground">
                {t("accountMenu")}
              </span>
            </BottomSheetHeader>
            <BottomSheetBody className="px-2 py-2">
              <AccountMenuContent {...sharedContentProps} />
            </BottomSheetBody>
          </BottomSheetContent>
        </BottomSheet>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent align="end" className="w-52 p-1.5 font-normal">
            <AccountMenuContent {...sharedContentProps} />
          </PopoverContent>
        </Popover>
      )}

      <LogoutAlertDialog
        open={openAlertDialog}
        onOpenChange={setOpenAlertDialog}
      />
    </>
  )
}
