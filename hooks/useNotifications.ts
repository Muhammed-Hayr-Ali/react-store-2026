import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import {
  getNotifications,
  markAllAsRead,
  markNotificationAsRead,
  deleteAllNotifications,
  deleteReadNotifications,
} from "@/lib/actions/notifications"
import type { Notification } from "@/components/notifications/types"

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  handleMarkAsRead: (id: string) => Promise<void>
  handleMarkAllRead: () => Promise<void>
  handleDeleteAll: () => Promise<void>
  handleDeleteRead: () => Promise<void>
}

export const useNotifications = (
  initialNotifications: Notification[] = []
): UseNotificationsResult => {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null) // حالة لتخزين user_id

  const supabase = useMemo(() => createBrowserClient(), [])
  const hasFetchedInitialNotifications = useRef(false)

  // Effect لجلب user_id الحالي
  useEffect(() => {
    let isMounted = true
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (isMounted) {
        setUserId(user?.id || null)
      }
    }
    fetchUser()

    // الاستماع لتغييرات حالة المصادقة لتحديث user_id
    const { data: authData } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          setUserId(session?.user?.id || null)
        }
      }
    )

    return () => {
      isMounted = false
      authData.subscription.unsubscribe()
    }
  }, [supabase]) // يعتمد على supabase فقط لضمان استقراره

  // Effect لإدارة جلب الإشعارات والاشتراك في Realtime، يعتمد على userId
  useEffect(() => {
    let isMounted = true
    if (!userId) {
      // إذا لم يكن هناك user_id، لا يوجد ما نجلبه أو نشترك فيه
      setNotifications([])
      setIsLoading(false)
      return
    }

    const initializeNotifications = async () => {
      // 1. جلب الإشعارات الأولية إذا لزم الأمر (للمستخدم الحالي)
      if (
        initialNotifications.length === 0 &&
        !hasFetchedInitialNotifications.current
      ) {
        try {
          // يجب أن تكون دالة getNotifications قادرة على استقبال userId
          const result = await getNotifications()
          if (isMounted) {
            if (result.success && result.data) {
              setNotifications(result.data)
              hasFetchedInitialNotifications.current = true
            } else if (result.error) {
              setError(result.error)
            }
          }
        } catch {
          if (isMounted) setError("Failed to fetch notifications")
        } finally {
          if (isMounted) setIsLoading(false)
        }
      } else {
        if (isMounted) setIsLoading(false)
      }
    }

    initializeNotifications()

    // 2. إعداد اشتراك Realtime (مفلتر بواسطة user_id)
    const channel = supabase
      .channel(`notifications_for_${userId}`) // اسم قناة فريد لكل مستخدم
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`, // فلترة الإشعارات حسب user_id
        },
        (payload) => {
          const newNotification = payload.new as Notification
          if (isMounted) {
            setNotifications((prev) => [newNotification, ...prev])
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedNotification = payload.old as Notification
          if (isMounted) {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== deletedNotification.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, initialNotifications.length]) // يعاد تشغيله عند تغيير userId أو طول initialNotifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAsRead = useCallback(async (id: string) => {
    const result = await markNotificationAsRead(id)
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } else if (result.error) {
      console.error("Failed to mark notification as read:", result.error)
    }
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    const result = await markAllAsRead()
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } else if (result.error) {
      console.error("Failed to mark all notifications as read:", result.error)
    }
  }, [])

  const handleDeleteAll = useCallback(async () => {
    const result = await deleteAllNotifications()
    if (result.success) {
      setNotifications([])
    } else if (result.error) {
      console.error("Failed to delete all notifications:", result.error)
    }
  }, [])

  const handleDeleteRead = useCallback(async () => {
    const result = await deleteReadNotifications()
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => !n.is_read))
    }
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    handleMarkAsRead,
    handleMarkAllRead,
    handleDeleteAll,
    handleDeleteRead,
  }
}
