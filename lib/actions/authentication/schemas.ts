/**
 * @file lib/actions/authentication/schemas.ts
 * @description Runtime Zod validation schemas for authentication forms and server-side guards.
 */

import { z } from "zod"

export const signInWithPasswordSchema = z.object({
  email: z
    .string({ required_error: "EMAIL_REQUIRED" })
    .trim()
    .min(1, "EMAIL_REQUIRED")
    .email("INVALID_EMAIL"),
  password: z
    .string({ required_error: "PASSWORD_REQUIRED" })
    .min(6, "PASSWORD_TOO_SHORT"),
})

export const signUpWithPasswordSchema = z.object({
  name: z
    .string({ required_error: "NAME_REQUIRED" })
    .trim()
    .min(2, "NAME_TOO_SHORT")
    .max(100, "NAME_TOO_LONG"),
  email: z
    .string({ required_error: "EMAIL_REQUIRED" })
    .trim()
    .min(1, "EMAIL_REQUIRED")
    .email("INVALID_EMAIL"),
  password: z
    .string({ required_error: "PASSWORD_REQUIRED" })
    .min(6, "PASSWORD_TOO_SHORT"),
})

export const requestPasswordResetSchema = z.object({
  email: z
    .string({ required_error: "EMAIL_REQUIRED" })
    .trim()
    .min(1, "EMAIL_REQUIRED")
    .email("INVALID_EMAIL"),
})

export const confirmPasswordResetSchema = z
  .object({
    token: z
      .string({ required_error: "TOKEN_REQUIRED" })
      .trim()
      .min(1, "TOKEN_REQUIRED"),
    password: z
      .string({ required_error: "PASSWORD_REQUIRED" })
      .min(8, "PASSWORD_TOO_SHORT"),
    confirmPassword: z.string({
      required_error: "CONFIRM_PASSWORD_REQUIRED",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PASSWORDS_DO_NOT_MATCH",
    path: ["confirmPassword"],
  })

export const oauthCallbackSchema = z.object({
  code: z
    .string({ required_error: "CODE_REQUIRED" })
    .trim()
    .min(1, "CODE_REQUIRED"),
})