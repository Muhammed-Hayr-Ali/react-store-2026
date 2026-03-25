// ===============================================================================
// File Name: index.ts
// Description: Export all notification actions
// Author: Mohammed Kher Ali
// Date: 2026-03-25
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

export { getNotifications } from "./get-notifications"
export { markNotificationAsRead } from "./mark-notification-as-read"
export { markAllAsRead } from "./mark-all-as-read"
export { deleteAllNotifications } from "./delete-all-notifications"
export { deleteReadNotifications } from "./delete-read-notifications"

// Export types
export type { Notification } from "@/components/notifications/types"
export type { GetNotificationsResult } from "./get-notifications"
export type { MarkNotificationAsReadResult } from "./mark-notification-as-read"
export type { MarkAllAsReadResult } from "./mark-all-as-read"
export type { DeleteAllNotificationsResult } from "./delete-all-notifications"
export type { DeleteReadNotificationsResult } from "./delete-read-notifications"
