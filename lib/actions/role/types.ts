import * as z from "zod"

export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  VENDOR: "vendor",
  MODERATOR: "moderator",
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  // --- أذونات عرض الأقسام الأساسية في القائمة الجانبية (Sidebar) ---
  VIEW_DASHBOARD: "view_dashboard", // Overview
  VIEW_PRODUCTS: "view_products", // Products
  VIEW_FLASH_SALES: "view_flash_sales", // Flash Sales
  VIEW_USERS: "view_users", // Users Management
  VIEW_REPORTS: "view_reports", // Reports & Issues
  VIEW_USER_ROLES: "view_user_roles", // Roles & Permissions
  VIEW_STAFF_ACCESS: "view_staff_access", // Staff Access (أو استخدام ASSIGN_ROLE حسب تفضيلك)
  VIEW_NOTIFICATIONS: "view_notifications", // Notifications Management

  // --- باقي أذونات التحرير والإدارة ---
  CREATE_BRAND: "create_brand",
  UPDATE_BRAND: "update_brand",
  DELETE_BRAND: "delete_brand",

  CREATE_CATEGORY: "create_category",
  UPDATE_CATEGORY: "update_category",
  DELETE_CATEGORY: "delete_category",

  CREATE_FLASH_SALE: "create_flash_sale",
  UPDATE_FLASH_SALE: "update_flash_sale",
  DELETE_FLASH_SALE: "delete_flash_sale",

  CREATE_NOTIFICATION: "create_notification",
  UPDATE_NOTIFICATION: "update_notification",
  ASSIGN_NOTIFICATION: "assign_notification",
  DELETE_NOTIFICATION: "delete_notification",
  SEND_NOTIFICATION: "send_notification",

  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",

  CREATE_REVIEW: "create_review",
  UPDATE_REVIEW: "update_review",
  DELETE_REVIEW: "delete_review",
  MODERATE_REVIEWS: "moderate_reviews",

  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",

  CREATE_REPORT: "create_report",
  UPDATE_REPORT: "update_report",
  DELETE_REPORT: "delete_report",
  MANAGE_REPORTS: "manage_reports",

  CREATE_ROLE: "create_role",
  UPDATE_ROLE: "update_role",
  DELETE_ROLE: "delete_role",
  MANAGE_ROLES: "manage_roles",
  ASSIGN_ROLE: "assign_role",
  REMOVE_ROLE: "remove_role",
} as const

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const roleSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
})

export type UserRolePermissions = z.infer<typeof roleSchema>
