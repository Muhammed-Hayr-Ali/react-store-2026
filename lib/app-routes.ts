// مسارات التطبيق مع دعم التوطين
export const appRouter = {
  home: "/",

  terms: "/terms",
  privacy: "/privacy",
  // المصادقة
  callback: "/auth/callback",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",

  // mfa
  verifyOtp: "/verify",
  twoFactorSetup: "/two-factor/setup",

  // لوحة التحكم
  dashboard: "/dashboard",

  // الترقية
  upgrade: "/dashboard/upgrade",
  upgradeDeliveryForm: "/dashboard/upgrade/delivery-form",
  upgradeDeliveryPlans: "/dashboard/upgrade/delivery-plans",
  upgradeSellerForm: "/dashboard/upgrade/seller-form",
  upgradeSellerPlans: "/dashboard/upgrade/seller-plans",
  upgradeSuccess: "/dashboard/upgrade/success",
  upgradeStatus: "/dashboard/upgrade/status",

  // الإدارة
  adminDashboard: "/admin",
  adminUpgradeRequests: "/admin/upgrade-requests",

  // المتجر
  products: "/dashboard/products",
  orders: "/dashboard/orders",

  // الملف الشخصي
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
} as const
