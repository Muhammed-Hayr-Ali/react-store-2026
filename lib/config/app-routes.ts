export const appRoutes = {
  home: "/",
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    callback: "/auth/callback",
  },
  dashboard: {
    home: "/dashboard",
    account: "/dashboard/account",
    products: {
      allProducts: "/dashboard/products",
      create: "/dashboard/products/create",
    },
    flashSales: "/dashboard/flash-sales",
    reports: "/dashboard/reports",
    roles: "/dashboard/roles",
    staffAccess: "/dashboard/staff-access",
    banned: "/banned",
  },
} as const
