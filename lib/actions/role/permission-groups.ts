/**
 * @file lib/actions/role/permission-groups.ts
 * @description تنظيم وتصنيف الصلاحيات حسب النوع وتحديث صلاحيات الطلبات.
 */

import { PERMISSIONS, AppPermission } from "./types"

export interface PermissionGroup {
  id: string
  label: string
  permissions: {
    key: AppPermission
    label: string
    description: string
  }[]
}

export const PERMISSION_GROUPS = [
 

  // ==========================================
  // 1. Brands Management
  // ==========================================
  {
    id: "brands_group",
    label: "🏷️ Brands Management",
    permissions: [
      {
        key: PERMISSIONS.VIEW_BRANDS_MANAGEMENT,
        label: "View Brands Management",
        description: "Access and view the brands management dashboard.",
      },
      {
        key: PERMISSIONS.MANAGE_BRANDS,
        label: "Manage Brands (Database Access)",
        description: "Core permission required to execute brand operations in the database.",
      },
      {
        key: PERMISSIONS.CREATE_BRAND,
        label: "Create Brand",
        description: "Add new brands and manufacturers to the catalog.",
      },
      {
        key: PERMISSIONS.UPDATE_BRAND,
        label: "Update Brand",
        description: "Modify existing brand details, logos, and status.",
      },
      {
        key: PERMISSIONS.DELETE_BRAND,
        label: "Delete Brand",
        description: "Permanently remove brands from the system.",
      },
    ],
  },


  
] as const satisfies PermissionGroup[]