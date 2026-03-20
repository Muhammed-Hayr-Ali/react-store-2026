// مسارات التطبيق مع دعم التوطين
export const appRouter = {
  home: "/",

  terms: "/terms",
  privacy: "/privacy",
  // المصادقة
  signIn: "/auth/signin",
  signUp: "/auth/signup",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyOtp: "/auth/verify-otp",
  twoFactorSetup: "/auth/two-factor-setup",

  // لوحة التحكم
  dashboard: "/dashboard",

  // الترقية
  upgrade: "/dashboard/upgrade",
  upgradeSellerForm: "/dashboard/upgrade/seller-form",
  upgradeSellerPlans: "/dashboard/upgrade/seller-plans",
  upgradeDeliveryForm: "/dashboard/upgrade/delivery-form",
  upgradeDeliveryPlans: "/dashboard/upgrade/delivery-plans",
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
