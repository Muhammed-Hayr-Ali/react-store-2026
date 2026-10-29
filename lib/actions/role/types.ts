/**
 * @file lib/actions/role/types.ts
 * @description أنواع الأدوار والصلاحيات المستخدمة في النظام.
 */

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
  VIEW_BRANDS_DASHBOARD: "view_brands_dashboard",
  READ_BRANDS: "read_brands",
  CREATE_BRAND: "create_brand",
  UPDATE_BRAND: "update_brand",
  DELETE_BRAND: "delete_brand",
  MANAGE_BRANDS: "manage_brands",

  // --- 2. Categories Management ---
  VIEW_CATEGORIES_DASHBOARD: "view_categories_dashboard",
  READ_CATEGORIES: "read_categories",
  CREATE_CATEGORY: "create_category",
  UPDATE_CATEGORY: "update_category",
  DELETE_CATEGORY: "delete_category",
  MANAGE_CATEGORIES: "manage_categories",

  // --- 3. Products Management ---
  VIEW_PRODUCTS_DASHBOARD: "view_products_dashboard",
  READ_PRODUCTS: "read_products",
  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",
  MANAGE_PRODUCTS: "manage_products",

  // --- 4. Wishlists Management ---
  VIEW_WISHLISTS_DASHBOARD: "view_wishlists_dashboard",
  READ_WISHLISTS: "read_wishlists",
  CREATE_WISHLIST: "create_wishlist",
  UPDATE_WISHLIST: "update_wishlist",
  DELETE_WISHLIST: "delete_wishlist",
  MANAGE_WISHLISTS: "manage_wishlists",

  // --- 5. Carts Management ---
  VIEW_CARTS_DASHBOARD: "view_carts_dashboard",
  READ_CARTS: "read_carts",
  CREATE_CART: "create_cart",
  UPDATE_CART: "update_cart",
  DELETE_CART: "delete_cart",
  MANAGE_CARTS: "manage_carts",

  // --- 6. Newsletter Management ---
  VIEW_NEWSLETTER_DASHBOARD: "view_newsletter_dashboard",
  READ_NEWSLETTER: "read_newsletter",
  CREATE_NEWSLETTER: "create_newsletter",
  UPDATE_NEWSLETTER: "update_newsletter",
  DELETE_NEWSLETTER: "delete_newsletter",
  MANAGE_NEWSLETTER: "manage_newsletter",

  // --- 7. Reviews Management ---
  VIEW_REVIEWS_DASHBOARD: "view_reviews_dashboard",
  READ_REVIEWS: "read_reviews",
  CREATE_REVIEW: "create_review",
  UPDATE_REVIEW: "update_review",
  DELETE_REVIEW: "delete_review",
  MANAGE_REVIEWS: "manage_reviews",

  // --- 8. Users Management ---
  VIEW_USERS_DASHBOARD: "view_users_dashboard",
  READ_USERS: "read_users",
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",
  MANAGE_USERS: "manage_users",

  // --- 9. Roles & Permissions Management ---
  VIEW_ROLES_DASHBOARD: "view_roles_dashboard",
  READ_ROLES: "read_roles",
  CREATE_ROLE: "create_role",
  UPDATE_ROLE: "update_role",
  DELETE_ROLE: "delete_role",
  MANAGE_ROLES: "manage_roles",
} as const

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export interface RoleRecord {
  id: string
  name: string
  description: string | null
  permissions: AppPermission[]
  created_at: string
}

export interface RolesSummary {
  total: number
  active: number
  empty: number
}

export const roleSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
})

export type UserRolePermissions = z.infer<typeof roleSchema>