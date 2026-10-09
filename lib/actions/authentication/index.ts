// lib/actions/authentication/index.ts

// 1. Mutations
export { signInWithPassword } from "./mutations/sign-in-with-password"
export { signInWithGoogle } from "./mutations/sign-in-with-google"
export { signUpWithPassword } from "./mutations/sign-up-with-password"
export { signOut } from "./mutations/sign-out"
export { requestPasswordReset } from "./mutations/request-password-reset"
export { confirmPasswordReset } from "./mutations/confirm-password-reset"
export { handleCallback } from "./mutations/handle-callback"

// 2. Queries
export { getCurrentUser } from "./queries/get-current-user"

// 3. Schemas & Types
export {
  signInWithPasswordSchema,
  signUpWithPasswordSchema,
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
  oauthCallbackSchema,
} from "./schemas"

export type {
  SignInWithPasswordInput,
  SignUpWithPasswordInput,
  RequestPasswordResetInput,
  ConfirmPasswordResetInput,
  OAuthCallbackInput,
  AuthenticatedUser,
} from "./types"
