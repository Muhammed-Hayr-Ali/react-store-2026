export const appRoutes = {
  home: "/",
  terms: "/terms",
  privacy: "/privacy",
  newsletterUnsubscribe: "/unsubscribe",
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    callback: "/auth/callback",
  },
  dashboard: {
    overview: "/dashboard",
    team: {
      roles: "/dashboard/team/roles",
      create_roles: "/dashboard/team/roles/create",
      staffAccess: "/dashboard/team/staff-access",
    },
    categories: "/dashboard/categories",
    brands: "/dashboard/brands",
    users: "/dashboard/users",
    newsletterSubscribers: "/dashboard/newsletter-subscribers",
  },
} as const
