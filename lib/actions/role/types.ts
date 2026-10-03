import * as z from "zod"

export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  VENDOR: "vendor",
  MODERATOR: "moderator",
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  // Brands
  CREATE_BRAND: "create_brand",
  UPDATE_BRAND: "update_brand",
  DELETE_BRAND: "delete_brand",
  // Categories
  CREATE_CATEGORY: "create_category",
  UPDATE_CATEGORY: "update_category",
  DELETE_CATEGORY: "delete_category",
  // Products
  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",
  // Flash Sales
  CREATE_FLASH_SALE: "create_flash_sale",
  UPDATE_FLASH_SALE: "update_flash_sale",
  DELETE_FLASH_SALE: "delete_flash_sale",
  // Reviews
  CREATE_REVIEW: "create_review",
  UPDATE_REVIEW: "update_review",
  DELETE_REVIEW: "delete_review",
  // Roles
  CREATE_ROLE: "create_role",
  UPDATE_ROLE: "update_role",
  ASSIGN_ROLE: "assign_role",
  REMOVE_ROLE: "remove_role",
  // Reports
  CREATE_REPORT: "create_report",
  MANAGE_REPORTS: "manage_reports",
  DELETE_REPORT: "delete_report",
} as const

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const roleSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
})

export type UserRolePermissions = z.infer<typeof roleSchema>
