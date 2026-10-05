export type NotificationType = "info" | "success" | "warning" | "error"

export type NotificationTargetType = "all" | "role" | "user"

export interface NotificationRecord {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  link: string | null
  is_read: boolean
  created_at: string
}

export interface GetNotificationsResponse {
  success: boolean
  data?: {
    notifications: NotificationRecord[]
    unreadCount: number
  }
  error?: string
}
