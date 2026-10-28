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
        description:
          "Core permission required to execute brand operations in the database.",
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

  // ==========================================
  // 2. Categories Management
  // ==========================================
  {
    id: "categories_group",
    label: "📁 Categories Management",
    permissions: [
      {
        key: PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT,
        label: "View Categories Management",
        description: "Access and view the categories management dashboard.",
      },
      {
        key: PERMISSIONS.MANAGE_CATEGORIES,
        label: "Manage Categories (Database Access)",
        description:
          "Core permission required to execute category operations in the database.",
      },
      {
        key: PERMISSIONS.CREATE_CATEGORY,
        label: "Create Category",
        description: "Add new categories and subcategories to the catalog.",
      },
      {
        key: PERMISSIONS.UPDATE_CATEGORY,
        label: "Update Category",
        description: "Modify existing category details, hierarchy, and status.",
      },
      {
        key: PERMISSIONS.DELETE_CATEGORY,
        label: "Delete Category",
        description: "Permanently remove categories from the system.",
      },
    ],
  },

  // ==========================================
  // 3. Products Management
  // ==========================================
  {
    id: "products_group",
    label: "📦 Products Management",
    permissions: [
      {
        key: PERMISSIONS.VIEW_PRODUCTS_MANAGEMENT,
        label: "View Products Management",
        description: "Access and view the products inventory dashboard.",
      },
      {
        key: PERMISSIONS.MANAGE_PRODUCTS,
        label: "Manage Products & Variants (Database Access)",
        description:
          "Core permission required to execute product, variant, and image operations.",
      },
      {
        key: PERMISSIONS.CREATE_PRODUCT,
        label: "Create Product",
        description:
          "Add new products, pricing variants, and media to the store.",
      },
      {
        key: PERMISSIONS.UPDATE_PRODUCT,
        label: "Update Product",
        description:
          "Modify existing product details, stock, variants, and images.",
      },
      {
        key: PERMISSIONS.DELETE_PRODUCT,
        label: "Delete Product",
        description:
          "Permanently remove products, variants, and associated images.",
      },
    ],
  },
] as const satisfies PermissionGroup[]
