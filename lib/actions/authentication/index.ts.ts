/**
 * @file lib/actions/authentication/index.ts
 * @description Central export boundary for the authentication module.
 */

// Schemas
export * from "./schemas"

// Types
export * from "./types"

// Queries
export { getCurrentUser } from "./queries/get-current-user"

// Mutations
export { signInWithPassword } from "./mutations/sign-in-with-password"
export { signInWithGoogle } from "./mutations/sign-in-with-google"
export { signUpWithPassword } from "./mutations/sign-up-with-password"
export { signOut } from "./mutations/sign-out"
export { requestPasswordReset } from "./mutations/request-password-reset"
export { confirmPasswordReset } from "./mutations/confirm-password-reset"
export { handleCallback } from "./mutations/handle-callback"