export const appRoutes = {
  home: "/",
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  dashboard: {
    home: "/dashboard",
    account: "/dashboard/account",
    products: {
      allProducts: "/dashboard/products",
      create: "/dashboard/products/create",
    },
  },
}
