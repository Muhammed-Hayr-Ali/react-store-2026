import * as z from "zod"

export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  VENDOR: "vendor",
  MODERATOR: "moderator",
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  // --- 0. General & Dashboard Views (أذونات العرض القياسية) ---
  VIEW_USER_OVERVIEW: "view_user_overview",
  VIEW_ADMIN_OVERVIEW: "view_admin_overview",
  VIEW_USER_ORDERS: "view_user_orders",
  VIEW_USER_WISHLIST: "view_user_wishlist",
  VIEW_USER_COUPONS: "view_user_coupons",

  VIEW_PRODUCTS: "view_products",
  VIEW_FLASH_SALES: "view_flash_sales",
  VIEW_USERS_MANAGEMENT: "view_users_management",
  VIEW_REPORTS_MANAGEMENT: "view_reports_management",
  VIEW_ROLES_MANAGEMENT: "view_roles_management",
  VIEW_STAFF_ACCESS: "view_staff_access",
  VIEW_NOTIFICATIONS_MANAGEMENT: "view_notifications_management", // تم تعديل حرف M إلى صغير لتجنب خطأ المطابقة

  // --- 1. Brands Management ---
  CREATE_BRAND: "create_brand",
  UPDATE_BRAND: "update_brand",
  DELETE_BRAND: "delete_brand",

  // --- 2. Categories Management ---
  CREATE_CATEGORY: "create_category",
  UPDATE_CATEGORY: "update_category",
  DELETE_CATEGORY: "delete_category",

  // --- 3. Marketing, Coupons & Discounts ---
  CREATE_FLASH_SALE: "create_flash_sale",
  UPDATE_FLASH_SALE: "update_flash_sale",
  DELETE_FLASH_SALE: "delete_flash_sale",

  // --- 4. Notifications ---
  CREATE_NOTIFICATION: "create_notification",
  UPDATE_NOTIFICATION: "update_notification",
  ASSIGN_NOTIFICATION: "assign_notification",
  DELETE_NOTIFICATION: "delete_notification",
  SEND_NOTIFICATION: "send_notification",

  // --- 5. Products & Images Management ---
  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",

  // --- 6. Reviews Management ---
  CREATE_REVIEW: "create_review",
  UPDATE_REVIEW: "update_review",
  DELETE_REVIEW: "delete_review",
  MODERATE_REVIEWS: "moderate_reviews",

  // --- 7. Users & Profiles Management ---
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",

  // --- 8. Reports & Moderation Management ---
  CREATE_REPORT: "create_report",
  UPDATE_REPORT: "update_report",
  DELETE_REPORT: "delete_report",
  MANAGE_REPORTS: "manage_reports",

  // --- 9. Roles & Permissions Management ---
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
