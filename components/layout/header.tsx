"use client"

import * as React from "react"
import Link from "next/link"
import { redirect, usePathname, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"

// ─────────────────────────────────────────────────────────────
// 🧩 UI Components
// ─────────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  MobileMenu,
  MobileMenuHeader,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuItem,
} from "@/components/ui/mobile-menu"

// ─────────────────────────────────────────────────────────────
// 📦 Shared & Config
// ─────────────────────────────────────────────────────────────
import { AppLogo } from "@/components/shared/app-logo"
import MenuButton from "@/components/shared/menu_button"
import NotificationBell from "@/components/notifications/NotificationBell"
import { siteConfig } from "@/lib/config/site_config"
import { appRouter } from "@/lib/app-routes"
import { useAuth } from "@/lib/providers/auth-provider"

// ─────────────────────────────────────────────────────────────
// 🎨 Icons
// ─────────────────────────────────────────────────────────────
import { Bell, SearchIcon, LogInIcon, UserPlus, CheckIcon } from "lucide-react"
import {
  UserIcon,
  GlobeIcon,
  ThemeModeIcon,
  HomeIcon,
  PackageIcon,
  LifeBuoyIcon,
  BookIcon,
} from "@/components/shared/icons"

// ============================================================================
// 🔗 SafeLink: رابط آمن يمنع أخطاء href=undefined (بدون تعديل الروابط الأصلية)
// ============================================================================
function SafeLink({
  href,
  children,
  className,
  ...props
}: {
  href: string | undefined
  children: React.ReactNode
  className?: string
} & Omit<React.ComponentProps<typeof Link>, "href" | "children">) {
  if (!href)
    return (
      <span className={className ?? "opacity-50"} {...props}>
        {children}
      </span>
    )
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  )
}

// ============================================================================
// 🎣 Custom Hook: منطق الهيدر (مركّز ومُحسّن)
// ============================================================================
function useHeaderLogic() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const t = useTranslations("Header")
  const { profile, user, signOut, isLoading } = useAuth()

  const avatar = React.useMemo(
    () => profile?.avatar_url ?? null,
    [profile?.avatar_url]
  )
  const menuItems = React.useMemo(
    () => (user ? siteConfig.userMenuItems : []),
    [user]
  )

  const handleLogout = React.useCallback(async () => {
    await signOut()
    router.refresh()
  }, [signOut, router])
  const handleLocaleChange = React.useCallback(
    (loc: string) => redirect(`/${loc}${pathname}`),
    [pathname]
  )
  const handleThemeChange = React.useCallback(
    (th: string) => setTheme(th),
    [setTheme]
  )

  return {
    router,
    pathname,
    theme,
    locale,
    t,
    profile,
    user,
    isLoading,
    avatar,
    menuItems,
    handleLogout,
    handleLocaleChange,
    handleThemeChange,
  } as const
}

// ============================================================================
// 🧩 Shared: عرض عناصر القائمة (نمط واحد للسطح المكتب والجوال)
// ============================================================================
type MenuItem = (typeof siteConfig.userMenuItems)[number]

function MenuItemsList({
  items,
  t,
  mode,
}: {
  items: MenuItem[]
  t: ReturnType<typeof useTranslations>
  mode: "mobile" | "desktop"
}) {
  return (
    <>
      {items.map((item) => {
        const content = (
          <>
            <item.icon className="h-4 w-4" />
            <span>{t(`menuItems.${item.key}`)}</span>
          </>
        )
        return mode === "mobile" ? (
          <MobileMenuItem
            key={item.key}
            href={item.href ?? "#"}
            icon={item.icon}
          >
            {t(`menuItems.${item.key}`)}
          </MobileMenuItem>
        ) : (
          <DropdownMenuItem asChild key={item.key}>
            <SafeLink href={item.href}>{content}</SafeLink>
          </DropdownMenuItem>
        )
      })}
    </>
  )
}

// ============================================================================
// 🎨 Shared: مكون الاختيارات الموحد (لغة/سمة) - يلغي التكرار
// ============================================================================
function Selector({
  title,
  Icon,
  options,
  selected,
  onSelect,
  mode,
}: {
  title: string
  Icon: React.ElementType
  options: { key: string; label: string }[]
  selected: string
  onSelect: (k: string) => void
  mode: "mobile" | "desktop"
}) {
  const Option = ({ opt }: { opt: { key: string; label: string } }) => (
    <>
      {mode === "mobile" ? (
        <MobileMenuItem
          className={selected === opt.key ? "" : "ml-9 rtl:mr-9 rtl:ml-0"}
          onClick={() => onSelect(opt.key)}
        >
          {selected === opt.key && (
            <CheckIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
          )}
          {opt.label}
        </MobileMenuItem>





      ) : (
        <DropdownMenuCheckboxItem
          checked={selected === opt.key}
          onCheckedChange={() => onSelect(opt.key)}
        >
          {opt.label}
        </DropdownMenuCheckboxItem>
      )}
    </>
  )

  if (mode === "mobile") {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value={title}>
          <AccordionTrigger className="p-0">
            <MobileMenuItem icon={Icon} className="w-auto">
              {title}
            </MobileMenuItem>
          </AccordionTrigger>
          <AccordionContent>
            {options.map((opt) => (
              <Option key={opt.key} opt={opt} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon className="h-4 w-4" />
        {title}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {options.map((opt) => (
            <Option key={opt.key} opt={opt} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

// ============================================================================
// 👤 Desktop: قائمة المستخدم (تستقبل البيانات عبر الـ props فقط)
// ============================================================================
function DesktopUserMenu({ avatar }: { avatar: string | null }) {
  const {
    theme,
    locale,
    t,
    user,
    isLoading,
    profile,
    menuItems,
    handleLogout,
    handleLocaleChange,
    handleThemeChange,
  } = useHeaderLogic()

  const languages = React.useMemo(
    () => [
      { key: "ar", label: t("menuItems.arabic") },
      { key: "en", label: t("menuItems.english") },
    ],
    [t]
  )

  const themes = React.useMemo(
    () => [
      { key: "system", label: t("menuItems.system") },
      { key: "dark", label: t("menuItems.dark") },
      { key: "light", label: t("menuItems.light") },
    ],
    [t]
  )

  if (isLoading)
    return <div className="size-8 animate-pulse rounded-full bg-muted" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="overflow-hidden rounded-full shadow-none"
        >
          <Avatar>
            <AvatarImage
              src={avatar ?? undefined}
              alt={profile?.full_name ?? ""}
            />
            <AvatarFallback className="p-0">
              <UserIcon className="size-4 text-foreground" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-62"
        align={locale === "ar" ? "start" : "end"}
      >
        {/* Quick Links */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <SafeLink href={appRouter.home}>
              <HomeIcon className="h-4 w-4" />
              {t("menuItems.home")}
            </SafeLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <SafeLink href={appRouter.home}>
              <PackageIcon className="h-4 w-4" />
              {t("menuItems.products")}
            </SafeLink>
          </DropdownMenuItem>

          {user && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t("menuItems.account")}</DropdownMenuLabel>
              <MenuItemsList items={menuItems} t={t} mode="desktop" />
            </>
          )}
        </DropdownMenuGroup>

        {/* Preferences */}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Selector
            title={t("menuItems.language")}
            Icon={GlobeIcon}
            options={languages}
            selected={locale}
            onSelect={handleLocaleChange}
            mode="desktop"
          />
          <Selector
            title={t("menuItems.theme")}
            Icon={ThemeModeIcon}
            options={themes}
            selected={theme ?? "system"}
            onSelect={handleThemeChange}
            mode="desktop"
          />
        </DropdownMenuGroup>

        {/* Support */}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <SafeLink href={appRouter.home}>
              <LifeBuoyIcon className="h-4 w-4" />
              {t("menuItems.support")}
            </SafeLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <SafeLink href={appRouter.home}>
              <BookIcon className="h-4 w-4" />
              {t("menuItems.documentation")}
            </SafeLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Auth Actions */}
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={handleLogout}>
            {t("signOut")}
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <SafeLink href={appRouter.signIn}>
                <LogInIcon className="h-4 w-4" />
                {t("signIn")}
              </SafeLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <SafeLink href={appRouter.signUp}>
                <UserPlus className="h-4 w-4" />
                {t("createAccount")}
              </SafeLink>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// 📱 Mobile: محتوى القائمة (يعيد استخدام المكونات المشتركة)
// ============================================================================
function MobileMenuContent() {
  const { theme, locale, t, menuItems, handleLocaleChange, handleThemeChange } =
    useHeaderLogic()

  const languages = React.useMemo(
    () => [
      { key: "ar", label: t("menuItems.arabic") },
      { key: "en", label: t("menuItems.english") },
    ],
    [t]
  )

  const themes = React.useMemo(
    () => [
      { key: "system", label: t("menuItems.system") },
      { key: "dark", label: t("menuItems.dark") },
      { key: "light", label: t("menuItems.light") },
    ],
    [t]
  )

  return (
    <>
      <MobileMenuItem href={appRouter.home ?? "#"} icon={HomeIcon}>
        {t("menuItems.home")}
      </MobileMenuItem>
      <MobileMenuItem href={appRouter.home ?? "#"} icon={PackageIcon}>
        {t("menuItems.products")}
      </MobileMenuItem>
      <MenuItemsList items={menuItems} t={t} mode="mobile" />
      <Selector
        title={t("menuItems.language")}
        Icon={GlobeIcon}
        options={languages}
        selected={locale}
        onSelect={handleLocaleChange}
        mode="mobile"
      />
      <Selector
        title={t("menuItems.theme")}
        Icon={ThemeModeIcon}
        options={themes}
        selected={theme ?? "system"}
        onSelect={handleThemeChange}
        mode="mobile"
      />
      <MobileMenuItem href={appRouter.home ?? "#"} icon={LifeBuoyIcon}>
        {t("menuItems.support")}
      </MobileMenuItem>
      <MobileMenuItem href={appRouter.home ?? "#"} icon={BookIcon}>
        {t("menuItems.documentation")}
      </MobileMenuItem>
    </>
  )
}

// ============================================================================
// 🚀 Main Header Component
// ============================================================================
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { profile, user, isLoading, avatar, handleLogout, t } = useHeaderLogic()

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <div className="flex basis-1/3 items-center justify-start">
            <AppLogo size="sm" />
          </div>
          <div className="flex basis-1/3 items-center justify-center">
            <Button variant="secondary" className="w-full shadow-none">
              <SearchIcon className="size-4" />
              <span>{t("search")}</span>
            </Button>
          </div>
          <nav className="flex basis-1/3 items-center justify-end gap-4">
            <div className="hidden items-center gap-4 lg:flex">
              <NotificationBell className="rounded-full">
                <Bell className="size-3.5" />
              </NotificationBell>
              <DesktopUserMenu avatar={avatar} />
            </div>
            <MenuButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="block lg:hidden"
            />
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <MobileMenuHeader className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage
              src={avatar ?? undefined}
              alt={profile?.full_name ?? ""}
            />
            <AvatarFallback className="p-1.5">
              <UserIcon className="size-max text-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-base leading-none font-semibold">
              {profile?.full_name ?? "Guest"}
            </span>
            <span className="text-sm text-muted-foreground">
              {profile?.email ?? ""}
            </span>
          </div>
        </MobileMenuHeader>

        <MobileMenuBody>
          <MobileMenuContent />
        </MobileMenuBody>

        <MobileMenuFooter>
          {isLoading ? (
            <Button variant="ghost" className="w-full" disabled>
              Loading...
            </Button>
          ) : user ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              {t("signOut")}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" asChild>
                <SafeLink href={appRouter.signIn}>{t("signIn")}</SafeLink>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <SafeLink href={appRouter.signUp}>
                  {t("createAccount")}
                </SafeLink>
              </Button>
            </div>
          )}
        </MobileMenuFooter>
      </MobileMenu>
    </>
  )
}
