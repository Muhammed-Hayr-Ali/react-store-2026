import { z } from "zod"

export const createNotificationSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message is too long"),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
  link: z.string().optional().nullable(),
})

export const broadcastNotificationSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    message: z
      .string()
      .min(1, "Message is required")
      .max(500, "Message is too long"),
    type: z.enum(["info", "success", "warning", "error"]).default("info"),
    link: z.string().optional().nullable(),
    targetType: z.enum(["all", "role"]),
    roleName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.targetType === "role" && !data.roleName) {
        return false
      }
      return true
    },
    {
      message: "Role name is required when target type is role",
      path: ["roleName"],
    }
  )
