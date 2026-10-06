import { z } from "zod"

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
  roleId: z.number().int().positive(),
  description: z.string().max(255).optional().nullable(),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
})

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  roleId: z.number().int().positive("Invalid role ID"),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>
