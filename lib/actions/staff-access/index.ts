/**
 * @file lib/actions/staff-access/index.ts
 * @description Exposes the public staff access action API.
 */

// Mutations
export { assignRoleToUser } from "./mutations/assign-user-role"
export { removeRoleFromUser } from "./mutations/remove-user-role"

// Queries
export { getStaffAccessUsersWithRoles } from "./queries/get-staff-access-users-with-roles"
export { getStaffAccessRoles } from "./queries/get-staff-access-roles"
export { getStaffAccessSummary } from "./queries/get-staff-access-summary"
export { getStaffAccessPageData } from "./queries/get-staff-access-page-data"

// Types
export type {
  StaffAccessRole,
  UserWithRoles,
  StaffAccessPageData,
} from "./types"
export type { AssignUserRoleInput } from "./schemas"
