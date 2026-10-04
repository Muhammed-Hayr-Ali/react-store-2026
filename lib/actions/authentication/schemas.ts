/**
 * @file lib/actions/authentication/schemas.ts
 * @description Zod validation schemas for authentication forms and server-side guards.
 */

import { z } from "zod"

export const signInWithPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
})

export const signUpWithPasswordSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
})

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
})

export const confirmPasswordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required."),
})
