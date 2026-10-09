export type NotificationType = "info" | "success" | "warning" | "error"

export type NotificationTargetType = "all" | "channels"

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

export interface NotificationChannelRecord {
  id: string
  slug: string
  name: string
  name_ar: string
  description: string | null
  description_ar: string | null
  is_mandatory: boolean
  default_enabled: boolean
  is_active: boolean
  created_at: string
}

export interface UserChannelPreference extends NotificationChannelRecord {
  is_subscribed: boolean
}

export interface AdminNotificationRecord extends NotificationRecord {
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string | null
    profile_image: string | null
  } | null
}
