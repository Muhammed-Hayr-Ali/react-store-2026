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
  VIEW_BRANDS_MANAGEMENT: "view_brands_management",
  MANAGE_BRANDS: "manage_brands",
  CREATE_BRAND: "create_brand",
  UPDATE_BRAND: "update_brand",
  DELETE_BRAND: "delete_brand",

  // --- 2. Categories Management ---
  VIEW_CATEGORIES_MANAGEMENT: "view_categories_management",
  MANAGE_CATEGORIES: "manage_categories",
  CREATE_CATEGORY: "create_category",
  UPDATE_CATEGORY: "update_category",
  DELETE_CATEGORY: "delete_category",

  // --- 3. Products Management ---
  VIEW_PRODUCTS_MANAGEMENT: "view_products_management",
  MANAGE_PRODUCTS: "manage_products",
  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",
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
