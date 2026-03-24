"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { BellIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { badgeVariants } from "@/components/ui/badge"

const NotificationDropdown = DropdownMenuPrimitive.Root

const NotificationDropdownTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn("relative inline-flex items-center justify-center", className)}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Trigger>
))
NotificationDropdownTrigger.displayName = "NotificationDropdownTrigger"

const NotificationDropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, align = "end", sideOffset = 8, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-80 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
NotificationDropdownContent.displayName = "NotificationDropdownContent"

const NotificationTriggerIcon = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { unreadCount?: number }
>(({ className, unreadCount = 0, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors",
      className
    )}
    {...props}
  >
    <BellIcon className="h-5 w-5" />
    {unreadCount > 0 && (
      <span
        className={cn(
          badgeVariants({ variant: "destructive" }),
          "absolute -right-1 -top-1 h-5 w-5 min-w-5 rounded-full p-0 text-xs font-bold",
          unreadCount > 9 && "w-6 min-w-6 text-[10px]"
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
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between border-b bg-muted/50 px-4 py-3",
      className
    )}
    {...props}
  />
))
NotificationHeader.displayName = "NotificationHeader"

const NotificationTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
NotificationTitle.displayName = "NotificationTitle"

const NotificationAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "text-xs text-primary hover:underline hover:text-primary/80 transition-colors",
      className
    )}
    {...props}
  />
))
NotificationAction.displayName = "NotificationAction"

const NotificationBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[24rem] overflow-y-auto", className)}
    {...props}
  />
))
NotificationBody.displayName = "NotificationBody"

const NotificationEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col items-center justify-center gap-2 py-8 text-center",
      className
    )}
    {...props}
  >
    <BellIcon className="h-8 w-8 text-muted-foreground opacity-50" />
    <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
  </div>
))
NotificationEmpty.displayName = "NotificationEmpty"

const NotificationItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { unread?: boolean }
>(({ className, unread = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative cursor-pointer border-b last:border-0 p-4 transition-colors hover:bg-muted/50",
      unread && "bg-muted/30",
      className
    )}
    {...props}
  />
))
NotificationItem.displayName = "NotificationItem"

const NotificationItemHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between gap-2", className)}
    {...props}
  />
))
NotificationItemHeader.displayName = "NotificationItemHeader"

const NotificationItemTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none",
      className
    )}
    {...props}
  />
))
NotificationItemTitle.displayName = "NotificationItemTitle"

const NotificationItemUnreadDot = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary",
      className
    )}
    {...props}
  />
))
NotificationItemUnreadDot.displayName = "NotificationItemUnreadDot"

const NotificationItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-1 text-xs text-muted-foreground", className)}
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
    className={cn("mt-2 block text-[10px] text-muted-foreground/70", className)}
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
  NotificationItemHeader,
  NotificationItemTitle,
  NotificationItemUnreadDot,
  NotificationItemDescription,
  NotificationItemTime,
}
