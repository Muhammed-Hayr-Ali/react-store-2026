import * as z from "zod"

export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  VENDOR: "vendor",
  MODERATOR: "moderator",
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  // --- 1. Brands Management ---
  VIEW_BRANDS: "view_brands", // <--- إضافة عرض الماركات
  CREATE_BRAND: "create_brand",
  UPDATE_BRAND: "update_brand",
  DELETE_BRAND: "delete_brand",

  // --- 2. Categories Management ---
  VIEW_CATEGORIES: "view_categories", // <--- إضافة عرض الفئات
  CREATE_CATEGORY: "create_category",
  UPDATE_CATEGORY: "update_category",
  DELETE_CATEGORY: "delete_category",

  // --- 3. Marketing, Coupons & Discounts ---
  VIEW_FLASH_SALES: "view_flash_sales", // <--- إضافة عرض العروض
  CREATE_FLASH_SALE: "create_flash_sale",
  UPDATE_FLASH_SALE: "update_flash_sale",
  DELETE_FLASH_SALE: "delete_flash_sale",

  // --- 4. Notifications ---
  VIEW_NOTIFICATIONS: "view_notifications", // <--- إضافة عرض الإشعارات
  CREATE_NOTIFICATION: "create_notification",
  UPDATE_NOTIFICATION: "update_notification",
  ASSIGN_NOTIFICATION: "assign_notification",
  DELETE_NOTIFICATION: "delete_notification",
  SEND_NOTIFICATION: "send_notification",

  // --- 5. Products & Images Management ---
  VIEW_PRODUCTS: "view_products", // <--- إضافة عرض المنتجات
  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",

  // --- 6. Reviews Management ---
  VIEW_REVIEWS: "view_reviews", // <--- إضافة عرض التقييمات
  CREATE_REVIEW: "create_review",
  UPDATE_REVIEW: "update_review",
  DELETE_REVIEW: "delete_review",
  MODERATE_REVIEWS: "moderate_reviews",

  // --- 7. Users & Profiles Management ---
  VIEW_USERS: "view_users", // <--- إضافة عرض المستخدمين
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",

  // --- 8. Reports & Moderation Management ---
  CREATE_REPORT: "create_report",
  UPDATE_REPORT: "update_report",
  DELETE_REPORT: "delete_report",
  VIEW_REPORTS: "view_reports",
  MANAGE_REPORTS: "manage_reports",

  // --- 9. Roles & Permissions Management ---
  CREATE_ROLE: "create_role",
  UPDATE_ROLE: "update_role",
  DELETE_ROLE: "delete_role",
  MANAGE_ROLES: "manage_roles",
  ASSIGN_ROLE: "assign_role",
  VIEW_USER_ROLES: "view_user_roles",
  REMOVE_ROLE: "remove_role",
} as const

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const roleSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
})

