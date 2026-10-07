import { z } from "zod"
import { PERMISSIONS } from "./types"

const permissionValues = Object.values(PERMISSIONS) as [string, ...string[]]

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(150, "Role name too long")
    .trim()
    .toLowerCase(),
  description: z.string().max(255).optional().nullable(),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
})

export const updateRolePermissionsSchema = z.object({
  roleId: z.string().uuid("Invalid role ID format"),
  description: z.string().max(255).optional().nullable(),
  permissions: z
    .array(z.enum(permissionValues))
    .min(1, "At least one permission is required"),
})

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  roleId: z.string().uuid("Invalid role ID format"),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>
