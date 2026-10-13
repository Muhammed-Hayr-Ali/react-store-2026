import { z } from "zod"

export const createUserSchema = z.object({
  email: z.string().email("INVALID_USER_EMAIL"),
  password: z.string().min(6, "PASSWORD_TOO_SHORT_ERROR").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
})

export const updateUserSchema = z.object({
  userId: z.string().uuid("INVALID_UUID_ERROR"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
})

export const updateUserStatusSchema = z.object({
  userId: z.string().uuid("INVALID_UUID_ERROR"),
  status: z.enum(["active", "suspended", "banned"], {
    error: "INVALID_ACCOUNT_STATUS",
  }),
  banReason: z.string().optional(),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
export type UpdateUserStatusFormValues = z.infer<typeof updateUserStatusSchema>
