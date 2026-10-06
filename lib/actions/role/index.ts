/**
 * @file lib/actions/role/index.ts
 * @description Centralized barrel export for RBAC (Role-Based Access Control)
 */

export { hasRole } from "./role-checker"
export { hasPermission } from "./permission-checker"
export {
  ROLES,
  PERMISSIONS,
  roleSchema,
  type AppRole,
  type AppPermission,
} from "./types"
