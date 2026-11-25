/**
 * @file lib/config/app-routes.ts
 * @description Centralized application route definitions with uppercase keys.
 */

export const APP_ROUTES = {
  HOME: "/",
  EXPLORE: "/explore",
  SEARCH: "/search",
  WISHLIST: "/wishlist",
  CART: "/shop-cart",
  ACCOUNT: "/account",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  NEWSLETTER_UNSUBSCRIBE: "/unsubscribe",
  CATEGORIES: "/categories",
  COLLECTIONS: {
    NEWEST: "/explore?sort=newest",
    FEATURED: "/explore?featured=true",
    OFFERS: "/explore?offers=true",
  },
  AUTH: {
    GET_STARTED: "/auth/signup",
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CALLBACK: "/auth/callback",
    VERIFY_OTP: "/auth/verify-otp",
  },
  DASHBOARD: {
    OVERVIEW: "/dashboard",
    CATEGORIES: "/dashboard/categories",
    BRANDS: "/dashboard/brands",
    PRODUCTS: "/dashboard/products",
    REVIEWS: "/dashboard/reviews",
    USERS: "/dashboard/users",
    NEWSLETTER_SUBSCRIBERS: "/dashboard/newsletter-subscribers",
    TEAM: {
      ROLES: "/dashboard/team/roles",
      CREATE_ROLES: "/dashboard/team/roles/create",
      STAFF_ACCESS: "/dashboard/team/staff-access",
    },
  },
} as const