/**
 * @file lib/config/routes.ts
 * @description Application routes configuration.
 */

export const appRoutes = {
  home: "/",
  wishlist: "/wishlist",
  terms: "/terms",
  privacy: "/privacy",
  newsletterUnsubscribe: "/unsubscribe",
  auth: {
    getStarted: "/auth/signup",
    signin: "/auth/sign_in",
    signup: "/auth/sign_up",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    callback: "/auth/callback",
    verifyOtp: "/auth/verify-otp",
  },
  dashboard: {
    overview: "/dashboard",
    categories: "/dashboard/categories",
    brands: "/dashboard/brands",
    products: "/dashboard/products",
    reviews: "/dashboard/reviews",
    users: "/dashboard/users",
    newsletterSubscribers: "/dashboard/newsletter-subscribers",
    team: {
      roles: "/dashboard/team/roles",
      create_roles: "/dashboard/team/roles/create",
      staffAccess: "/dashboard/team/staff-access",
    },
  },
} as const
