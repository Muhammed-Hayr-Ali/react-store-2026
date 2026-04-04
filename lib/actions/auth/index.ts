// =====================================================
// 🔐 Auth Actions — إعادة تصدير مركزي
// =====================================================

export { login, logout, updatePassword } from "./login"
export type { LoginInput, UpdatePasswordInput } from "./login"

export { signup, resendVerificationEmail } from "./signup"
export type { SignupInput, ResendVerificationInput } from "./signup"

export {
  signInWithGoogle,
  handleGoogleCallback,
  linkGoogleAccount,
  unlinkGoogleAccount,
} from "./google"

export { requestPasswordReset, resetPassword, verifyResetToken } from "./reset"
export type {
  ResetRequestInput,
  ResetPasswordInput as ResetFormInput,
} from "./reset"

// =====================================================
// ⚠️ دوال متوافقة مع المكونات القديمة (aliases)
// =====================================================

export { login as signInWithPassword } from "./login"
export { signup as signUpWithPassword } from "./signup"
