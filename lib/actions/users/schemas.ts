/**
 * @file lib/actions/users/schemas.ts
 * @description مخططات التحقق من مدخلات إدارة المستخدمين.
 */

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

export const getAdminUsersSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
export type UpdateUserStatusFormValues = z.infer<typeof updateUserStatusSchema>
export type GetAdminUsersInput = z.infer<typeof getAdminUsersSchema>
