/**
 * @file lib/actions/authentication/types.ts
 * @description Pure TypeScript types inferred from Zod schemas & presentation models.
 */

import { z } from "zod"
import {
  signInWithPasswordSchema,
  signUpWithPasswordSchema,
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
  authCallbackSchema,
} from "./schemas"
import type { Json } from "../types/database"

export type { ApiResult } from "../types/utils"

export type SignInWithPasswordInput = z.infer<typeof signInWithPasswordSchema>
export type SignUpWithPasswordInput = z.infer<typeof signUpWithPasswordSchema>
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>
export type ConfirmPasswordResetInput = z.infer<
  typeof confirmPasswordResetSchema
>
export type AuthCallbackInput = z.infer<typeof authCallbackSchema>

export interface AuthSignInResult {
  url: string
}

export interface AuthenticatedUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar: string | null
  // These fields are populated from raw_app_meta_data by the database trigger.
  role?: string
  permissions?: Json
}
