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
  CREATE_BRAND: "create_brand",
  UPDATE_BRAND: "update_brand",
  DELETE_BRAND: "delete_brand",

  // --- 2. Categories Management ---
  CREATE_CATEGORY: "create_category",
  UPDATE_CATEGORY: "update_category",
  DELETE_CATEGORY: "delete_category",

  // --- 3. Products & Inventory Management ---
  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",
  MANAGE_INVENTORY: "manage_inventory",

  // --- 4. Orders & Fulfillment ---
  VIEW_ORDERS: "view_orders",
  UPDATE_ORDER_STATUS: "update_order_status",
  CANCEL_ORDER: "cancel_order",
  PROCESS_REFUND: "process_refund",

  // --- 5. Marketing, Coupons & Discounts ---
  CREATE_FLASH_SALE: "create_flash_sale",
  UPDATE_FLASH_SALE: "update_flash_sale",
  DELETE_FLASH_SALE: "delete_flash_sale",
  CREATE_COUPON: "create_coupon",
  UPDATE_COUPON: "update_coupon",
  DELETE_COUPON: "delete_coupon",

  // --- 6. Reviews & Customer Feedback ---
  CREATE_REVIEW: "create_review",
  UPDATE_REVIEW: "update_review",
  DELETE_REVIEW: "delete_review",
  MODERATE_REVIEWS: "moderate_reviews",

  // --- 7. Moderation & User Reports ---
  CREATE_REPORT: "create_report",
  MANAGE_REPORTS: "manage_reports",
  DELETE_REPORT: "delete_report",

  // --- 8. Shipping & Delivery Methods ---
  MANAGE_SHIPPING_ZONES: "manage_shipping_zones",
  MANAGE_SHIPPING_RATES: "manage_shipping_rates",

  // --- 9. Payments, Wallet & Transactions ---
  VIEW_TRANSACTIONS: "view_transactions",
  MANAGE_WALLET: "manage_wallet",
  MANAGE_PAYMENT_GATEWAYS: "manage_payment_gateways",

  // --- 10. Analytics & Reporting ---
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_REPORTS: "export_reports",

  // --- 11. Store & Platform Settings ---
  MANAGE_STORE_SETTINGS: "manage_store_settings",
  MANAGE_BANNERS: "manage_banners",
  MANAGE_NOTIFICATIONS: "manage_notifications",

  // --- 12. Roles & Access Control ---
  CREATE_ROLE: "create_role",
  UPDATE_ROLE: "update_role",
  ASSIGN_ROLE: "assign_role",
  REMOVE_ROLE: "remove_role",
} as const

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const roleSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
})

export type UserRolePermissions = z.infer<typeof roleSchema>
