"use client";

// =====================================================
// 🔔 Notification Item Component
// =====================================================
// ✅ يعرض إشعار واحد مع أيقونة ملونة حسب النوع
// ✅ عنوان + محتوى + تاريخ نسبي
// ✅ يتغير اللون عند النقر (تحديد كمقروء)
// =====================================================

import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  AlertTriangle,
  Tag,
  Star,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale/ar";

type NotificationType =
  | "order_event"
  | "system_alert"
  | "promo"
  | "review"
  | "ticket";

type Notification = {
  id: string;
  type: NotificationType;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  action_url: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

type NotificationItemProps = {
  notification: Notification;
  onClick: () => void;
};

export type { Notification, NotificationItemProps };

// ── خريطة الأيقونات والألوان حسب النوع ──
const notificationConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  order_event: {
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  system_alert: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  promo: {
    icon: Tag,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  review: {
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  ticket: {
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
};

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const config =
    notificationConfig[notification.type] || notificationConfig.system_alert;
  const Icon = config.icon;

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ar,
  });

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-right transition-colors hover:bg-accent",
        notification.is_read ? "opacity-60" : "bg-muted/30",
      )}
    >
      {/* أيقونة */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          config.bgColor,
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* محتوى */}
      <div className="flex-1 space-y-1">
        {/* العنوان والتاريخ */}
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium",
              notification.is_read
                ? "text-muted-foreground"
                : "text-foreground",
            )}
          >
            {notification.title_ar}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo}
          </span>
        </div>

        {/* الموضوع */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.content_ar}
        </p>
      </div>

      {/* نقطة unread */}
      {!notification.is_read && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
