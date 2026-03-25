/**
 * @fileoverview useNotifications Hook
 * @description Custom React hook for managing notifications with real-time updates
 * @author Mohammed Kher Ali
 * @date 2026-03-25
 * @copyright (c) 2026 Mohammed Kher Ali
 *
 * @module hooks/useNotifications
 */

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

/**
 * @interface UseNotificationsResult
 * @description Return type for the useNotifications hook containing notification state and actions
 */
interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean // Unified loading state for ANY operation
  isMarkingAllAsRead: boolean // Granular state for specific UI feedback
  isDeletingAll: boolean
  isDeletingRead: boolean
  error: string | null
  handleMarkAsRead: (id: string) => Promise<void>
  handleMarkAllRead: () => Promise<void>
  handleDeleteAll: () => Promise<void>
  handleDeleteRead: () => Promise<void>
}

export const useNotifications = (
  initialNotifications: Notification[] = []
): UseNotificationsResult => {
  // ===========================================================================
  // State Management
  // ===========================================================================

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)

  // State for initial fetch only
  const [isFetchingInitial, setIsFetchingInitial] = useState<boolean>(true)

  // Counter for active mutation operations (handles concurrency correctly)
  const [mutationCount, setMutationCount] = useState<number>(0)

  const [error, setError] = useState<string | null>(null)

  // Granular loading states for specific UI controls (e.g., disabling specific buttons)
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState<boolean>(false)
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false)
  const [isDeletingRead, setIsDeletingRead] = useState<boolean>(false)

  const [userId, setUserId] = useState<string | null>(null)
  const supabase = useMemo(() => createBrowserClient(), [])
  const hasFetchedInitialNotifications = useRef(false)

  // ===========================================================================
  // Computed Values
  // ===========================================================================

  /**
   * Unified loading state:
   * True if: Initial fetch is running OR any mutation is in progress
   */
  const isLoading = isFetchingInitial || mutationCount > 0

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  )

  // Helper functions for mutation counter
  const startMutation = useCallback(() => {
    setMutationCount((prev) => prev + 1)
  }, [])

  const endMutation = useCallback(() => {
    setMutationCount((prev) => Math.max(0, prev - 1))
  }, [])

  // ===========================================================================
  // Effect: Authentication State Management
  // ===========================================================================

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (isMounted) setUserId(user?.id || null)
    }
    fetchUser()

    const { data: authData } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) setUserId(session?.user?.id || null)
      }
    )

    return () => {
      isMounted = false
      authData.subscription.unsubscribe()
    }
  }, [supabase])

  // ===========================================================================
  // Effect: Notifications Management & Real-time Subscription
  // ===========================================================================

  useEffect(() => {
    let isMounted = true

    if (!userId) {
      setNotifications([])
      setIsFetchingInitial(false)
      return
    }

    const initializeNotifications = async () => {
      if (
        initialNotifications.length === 0 &&
        !hasFetchedInitialNotifications.current
      ) {
        try {
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
          if (isMounted) setIsFetchingInitial(false)
        }
      } else {
        if (isMounted) setIsFetchingInitial(false)
      }
    }

    initializeNotifications()

    const channel = supabase
      .channel(`notifications_for_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
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
  }, [supabase, userId, initialNotifications.length])

  // ===========================================================================
  // Action Handlers
  // ===========================================================================

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      startMutation()
      try {
        const result = await markNotificationAsRead(id)
        if (result.success) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
          )
        } else if (result.error) {
          console.error("Failed to mark notification as read:", result.error)
        }
      } finally {
        endMutation()
      }
    },
    [startMutation, endMutation]
  )

  const handleMarkAllRead = useCallback(async () => {
    setIsMarkingAllAsRead(true)
    startMutation()
    try {
      const result = await markAllAsRead()
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      } else if (result.error) {
        console.error("Failed to mark all notifications as read:", result.error)
      }
    } finally {
      setIsMarkingAllAsRead(false)
      endMutation()
    }
  }, [startMutation, endMutation])

  const handleDeleteAll = useCallback(async () => {
    setIsDeletingAll(true)
    startMutation()
    try {
      const result = await deleteAllNotifications()
      if (result.success) {
        setNotifications([])
      } else if (result.error) {
        console.error("Failed to delete all notifications:", result.error)
      }
    } finally {
      setIsDeletingAll(false)
      endMutation()
    }
  }, [startMutation, endMutation])

  const handleDeleteRead = useCallback(async () => {
    setIsDeletingRead(true)
    startMutation()
    try {
      const result = await deleteReadNotifications()
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => !n.is_read))
      }
    } finally {
      setIsDeletingRead(false)
      endMutation()
    }
  }, [startMutation, endMutation])

  // ===========================================================================
  // Return Value
  // ===========================================================================

  return {
    notifications,
    unreadCount,
    isLoading, // Now covers ALL operations
    isMarkingAllAsRead,
    isDeletingAll,
    isDeletingRead,
    error,
    handleMarkAsRead,
    handleMarkAllRead,
    handleDeleteAll,
    handleDeleteRead,
  }
}
