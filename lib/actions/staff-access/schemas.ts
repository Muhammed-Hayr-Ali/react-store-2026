/**
 * @file lib/actions/staff-access/schemas.ts
 * @description مخططات التحقق من عمليات إسناد الأدوار للموظفين.
 */

import { z } from "zod"

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid("INVALID_UUID_ERROR"),
  roleId: z.string().uuid("INVALID_ROLE_ID"),
})

export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>
