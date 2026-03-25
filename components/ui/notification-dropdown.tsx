"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { BellIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "./button"
import { Tabs, TabsList, TabsTrigger } from "./tabs"

const NotificationDropdown = DropdownMenuPrimitive.Root

const NotificationDropdownTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Trigger>
))
NotificationDropdownTrigger.displayName = "NotificationDropdownTrigger"

const NotificationDropdownContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className = "end", sideOffset = 8, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <div dir="rtl" className="rtl">
        <DropdownMenuPrimitive.Content
          ref={ref}
          align="start"
          sideOffset={sideOffset}
          className={cn(
            "rtl z-50 w-90 overflow-hidden rounded-2xl border bg-popover shadow-lg",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            className
          )}
          {...props}
        />
      </div>
    </DropdownMenuPrimitive.Portal>
  )
})
NotificationDropdownContent.displayName = "NotificationDropdownContent"

const NotificationTriggerIcon = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { unreadCount?: number }
>(({ className, unreadCount = 0, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-105 hover:bg-muted active:scale-95",
      className
    )}
    {...props}
  >
    <BellIcon className="h-5 w-5" />
    {unreadCount > 0 && (
      <span
        className={cn(
          badgeVariants({ variant: "destructive" }),
          "absolute -top-1 -right-1 flex h-5 w-5 min-w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold shadow-md ring-2 ring-popover rtl:-top-1 rtl:-left-1",
          unreadCount > 9 && "w-6 min-w-6 text-[9px]"
        )}
      >
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </button>
))
NotificationTriggerIcon.displayName = "NotificationTriggerIcon"

const NotificationHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    onSeeAll?: () => void
    showSeeAll?: boolean
    showActions?: boolean
    children?: React.ReactNode
  }
>(
  (
    {
      className,
      title,
      onSeeAll,
      showSeeAll = true,
      showActions = false,
      children,
      ...props
    },
    ref
  ) => {
    const t = useTranslations("Notifications")

    return (
      <div
        ref={ref}
        dir="rtl"
        className={cn(
          "rtl sticky top-0 z-10 flex items-center justify-between bg-popover px-2 py-3.5",
          className
        )}
        {...props}
      >
        <h3 className="text-sm font-semibold">{title ?? t("title")}</h3>
        <div className="flex items-center gap-2 rtl:flex-row-reverse">
          {children}
          {showSeeAll && (
            <Button size="xs" variant="default" onClick={onSeeAll}>
              {t("seeAll")}
            </Button>
          )}
        </div>
      </div>
    )
  }
)
NotificationHeader.displayName = "NotificationHeader"

const NotificationTabs = React.forwardRef<
  React.ComponentRef<typeof Tabs>,
  React.ComponentPropsWithoutRef<typeof Tabs> & {
    activeTab?: "today" | "week" | "earlier"
    onTabChange?: (tab: "today" | "week" | "earlier") => void
  }
>(({ className, activeTab = "today", onTabChange, ...props }, ref) => {
  const t = useTranslations("Notifications")

  return (
    <Tabs
      ref={ref}
      value={activeTab}
      onValueChange={(value) =>
        onTabChange?.(value as "today" | "week" | "earlier")
      }
      dir="rtl"
      className={cn("rtl w-full px-2 pb-3.5", className)}
      {...props}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="today">{t("tabs.today")}</TabsTrigger>
        <TabsTrigger value="week">{t("tabs.week")}</TabsTrigger>
        <TabsTrigger value="earlier">{t("tabs.earlier")}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
})
NotificationTabs.displayName = "NotificationTabs"

const NotificationTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
))
NotificationTitle.displayName = "NotificationTitle"

const NotificationAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "text-xs text-primary transition-colors hover:text-primary/80 hover:underline",
      className
    )}
    {...props}
  />
))
NotificationAction.displayName = "NotificationAction"

const NotificationBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      dir="rtl"
      className={cn("rtl max-h-80 overflow-y-auto", className)}
      {...props}
    />
  )
})
NotificationBody.displayName = "NotificationBody"

const NotificationEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const t = useTranslations("Notifications")

  return (
    <div
      ref={ref}
      dir="rtl"
      className={cn(
        "rtl flex flex-col items-center justify-center gap-3 py-16 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-muted to-muted/50 shadow-inner">
        <BellIcon className="h-7 w-7 text-muted-foreground opacity-60" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{t("empty.title")}</p>
        <p className="text-xs text-muted-foreground">
          {t("empty.description")}
        </p>
      </div>
    </div>
  )
})
NotificationEmpty.displayName = "NotificationEmpty"

const NotificationItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    unread?: boolean
  }
>(({ className, unread = false, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      dir="rtl"
      className={cn(
        "group relative cursor-pointer border-b py-2.5 ps-8 pe-2 transition-all last:border-0 hover:bg-muted/50",
        unread && "bg-muted/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
NotificationItem.displayName = "NotificationItem"

const NotificationItemIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-linear-to-br from-background to-muted/20",
      className
    )}
    {...props}
  />
))
NotificationItemIcon.displayName = "NotificationItemIcon"

const NotificationItemColorDot = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("h-1.5 w-1.5 shrink-0 rounded-full shadow-sm", className)}
    {...props}
  />
))
NotificationItemColorDot.displayName = "NotificationItemColorDot"

const NotificationItemTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[13px] leading-tight font-semibold", className)}
    {...props}
  />
))
NotificationItemTitle.displayName = "NotificationItemTitle"

const NotificationItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mt-0.5 text-[11px] leading-relaxed text-muted-foreground",
      className
    )}
    {...props}
  />
))
NotificationItemDescription.displayName = "NotificationItemDescription"

const NotificationItemTime = React.forwardRef<
  HTMLTimeElement,
  React.TimeHTMLAttributes<HTMLTimeElement>
>(({ className, ...props }, ref) => (
  <time
    ref={ref}
    className={cn(
      "absolute end-2 top-2.5 block text-[9px] font-medium text-muted-foreground/80",
      className
    )}
    {...props}
  />
))
NotificationItemTime.displayName = "NotificationItemTime"

export {
  NotificationDropdown,
  NotificationDropdownTrigger,
  NotificationDropdownContent,
  NotificationTriggerIcon,
  NotificationHeader,
  NotificationTitle,
  NotificationAction,
  NotificationBody,
  NotificationEmpty,
  NotificationItem,
  NotificationItemIcon,
  NotificationItemTitle,
  NotificationItemColorDot,
  NotificationItemDescription,
  NotificationItemTime,
  NotificationTabs,
}
