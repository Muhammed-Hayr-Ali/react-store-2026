// مسارات التطبيق مع دعم التوطين
export const appRouter = {
  home: "/",

  terms: "/terms",
  privacy: "/privacy",
  // المصادقة
  callback: "/callback",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  signIn: "/sign-in",
  signUp: "/sign-up",

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
