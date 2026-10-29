/**
 * @file lib/actions/role/schemas.ts
 * @description مخططات التحقق من مدخلات إدارة الأدوار.
 */

import { z } from "zod"

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "ROLE_NAME_TOO_SHORT")
    .max(150, "ROLE_NAME_TOO_LONG")
    .trim()
    .toLowerCase(),
  description: z
    .string()
    .max(255, "ROLE_DESCRIPTION_TOO_LONG")
    .optional()
    .nullable(),
  // تم استخدام z.string() لضمان قبول أي صلاحية جديدة تم إضافتها دون قيود
  permissions: z
    .array(z.string(), { message: "INVALID_ROLE_PERMISSION" })
    .min(1, "ROLE_PERMISSION_REQUIRED"),
})

export const updateRolePermissionsSchema = z.object({
  roleId: z.string().uuid("INVALID_ROLE_ID"),
  description: z.string().max(255).optional().nullable(),
  permissions: z
    .array(z.string(), { message: "INVALID_ROLE_PERMISSION" })
    .min(1, "ROLE_PERMISSION_REQUIRED"),
})

export const roleIdSchema = z.object({
  roleId: z.string().uuid("INVALID_ROLE_ID"),
})

export const deleteRoleSchema = roleIdSchema

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>
export type DeleteRoleInput = z.infer<typeof deleteRoleSchema>
export type RoleIdInput = z.infer<typeof roleIdSchema>
