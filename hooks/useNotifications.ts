"use client"

import { useEffect, useState } from "react"

import { createBrowserClient } from "@/lib/supabase/createBrowserClient"

import type { Notification } from "@/components/notifications/types"

interface UseNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    async function fetchNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error fetching notifications:", error)
        setLoading(false)
        return
      }

      setNotifications(data || [])
      setLoading(false)
    }

    fetchNotifications()

    // Subscribe to Realtime updates
    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const markAsRead = async (id: string) => {
    const { markNotificationAsRead } =
      await import("@/lib/actions/notifications/notifications")
    await markNotificationAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  const markAllAsRead = async () => {
    const { markAllAsRead: markAll } =
      await import("@/lib/actions/notifications/notifications")
    await markAll()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}
