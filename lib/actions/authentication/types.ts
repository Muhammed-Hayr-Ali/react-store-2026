// =====================================================
// 🔐 Authentication Input Types
// =====================================================
// ⚠️ أنواع نماذج المصادقة
// =====================================================

/** تسجيل الدخول بالبريد وكلمة المرور */
export interface SignInInput {
  email: string
  password: string
}

/** تسجيل المستخدم بالبريد وكلمة المرور */
export interface SignUpInput {
  first_name: string
  last_name: string
  email: string
  password: string
}

/** طلب إعادة تعيين كلمة المرور */
export interface ForgotPasswordInput {
  email: string
}

/** إعادة تعيين كلمة المرور */
export interface ResetPasswordInput {
  token: string
  password: string
}
