import { z } from "zod"

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid("INVALID_UUID_ERROR"),
  roleId: z.string().uuid("INVALID_ROLE_ID"),
})

export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>
