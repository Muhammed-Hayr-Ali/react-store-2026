// lib/actions/authentication/schemas.ts

import { z } from "zod"

export const signInWithPasswordSchema = z.object({
  email: z.string().trim().min(1, "EMAIL_REQUIRED").email("INVALID_EMAIL"),
  password: z.string().min(1, "PASSWORD_REQUIRED"),
})

export const signUpWithPasswordSchema = z.object({
  name: z.string().trim().min(1, "NAME_REQUIRED").min(2, "NAME_TOO_SHORT"),
  email: z.string().trim().min(1, "EMAIL_REQUIRED").email("INVALID_EMAIL"),
  password: z.string().min(6, "PASSWORD_TOO_SHORT"),
})

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().min(1, "EMAIL_REQUIRED").email("INVALID_EMAIL"),
})

export const confirmPasswordResetSchema = z
  .object({
    token: z.string().min(1, "TOKEN_REQUIRED"),
    password: z.string().min(6, "PASSWORD_TOO_SHORT"),
    confirmPassword: z.string().min(1, "CONFIRM_PASSWORD_REQUIRED"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PASSWORDS_DO_NOT_MATCH",
    path: ["confirmPassword"],
  })

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, "CODE_REQUIRED"),
})
