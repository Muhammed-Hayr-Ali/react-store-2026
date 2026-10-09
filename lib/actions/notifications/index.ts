/**
 * @file lib/actions/notifications/index.ts
 * @description Central export file for all notification queries and mutations.
 */

// Queries
export { getNotifications } from "./queries/get-notifications"
export { getAdminNotifications } from "./queries/get-admin-notifications"
export { getActiveNotificationChannels } from "./queries/get-active-channels"
export { getUserChannelPreferences } from "./queries/get-user-channel-preferences"

// Mutations
export {
  deleteNotification,
  deleteBatchNotifications,
  deleteAllNotifications,
} from "./mutations/delete"
export {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./mutations/mark-read"
export {
  createNotification,
  broadcastNotification,
} from "./mutations/create-notification"
export { toggleChannelSubscription } from "./mutations/toggle-channel-subscription"
export { createNotificationChannel } from "./mutations/create-channel"
