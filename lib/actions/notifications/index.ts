/**
 * @file lib/actions/notifications/index.ts
 * @description Central export gateway for notifications, broadcasts, and channel management.
 */

// ==========================================
// 1. Broadcasts & Individual Notifications
// ==========================================
export { getNotifications } from "./broadcasts/queries/get-notifications"
export { getAdminNotifications } from "./broadcasts/queries/get-admin-notifications"
export {
  createNotification,
  broadcastNotification,
} from "./broadcasts/mutations/create-notification"
export {
  deleteNotification,
  deleteBatchNotifications,
  deleteAllNotifications,
} from "./broadcasts/mutations/delete-notification"
export {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./broadcasts/mutations/mark-read"

// ==========================================
// 2. Audience Channels & Subscriptions
// ==========================================
export {
  getActiveNotificationChannels,
  getAllNotificationChannels,
} from "./channels/queries/get-active-channels"
export { getUserChannelPreferences } from "./channels/queries/get-user-preferences"
export { createNotificationChannel } from "./channels/mutations/create-channel"
export { updateNotificationChannel } from "./channels/mutations/update-channel"
export { deleteNotificationChannel } from "./channels/mutations/delete-channel"
export { toggleChannelSubscription } from "./channels/mutations/toggle-subscription"

// ==========================================
// 3. Types & Validation Schemas
// ==========================================
export * from "./types"
export * from "./schemas"
