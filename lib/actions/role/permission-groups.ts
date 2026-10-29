/**
 * @file lib/actions/role/permission-groups.ts
 * @description تنظيم وتصنيف الصلاحيات حسب النوع لجميع أقسام النظام.
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
    label: "brands_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_BRANDS_DASHBOARD,
        label: "view_brands_dashboard",
        description: "view_brands_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_BRANDS,
        label: "read_brands",
        description: "read_brands_desc",
      },
      {
        key: PERMISSIONS.CREATE_BRAND,
        label: "create_brand",
        description: "create_brand_desc",
      },
      {
        key: PERMISSIONS.UPDATE_BRAND,
        label: "update_brand",
        description: "update_brand_desc",
      },
      {
        key: PERMISSIONS.DELETE_BRAND,
        label: "delete_brand",
        description: "delete_brand_desc",
      },
      {
        key: PERMISSIONS.MANAGE_BRANDS,
        label: "manage_brands",
        description: "manage_brands_desc",
      },
    ],
  },

  // ==========================================
  // 2. Categories Management
  // ==========================================
  {
    id: "categories_group",
    label: "categories_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_CATEGORIES_DASHBOARD,
        label: "view_categories_dashboard",
        description: "view_categories_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_CATEGORIES,
        label: "read_categories",
        description: "read_categories_desc",
      },
      {
        key: PERMISSIONS.CREATE_CATEGORY,
        label: "create_category",
        description: "create_category_desc",
      },
      {
        key: PERMISSIONS.UPDATE_CATEGORY,
        label: "update_category",
        description: "update_category_desc",
      },
      {
        key: PERMISSIONS.DELETE_CATEGORY,
        label: "delete_category",
        description: "delete_category_desc",
      },
      {
        key: PERMISSIONS.MANAGE_CATEGORIES,
        label: "manage_categories",
        description: "manage_categories_desc",
      },
    ],
  },

  // ==========================================
  // 3. Products Management
  // ==========================================
  {
    id: "products_group",
    label: "products_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_PRODUCTS_DASHBOARD,
        label: "view_products_dashboard",
        description: "view_products_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_PRODUCTS,
        label: "read_products",
        description: "read_products_desc",
      },
      {
        key: PERMISSIONS.CREATE_PRODUCT,
        label: "create_product",
        description: "create_product_desc",
      },
      {
        key: PERMISSIONS.UPDATE_PRODUCT,
        label: "update_product",
        description: "update_product_desc",
      },
      {
        key: PERMISSIONS.DELETE_PRODUCT,
        label: "delete_product",
        description: "delete_product_desc",
      },
      {
        key: PERMISSIONS.MANAGE_PRODUCTS,
        label: "manage_products",
        description: "manage_products_desc",
      },
    ],
  },

  // ==========================================
  // 4. Wishlists Management
  // ==========================================
  {
    id: "wishlists_group",
    label: "wishlists_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_WISHLISTS_DASHBOARD,
        label: "view_wishlists_dashboard",
        description: "view_wishlists_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_WISHLISTS,
        label: "read_wishlists",
        description: "read_wishlists_desc",
      },
      {
        key: PERMISSIONS.CREATE_WISHLIST,
        label: "create_wishlist",
        description: "create_wishlist_desc",
      },
      {
        key: PERMISSIONS.UPDATE_WISHLIST,
        label: "update_wishlist",
        description: "update_wishlist_desc",
      },
      {
        key: PERMISSIONS.DELETE_WISHLIST,
        label: "delete_wishlist",
        description: "delete_wishlist_desc",
      },
      {
        key: PERMISSIONS.MANAGE_WISHLISTS,
        label: "manage_wishlists",
        description: "manage_wishlists_desc",
      },
    ],
  },

  // ==========================================
  // 5. Carts Management
  // ==========================================
  {
    id: "carts_group",
    label: "carts_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_CARTS_DASHBOARD,
        label: "view_carts_dashboard",
        description: "view_carts_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_CARTS,
        label: "read_carts",
        description: "read_carts_desc",
      },
      {
        key: PERMISSIONS.CREATE_CART,
        label: "create_cart",
        description: "create_cart_desc",
      },
      {
        key: PERMISSIONS.UPDATE_CART,
        label: "update_cart",
        description: "update_cart_desc",
      },
      {
        key: PERMISSIONS.DELETE_CART,
        label: "delete_cart",
        description: "delete_cart_desc",
      },
      {
        key: PERMISSIONS.MANAGE_CARTS,
        label: "manage_carts",
        description: "manage_carts_desc",
      },
    ],
  },

  // ==========================================
  // 6. Newsletter Management
  // ==========================================
  {
    id: "newsletter_group",
    label: "newsletter_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_NEWSLETTER_DASHBOARD,
        label: "view_newsletter_dashboard",
        description: "view_newsletter_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_NEWSLETTER,
        label: "read_newsletter",
        description: "read_newsletter_desc",
      },
      {
        key: PERMISSIONS.CREATE_NEWSLETTER,
        label: "create_newsletter",
        description: "create_newsletter_desc",
      },
      {
        key: PERMISSIONS.UPDATE_NEWSLETTER,
        label: "update_newsletter",
        description: "update_newsletter_desc",
      },
      {
        key: PERMISSIONS.DELETE_NEWSLETTER,
        label: "delete_newsletter",
        description: "delete_newsletter_desc",
      },
      {
        key: PERMISSIONS.MANAGE_NEWSLETTER,
        label: "manage_newsletter",
        description: "manage_newsletter_desc",
      },
    ],
  },

  // ==========================================
  // 7. Reviews Management
  // ==========================================
  {
    id: "reviews_group",
    label: "reviews_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_REVIEWS_DASHBOARD,
        label: "view_reviews_dashboard",
        description: "view_reviews_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_REVIEWS,
        label: "read_reviews",
        description: "read_reviews_desc",
      },
      {
        key: PERMISSIONS.CREATE_REVIEW,
        label: "create_review",
        description: "create_review_desc",
      },
      {
        key: PERMISSIONS.UPDATE_REVIEW,
        label: "update_review",
        description: "update_review_desc",
      },
      {
        key: PERMISSIONS.DELETE_REVIEW,
        label: "delete_review",
        description: "delete_review_desc",
      },
      {
        key: PERMISSIONS.MANAGE_REVIEWS,
        label: "manage_reviews",
        description: "manage_reviews_desc",
      },
    ],
  },

  // ==========================================
  // 8. Users Management
  // ==========================================
  {
    id: "users_group",
    label: "users_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_USERS_DASHBOARD,
        label: "view_users_dashboard",
        description: "view_users_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_USERS,
        label: "read_users",
        description: "read_users_desc",
      },
      {
        key: PERMISSIONS.CREATE_USER,
        label: "create_user",
        description: "create_user_desc",
      },
      {
        key: PERMISSIONS.UPDATE_USER,
        label: "update_user",
        description: "update_user_desc",
      },
      {
        key: PERMISSIONS.DELETE_USER,
        label: "delete_user",
        description: "delete_user_desc",
      },
      {
        key: PERMISSIONS.MANAGE_USERS,
        label: "manage_users",
        description: "manage_users_desc",
      },
    ],
  },

  // ==========================================
  // 9. Roles & Permissions Management
  // ==========================================
  {
    id: "roles_group",
    label: "roles_group",
    permissions: [
      {
        key: PERMISSIONS.VIEW_ROLES_DASHBOARD,
        label: "view_roles_dashboard",
        description: "view_roles_dashboard_desc",
      },
      {
        key: PERMISSIONS.READ_ROLES,
        label: "read_roles",
        description: "read_roles_desc",
      },
      {
        key: PERMISSIONS.CREATE_ROLE,
        label: "create_role",
        description: "create_role_desc",
      },
      {
        key: PERMISSIONS.UPDATE_ROLE,
        label: "update_role",
        description: "update_role_desc",
      },
      {
        key: PERMISSIONS.DELETE_ROLE,
        label: "delete_role",
        description: "delete_role_desc",
      },
      {
        key: PERMISSIONS.MANAGE_ROLES,
        label: "manage_roles",
        description: "manage_roles_desc",
      },
    ],
  },
] as const satisfies PermissionGroup[]