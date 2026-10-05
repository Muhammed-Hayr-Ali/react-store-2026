import { z } from "zod"

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
})

export const updateUserSchema = z.object({
  userId: z.string().uuid(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
})

export const updateUserStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["active", "suspended", "banned"]),
  banReason: z.string().optional(),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
export type UpdateUserStatusFormValues = z.infer<typeof updateUserStatusSchema>
