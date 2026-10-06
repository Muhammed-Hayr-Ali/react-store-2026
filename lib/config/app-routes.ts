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
    banned: "/banned",

    // مسارات الإدارة المحمية والمموهة (Admin Panel)
    admin: {
      home: "/dashboard/x9k2-panel",
      products: "/dashboard/x9k2-panel/products",
      flashSales: "/dashboard/x9k2-panel/flash-sales",
      notifications: "/dashboard/x9k2-panel/notifications",
      reports: "/dashboard/x9k2-panel/reports",
      roles: "/dashboard/x9k2-panel/roles",
      staffAccess: "/dashboard/x9k2-panel/staff-access",
      users: "/dashboard/x9k2-panel/users",
    },
  },
} as const
