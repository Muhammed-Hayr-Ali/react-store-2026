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

export interface AdminNotificationRecord extends NotificationRecord {
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string | null
    profile_image: string | null
  } | null
}
