import { z } from "zod"

export const createNotificationSchema = z.object({
  userId: z.string().uuid("INVALID_USER_ID"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message is too long"),
  type: z.enum(["info", "success", "warning", "error"]),
  link: z.string().optional().nullable(),
})

export const broadcastNotificationSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    message: z
      .string()
      .min(1, "Message is required")
      .max(500, "Message is too long"),
    type: z.enum(["info", "success", "warning", "error"]),
    link: z.string().optional().nullable(),
    targetType: z.enum(["all", "channels"]),
    channelIds: z.array(z.string().uuid()),
  })
  .refine(
    (data) => {
      if (data.targetType === "channels" && data.channelIds.length === 0) {
        return false
      }
      return true
    },
    {
      message: "Please select at least one channel",
      path: ["channelIds"],
    }
  )
