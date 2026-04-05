// =====================================================
// 🗺️ App Router — خريطة المسارات المركزية
// =====================================================
// ⚠️ جميع الروابط في التطبيق يجب أن تأتي من هنا
//    لمنع الروابط المكسورة وتسهيل التعديل مستقبلاً
// =====================================================

export const appRouter = {
  // ─── الرئيسية ─────────────────────────────
  home: "/",

  // ─── القانونية ─────────────────────────────
  terms: "/terms",
  privacy: "/privacy",

  // ─── المصادقة (Auth) ─────────────────────
  callback: "/callback",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  signIn: "/sign-in",
  signUp: "/sign-up",

  // ─── التحقق الثنائي (MFA) ─────────────────
  verifyOtp: "/verify",
  twoFactorSetup: "/two-factor/setup",

  // ─── لوحة التحكم (Dashboard) ──────────────
  dashboard: "/dashboard",

  // ─── الترقية (Upgrade) ───────────────────
  upgrade: "/dashboard/upgrade",
  upgradeDeliveryForm: "/dashboard/upgrade/delivery-form",
  upgradeDeliveryPlans: "/dashboard/upgrade/delivery-plans",
  upgradeSellerForm: "/dashboard/upgrade/seller-form",
  upgradeSellerPlans: "/dashboard/upgrade/seller-plans",
  upgradeSuccess: "/dashboard/upgrade/success",
  upgradeStatus: "/dashboard/upgrade/status",

  // ─── الإدارة (Admin) ─────────────────────
  adminDashboard: "/admin",
  adminUpgradeRequests: "/admin/upgrade-requests",

  // ─── المتجر (Store) ──────────────────────
  products: "/dashboard/products",
  orders: "/dashboard/orders",

  // ─── الملف الشخصي (Profile) ──────────────
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
} as const

// =====================================================
// 🔧 نوع أسماء المسارات (للتحقق من النوع)
// =====================================================

export type RouteName = keyof typeof appRouter

// =====================================================
// 🛠️ دوال مساعدة
// =====================================================

/**
 * جلب مسار بالاسم
 */
export function getRoute(name: RouteName): string {
  return appRouter[name]
}

/**
 * بناء مسار مع locale
 * مثال: buildLocalRoute("ar", "signIn") → "/ar/sign-in"
 */
export function buildLocalRoute(locale: string, name: RouteName): string {
  return `/${locale}${appRouter[name]}`
}

/**
 * بناء مسار كامل مع معلمات الاستعلام
 * مثال: buildUrl("/ar/sign-in", { next: "/dashboard" })
 *      → "/ar/sign-in?next=%2Fdashboard"
 */
export function buildUrl(
  path: string,
  params?: Record<string, string>,
): string {
  if (!params || Object.keys(params).length === 0) return path

  const query = new URLSearchParams(params).toString()
  return `${path}?${query}`
}

/**
 * إنشاء رابط تسجيل الدخول مع redirect
 */
export function loginWithRedirect(redirectUrl: string): string {
  return buildUrl(appRouter.signIn, { next: redirectUrl })
}

/**
 * إنشاء رابط callback مع next
 */
export function callbackWithNext(nextUrl: string): string {
  return buildUrl(appRouter.callback, { next: nextUrl })
}
