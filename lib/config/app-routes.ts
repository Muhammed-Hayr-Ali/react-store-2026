export const appRoutes = {
  home: "/",
  terms: "/terms",
  privacy: "/privacy",
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    callback: "/auth/callback",
  },
  dashboard: {
    root: "/dashboard",
    overview: "/dashboard/overview",
    team: {
      roles: "/dashboard/team/roles",
      create_roles: "/dashboard/team/roles/create",
      staffAccess: "/dashboard/team/staff-access",
    },
    users: "/dashboard/users",
  },
} as const
