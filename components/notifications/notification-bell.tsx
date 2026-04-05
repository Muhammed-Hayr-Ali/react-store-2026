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
import { Bell, CheckCheck, Trash2, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Notification } from "./notification-item";
import { NotificationItem } from "./notification-item";

type NotificationBellProps = {
  userId?: string;
};

type RpcCall = (
  fn: string,
  args: Record<string, unknown>,
) => Promise<{ data: unknown | null; error: { message: string } | null }>;

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
  const rpc = useMemo(
    () => supabase.rpc.bind(supabase) as unknown as RpcCall,
    [supabase],
  );

  // ── جلب الإشعارات ──
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await rpc("get_user_notifications", {
      p_user_id: userId,
      p_page: 1,
      p_limit: 50,
      p_unread_only: false,
    });

    if (error) {
      console.error("Failed to fetch notifications:", error);
      return;
    }

    setNotifications((data as Notification[]) || []);
  }, [userId, rpc]);

  // ── جلب عدد غير المقروءة ──
  useCallback(async () => {
    if (!userId) return;

    const { data, error } = await rpc("get_unread_count", {
      p_user_id: userId,
    });

    if (!error && data !== null) {
      setUnreadCount(Number(data));
    }
  }, [userId, rpc]);

  // ── تحديد إشعار كمقروء ──
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    const { error } = await rpc("mark_notification_read", {
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

    const { error } = await rpc("mark_all_notifications_read", {
      p_user_id: userId,
    });

    if (error) {
      toast.error("فشل تحديد الكل كمقروء");
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success("تم تحديد الكل كمقروء");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notificationTable = supabase.from("sys_notification") as any;

  // ── حذف المقروءة فقط ──
  const deleteReadOnly = async () => {
    if (!userId) return;

    const readNotifications = notifications.filter((n) => n.is_read);
    if (readNotifications.length === 0) return;

    const results = await Promise.all(
      readNotifications.map((n) =>
        notificationTable.delete().eq("id", n.id).eq("recipient_id", userId),
      ),
    );

    const successes = results.filter((r) => !r.error);
    const failures = results.filter((r) => r.error);

    if (successes.length > 0) {
      const deletedIds = successes
        .map((_, i) => readNotifications[i]?.id)
        .filter(Boolean);
      setNotifications((prev) =>
        prev.filter((n) => !deletedIds.includes(n.id)),
      );
      toast.success(`تم حذف ${successes.length} إشعار مقروء`);
    }

    if (failures.length > 0) {
      toast.error(`فشل حذف ${failures.length} إشعار`);
    }
  };

  // ── حذف الكل ──
  const deleteAll = async () => {
    if (!userId) return;
    if (notifications.length === 0) return;

    const results = await Promise.all(
      notifications.map((n) =>
        notificationTable.delete().eq("id", n.id).eq("recipient_id", userId),
      ),
    );

    const successes = results.filter((r) => !r.error);
    const failures = results.filter((r) => r.error);

    if (successes.length > 0) {
      setNotifications([]);
      setUnreadCount(0);
      toast.success(`تم حذف ${successes.length} إشعار`);
    }

    if (failures.length > 0) {
      toast.error(`فشل حذف ${failures.length} إشعار`);
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

    // Initial fetch (inline to avoid cascading renders)
    const init = async () => {
      const [{ data, error }, { data: unreadData, error: unreadError }] =
        await Promise.all([
          rpc("get_user_notifications", {
            p_user_id: userId,
            p_page: 1,
            p_limit: 50,
            p_unread_only: false,
          }),
          rpc("get_unread_count", { p_user_id: userId }),
        ]);

      if (!error) setNotifications((data as Notification[]) || []);
      if (!unreadError && unreadData !== null)
        setUnreadCount(Number(unreadData));
    };

    void init();

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
        (payload: { new: Record<string, unknown> }) => {
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
  }, [userId, rpc, supabase]);

  // ── عند فتح الـ Popover ──
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && notifications.length === 0) {
      setIsLoading(true);
      await fetchNotifications();
      setIsLoading(false);
    }
  };

  // ── عرض العداد ──
  const displayCount = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
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
        className="w-90 p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">الإشعارات</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-medium text-red-600">
                {unreadCount}
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="ml-2 h-4 w-4" />
                جعل الكل مقروء
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={deleteReadOnly}
                disabled={readCount === 0}
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف المقروء
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={deleteAll}
                disabled={notifications.length === 0}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="ml-2 h-4 w-4" />
                حذف الكل
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full ">
          <TabsList className="h-9 w-full grid grid-cols-3 rounded-none">
            <TabsTrigger value="today" className="text-xs">
              اليوم
              {today.length > 0 && (
                <span className="mr-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted text-[10px]">
                  {today.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="thisWeek" className="text-xs">
              هذا الأسبوع
              {thisWeek.length > 0 && (
                <span className="mr-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted text-[10px]">
                  {thisWeek.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="earlier" className="text-xs">
              السابق
              {earlier.length > 0 && (
                <span className="mr-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted text-[10px]">
                  {earlier.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : (
            <>
              <TabsContent value="today" className="m-0 max-90 overflow-y-auto">
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
                className="m-0 max-h-90 overflow-y-auto"
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
                className="m-0 max-h-90 overflow-y-auto"
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
