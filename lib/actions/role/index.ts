/**
 * @file lib/actions/role/index.ts
 * @description Exposes the public role action API.
 */

// Permission Checker
export { hasPermission } from "./permission-checker"

// Mutations
export { createRole } from "./mutations/create-role"
export { deleteRole } from "./mutations/delete-role"
export { updateRole } from "./mutations/update-role"

// Queries
export { getRoles } from "./queries/get-roles"
export { getRolesSummary } from "./queries/get-roles-summary"
export { getRolesPageData } from "./queries/get-roles-page-data"
export { getRoleById } from "./queries/get-role-by-id"

// Types & Constants
export { PERMISSIONS } from "./types"
export type { RoleRecord, AppPermission, RolesSummary } from "./types"
export type { CreateRoleInput, UpdateRolePermissionsInput, DeleteRoleInput, RoleIdInput } from "./schemas"
