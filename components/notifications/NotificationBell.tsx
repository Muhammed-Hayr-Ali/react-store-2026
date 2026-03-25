"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
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
  PopoverDescription,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "./types"
import { BellIcon } from "../shared/icons"
import { Spinner } from "../ui/spinner"

// --- Helper Functions ---

function getUnreadColor(count: number) {
  if (count > 50) return "bg-red-500 dark:bg-red-300"
  if (count > 10) return "bg-purple-500 dark:bg-purple-300"
  if (count > 0) return "bg-green-500 dark:bg-green-300"
  return "bg-transparent"
}

// --- UI Sub-components ---

const NotificationTriggerIcon = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { unreadCount: number }
>(({ className, unreadCount, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "group relative flex h-10 w-10 items-center justify-center",
      className
    )}
    {...props}
  >
    <BellIcon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
    {unreadCount > 0 && (
      <div
        className={cn(
          "absolute top-2.5 right-2 flex size-2 rounded-full rtl:left-2",
          getUnreadColor(unreadCount)
        )}
      />
    )}
  </button>
))
NotificationTriggerIcon.displayName = "NotificationTriggerIcon"

const NotificationHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
  }
>(({ className, title, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between border-b px-4 py-3",
      className
    )}
    {...props}
  >
    <h3 className="text-sm font-bold tracking-tight">{title}</h3>
    <div className="flex items-center gap-1">{children}</div>
  </div>
))
NotificationHeader.displayName = "NotificationHeader"

const NotificationTabs = React.forwardRef<
  HTMLDivElement,
  { activeTab: string; onTabChange: (value: string) => void }
>(({ activeTab, onTabChange }, ref) => {
  const t = useTranslations("Notifications")
  return (
    <div ref={ref} className="border-b px-2 py-1.5">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid h-8 w-full grid-cols-3 bg-muted/50 p-1">
          <TabsTrigger value="today" className="rounded-md text-[11px]">
            {t("tabs.today")}
          </TabsTrigger>
          <TabsTrigger value="week" className="rounded-md text-[11px]">
            {t("tabs.week")}
          </TabsTrigger>
          <TabsTrigger value="earlier" className="rounded-md text-[11px]">
            {t("tabs.earlier")}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
})
NotificationTabs.displayName = "NotificationTabs"

const NotificationBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("scrollbar-thin max-h-100 overflow-y-auto", className)}
    {...props}
  />
))
NotificationBody.displayName = "NotificationBody"

const NotificationEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const t = useTranslations("Notifications")
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
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
  React.HTMLAttributes<HTMLDivElement> & { unread?: boolean }
>(({ className, unread = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative cursor-pointer border-b py-2.5 ps-8 pe-2 transition-all last:border-0 hover:bg-muted/50",
      unread && "bg-muted/30",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
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
      "absolute inset-e-2 top-2.5 block text-[9px] font-medium text-muted-foreground/80",
      className
    )}
    {...props}
  />
))
NotificationItemTime.displayName = "NotificationItemTime"

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

// --- Main Component ---

interface NotificationBellProps {
  initialNotifications?: Notification[]
}

export default function NotificationBell({
  initialNotifications = [],
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
        }
      case "promo":
        return {
          icon: <Tag className="h-4 w-4" />,
          dotColor: "bg-green-500",
        }
      case "sale":
        return {
          icon: <ShoppingCart className="h-4 w-4" />,
          dotColor: "bg-orange-500",
        }
      case "analytics":
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          dotColor: "bg-purple-500",
        }
      default:
        return {
          icon: <Bell className="h-4 w-4" />,
          dotColor: "bg-gray-400",
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
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <NotificationTriggerIcon unreadCount={unreadCount} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 overflow-hidden border-muted/40 p-0 shadow-xl"
      >
        <PopoverHeader className="p-0">
          <NotificationHeader title={t("title")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-xs" variant="ghost" className="h-7 w-7">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48"
                align={locale === "ar" ? "start" : "end"}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={unreadCount === 0}
                    onClick={handleMarkAllRead}
                    className="gap-2"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="text-xs">{t("actions.markAllRead")}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={
                      notifications.filter((n) => n.is_read).length === 0
                    }
                    onClick={handleDeleteRead}
                    className="gap-2"
                  >
                    <Trash className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs">{t("actions.deleteRead")}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={notifications.length === 0}
                    onClick={handleDeleteAll}
                    className="gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs">{t("actions.deleteAll")}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </NotificationHeader>

          <PopoverDescription className="p-0">
            <NotificationTabs
              activeTab={activeTab}
              onTabChange={(v) =>
                setActiveTab(v as "today" | "week" | "earlier")
              }
            />
          </PopoverDescription>
        </PopoverHeader>

        <NotificationBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <span className="text-xs text-destructive">Error: {error}</span>
            </div>
          ) : displayNotifications.length === 0 ? (
            <NotificationEmpty />
          ) : (
            displayNotifications.map((notification) => {
              const { icon, dotColor } = getNotificationIcon(notification.type)

              return (
                <NotificationItem
                  key={notification.id}
                  unread={!notification.is_read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon with circular background */}
                  <NotificationItemIcon className="absolute inset-s-2 top-1/2 -translate-y-1/2">
                    {icon}
                  </NotificationItemIcon>

                  {/* Content */}
                  <div className="ms-6">
                    <div className="flex items-center gap-2">
                      {/* Color dot - only shows when unread */}
                      {!notification.is_read && (
                        <NotificationItemColorDot className={dotColor} />
                      )}

                      <NotificationItemTitle>
                        {notification.title}
                      </NotificationItemTitle>

                      {/* Time on the opposite side */}
                      <NotificationItemTime dateTime={notification.created_at}>
                        {formatNotificationTime(notification.created_at)}
                      </NotificationItemTime>
                    </div>

                    <NotificationItemDescription>
                      {notification.message}
                    </NotificationItemDescription>
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
