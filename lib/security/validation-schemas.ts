// =====================================================
// 🛡️ Zod Validation Schemas - Input Sanitization
// =====================================================
// ✅ يحمي من SQL Injection و XSS
// ✅ يتحقق من صحة كل المدخلات
// ✅ يمنع البيانات الضارة قبل المعالجة
// =====================================================

import { z } from "zod";

// ── Regex Patterns ──
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;
const NAME_REGEX = /^[\u0600-\u06FFa-zA-Z\s'-]{1,50}$/;
const TOKEN_HEX_REGEX = /^[a-f0-9]+$/;

// ── Common Schemas ──
export const emailSchema = z
  .string()
  .min(1, "البريد الإلكتروني مطلوب")
  .max(255, "البريد الإلكتروني طويل جداً")
  .email("بريد إلكتروني غير صالح")
  .transform((val) => val.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(128, "كلمة المرور طويلة جداً")
  .refine(
    (val) => /[A-Za-z]/.test(val),
    "كلمة المرور يجب أن تحتوي على حرف واحد على الأقل",
  )
  .refine(
    (val) => /\d/.test(val),
    "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل",
  );

export const firstNameSchema = z
  .string()
  .min(1, "الاسم الأول مطلوب")
  .max(50, "الاسم الأول طويل جداً")
  .regex(NAME_REGEX, "الاسم الأول يحتوي على أحرف غير صالحة")
  .trim();

export const lastNameSchema = z
  .string()
  .min(1, "اسم العائلة مطلوب")
  .max(50, "اسم العائلة طويل جداً")
  .regex(NAME_REGEX, "اسم العائلة يحتوي على أحرف غير صالحة")
  .trim();

export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || PHONE_REGEX.test(val),
    "رقم هاتف غير صالح",
  );

export const tokenSchema = z
  .string()
  .min(32, "رمز غير صالح")
  .max(256, "رمز غير صالح")
  .regex(TOKEN_HEX_REGEX, "رمز غير صالح")
  .trim();

// ── Auth Schemas ──
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  first_name: firstNameSchema,
  last_name: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  password: passwordSchema,
});

// ── MFA Schemas ──
export const verifyMfaSchema = z.object({
  code: z
    .string()
    .length(6, "رمز التحقق يجب أن يكون 6 أرقام")
    .regex(/^\d{6}$/, "رمز التحقق يجب أن يكون أرقام فقط"),
  token: tokenSchema.optional(),
});

// ── General Purpose Schemas ──
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z
  .string()
  .uuid("معرف غير صالح")
  .or(z.coerce.number().int().positive());

// ── Validation Helpers ──
export function validateInput<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map((e) => e.message),
    };
  }

  return { success: true, data: result.data };
}

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyMfaInput = z.infer<typeof verifyMfaSchema>;
