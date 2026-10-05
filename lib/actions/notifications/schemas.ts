import { z } from "zod"

export const createNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
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
    targetType: z.enum(["all", "role"]).default("all"),
    roleName: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (
        data.targetType === "role" &&
        (!data.roleName || data.roleName.trim() === "")
      ) {
        return false
      }
      return true
    },
    {
      message: "Role name is required when target type is role",
      path: ["roleName"],
    }
  )
