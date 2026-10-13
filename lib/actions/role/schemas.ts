import { z } from "zod"
import { PERMISSIONS } from "./types"

const permissionValues = Object.values(PERMISSIONS) as [string, ...string[]]

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
  permissions: z.array(z.string()).min(1, "ROLE_PERMISSION_REQUIRED"),
})

export const updateRolePermissionsSchema = z.object({
  roleId: z.string().uuid("INVALID_ROLE_ID"),
  description: z.string().max(255).optional().nullable(),
  permissions: z
    .array(z.enum(permissionValues, { error: "INVALID_ROLE_PERMISSION" }))
    .min(1, "ROLE_PERMISSION_REQUIRED"),
})

export const deleteRoleSchema = z.object({
  roleId: z.string().uuid("INVALID_ROLE_ID"),
})

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid("INVALID_UUID_ERROR"),
  roleId: z.string().uuid("INVALID_ROLE_ID"),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>
export type DeleteRoleInput = z.infer<typeof deleteRoleSchema>
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>
