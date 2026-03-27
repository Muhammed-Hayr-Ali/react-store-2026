"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "@/components/notifications/types"
import { BellSimpleIcon } from "@phosphor-icons/react"
import {
  Bell,
  CheckCheck,
  Package,
  ShoppingCart,
  Tag,
  TrendingUp,
  MoreVertical,
  Trash,
  Trash2,
} from "lucide-react"
import { ProgressBar } from "@/components/ui/progress-bar"

// --- Helper Functions ---

function getUnreadColor(count: number) {
  if (count > 50) return "bg-rose-500 dark:bg-rose-600"
  if (count > 10) return "bg-amber-500 dark:bg-amber-600"
  if (count > 0) return "bg-zinc-600 dark:bg-zinc-500"
  return "bg-transparent"
}

// --- UI Sub-components ---

// Notification Trigger
const NotificationTriggerIcon = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { unreadCount: number }
>(({ className, unreadCount, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "group relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800",
      className
    )}
    {...props}
  >
    <BellSimpleIcon
      size={18}
      strokeWidth={1.5}
      className="text-zinc-700 dark:text-zinc-300"
    />
    {unreadCount > 0 && (
      <div
        className={cn(
          "absolute top-1 right-1 flex size-2 rounded-full rtl:right-auto rtl:left-1",
          getUnreadColor(unreadCount)
        )}
      />
    )}
  </button>
))
NotificationTriggerIcon.displayName = "NotificationTriggerIcon"

// Notification Header
const NotificationHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
  }
>(({ className, title, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 items-center justify-between border-zinc-200/60 pr-2 pl-3 rtl:pr-3 rtl:pl-2 dark:border-zinc-700/50",
      className
    )}
    {...props}
  >
    <h3 className="text-xs tracking-wide text-zinc-900 dark:text-zinc-100">
      {title}
    </h3>
    <div className="flex items-center gap-0.5">{children}</div>
  </div>
))
NotificationHeader.displayName = "NotificationHeader"

// Notification Tabs
const NotificationTabs = React.forwardRef<
  HTMLDivElement,
  { activeTab: string; onTabChange: (value: string) => void }
>(({ activeTab, onTabChange }, ref) => {
  const t = useTranslations("Notifications")
  const locale = useLocale()
  return (
    <div ref={ref} className="px-0.5">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full" dir={locale === "ar" ? "rtl" : "ltr"}>
        <TabsList className="grid h-7 w-full grid-cols-3 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800/60">
          
          
          <TabsTrigger
            value="today"
            className="rounded-sm text-[10px] font-medium text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:bg-zinc-700/80 dark:data-[state=active]:text-zinc-100"
          >
            {t("tabs.today")}
          </TabsTrigger>
          <TabsTrigger
            value="week"
            className="rounded-sm text-[10px] font-medium text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:bg-zinc-700/80 dark:data-[state=active]:text-zinc-100"
          >
            {t("tabs.week")}
          </TabsTrigger>
          <TabsTrigger
            value="earlier"
            className="rounded-sm text-[10px] font-medium text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:bg-zinc-700/80 dark:data-[state=active]:text-zinc-100"
          >
            {t("tabs.earlier")}
      
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
})
NotificationTabs.displayName = "NotificationTabs"

// Notification Body
const NotificationBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("scrollbar-thin max-h-80 overflow-y-auto", className)}
    {...props}
  />
))
NotificationBody.displayName = "NotificationBody"

// Notification Empty
const NotificationEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const t = useTranslations("Notifications")
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 py-12 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100/80 dark:bg-zinc-800/60">
        <BellSimpleIcon
          size={24}
          className="text-zinc-400 dark:text-zinc-500"
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
          {t("empty.title")}
        </p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
          {t("empty.description")}
        </p>
      </div>
    </div>
  )
})
NotificationEmpty.displayName = "NotificationEmpty"

// Notification Item
const NotificationItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { unread?: boolean }
>(({ className, unread = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative cursor-pointer border-b border-zinc-100/60 px-4 py-3 transition-colors duration-150 last:border-0 hover:bg-zinc-50/50 dark:border-zinc-800/40 dark:hover:bg-zinc-800/20",
      unread && "bg-zinc-50/40 dark:bg-zinc-800/10",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
NotificationItem.displayName = "NotificationItem"

// Notification Item Icon
const NotificationItemIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100/80 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
      className
    )}
    {...props}
  />
))
NotificationItemIcon.displayName = "NotificationItemIcon"

// Notification Item Title
const NotificationItemTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-xs leading-tight font-medium text-zinc-900 dark:text-zinc-100",
      className
    )}
    {...props}
  />
))
NotificationItemTitle.displayName = "NotificationItemTitle"

// Notification Item Description
const NotificationItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mt-0.5 text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400",
      className
    )}
    {...props}
  />
))
NotificationItemDescription.displayName = "NotificationItemDescription"

// Notification Item Time
const NotificationItemTime = React.forwardRef<
  HTMLTimeElement,
  React.TimeHTMLAttributes<HTMLTimeElement>
>(({ className, ...props }, ref) => (
  <time
    ref={ref}
    className={cn(
      "absolute inset-e-4 top-3 block text-[9px] font-light text-zinc-400 dark:text-zinc-500",
      className
    )}
    {...props}
  />
))
NotificationItemTime.displayName = "NotificationItemTime"

// Notification Item Color Dot
const NotificationItemColorDot = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("h-1.5 w-1.5 shrink-0 rounded-full", className)}
    {...props}
  />
))
NotificationItemColorDot.displayName = "NotificationItemColorDot"

// --- Main Component ---
// --- Types ---
interface NotificationBellProps {
  initialNotifications?: Notification[]
  children?: React.ReactNode
  className?: string
}

export default function NotificationBell({
  initialNotifications = [],
  children,
  className,
  ...props
}: NotificationBellProps) {
  const locale = useLocale()
  const t = useTranslations("Notifications")
  const [activeTab, setActiveTab] = useState<"today" | "week" | "earlier">(
    "today"
  )

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    handleMarkAsRead,
    handleMarkAllRead,
    handleDeleteAll,
    handleDeleteRead,
  } = useNotifications(initialNotifications)

  const displayNotifications = notifications.filter((notification) => {
    const now = new Date()
    const notificationDate = new Date(notification.created_at)
    const diffHours =
      (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60)
    const diffDays = diffHours / 24

    if (activeTab === "today") return diffHours <= 24
    if (activeTab === "week") return diffHours > 24 && diffDays <= 7
    return diffDays > 7
  })

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        handleMarkAsRead(notification.id)
      }
      if (notification.link) {
        window.location.href = notification.link
      }
    },
    [handleMarkAsRead]
  )

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return {
          icon: <Package className="h-4 w-4" />,
          dotColor: "bg-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
        }
      case "promo":
        return {
          icon: <Tag className="h-4 w-4" />,
          dotColor: "bg-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        }
      case "sale":
        return {
          icon: <ShoppingCart className="h-4 w-4" />,
          dotColor: "bg-orange-500",
          bgColor: "bg-orange-50 dark:bg-orange-950/30",
        }
      case "analytics":
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          dotColor: "bg-purple-500",
          bgColor: "bg-purple-50 dark:bg-purple-950/30",
        }
      default:
        return {
          icon: <Bell className="h-4 w-4" />,
          dotColor: "bg-zinc-500",
          bgColor: "bg-zinc-50 dark:bg-zinc-950/30",
        }
    }
  }

  const formatNotificationTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return t("time.now")
    if (diffMins < 60) return t("time.minutesAgo", { minutes: diffMins })
    if (diffHours < 24) return t("time.hoursAgo", { hours: diffHours })
    if (diffDays < 7) return t("time.daysAgo", { days: diffDays })
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* <NotificationTriggerIcon unreadCount={unreadCount} /> */}
        <Button
          size="icon"
          variant="secondary"
          className={cn("relative", className)}
          {...props}
        >
      { unreadCount > 0 &&   <div className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500  font-light text-white text-[10px] rtl:right-auto rtl:-left-1">
            {unreadCount}
          </div>}
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="relative w-72 gap-0 overflow-hidden rounded-lg border border-zinc-200/60 bg-white p-0 shadow-lg dark:border-zinc-700/50 dark:bg-zinc-950"
      >
        {isLoading ? (
          <ProgressBar className="h-0.5" />
        ) : (
          <div className="h-0.5" />
        )}
        <NotificationHeader title={t("title")}>
          {displayNotifications.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className="h-6 w-6 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <MoreVertical className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-40"
                align={locale === "ar" ? "start" : "end"}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={unreadCount === 0}
                    onClick={handleMarkAllRead}
                    className="gap-2 text-xs"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>{t("actions.markAllRead")}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={
                      notifications.filter((n) => n.is_read).length === 0
                    }
                    onClick={handleDeleteRead}
                    className="gap-2 text-xs"
                  >
                    <Trash className="h-3.5 w-3.5 text-rose-500" />
                    <span>{t("actions.deleteRead")}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={notifications.length === 0}
                    onClick={handleDeleteAll}
                    className="gap-2 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    <span>{t("actions.deleteAll")}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </NotificationHeader>

        <NotificationTabs
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as "today" | "week" | "earlier")}
        />

        <NotificationBody>
          {error ? (
            <div className="p-4 text-center">
              <span className="text-xs text-rose-600 dark:text-rose-400">
                Error: {error}
              </span>
            </div>
          ) : displayNotifications.length === 0 ? (
            <NotificationEmpty />
          ) : (
            displayNotifications.map((notification) => {
              const { icon, dotColor, bgColor } = getNotificationIcon(
                notification.type
              )

              return (
                <NotificationItem
                  key={notification.id}
                  unread={!notification.is_read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon with circular background */}
                  <NotificationItemIcon
                    className={cn(
                      "absolute inset-s-4 top-1/2 -translate-y-1/2",
                      bgColor
                    )}
                  >
                    {icon}
                  </NotificationItemIcon>

                  {/* Content */}
                  <div className="ms-12">
                    <div className="flex items-start gap-1.5">
                      {/* Color dot - only shows when unread */}
                      {!notification.is_read && (
                        <NotificationItemColorDot
                          className={cn("mt-0.5", dotColor)}
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <NotificationItemTitle>
                          {notification.title}
                        </NotificationItemTitle>

                        <NotificationItemDescription>
                          {notification.message}
                        </NotificationItemDescription>
                      </div>

                      {/* Time on the opposite side */}
                      <NotificationItemTime dateTime={notification.created_at}>
                        {formatNotificationTime(notification.created_at)}
                      </NotificationItemTime>
                    </div>
                  </div>
                </NotificationItem>
              )
            })
          )}
        </NotificationBody>
      </PopoverContent>
    </Popover>
  )
}
