/** @file lib/actions/authentication/index.ts واجهة التصدير العامة لأكشنات المصادقة. */

// Mutations
export { signInWithPassword } from "./mutations/sign-in-with-password"
export { signInWithGoogle } from "./mutations/sign-in-with-google"
export { signUpWithPassword } from "./mutations/sign-up-with-password"
export { signOut } from "./mutations/sign-out"
export { requestPasswordReset } from "./mutations/request-password-reset"
export { confirmPasswordReset } from "./mutations/confirm-password-reset"
export { handleAuthCallback } from "./mutations/handle-auth-callback"

// Schemas and types
export {
  signInWithPasswordSchema,
  signUpWithPasswordSchema,
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
  authCallbackSchema,
} from "./schemas"

export type {
  SignInWithPasswordInput,
  SignUpWithPasswordInput,
  RequestPasswordResetInput,
  ConfirmPasswordResetInput,
  AuthCallbackInput,
  AuthenticatedUser,
} from "./types"
