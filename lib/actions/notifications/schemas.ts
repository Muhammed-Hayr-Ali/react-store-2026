/**
 * @file lib/actions/notifications/schemas.ts
 * @description Central Zod validation schemas for notifications, broadcasts, and channels.
 */

import { z } from "zod"

// ==========================================
// 1. Notification Schemas (Single & Broadcast)
// ==========================================

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

// ==========================================
// 2. Channel Schemas (Create & Update)
// ==========================================

export const createChannelSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug cannot exceed 50 characters"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  name_ar: z
    .string()
    .min(2, "Arabic name must be at least 2 characters")
    .max(100, "Arabic name cannot exceed 100 characters"),
  description: z.string().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  isMandatory: z.boolean().default(false),
  defaultEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),
})

export const updateChannelSchema = createChannelSchema.partial().extend({
  id: z.string().uuid("Invalid channel ID"),
})

// ==========================================
// 3. Types Inferred from Schemas
// ==========================================

export type CreateNotificationInput = z.input<typeof createNotificationSchema>
export type CreateNotificationOutput = z.output<typeof createNotificationSchema>

export type BroadcastNotificationInput = z.input<
  typeof broadcastNotificationSchema
>
export type BroadcastNotificationOutput = z.output<
  typeof broadcastNotificationSchema
>

export type CreateChannelInput = z.input<typeof createChannelSchema>
export type CreateChannelOutput = z.output<typeof createChannelSchema>

export type UpdateChannelInput = z.input<typeof updateChannelSchema>
export type UpdateChannelOutput = z.output<typeof updateChannelSchema>
