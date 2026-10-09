/**
 * @file lib/actions/notifications/types.ts
 * @description Central TypeScript interfaces and types for notifications and channels.
 */

// ==========================================
// 1. Primitive & Shared Enums / Types
// ==========================================

export type NotificationType = "info" | "success" | "warning" | "error"
export type NotificationTargetType = "all" | "channels"

// ==========================================
// 2. Database Notification Records
// ==========================================

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

// ==========================================
// 3. Database Channel Records & Preferences
// ==========================================

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

export interface UserChannelSubscriptionRecord {
  id: string
  user_id: string
  channel_id: string
  is_subscribed: boolean
  created_at: string
  updated_at: string
}

export interface UserChannelPreference extends NotificationChannelRecord {
  is_subscribed: boolean
}

// ==========================================
// 4. Action Payloads & Result Types
// ==========================================

export interface CreateNotificationPayload {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string | null
}

export interface BroadcastNotificationPayload {
  title: string
  message: string
  type?: NotificationType
  link?: string | null
  targetType: NotificationTargetType
  channelIds?: string[]
}

export interface CreateChannelPayload {
  slug: string
  name: string
  name_ar: string
  description?: string | null
  description_ar?: string | null
  isMandatory?: boolean
  defaultEnabled?: boolean
  isActive?: boolean
}

export interface UpdateChannelPayload extends Partial<CreateChannelPayload> {
  id: string
}

export interface BatchCountResult {
  count: number
}
