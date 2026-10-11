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
  oauthCallbackSchema,
} from "./schemas"
import { Json } from "../types/database" // تأكد من صحة مسار الاستيراد لملف database.ts

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> }

export type SignInWithPasswordInput = z.infer<typeof signInWithPasswordSchema>
export type SignUpWithPasswordInput = z.infer<typeof signUpWithPasswordSchema>
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>
export type ConfirmPasswordResetInput = z.infer<
  typeof confirmPasswordResetSchema
>
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>

export interface OAuthSignInResult {
  url: string
}

export interface AuthenticatedUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  profile_image: string | null
  // الحقول التالية تأتي من الـ raw_app_meta_data بفضل الـ Trigger الذي أنشأناه
  role?: string
  permissions?: Json
}
