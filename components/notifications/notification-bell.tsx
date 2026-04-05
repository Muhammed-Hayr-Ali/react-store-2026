"use client";

// =====================================================
// 🔔 Notification Bell Component
// =====================================================
// ✅ زر جرس مع عداد الإشعارات غير المقروءة
// ✅ Popover يحتوي على قائمة الإشعارات
// ✅ تبويبات: اليوم / هذا الأسبوع / السابق
// ✅ تحديد كمقروء عند النقر
// ✅ Realtime عبر Supabase
// ✅ التنقل إلى action_url عند النقر
// =====================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/database/supabase/client";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Notification } from "./notification-item";
import { NotificationItem } from "./notification-item";

type NotificationBellProps = {
  userId?: string;
};

// ── تصنيف الإشعارات حسب الوقت (خارج المكون) ──
function categorizeNotifications(notifs: Notification[]): {
  today: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  return notifs.reduce(
    (acc, n) => {
      const date = new Date(n.created_at);
      if (date >= todayStart) {
        acc.today.push(n);
      } else if (date >= weekStart) {
        acc.thisWeek.push(n);
      } else {
        acc.earlier.push(n);
      }
      return acc;
    },
    {
      today: [] as Notification[],
      thisWeek: [] as Notification[],
      earlier: [] as Notification[],
    },
  );
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => createBrowserClient(), []);

  // ── جلب الإشعارات ──
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)(
      "get_user_notifications",
      {
        p_user_id: userId,
        p_page: 1,
        p_limit: 50,
        p_unread_only: false,
      },
    );

    if (error) {
      console.error("Failed to fetch notifications:", error);
      return;
    }

    setNotifications(data || []);
  }, [userId, supabase]);

  // ── جلب عدد غير المقروءة ──
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)("get_unread_count", {
      p_user_id: userId,
    });

    if (!error && data !== null) {
      setUnreadCount(Number(data));
    }
  }, [userId, supabase]);

  // ── تحديد إشعار كمقروء ──
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)("mark_notification_read", {
      p_notification_id: notificationId,
      p_user_id: userId,
    });

    if (error) {
      toast.error("فشل تحديد الإشعار كمقروء");
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // ── تحديد الكل كمقروء ──
  const markAllAsRead = async () => {
    if (!userId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)(
      "mark_all_notifications_read",
      {
        p_user_id: userId,
      },
    );

    if (error) {
      toast.error("فشل تحديد الكل كمقروء");
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success("تم تحديد الكل كمقروء");
  };

  // ── حذف المقروءة فقط ──
  const deleteReadOnly = async () => {
    if (!userId) return;

    const readNotifications = notifications.filter((n) => n.is_read);

    const results = await Promise.all(
      readNotifications.map((n) =>
        (supabase.rpc as any)("delete_notification", {
          p_notification_id: n.id,
          p_user_id: userId,
        }),
      ),
    );

    const failures = results.filter((r) => r.error);
    const successCount = readNotifications.length - failures.length;

    setNotifications((prev) => prev.filter((n) => !n.is_read));

    if (failures.length > 0) {
      toast.error(`فشل حذف ${failures.length} إشعار`);
    }
    if (successCount > 0) {
      toast.success(`تم حذف ${successCount} إشعار مقروء`);
    }
  };

  // ── تصنيف الإشعارات ──
  const { today, thisWeek, earlier } = useMemo(
    () => categorizeNotifications(notifications),
    [notifications],
  );

  const readCount = useMemo(
    () => notifications.filter((n) => n.is_read).length,
    [notifications],
  );

  // ── Realtime Subscription ──
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();
    fetchUnreadCount();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sys_notification",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as unknown as Notification;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotification.id)) return prev;
            return [newNotification, ...prev];
          });
          setUnreadCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications, fetchUnreadCount]);

  // ── عند فتح الـ Popover ──
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      setIsLoading(true);
      fetchNotifications().finally(() => setIsLoading(false));
    }
  }, [isOpen, fetchNotifications, notifications.length]);

  // ── عرض العداد ──
  const displayCount = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-accent"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {displayCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[420px] p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">الإشعارات</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-medium text-red-600">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3 w-3" />
              تحديد الكل كمقروء
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={deleteReadOnly}
              disabled={readCount === 0}
            >
              <Trash2 className="h-3 w-3" />
              حذف المقروءة
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <div className="border-b px-4">
            <TabsList className="h-9 w-full bg-transparent">
              <TabsTrigger
                value="today"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                اليوم
                {today.length > 0 && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted text-[10px]">
                    {today.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="thisWeek"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                هذا الأسبوع
                {thisWeek.length > 0 && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted text-[10px]">
                    {thisWeek.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="earlier"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                السابق
                {earlier.length > 0 && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted text-[10px]">
                    {earlier.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : (
            <>
              <TabsContent
                value="today"
                className="m-0 max-h-[360px] overflow-y-auto"
              >
                <NotificationList
                  notifications={today}
                  onMarkAsRead={markAsRead}
                  onNavigate={(url) => {
                    setIsOpen(false);
                    router.push(url);
                  }}
                  emptyMessage="لا توجد إشعارات اليوم"
                />
              </TabsContent>

              <TabsContent
                value="thisWeek"
                className="m-0 max-h-[360px] overflow-y-auto"
              >
                <NotificationList
                  notifications={thisWeek}
                  onMarkAsRead={markAsRead}
                  onNavigate={(url) => {
                    setIsOpen(false);
                    router.push(url);
                  }}
                  emptyMessage="لا توجد إشعارات هذا الأسبوع"
                />
              </TabsContent>

              <TabsContent
                value="earlier"
                className="m-0 max-h-[360px] overflow-y-auto"
              >
                <NotificationList
                  notifications={earlier}
                  onMarkAsRead={markAsRead}
                  onNavigate={(url) => {
                    setIsOpen(false);
                    router.push(url);
                  }}
                  emptyMessage="لا توجد إشعارات سابقة"
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

// =====================================================
// Notification List Sub-Component
// =====================================================

function NotificationList({
  notifications,
  onMarkAsRead,
  onNavigate,
  emptyMessage,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onNavigate: (url: string) => void;
  emptyMessage: string;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={() => {
            if (!notification.is_read) {
              onMarkAsRead(notification.id);
            }
            if (notification.action_url) {
              onNavigate(notification.action_url);
            }
          }}
        />
      ))}
    </div>
  );
}
