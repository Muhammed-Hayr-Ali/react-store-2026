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
    root: "/dashboard",
    user: {
      overview: "/dashboard/overview",
      account: "/dashboard/account",
      notifications: "/dashboard/notifications",
    },
    // مسارات الإدارة المحمية والمموهة (Admin Panel)
    admin: {
      overview: "/dashboard/x9k2-panel/overview",
      products: "/dashboard/x9k2-panel/products",
      create_products: "/dashboard/x9k2-panel/products/create",
      flashSales: "/dashboard/x9k2-panel/flash-sales",
      create_flashSales: "/dashboard/x9k2-panel/flash-sales/create",
      notifications: "/dashboard/x9k2-panel/notifications",
      reports: "/dashboard/x9k2-panel/reports",
      roles: "/dashboard/x9k2-panel/roles",
      create_roles: "/dashboard/x9k2-panel/roles/create",
      staffAccess: "/dashboard/x9k2-panel/staff-access",
      users: "/dashboard/x9k2-panel/users",
    },
  },
} as const
