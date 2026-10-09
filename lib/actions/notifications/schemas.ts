import { z } from "zod"

// مخطط الإشعار الفردي
export const createNotificationSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message is too long"),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
  link: z.string().optional().nullable(),
})

// مخطط إرسال البث
export const broadcastNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message is too long"),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
  link: z.string().optional().nullable(),
  targetType: z.enum(["all", "channels"]),
  channelIds: z.array(z.string().uuid()).default([]),
})

export type CreateNotificationInput = z.input<typeof createNotificationSchema>
export type CreateNotificationOutput = z.output<typeof createNotificationSchema>

export type BroadcastNotificationInput = z.input<
  typeof broadcastNotificationSchema
>
export type BroadcastNotificationOutput = z.output<
  typeof broadcastNotificationSchema
>
