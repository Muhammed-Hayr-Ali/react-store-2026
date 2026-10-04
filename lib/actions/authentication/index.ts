/**
 * @file lib/actions/authentication/index.ts
 * @description Central export hub for all authentication actions, types, and schemas.
 */

// Actions
export { signInWithPassword } from "./signInWithPassword"
export { signInWithGoogle } from "./signIn-with-google"
export { signUpWithPassword } from "./signUpWithPassword"
export { signOut } from "./signOut"
export { requestPasswordReset, confirmPasswordReset } from "./resetPassword"
export { handleCallback } from "./handleCallback"

// Types
export * from "./types"

// Schemas
export * from "./schemas"
