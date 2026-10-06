"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  InfoIcon,
  MegaphoneIcon,
  UserIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminNotificationRecord } from "@/lib/actions/notifications/types"

interface NotificationDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  notification:
    | (AdminNotificationRecord & {
        isBroadcastGroup?: boolean
        recipientCount?: number
      })
    | null
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function NotificationDetailsDialog({
  isOpen,
  onOpenChange,
  notification,
}: NotificationDetailsDialogProps) {
  if (!notification) return null

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2Icon className="size-5 text-emerald-500" />
      case "warning":
        return <AlertTriangleIcon className="size-5 text-amber-500" />
      case "error":
        return <AlertCircleIcon className="size-5 text-rose-500" />
      case "info":
      default:
        return <InfoIcon className="size-5 text-blue-500" />
    }
  }

  const profile = notification.profiles
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-4 p-5 sm:p-6">
        <DialogHeader className="gap-1.5 border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
              <DialogTitle className="truncate text-base font-semibold text-foreground">
                {notification.title}
              </DialogTitle>
              <Badge
                variant="outline"
                className="shrink-0 text-[10px] capitalize"
              >
                {notification.type}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Sent at {formatDate(notification.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* نص الرسالة كاملاً */}
          <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
            <span className="font-semibold text-foreground">Message Body:</span>
            <p className="leading-relaxed whitespace-pre-wrap text-foreground/90">
              {notification.message}
            </p>
          </div>

          {/* معلومات المستلم */}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground">
              Recipient:
            </span>
            {notification.isBroadcastGroup ? (
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <MegaphoneIcon className="size-3.5 text-primary" />
                <span>
                  Broadcast to {notification.recipientCount} Recipients
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-foreground">
                <UserIcon className="size-3.5 text-muted-foreground" />
                <span>{fullName || "User Account"}</span>
                {profile?.email && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ({profile.email})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* الرابط التفاعلي إن وجد */}
          {notification.link && (
            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground">
                Action Link:
              </span>
              <div>
                <Link
                  href={notification.link}
                  target="_blank"
                  className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                >
                  <ExternalLinkIcon className="size-3 shrink-0" />
                  {notification.link}
                </Link>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
