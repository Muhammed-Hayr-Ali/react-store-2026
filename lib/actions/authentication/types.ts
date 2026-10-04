/**
 * @file lib/actions/authentication/types.ts
 * @description Type definitions for authentication requests and user credentials.
 */

import { z } from "zod"
import {
  signInWithPasswordSchema,
  signUpWithPasswordSchema,
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
  oauthCallbackSchema,
} from "./schemas"

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
